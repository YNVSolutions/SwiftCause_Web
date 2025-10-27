import React from 'react';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Label } from '../../shared/ui/label';
import {
	Heart,
	AlertTriangle,
	Monitor,
	KeyRound,
	ArrowRight,
	Shield,
} from 'lucide-react';

interface KioskLoginProps {
	kioskId: string;
	accessCode: string;
	error?: string | null;
	loading: boolean;
	onKioskIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onAccessCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (e: React.FormEvent) => void;
}

export function KioskLogin({ kioskId, accessCode, error, loading, onKioskIdChange, onAccessCodeChange, onSubmit }: KioskLoginProps) {
	return (
		<>
			<div className="text-center mb-4">
				<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
					<Heart className="h-6 w-6 text-indigo-600" />
				</div>
				<h3 className="font-medium">Kiosk Access</h3>
				<p className="text-sm text-gray-600">Enter kiosk credentials</p>
			</div>
			<form onSubmit={onSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="kioskId" className="flex items-center space-x-2">
						<Monitor className="w-4 h-4 text-gray-500" />
						<span>Kiosk ID</span>
					</Label>
					<Input
						id="kioskId"
						type="text"
						placeholder="e.g., KIOSK-NYC-001"
						value={kioskId}
						onChange={onKioskIdChange}
						className="h-12"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="accessCode" className="flex items-center space-x-2">
						<KeyRound className="w-4 h-4 text-gray-500" />
						<span>Access Code</span>
					</Label>
					<Input
						id="accessCode"
						type="password"
						placeholder="Enter kiosk access code"
						value={accessCode}
						onChange={onAccessCodeChange}
						className="h-12"
						required
					/>
				</div>

				{error && (
					<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
						<div className="flex items-center space-x-2">
							<AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
							<p className="text-sm text-red-700">{error}</p>
						</div>
					</div>
				)}

				<Button
					type="submit"
					className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg"
					disabled={!kioskId || !accessCode}
				>
					<Heart className="mr-2 h-4 w-4" />
					Access Donation Interface
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</form>
		</>
	);
}


