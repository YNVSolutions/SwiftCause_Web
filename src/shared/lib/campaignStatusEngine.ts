import { Campaign } from '@/shared/types';

export type CampaignStatus = NonNullable<Campaign['status']>;

export interface CampaignStatusResolution {
  status: CampaignStatus;
  updates?: Partial<
    Pick<
      Campaign,
      | 'status'
      | 'autoCompletedGoal'
      | 'autoCompletedAt'
      | 'autoPausedEndDate'
      | 'autoPausedEndDateAt'
    >
  >;
}

export type CampaignLifecycleEvent =
  | { type: 'SYSTEM_RECONCILE'; now?: Date }
  | { type: 'MANUAL_STATUS_SET'; status: CampaignStatus; now?: Date }
  | { type: 'GOAL_UPDATED'; goal: number; now?: Date }
  | { type: 'END_DATE_UPDATED'; endDate: Campaign['endDate']; now?: Date };

type FirestoreTimestampLike = {
  seconds: number;
  nanoseconds?: number;
  toDate?: () => Date;
};

function parseCampaignDate(
  value: Campaign['startDate'] | Campaign['endDate'] | undefined
): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const maybeTimestamp = value as FirestoreTimestampLike;
  if (typeof maybeTimestamp?.toDate === 'function') {
    const parsed = maybeTimestamp.toDate();
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof maybeTimestamp?.seconds === 'number') {
    const parsed = new Date(maybeTimestamp.seconds * 1000);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

function startOfDay(date: Date): Date {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

function endOfDay(date: Date): Date {
  const day = new Date(date);
  day.setHours(23, 59, 59, 999);
  return day;
}

function toEndDateKey(endDate: Campaign['endDate']): string | null {
  const parsed = parseCampaignDate(endDate);
  return parsed ? parsed.toISOString() : null;
}

function reconcileCampaignStatus(
  campaign: Pick<
    Campaign,
    | 'status'
    | 'goal'
    | 'raised'
    | 'startDate'
    | 'endDate'
    | 'autoCompletedGoal'
    | 'autoPausedEndDate'
  >,
  now: Date
): CampaignStatusResolution {
  const status = campaign.status;
  const goal = Number(campaign.goal) || 0;
  const raised = Number(campaign.raised) || 0;
  const autoCompletedGoal = Number(campaign.autoCompletedGoal);
  const alreadyAutoCompletedForThisGoal =
    Number.isFinite(autoCompletedGoal) && autoCompletedGoal === goal;

  if (goal > 0 && raised >= goal && !alreadyAutoCompletedForThisGoal) {
    return {
      status: 'completed',
      updates: {
        status: 'completed',
        autoCompletedGoal: goal,
        autoCompletedAt: now.toISOString(),
      },
    };
  }

  if (status === 'completed') {
    return { status: 'completed' };
  }

  const endDate = parseCampaignDate(campaign.endDate);
  if (endDate && endOfDay(endDate) < now) {
    const endDateKey = endDate.toISOString();
    const alreadyAutoPausedForThisEndDate =
      campaign.autoPausedEndDate === endDateKey;

    if (status !== 'paused' && !alreadyAutoPausedForThisEndDate) {
      return {
        status: 'paused',
        updates: {
          status: 'paused',
          autoPausedEndDate: endDateKey,
          autoPausedEndDateAt: now.toISOString(),
        },
      };
    }

    if (status === 'paused') {
      return { status: 'paused' };
    }

    return { status: status === 'active' ? 'active' : 'paused' };
  }

  const startDate = parseCampaignDate(campaign.startDate);
  if (startDate) {
    if (startOfDay(startDate) > now) {
      return { status: 'paused' };
    }
    return { status: status === 'active' ? 'active' : 'paused' };
  }

  if (status === 'paused') {
    return { status: 'paused' };
  }

  return { status: 'active' };
}

/**
 * Explicit transition engine:
 * Given current campaign state + event => next status and metadata updates.
 */
export function applyCampaignStatusEvent(
  campaign: Pick<
    Campaign,
    | 'status'
    | 'goal'
    | 'raised'
    | 'startDate'
    | 'endDate'
    | 'autoCompletedGoal'
    | 'autoPausedEndDate'
  >,
  event: CampaignLifecycleEvent
): CampaignStatusResolution {
  switch (event.type) {
    case 'MANUAL_STATUS_SET': {
      return { status: event.status, updates: { status: event.status } };
    }
    case 'GOAL_UPDATED': {
      const now = event.now || new Date();
      return reconcileCampaignStatus({ ...campaign, goal: event.goal }, now);
    }
    case 'END_DATE_UPDATED': {
      const now = event.now || new Date();
      return reconcileCampaignStatus({ ...campaign, endDate: event.endDate }, now);
    }
    case 'SYSTEM_RECONCILE':
    default: {
      const now = event.now || new Date();
      return reconcileCampaignStatus(campaign, now);
    }
  }
}

export function deriveEndDateKey(endDate: Campaign['endDate']): string | null {
  return toEndDateKey(endDate);
}
