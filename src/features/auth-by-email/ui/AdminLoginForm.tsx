import React from 'react';
import { AdminLogin } from '../../../views/admin/AdminLogin';
import { useAdminLogin } from '../hooks/useAdminLogin';
import { UserRole, AdminSession } from '../../../shared/types';

interface AdminLoginContainerProps {
	onLogin: (role: UserRole, sessionData?: AdminSession) => void;
	variant?: 'classic' | 'panel';
	buttonLabel?: string;
	buttonClassName?: string;
}

export function AdminLoginContainer({ onLogin, variant, buttonLabel, buttonClassName }: AdminLoginContainerProps) {
	const { 
		email, 
		password, 
		setEmail, 
		setPassword, 
		error, 
		loading, 
		emailVerificationError,
		isCheckingEmail,
		checkEmailVerification,
		handleSubmit 
	} = useAdminLogin(onLogin);

	return (
		<AdminLogin
			email={email}
			password={password}
			error={error}
			loading={loading}
			emailVerificationError={emailVerificationError}
			isCheckingEmail={isCheckingEmail}
			onEmailChange={(e) => setEmail(e.target.value)}
			onPasswordChange={(e) => setPassword(e.target.value)}
			onEmailBlur={checkEmailVerification}
			onSubmit={handleSubmit}
			variant={variant}
			buttonLabel={buttonLabel}
			buttonClassName={buttonClassName}
		/>
	);
}

