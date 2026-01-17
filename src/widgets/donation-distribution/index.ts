/**
 * Donation Distribution Widget
 * 
 * Displays donation distribution across amount ranges with:
 * - Summary cards showing key metrics
 * - Vertical bar chart with gradient colors
 * - Interactive tooltips with detailed information
 * - Detailed dialog view with expanded analytics
 * 
 * @module widgets/donation-distribution
 */

export { DonationDistributionChart } from './ui/DonationDistributionChart';
export { DonationDistributionDialog } from './ui/DonationDistributionDialog';
export type { DonationRange, DistributionSummary } from './lib/distributionCalculations';
export {
  calculateDistributionSummary,
  parseRangeString,
  estimateRangeTotal,
} from './lib/distributionCalculations';
