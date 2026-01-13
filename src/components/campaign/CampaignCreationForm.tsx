'use client';

import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { AlertCircle, Plus, CheckCircle, Clock, Target, Image as ImageIcon, DollarSign, Settings } from 'lucide-react';

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

  // Tab configuration with icons and completion status
  const tabs = [
    {
      id: 'basic-info' as FormTab,
      label: 'Basic Info',
      icon: Target,
      description: 'Campaign details',
      isComplete: formData.title && formData.briefOverview && formData.detailedStory,
    },
    {
      id: 'media-gallery' as FormTab,
      label: 'Media',
      icon: ImageIcon,
      description: 'Images & videos',
      isComplete: previewImage || formData.coverImage,
    },
    {
      id: 'funding-details' as FormTab,
      label: 'Funding',
      icon: DollarSign,
      description: 'Goals & dates',
      isComplete: formData.fundraisingTarget > 0 && formData.startDate && formData.endDate,
    },
    {
      id: 'kiosk-distribution' as FormTab,
      label: 'Distribution',
      icon: Settings,
      description: 'Kiosk settings',
      isComplete: true, // Optional section
    },
  ];

  // Calculate overall progress
  const completedTabs = tabs.filter(tab => tab.isComplete).length;
  const progressPercentage = (completedTabs / tabs.length) * 100;
  // Validation utilities
  const isValidUrl = (url: string): boolean => {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Campaign title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Campaign title must be at least 3 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Campaign title must not exceed 100 characters';
    }

    // Brief overview validation
    if (!formData.briefOverview.trim()) {
      newErrors.briefOverview = 'Brief overview is required';
    } else if (formData.briefOverview.trim().length < 10) {
      newErrors.briefOverview = 'Brief overview must be at least 10 characters';
    } else if (formData.briefOverview.trim().length > 500) {
      newErrors.briefOverview = 'Brief overview must not exceed 500 characters';
    }

    // Detailed story validation
    if (!formData.detailedStory.trim()) {
      newErrors.detailedStory = 'Detailed story is required';
    } else if (formData.detailedStory.trim().length < 20) {
      newErrors.detailedStory = 'Detailed story must be at least 20 characters';
    } else if (formData.detailedStory.trim().length > 5000) {
      newErrors.detailedStory = 'Detailed story must not exceed 5000 characters';
    }

    // Start date validation
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else if (!isValidDate(formData.startDate)) {
      newErrors.startDate = 'Invalid start date format';
    } else {
      const startDate = new Date(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
    }

    // End date validation
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (!isValidDate(formData.endDate)) {
      newErrors.endDate = 'Invalid end date format';
    }

    // Date range validation
    if (formData.startDate && formData.endDate && isValidDate(formData.startDate) && isValidDate(formData.endDate)) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const minDuration = 7; // Minimum 7 days campaign duration
      const daysDifference = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      } else if (daysDifference < minDuration) {
        newErrors.endDate = `Campaign must run for at least ${minDuration} days`;
      } else if (daysDifference > 365) {
        newErrors.endDate = 'Campaign duration cannot exceed 365 days';
      }
    }

    // Fundraising target validation
    if (!formData.fundraisingTarget || formData.fundraisingTarget <= 0) {
      newErrors.fundraisingTarget = 'Fundraising target is required and must be greater than $0';
    } else if (formData.fundraisingTarget > 999999999) {
      newErrors.fundraisingTarget = 'Fundraising target must not exceed $999,999,999';
    }

    // Donation tiers validation (optional but if provided, must be valid)
    const validTiers = formData.donationTiers.filter(tier => tier.trim());
    if (validTiers.length > 0) {
      validTiers.forEach((tier, index) => {
        const amount = parseFloat(tier);
        if (isNaN(amount) || amount <= 0) {
          newErrors[`tier-${index}`] = 'Donation tier must be a valid amount greater than $0';
        }
      });
    }

    // Cover image validation
    if (!previewImage && !formData.coverImage) {
      newErrors.coverImage = 'Campaign cover image is required';
    }

    // YouTube URL validation (optional)
    if (formData.youtubePresentation && !isValidUrl(formData.youtubePresentation)) {
      newErrors.youtubePresentation = 'Please enter a valid YouTube URL';
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

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll left sidebar based on active tab
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      const activeButton = scrollContainerRef.current.querySelector(
        `button[data-tab="${activeTab}"]`
      );
      if (activeButton) {
        activeButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeTab]);
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-6">
        {/* Enhanced Left Sidebar - Navigation */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="sticky top-6">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-gray-900">Campaign Setup</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const isComplete = tab.isComplete;

                    return (
                      <button
                        key={tab.id}
                        data-tab={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
                          isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 ${
                              isActive ? 'bg-blue-500' : isComplete ? 'bg-green-100' : 'bg-gray-100'
                            }`}
                          >
                            {isComplete && !isActive ? (
                              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Icon
                                className={`w-3.5 h-3.5 ${
                                  isActive 
                                    ? 'text-white'
                                    : isComplete
                                      ? 'text-green-600'
                                      : 'text-gray-500'
                                }`}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`font-medium text-xs ${isActive ? 'text-white' : 'text-gray-900'}`}
                            >
                              {tab.label}
                            </div>
                            <div className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                              {tab.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Enhanced Right Content - Form */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {tabs.find(tab => tab.id === activeTab)?.label}
                  </CardTitle>
                  <p className="text-gray-600 text-sm mt-1">
                    {tabs.find(tab => tab.id === activeTab)?.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {tabs.find(tab => tab.id === activeTab)?.isComplete ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Complete
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Clock className="w-3 h-3 mr-1" />
                      In Progress
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info Tab */}
                {activeTab === 'basic-info' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">Campaign Information</h3>
                      <p className="text-sm text-blue-700">
                        Provide the essential details about your campaign that will be displayed to potential donors.
                      </p>
                    </div>

                    {/* Campaign Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium text-gray-900">
                        Campaign Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        placeholder="e.g. Clean Water Initiative"
                        value={formData.title}
                        maxLength={100}
                        onChange={e => handleInputChange(e, 'title')}
                        className={`h-12 text-base ${errors.title ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                        aria-invalid={!!errors.title}
                        aria-describedby={errors.title ? 'title-error' : undefined}
                      />
                      <div className="flex justify-between items-start">
                        {errors.title && (
                          <p id="title-error" className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.title}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">{formData.title.length}/100</p>
                      </div>
                    </div>
                    {/* Brief Overview */}
                    <div className="space-y-2">
                      <Label htmlFor="briefOverview" className="text-sm font-medium text-gray-900">
                        Brief Overview <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="briefOverview"
                        placeholder="Short summary for kiosk list cards (10-500 characters)..."
                        value={formData.briefOverview}
                        maxLength={500}
                        onChange={e => handleInputChange(e, 'briefOverview')}
                        rows={3}
                        className={`text-base resize-none ${errors.briefOverview ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                        aria-invalid={!!errors.briefOverview}
                        aria-describedby={errors.briefOverview ? 'overview-error' : undefined}
                      />
                      <div className="flex justify-between items-start">
                        {errors.briefOverview && (
                          <p id="overview-error" className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.briefOverview}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">{formData.briefOverview.length}/500</p>
                      </div>
                    </div>

                    {/* Detailed Campaign Story */}
                    <div className="space-y-2">
                      <Label htmlFor="detailedStory" className="text-sm font-medium text-gray-900">
                        Detailed Campaign Story <span className="text-red-500">*</span>
                      </Label>
                      <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500">
                        <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-200">
                          <button
                            type="button"
                            className="font-bold text-gray-700 hover:bg-gray-200 px-2 py-1 rounded text-sm"
                            title="Bold text"
                          >
                            B
                          </button>
                          <div className="w-px h-6 bg-gray-300" />
                          <button
                            type="button"
                            className="text-gray-700 hover:bg-gray-200 px-2 py-1 rounded text-sm"
                            title="Divider"
                          >
                            ━━
                          </button>
                        </div>
                        <Textarea
                          id="detailedStory"
                          placeholder="Tell the story of your campaign (minimum 20 characters)..."
                          value={formData.detailedStory}
                          maxLength={5000}
                          onChange={e => handleInputChange(e, 'detailedStory')}
                          rows={6}
                          className={`border-0 rounded-none focus:ring-0 text-base resize-none ${
                            errors.detailedStory ? 'border-red-500 focus:border-red-500' : ''
                          }`}
                          aria-invalid={!!errors.detailedStory}
                          aria-describedby={errors.detailedStory ? 'story-error' : undefined}
                        />
                      </div>
                      <div className="flex justify-between items-start">
                        {errors.detailedStory && (
                          <p id="story-error" className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.detailedStory}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">{formData.detailedStory.length}/5000</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Media & Gallery Tab */}
                {activeTab === 'media-gallery' && (
                  <div className="space-y-6">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-purple-900 mb-2">Visual Identity</h3>
                      <p className="text-sm text-purple-700">
                        Add compelling visuals to make your campaign stand out and engage donors effectively.
                      </p>
                    </div>

                    {/* Primary Cover Image */}
                    <div className="space-y-3">
                      <Label htmlFor="coverImage" className="text-sm font-medium text-gray-900">
                        Primary Cover Image (16:9) <span className="text-red-500">*</span>
                      </Label>

                      {previewImage ? (
                        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={previewImage}
                            alt="Campaign cover preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeCoverImage}
                            className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            aria-label="Remove cover image"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="coverImage"
                          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm font-medium text-gray-700 mb-1">CLICK TO UPLOAD COVER</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                          </div>
                          <input
                            id="coverImage"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                            aria-label="Upload cover image"
                          />
                        </label>
                      )}

                      {errors.coverImage && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.coverImage}
                        </p>
                      )}
                    </div>
                    {/* Campaign Gallery */}
                    <div className="space-y-3">
                      <Label htmlFor="gallery" className="text-sm font-medium text-gray-900">
                        Campaign Gallery (Optional)
                      </Label>
                      <div className="space-y-4">
                        {galleryPreviews.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {galleryPreviews.map((preview, index) => (
                              <div key={index} className="relative group aspect-square">
                                <img
                                  src={preview}
                                  alt={`Gallery ${index + 1}`}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeGalleryImage(index)}
                                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                  aria-label={`Remove gallery image ${index + 1}`}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <label
                          htmlFor="gallery"
                          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-4 pb-4">
                            <Plus className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-700">ADD IMAGES</p>
                            <p className="text-xs text-gray-500">Multiple files supported</p>
                          </div>
                          <input
                            id="gallery"
                            type="file"
                            multiple
                            className="hidden"
                            accept="image/*"
                            onChange={handleGalleryUpload}
                            aria-label="Upload gallery images"
                          />
                        </label>
                      </div>
                    </div>

                    {/* YouTube Presentation */}
                    <div className="space-y-2">
                      <Label htmlFor="youtube" className="text-sm font-medium text-gray-900">
                        YouTube Presentation (Optional)
                      </Label>
                      <Input
                        id="youtube"
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={formData.youtubePresentation}
                        onChange={e => handleInputChange(e, 'youtubePresentation')}
                        className={`h-12 text-base ${errors.youtubePresentation ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                        aria-invalid={!!errors.youtubePresentation}
                        aria-describedby={errors.youtubePresentation ? 'youtube-error' : undefined}
                      />
                      {errors.youtubePresentation && (
                        <p id="youtube-error" className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.youtubePresentation}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">Accepted format: youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID</p>
                    </div>
                  </div>
                )}
                {/* Funding Details Tab */}
                {activeTab === 'funding-details' && (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-green-900 mb-2">Financial Goals</h3>
                      <p className="text-sm text-green-700">
                        Set your fundraising target and campaign duration to help donors understand your goals.
                      </p>
                    </div>

                    {/* Fundraising Target and Donation Tiers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="sm:col-span-2 lg:col-span-1">
                        <Label htmlFor="target" className="text-sm font-medium text-gray-900 mb-2 block">
                          Fundraising Target ($) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="target"
                          type="number"
                          placeholder="1000"
                          value={formData.fundraisingTarget || ''}
                          onChange={e => handleInputChange(e, 'fundraisingTarget')}
                          min="1"
                          step="100"
                          className={`h-12 text-base ${errors.fundraisingTarget ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                          aria-invalid={!!errors.fundraisingTarget}
                          aria-describedby={errors.fundraisingTarget ? 'target-error' : undefined}
                        />
                        {errors.fundraisingTarget && (
                          <p id="target-error" className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.fundraisingTarget}
                          </p>
                        )}
                      </div>

                      {/* Donation Tiers */}
                      {[0, 1, 2].map(index => (
                        <div key={index}>
                          <Label htmlFor={`tier-${index}`} className="text-sm font-medium text-gray-900 mb-2 block">
                            Tier {index + 1} (Optional)
                          </Label>
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-2 text-base">$</span>
                            <Input
                              id={`tier-${index}`}
                              type="number"
                              placeholder={['50', '100', '250'][index]}
                              value={formData.donationTiers[index]}
                              onChange={e => handleDonationTierChange(index, e.target.value)}
                              min="0"
                              step="1"
                              className={`h-12 text-base ${
                                errors[`tier-${index}`] ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                              }`}
                              aria-invalid={!!errors[`tier-${index}`]}
                            />
                          </div>
                          {errors[`tier-${index}`] && (
                            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors[`tier-${index}`]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Campaign Duration */}
                    <div className="space-y-4 border-t border-gray-200 pt-6">
                      <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-1">Campaign Duration <span className="text-red-500">*</span></h4>
                        <p className="text-sm text-gray-600">Campaign must run for at least 7 days and maximum 365 days</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="startDate" className="text-sm font-medium text-gray-900">
                            Start Date
                          </Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={e => handleInputChange(e, 'startDate')}
                            className={`h-12 text-base ${errors.startDate ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                            aria-invalid={!!errors.startDate}
                            aria-describedby={errors.startDate ? 'startdate-error' : undefined}
                          />
                          {errors.startDate && (
                            <p id="startdate-error" className="text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.startDate}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="endDate" className="text-sm font-medium text-gray-900">
                            End Date
                          </Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={e => handleInputChange(e, 'endDate')}
                            className={`h-12 text-base ${errors.endDate ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                            aria-invalid={!!errors.endDate}
                            aria-describedby={errors.endDate ? 'enddate-error' : undefined}
                          />
                          {errors.endDate && (
                            <p id="enddate-error" className="text-sm text-red-600 flex items-center gap-1">
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
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-teal-900 mb-2">Kiosk Distribution</h3>
                      <p className="text-sm text-teal-700">
                        Choose how your campaign will be distributed across kiosks in your network.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="flex items-start p-4 border-2 border-teal-500 rounded-lg cursor-pointer bg-teal-50 hover:bg-teal-100 transition-colors">
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
                          className="w-5 h-5 text-teal-600 mt-0.5 shrink-0"
                          aria-label="Broadcast globally"
                        />
                        <div className="ml-4 flex-1">
                          <p className="font-semibold text-teal-900 text-base">BROADCAST GLOBALLY</p>
                          <p className="text-sm text-teal-700 mt-1">Display on every active terminal worldwide</p>
                        </div>
                        {formData.kioskDistribution.includes('broadcast-globally') && (
                          <svg className="w-6 h-6 text-teal-600 shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                {/* Enhanced Form Actions */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200">
                  <Button 
                    variant="ghost" 
                    type="button" 
                    className="text-gray-600 hover:bg-gray-100 w-full sm:w-auto"
                    title="Save this campaign as draft for later"
                  >
                    <span className="flex items-center gap-2 justify-center sm:justify-start">
                      💾 <span>Save Draft</span>
                    </span>
                  </Button>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isLoading}
                      className="flex-1 sm:flex-none text-gray-700 h-12 px-6 border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isFormValid || isLoading}
                      className="flex-1 sm:flex-none bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-12 px-8 font-semibold"
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