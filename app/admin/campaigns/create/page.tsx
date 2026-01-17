'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CampaignCreationForm } from '@/components/campaign/CampaignCreationForm';
import { AdminLayout } from '@/views/admin/AdminLayout';
import { useAuth } from '@/shared/lib/auth-provider';
import { Button } from '@/shared/ui/button';
import { ChevronLeft } from 'lucide-react';

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
      headerTitle={(
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin')}
          className="px-0 text-xs font-semibold uppercase tracking-widest text-gray-500 hover:text-gray-800"
        >
          <ChevronLeft className="w-4 h-4 mr-0" />
          Back to Dashboard
        </Button>
      )}
    >
      <div className="space-y-4">
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-1">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Campaign Management</h1>
                  <p className="text-sm text-gray-600">Create a new campaign and configure its details</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-2 sm:px-6 lg:px-8 pt-2 pb-4 sm:pt-4 sm:pb-8">
          <CampaignCreationForm onSubmit={handleSubmit} isLoading={isLoading} />
        </main>
      </div>
    </AdminLayout>
  );
}
