import React from 'react';
import { UserCog, ArrowRight } from 'lucide-react';
import { SmartEmailField } from '../auth/interactions/SmartEmailField';
import { PasswordStrengthTree } from '../auth/interactions/PasswordStrengthTree';
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
	onSubmit 
}: AdminLoginProps) {
	return (
		<>
			<div className="text-center mb-4 animate-fade-in">
				<div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110">
					<UserCog className="h-7 w-7 text-green-600" />
				</div>
				<h3 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
					User Access
				</h3>
				<p className="text-sm text-gray-600 mt-1">For platform management and analytics</p>
			</div>

			<form onSubmit={onSubmit} className="space-y-4 animate-fade-in-delay">
				<SmartEmailField
					id="email"
					value={email}
					onChange={onEmailChange}
					onBlur={onEmailBlur}
					error={emailError || error}
				/>

				<PasswordStrengthTree
					id="password"
					value={password}
					onChange={onPasswordChange}
					onBlur={onPasswordBlur}
					error={passwordError}
				/>

				<MagneticButton
					type="submit"
					loading={loading}
					disabled={loading}
					className="w-full h-12 text-base font-semibold"
				>
					{!loading && (
						<>
							<UserCog className="mr-2 h-5 w-5" />
							Access Dashboard
							<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
						</>
					)}
				</MagneticButton>
			</form>
		</>
	);
}


