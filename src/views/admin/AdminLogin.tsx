import React from 'react';
import { UserCog, ArrowRight, AlertCircle } from 'lucide-react';
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
	emailVerificationError?: string;
	isCheckingEmail?: boolean;
	onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onEmailBlur?: () => void;
	onPasswordBlur?: () => void;
	onSubmit: (e: React.FormEvent) => void;
	variant?: 'classic' | 'panel';
	buttonLabel?: string;
	buttonClassName?: string;
}

export function AdminLogin({ 
	email, 
	password, 
	error, 
	emailError, 
	passwordError, 
	loading, 
	emailVerificationError,
	isCheckingEmail,
	onEmailChange, 
	onPasswordChange, 
	onEmailBlur, 
	onPasswordBlur, 
	onSubmit,
	variant = 'classic',
	buttonLabel,
	buttonClassName
}: AdminLoginProps) {
	const hasVerificationError = !!emailVerificationError;
	const isPanel = variant === 'panel';
	const resolvedButtonLabel = buttonLabel ?? (isPanel ? 'Login as Admin' : 'Access Dashboard');
	
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
				<div>
					<ProfessionalEmailField
						id="email"
						value={email}
						onChange={onEmailChange}
						onBlur={onEmailBlur}
						error={emailError || error}
						isChecking={isCheckingEmail}
					/>
					
					{!isCheckingEmail && hasVerificationError && (
						<div className="flex items-start gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
							<AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
							<p className="text-sm text-red-800">
								{emailVerificationError}
							</p>
						</div>
					)}
				</div>

				<ProfessionalPasswordField
					id="password"
					value={password}
					onChange={onPasswordChange}
					onBlur={onPasswordBlur}
					error={passwordError}
				/>

				<MagneticButton
					type="submit"
					loading={loading}
					disabled={loading || hasVerificationError || isCheckingEmail}
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
