import { useEffect, useState } from 'react';
import { getDonationsByKiosk } from '../../api/legacy/donationsApi';

export function useKioskPerformance(kiosks: Array<{ id: string }>) {
  const [performance, setPerformance] = useState<{ [kioskId: string]: { totalRaised: number, donorCount: number } }>({});

  useEffect(() => {
    async function fetchAll() {
      const result: { [kioskId: string]: { totalRaised: number, donorCount: number } } = {};
      for (const kiosk of kiosks) {
        const donations = await getDonationsByKiosk(kiosk.id) as Array<{ amount?: number; donorId?: string | null }>;
        const totalRaised = donations.reduce((sum, donation) => sum + (Number(donation.amount) || 0), 0);
        const donorSet = new Set(
          donations
            .map((donation) => donation.donorId)
            .filter((donorId): donorId is string => Boolean(donorId))
        );
        result[kiosk.id] = { totalRaised, donorCount: donorSet.size };
      }
      setPerformance(result);
    }
    if (kiosks.length) fetchAll();
  }, [kiosks]);

  return performance;
}
