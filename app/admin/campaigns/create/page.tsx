'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CampaignCreationForm } from '@/components/campaign/CampaignCreationForm';
import { AdminLayout } from '@/views/admin/AdminLayout';
import { useAuth } from '@/shared/lib/auth-provider';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { AlertCircle } from 'lucide-react';

interface CampaignFormData {
  title: string;
  briefOverview: string;
  detailedStory: string;
  startDate: string;
  endDate: string;
  goal: number;
  coverImage?: File | null;
  coverImageUrl?: string;
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const { currentAdminSession, handleLogout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentAdminSession) {
    return null;
  }

  const handleSubmit = async (data: CampaignFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement campaign creation API call
      // This will be connected to the backend Firebase functions
      console.log('Campaign data:', data);

      // Simulated API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to campaigns list on success
      router.push('/admin/campaigns');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create campaign';
      setError(errorMessage);
      console.error('Campaign creation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <AdminLayout
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      userSession={currentAdminSession}
    >
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
          >
            ← Back
          </button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <CampaignCreationForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </AdminLayout>
  );
}
