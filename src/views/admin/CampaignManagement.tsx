import React, { useEffect, useState, useRef, useCallback } from "react";
import { Screen, AdminSession, Permission } from "../../shared/types";
import { DEFAULT_CAMPAIGN_CONFIG } from "../../shared/config";
import { DocumentData, Timestamp } from "firebase/firestore";
import { useCampaignManagement } from "../../shared/lib/hooks/useCampaignManagement";
import { useOrganizationTags } from "../../shared/lib/hooks/useOrganizationTags";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Textarea } from "../../shared/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../../shared/ui/command";
import { Badge } from "../../shared/ui/badge";
import { X, Check, ChevronsUpDown } from "lucide-react";
import {
  FaEdit,
  FaSearch,
  FaEllipsisV,
  FaUpload,
  FaImage,
  FaTrashAlt, // Added FaTrashAlt
  FaPlus, // Import FaPlus
} from "react-icons/fa";
import { Plus, ArrowLeft, Settings, Download } from "lucide-react";
import { Calendar } from "../../shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../shared/ui/popover";
import { AlertTriangle } from "lucide-react"; // Import AlertTriangle
import { Skeleton } from "../../shared/ui/skeleton";
import { Ghost } from "lucide-react";
import { ImageWithFallback } from "../../shared/ui/figma/ImageWithFallback";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../shared/ui/alert-dialog";
import { Calendar as CalendarIcon } from "lucide-react";
import { AdminLayout } from "./AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../shared/ui/table";

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
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic");
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const [tagSearchOpen, setTagSearchOpen] = useState(false);
  const [tagSearchValue, setTagSearchValue] = useState("");

  // New state for advanced image uploads
  const [selectedOrganizationLogo, setSelectedOrganizationLogo] =
    useState<File | null>(null);
  const [organizationLogoPreview, setOrganizationLogoPreview] = useState<
    string | null
  >(null);
  // New state for gallery image uploads
  const [selectedGalleryImages, setSelectedGalleryImages] = useState<File[]>(
    []
  );
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>(
    []
  );

  // New states for specific image upload loading
  const [isUploadingOrganizationLogo, setIsUploadingOrganizationLogo] = useState(false);
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
      // Set initial previews for advanced images
      if (campaign.organizationInfo?.logo) {
        setOrganizationLogoPreview(campaign.organizationInfo.logo);
      }
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
      setOrganizationLogoPreview(null);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const inputName = e.target.name;

    if (files) {
      if (inputName === "coverImageUrl") {
        handleImageSelect(files[0]);
      } else if (inputName === "organizationInfoLogo") {
        const file = files[0];
        setSelectedOrganizationLogo(file);
        const reader = new FileReader();
        reader.onload = (e) =>
          setOrganizationLogoPreview(e.target?.result as string);
        reader.readAsDataURL(file);
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

  const handleOrganizationLogoUpload = async () => {
    if (selectedOrganizationLogo) {
      setIsUploadingOrganizationLogo(true); // Set loading state
      try {
        const url = await uploadFile(
          selectedOrganizationLogo,
          `campaigns/${campaign?.id || "new"}/organizationLogo/${selectedOrganizationLogo.name
          }`
        );
        if (url) {
          setFormData((prev) => ({ ...prev, organizationInfoLogo: url }));
          setOrganizationLogoPreview(url); // Update preview with uploaded URL
        }
      } catch (error) {
        console.error("Error uploading organization logo:", error);
        alert("Failed to upload organization logo. Please try again.");
      } finally {
        setIsUploadingOrganizationLogo(false); // Reset loading state
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
    setTagSearchValue("");
    setTagSearchOpen(false);
    // Clear advanced image selections/previews
    setSelectedOrganizationLogo(null);
    setOrganizationLogoPreview(null);
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
  const saveButtonText = isEditMode ? "Save Changes" : "Create Campaign";
  const isSaveDisabled =
    uploadingImage || !formData.title || !formData.description;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {isEditMode ? (
              <Settings className="mr-2 h-5 w-5" />
            ) : (
              <Plus className="mr-2 h-5 w-5" />
            )}{" "}
            {dialogTitle}
          </DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              className={`${activeTab === "basic"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
              onClick={() => setActiveTab("basic")}
            >
              Basic Info
            </button>
            <button
              className={`${activeTab === "advanced"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
              onClick={() => setActiveTab("advanced")}
            >
              Advanced Settings
            </button>
          </nav>
        </div>

        <div className="grid gap-6 py-4 px-1 flex-1 overflow-y-auto">
          {activeTab === "basic" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title {isEditMode ? "" : "*"}
                </Label>
                <div className="col-span-3">
                  <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
                      placeholder="Enter campaign title"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description {isEditMode ? "" : "*"}
                </Label>
                <div className="col-span-3">
                  <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
                      rows={3}
                      placeholder="Enter campaign description"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Cover Image</Label>
                <div className="col-span-3 space-y-3">
                  <div className="flex items-center gap-4">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer bg-white"
                      aria-label="Select cover image"
                    >
                      <div className="flex flex-col items-center gap-1 text-sm font-medium">
                        <Plus className="w-5 h-5" />
                        <span>Add image</span>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      name="coverImageUrl"
                    />
                    <div className="flex items-center gap-3">
                      <div className="relative w-20 h-20">
                        <ImageWithFallback
                          src={imagePreview || formData.coverImageUrl}
                          alt="Campaign cover"
                          className="w-20 h-20 object-cover rounded-lg border bg-gray-100"
                          fallbackSrc="/campaign-fallback.svg"
                        />
                        {(imagePreview || formData.coverImageUrl) && (
                          <button
                            type="button"
                            onClick={handleRemoveCoverImage}
                            className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 shadow transition-colors hover:bg-red-50 hover:border-red-200 group"
                            aria-label="Remove cover image"
                          >
                            <X className="w-3 h-3 text-gray-600 transition-colors group-hover:text-red-600" />
                          </button>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>
                          {imagePreview || formData.coverImageUrl
                            ? "Selected image"
                            : "Using default placeholder image"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {selectedImage && (
                    <div className="text-sm text-gray-600">
                      <p>Selected: {selectedImage.name}</p>
                      <p>
                        Size: {(selectedImage.size / 1024 / 1024).toFixed(2)}{" "}
                        MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">
                  Tags
                </Label>
                <div className="col-span-3">
                  <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <div className="space-y-2 p-3">
                      <Popover open={tagSearchOpen} onOpenChange={setTagSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          role="combobox"
                          aria-expanded={tagSearchOpen}
                          className="w-full justify-between h-12 border-0 bg-transparent hover:bg-transparent focus-visible:ring-0"
                        >
                          {selectedTags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {selectedTags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {selectedTags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{selectedTags.length - 2} more
                                </Badge>
                              )}
                            </div>
                          ) : (
                            "Select tags..."
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput 
                            placeholder="Search or type new tag..." 
                            value={tagSearchValue}
                            onValueChange={setTagSearchValue}
                          />
                          <CommandEmpty>
                            {tagSearchValue && (
                              <div className="p-2">
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start"
                                  onClick={() => {
                                    if (tagSearchValue.trim() && !selectedTags.includes(tagSearchValue.trim())) {
                                      setSelectedTags([...selectedTags, tagSearchValue.trim()]);
                                      setTagSearchValue("");
                                      setTagSearchOpen(false);
                                    }
                                  }}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Create "{tagSearchValue}"
                                </Button>
                              </div>
                            )}
                          </CommandEmpty>
                          <CommandGroup>
                            {organizationTags
                              .filter(tag => !selectedTags.includes(tag))
                              .map((tag) => (
                                <CommandItem
                                  key={tag}
                                  onSelect={() => {
                                    setSelectedTags([...selectedTags, tag]);
                                    setTagSearchValue("");
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      selectedTags.includes(tag) ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  {tag}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    
                    {/* Selected tags display */}
                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-sm">
                            {tag}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => {
                                setSelectedTags(selectedTags.filter(t => t !== tag));
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <div className="space-y-2">
                  <Label htmlFor="goal">Fundraising Goal ($)</Label>
                  <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <Input
                      id="goal"
                      name="goal"
                      type="number"
                      value={formData.goal}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-2 h-15 ">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    name="status"
                    value={formData.status}
                    onValueChange={(value: string) =>
                      setFormData((prev: any) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger
                      id="status"
                      className="w-full h-12 bg-blue-500 border border-gray-300 rounded-lg px-3 flex items-center justify-start text-left focus-visible:ring-0 focus-visible:border-indigo-500 focus-visible:ring-indigo-100 transition-colors"
                    >
                      <SelectValue placeholder="Select status" className="h-12" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>


                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "advanced" && (
            <div className="space-y-6 max-h-[500px] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900">
                General Advanced Settings
              </h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <div className="col-span-3">
                  <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
                      placeholder="e.g., Environment, Education"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isGlobal" className="text-right">
                  Show on all kiosks
                </Label>
                <input
                  type="checkbox"
                  id="isGlobal"
                  name="isGlobal"
                  checked={formData.isGlobal}
                  onChange={handleChange}
                  className="col-span-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="longDescription" className="text-right pt-2">
                  Long Description
                </Label>
                <div className="col-span-3">
                  <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <Textarea
                      id="longDescription"
                      name="longDescription"
                      value={formData.longDescription}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
                      rows={5}
                      placeholder="Provide a more detailed description of the campaign."
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="videoUrl" className="text-right">
                  Video URL
                </Label>
                <div className="col-span-3">
                  <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <Input
                      id="videoUrl"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleChange}
                      className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
                      placeholder="Optional YouTube URL"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="galleryImages" className="text-right">
                  Gallery Images
                </Label>
                <div className="col-span-3 space-y-3">
                  <div className="flex items-start gap-3 flex-wrap">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        galleryImagePreviews.length >= 4
                          ? null
                          : document.getElementById("galleryImagesInput")?.click()
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (galleryImagePreviews.length < 4) {
                            document.getElementById("galleryImagesInput")?.click();
                          }
                        }
                      }}
                      className={`flex items-center justify-center w-20 h-20 border-2 border-dashed rounded-lg text-gray-500 transition cursor-pointer bg-white ${
                        galleryImagePreviews.length >= 4
                          ? "border-gray-200 text-gray-300 cursor-not-allowed"
                          : "border-gray-300 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
                      }`}
                      aria-label="Add gallery image"
                    >
                      <div className="flex flex-col items-center gap-1 text-sm font-medium">
                        <Plus className="w-5 h-5" />
                        <span>Add image</span>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      name="galleryImages"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="galleryImagesInput"
                      multiple
                    />
                    {galleryImagePreviews.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {galleryImagePreviews.map((src, index) => (
                          <div key={index} className="relative group">
                            <ImageWithFallback
                              src={src}
                              alt={`Gallery preview ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border bg-gray-100"
                              fallbackSrc="/campaign-fallback.svg"
                            />
                            <button
                              onClick={() => handleDeleteGalleryImage(src, index)}
                              className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition duration-150 hover:bg-red-50 hover:border-red-200"
                              title="Remove image"
                            >
                              <X className="h-3 w-3 text-gray-600 transition-colors group-hover:text-red-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedGalleryImages.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <p>
                        Selected:{" "}
                        {selectedGalleryImages
                          .map((file) => file.name)
                          .join(", ")}
                      </p>
                      <p>
                        Total Size:{" "}
                        {(
                          selectedGalleryImages.reduce(
                            (sum, file) => sum + file.size,
                            0
                          ) /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mt-8">Pricing Options</h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="predefinedAmounts" className="text-right">Predefined Amounts</Label>
                <div className="col-span-3">
                  <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <Input id="predefinedAmounts" name="predefinedAmounts" value={formData.predefinedAmounts} onChange={handleChange} className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent" placeholder="Comma-separated numbers, e.g., 10,25,50" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="allowCustomAmount" className="text-right">Allow Custom Amount</Label>
                <input type="checkbox" id="allowCustomAmount" name="allowCustomAmount" checked={formData.allowCustomAmount} onChange={handleChange} className="col-span-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minCustomAmount" className="text-right">Min Custom Amount</Label>
                <div className="col-span-3">
                  <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <Input id="minCustomAmount" name="minCustomAmount" type="number" value={formData.minCustomAmount} onChange={handleChange} className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent" placeholder="1" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxCustomAmount" className="text-right">Max Custom Amount</Label>
                <div className="col-span-3">
                  <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <Input id="maxCustomAmount" name="maxCustomAmount" type="number" value={formData.maxCustomAmount} onChange={handleChange} className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent" placeholder="1000" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="suggestedAmounts" className="text-right">Suggested Amounts</Label>
                <div className="col-span-3">
                  <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <Input id="suggestedAmounts" name="suggestedAmounts" value={formData.suggestedAmounts} onChange={handleChange} className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent" placeholder="Comma-separated numbers, e.g., 100,250" />
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-8">Subscription Settings</h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="enableRecurring" className="text-right">Enable Recurring</Label>
                <input type="checkbox" id="enableRecurring" name="enableRecurring" checked={formData.enableRecurring} onChange={handleChange} className="col-span-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recurringIntervals" className="text-right">Recurring Intervals</Label>
                <div className="col-span-3">
                  <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <Input id="recurringIntervals" name="recurringIntervals" value={formData.recurringIntervals} onChange={handleChange} className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent" placeholder="Comma-separated: monthly, quarterly, yearly" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="defaultRecurringInterval" className="text-right">Default Recurring Interval</Label>
                <Select name="defaultRecurringInterval" value={formData.defaultRecurringInterval} onValueChange={(value: string) => handleChange({ target: { name: 'defaultRecurringInterval', value } } as any)}>
                  <div className="col-span-3">
                    <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                      <SelectTrigger id="defaultRecurringInterval" className="w-full"><SelectValue /></SelectTrigger>
                    </div>
                  </div>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-8">Display Settings</h3>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="showProgressBar" className="text-right">Show Progress Bar</Label>
                <input type="checkbox" id="showProgressBar" name="showProgressBar" checked={formData.showProgressBar} onChange={handleChange} className="col-span-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="showDonorCount" className="text-right">Show Donor Count</Label>
                <input type="checkbox" id="showDonorCount" name="showDonorCount" checked={formData.showDonorCount} onChange={handleChange} className="col-span-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="showRecentDonations" className="text-right">Show Recent Donations</Label>
                <input type="checkbox" id="showRecentDonations" name="showRecentDonations" checked={formData.showRecentDonations} onChange={handleChange} className="col-span-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxRecentDonations" className="text-right">Max Recent Donations</Label>
                <div className="col-span-3">
                  <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <Input id="maxRecentDonations" name="maxRecentDonations" type="number" value={formData.maxRecentDonations} onChange={handleChange} className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent" placeholder="5" />
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-8">Call-to-Action</h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="primaryCTAText" className="text-right">Primary CTA Text</Label>
                <div className="col-span-3">
                  <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <Input id="primaryCTAText" name="primaryCTAText" value={formData.primaryCTAText} onChange={handleChange} className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent" placeholder="e.g., Donate Now" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="secondaryCTAText" className="text-right">Secondary CTA Text</Label>
                <div className="col-span-3">
                  <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <Input id="secondaryCTAText" name="secondaryCTAText" value={formData.secondaryCTAText} onChange={handleChange} className="w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent" placeholder="e.g., Learn More" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="urgencyMessage" className="text-right pt-2">Urgency Message</Label>
                <div className="col-span-3">
                  <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                    <Textarea id="urgencyMessage" name="urgencyMessage" value={formData.urgencyMessage} onChange={handleChange} className="w-full px-3 py-2 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent" rows={2} placeholder="e.g., Only 10 days left to reach our goal!" />
                  </div>
                </div>
              </div>


            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2 pt-4 border-t flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={uploadingImage || isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} disabled={isSaveDisabled || isSubmitting}>
            {isSubmitting ? (isEditMode ? "Saving..." : "Creating...") : saveButtonText}
          </Button>
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

  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("endDate");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<DocumentData | null>(null);
  const [confirmDeleteInput, setConfirmDeleteInput] = useState("");

  const { campaigns, updateWithImage, createWithImage, remove, loading } =
    useCampaignManagement(userSession.user.organizationId || "");

  const handleDeleteClick = (campaign: DocumentData) => {
    setCampaignToDelete(campaign);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (campaignToDelete && confirmDeleteInput === campaignToDelete.title) {
      try {
        await remove(campaignToDelete.id);
        setIsDeleteDialogOpen(false);
        setCampaignToDelete(null);
        setConfirmDeleteInput("");
        // Optionally, show a success toast or message
      } catch (error) {
        console.error("Error deleting campaign:", error);
        // Optionally, show an error toast or message
      }
    } else {
      // Optionally, show an error message if input doesn't match
      console.log("Confirmation input does not match campaign title.");
    }
  };

  // Helper function to remove undefined properties from an object
  const removeUndefined = (obj: any): any => {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(removeUndefined).filter((item) => item !== undefined);
    }

    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (value !== undefined) {
          const processedValue = removeUndefined(value);
          if (processedValue !== undefined) {
            newObj[key] = processedValue;
          }
        }
      }
    }
    // If all properties of an object are undefined, return undefined so it can be removed from parent.
    if (Object.keys(newObj).length === 0 && Object.keys(obj).length > 0) {
      return undefined;
    }
    return newObj;
  };

  const handleEditClick = (campaign: DocumentData) => {
    setEditingCampaign(campaign);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (
    data: DocumentData,
    isNew: boolean,
    campaignId?: string
  ) => {
    try {
      const dataToSave: { [key: string]: any } = {
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

      const finalDataToSave = removeUndefined(dataToSave);

      if (isNew) {
        await createWithImage(finalDataToSave);
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

  const uniqueCategories: string[] = Array.from(
    new Set(
      (campaigns as any[])
        .map((c) => (typeof c.category === 'string' ? c.category : ''))
        .filter((v): v is string => Boolean(v))
    )
  );

  const filteredAndSortedCampaigns = campaigns
    .filter((campaign: any) => {
      const matchesSearch = campaign.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || campaign.category === categoryFilter;
      const matchesDate = !dateFilter || (campaign.endDate && new Date(campaign.endDate.seconds * 1000).toDateString() === dateFilter.toDateString());
      return matchesSearch && matchesStatus && matchesCategory && matchesDate;
    })
    .sort((a: any, b: any) => {
      switch (sortOrder) {
        case "title":
          return a.title.localeCompare(b.title);
        case "endDate":
          // Assuming endDate is a Timestamp object, convert to Date for comparison
          const dateA = a.endDate?.seconds ? new Date(a.endDate.seconds * 1000).getTime() : 0;
          const dateB = b.endDate?.seconds ? new Date(b.endDate.seconds * 1000).getTime() : 0;
          return dateA - dateB;
        case "goal":
          return (a.goal || 0) - (b.goal || 0);
        case "createdAt": // Assuming createdAt is also a Timestamp or string that can be compared
          // Need to parse createdAt if it's a string, or convert if Timestamp
          const createdA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000).getTime() : 0;
          const createdB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000).getTime() : 0;
          return createdA - createdB;
        default:
          return 0;
      }
    });

  const exportToCsv = (data: DocumentData[]) => {
    if (data.length === 0) {
      alert("No campaign data to export.");
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const csvContent = data.map(row => Object.values(row).map(value => {
      const stringValue = String(value);
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',')).join('\n');

    const csv = `${headers}\n${csvContent}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `campaigns_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout
      onNavigate={onNavigate}
      onLogout={onLogout}
      userSession={userSession}
      hasPermission={hasPermission}
      activeScreen="admin-campaigns"
    >
      <div className="space-y-6">
        <header className="bg-white shadow-sm border-b rounded-md">
          <div className="px-2 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between h-auto sm:h-16 gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("admin")}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
                <div className="h-6 w-px bg-gray-300 hidden sm:block" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Campaign Management
                  </h1>
                  <p className="text-sm text-gray-600 hidden lg:block">
                    Configure and monitor campaigns
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => exportToCsv(filteredAndSortedCampaigns)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  className="bg-indigo-600 text-white hidden sm:inline-flex"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Campaign
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="w-full sm:max-w-md">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 mr-2" />
                <div className="border border-gray-300 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-colors">
                  <Input
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ml-5 pl-10 w-full h-12 px-3 bg-transparent outline-none border-0 focus-visible:ring-0 focus-visible:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto sm:hidden"
                onClick={() => exportToCsv(filteredAndSortedCampaigns)}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto sm:hidden"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Campaign
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full h-5 border-0 shadow-none focus:ring-0 bg-transparent hover:bg-transparent font-semibold text-gray-900 [&>span]:font-semibold">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full h-10 border-0 shadow-none focus:ring-0 bg-transparent hover:bg-transparent font-semibold text-gray-900 [&>span]:font-semibold">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full h-10 border-0 shadow-none focus:ring-0 bg-transparent hover:bg-transparent font-semibold text-gray-900 [&>span]:font-semibold">
                    <SelectValue placeholder="End Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="endDate">End Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="goal">Goal Amount</SelectItem>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-between text-left font-semibold w-full h-10 px-3 flex items-center border-0 shadow-none hover:bg-transparent bg-transparent text-gray-900"
                    >
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>
                          {dateFilter
                            ? dateFilter.toLocaleDateString()
                            : "Filter by date"}
                        </span>
                      </div>
                      <svg
                        className="h-4 w-4 opacity-50"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFilter}
                      onSelect={(date) => {
                        setDateFilter(date);
                        setShowCalendar(false);
                      }}
                      initialFocus
                    />
                    <div className="p-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDateFilter(undefined);
                          setShowCalendar(false);
                        }}
                        className="w-full"
                      >
                        Clear Date Filter
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>
          </div>
          {/* Campaigns Table/List – aligned with Donations layout */}
          <Card>
            <CardHeader>
              <CardTitle>Campaigns ({filteredAndSortedCampaigns.length})</CardTitle>
              <CardDescription>Manage your donation campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-6 gap-4 py-4 px-6 border-b border-gray-200">
                      <Skeleton className="h-10 w-full col-span-2" />
                      <Skeleton className="h-10 w-full col-span-1" />
                      <Skeleton className="h-10 w-full col-span-1" />
                      <Skeleton className="h-10 w-full col-span-1" />
                      <Skeleton className="h-10 w-full col-span-1" />
                    </div>
                  ))}
                </div>
              ) : filteredAndSortedCampaigns.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Goal</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedCampaigns.map((campaign: any) => {
                        const progress =
                          campaign.goal && campaign.raised
                            ? Math.min(
                                (Number(campaign.raised) / Number(campaign.goal)) *
                                  100,
                                100
                              )
                            : 0;

                        return (
                          <TableRow key={campaign.id ?? campaign.title}>
                            <TableCell>
                              <div className="flex items-start gap-3">
                                <ImageWithFallback
                                  src={campaign.coverImageUrl}
                                  alt={campaign.title}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0 bg-gray-100"
                                  fallbackSrc="/campaign-fallback.svg"
                                />
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <div>
                                      <p className="font-medium text-gray-900">
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
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-gray-500">
                                            {progress.toFixed(0)}%
                                          </span>
                                          <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                              className={`h-full ${getProgressColor(
                                                progress
                                              )}`}
                                              style={{ width: `${progress}%` }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                  {Array.isArray(campaign.tags) &&
                                    campaign.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
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
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                                  campaign.status ?? "unknown"
                                )}`}
                              >
                                {campaign.status ?? "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">
                                {typeof campaign.goal === "number"
                                  ? campaign.goal.toLocaleString()
                                  : "—"}
                              </span>
                            </TableCell>
                            <TableCell>{formatDate(campaign.endDate)}</TableCell>
                            <TableCell className="text-right">
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
                                  <FaTrashAlt className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
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
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 border-0 shadow-2xl">
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
                className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmDelete}
                className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white border-0"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default CampaignManagement;
