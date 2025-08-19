import { useState, useCallback } from 'react';
import { useCampaigns } from './useCampaigns';

export function useCampaignManagement() {
  const { campaigns, updateWithImage, create, createWithImage, loading, error } = useCampaigns();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageSelect = useCallback((file: File) => {
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleImageUpload = useCallback(async (campaignId: string, campaignData: any) => {
    if (!selectedImage) return null;
    
    setUploadingImage(true);
    try {
      const updatedData = await updateWithImage(campaignId, campaignData, selectedImage);
      setImagePreview(updatedData.coverImageUrl);
      setSelectedImage(null);
      return updatedData;
    } catch (error) {
      throw error;
    } finally {
      setUploadingImage(false);
    }
  }, [selectedImage, updateWithImage]);

  const clearImageSelection = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
  }, []);

  const setImagePreviewUrl = useCallback((url: string | null) => {
    setImagePreview(url);
  }, []);

  return {
    campaigns,
    loading,
    error,
    uploadingImage,
    selectedImage,
    imagePreview,
    handleImageSelect,
    handleImageUpload,
    clearImageSelection,
    setImagePreviewUrl,
    updateWithImage,
    create,
    createWithImage
  };
}
