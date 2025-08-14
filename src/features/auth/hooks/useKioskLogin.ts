import { useCallback, useEffect, useMemo, useState } from 'react';
import { useKiosks } from '../../../hooks/useKiosks';
import { KioskSession, UserRole, Kiosk } from '../../../App';

type OnLogin = (role: UserRole, sessionData?: KioskSession) => void;

export function useKioskLogin(onLogin: OnLogin) {
	const { kiosks, loading: kiosksLoading, error: kiosksError } = useKiosks() as unknown as { kiosks: Kiosk[]; loading: boolean; error: string | null };
	const [kioskId, setKioskId] = useState('');
	const [accessCode, setAccessCode] = useState('');
	const [localError, setLocalError] = useState<string>('');

	useEffect(() => {
		if (kiosksError) setLocalError('Failed to load kiosks. Please try again.');
	}, [kiosksError]);

	const handleSubmit = useCallback((e: React.FormEvent) => {
		e.preventDefault();
		setLocalError('');

		if (!kioskId || !accessCode) {
			setLocalError('Please enter both Kiosk ID and Access Code.');
			return;
		}

		const kiosk = kiosks.find((k) => k.id === kioskId && k.accessCode === accessCode);
		if (!kiosk) {
			setLocalError('Invalid Kiosk ID or Access Code.');
			return;
		}

		const now = new Date().toISOString();
		const kioskSession: KioskSession = {
			kioskId: kiosk.id,
			kioskName: kiosk.name,
			startTime: now,
			assignedCampaigns: kiosk.assignedCampaigns || [],
			settings: kiosk.settings || {
				displayMode: 'grid',
				showAllCampaigns: false,
				maxCampaignsDisplay: 6,
				autoRotateCampaigns: false
			},
			loginMethod: 'manual'
		};

		onLogin('kiosk', kioskSession);
	}, [kioskId, accessCode, kiosks, onLogin]);

	const error = useMemo(() => localError || '', [localError]);

	return {
		kioskId,
		accessCode,
		setKioskId,
		setAccessCode,
		error,
		loading: kiosksLoading,
		handleSubmit
	};
}


