import React, { useState, useEffect} from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase'; 
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

import {
  Heart,
  AlertTriangle,
  Monitor,
  KeyRound,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { KioskSession, UserRole, Kiosk } from '../App';
interface KioskLoginProps {
  onLogin: (role: UserRole, sessionData?: KioskSession) => void;
}

export function KioskLogin({ onLogin }: KioskLoginProps) {
  const [kioskCredentials, setKioskCredentials] = useState({
    kioskId: '',
    accessCode: ''
  });
  const [loginError, setLoginError] = useState('');
  const [availableKiosks, setAvailableKiosks] = useState<Kiosk[]>([]);

  // Fetch kiosks from Firestore
  useEffect(() => {
    const fetchKiosks = async () => {
      try {
        const snap = await getDocs(collection(db, 'kiosks'));
        const kiosks: Kiosk[] = snap.docs.map(doc => ({
          ...(doc.data() as Kiosk),
          id: doc.id
        }));
        setAvailableKiosks(kiosks);
      } catch (err) {
        console.error('Error fetching kiosks:', err);
        setLoginError('Failed to load kiosks. Please try again.');
      }
    };

    fetchKiosks();
  }, []);

  const handleKioskLogin = (kioskId: string, accessCode: string, loginMethod: 'qr' | 'manual' = 'manual') => {
    setLoginError('');

    const kiosk = availableKiosks.find(k => k.id === kioskId && k.accessCode === accessCode);
    console.log(availableKiosks)
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
  };

  const handleKioskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleKioskLogin(kioskCredentials.kioskId, kioskCredentials.accessCode, 'manual');
  };

  return (
    <>
      <div className="text-center mb-4">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
          <Heart className="h-6 w-6 text-indigo-600" />
        </div>
        <h3 className="font-medium">Kiosk Access</h3>
        <p className="text-sm text-gray-600">Enter kiosk credentials</p>
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
            onChange={(e) => setKioskCredentials(prev => ({ ...prev, kioskId: e.target.value }))}
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
    </>
  );
}