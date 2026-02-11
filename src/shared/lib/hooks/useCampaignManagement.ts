import { useState, useCallback } from 'react';
import { useCampaigns } from '../../../entities/campaign/model/hooks';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, updateDoc, doc } from 'firebase/firestore';

export interface CampaignSaveData {
  title: string;
  briefOverview?: string;  // Maps to description in DB
  description: string;      // Maps to longDescription in DB
  goal: number;
  status: string;
  startDate: Date | string;
  endDate: Date | string;
  category: string;
  tags?: string[];
  coverImageUrl?: string;
  galleryImages?: string[];
  videoUrl?: string;
  organizationId?: string;
  isGlobal?: boolean;
  assignedKiosks?: string[];
  organizationInfoName?: string;
  organizationInfoDescription?: string;
  organizationInfoWebsite?: string;
  organizationInfoLogo?: string;
  [key: string]: any;
}

export interface SaveCampaignOptions {
  campaignId?: string;
  isUpdate?: boolean;
  organizationId: string;
  selectedOrganizationLogo?: File | null;
  onProgress?: (message: string) => void;
  onError?: (error: string) => void;
}

/**
 * Maps CampaignForm fields to database schema
 * briefOverview -> description (short summary for cards)
 * description -> longDescription (detailed campaign story)
 */
export function mapFormDataToDatabase(formData: any) {
  return {
    title: formData.title,
    description: formData.briefOverview || '',  // Brief overview goes to description
    longDescription: formData.description || '', // Detailed story goes to longDescription
    goal: Number(formData.goal),
    status: formData.status || 'active',
    category: formData.category || 'General',
    tags: Array.isArray(formData.tags) ? formData.tags : [],
    coverImageUrl: formData.coverImageUrl || '',
    videoUrl: formData.videoUrl || '',
    galleryImages: Array.isArray(formData.galleryImages) ? formData.galleryImages : [],
    isGlobal: formData.isGlobal || false,
    assignedKiosks: Array.isArray(formData.assignedKiosks) ? formData.assignedKiosks : [],
  };
}

export function useCampaignManagement(organizationId?: string) {
  const { campaigns, updateWithImage, create, createWithImage, loading, error, remove } = useCampaigns(organizationId);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedGalleryImages, setSelectedGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const uploadFile = useCallback(async (file: File, path: string) => {
    if (!file) return null;
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytes(storageRef, file);

    try {
      const snapshot = await uploadTask;
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload file.");
    }
  }, []);

  const handleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGalleryImagesSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      
      // Limit to a maximum of 4 images total
      if (newFiles.length > 4) {
        alert("You can only upload a maximum of 4 gallery images.");
        return;
      }

      // Replace the entire array (don't append) since CampaignForm sends all files
      setSelectedGalleryImages(newFiles);
      
      // Create previews for all files
      setGalleryPreviews([]); // Clear existing previews first
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setGalleryPreviews((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  }, []);

  const handleImageUpload = useCallback(async (campaignId: string, campaignData: CampaignSaveData) => {
    if (!selectedImage) return null;
    
    setUploadingImage(true);
    try {
      const filePath = `campaigns/${campaignId}/coverImage/${selectedImage.name}`;
      const downloadURL = await uploadFile(selectedImage, filePath);

      let updatedData: Record<string, unknown>;
      if (campaignId) {
        updatedData = await updateWithImage(campaignId, { ...campaignData, coverImageUrl: downloadURL });
      } else {
        updatedData = await createWithImage({ ...campaignData, coverImageUrl: downloadURL });
      }
      
      const coverImageUrl = updatedData.coverImageUrl as string;
      setImagePreview(coverImageUrl);
      setImagePreview(updatedData.coverImageUrl || null);
      setSelectedImage(null);
      return { ...updatedData, coverImageUrl };
    } catch (error) {
      throw error;
    } finally {
      setUploadingImage(false);
    }
  }, [selectedImage, updateWithImage, uploadFile, createWithImage]);

  const handleGalleryImagesUpload = useCallback(async (campaignId: string, existingGalleryUrls: string[] = []) => {
    if (selectedGalleryImages.length === 0) return existingGalleryUrls;
    
    setUploadingGallery(true);
    try {
      const uploadedUrls: string[] = [];
      
      for (const file of selectedGalleryImages) {
        try {
          const filePath = `campaigns/${campaignId}/galleryImages/${file.name}`;
          const downloadURL = await uploadFile(file, filePath);
          if (downloadURL) {
            uploadedUrls.push(downloadURL);
          }
        } catch (error) {
          console.error(`Error uploading gallery image ${file.name}:`, error);
        }
      }
      
      const finalGalleryUrls = [...existingGalleryUrls, ...uploadedUrls];
      setGalleryPreviews(finalGalleryUrls);
      setSelectedGalleryImages([]);
      
      return finalGalleryUrls;
    } catch (error) {
      console.error("Error uploading gallery images:", error);
      throw error;
    } finally {
      setUploadingGallery(false);
    }
  }, [selectedGalleryImages, uploadFile]);

  const removeGalleryImage = useCallback((index: number, existingUrls: string[]) => {
    const existingCount = existingUrls.length;
    
    if (index < existingCount) {
      // Removing an existing URL
      return existingUrls.filter((_, i) => i !== index);
    } else {
      // Removing a newly selected file
      const newIndex = index - existingCount;
      setSelectedGalleryImages((prev) => prev.filter((_, i) => i !== newIndex));
      setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
      return existingUrls;
    }
  }, []);

  const clearImageSelection = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
  }, []);

  const clearGallerySelection = useCallback(() => {
    setSelectedGalleryImages([]);
    setGalleryPreviews([]);
  }, []);

  const setImagePreviewUrl = useCallback((url: string | null) => {
    setImagePreview(url);
  }, []);

  const setGalleryPreviewUrls = useCallback((urls: string[]) => {
    setGalleryPreviews(urls);
  }, []);

  /**
   * Centralized campaign save function that handles:
   * - Cover image upload
   * - Gallery images upload
   * - Organization logo upload
   * - Campaign creation or update
   * - All validation and error handling
   */
  const saveCampaign = useCallback(async (
    campaignData: CampaignSaveData,
    options: SaveCampaignOptions
  ) => {
    const { campaignId, isUpdate, organizationId, selectedOrganizationLogo, onProgress, onError } = options;
    
    try {
      let finalData = { ...campaignData };
      let tempCampaignId = campaignId || `temp_${Date.now()}`;

      // Step 1: Upload cover image if selected
      if (selectedImage) {
        onProgress?.('Uploading cover image...');
        try {
          const filePath = `campaigns/${tempCampaignId}/coverImage/${selectedImage.name}`;
          const coverImageUrl = await uploadFile(selectedImage, filePath);
          if (coverImageUrl) {
            finalData.coverImageUrl = coverImageUrl;
          }
          clearImageSelection();
        } catch (error) {
          console.error('Error uploading cover image:', error);
          onError?.('Failed to upload cover image');
          throw error;
        }
      }

      // Step 2: Upload organization logo if provided
      if (selectedOrganizationLogo) {
        onProgress?.('Uploading organization logo...');
        try {
          const filePath = `campaigns/${tempCampaignId}/organizationLogo/${selectedOrganizationLogo.name}`;
          const logoUrl = await uploadFile(selectedOrganizationLogo, filePath);
          if (logoUrl) {
            finalData.organizationInfoLogo = logoUrl;
          }
        } catch (error) {
          console.error('Error uploading organization logo:', error);
          onError?.('Failed to upload organization logo');
          throw error;
        }
      }

      // Step 3: Upload gallery images if selected
      if (selectedGalleryImages.length > 0) {
        onProgress?.('Uploading gallery images...');
        try {
          const existingGalleryUrls = Array.isArray(finalData.galleryImages) 
            ? finalData.galleryImages 
            : [];
          
          const uploadedUrls: string[] = [];
          for (const file of selectedGalleryImages) {
            const filePath = `campaigns/${tempCampaignId}/galleryImages/${file.name}`;
            const url = await uploadFile(file, filePath);
            if (url) uploadedUrls.push(url);
          }
          
          finalData.galleryImages = [...existingGalleryUrls, ...uploadedUrls];
          clearGallerySelection();
        } catch (error) {
          console.error('Error uploading gallery images:', error);
          onError?.('Failed to upload gallery images');
          throw error;
        }
      }

      // Step 4: Prepare final campaign data
      const campaignPayload = {
        ...finalData,
        organizationId: organizationId,
        updatedAt: new Date(),
      };

      // Step 5: Create or update campaign
      if (isUpdate && campaignId) {
        onProgress?.('Updating campaign...');
        const campaignRef = doc(db, 'campaigns', campaignId);
        await updateDoc(campaignRef, campaignPayload);
        return { id: campaignId, ...campaignPayload };
      } else {
        onProgress?.('Creating campaign...');
        const newCampaignPayload = {
          ...campaignPayload,
          raised: 0,
          createdAt: new Date(),
        };
        const docRef = await addDoc(collection(db, 'campaigns'), newCampaignPayload);
        return { id: docRef.id, ...newCampaignPayload };
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      throw error;
    }
  }, [selectedImage, selectedGalleryImages, uploadFile, clearImageSelection, clearGallerySelection]);

  return {
    campaigns,
    loading,
    error,
    uploadingImage,
    uploadingGallery,
    selectedImage,
    imagePreview,
    selectedGalleryImages,
    galleryPreviews,
    handleImageSelect,
    handleGalleryImagesSelect,
    handleImageUpload,
    handleGalleryImagesUpload,
    removeGalleryImage,
    clearImageSelection,
    clearGallerySelection,
    setImagePreviewUrl,
    setGalleryPreviewUrls,
    updateWithImage,
    create,
    createWithImage,
    uploadFile,
    remove,
    saveCampaign, // New centralized save function
  };
}
