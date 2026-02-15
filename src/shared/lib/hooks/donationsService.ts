import { fetchAllDonations } from '../../api/legacy/donationsApi';
import { Donation } from '../../types'; 


function formatTimestamp(timestamp: any): string {
  if (!timestamp) return '';

  if (typeof timestamp?.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }

  if (typeof timestamp?.seconds === 'number') {
    return new Date(timestamp.seconds * 1000).toISOString();
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

    const formattedDonations: Donation[] = rawDonations.map((donation: any) => ({
      ...donation,
      timestamp: formatTimestamp(donation.timestamp), // Format the timestamp here
    })) as Donation[];

    return formattedDonations;
  } catch (error) {
    console.error('Error in donations service:', error);
    throw new Error('Could not retrieve donation data. Please try again.');
  }
}
