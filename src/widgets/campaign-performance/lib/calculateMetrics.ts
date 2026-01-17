import { Campaign } from '../../../shared/types';

export interface PerformanceMetrics {
  aggregateGoal: number;
  aggregateRaised: number;
  wonCampaigns: Campaign[];
  activeCampaigns: Campaign[];
  winRate: number;
  overallFundingPct: number;
  avgCompletionRate: number;
  efficiencyRating: number;
}

/**
 * Calculate performance metrics from campaigns data
 * @param campaigns - Array of campaigns to analyze
 * @returns Calculated performance metrics
 */
export function calculatePerformanceMetrics(campaigns: Campaign[]): PerformanceMetrics {
  // Calculate aggregate values
  const aggregateGoal = campaigns.reduce((sum, c) => sum + (c.goal || 0), 0);
  const aggregateRaised = campaigns.reduce((sum, c) => sum + (c.raised || 0), 0);
  
  // Filter campaigns by status
  const wonCampaigns = campaigns.filter(c => (c.raised || 0) >= (c.goal || 1));
  const activeCampaigns = campaigns.filter(c => (c.raised || 0) < (c.goal || 1));
  
  // Win Rate: percentage of campaigns that reached their goal
  const winRate = campaigns.length > 0 
    ? Math.round((wonCampaigns.length / campaigns.length) * 100) 
    : 0;
  
  // Overall Funding Percentage: total raised / total goals
  const overallFundingPct = aggregateGoal > 0 
    ? Math.round((aggregateRaised / aggregateGoal) * 100) 
    : 0;
  
  // Average Campaign Completion Rate: average of all campaign percentages
  const avgCompletionRate = campaigns.length > 0
    ? Math.round(
        campaigns.reduce((sum, c) => {
          const pct = (c.goal || 0) > 0 ? ((c.raised || 0) / (c.goal || 1)) * 100 : 0;
          return sum + pct;
        }, 0) / campaigns.length
      )
    : 0;

  // Use overall funding percentage as the main efficiency rating
  const efficiencyRating = overallFundingPct;

  return {
    aggregateGoal,
    aggregateRaised,
    wonCampaigns,
    activeCampaigns,
    winRate,
    overallFundingPct,
    avgCompletionRate,
    efficiencyRating,
  };
}

/**
 * Calculate campaign completion percentage
 * @param raised - Amount raised
 * @param goal - Campaign goal
 * @returns Completion percentage (0-100)
 */
export function calculateCampaignCompletion(raised: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.round((raised / goal) * 100);
}

/**
 * Check if campaign has reached its goal
 * @param raised - Amount raised
 * @param goal - Campaign goal
 * @returns True if campaign reached goal
 */
export function isCampaignWon(raised: number, goal: number): boolean {
  return raised >= goal && goal > 0;
}
