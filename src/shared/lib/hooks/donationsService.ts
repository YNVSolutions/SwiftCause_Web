import { fetchAllDonations } from '../../api/legacy/donationsApi';
import { Donation } from '../../types'; 


type TimestampLike = { toDate: () => Date };

function formatTimestamp(timestamp: unknown): string {
  if (
    typeof timestamp === 'object' &&
    timestamp !== null &&
    'toDate' in timestamp &&
    typeof (timestamp as TimestampLike).toDate === 'function'
  ) {
    return (timestamp as TimestampLike).toDate().toLocaleString();
  }
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return 'N/A';
}


export async function getDonations(organizationId: string): Promise<Donation[]> {
  try {
    const rawDonations = await fetchAllDonations(organizationId);

    const formattedDonations: Donation[] = rawDonations.map((donation) => {
      const record = donation as Record<string, unknown>;
      return {
        ...(record as Donation),
        timestamp: formatTimestamp(record.timestamp),
      };
    });

    return formattedDonations;
  } catch (error) {
    console.error('Error in donations service:', error);
    throw new Error('Could not retrieve donation data. Please try again.');
  }
}
