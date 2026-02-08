import { useCallback, useEffect, useMemo, useState } from 'react';
import { useKiosks } from '../../../shared/lib/hooks/useKiosks';
import { KioskSession, UserRole } from '../../../shared/types';
import { kioskAuthApi } from '../api';

type OnLogin = (role: UserRole, sessionData?: KioskSession) => void;

export function useKioskLogin(onLogin: OnLogin) {
	const { error: kiosksError } = useKiosks() as unknown as { error: string | null };
	const [kioskId, setKioskId] = useState('');
	const [accessCode, setAccessCode] = useState('');
	const [localError, setLocalError] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (kiosksError) setLocalError('Failed to load kiosks. Please try again.');
	}, [kiosksError]);

	const handleSubmit = useCallback(async (e: React.FormEvent) => {
		e.preventDefault();
		setLocalError('');
		setIsSubmitting(true);

		if (!kioskId || !accessCode) {
			setLocalError('Please enter both Kiosk ID and Access Code.');
			setIsSubmitting(false);
			return;
		}

		try {
			const kioskSession = await kioskAuthApi.authenticateKiosk(kioskId, accessCode);
			if (!kioskSession) {
				setLocalError('Invalid Kiosk ID or Access Code.');
				setIsSubmitting(false);
				return;
			}

			onLogin('kiosk', kioskSession);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : 'Authentication failed. Please try again.';
			setLocalError(errorMessage);
			setIsSubmitting(false);
		}
	}, [kioskId, accessCode, onLogin]);

	const errorMessage = useMemo(() => localError || '', [localError]);

	return {
		kioskId,
		accessCode,
		setKioskId,
		setAccessCode,
		error: errorMessage,
		loading: isSubmitting,
		handleSubmit
	};
}
