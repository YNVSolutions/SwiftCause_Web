export interface DonationRange {
  range: string;
  count: number;
  percentage: number;
  color: string;
}

export interface CategoryDistribution {
  name: string;
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

export interface CategoryDistributionSummary {
  totalCategories: number;
  topCategory: string;
  topCategoryCount: number;
  topCategoryPercentage: number;
  categories: CategoryDistribution[];
}

/**
 * Calculate category distribution summary from donation data
 */
export function calculateCategoryDistributionSummary(
  data: Array<{ range: string; count: number }>, // 'range' field contains category names
  totalRaised: number
): CategoryDistributionSummary {
  const totalDonations = data.reduce((sum, item) => sum + item.count, 0);
  
  // Find top category
  const topCategoryData = data.reduce((max, item) => 
    item.count > max.count ? item : max, 
    { range: 'N/A', count: 0 }
  );

  // Calculate top category percentage
  const topCategoryPercentage = totalDonations > 0 ? Math.round((topCategoryData.count / totalDonations) * 100) : 0;

  // Transform data with percentages and colors
  const categories = data.map((item, index) => ({
    name: item.range, // 'range' field contains category name
    count: item.count,
    percentage: totalDonations > 0 ? Math.round((item.count / totalDonations) * 100) : 0,
    color: getGradientColor(index, data.length),
  }));

  return {
    totalCategories: data.length,
    topCategory: topCategoryData.range,
    topCategoryCount: topCategoryData.count,
    topCategoryPercentage,
    categories,
  };
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
    color: getGradientColor(index, data.length),
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
 * Creates a gradient using muted gray tones
 */
function getGradientColor(index: number, total: number): string {
  const colors = [
    'bg-gray-300',   // Light gray
    'bg-gray-400',   // Medium-light gray  
    'bg-gray-500',   // Medium gray
    'bg-gray-600',   // Medium-dark gray
    'bg-slate-600',  // Dark slate
    'bg-stone-600',  // Dark stone
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
    '#dbeafe': '#bfdbfe', // blue-200 -> blue-300
    '#bfdbfe': '#93c5fd', // blue-300 -> blue-400
    '#93c5fd': '#60a5fa', // blue-400 -> blue-500
    '#60a5fa': '#3b82f6', // blue-500 -> blue-600
    '#3b82f6': '#2563eb', // blue-600 -> blue-700
    '#2563eb': '#1d4ed8', // blue-700 -> blue-800
  };
  
  return hoverMap[baseColor] || '#3b82f6';
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
