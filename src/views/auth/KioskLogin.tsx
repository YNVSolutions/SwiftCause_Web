import React from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { ProfessionalKioskIdField } from './interactions/ProfessionalKioskIdField';
import { ProfessionalAccessCodeField } from './interactions/ProfessionalAccessCodeField';
import { MagneticButton } from './interactions/MagneticButton';

interface KioskLoginProps {
	kioskId: string;
	accessCode: string;
	error?: string | null;
	loading: boolean;
	onKioskIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onAccessCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (e: React.FormEvent) => void;
	variant?: 'classic' | 'panel';
	buttonLabel?: string;
	buttonClassName?: string;
}

export function KioskLogin({ 
	kioskId, 
	accessCode, 
	error, 
	loading, 
	onKioskIdChange, 
	onAccessCodeChange, 
	onSubmit,
	variant = 'classic',
	buttonLabel,
	buttonClassName
}: KioskLoginProps) {
	const isPanel = variant === 'panel';
	const resolvedButtonLabel = buttonLabel ?? (isPanel ? 'Login as Kiosk' : 'Access Donation Interface');

	return (
		<>
			{!isPanel && (
				<div className="text-center mb-4 animate-fade-in">
					<div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110">
						<Heart className="h-7 w-7 text-green-600" />
					</div>
					<h3 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
						Kiosk Access
					</h3>
					<p className="text-sm text-gray-600 mt-1">For donation collection terminals</p>
				</div>
			)}

			<form onSubmit={onSubmit} className={`space-y-4 ${isPanel ? '' : 'animate-fade-in-delay'}`}>
				<ProfessionalKioskIdField
					id="kioskId"
					value={kioskId}
					onChange={onKioskIdChange}
					error={error}
				/>

				<ProfessionalAccessCodeField
					id="accessCode"
					value={accessCode}
					onChange={onAccessCodeChange}
				/>

				<MagneticButton
					type="submit"
					loading={loading}
					disabled={loading || !kioskId || !accessCode}
					className={`w-full h-12 text-base font-semibold ${buttonClassName ?? ''}`}
				>
					{!loading && (
						isPanel ? (
							resolvedButtonLabel
						) : (
							<>
								<Heart className="mr-2 h-5 w-5" />
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
