'use client';

import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { AlertCircle, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';

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

interface ValidationErrors {
  [key: string]: string;
}

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
    startDate: initialData.startDate || '',
    endDate: initialData.endDate || '',
    goal: initialData.goal || 0,
    coverImage: null,
    coverImageUrl: initialData.coverImageUrl || '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [previewImage, setPreviewImage] = useState<string>(initialData.coverImageUrl || '');
  const [activeTab, setActiveTab] = useState('basic-info');

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

    if (!formData.goal || formData.goal <= 0) {
      newErrors.goal = 'Goal must be greater than 0';
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
    const value = field === 'goal' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        coverImage: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.coverImage) {
        setErrors(prev => ({
          ...prev,
          coverImage: '',
        }));
      }
    }
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
    formData.goal > 0 &&
    (previewImage || formData.coverImage);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Navigation */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
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
                onClick={() => setActiveTab('funding')}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'funding'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Funding Details
              </button>
              <button
                onClick={() => setActiveTab('kiosk')}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'kiosk'
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
                <div>
                  <CardTitle className="text-2xl">New Initiative</CardTitle>
                </div>
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
                      <Label
                        htmlFor="briefOverview"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
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
                      <Label
                        htmlFor="detailedStory"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Detailed Campaign Story
                      </Label>
                      <div className="border border-gray-300 rounded-md overflow-hidden">
                        <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-300">
                          <button type="button" className="font-bold text-gray-700 hover:bg-gray-200 px-2 py-1 rounded">
                            B
                          </button>
                          <div className="w-px h-6 bg-gray-300" />
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
                      <Label
                        htmlFor="coverImage"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
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
                            onClick={() => {
                              setPreviewImage('');
                              setFormData(prev => ({
                                ...prev,
                                coverImage: null,
                                coverImageUrl: '',
                              }));
                            }}
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
                            <Upload className="w-10 h-10 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
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
                  </div>
                )}

                {/* Funding Details Tab */}
                {activeTab === 'funding' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Funding Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Start Date */}
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

                      {/* End Date */}
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

                      {/* Funding Goal */}
                      <div className="md:col-span-2">
                        <Label htmlFor="goal" className="text-sm font-medium text-gray-700 mb-2 block">
                          Funding Goal (£)
                        </Label>
                        <Input
                          id="goal"
                          type="number"
                          placeholder="0.00"
                          value={formData.goal || ''}
                          onChange={e => handleInputChange(e, 'goal')}
                          min="0"
                          step="0.01"
                          className={`w-full ${errors.goal ? 'border-red-500' : ''}`}
                        />
                        {errors.goal && (
                          <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.goal}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Kiosk Distribution Tab */}
                {activeTab === 'kiosk' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Kiosk Distribution</h3>
                    <p className="text-gray-600">Kiosk assignment will be handled in sub-issue #336</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700">
                        Kiosk assignment UI will be implemented in the next phase.
                      </p>
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
