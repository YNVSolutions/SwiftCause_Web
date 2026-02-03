import React, { useState } from 'react';
import { UserCog, ArrowRight } from 'lucide-react';
import { ProfessionalEmailField } from '../auth/interactions/ProfessionalEmailField';
import { ProfessionalPasswordField } from '../auth/interactions/ProfessionalPasswordField';
import { MagneticButton } from '../auth/interactions/MagneticButton';

interface AdminLoginProps {
	email: string;
	password: string;
	error?: string | null;
	emailError?: string | null;
	passwordError?: string | null;
	loading: boolean;
	onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onEmailBlur?: () => void;
	onPasswordBlur?: () => void;
	onSubmit: (e: React.FormEvent) => void;
	variant?: 'classic' | 'panel';
	buttonLabel?: string;
	buttonClassName?: string;
	needsVerification?: boolean;
	resendingEmail?: boolean;
	onResendVerification?: () => Promise<boolean>;
}

export function AdminLogin({ 
	email, 
	password, 
	error, 
	emailError, 
	passwordError, 
	loading, 
	onEmailChange, 
	onPasswordChange, 
	onEmailBlur, 
	onPasswordBlur, 
	onSubmit,
	variant = 'classic',
	buttonLabel,
	buttonClassName,
	needsVerification = false,
	resendingEmail = false,
	onResendVerification
}: AdminLoginProps) {
	const isPanel = variant === 'panel';
	const resolvedButtonLabel = buttonLabel ?? (isPanel ? 'Login as Admin' : 'Access Dashboard');
	const [resendSuccess, setResendSuccess] = useState(false);

	const handleResendClick = async () => {
		if (onResendVerification) {
			const success = await onResendVerification();
			if (success) {
				setResendSuccess(true);
				setTimeout(() => setResendSuccess(false), 5000);
			}
		}
	};
	
	return (
		<>
			{!isPanel && (
				<div className="text-center mb-4 animate-fade-in">
					<div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-green-100 to-emerald-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110">
						<UserCog className="h-7 w-7 text-green-600" />
					</div>
					<h3 className="text-lg font-semibold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
						User Access
					</h3>
					<p className="text-sm text-gray-600 mt-1">For platform management and analytics</p>
				</div>
			)}

			<form onSubmit={onSubmit} className={`space-y-4 ${isPanel ? '' : 'animate-fade-in-delay'}`}>
				<ProfessionalEmailField
					id="email"
					value={email}
					onChange={onEmailChange}
					onBlur={onEmailBlur}
					error={emailError || error}
				/>

				<ProfessionalPasswordField
					id="password"
					value={password}
					onChange={onPasswordChange}
					onBlur={onPasswordBlur}
					error={passwordError}
				/>

				{needsVerification && onResendVerification && (
					<div className="text-sm text-slate-600">
						{resendSuccess ? (
							<p className="text-green-700">
								✓ Verification email sent! Check your inbox.
							</p>
						) : (
							<p>
								Didn't receive the email?{' '}
								<button
									type="button"
									onClick={handleResendClick}
									disabled={resendingEmail}
									className="font-semibold text-[#064e3b] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{resendingEmail ? 'Sending...' : 'Resend verification email'}
								</button>
							</p>
						)}
					</div>
				)}

				<MagneticButton
					type="submit"
					loading={loading}
					disabled={loading}
					className={`w-full h-12 text-base font-semibold ${buttonClassName ?? ''}`}
				>
					{!loading && (
						isPanel ? (
							resolvedButtonLabel
						) : (
							<>
								<UserCog className="mr-2 h-5 w-5" />
								{resolvedButtonLabel}
								<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
							</>
						)
					)}
				</MagneticButton>
			</form>
		</>
	);
}
