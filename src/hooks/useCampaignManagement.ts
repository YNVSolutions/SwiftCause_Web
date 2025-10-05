import { useState, useCallback } from 'react';
import { useCampaigns } from './useCampaigns';
import { storage } from '../lib/firebase'; // Import storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import storage functions

export function useCampaignManagement(organizationId?: string) {
  const { campaigns, updateWithImage, create, createWithImage, loading, error, remove } = useCampaigns(organizationId);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File, path: string) => {
    if (!file) return null;
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytes(storageRef, file);

    try {
      const snapshot = await uploadTask;
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      throw new Error("Failed to upload file.");
    }
  }, []);

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
      const filePath = `campaigns/${campaignId}/coverImage/${selectedImage.name}`;
      const downloadURL = await uploadFile(selectedImage, filePath);

      let updatedData;
      if (campaignId) {
        updatedData = await updateWithImage(campaignId, { ...campaignData, coverImageUrl: downloadURL });
      } else {
        updatedData = await createWithImage({ ...campaignData, coverImageUrl: downloadURL });
      }
      setImagePreview(updatedData.coverImageUrl);
      setSelectedImage(null);
      return updatedData;
    } catch (error) {
      throw error;
    } finally {
      setUploadingImage(false);
    }
  }, [selectedImage, updateWithImage, uploadFile]);

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
    createWithImage,
    uploadFile,
    remove // Exposed the remove function
  };
}
