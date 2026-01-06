'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { CampaignForm } from '@/components/campaign';
import { KioskSelector } from '@/components/kiosk';
import { useAuth } from '@/shared/lib/auth-provider';
import { ArrowLeft, Check } from 'lucide-react';
import { createNewCampaign, validateCampaignData } from '@/services/campaign';

type FormStep = 'campaign-details' | 'kiosk-assignment' | 'success';

interface CampaignFormData {
  title: string;
  description: string;
  goal: number;
  status: 'active' | 'paused' | 'completed';
  startDate: Date | null;
  endDate: Date | null;
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const { currentAdminSession } = useAuth();
  const [currentStep, setCurrentStep] = useState<FormStep>('campaign-details');
  const [campaignData, setCampaignData] = useState<CampaignFormData>({
    title: '',
    description: '',
    goal: 0,
    status: 'active',
    startDate: null,
    endDate: null,
  });
  const [selectedKiosks, setSelectedKiosks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createdCampaignId, setCreatedCampaignId] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Check authentication
  if (!currentAdminSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const handleCampaignFormSubmit = async (data: CampaignFormData) => {
    setCampaignData(data);
    setCurrentStep('kiosk-assignment');
  };

  const handleKiosksChange = (kioskIds: string[]) => {
    setSelectedKiosks(kioskIds);
  };

  const handleCreateCampaign = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get organization ID from current session
      const organizationId = currentAdminSession?.user?.organizationId || 'ORG-DEFAULT';

      // Validate complete data
      const validation = validateCampaignData({
        title: campaignData.title,
        description: campaignData.description,
        goal: campaignData.goal,
        status: campaignData.status,
        startDate: campaignData.startDate!,
        endDate: campaignData.endDate!,
        assignedKiosks: selectedKiosks,
        organizationId,
      });

      if (!validation.valid) {
        setError(validation.errors[0] || 'Validation failed');
        return;
      }

      // Create campaign
      const result = await createNewCampaign({
        title: campaignData.title,
        description: campaignData.description,
        goal: campaignData.goal,
        status: campaignData.status,
        startDate: campaignData.startDate!,
        endDate: campaignData.endDate!,
        assignedKiosks: selectedKiosks,
        organizationId,
      });

      if (!result.success) {
        setError(result.message || 'Failed to create campaign');
        return;
      }

      setCreatedCampaignId(result.id);
      setCurrentStep('success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Campaign creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToCampaignsList = () => {
    router.push('/admin/campaigns');
  };

  const handleBackToForm = () => {
    setCurrentStep('campaign-details');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
          <p className="text-gray-600 mt-2">
            {currentStep === 'campaign-details' && 'Step 1 of 2: Campaign Details'}
            {currentStep === 'kiosk-assignment' && 'Step 2 of 2: Assign Kiosks'}
            {currentStep === 'success' && 'Campaign Created Successfully'}
          </p>
        </div>

        {/* Campaign Details Step */}
        {currentStep === 'campaign-details' && (
          <div className="space-y-6">
            <CampaignForm
              onSubmit={handleCampaignFormSubmit}
              isLoading={isLoading}
              onCancel={() => router.back()}
            />
          </div>
        )}

        {/* Kiosk Assignment Step */}
        {currentStep === 'kiosk-assignment' && (
          <div className="space-y-6">
            <KioskSelector
              onKiosksChange={handleKiosksChange}
              selectedKioskIds={selectedKiosks}
              organizationId={currentAdminSession?.user?.organizationId}
              isLoading={isLoading}
              required={true}
            />

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-600 text-sm">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleBackToForm}
                disabled={isLoading}
                className="flex-1"
              >
                Back to Details
              </Button>
              <Button
                onClick={handleCreateCampaign}
                disabled={selectedKiosks.length === 0 || isLoading}
                className="flex-1"
              >
                {isLoading ? 'Creating Campaign...' : 'Create Campaign'}
              </Button>
            </div>
          </div>
        )}

        {/* Success Step */}
        {currentStep === 'success' && (
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-green-200 p-3">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-green-900 mb-2">
                  Campaign Created Successfully!
                </h2>
                <p className="text-green-700 mb-2">
                  Your campaign is now live and assigned to the selected kiosks.
                </p>
                <p className="text-sm text-green-600">
                  Campaign ID: <span className="font-mono font-bold">{createdCampaignId}</span>
                </p>
              </CardContent>
            </Card>

            {/* Campaign Summary */}
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Title:</span>
                    <span className="text-gray-900">{campaignData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Goal:</span>
                    <span className="text-gray-900">£{campaignData.goal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Status:</span>
                    <span className="text-gray-900 capitalize">{campaignData.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Assigned Kiosks:</span>
                    <span className="text-gray-900">{selectedKiosks.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/campaigns?id=${createdCampaignId}`)}
                className="flex-1"
              >
                View Campaign
              </Button>
              <Button
                onClick={handleGoToCampaignsList}
                className="flex-1"
              >
                Go to Campaigns List
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
