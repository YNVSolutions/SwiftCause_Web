"use client";

<<<<<<< HEAD
import React, { useState, useRef, useEffect } from 'react';
import type { Campaign, Kiosk } from '../../../shared/types';
import { useScrollSpy } from '../../../shared/lib/hooks/useScrollSpy';
import { kioskApi } from '../../../entities/kiosk/api';
=======
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Campaign } from '../../../shared/types';
>>>>>>> main

// UI Components
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Badge } from '../../../shared/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription, VisuallyHidden } from '../../../shared/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Textarea } from '../../../shared/ui/textarea';

import {
  Menu, X, Image, Save, Upload
} from 'lucide-react';

// Types for the form data
export interface CampaignFormData {
  title: string;
  description: string;
  goal: number;
  category: string;
  status: Campaign['status'];
  coverImageUrl: string;
  startDate: string;
  endDate: string;
  tags: string[];
}

export interface CampaignFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCampaign: Campaign | null;
  campaignData: CampaignFormData;
  setCampaignData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
  onSubmit: () => void;
  onCancel: () => void;
  formatCurrency: (amount: number) => string;
  onImageFileSelect?: (file: File | null) => void;
}

export function CampaignForm({
  open,
  onOpenChange,
  editingCampaign,
  campaignData,
  setCampaignData,
  onSubmit,
  onCancel,
<<<<<<< HEAD
  onImageFileSelect,
  onGalleryImagesSelect,
  organizationId,
  isSubmitting = false,
  isSavingDraft = false
=======
  formatCurrency,
  onImageFileSelect
>>>>>>> main
}: CampaignFormProps) {
  
  const [activeSection, setActiveSection] = useState('basic-info');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
<<<<<<< HEAD
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [loadingKiosks, setLoadingKiosks] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
=======
>>>>>>> main
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const basicInfoRef = useRef<HTMLElement>(null);
  const detailsRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLElement>(null);
  const sectionRefs = useMemo(
    () => ({
      'basic-info': basicInfoRef,
      details: detailsRef,
      media: mediaRef,
    }),
    [],
  );
  
  
  const navigationItems = [
    { id: 'basic-info', label: 'BASIC INFO' },
    { id: 'details', label: 'DETAILS' },
    { id: 'media', label: 'MEDIA' }
  ];

  // IntersectionObserver for scroll-synced sidebar highlighting
  useEffect(() => {
    if (!open) return;

    const timeoutId = setTimeout(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const now = Date.now();
          if (now - lastUpdateTimeRef.current < 100) {
            return;
          }
          
          const visibleSections = new Map<string, number>();
          
          entries.forEach((entry) => {
            if (entry.intersectionRatio > 0) {
              visibleSections.set(entry.target.id, entry.intersectionRatio);
            }
          });
          
          if (visibleSections.size === 0) return;
          
          let maxRatio = 0;
          let mostVisibleId = '';
          
          visibleSections.forEach((ratio, id) => {
            if (ratio > maxRatio) {
              maxRatio = ratio;
              mostVisibleId = id;
            }
          });
          
          setActiveSection(currentActive => {
            const currentRatio = visibleSections.get(currentActive) || 0;
            
            if (visibleSections.size === 1 && mostVisibleId) {
              lastUpdateTimeRef.current = now;
              return mostVisibleId;
            }
            
            if (currentRatio >= 0.4) {
              return currentActive;
            }
            
            if (maxRatio >= 0.5 && mostVisibleId !== currentActive && maxRatio > currentRatio + 0.15) {
              lastUpdateTimeRef.current = now;
              return mostVisibleId;
            }
            
            if (currentRatio < 0.1 && maxRatio >= 0.3) {
              lastUpdateTimeRef.current = now;
              return mostVisibleId;
            }
            
            return currentActive;
          });
        },
        {
          root: container,
          rootMargin: '-10% 0px -40% 0px',
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
        }
      );

      Object.values(sectionRefs).forEach((ref) => {
        if (ref.current) {
          observer.observe(ref.current);
        }
      });

      return () => {
        observer.disconnect();
      };
    }, 200);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [open, sectionRefs]);

  const scrollToSection = (sectionId: string) => {
    const sectionRef = sectionRefs[sectionId as keyof typeof sectionRefs];
    if (sectionRef?.current) {
      sectionRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      setActiveSection(sectionId);
    }
  };

  // Handle keyboard navigation
  const handleNavKeyDown = (event: React.KeyboardEvent, sectionId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      scrollToSection(sectionId);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setActiveSection('basic-info');
    setIsMobileSidebarOpen(false);
    setSelectedImageFile(null);
    setImagePreview(null);
  };

  // Handle image file selection
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      
      // Notify parent component
      if (onImageFileSelect) {
        onImageFileSelect(file);
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setCampaignData(p => ({ ...p, coverImageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    setCampaignData(p => ({ ...p, coverImageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Notify parent component
    if (onImageFileSelect) {
      onImageFileSelect(null);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-6xl p-0 border-0 shadow-2xl bg-white rounded-2xl overflow-hidden font-lexend h-[90vh] w-[95vw] sm:w-full flex flex-col [&>button]:hidden sm:[&>button]:flex">
        <VisuallyHidden>
          <DialogTitle>{editingCampaign ? 'Edit Campaign Configuration' : 'Campaign Setup Configuration'}</DialogTitle>
          <DialogDescription>
            {editingCampaign ? 'Modify the settings and configuration for this campaign' : 'Configure a new campaign with basic information, details, and media'}
          </DialogDescription>
        </VisuallyHidden>
        
        {/* Mobile Header - Fixed */}
        <div className="sm:hidden flex flex-col border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
          {/* Header with aligned controls and title */}
          <div className="flex items-center justify-between px-4 pt-3 pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-3 hover:bg-white/60 rounded-xl border border-gray-200/50 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </Button>
            
            {/* Centered Title Section */}
            <div className="text-center flex-1 mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{editingCampaign ? 'Edit Campaign' : 'Campaign Setup'}</h3>
              <p className="text-sm text-gray-600">Configuration</p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-3 hover:bg-white/60 rounded-xl border border-gray-200/50 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <X className="w-5 h-5 text-gray-700" />
            </Button>
          </div>
        </div>

        {/* Main Content Area - Flex container */}
        <div className="flex flex-col sm:flex-row flex-1 min-h-0">
          {/* Sidebar Navigation */}
          <nav 
            className={`${
              isMobileSidebarOpen ? 'block' : 'hidden'
            } sm:block w-full sm:w-72 bg-gradient-to-b from-gray-50 to-gray-100 sm:bg-gray-50 border-r border-gray-200 p-6 sm:p-8 absolute sm:relative z-10 sm:z-auto h-full sm:h-auto flex-shrink-0 shadow-xl sm:shadow-none`} 
            aria-label="Campaign setup navigation"
          >
            {/* Mobile Navigation Header */}
            <div className="sm:hidden mb-6 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Navigation</h3>
                <p className="text-sm text-gray-600 mt-1">Choose a section</p>
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden sm:block mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Campaign</h3>
              <p className="text-sm text-gray-500">Configuration</p>
            </div>
            
            <div className="relative">
              {/* Navigation Items */}
              <ul className="space-y-3 relative" role="list">
                {navigationItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        scrollToSection(item.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      onKeyDown={(e) => handleNavKeyDown(e, item.id)}
                      className={`w-full flex items-center gap-3 px-4 sm:px-5 py-4 rounded-xl cursor-pointer transition-all duration-200 text-left shadow-sm ${
                        activeSection === item.id 
                          ? 'bg-green-600 text-white shadow-lg shadow-green-600/25 border border-green-500' 
                          : 'text-gray-700 hover:bg-white hover:shadow-md border border-gray-200/50 bg-gray-50/50'
                      }`}
                      aria-current={activeSection === item.id ? 'step' : undefined}
                      tabIndex={0}
                    >
                      <div className="text-sm font-medium">{item.label}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Main Content Column - Flex container */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
            {/* Header - Fixed */}
            <header className="hidden sm:flex items-center justify-between p-6 lg:p-8 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="text-base text-gray-500 uppercase tracking-wide font-medium">
                  {editingCampaign ? 'EDIT • CAMPAIGN' : 'SETUP • NEW CAMPAIGN'}
                </div>
              </div>
            </header>

            {/* Scrollable Content Container - The only scroll area */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto min-h-0"
            >
              {/* Basic Information Section */}
              <section 
                id="basic-info"
                ref={sectionRefs['basic-info']}
                className="p-4 sm:p-6 lg:p-8 border-b border-gray-100"
              >
                <div className="max-w-4xl">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8">
                    Basic Information
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="lg:col-span-2">
                        <Label htmlFor="campaignTitle" className="text-sm font-medium text-gray-700 mb-2 block">
                          CAMPAIGN NAME
                        </Label>
                        <Input
                          id="campaignTitle"
                          value={campaignData.title}
                          onChange={(e) => setCampaignData(p => ({ ...p, title: e.target.value }))}
                          placeholder="e.g. Clean Water Initiative"
                          className="h-12 text-base border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="category" className="text-sm font-medium text-gray-700 mb-2 block">
                          CATEGORY
                        </Label>
                        <Input
                          id="category"
                          value={campaignData.category}
                          onChange={(e) => setCampaignData(p => ({ ...p, category: e.target.value }))}
                          placeholder="e.g. Health, Education, Environment"
                          className="h-12 text-base border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2 block">
                          STATUS
                        </Label>
                        <Select
                          value={campaignData.status}
                          onValueChange={(value) => setCampaignData(p => ({ ...p, status: value as Campaign['status'] }))}
                        >
                          <SelectTrigger className="h-12 text-base border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="goal" className="text-sm font-medium text-gray-700 mb-2 block">
                          GOAL AMOUNT
                        </Label>
                        <Input
                          id="goal"
                          type="number"
                          value={campaignData.goal || ''}
                          onChange={(e) => setCampaignData(p => ({ ...p, goal: parseFloat(e.target.value) || 0 }))}
                          placeholder="e.g. 50000"
                          className="h-12 text-base border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-2 block">
                          START DATE
                        </Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={campaignData.startDate}
                          onChange={(e) => setCampaignData(p => ({ ...p, startDate: e.target.value }))}
                          className="h-12 text-base border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 mb-2 block">
                          END DATE
                        </Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={campaignData.endDate}
                          onChange={(e) => setCampaignData(p => ({ ...p, endDate: e.target.value }))}
                          className="h-12 text-base border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Details Section */}
              <section 
                id="details"
                ref={sectionRefs['details']}
                className="p-4 sm:p-6 lg:p-8 border-b border-gray-100"
              >
                <div className="max-w-4xl">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8">
                    Details
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                        DESCRIPTION
                      </Label>
                      <Textarea
                        id="description"
                        value={campaignData.description}
                        onChange={(e) => setCampaignData(p => ({ ...p, description: e.target.value }))}
                        placeholder="Describe your campaign, its goals, and impact..."
                        className="min-h-[120px] text-base border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                        rows={6}
                      />
                    </div>

                    <div>
                      <Label htmlFor="tags" className="text-sm font-medium text-gray-700 mb-2 block">
                        TAGS (comma-separated)
                      </Label>
                      <Input
                        id="tags"
                        value={campaignData.tags.join(', ')}
                        onChange={(e) => setCampaignData(p => ({ 
                          ...p, 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                        }))}
                        placeholder="e.g. water, health, community"
                        className="h-12 text-base border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                      />
                      {campaignData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {campaignData.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="bg-green-100 text-green-700 text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Media Section */}
              <section 
                id="media"
                ref={sectionRefs['media']}
                className="p-4 sm:p-6 lg:p-8"
              >
                <div className="max-w-4xl">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8">
                    Media
                  </h2>
                  
                  {/* Cover Image Section */}
                  <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900">Cover Image</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileSelect}
                        className="hidden"
                      />

                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Label htmlFor="coverImageUrl" className="text-sm font-medium text-gray-700 mb-2 block">
                            IMAGE URL
                          </Label>
                          <Input
                            id="coverImageUrl"
                            value={campaignData.coverImageUrl}
                            onChange={(e) => setCampaignData(p => ({ ...p, coverImageUrl: e.target.value }))}
                            placeholder="https://example.com/image.jpg"
                            className="h-12 text-base border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            onClick={handleUploadClick}
                            variant="outline"
                            className="h-12 px-4 border-gray-300 hover:bg-gray-50"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </Button>
                        </div>
                      </div>

                      {/* Image Preview */}
                      {(campaignData.coverImageUrl || imagePreview) ? (
                        <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="aspect-video bg-white rounded-lg overflow-hidden flex items-center justify-center relative">
                            <img 
                              src={imagePreview || campaignData.coverImageUrl} 
                              alt="Campaign cover preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="flex flex-col items-center justify-center text-gray-400"><svg class="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="text-sm">Invalid image URL</p></div>';
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={handleRemoveImage}
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 h-8 w-8 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          {selectedImageFile && (
                            <p className="text-xs text-gray-500 mt-2">
                              Selected: {selectedImageFile.name} ({(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleUploadClick}
                          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-green-500 hover:bg-green-50 transition-colors cursor-pointer"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                          </div>
                          <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No image uploaded</h4>
                          <p className="text-gray-500 text-sm mb-2">Click to upload from device or enter URL above</p>
                          <p className="text-xs text-gray-400">JPG, PNG or WebP (max. 5MB)</p>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Image Guidelines */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Image Guidelines</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Recommended size: 1200x630 pixels</li>
                      <li>• Supported formats: JPG, PNG, WebP</li>
                      <li>• Maximum file size: 5MB</li>
                      <li>• Use high-quality images that represent your campaign</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer - Fixed */}
            <footer className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 lg:p-8 border-t border-gray-200 bg-gray-50 gap-4 sm:gap-0 flex-shrink-0">
              <Button
                variant="ghost"
                onClick={onCancel}
                className="text-gray-600 hover:text-gray-800 w-full sm:w-auto h-12 sm:h-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                SAVE DRAFT
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto h-12 sm:h-auto"
                >
                  CANCEL
                </Button>
                <Button
                  onClick={onSubmit}
                  disabled={!campaignData.title || !campaignData.description || !campaignData.goal}
                  className="bg-black hover:bg-gray-800 text-white px-6 w-full sm:w-auto h-12 sm:h-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingCampaign ? 'UPDATE CAMPAIGN' : 'SAVE CAMPAIGN'}
                </Button>
              </div>
            </footer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
