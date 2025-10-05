import { fetchAllDonations } from '../api/donationsApi';
import { Donation } from '../App'; 


function formatTimestamp(timestamp: any): string {
  if (!timestamp || !timestamp.toDate) {
    return 'N/A';
  }
  return timestamp.toDate().toLocaleString();
}


export async function getDonations(organizationId: string): Promise<Donation[]> {
  try {
    const rawDonations = await fetchAllDonations(organizationId);

    const formattedDonations: Donation[] = rawDonations.map(donation => ({
      ...donation,
      timestamp: formatTimestamp(donation.timestamp), // Format the timestamp here
    })) as Donation[];

    return formattedDonations;
  } catch (error) {
    throw new Error('Could not retrieve donation data. Please try again.');
  }
}