import React from 'react';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Label } from '../../shared/ui/label';
import {
	Shield,
	AlertTriangle,
	UserCog,
	ArrowRight,
} from 'lucide-react';

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

export function AdminLogin({ email, password, error, emailError, passwordError, loading, onEmailChange, onPasswordChange, onEmailBlur, onPasswordBlur, onSubmit }: AdminLoginProps) {
	return (
		<>
			<div className="text-center mb-3 animate-fade-in">
				<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-purple-100 to-indigo-100 shadow-sm">
					<UserCog className="h-6 w-6 text-purple-600" />
				</div>
				<h3 className="text-base font-semibold bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">User Access</h3>
				<p className="text-xs text-gray-600">For platform management and analytics</p>
			</div>

			<form onSubmit={onSubmit} className="space-y-3 animate-fade-in-delay">
				<div className="space-y-1.5">
					<Label htmlFor="email" className="flex items-center space-x-1.5 text-sm font-medium">
						<UserCog className="w-3.5 h-3.5 text-gray-500" />
						<span>Email</span>
					</Label>
					<div className={`border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all duration-300 hover:border-indigo-400 ${emailError || error ? 'border-red-500 focus-within:border-red-500' : ''}`}>
						<Input
							id="email"
							type="text"
							placeholder="Enter admin email"
							value={email}
							onChange={onEmailChange}
							onBlur={onEmailBlur}
							className="h-11 w-full px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent text-sm"
							required
						/>
					</div>
					{emailError && (
						<p className="text-xs text-red-600 flex items-center mt-1">
							<AlertTriangle className="w-3 h-3 mr-1" />
							{emailError}
						</p>
					)}
					{!emailError && error && (
						<p className="text-xs text-red-600 flex items-center mt-1">
							<AlertTriangle className="w-3 h-3 mr-1" />
							{error}
						</p>
					)}
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="password" className="flex items-center space-x-1.5 text-sm font-medium">
						<Shield className="w-3.5 h-3.5 text-gray-500" />
						<span>Password</span>
					</Label>
					<div className={`border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all duration-300 hover:border-indigo-400 ${passwordError ? 'border-red-500 focus-within:border-red-500' : ''}`}>
						<Input
							id="password"
							type="password"
							placeholder="Enter admin password"
							value={password}
							onChange={onPasswordChange}
							onBlur={onPasswordBlur}
							className="h-11 w-full px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent text-sm"
							required
						/>
					</div>
					{passwordError && (
						<p className="text-xs text-red-600 flex items-center mt-1">
							<AlertTriangle className="w-3 h-3 mr-1" />
							{passwordError}
						</p>
					)}
				</div>

				<Button 
					type="submit" 
					className="w-full h-11 bg-linear-to-r from-purple-300 via-indigo-300 to-purple-300 hover:from-purple-400 hover:via-indigo-400 hover:to-purple-400 text-white shadow-lg hover:shadow-xl text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] bg-size-[200%_100%] hover:bg-right animate-gradient-x" 
					disabled={loading}
				>
					{loading ? (
						<>
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
							Accessing...
						</>
					) : (
						<>
							<UserCog className="mr-2 h-4 w-4" />
							Access Dashboard
							<ArrowRight className="ml-2 h-4 w-4" />
						</>
					)}
				</Button>
			</form>
		</>
	);
}
