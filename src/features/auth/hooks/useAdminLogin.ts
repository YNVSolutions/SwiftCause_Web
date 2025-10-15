import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../../../shared/lib/hooks/useAuth';
import { UserRole, AdminSession, User } from '../../../shared/types';

type OnLogin = (role: UserRole, sessionData?: AdminSession) => void;

export function useAdminLogin(onLogin: OnLogin) {
	const { loading, error: authError, login } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [localError, setLocalError] = useState<string>('');

	const handleSubmit = useCallback(async (e: React.FormEvent) => {
		e.preventDefault();
		setLocalError('');

		if (!email || !password) {
			setLocalError('Please enter both email and password.');
			return;
		}

		try {
			const profile = await login(email, password);
			if (!profile) {
				return;
			}

			const userData = profile as User;
			if (!userData.isActive) {
				setLocalError('User account is disabled.');
				return;
			}

			if (!userData.organizationId) {
				setLocalError('Organization ID not defined for this user. Please contact support.');
				return;
			}

			const now = new Date().toISOString();
			const adminSession: AdminSession = {
				user: {
					...userData,
					lastLogin: now
				},
				loginTime: now
			};

			onLogin('admin', adminSession);
		} catch (err: any) {
			setLocalError(err?.message || 'Authentication failed. Please try again.');
		}
	}, [email, password, login, onLogin]);

	const error = useMemo(() => localError || authError || '', [localError, authError]);

	return {
		email,
		password,
		setEmail,
		setPassword,
		error,
		loading,
		handleSubmit
	};
}


