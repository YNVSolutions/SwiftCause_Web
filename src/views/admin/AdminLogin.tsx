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
			<div className="text-center mb-4">
				<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
					<UserCog className="h-6 w-6 text-purple-600" />
				</div>
				<h3 className="font-medium">User Access</h3>
				<p className="text-sm text-gray-600">For platform management and analytics</p>
			</div>

			<form onSubmit={onSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="email" className="flex items-center space-x-2 ">
						<UserCog className="w-4 h-4 text-gray-500 " />
						<span>Email</span>
					</Label>
					<div className={`border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors ${error ? 'border-red-500' : ''}`}>
						<Input
							id="email"
							type="text"
							placeholder="Enter admin email"
							value={email}
							onChange={onEmailChange}
							className="h-12 w-full px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
							required
						/>
					</div>
					{error && (
						<p className="text-xs text-red-600 flex items-center mt-1">
							<AlertTriangle className="w-3 h-3 mr-1" />
							{error}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="password" className="flex items-center space-x-2">
						<Shield className="w-4 h-4 text-gray-500 " />
						<span>Password</span>
					</Label>
					<div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors">
						<Input
							id="password"
							type="password"
							placeholder="Enter admin password"
							value={password}
							onChange={onPasswordChange}
							className="h-12 w-full px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
							required
						/>
					</div>
				</div>

				<Button type="submit" className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg" disabled={loading}>
					<UserCog className="mr-2 h-4 w-4" />
					Access Dashboard
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</form>
		</>
	);
}


