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
	loading: boolean;
	onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (e: React.FormEvent) => void;
}

export function AdminLogin({ email, password, error, loading, onEmailChange, onPasswordChange, onSubmit }: AdminLoginProps) {
	return (
		<>
			<div className="text-center mb-3 animate-fade-in">
				<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 shadow-sm">
					<UserCog className="h-6 w-6 text-purple-600" />
				</div>
				<h3 className="text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">User Access</h3>
				<p className="text-xs text-gray-600">For platform management and analytics</p>
			</div>

			<form onSubmit={onSubmit} className="space-y-3 animate-fade-in-delay">
				<div className="space-y-1.5">
					<Label htmlFor="email" className="flex items-center space-x-1.5 text-sm font-medium">
						<UserCog className="w-3.5 h-3.5 text-gray-500" />
						<span>Email</span>
					</Label>
					<div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all duration-300 hover:border-indigo-400">
						<Input
							id="email"
							type="text"
							placeholder="Enter admin email"
							value={email}
							onChange={onEmailChange}
							className="h-11 w-full px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent text-sm"
							required
						/>
					</div>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="password" className="flex items-center space-x-1.5 text-sm font-medium">
						<Shield className="w-3.5 h-3.5 text-gray-500" />
						<span>Password</span>
					</Label>
					<div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all duration-300 hover:border-indigo-400">
						<Input
							id="password"
							type="password"
							placeholder="Enter admin password"
							value={password}
							onChange={onPasswordChange}
							className="h-11 w-full px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent text-sm"
							required
						/>
					</div>
				</div>

				{error && (
					<div className="p-2.5 bg-red-50 border border-red-200 rounded-lg animate-shake">
						<div className="flex items-center space-x-2">
							<AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 animate-pulse" />
							<p className="text-xs text-red-700">{error}</p>
						</div>
					</div>
				)}

				<Button 
					type="submit" 
					className="w-full h-11 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] bg-[length:200%_100%] hover:bg-right animate-gradient-x" 
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


