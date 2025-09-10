import { useEffect, useState } from 'react';
import { getDonationsByKiosk } from '../api/donationsApi';

export function useKioskPerformance(kiosks: Array<{ id: string }>) {
  const [performance, setPerformance] = useState<{ [kioskId: string]: { totalRaised: number, donorCount: number } }>({});

  useEffect(() => {
    async function fetchAll() {
      const result: { [kioskId: string]: { totalRaised: number, donorCount: number } } = {};
      for (const kiosk of kiosks) {
        const donations = await getDonationsByKiosk(kiosk.id);
        const totalRaised = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
        const donorSet = new Set(donations.map(d => d.donorId).filter(Boolean));
        result[kiosk.id] = { totalRaised, donorCount: donorSet.size };
      }
      setPerformance(result);
    }
    if (kiosks.length) fetchAll();
  }, [kiosks]);

  return performance;
}