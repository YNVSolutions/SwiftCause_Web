import { describe, expect, it } from 'vitest';

import type { Donation } from './types';
import {
  selectAnonymousDonations,
  selectDonationsByCampaign,
  selectDonationsByDateRange,
  selectRecurringDonations,
  selectTotalDonationAmount,
} from './selectors';

const donations: Donation[] = [
  {
    amount: 1500,
    campaignId: 'campaign-1',
    id: 'donation-1',
    isAnonymous: false,
    isRecurring: false,
    organizationId: 'org-1',
    timestamp: '2026-03-18T10:00:00.000Z',
  },
  {
    amount: 2500,
    campaignId: 'campaign-1',
    id: 'donation-2',
    isAnonymous: true,
    isRecurring: true,
    organizationId: 'org-1',
    timestamp: '2026-03-19T10:00:00.000Z',
  },
  {
    amount: 1000,
    campaignId: 'campaign-2',
    id: 'donation-3',
    isAnonymous: false,
    isRecurring: true,
    organizationId: 'org-2',
    timestamp: '2026-03-20T10:00:00.000Z',
  },
];

describe('donation selectors', () => {
  it('filters donations by campaign', () => {
    expect(selectDonationsByCampaign(donations, 'campaign-1')).toHaveLength(2);
  });

  it('calculates the total donation amount', () => {
    expect(selectTotalDonationAmount(donations)).toBe(5000);
  });

  it('returns only recurring donations', () => {
    expect(selectRecurringDonations(donations)).toHaveLength(2);
  });

  it('returns only anonymous donations', () => {
    expect(selectAnonymousDonations(donations)).toEqual([donations[1]]);
  });

  it('filters donations by timestamp range', () => {
    expect(
      selectDonationsByDateRange(donations, '2026-03-19T00:00:00.000Z', '2026-03-20T00:00:00.000Z'),
    ).toEqual([donations[1]]);
  });
});
