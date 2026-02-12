import { Campaign } from '@/shared/types';
import {
  applyCampaignStatusEvent,
  CampaignStatus,
  CampaignStatusResolution,
} from './campaignStatusEngine';

export type { CampaignStatus };
export type { CampaignStatusResolution };

export function resolveCampaignStatusResolution(
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
  now: Date = new Date()
): CampaignStatusResolution {
  return applyCampaignStatusEvent(campaign, { type: 'SYSTEM_RECONCILE', now });
}

export function resolveCampaignStatus(
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
  now: Date = new Date()
): CampaignStatus {
  return resolveCampaignStatusResolution(campaign, now).status;
}

export function isCampaignActiveForKioskDonation(
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
  now: Date = new Date()
): boolean {
  return resolveCampaignStatus(campaign, now) === 'active';
}
