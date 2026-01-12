'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CampaignCreationForm } from '@/components/campaign/CampaignCreationForm';
import { AdminLayout } from '@/views/admin/AdminLayout';
import { useAuth } from '@/shared/lib/auth-provider';

interface CampaignFormData {
  title: string;
  briefOverview: string;
  detailedStory: string;
  startDate: string;
  endDate: string;
  fundraisingTarget: number;
  coverImage?: File | null;
  coverImageUrl?: string;
  campaignGallery: File[];
  youtubePresentation: string;
  donationTiers: [string, string, string];
  kioskDistribution: string[];
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const { currentAdminSession, handleLogout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!currentAdminSession) {
    return null;
  }

  const handleSubmit = async (data: CampaignFormData) => {
    setIsLoading(true);
    try {
      // TODO: Implement campaign creation API call
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('Campaign data:', data);
      }

      // Simulated API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to campaigns list on success
      router.push('/admin/campaigns');
    } catch (error) {
      console.error('Campaign creation failed:', error);
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
      hasPermission={() => false}
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

        <CampaignCreationForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </AdminLayout>
  );
}
