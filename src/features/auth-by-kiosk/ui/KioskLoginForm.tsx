import React from 'react';
import { KioskLogin } from '../../../components/kiosk/KioskLogin';
import { useKioskLogin } from '../hooks/useKioskLogin';
import { UserRole, KioskSession } from '../../../App';

interface KioskLoginContainerProps {
	onLogin: (role: UserRole, sessionData?: KioskSession) => void;
}

export function KioskLoginContainer({ onLogin }: KioskLoginContainerProps) {
	const { kioskId, accessCode, setKioskId, setAccessCode, error, loading, handleSubmit } = useKioskLogin(onLogin);

	return (
		<KioskLogin
			kioskId={kioskId}
			accessCode={accessCode}
			error={error}
			loading={loading}
			onKioskIdChange={(e) => setKioskId(e.target.value)}
			onAccessCodeChange={(e) => setAccessCode(e.target.value)}
			onSubmit={handleSubmit}
		/>
	);
}


