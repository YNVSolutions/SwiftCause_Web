export interface DonationRange {
  range: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DistributionSummary {
  totalDonations: number;
  mostPopularRange: string;
  mostPopularCount: number;
  averageDonation: number;
  ranges: DonationRange[];
}

/**
 * Calculate distribution summary from donation data
 */
export function calculateDistributionSummary(
  data: Array<{ range: string; count: number }>,
  totalRaised: number
): DistributionSummary {
  const totalDonations = data.reduce((sum, item) => sum + item.count, 0);
  
  // Find most popular range
  const mostPopular = data.reduce((max, item) => 
    item.count > max.count ? item : max, 
    { range: 'N/A', count: 0 }
  );

  // Calculate average donation
  const averageDonation = totalDonations > 0 ? totalRaised / totalDonations : 0;

  // Transform data with percentages and colors
  const ranges = data.map((item, index) => ({
    range: item.range,
    count: item.count,
    percentage: totalDonations > 0 ? Math.round((item.count / totalDonations) * 100) : 0,
    color: getGradientColor(index),
  }));

  return {
    totalDonations,
    mostPopularRange: mostPopular.range,
    mostPopularCount: mostPopular.count,
    averageDonation,
    ranges,
  };
}

/**
 * Get gradient color for bar based on index
 * Creates a gradient from light blue to dark blue
 */
function getGradientColor(index: number): string {
  const colors = [
    'bg-blue-200',
    'bg-blue-300',
    'bg-blue-400',
    'bg-blue-500',
    'bg-blue-600',
    'bg-blue-700',
  ];
  
  // Map index to color array
  const colorIndex = Math.min(index, colors.length - 1);
  return colors[colorIndex];
}

/**
 * Get hover color for bar
 */
export function getHoverColor(baseColor: string): string {
  const hoverMap: Record<string, string> = {
    'bg-blue-200': 'hover:bg-blue-300',
    'bg-blue-300': 'hover:bg-blue-400',
    'bg-blue-400': 'hover:bg-blue-500',
    'bg-blue-500': 'hover:bg-blue-600',
    'bg-blue-600': 'hover:bg-blue-700',
    'bg-blue-700': 'hover:bg-blue-800',
  };
  
  return hoverMap[baseColor] || 'hover:bg-blue-600';
}

/**
 * Extract min and max values from range string
 */
export function parseRangeString(range: string): { min: number; max: number | null } {
  // Handle "£500+" format
  if (range.includes('+')) {
    const min = parseInt(range.replace(/[£+,]/g, ''));
    return { min, max: null };
  }
  
  // Handle "£0-£100" format
  const parts = range.split('-');
  if (parts.length === 2) {
    const min = parseInt(parts[0].replace(/[£,]/g, ''));
    const max = parseInt(parts[1].replace(/[£,]/g, ''));
    return { min, max };
  }
  
  return { min: 0, max: null };
}

/**
 * Calculate estimated total amount for a range
 */
export function estimateRangeTotal(range: string, count: number): number {
  const { min, max } = parseRangeString(range);
  
  if (max === null) {
    // For "£500+", estimate using min value
    return min * count;
  }
  
  // Use midpoint of range
  const midpoint = (min + max) / 2;
  return midpoint * count;
}
