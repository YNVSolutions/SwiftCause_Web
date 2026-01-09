'use client';

import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { AlertCircle, Upload, Plus, Trash2, Bold } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';

interface CampaignFormData {
  title: string;
  briefOverview: string;
  detailedStory: string;
  coverImage?: File | null;
  coverImageUrl?: string;
  campaignGallery: File[];
  youtubePresentation: string;
  fundraisingTarget: number;
  donationTiers: [string, string, string];
  startDate: string;
  endDate: string;
  kioskDistribution: string[];
}

interface ValidationErrors {
  [key: string]: string;
}

type FormTab = 'basic-info' | 'media-gallery' | 'funding-details' | 'kiosk-distribution';

interface CampaignCreationFormProps {
  onSubmit: (data: CampaignFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<CampaignFormData>;
}

export const CampaignCreationForm: React.FC<CampaignCreationFormProps> = ({
  onSubmit,
  isLoading = false,
  initialData = {},
}) => {
  const [formData, setFormData] = useState<CampaignFormData>({
    title: initialData.title || '',
    briefOverview: initialData.briefOverview || '',
    detailedStory: initialData.detailedStory || '',
    coverImage: null,
    coverImageUrl: initialData.coverImageUrl || '',
    campaignGallery: [],
    youtubePresentation: initialData.youtubePresentation || '',
    fundraisingTarget: initialData.fundraisingTarget || 1000,
    donationTiers: ['', '', ''],
    startDate: initialData.startDate || '',
    endDate: initialData.endDate || '',
    kioskDistribution: initialData.kioskDistribution || [],
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [previewImage, setPreviewImage] = useState<string>(initialData.coverImageUrl || '');
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<FormTab>('basic-info');

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Campaign title is required';
    }

    if (!formData.briefOverview.trim()) {
      newErrors.briefOverview = 'Brief overview is required';
    }

    if (!formData.detailedStory.trim()) {
      newErrors.detailedStory = 'Detailed story is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (!formData.fundraisingTarget || formData.fundraisingTarget <= 0) {
      newErrors.fundraisingTarget = 'Fundraising target must be greater than 0';
    }

    if (!previewImage && !formData.coverImage) {
      newErrors.coverImage = 'Campaign cover image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof CampaignFormData
  ) => {
    const value = field === 'fundraisingTarget' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleDonationTierChange = (index: number, value: string) => {
    const newTiers = [...formData.donationTiers] as [string, string, string];
    newTiers[index] = value;
    setFormData(prev => ({
      ...prev,
      donationTiers: newTiers,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        coverImage: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      if (errors.coverImage) {
        setErrors(prev => ({
          ...prev,
          coverImage: '',
        }));
      }
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setFormData(prev => ({
        ...prev,
        campaignGallery: [...prev.campaignGallery, ...newFiles],
      }));

      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalleryPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      campaignGallery: prev.campaignGallery.filter((_, i) => i !== index),
    }));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeCoverImage = () => {
    setPreviewImage('');
    setFormData(prev => ({
      ...prev,
      coverImage: null,
      coverImageUrl: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to submit campaign:', error);
    }
  };

  const isFormValid =
    formData.title.trim() &&
    formData.briefOverview.trim() &&
    formData.detailedStory.trim() &&
    formData.startDate &&
    formData.endDate &&
    formData.fundraisingTarget > 0 &&
    (previewImage || formData.coverImage);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Navigation */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Campaign
            </h3>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Configuration</p>

            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('basic-info')}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'basic-info'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Basic Info
              </button>
              <button
                onClick={() => setActiveTab('media-gallery')}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'media-gallery'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Media & Gallery
              </button>
              <button
                onClick={() => setActiveTab('funding-details')}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'funding-details'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Funding Details
              </button>
              <button
                onClick={() => setActiveTab('kiosk-distribution')}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'kiosk-distribution'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Kiosk Distribution
              </button>
            </div>
          </div>
        </div>

        {/* Right Content - Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">New Initiative</CardTitle>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 text-xl"
                  onClick={() => {
                    /* Handle close */
                  }}
                >
                  ✕
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Tab */}
                {activeTab === 'basic-info' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">General Information</h3>

                    {/* Campaign Title */}
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
                        Campaign Title
                      </Label>
                      <Input
                        id="title"
                        placeholder="e.g. Clean Water Initiative"
                        value={formData.title}
                        onChange={e => handleInputChange(e, 'title')}
                        className={`w-full ${errors.title ? 'border-red-500' : ''}`}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Brief Overview */}
                    <div>
                      <Label htmlFor="briefOverview" className="text-sm font-medium text-gray-700 mb-2 block">
                        Brief Overview
                      </Label>
                      <Textarea
                        id="briefOverview"
                        placeholder="Short summary for kiosk list cards..."
                        value={formData.briefOverview}
                        onChange={e => handleInputChange(e, 'briefOverview')}
                        rows={3}
                        className={`w-full ${errors.briefOverview ? 'border-red-500' : ''}`}
                      />
                      {errors.briefOverview && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.briefOverview}
                        </p>
                      )}
                    </div>

                    {/* Detailed Campaign Story */}
                    <div>
                      <Label htmlFor="detailedStory" className="text-sm font-medium text-gray-700 mb-2 block">
                        Detailed Campaign Story
                      </Label>
                      <div className="border border-gray-300 rounded-md overflow-hidden">
                        <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-300">
                          <button
                            type="button"
                            className="font-bold text-gray-700 hover:bg-gray-200 px-2 py-1 rounded text-sm"
                          >
                            B
                          </button>
                          <div className="w-px h-6 bg-gray-300" />
                          <button
                            type="button"
                            className="text-gray-700 hover:bg-gray-200 px-2 py-1 rounded text-sm"
                          >
                            DIVIDER
                          </button>
                        </div>
                        <Textarea
                          id="detailedStory"
                          placeholder="Tell the story of your campaign..."
                          value={formData.detailedStory}
                          onChange={e => handleInputChange(e, 'detailedStory')}
                          rows={8}
                          className="border-0 rounded-none focus:ring-0"
                        />
                      </div>
                      {errors.detailedStory && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.detailedStory}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Media & Gallery Tab */}
                {activeTab === 'media-gallery' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Visual Identity</h3>

                    {/* Primary Cover Image */}
                    <div>
                      <Label htmlFor="coverImage" className="text-sm font-medium text-gray-700 mb-2 block">
                        Primary Cover (16:9)
                      </Label>

                      {previewImage ? (
                        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
                          <img
                            src={previewImage}
                            alt="Campaign cover preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeCoverImage}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="coverImage"
                          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-gray-500">CLICK TO UPLOAD COVER</p>
                          </div>
                          <input
                            id="coverImage"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                      )}

                      {errors.coverImage && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.coverImage}
                        </p>
                      )}
                    </div>

                    {/* Campaign Gallery */}
                    <div>
                      <Label htmlFor="gallery" className="text-sm font-medium text-gray-700 mb-2 block">
                        Campaign Gallery
                      </Label>
                      <div className="space-y-4">
                        {galleryPreviews.length > 0 && (
                          <div className="grid grid-cols-3 gap-4">
                            {galleryPreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={preview}
                                  alt={`Gallery ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeGalleryImage(index)}
                                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <label
                          htmlFor="gallery"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Plus className="w-6 h-6 text-gray-400 mb-1" />
                            <p className="text-sm text-gray-500">ADD</p>
                          </div>
                          <input
                            id="gallery"
                            type="file"
                            multiple
                            className="hidden"
                            accept="image/*"
                            onChange={handleGalleryUpload}
                          />
                        </label>
                      </div>
                    </div>

                    {/* YouTube Presentation */}
                    <div>
                      <Label htmlFor="youtube" className="text-sm font-medium text-gray-700 mb-2 block">
                        YouTube Presentation
                      </Label>
                      <Input
                        id="youtube"
                        placeholder="https://youtube.com/..."
                        value={formData.youtubePresentation}
                        onChange={e => handleInputChange(e, 'youtubePresentation')}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {/* Funding Details Tab */}
                {activeTab === 'funding-details' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Financial Goals</h3>

                    {/* Fundraising Target */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="target" className="text-sm font-medium text-gray-700 mb-2 block">
                          Fundraising Target ($)
                        </Label>
                        <Input
                          id="target"
                          type="number"
                          placeholder="1000"
                          value={formData.fundraisingTarget || ''}
                          onChange={e => handleInputChange(e, 'fundraisingTarget')}
                          min="0"
                          step="100"
                          className={`w-full ${errors.fundraisingTarget ? 'border-red-500' : ''}`}
                        />
                        {errors.fundraisingTarget && (
                          <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.fundraisingTarget}
                          </p>
                        )}
                      </div>

                      {/* Donation Tiers */}
                      {[0, 1, 2].map(index => (
                        <div key={index}>
                          <Label htmlFor={`tier-${index}`} className="text-sm font-medium text-gray-700 mb-2 block">
                            Standard Donation Tiers
                          </Label>
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-2">$</span>
                            <Input
                              id={`tier-${index}`}
                              type="number"
                              placeholder="50"
                              value={formData.donationTiers[index]}
                              onChange={e => handleDonationTierChange(index, e.target.value)}
                              min="0"
                              step="1"
                              className="w-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Dates Section */}
                    <div className="space-y-4 border-t pt-6">
                      <h4 className="text-sm font-medium text-gray-700">Campaign Duration</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-2 block">
                            Start Date
                          </Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={e => handleInputChange(e, 'startDate')}
                            className={`w-full ${errors.startDate ? 'border-red-500' : ''}`}
                          />
                          {errors.startDate && (
                            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.startDate}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 mb-2 block">
                            End Date
                          </Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={e => handleInputChange(e, 'endDate')}
                            className={`w-full ${errors.endDate ? 'border-red-500' : ''}`}
                          />
                          {errors.endDate && (
                            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.endDate}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Kiosk Distribution Tab */}
                {activeTab === 'kiosk-distribution' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Kiosk Distribution</h3>
                    
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border-2 border-teal-500 rounded-lg cursor-pointer bg-teal-50 hover:bg-teal-100 transition">
                        <input
                          type="checkbox"
                          checked={formData.kioskDistribution.includes('broadcast-globally')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                kioskDistribution: [...prev.kioskDistribution, 'broadcast-globally'],
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                kioskDistribution: prev.kioskDistribution.filter(k => k !== 'broadcast-globally'),
                              }));
                            }
                          }}
                          className="w-5 h-5 text-teal-600"
                        />
                        <div className="ml-4 flex-1">
                          <p className="font-medium text-teal-900">BROADCAST GLOBALLY</p>
                          <p className="text-sm text-teal-700">DISPLAY ON EVERY ACTIVE TERMINAL</p>
                        </div>
                        {formData.kioskDistribution.includes('broadcast-globally') && (
                          <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button variant="ghost" type="button" className="text-gray-600">
                    <span className="flex items-center gap-2">
                      💾 Save Draft
                    </span>
                  </Button>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isLoading}
                      className="text-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isFormValid || isLoading}
                      className="bg-black text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Publishing...' : 'Publish Campaign'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
