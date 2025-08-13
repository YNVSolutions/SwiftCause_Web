import React from 'react';
import { AdminLogin } from '../../../components/admin/AdminLogin';
import { useAdminLogin } from '../hooks/useAdminLogin';
import { UserRole, AdminSession } from '../../../App';

interface AdminLoginContainerProps {
	onLogin: (role: UserRole, sessionData?: AdminSession) => void;
}

export function AdminLoginContainer({ onLogin }: AdminLoginContainerProps) {
	const { email, password, setEmail, setPassword, error, loading, handleSubmit } = useAdminLogin(onLogin);

	return (
		<AdminLogin
			email={email}
			password={password}
			error={error}
			loading={loading}
			onEmailChange={(e) => setEmail(e.target.value)}
			onPasswordChange={(e) => setPassword(e.target.value)}
			onSubmit={handleSubmit}
		/>
	);
}


