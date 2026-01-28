/**
 * Donation Distribution Widget
 * 
 * Displays donation distribution across amount ranges with:
 * - Interactive dialog view with expanded analytics
 * - Detailed distribution calculations and utilities
 * 
 * @module widgets/donation-distribution
 */

export { DonationDistributionDialog } from './ui/DonationDistributionDialog';
export type { DonationRange, DistributionSummary } from './lib/distributionCalculations';
export {
  calculateDistributionSummary,
  parseRangeString,
  estimateRangeTotal,
} from './lib/distributionCalculations';
