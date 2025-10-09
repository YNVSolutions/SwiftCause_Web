import { useCallback, useEffect, useMemo, useState } from 'react';
import { useKiosks } from '../../../hooks/useKiosks';
import { KioskSession, UserRole } from '../../../shared/types';
import { kioskAuthApi } from '../api';

type OnLogin = (role: UserRole, sessionData?: KioskSession) => void;

export function useKioskLogin(onLogin: OnLogin) {
	const { kiosks, loading: kiosksLoading, error: kiosksError } = useKiosks() as unknown as { kiosks: any[]; loading: boolean; error: string | null };
	const [kioskId, setKioskId] = useState('');
	const [accessCode, setAccessCode] = useState('');
	const [localError, setLocalError] = useState<string>('');

	useEffect(() => {
		if (kiosksError) setLocalError('Failed to load kiosks. Please try again.');
	}, [kiosksError]);

	const handleSubmit = useCallback(async (e: React.FormEvent) => {
		e.preventDefault();
		setLocalError('');

		if (!kioskId || !accessCode) {
			setLocalError('Please enter both Kiosk ID and Access Code.');
			return;
		}

		try {
			const kioskSession = await kioskAuthApi.authenticateKiosk(kioskId, accessCode);
			if (!kioskSession) {
				setLocalError('Invalid Kiosk ID or Access Code.');
				return;
			}

			onLogin('kiosk', kioskSession);
		} catch (error) {
			setLocalError('Authentication failed. Please try again.');
		}
	}, [kioskId, accessCode, onLogin]);

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


