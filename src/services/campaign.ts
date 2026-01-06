import { Campaign } from '@/shared/types';
import { createCampaignWithImage, updateCampaign } from '@/shared/api/firestoreService';
import { DEFAULT_CAMPAIGN_CONFIG } from '@/shared/config';
import { storage } from '@/shared/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Timestamp } from 'firebase/firestore';

export interface CreateCampaignInput {
  title: string;
  description: string;
  goal: number;
  status: 'active' | 'paused' | 'completed';
  startDate: Date;
  endDate: Date;
  assignedKiosks?: string[];
  organizationId?: string;
  coverImageFile?: File;
}

export interface CampaignCreationResult {
  id: string;
  success: boolean;
  message: string;
  campaign?: Partial<Campaign>;
}

/**
 * Create a new campaign with the provided data
 * Includes image upload, kiosk assignment, and validation
 */
export async function createNewCampaign(
  input: CreateCampaignInput
): Promise<CampaignCreationResult> {
  try {
    // Validate required fields
    if (!input.title?.trim()) {
      throw new Error('Campaign title is required');
    }
    if (!input.description?.trim()) {
      throw new Error('Campaign description is required');
    }
    if (input.goal <= 0) {
      throw new Error('Campaign goal must be greater than 0');
    }
    if (!input.startDate) {
      throw new Error('Start date is required');
    }
    if (!input.endDate) {
      throw new Error('End date is required');
    }
    if (input.endDate <= input.startDate) {
      throw new Error('End date must be after start date');
    }

    // Prepare campaign data
    const campaignData: any = {
      title: input.title.trim(),
      description: input.description.trim(),
      goal: input.goal,
      raised: 0,
      status: input.status,
      startDate: input.startDate,
      endDate: input.endDate,
      assignedKiosks: input.assignedKiosks || [],
      organizationId: input.organizationId || 'ORG-DEFAULT',
      configuration: DEFAULT_CAMPAIGN_CONFIG,
      createdAt: Timestamp.now(),
      donationCount: 0,
      category: '',
      isGlobal: false,
      tags: [],
      coverImageUrl: '',
    };

    // Upload cover image if provided
    if (input.coverImageFile) {
      try {
        const imageUrl = await uploadCampaignImage(
          'new-campaign',
          input.coverImageFile
        );
        campaignData.coverImageUrl = imageUrl;
      } catch (imageError) {
        console.warn('Failed to upload campaign image:', imageError);
        // Continue without image rather than failing the whole creation
      }
    }

    // Create campaign in Firestore
    const newCampaign = await createCampaignWithImage(campaignData);

    return {
      id: newCampaign.id,
      success: true,
      message: 'Campaign created successfully',
      campaign: newCampaign,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create campaign';
    console.error('Campaign creation error:', error);
    return {
      id: '',
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * Update campaign with new kiosk assignments
 */
export async function updateCampaignKiosks(
  campaignId: string,
  kioskIds: string[]
): Promise<CampaignCreationResult> {
  try {
    if (!campaignId) {
      throw new Error('Campaign ID is required');
    }

    await updateCampaign(campaignId, {
      assignedKiosks: kioskIds,
    });

    return {
      id: campaignId,
      success: true,
      message: 'Campaign kiosks updated successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update campaign kiosks';
    console.error('Campaign kiosk update error:', error);
    return {
      id: campaignId,
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * Upload campaign cover image to Firebase Storage
 */
export async function uploadCampaignImage(
  campaignId: string,
  file: File
): Promise<string> {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const storageRef = ref(storage, `campaigns/${campaignId}/cover/${filename}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return downloadUrl;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
    console.error('Image upload error:', error);
    throw new Error(errorMessage);
  }
}

/**
 * Validate campaign data before submission
 */
export function validateCampaignData(input: CreateCampaignInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input.title?.trim()) {
    errors.push('Campaign title is required');
  } else if (input.title.length < 3) {
    errors.push('Title must be at least 3 characters');
  } else if (input.title.length > 100) {
    errors.push('Title must not exceed 100 characters');
  }

  if (!input.description?.trim()) {
    errors.push('Campaign description is required');
  } else if (input.description.length < 10) {
    errors.push('Description must be at least 10 characters');
  }

  if (input.goal <= 0) {
    errors.push('Campaign goal must be greater than 0');
  } else if (input.goal > 1000000) {
    errors.push('Campaign goal cannot exceed £1,000,000');
  }

  if (!input.startDate) {
    errors.push('Start date is required');
  }

  if (!input.endDate) {
    errors.push('End date is required');
  }

  if (input.startDate && input.endDate && input.endDate <= input.startDate) {
    errors.push('End date must be after start date');
  }

  if (input.assignedKiosks && input.assignedKiosks.length === 0) {
    errors.push('Please select at least one kiosk');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
