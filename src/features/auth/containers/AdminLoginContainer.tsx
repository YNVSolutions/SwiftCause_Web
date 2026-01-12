import React, { useState } from 'react';
import { AdminLogin } from '../../../views/admin/AdminLogin';
import { useAdminLogin } from '../hooks/useAdminLogin';
import { UserRole, AdminSession } from '../../../shared/types';

interface AdminLoginContainerProps {
	onLogin: (role: UserRole, sessionData?: AdminSession) => void;
}

// Validation functions
const validateEmail = (email: string): string | null => {
	if (!email.trim()) {
		return null; // Don't show error for empty field
	}
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return 'Please enter a valid email address (e.g., user@example.com)';
	}
	return null;
};

const validatePassword = (password: string): string | null => {
	if (!password) {
		return null; // Don't show error for empty field
	}
	if (password.length < 8) {
		return 'Password must be at least 8 characters long';
	}
	return null;
};

export function AdminLoginContainer({ onLogin }: AdminLoginContainerProps) {
	const { email, password, setEmail, setPassword, error, loading, handleSubmit } = useAdminLogin(onLogin);
	const [emailError, setEmailError] = useState<string | null>(null);
	const [passwordError, setPasswordError] = useState<string | null>(null);

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
		// Clear validation error when user starts typing
		if (emailError) {
			setEmailError(null);
		}
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
		// Clear validation error when user starts typing
		if (passwordError) {
			setPasswordError(null);
		}
	};

	const handleEmailBlur = () => {
		const error = validateEmail(email);
		setEmailError(error);
	};

	const handlePasswordBlur = () => {
		const error = validatePassword(password);
		setPasswordError(error);
	};

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		
		// Validate before submitting
		const emailValidationError = validateEmail(email);
		const passwordValidationError = validatePassword(password);
		
		setEmailError(emailValidationError);
		setPasswordError(passwordValidationError);
		
		// Only submit if no validation errors
		if (!emailValidationError && !passwordValidationError) {
			handleSubmit(e);
		}
	};

	return (
		<AdminLogin
			email={email}
			password={password}
			error={error}
			emailError={emailError}
			passwordError={passwordError}
			loading={loading}
			onEmailChange={handleEmailChange}
			onPasswordChange={handlePasswordChange}
			onEmailBlur={handleEmailBlur}
			onPasswordBlur={handlePasswordBlur}
			onSubmit={handleFormSubmit}
		/>
	);
}


