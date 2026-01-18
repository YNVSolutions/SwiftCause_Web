import React, { useEffect, useState, useRef } from "react";
import { Screen, AdminSession, Permission, Kiosk } from "../../shared/types";
import { DEFAULT_CAMPAIGN_CONFIG } from "../../shared/config";
import { DocumentData, Timestamp } from "firebase/firestore";
import { useCampaignManagement } from "../../shared/lib/hooks/useCampaignManagement";
import { useOrganizationTags } from "../../shared/lib/hooks/useOrganizationTags";
import { kioskApi } from "../../entities/kiosk/api";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Textarea } from "../../shared/ui/textarea";
import { normalizeAssignments, syncKiosksForCampaign } from "../../shared/lib/sync/campaignKioskSync";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../shared/ui/dialog";
import { Badge } from "../../shared/ui/badge";
import { Save } from "lucide-react";
import {
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";
import { Plus, RefreshCw, MoreVertical } from "lucide-react";
import { AlertTriangle } from "lucide-react"; // Import AlertTriangle
import { Skeleton } from "../../shared/ui/skeleton";
import { Ghost } from "lucide-react";
import { ImageWithFallback } from "../../shared/ui/figma/ImageWithFallback";

import { AdminLayout } from "./AdminLayout";
import {
  Card,
  CardContent,
} from "../../shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../shared/ui/table";
import { useOrganization } from "../../shared/lib/hooks/useOrganization";
import { useStripeOnboarding, StripeOnboardingDialog } from "../../features/stripe-onboarding";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../shared/ui/dropdown-menu";
import { AdminSearchFilterHeader, AdminSearchFilterConfig } from "./components/AdminSearchFilterHeader";
import { SortableTableHeader } from "./components/SortableTableHeader";
import { useTableSort } from "../../shared/lib/hooks/useTableSort";
import { CampaignForm, CampaignFormData } from "./components/CampaignForm";
import { Campaign } from "../../shared/types";

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: DocumentData | null; // Optional campaign for editing
  organizationId: string; // Add organizationId prop
  onSave: (
    data: DocumentData,
    isNew: boolean,
    campaignId?: string
  ) => Promise<void>;
}

type CampaignTab = "basic" | "media-gallery" | "funding-details" | "kiosk-distribution";

const getInitialFormData = () => ({
  title: "",
  description: "",
  status: "active",
  goal: 0,
  tags: [],
  startDate: "",
  endDate: "",
  coverImageUrl: "",
  // New fields for advanced settings (initial subset)
  category: "",
  organizationId: "",
  longDescription: "",
  videoUrl: "",
  // Adding more fields for advanced settings
  assignedKiosks: "", // Stored as comma-separated string
  selectedKiosks: [] as string[], // Array of kiosk IDs
  isGlobal: false,
  galleryImages: "", // Stored as comma-separated string
  organizationInfoName: "",
  organizationInfoDescription: "",
  organizationInfoWebsite: "",
  organizationInfoLogo: "",
  impactMetricsPeopleHelped: 0,
  impactMetricsItemsProvided: 0,
  impactMetricsCustomMetricLabel: "",
  impactMetricsCustomMetricValue: 0,
  impactMetricsCustomMetricUnit: "",

  // CampaignConfiguration fields - flattened for form handling (initial subset)
  predefinedAmounts: DEFAULT_CAMPAIGN_CONFIG.predefinedAmounts.join(","),
  allowCustomAmount: DEFAULT_CAMPAIGN_CONFIG.allowCustomAmount,
  minCustomAmount: DEFAULT_CAMPAIGN_CONFIG.minCustomAmount,
  maxCustomAmount: DEFAULT_CAMPAIGN_CONFIG.maxCustomAmount,
  // Adding more CampaignConfiguration fields
  suggestedAmounts: DEFAULT_CAMPAIGN_CONFIG.suggestedAmounts.join(","),
  enableRecurring: DEFAULT_CAMPAIGN_CONFIG.enableRecurring,
  recurringIntervals: DEFAULT_CAMPAIGN_CONFIG.recurringIntervals.join(","),
  defaultRecurringInterval: DEFAULT_CAMPAIGN_CONFIG.defaultRecurringInterval,
  recurringDiscount: DEFAULT_CAMPAIGN_CONFIG.recurringDiscount,
  // Adding Display Settings fields
  displayStyle: DEFAULT_CAMPAIGN_CONFIG.displayStyle,
  showProgressBar: DEFAULT_CAMPAIGN_CONFIG.showProgressBar,
  showDonorCount: DEFAULT_CAMPAIGN_CONFIG.showDonorCount,
  showRecentDonations: DEFAULT_CAMPAIGN_CONFIG.showRecentDonations,
  maxRecentDonations: DEFAULT_CAMPAIGN_CONFIG.maxRecentDonations,
  // Adding Call-to-Action fields
  primaryCTAText: DEFAULT_CAMPAIGN_CONFIG.primaryCTAText,
  secondaryCTAText: DEFAULT_CAMPAIGN_CONFIG.secondaryCTAText || "",
  urgencyMessage: "",
  // Adding Visual Customization fields
  accentColor: "#4F46E5",
  backgroundImage: "",
  theme: DEFAULT_CAMPAIGN_CONFIG.theme,
  // Adding Form Configuration fields
  requiredFields: DEFAULT_CAMPAIGN_CONFIG.requiredFields.join(","),
  optionalFields: DEFAULT_CAMPAIGN_CONFIG.optionalFields.join(","),
  enableAnonymousDonations: DEFAULT_CAMPAIGN_CONFIG.enableAnonymousDonations,
  // Adding Social Features fields
  enableSocialSharing: DEFAULT_CAMPAIGN_CONFIG.enableSocialSharing,
  shareMessage: "",
  enableDonorWall: DEFAULT_CAMPAIGN_CONFIG.enableDonorWall,
  enableComments: DEFAULT_CAMPAIGN_CONFIG.enableComments,
});

const CampaignDialog = ({
  open,
  onOpenChange,
  campaign,
  organizationId,
  onSave,
}: CampaignDialogProps) => {
  const [formData, setFormData] = useState<DocumentData>(getInitialFormData());
  const [activeTab, setActiveTab] = useState<CampaignTab>("basic");
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [loadingKiosks, setLoadingKiosks] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Track scroll to update active tab automatically
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const centerPoint = scrollTop + containerHeight / 3;

      // Find the section closest to center of view
      const basicInfoSection = container.querySelector('[data-section="basic"]') as HTMLElement;
      const mediaSection = container.querySelector('[data-section="media-gallery"]') as HTMLElement;
      const fundingSection = container.querySelector('[data-section="funding-details"]') as HTMLElement;
      const kioskSection = container.querySelector('[data-section="kiosk-distribution"]') as HTMLElement;

      const sections: Array<{ element: HTMLElement | null; id: CampaignTab }> = [
        { element: basicInfoSection, id: "basic" },
        { element: mediaSection, id: "media-gallery" },
        { element: fundingSection, id: "funding-details" },
        { element: kioskSection, id: "kiosk-distribution" }
      ];

      let closestSection: CampaignTab = "basic";
      let closestDistance = Infinity;

      sections.forEach(({ element, id }) => {
        if (!element) return;
        const sectionTop = element.offsetTop;
        const sectionHeight = element.offsetHeight;
        const sectionCenter = sectionTop + sectionHeight / 2;
        const distance = Math.abs(sectionCenter - centerPoint);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = id;
        }
      });

      setActiveTab(closestSection);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch kiosks when dialog opens
  useEffect(() => {
    if (!open) return;

    const fetchKiosks = async () => {
      try {
        setLoadingKiosks(true);
        const kiosksList = await kioskApi.getKiosks(organizationId);
        setKiosks(kiosksList);
      } catch (error) {
        console.error('Failed to fetch kiosks:', error);
        setKiosks([]);
      } finally {
        setLoadingKiosks(false);
      }
    };

    fetchKiosks();
  }, [open, organizationId]);

  const isEditMode = !!campaign;

  const {
    uploadingImage,
    selectedImage,
    imagePreview,
    handleImageSelect,
    handleImageUpload,
    clearImageSelection,
    setImagePreviewUrl,
    uploadFile, // Destructure the new uploadFile function
  } = useCampaignManagement();

  // Organization tags hook
  const { tags: organizationTags, addMultipleTags: addMultipleOrganizationTags } = useOrganizationTags(organizationId);

  // Tags dropdown state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // New state for advanced image uploads
  const [selectedOrganizationLogo, setSelectedOrganizationLogo] =
    useState<File | null>(null);
  // New state for gallery image uploads
  const [selectedGalleryImages, setSelectedGalleryImages] = useState<File[]>(
    []
  );
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>(
    []
  );

  // Loading state for the dialog submit (create/save)
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && campaign) {
      const editableData = {
        title: campaign.title || "",
        description: campaign.description || "",
        status: campaign.status || "active",
        goal: campaign.goal || 0,
        tags: Array.isArray(campaign.tags) ? campaign.tags.join(", ") : "",
        startDate: campaign.startDate?.seconds
          ? new Date(campaign.startDate.seconds * 1000)
            .toISOString()
            .split("T")[0]
          : "",
        endDate: campaign.endDate?.seconds
          ? new Date(campaign.endDate.seconds * 1000)
            .toISOString()
            .split("T")[0]
          : "",
        coverImageUrl: campaign.coverImageUrl || "",

        // New fields for advanced settings (initial subset)
        category: campaign.category || "",
        organizationId: campaign.organizationId || "",
        longDescription: campaign.longDescription || "",
        videoUrl: campaign.videoUrl || "",
        // Adding more fields for advanced settings
        assignedKiosks: Array.isArray(campaign.assignedKiosks)
          ? campaign.assignedKiosks.join(", ")
          : "",
        isGlobal: campaign.isGlobal || false,
        galleryImages: Array.isArray(campaign.galleryImages)
          ? campaign.galleryImages.join(", ")
          : "",
        organizationInfoName: campaign.organizationInfo?.name || "",
        organizationInfoDescription:
          campaign.organizationInfo?.description || "",
        organizationInfoWebsite: campaign.organizationInfo?.website || "",
        organizationInfoLogo: campaign.organizationInfo?.logo || "",
        impactMetricsPeopleHelped: campaign.impactMetrics?.peopleHelped || 0,
        impactMetricsItemsProvided: campaign.impactMetrics?.itemsProvided || 0,
        impactMetricsCustomMetricLabel:
          campaign.impactMetrics?.customMetric?.label || "",
        impactMetricsCustomMetricValue:
          campaign.impactMetrics?.customMetric?.value || 0,
        impactMetricsCustomMetricUnit:
          campaign.impactMetrics?.customMetric?.unit || "",

        // CampaignConfiguration fields
        predefinedAmounts: Array.isArray(
          campaign.configuration?.predefinedAmounts
        )
          ? campaign.configuration.predefinedAmounts.join(", ")
          : "",
        allowCustomAmount: campaign.configuration?.allowCustomAmount ?? true,
        minCustomAmount: campaign.configuration?.minCustomAmount ?? 1,
        maxCustomAmount: campaign.configuration?.maxCustomAmount ?? 1000,
        // Adding more CampaignConfiguration fields
        suggestedAmounts: Array.isArray(
          campaign.configuration?.suggestedAmounts
        )
          ? campaign.configuration.suggestedAmounts.join(", ")
          : "",
        enableRecurring: campaign.configuration?.enableRecurring ?? false,
        recurringIntervals: Array.isArray(
          campaign.configuration?.recurringIntervals
        )
          ? campaign.configuration.recurringIntervals.join(", ")
          : "",
        defaultRecurringInterval:
          campaign.configuration?.defaultRecurringInterval || "monthly",
        recurringDiscount: campaign.configuration?.recurringDiscount ?? 0,
        // Adding Display Settings fields
        displayStyle: campaign.configuration?.displayStyle || "grid",
        showProgressBar: campaign.configuration?.showProgressBar ?? true,
        showDonorCount: campaign.configuration?.showDonorCount ?? true,
        showRecentDonations:
          campaign.configuration?.showRecentDonations ?? true,
        maxRecentDonations: campaign.configuration?.maxRecentDonations ?? 5,
        // Adding Call-to-Action fields
        primaryCTAText: campaign.configuration?.primaryCTAText || "Donate Now",
        secondaryCTAText: campaign.configuration?.secondaryCTAText || "",
        urgencyMessage: campaign.configuration?.urgencyMessage || "",
        // Adding Visual Customization fields
        accentColor: campaign.configuration?.accentColor || "#4F46E5",
        backgroundImage: campaign.configuration?.backgroundImage || "",
        theme: campaign.configuration?.theme || "default",
        // Adding Form Configuration fields
        requiredFields: Array.isArray(campaign.configuration?.requiredFields)
          ? campaign.configuration.requiredFields.join(", ")
          : "",
        optionalFields: Array.isArray(campaign.configuration?.optionalFields)
          ? campaign.configuration.optionalFields.join(", ")
          : "",
        enableAnonymousDonations:
          campaign.configuration?.enableAnonymousDonations ?? true,
        // Adding Social Features fields
        enableSocialSharing:
          campaign.configuration?.enableSocialSharing ?? true,
        shareMessage: campaign.configuration?.shareMessage || "",
        enableDonorWall: campaign.configuration?.enableDonorWall ?? true,
        enableComments: campaign.configuration?.enableComments ?? true,
      };
      setFormData(editableData);
      setSelectedTags(Array.isArray(campaign.tags) ? campaign.tags : []);
      setImagePreviewUrl(campaign.coverImageUrl || null);
      // Set initial previews for gallery images
      if (
        Array.isArray(campaign.galleryImages) &&
        campaign.galleryImages.length > 0
      ) {
        setGalleryImagePreviews(campaign.galleryImages);
      }
    } else if (!isEditMode) {
      setFormData(getInitialFormData());
      setSelectedTags([]);
      setImagePreviewUrl(null);
      // Clear advanced image selections/previews for add mode
      setSelectedOrganizationLogo(null);
      // Clear gallery image selections/previews for add mode
      setSelectedGalleryImages([]);
      setGalleryImagePreviews([]);
    }
  }, [campaign, isEditMode, setImagePreviewUrl]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement; // Cast to HTMLInputElement to access 'checked' for checkboxes
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleKioskToggle = (kioskId: string) => {
    setFormData((prev) => {
      const selected = prev.selectedKiosks || [];
      const isSelected = selected.includes(kioskId);
      return {
        ...prev,
        selectedKiosks: isSelected
          ? selected.filter((id: string) => id !== kioskId)
          : [...selected, kioskId],
      };
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const inputName = e.target.name;

    if (files) {
      if (inputName === "coverImageUrl") {
        handleImageSelect(files[0]);
      } else if (inputName === "organizationInfoLogo") {
        const file = files[0];
        setSelectedOrganizationLogo(file);
      } else if (inputName === "galleryImages") {
        const newFiles = Array.from(files);

        // Limit to a maximum of 4 images including existing ones
        if (selectedGalleryImages.length + newFiles.length > 4) {
          alert("You can only upload a maximum of 4 gallery images.");
          return;
        }

        setSelectedGalleryImages((prev) => [...prev, ...newFiles]);
        newFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) =>
            setGalleryImagePreviews((prev) => [
              ...prev,
              e.target?.result as string,
            ]);
          reader.readAsDataURL(file);
        });
      }
    }
  };

  const handleRemoveCoverImage = () => {
    setFormData((prev) => ({ ...prev, coverImageUrl: "" }));
    setImagePreviewUrl(null);
    clearImageSelection();
  };

  const handleDeleteGalleryImage = (imageToDelete: string, index: number) => {
    const existingUrls = (formData.galleryImages as string)
      ?.split(",")
      .map((url) => url.trim())
      .filter(Boolean) || [];
    const existingCount = existingUrls.length;

    // Remove from previews
    setGalleryImagePreviews((prev) => prev.filter((_, i) => i !== index));

    if (index < existingCount) {
      // Removing an existing (already saved) image; update form data so it is removed on save.
      const updatedExisting = existingUrls.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        galleryImages: updatedExisting.join(","),
      }));
    } else {
      // Removing a newly selected image; update the pending files.
      const newIndex = index - existingCount;
      setSelectedGalleryImages((prev) => prev.filter((_, i) => i !== newIndex));
    }
  };

  const handleDonationTierChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newTiers = Array.isArray(prev.donationTiers) ? [...prev.donationTiers] : [];
      newTiers[index] = value;
      return { ...prev, donationTiers: newTiers };
    });
  };

  const handleSaveChanges = async () => {
    if (!formData.title || !formData.description) {
      alert("Title and Description are required.");
      return;
    }

    let finalData = { ...formData };

    // Process tags - convert selectedTags array to comma-separated string for formData
    finalData.tags = selectedTags.join(", ");

    // Add new tags to organization if they don't exist
    const newTags = selectedTags.filter(tag => !organizationTags.includes(tag));
    if (newTags.length > 0) {
      try {
        await addMultipleOrganizationTags(newTags);
      } catch (error) {
        console.error(`Failed to add new tags to organization:`, error);
      }
    }

    setIsSubmitting(true);

    // Upload cover image if a new one was selected
    if (selectedImage) {
      try {
        const uploadedData = await handleImageUpload(campaign?.id, finalData);
        if (uploadedData?.coverImageUrl) {
          finalData = { ...finalData, coverImageUrl: uploadedData.coverImageUrl };
          setImagePreviewUrl(uploadedData.coverImageUrl);
        }
      } catch (error) {
        console.error("Error uploading cover image:", error);
        alert("Failed to upload cover image. Please try again.");
        setIsSubmitting(false);
        return;
      }
    }

    // Upload organization logo
    if (selectedOrganizationLogo && !finalData.organizationInfoLogo) { // Only upload if not already uploaded
      try {
        const url = await uploadFile(
          selectedOrganizationLogo,
          `campaigns/${campaign?.id || "new"}/organizationLogo/${selectedOrganizationLogo.name
          }`
        );
        if (url) {
          finalData = { ...finalData, organizationInfoLogo: url };
        }
      } catch (error) {
        console.error("Error uploading organization logo:", error);
        alert("Failed to upload organization logo. Please try again.");
        setIsSubmitting(false);
        return;
      }
    }

    // Upload gallery images (append to existing list if present)
    if (selectedGalleryImages.length > 0) {
      const uploadedUrls: string[] = [];
      const existingUrls = finalData.galleryImages
        ? String(finalData.galleryImages).split(",").filter(Boolean)
        : [];

      for (const file of selectedGalleryImages) {
        try {
          const url = await uploadFile(
            file,
            `campaigns/${campaign?.id || "new"}/galleryImages/${file.name}`
          );
          if (url) uploadedUrls.push(url);
        } catch (error) {
          console.error(`Error uploading gallery image ${file.name}:`, error);
          alert(`Failed to upload gallery image ${file.name}. Please try again.`);
          setIsSubmitting(false);
          return;
        }
      }

      if (uploadedUrls.length > 0 || existingUrls.length > 0) {
        const finalGalleryImages = [...existingUrls, ...uploadedUrls];
        finalData = { ...finalData, galleryImages: finalGalleryImages.join(",") };
        setGalleryImagePreviews(finalGalleryImages);
      }
    }

    try {
      await onSave(finalData, !isEditMode, campaign?.id);
      handleDialogClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    clearImageSelection();
    setFormData(getInitialFormData()); // Reset for add mode
    // Clear tags
    setSelectedTags([]);
    // Clear advanced image selections/previews
    setSelectedOrganizationLogo(null);
    setSelectedGalleryImages([]);
    setGalleryImagePreviews([]);
  };

  const handleCancel = () => {
    handleDialogClose();
    onOpenChange(false);
  };

  const dialogTitle = isEditMode
    ? `Edit Campaign: ${campaign?.title}`
    : "Add New Campaign";
  const dialogDescription = isEditMode
    ? "Make changes to your campaign below. Click save when you're done."
    : "Fill in the details below to create a new campaign.";
  const isSaveDisabled =
    uploadingImage || !formData.title || !formData.description;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[95vh] flex flex-col p-0">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-white">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="mt-2 text-gray-600 text-sm">
            {dialogDescription}
          </DialogDescription>
        </div>

        {/* Single Scroll Container - Unified scrolling for left + right */}
        <div 
          ref={contentRef}
          className="flex flex-1 overflow-y-scroll bg-gray-50"
          style={{
            scrollbarGutter: 'stable',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none'
          }}
        >
          {/* Hide scrollbar for webkit browsers (Chrome, Safari) */}
          <style>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Left Sidebar - Sticky Navigation */}
          <div className="w-56 border-r border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-sm sticky top-0 h-fit">
            <div className="p-5 space-y-3">
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">Configuration</h3>
                <div className="h-1 w-12 rounded mt-2" style={{backgroundColor: '#03AC13'}}></div>
              </div>
              
              <button
                onClick={() => setActiveTab("basic")}
                style={{
                  backgroundColor: activeTab === "basic" ? '#03AC13' : 'transparent',
                  color: activeTab === "basic" ? 'white' : '#374151'
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === "basic"
                    ? "shadow-md hover:shadow-lg"
                    : "hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                Basic Info
              </button>
              
              <button
                onClick={() => setActiveTab("media-gallery")}
                style={{
                  backgroundColor: activeTab === "media-gallery" ? '#03AC13' : 'transparent',
                  color: activeTab === "media-gallery" ? 'white' : '#374151'
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === "media-gallery"
                    ? "shadow-md hover:shadow-lg"
                    : "hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                Media & Gallery
              </button>
              
              <button
                onClick={() => setActiveTab("funding-details")}
                style={{
                  backgroundColor: activeTab === "funding-details" ? '#03AC13' : 'transparent',
                  color: activeTab === "funding-details" ? 'white' : '#374151'
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === "funding-details"
                    ? "shadow-md hover:shadow-lg"
                    : "hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                Funding Details
              </button>
              
              <button
                onClick={() => setActiveTab("kiosk-distribution")}
                style={{
                  backgroundColor: activeTab === "kiosk-distribution" ? '#03AC13' : 'transparent',
                  color: activeTab === "kiosk-distribution" ? 'white' : '#374151'
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === "kiosk-distribution"
                    ? "shadow-md hover:shadow-lg"
                    : "hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                Kiosk Distribution
              </button>
            </div>
          </div>

          {/* Right Content - Form */}
          <div className="flex-1 bg-gray-50">
            <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }} className="p-8 space-y-8">
              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <div data-section="basic" className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">General Information</h2>
                    <p className="text-sm text-gray-600">Add basic details about your campaign</p>
                  </div>

                  {/* Campaign Title */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <Label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-3">
                      Campaign Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Clean Water Initiative"
                      className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none transition-all text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-2">Create a clear, descriptive title for your campaign</p>
                  </div>

                  {/* Brief Overview */}
                  <div>
                    <Label htmlFor="description" className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                      Brief Overview
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Short summary for kiosk list cards..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 resize-none"
                    />
                  </div>

                  {/* Detailed Campaign Story */}
                  <div>
                    <Label htmlFor="longDescription" className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                      Detailed Campaign Story
                    </Label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
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
                        id="longDescription"
                        name="longDescription"
                        value={formData.longDescription}
                        onChange={handleChange}
                        placeholder="Tell the story of your campaign..."
                        rows={8}
                        className="border-0 rounded-none focus:ring-0 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Media & Gallery Tab */}
              {activeTab === "media-gallery" && (
                <div data-section="media-gallery" className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Visual Identity</h2>

                  {/* Primary Cover Image */}
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                      Primary Cover (16:9)
                    </Label>
                    {imagePreview || formData.coverImageUrl ? (
                      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 mb-4">
                        <img
                          src={imagePreview || formData.coverImageUrl}
                          alt="Campaign cover preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveCoverImage}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="coverImage"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 rounded-lg cursor-pointer transition"
                        style={{borderColor: '#03AC13', borderStyle: 'dashed', backgroundColor: 'rgba(3, 172, 19, 0.05)'}}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(3, 172, 19, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(3, 172, 19, 0.05)'}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: '#03AC13'}}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm font-medium" style={{color: '#03AC13'}}>CLICK TO UPLOAD COVER</p>
                        </div>
                        <input
                          id="coverImage"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileSelect}
                          name="coverImageUrl"
                        />
                      </label>
                    )}
                  </div>

                  {/* Campaign Gallery */}
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                      Campaign Gallery
                    </Label>
                    <div className="space-y-4">
                      {galleryImagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                          {galleryImagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => handleDeleteGalleryImage(preview, index)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <label
                        htmlFor="galleryImagesInput"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Plus className="w-6 h-6 text-gray-400 mb-1" />
                          <p className="text-sm text-gray-500 font-medium">ADD</p>
                        </div>
                        <input
                          id="galleryImagesInput"
                          type="file"
                          multiple
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileSelect}
                          name="galleryImages"
                        />
                      </label>
                    </div>
                  </div>

                  {/* YouTube Presentation */}
                  <div>
                    <Label htmlFor="videoUrl" className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                      YouTube Presentation
                    </Label>
                    <Input
                      id="videoUrl"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleChange}
                      placeholder="https://youtube.com/..."
                      className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                    />
                  </div>
                </div>
              )}

              {/* Funding Details Tab */}
              {activeTab === "funding-details" && (
                <div data-section="funding-details" className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Financial Goals</h2>
                    <p className="text-sm text-gray-600">Set your fundraising target and donation tiers</p>
                  </div>

                  {/* Fundraising Target & Donation Tiers */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Donation Targets</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="goal" className="block text-sm font-semibold text-gray-900 mb-3">
                          Fundraising Target ($) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="goal"
                          name="goal"
                          type="number"
                          value={formData.goal}
                          onChange={handleChange}
                          placeholder="1000"
                          className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none transition-all text-gray-900"
                        />
                        <p className="text-xs text-gray-500 mt-2">Your campaign's fundraising goal</p>
                      </div>

                      {[0, 1, 2].map(index => (
                        <div key={index}>
                          <Label htmlFor={`tier-${index}`} className="block text-sm font-semibold text-gray-900 mb-3">
                            Tier {index + 1}
                          </Label>
                          <div className="flex items-center">
                            <span className="text-gray-600 font-medium mr-2">$</span>
                            <Input
                              id={`tier-${index}`}
                              type="number"
                              placeholder="50"
                              value={formData.donationTiers?.[index] || ''}
                              onChange={(e) => handleDonationTierChange(index, e.target.value)}
                              min="0"
                              step="1"
                              className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none transition-all text-gray-900"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Suggested donation amount</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Campaign Duration */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Campaign Duration</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="startDate" className="block text-sm font-semibold text-gray-900 mb-3">
                          Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="startDate"
                          name="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={handleChange}
                          className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none transition-all text-gray-900"
                        />
                        <p className="text-xs text-gray-500 mt-2">When your campaign begins</p>
                      </div>

                      <div>
                        <Label htmlFor="endDate" className="block text-sm font-semibold text-gray-900 mb-3">
                          End Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="endDate"
                          name="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={handleChange}
                          className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none transition-all text-gray-900"
                        />
                        <p className="text-xs text-gray-500 mt-2">When your campaign ends</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Kiosk Distribution Tab */}
              {activeTab === "kiosk-distribution" && (
                <div data-section="kiosk-distribution" className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Kiosk Distribution</h2>

                  {/* Global Broadcast Option */}
                  <label className="flex items-center p-4 rounded-lg cursor-pointer transition"
                    style={{border: '2px solid #03AC13', backgroundColor: 'rgba(3, 172, 19, 0.05)'}}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(3, 172, 19, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(3, 172, 19, 0.05)'}>
                    <input
                      type="checkbox"
                      checked={formData.isGlobal}
                      onChange={handleChange}
                      name="isGlobal"
                      className="w-5 h-5"
                      style={{color: '#03AC13'}}
                    />
                    <div className="ml-4 flex-1">
                      <p className="font-semibold text-teal-900">BROADCAST GLOBALLY</p>
                      <p className="text-sm text-teal-700">DISPLAY ON EVERY ACTIVE TERMINAL</p>
                    </div>
                    {formData.isGlobal && (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" style={{color: '#03AC13'}}>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </label>

                  {/* Individual Kiosk Selection */}
                  {!formData.isGlobal && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Kiosks</h3>
                      
                      {loadingKiosks ? (
                        <div className="flex items-center justify-center py-8">
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ) : kiosks.length === 0 ? (
                        <div className="p-6 text-center border border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-gray-500">No kiosks available</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {kiosks.map((kiosk) => (
                            <label
                              key={kiosk.id}
                              className="flex items-center p-4 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition"
                            >
                              <input
                                type="checkbox"
                                checked={(formData.selectedKiosks || []).includes(kiosk.id)}
                                onChange={() => handleKioskToggle(kiosk.id)}
                                className="w-5 h-5 rounded"
                                style={{accentColor: '#03AC13'}}
                              />
                              <div className="ml-3 flex-1">
                                <p className="font-semibold text-gray-900">{kiosk.name}</p>
                                <p className="text-sm text-gray-500">{kiosk.location}</p>
                                <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                                  kiosk.status === 'online' ? 'bg-green-100 text-green-800' :
                                  kiosk.status === 'offline' ? 'bg-gray-100 text-gray-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {kiosk.status}
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Selected Kiosks Summary */}
                      {(formData.selectedKiosks || []).length > 0 && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm font-semibold text-blue-900 mb-3">
                            Selected Kiosks ({(formData.selectedKiosks || []).length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(formData.selectedKiosks || []).map((kioskId: string) => {
                              const kiosk = kiosks.find(k => k.id === kioskId);
                              return kiosk ? (
                                <Badge key={kioskId} className="bg-blue-600 text-white">
                                  {kiosk.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-white">
          <Button 
            variant="outline" 
            type="button"
            className="text-gray-700 flex items-center gap-2 hover:bg-gray-100 border-gray-300 font-medium"
            onClick={() => {
              // Save draft functionality
            }}
          >
            <Save className="w-4 h-4" />
            Save Draft
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={handleCancel}
              disabled={uploadingImage || isSubmitting}
              className="px-6 h-11 border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSaveChanges}
              disabled={isSaveDisabled || isSubmitting}
                      className="px-7 h-11 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transition-all"
                      style={{backgroundColor: '#03AC13'}}
            >
              {isSubmitting ? (isEditMode ? "Saving..." : "Publishing...") : (isEditMode ? "Save Changes" : "Publish Campaign")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface CampaignManagementProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
}

const CampaignManagement = ({
  onNavigate,
  onLogout,
  userSession,
  hasPermission,
}: CampaignManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<DocumentData | null>(
    null
  );

  // New CampaignForm state
  const [isNewCampaignFormOpen, setIsNewCampaignFormOpen] = useState(false);
  const [isEditCampaignFormOpen, setIsEditCampaignFormOpen] = useState(false);
  const [editingCampaignForNewForm, setEditingCampaignForNewForm] = useState<Campaign | null>(null);
  
  // Separate state for create and edit
  const [newCampaignFormData, setNewCampaignFormData] = useState<CampaignFormData>({
    title: '',
    briefOverview: '',
    description: '',
    goal: 0,
    category: '',
    status: 'active',
    coverImageUrl: '',
    videoUrl: '',
    galleryImages: [],
    predefinedAmounts: [25, 50, 100],
    startDate: '',
    endDate: '',
    enableRecurring: false,
    recurringIntervals: [],
    tags: [],
    isGlobal: false,
    assignedKiosks: []
  });
  
  const [editCampaignFormData, setEditCampaignFormData] = useState<CampaignFormData>({
    title: '',
    briefOverview: '',
    description: '',
    goal: 0,
    category: '',
    status: 'active',
    coverImageUrl: '',
    videoUrl: '',
    galleryImages: [],
    predefinedAmounts: [25, 50, 100],
    startDate: '',
    endDate: '',
    enableRecurring: false,
    recurringIntervals: [],
    tags: [],
    isGlobal: false,
    assignedKiosks: []
  });
  
  const [selectedNewCampaignImageFile, setSelectedNewCampaignImageFile] = useState<File | null>(null);
  const [selectedEditCampaignImageFile, setSelectedEditCampaignImageFile] = useState<File | null>(null);
  const [selectedNewCampaignGalleryFiles, setSelectedNewCampaignGalleryFiles] = useState<File[]>([]);
  const [selectedEditCampaignGalleryFiles, setSelectedEditCampaignGalleryFiles] = useState<File[]>([]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState<Record<string, boolean>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<DocumentData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { campaigns, updateWithImage, createWithImage, remove, loading, uploadFile } =
    useCampaignManagement(userSession.user.organizationId || "");

  const { organization, loading: orgLoading } = useOrganization(
    userSession.user.organizationId ?? null
  );
  const { isStripeOnboarded } = useStripeOnboarding(organization);
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);

  const handleDeleteClick = (campaign: DocumentData) => {
    setCampaignToDelete(campaign);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (campaignToDelete) {
      setIsDeleting(true);
      try {
        await remove(campaignToDelete.id);
        setIsDeleteDialogOpen(false);
        setCampaignToDelete(null);
        // Optionally, show a success toast or message
      } catch (error) {
        console.error("Error deleting campaign:", error);
        // Optionally, show an error toast or message
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Helper function to remove undefined properties from an object
  const removeUndefined = (obj: unknown): unknown => {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(removeUndefined).filter((item) => item !== undefined);
    }

    const record = obj as Record<string, unknown>;
    const newObj: Record<string, unknown> = {};
    for (const key of Object.keys(record)) {
      const value = record[key];
      if (value !== undefined) {
        const processedValue = removeUndefined(value);
        if (processedValue !== undefined) {
          newObj[key] = processedValue;
        }
      }
    }
    // If all properties of an object are undefined, return undefined so it can be removed from parent.
    if (Object.keys(newObj).length === 0 && Object.keys(record).length > 0) {
      return undefined;
    }
    return newObj;
  };

  const handleEditClick = (campaign: DocumentData) => {
    // Populate form data from campaign
    setEditCampaignFormData({
      title: campaign.title || '',
      briefOverview: campaign.briefOverview || '',
      description: campaign.description || '',
      goal: campaign.goal || 0,
      category: campaign.category || '',
      status: campaign.status || 'active',
      coverImageUrl: campaign.coverImageUrl || '',
      videoUrl: campaign.videoUrl || '',
      galleryImages: Array.isArray(campaign.galleryImages) ? campaign.galleryImages : [],
      predefinedAmounts: Array.isArray(campaign.configuration?.predefinedAmounts)
        ? campaign.configuration.predefinedAmounts
        : [25, 50, 100],
      startDate: campaign.startDate?.seconds
        ? new Date(campaign.startDate.seconds * 1000).toISOString().split('T')[0]
        : '',
      endDate: campaign.endDate?.seconds
        ? new Date(campaign.endDate.seconds * 1000).toISOString().split('T')[0]
        : '',
      enableRecurring: campaign.configuration?.enableRecurring ?? false,
      recurringIntervals: Array.isArray(campaign.configuration?.recurringIntervals)
        ? campaign.configuration.recurringIntervals
        : [],
      tags: Array.isArray(campaign.tags) ? campaign.tags : [],
      isGlobal: campaign.isGlobal ?? false,
      assignedKiosks: Array.isArray(campaign.assignedKiosks) ? campaign.assignedKiosks : []
    });
    
    setEditingCampaignForNewForm(campaign as Campaign);
    setIsEditCampaignFormOpen(true);
  };

  const handleSave = async (
    data: DocumentData,
    isNew: boolean,
    campaignId?: string
  ) => {
    try {
      const dataToSave: Record<string, unknown> = {
        title: data.title,
        description: data.description,
        status: data.status,
        goal: Number(data.goal),
        tags: typeof data.tags === "string"
        ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [],
        coverImageUrl: data.coverImageUrl || "",
        category: data.category || "",
        organizationId: userSession.user.organizationId || "",
        assignedKiosks: data.assignedKiosks
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean),
        isGlobal: data.isGlobal,
        longDescription: data.longDescription || "",
        videoUrl: data.videoUrl || "",
        galleryImages: data.galleryImages
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean),
        organizationInfo: {
          name: data.organizationInfoName || "",
          description: data.organizationInfoDescription || "",
          website: data.organizationInfoWebsite || undefined,
          logo: data.organizationInfoLogo || undefined,
        },
        impactMetrics: {
          peopleHelped: Number(data.impactMetricsPeopleHelped) || undefined,
          itemsProvided: Number(data.impactMetricsItemsProvided) || undefined,
          customMetric:
            data.impactMetricsCustomMetricLabel ||
              data.impactMetricsCustomMetricValue ||
              data.impactMetricsCustomMetricUnit
              ? {
                label: data.impactMetricsCustomMetricLabel || "",
                value: Number(data.impactMetricsCustomMetricValue) || 0,
                unit: data.impactMetricsCustomMetricUnit || "",
              }
              : undefined,
        },
        configuration: {
          predefinedAmounts: data.predefinedAmounts
            .split(",")
            .map(Number)
            .filter(Boolean),
          allowCustomAmount: data.allowCustomAmount,
          minCustomAmount: Number(data.minCustomAmount),
          maxCustomAmount: Number(data.maxCustomAmount),
          suggestedAmounts: data.suggestedAmounts
            .split(",")
            .map(Number)
            .filter(Boolean),
          enableRecurring: data.enableRecurring,
          recurringIntervals: data.recurringIntervals
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean),
          defaultRecurringInterval: data.defaultRecurringInterval,
          recurringDiscount: Number(data.recurringDiscount),
          displayStyle: data.displayStyle,
          showProgressBar: data.showProgressBar,
          showDonorCount: data.showDonorCount,
          showRecentDonations: data.showRecentDonations,
          maxRecentDonations: Number(data.maxRecentDonations),
          primaryCTAText: data.primaryCTAText || "",
          secondaryCTAText: data.secondaryCTAText || undefined,
          urgencyMessage: data.urgencyMessage || undefined,
          accentColor: data.accentColor || undefined,
          backgroundImage: data.backgroundImage || undefined,
          theme: data.theme || "default",
          requiredFields: data.requiredFields
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean),
          optionalFields: data.optionalFields
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean),
          enableAnonymousDonations: data.enableAnonymousDonations,
          enableSocialSharing: data.enableSocialSharing,
          shareMessage: data.shareMessage || undefined,
          enableDonorWall: data.enableDonorWall,
          enableComments: data.enableComments,
        },
      };

      if (data.startDate)
        dataToSave.startDate = Timestamp.fromDate(new Date(data.startDate));
      if (data.endDate)
        dataToSave.endDate = Timestamp.fromDate(new Date(data.endDate));

      const finalDataToSave = removeUndefined(dataToSave) as Record<string, unknown>;

      if (isNew) {
        const newCampaign = await createWithImage(finalDataToSave);

        await syncKiosksForCampaign(
          newCampaign.id,
          normalizeAssignments(data.assignedKiosks),
          []
        );
      } else if (campaignId) {
        await updateWithImage(campaignId, finalDataToSave);
      }
    } catch (error) {
      console.error(
        isNew ? "Error creating campaign: " : "Error updating document: ",
        error
      );
      alert(
        `Failed to ${isNew ? "create" : "update"} campaign. Please try again.`
      );
    } finally {
      setIsEditDialogOpen(false);
      setIsAddDialogOpen(false);
      setEditingCampaign(null);
    }
  };

  // New handlers for CampaignForm
  const handleNewCampaignFormSubmit = async () => {
    try {
      let coverImageUrl = newCampaignFormData.coverImageUrl;
      
      // Upload image file if one was selected
      if (selectedNewCampaignImageFile) {
        const uploadedUrl = await uploadFile(
          selectedNewCampaignImageFile,
          `campaigns/new/${Date.now()}_${selectedNewCampaignImageFile.name}`
        );
        if (uploadedUrl) {
          coverImageUrl = uploadedUrl;
        }
      }
      
      // Upload gallery images if any were selected
      const galleryImageUrls = [...newCampaignFormData.galleryImages];
      if (selectedNewCampaignGalleryFiles.length > 0) {
        for (const file of selectedNewCampaignGalleryFiles) {
          const uploadedUrl = await uploadFile(
            file,
            `campaigns/new/gallery/${Date.now()}_${file.name}`
          );
          if (uploadedUrl) {
            galleryImageUrls.push(uploadedUrl);
          }
        }
      }
      
      const dataToSave: Record<string, unknown> = {
        title: newCampaignFormData.title,
        briefOverview: newCampaignFormData.briefOverview,
        description: newCampaignFormData.description,
        status: newCampaignFormData.status,
        goal: Number(newCampaignFormData.goal),
        tags: Array.isArray(newCampaignFormData.tags)
          ? newCampaignFormData.tags.filter((tag) => tag.trim().length > 0)
          : [],
        coverImageUrl: coverImageUrl || "",
        videoUrl: newCampaignFormData.videoUrl || "",
        galleryImages: galleryImageUrls,
        category: newCampaignFormData.category || "",
        organizationId: userSession.user.organizationId || "",
        assignedKiosks: normalizeAssignments(newCampaignFormData.assignedKiosks),
        isGlobal: newCampaignFormData.isGlobal,
        configuration: {
          ...DEFAULT_CAMPAIGN_CONFIG,
          predefinedAmounts: newCampaignFormData.predefinedAmounts.filter((amount) => amount > 0),
          enableRecurring: newCampaignFormData.enableRecurring,
          recurringIntervals: newCampaignFormData.recurringIntervals,
        },
      };

      if (newCampaignFormData.startDate) {
        dataToSave.startDate = Timestamp.fromDate(new Date(newCampaignFormData.startDate));
      }
      if (newCampaignFormData.endDate) {
        dataToSave.endDate = Timestamp.fromDate(new Date(newCampaignFormData.endDate));
      }

      const finalDataToSave = removeUndefined(dataToSave) as Record<string, unknown>;
      const newCampaign = await createWithImage(finalDataToSave);
      
      await syncKiosksForCampaign(newCampaign.id, normalizeAssignments(newCampaignFormData.assignedKiosks), []);
      
      // Reset form and close
      setIsNewCampaignFormOpen(false);
      setSelectedNewCampaignImageFile(null);
      setSelectedNewCampaignGalleryFiles([]);
      setNewCampaignFormData({
        title: '',
        description: '',
        goal: 0,
        category: '',
        status: 'active',
        coverImageUrl: '',
        startDate: '',
        endDate: '',
        tags: []
      });
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign. Please try again.");
    }
  };

  const handleNewCampaignFormCancel = () => {
    setIsNewCampaignFormOpen(false);
    setSelectedNewCampaignImageFile(null);
    setSelectedNewCampaignGalleryFiles([]);
    setNewCampaignFormData({
      title: '',
      briefOverview: '',
      description: '',
      goal: 0,
      category: '',
      status: 'active',
      coverImageUrl: '',
      videoUrl: '',
      galleryImages: [],
      predefinedAmounts: [25, 50, 100],
      startDate: '',
      endDate: '',
      enableRecurring: false,
      recurringIntervals: [],
      tags: [],
      isGlobal: false,
      assignedKiosks: []
    });
  };

  const handleEditCampaignFormSubmit = async () => {
    if (!editingCampaignForNewForm) return;
    
    try {
      let coverImageUrl = editCampaignFormData.coverImageUrl;
      
      // Upload image file if one was selected
      if (selectedEditCampaignImageFile) {
        const uploadedUrl = await uploadFile(
          selectedEditCampaignImageFile,
          `campaigns/${editingCampaignForNewForm.id}/${Date.now()}_${selectedEditCampaignImageFile.name}`
        );
        if (uploadedUrl) {
          coverImageUrl = uploadedUrl;
        }
      }
      
      // Upload gallery images if any were selected
      const galleryImageUrls = [...editCampaignFormData.galleryImages];
      if (selectedEditCampaignGalleryFiles.length > 0) {
        for (const file of selectedEditCampaignGalleryFiles) {
          const uploadedUrl = await uploadFile(
            file,
            `campaigns/${editingCampaignForNewForm.id}/gallery/${Date.now()}_${file.name}`
          );
          if (uploadedUrl) {
            galleryImageUrls.push(uploadedUrl);
          }
        }
      }
      
      const dataToSave: Record<string, unknown> = {
        title: editCampaignFormData.title,
        briefOverview: editCampaignFormData.briefOverview,
        description: editCampaignFormData.description,
        status: editCampaignFormData.status,
        goal: Number(editCampaignFormData.goal),
        tags: Array.isArray(editCampaignFormData.tags)
          ? editCampaignFormData.tags.filter((tag) => tag.trim().length > 0)
          : [],
        coverImageUrl: coverImageUrl || "",
        videoUrl: editCampaignFormData.videoUrl || "",
        galleryImages: galleryImageUrls,
        category: editCampaignFormData.category || "",
        assignedKiosks: normalizeAssignments(editCampaignFormData.assignedKiosks),
        isGlobal: editCampaignFormData.isGlobal,
        configuration: {
          ...DEFAULT_CAMPAIGN_CONFIG,
          ...(editingCampaignForNewForm.configuration || {}),
          predefinedAmounts: editCampaignFormData.predefinedAmounts.filter((amount) => amount > 0),
          enableRecurring: editCampaignFormData.enableRecurring,
          recurringIntervals: editCampaignFormData.recurringIntervals,
        },
      };

      if (editCampaignFormData.startDate) {
        dataToSave.startDate = Timestamp.fromDate(new Date(editCampaignFormData.startDate));
      }
      if (editCampaignFormData.endDate) {
        dataToSave.endDate = Timestamp.fromDate(new Date(editCampaignFormData.endDate));
      }

      const finalDataToSave = removeUndefined(dataToSave) as Record<string, unknown>;
      await updateWithImage(editingCampaignForNewForm.id, finalDataToSave);

      await syncKiosksForCampaign(
        editingCampaignForNewForm.id,
        normalizeAssignments(editCampaignFormData.assignedKiosks),
        normalizeAssignments(editingCampaignForNewForm.assignedKiosks)
      );
      
      // Reset form and close
      setIsEditCampaignFormOpen(false);
      setEditingCampaignForNewForm(null);
      setSelectedEditCampaignImageFile(null);
      setSelectedEditCampaignGalleryFiles([]);
      setEditCampaignFormData({
        title: '',
        briefOverview: '',
        description: '',
        goal: 0,
        category: '',
        status: 'active',
        coverImageUrl: '',
        videoUrl: '',
        galleryImages: [],
        predefinedAmounts: [25, 50, 100],
        startDate: '',
        endDate: '',
        enableRecurring: false,
        recurringIntervals: [],
        tags: [],
        isGlobal: false,
        assignedKiosks: []
      });
    } catch (error) {
      console.error("Error updating campaign:", error);
      alert("Failed to update campaign. Please try again.");
    }
  };

  const handleEditCampaignFormCancel = () => {
    setIsEditCampaignFormOpen(false);
    setEditingCampaignForNewForm(null);
    setSelectedEditCampaignImageFile(null);
    setSelectedEditCampaignGalleryFiles([]);
    setEditCampaignFormData({
      title: '',
      briefOverview: '',
      description: '',
      goal: 0,
      category: '',
      status: 'active',
      coverImageUrl: '',
      videoUrl: '',
      galleryImages: [],
      predefinedAmounts: [25, 50, 100],
      startDate: '',
      endDate: '',
      enableRecurring: false,
      recurringIntervals: [],
      tags: [],
      isGlobal: false,
      assignedKiosks: []
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const formatDate = (timestamp?: { seconds?: number }) => {
    if (!timestamp?.seconds) return "—";
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  const campaignList = campaigns as Campaign[];
  const uniqueCategories: string[] = Array.from(
    new Set(
      campaignList
        .map((c) => (typeof c.category === 'string' ? c.category : ''))
        .filter((v): v is string => Boolean(v))
    )
  );

  // Configuration for AdminSearchFilterHeader
  const searchFilterConfig: AdminSearchFilterConfig = {
    searchPlaceholder: "Search campaigns...",
    filters: [
      {
        key: "statusFilter",
        label: "Status",
        type: "select",
        options: [
          { label: "Active", value: "active" },
          { label: "Paused", value: "paused" },
          { label: "Completed", value: "completed" }
        ]
      },
      {
        key: "categoryFilter", 
        label: "Category",
        type: "select",
        options: uniqueCategories.map(cat => ({ label: cat, value: cat }))
      },
      {
        key: "dateFilter",
        label: "Filter by date",
        type: "date"
      }
    ]
  };

  const filterValues = {
    statusFilter,
    categoryFilter,
    dateFilter
  };

  const handleFilterChange = (key: string, value: unknown) => {
    switch (key) {
      case "statusFilter":
        setStatusFilter(typeof value === "string" ? value : "all");
        break;
      case "categoryFilter":
        setCategoryFilter(typeof value === "string" ? value : "all");
        break;
      case "dateFilter":
        setDateFilter(value instanceof Date ? value : undefined);
        break;
    }
  };

  const handleCalendarToggle = (key: string, open: boolean) => {
    setShowCalendar(prev => ({ ...prev, [key]: open }));
  };

  // Filter campaigns first
  const filteredCampaigns = campaignList.filter((campaign) => {
    const matchesSearch = campaign.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(campaign.tags) && campaign.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || campaign.category === categoryFilter;
    const matchesDate = !dateFilter || (
      campaign.endDate &&
      typeof campaign.endDate === "object" &&
      "seconds" in campaign.endDate &&
      typeof (campaign.endDate as { seconds?: unknown }).seconds === "number" &&
      new Date((campaign.endDate as { seconds: number }).seconds * 1000).toDateString() === dateFilter.toDateString()
    );
    return matchesSearch && matchesStatus && matchesCategory && matchesDate;
  });

  // Use sorting hook
  const { sortedData: filteredAndSortedCampaigns, sortKey, sortDirection, handleSort } = useTableSort({
    data: filteredCampaigns
  });

  return (
    <AdminLayout
      onNavigate={onNavigate}
      onLogout={onLogout}
      userSession={userSession}
      hasPermission={hasPermission}
      activeScreen="admin-campaigns"
      hideSidebarTrigger
    >
      <div className="space-y-4 sm:space-y-6">
        <main className="px-2 sm:px-4 lg:px-8 pb-4 sm:pb-8">
          <AdminSearchFilterHeader
            title={`Campaigns (${filteredAndSortedCampaigns.length})`}
            subtitle="Manage your donation campaigns"
            config={searchFilterConfig}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            showCalendar={showCalendar}
            onCalendarToggle={handleCalendarToggle}
            exportData={filteredAndSortedCampaigns}
            actions={
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60 disabled:cursor-not-allowed px-6 py-2 h-10"
                onClick={() => {
                  if (!isStripeOnboarded) {
                    setShowOnboardingDialog(true);
                  } else {
                    setIsNewCampaignFormOpen(true);
                  }
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Campaign
              </Button>
            }
          />

          {/* Campaigns Table/List */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-4 p-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-6 gap-4 py-4 border-b border-gray-200">
                      <Skeleton className="h-10 w-full col-span-2" />
                      <Skeleton className="h-10 w-full col-span-1" />
                      <Skeleton className="h-10 w-full col-span-1" />
                      <Skeleton className="h-10 w-full col-span-1" />
                      <Skeleton className="h-10 w-full col-span-1" />
                    </div>
                  ))}
                </div>
              ) : filteredAndSortedCampaigns.length > 0 ? (
                <>
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4 p-4">
                  {filteredAndSortedCampaigns.map((campaign) => {
                    const progress =
                      campaign.goal && campaign.raised
                        ? Math.min(
                            (Number(campaign.raised) / Number(campaign.goal)) *
                              100,
                            100
                          )
                        : 0;

                    return (
                      <div
                        key={campaign.id ?? campaign.title}
                        className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <ImageWithFallback
                              src={campaign.coverImageUrl}
                              alt={campaign.title}
                              className="h-12 w-12 rounded-xl border border-gray-200 object-cover bg-gray-100"
                              fallbackSrc="/campaign-fallback.svg"
                            />
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {campaign.title}
                              </div>
                              {campaign.category && (
                                <div className="text-xs text-gray-500">
                                  {campaign.category}
                                </div>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:bg-gray-100"
                                aria-label="Campaign actions"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() => handleEditClick(campaign)}
                                className="flex items-center gap-2"
                              >
                                <FaEdit className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => handleDeleteClick(campaign)}
                                className="flex items-center gap-2 text-red-600 focus:text-red-600"
                              >
                                <FaTrashAlt className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge
                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                              campaign.status ?? "unknown"
                            )}`}
                          >
                            {campaign.status ?? "Unknown"}
                          </Badge>
                        </div>

                        {typeof progress === "number" && progress > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Progress</span>
                              <span>{progress.toFixed(0)}%</span>
                            </div>
                            <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className={`h-full ${getProgressColor(progress)}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-600">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                              Goal
                            </span>
                            <span className="font-medium text-gray-900">
                              {typeof campaign.goal === "number"
                                ? campaign.goal.toLocaleString()
                                : "—"}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                              End Date
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatDate(campaign.endDate)}
                            </span>
                          </div>
                        </div>

                        {Array.isArray(campaign.tags) &&
                          campaign.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1">
                              {campaign.tags.map((tag: string) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                      </div>
                    );
                  })}
                  </div>

                  {/* Desktop Table View */}
                  <Table className="hidden md:table w-full">
                    <colgroup>
                      <col style={{ width: '40%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '12%' }} />
                    </colgroup>
                    <TableHeader>
                      <TableRow className="bg-gray-100 border-b-2 border-gray-300">
                        <SortableTableHeader 
                          sortKey="title" 
                          currentSortKey={sortKey} 
                          currentSortDirection={sortDirection} 
                          onSort={handleSort}
                          className="px-4 py-2.5 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                        >
                          Campaign
                        </SortableTableHeader>
                        <SortableTableHeader 
                          sortKey="status" 
                          currentSortKey={sortKey} 
                          currentSortDirection={sortDirection} 
                          onSort={handleSort}
                          className="px-4 py-2.5 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                        >
                          Status
                        </SortableTableHeader>
                        <SortableTableHeader 
                          sortKey="goal" 
                          currentSortKey={sortKey} 
                          currentSortDirection={sortDirection} 
                          onSort={handleSort}
                          className="px-4 py-2.5 text-xs font-semibold text-gray-700 uppercase tracking-wide text-right"
                        >
                          Goal
                        </SortableTableHeader>
                        <SortableTableHeader 
                          sortKey="endDate" 
                          currentSortKey={sortKey} 
                          currentSortDirection={sortDirection} 
                          onSort={handleSort}
                          className="px-4 py-2.5 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                        >
                          End Date
                        </SortableTableHeader>
                        <SortableTableHeader 
                          sortable={false}
                          sortKey="actions" 
                          currentSortKey={sortKey} 
                          currentSortDirection={sortDirection} 
                          onSort={handleSort}
                          className="px-4 py-2.5 text-xs font-semibold text-gray-700 uppercase tracking-wide text-center"
                        >
                          Actions
                        </SortableTableHeader>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedCampaigns.map((campaign) => {
                        const progress =
                          campaign.goal && campaign.raised
                            ? Math.min(
                                (Number(campaign.raised) / Number(campaign.goal)) *
                                  100,
                                100
                              )
                            : 0;

                        return (
                          <TableRow key={campaign.id ?? campaign.title} className="border-b border-gray-100">
                            <TableCell className="px-4 py-3">
                              <div className="flex items-start gap-3">
                                <ImageWithFallback
                                  src={campaign.coverImageUrl}
                                  alt={campaign.title}
                                  className="w-14 h-14 object-cover rounded-lg border border-gray-200 shrink-0 bg-gray-100"
                                  fallbackSrc="/campaign-fallback.svg"
                                />
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-900 text-sm truncate">
                                        {campaign.title}
                                      </p>
                                      {campaign.category && (
                                        <p className="text-xs text-gray-500">
                                          {campaign.category}
                                        </p>
                                      )}
                                    </div>
                                    {typeof progress === "number" &&
                                      progress > 0 && (
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                          <span className="text-xs text-gray-500 font-medium">
                                            {progress.toFixed(0)}%
                                          </span>
                                          <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                              className={`h-full ${getProgressColor(
                                                progress
                                              )} transition-all duration-300`}
                                              style={{ width: `${progress}%` }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                  {Array.isArray(campaign.tags) &&
                                    campaign.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {campaign.tags.slice(0, 3).map((tag: string) => (
                                          <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="text-xs px-1.5 py-0.5"
                                          >
                                            {tag}
                                          </Badge>
                                        ))}
                                        {campaign.tags.length > 3 && (
                                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                            +{campaign.tags.length - 3}
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Badge
                                className={`text-xs px-2.5 py-0.5 rounded-full ${getStatusColor(
                                  campaign.status ?? "unknown"
                                )}`}
                              >
                                {campaign.status ?? "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-right">
                              <span className="font-medium text-sm">
                                {typeof campaign.goal === "number"
                                  ? campaign.goal.toLocaleString()
                                  : "—"}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <span className="text-sm text-gray-700">{formatDate(campaign.endDate)}</span>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-center">
                              <div className="inline-flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditClick(campaign)}
                                >
                                  <FaEdit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                  onClick={() => handleDeleteClick(campaign)}
                                  title="Delete campaign"
                                >
                                  <FaTrashAlt className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500 p-6">
                  <Ghost className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-lg font-medium mb-2">No Campaigns Found</p>
                  <p className="text-sm mb-4">No campaigns have been added to your organization yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      {/* Dialogs remain after main content */}
      <CampaignDialog open={isEditDialogOpen} onOpenChange={open => { setIsEditDialogOpen(open); if(!open) setEditingCampaign(null); }} campaign={editingCampaign} organizationId={userSession.user.organizationId || ""} onSave={handleSave} />
      <CampaignDialog open={isAddDialogOpen} onOpenChange={open => { setIsAddDialogOpen(open); }} organizationId={userSession.user.organizationId || ""} onSave={(data, isNew) => handleSave(data, isNew, undefined)} />
      
      {/* New CampaignForm Component */}
      <CampaignForm
        open={isNewCampaignFormOpen}
        onOpenChange={setIsNewCampaignFormOpen}
        editingCampaign={null}
        campaignData={newCampaignFormData}
        setCampaignData={setNewCampaignFormData}
        onSubmit={handleNewCampaignFormSubmit}
        onCancel={handleNewCampaignFormCancel}
        formatCurrency={formatCurrency}
        onImageFileSelect={setSelectedNewCampaignImageFile}
      />

      {/* Edit CampaignForm Component */}
      <CampaignForm
        open={isEditCampaignFormOpen}
        onOpenChange={setIsEditCampaignFormOpen}
        editingCampaign={editingCampaignForNewForm}
        campaignData={editCampaignFormData}
        setCampaignData={setEditCampaignFormData}
        onSubmit={handleEditCampaignFormSubmit}
        onCancel={handleEditCampaignFormCancel}
        formatCurrency={formatCurrency}
        onImageFileSelect={setSelectedEditCampaignImageFile}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 border-0 shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Delete campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white rounded-2xl p-8 text-center">
            {/* Warning Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </div>
            
            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Delete campaign
            </h2>
            
            {/* Description */}
            <p className="text-gray-600 mb-8 leading-relaxed">
              Are you sure you want to delete this campaign?<br />
              This action cannot be undone.
            </p>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
                className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white border-0"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stripe Onboarding Dialog */}
      <StripeOnboardingDialog
        open={showOnboardingDialog}
        onOpenChange={setShowOnboardingDialog}
        organization={organization}
        loading={orgLoading}
      />
    </AdminLayout>
  );
};

export default CampaignManagement;
