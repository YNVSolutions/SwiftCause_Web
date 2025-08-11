import React, { useState} from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

import {
  Heart,
  AlertTriangle,
  QrCode,
  Monitor,
  KeyRound,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { KioskSession, UserRole, Kiosk } from '../App';
import { QRCodeScanner } from './QRCodeScanner';


interface KioskLoginProps {
  onLogin: (role: UserRole, sessionData?: KioskSession) => void;
}

export function KioskLogin({ onLogin }: KioskLoginProps) {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [kioskCredentials, setKioskCredentials] = useState({
    kioskId: '',
    accessCode: ''
  });
  const [loginError, setLoginError] = useState('');

  // Mock kiosks data
  const availableKiosks: Kiosk[] = [
    {
      id: 'KIOSK-NYC-001',
      name: 'Times Square Terminal',
      location: 'Times Square, New York',
      status: 'online',
      accessCode: 'TS2024',
      qrCode: 'KIOSK-NYC-001:TS2024',
      assignedCampaigns: ['1', '2', '3'],
      defaultCampaign: '1',
      settings: {
        displayMode: 'grid',
        showAllCampaigns: false,
        maxCampaignsDisplay: 6,
        autoRotateCampaigns: false
      }
    }
  ];

  const handleKioskLogin = async (kioskId: string, accessCode: string, loginMethod: 'qr' | 'manual' = 'manual') => {
    setLoginError('');

    try {
      const kiosk = availableKiosks.find(k => k.id === kioskId && k.accessCode === accessCode);

      if (!kiosk) {
        setLoginError('Invalid Kiosk ID or Access Code.');
        return;
      }

     
      const kioskSession: KioskSession = {
        kioskId: kiosk.id,
        kioskName: kiosk.name,
        startTime: new Date().toISOString(),
        assignedCampaigns: kiosk.assignedCampaigns || [],
        settings: kiosk.settings || {
          displayMode: 'grid',
          showAllCampaigns: false,
          maxCampaignsDisplay: 6,
          autoRotateCampaigns: false
        },
        loginMethod
      };

      onLogin('kiosk', kioskSession);
    } catch (error) {
      console.error('Kiosk authentication error:', error);
      setLoginError(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
    }
  };

  const handleKioskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleKioskLogin(kioskCredentials.kioskId, kioskCredentials.accessCode, 'manual');
  };

  const handleQRScanSuccess = (qrData: string) => {
    const [kioskId, accessCode] = qrData.split(':');
    if (kioskId && accessCode) {
      handleKioskLogin(kioskId, accessCode, 'qr');
    } else {
      setLoginError('Invalid QR code format. Please try scanning again.');
    }
    setShowQRScanner(false);
  };

  const handleQRScanError = (error: string) => {
    setLoginError(error);
    setShowQRScanner(false);
  };


  return (
    <>
      <div className="text-center mb-4">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
          <Heart className="h-6 w-6 text-indigo-600" />
        </div>
        <h3 className="font-medium">Kiosk Access</h3>
        <p className="text-sm text-gray-600">Scan QR code or enter kiosk credentials</p>
      </div>

      <div className="flex space-x-2 mb-6">
        <Button
          type="button"
          onClick={() => setShowQRScanner(true)}
          className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        >
          <QrCode className="mr-2 h-4 w-4" />
          Scan QR Code
        </Button>
        <div className="flex items-center justify-center px-3 text-sm text-gray-500">
          or
        </div>
      </div>

      <form onSubmit={handleKioskSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="kioskId" className="flex items-center space-x-2">
            <Monitor className="w-4 h-4 text-gray-500" />
            <span>Kiosk ID</span>
          </Label>
          <Input
            id="kioskId"
            type="text"
            placeholder="e.g., KIOSK-NYC-001"
            value={kioskCredentials.kioskId}
            onChange={(e) => setKioskCredentials(prev => ({ ...prev, kioskId: e.target.value.toUpperCase() }))}
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
            value={kioskCredentials.accessCode}
            onChange={(e) => setKioskCredentials(prev => ({ ...prev, accessCode: e.target.value }))}
            className="h-12"
            required
          />
        </div>

        {loginError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{loginError}</p>
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg"
          disabled={!kioskCredentials.kioskId || !kioskCredentials.accessCode}
        >
          <Heart className="mr-2 h-4 w-4" />
          Access Donation Interface
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>

      <div className="text-center space-y-2 pt-4 border-t">
        <p className="text-xs text-gray-600">
          Find your kiosk ID and access code on the device label
        </p>
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <QrCode className="w-3 h-3" />
            <span>QR scan preferred</span>
          </div>
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>Secure access</span>
          </div>
        </div>
      </div>
      
      {showQRScanner && (
        <QRCodeScanner
          isActive={showQRScanner}
          onScanSuccess={handleQRScanSuccess}
          onScanError={handleQRScanError}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </>
  );
}