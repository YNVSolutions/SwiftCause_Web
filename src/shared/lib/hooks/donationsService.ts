import { fetchAllDonations } from '../../api/legacy/donationsApi';
import { Donation } from '../../types'; 


function formatTimestamp(timestamp: unknown): string {
  if (!timestamp) return '';

  if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp && typeof (timestamp as { toDate: () => Date }).toDate === 'function') {
    return (timestamp as { toDate: () => Date }).toDate().toISOString();
  }

  if (typeof timestamp === 'object' && timestamp !== null && 'seconds' in timestamp && typeof (timestamp as { seconds: number }).seconds === 'number') {
    return new Date((timestamp as { seconds: number }).seconds * 1000).toISOString();
  }

  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }

  if (typeof timestamp === 'string') {
    const parsed = new Date(timestamp);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
  }

  return '';
}


export async function getDonations(organizationId: string): Promise<Donation[]> {
  try {
    const rawDonations = await fetchAllDonations(organizationId);

    const formattedDonations: Donation[] = rawDonations.map((donation: Record<string, unknown>) => ({
      ...donation,
      timestamp: formatTimestamp(donation.timestamp), // Format the timestamp here
    })) as Donation[];

    return formattedDonations;
  } catch (error) {
    console.error('Error in donations service:', error);
    throw new Error('Could not retrieve donation data. Please try again.');
  }
}
