import React, { useEffect, useState, useRef, useCallback } from "react";
import { Screen, AdminSession, Permission } from "../../App";
import { DocumentData, Timestamp } from "firebase/firestore";
import { useCampaignManagement } from "../../hooks/useCampaignManagement";
import { deleteFile } from "../../lib/firebase"; // Import deleteFile
import * as firebaseService from "../../api/firestoreService"; // Import firebaseService
import UploadButton from "../shared/UploadButton"; // Import the new UploadButton component

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { AlertTriangle } from "lucide-react"; // Import AlertTriangle
import { Skeleton } from "../ui/skeleton";
import { Ghost } from "lucide-react";
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
} from "../ui/alert-dialog";
import { Calendar as CalendarIcon } from "lucide-react";

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: DocumentData | null; // Optional campaign for editing
  onSave: (
    data: DocumentData,
    isNew: boolean,
    campaignId?: string
  ) => Promise<void>;
}

const CampaignDialog = ({
  open,
  onOpenChange,
  campaign,
  onSave,
}: CampaignDialogProps) => {
  const initialFormData = {
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
    predefinedAmounts: "", // comma-separated
    allowCustomAmount: true,
    minCustomAmount: 1,
    maxCustomAmount: 1000,
    // Adding more CampaignConfiguration fields
    suggestedAmounts: "", // comma-separated
    enableRecurring: false,
    recurringIntervals: "", // comma-separated
    defaultRecurringInterval: "monthly",
    recurringDiscount: 0,
    // Adding Display Settings fields
    displayStyle: "grid",
    showProgressBar: true,
    showDonorCount: true,
    showRecentDonations: true,
    maxRecentDonations: 5,
    // Adding Call-to-Action fields
    primaryCTAText: "Donate Now",
    secondaryCTAText: "",
    urgencyMessage: "",
    // Adding Visual Customization fields
    accentColor: "#4F46E5",
    backgroundImage: "",
    theme: "default",
    // Adding Form Configuration fields
    requiredFields: "", // comma-separated
    optionalFields: "", // comma-separated
    enableAnonymousDonations: true,
    // Adding Social Features fields
    enableSocialSharing: true,
    shareMessage: "",
    enableDonorWall: true,
    enableComments: true,
  };

  const [formData, setFormData] = useState<DocumentData>(initialFormData);
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
  const [isUploadingGalleryImages, setIsUploadingGalleryImages] = useState(false);

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
      setFormData(initialFormData);
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

  const handleCoverImageUpload = async () => {
    if (selectedImage) {
      try {
        const uploadedData = await handleImageUpload(campaign?.id, formData);
        if (uploadedData && uploadedData.coverImageUrl) {
          setFormData((prev) => ({ ...prev, coverImageUrl: uploadedData.coverImageUrl }));
          setImagePreviewUrl(uploadedData.coverImageUrl); // Update preview with uploaded URL
        }
      } catch (error) {
        alert("Failed to upload cover image. Please try again.");
      }
    }
  };

  const handleOrganizationLogoUpload = async () => {
    if (selectedOrganizationLogo) {
      setIsUploadingOrganizationLogo(true); // Set loading state
      try {
        const url = await uploadFile(
          selectedOrganizationLogo,
          `campaigns/${campaign?.id || "new"}/organizationLogo/${
            selectedOrganizationLogo.name
          }`
        );
        if (url) {
          setFormData((prev) => ({ ...prev, organizationInfoLogo: url }));
          setOrganizationLogoPreview(url); // Update preview with uploaded URL
        }
      } catch (error) {
        alert("Failed to upload organization logo. Please try again.");
      } finally {
        setIsUploadingOrganizationLogo(false); // Reset loading state
      }
    }
  };

  const handleGalleryImagesUpload = async () => {
    if (selectedGalleryImages.length > 0) {
      setIsUploadingGalleryImages(true); // Set loading state
      try {
        const imageUrls: string[] = [];
        // Combine existing gallery images with newly selected ones for upload
        const allImagesToUpload = [
          ...(formData.galleryImages
            ? String(formData.galleryImages).split(",").filter(Boolean)
            : []), // Existing URLs
          ...selectedGalleryImages, // New files
        ];

        // Filter out any files that are already URLs (meaning they are existing images)
        const filesToUpload = allImagesToUpload.filter(
          (item) => typeof item !== "string"
        ) as File[];

        // Keep track of existing URLs that are not being deleted
        const existingUrls = allImagesToUpload.filter(
          (item) => typeof item === "string"
        ) as string[];

        for (const file of filesToUpload) {
          try {
            const url = await uploadFile(
              file,
              `campaigns/${campaign?.id || "new"}/galleryImages/${file.name}`
            );
            if (url) {
              imageUrls.push(url);
            }
          } catch (error) {
            alert(
              `Failed to upload gallery image ${file.name}. Please try again.`
            );
            return;
          }
        }
        if (imageUrls.length > 0 || existingUrls.length > 0) {
          const finalGalleryImages = [...existingUrls, ...imageUrls];
          setFormData((prev) => ({
            ...prev,
            galleryImages: finalGalleryImages.join(","),
          }));
          setGalleryImagePreviews(finalGalleryImages); // Update preview with uploaded URLs
          setSelectedGalleryImages([]); // Clear selected files after upload
        }
      } catch (error) {
        alert("Failed to upload gallery images. Please try again.");
      } finally {
        setIsUploadingGalleryImages(false); // Reset loading state
      }
    }
  };

  const handleDeleteGalleryImage = async (imageToDelete: string, index: number) => {
    if (!campaign?.id) {
      // If it's a new campaign and the image hasn't been uploaded yet, just remove from state
      setGalleryImagePreviews((prev) => prev.filter((_, i) => i !== index));
      setSelectedGalleryImages((prev) => prev.filter((_, i) => i !== index));
      setFormData((prev) => ({
        ...prev,
        galleryImages: (prev.galleryImages as string)
          .split(",")
          .filter((img) => img !== imageToDelete)
          .join(","),
      }));
      return;
    }

    try {
      // Attempt to delete from storage
      await deleteFile(imageToDelete); // Call the deleteFile function

      // Remove from form data and previews
      const updatedGalleryImages = (formData.galleryImages as string)
        .split(",")
        .filter((img) => img !== imageToDelete);
      setFormData((prev) => ({
        ...prev,
        galleryImages: updatedGalleryImages.join(","),
      }));
      setGalleryImagePreviews(updatedGalleryImages);

      // Also update selectedGalleryImages if the deleted image was a newly selected file
      setSelectedGalleryImages((prev) =>
        prev.filter((file) => URL.createObjectURL(file) !== imageToDelete)
      );
      alert("Image deleted successfully.");
    } catch (error) {
      alert("Failed to delete image. Please try again.");
    }
  };

  const handleSaveChanges = async () => {
    if (!formData.title || !formData.description) {
      alert("Title and Description are required.");
      return;
    }

    let finalData = { ...formData };

    // Upload organization logo
    if (selectedOrganizationLogo && !finalData.organizationInfoLogo) { // Only upload if not already uploaded
      try {
        const url = await uploadFile(
          selectedOrganizationLogo,
          `campaigns/${campaign?.id || "new"}/organizationLogo/${
            selectedOrganizationLogo.name
          }`
        );
        if (url) {
          finalData = { ...finalData, organizationInfoLogo: url };
        }
      } catch (error) {
        alert("Failed to upload organization logo. Please try again.");
        return;
      }
    }

    // Upload gallery images
    if (selectedGalleryImages.length > 0 && !finalData.galleryImages) { // Only upload if not already uploaded
      const imageUrls: string[] = [];
      for (const file of selectedGalleryImages) {
        try {
          const url = await uploadFile(
            file,
            `campaigns/${campaign?.id || "new"}/galleryImages/${file.name}`
          );
          if (url) {
            imageUrls.push(url);
          }
        } catch (error) {
          alert(
            `Failed to upload gallery image ${file.name}. Please try again.`
          );
          return;
        }
      }
      if (imageUrls.length > 0) {
        finalData = { ...finalData, galleryImages: imageUrls.join(",") };
      }
    }

    await onSave(finalData, !isEditMode, campaign?.id);
    handleDialogClose();
  };

  const handleDialogClose = () => {
    clearImageSelection();
    setFormData(initialFormData); // Reset for add mode
    // Clear advanced image selections/previews
    setSelectedOrganizationLogo(null);
    setOrganizationLogoPreview(null);
    setSelectedGalleryImages([]);
    setGalleryImagePreviews([]);
    // Removed onOpenChange(false) to prevent infinite loop
  };

  const dialogTitle = isEditMode
    ? `Edit Campaign: ${campaign?.title}`
    : "Add New Campaign";
  const dialogDescription = isEditMode
    ? "Make changes to your campaign below. Click save when you're done."
    : "Fill in the details below to create a new campaign.";
  const saveButtonText = isEditMode ? "Save Changes" : "Create Campaign";
  const isSaveDisabled =
    uploadingImage || !formData.title || !formData.description ||
    (selectedOrganizationLogo && !formData.organizationInfoLogo) ||
    (selectedGalleryImages.length > 0 && !formData.galleryImages);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
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
              className={`${
                activeTab === "basic"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
              onClick={() => setActiveTab("basic")}
            >
              Basic Info
            </button>
            <button
              className={`${
                activeTab === "advanced"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
              onClick={() => setActiveTab("advanced")}
            >
              Advanced Settings
            </button>
          </nav>
        </div>

        <div className="grid gap-6 py-4">
          {activeTab === "basic" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title {isEditMode ? "" : "*"}
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="col-span-3"
                  placeholder="Enter campaign title"
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description {isEditMode ? "" : "*"}
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="col-span-3"
                  rows={3}
                  placeholder="Enter campaign description"
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Cover Image</Label>
                <div className="col-span-3 space-y-4">
                  {imagePreview && (
                    <div className="flex items-center space-x-4">
                      <img
                        src={imagePreview}
                        alt="Campaign cover"
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <div className="text-sm text-gray-600">
                        <p>
                          {isEditMode
                            ? "Current cover image"
                            : "Selected image"}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        name="coverImageUrl"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-2"
                      >
                        <FaImage className="w-4 h-4" />
                        <span>Select Image</span>
                      </Button>
                      {selectedImage && (
                        <UploadButton
                          onClick={handleCoverImageUpload}
                          disabled={false}
                          isUploading={uploadingImage}
                        />
                      )}
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
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">
                  Tags
                </Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="col-span-3"
                  placeholder="health, education, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <div className="space-y-2">
                  <Label htmlFor="goal">Fundraising Goal ($)</Label>
                  <Input
                    id="goal"
                    name="goal"
                    type="number"
                    value={formData.goal}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    name="status"
                    value={formData.status}
                    onValueChange={(value) =>
                      handleChange({ target: { name: "status", value } } as any)
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
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
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
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
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="col-span-3"
                  placeholder="e.g., Environment, Education"
                />
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
                <Textarea
                  id="longDescription"
                  name="longDescription"
                  value={formData.longDescription}
                  onChange={handleChange}
                  className="col-span-3"
                  rows={5}
                  placeholder="Provide a more detailed description of the campaign."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="videoUrl" className="text-right">
                  Video URL
                </Label>
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  className="col-span-3"
                  placeholder="Optional YouTube URL"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="galleryImages" className="text-right">
                  Gallery Images
                </Label>
                <div className="col-span-3 space-y-4">
                  {galleryImagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {galleryImagePreviews.map((src, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={src}
                            alt={`Gallery preview ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                          <button
                            onClick={() => handleDeleteGalleryImage(src, index)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete"
                          >
                            <FaTrashAlt className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        name="galleryImages"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="galleryImagesInput"
                        multiple
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("galleryImagesInput")?.click()
                        }
                        className="flex items-center space-x-2"
                        disabled={galleryImagePreviews.length >= 4}
                      >
                        <FaPlus className="w-4 h-4" />
                        <span>Add Image</span>
                      </Button>
                      {selectedGalleryImages.length > 0 && (
                        <UploadButton
                          onClick={handleGalleryImagesUpload}
                          disabled={false}
                          isUploading={isUploadingGalleryImages}
                        />
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
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mt-8">Pricing Options</h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="predefinedAmounts" className="text-right">Predefined Amounts</Label>
                <Input id="predefinedAmounts" name="predefinedAmounts" value={formData.predefinedAmounts} onChange={handleChange} className="col-span-3" placeholder="Comma-separated numbers, e.g., 10,25,50"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="allowCustomAmount" className="text-right">Allow Custom Amount</Label>
                <input type="checkbox" id="allowCustomAmount" name="allowCustomAmount" checked={formData.allowCustomAmount} onChange={handleChange} className="col-span-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minCustomAmount" className="text-right">Min Custom Amount</Label>
                <Input id="minCustomAmount" name="minCustomAmount" type="number" value={formData.minCustomAmount} onChange={handleChange} className="col-span-3" placeholder="1"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxCustomAmount" className="text-right">Max Custom Amount</Label>
                <Input id="maxCustomAmount" name="maxCustomAmount" type="number" value={formData.maxCustomAmount} onChange={handleChange} className="col-span-3" placeholder="1000"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="suggestedAmounts" className="text-right">Suggested Amounts</Label>
                <Input id="suggestedAmounts" name="suggestedAmounts" value={formData.suggestedAmounts} onChange={handleChange} className="col-span-3" placeholder="Comma-separated numbers, e.g., 100,250"/>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-8">Subscription Settings</h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="enableRecurring" className="text-right">Enable Recurring</Label>
                <input type="checkbox" id="enableRecurring" name="enableRecurring" checked={formData.enableRecurring} onChange={handleChange} className="col-span-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recurringIntervals" className="text-right">Recurring Intervals</Label>
                <Input id="recurringIntervals" name="recurringIntervals" value={formData.recurringIntervals} onChange={handleChange} className="col-span-3" placeholder="Comma-separated: monthly, quarterly, yearly"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="defaultRecurringInterval" className="text-right">Default Recurring Interval</Label>
                <Select name="defaultRecurringInterval" value={formData.defaultRecurringInterval} onValueChange={(value) => handleChange({ target: { name: 'defaultRecurringInterval', value } } as any)}>
                  <SelectTrigger id="defaultRecurringInterval" className="col-span-3"><SelectValue /></SelectTrigger>
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
                <input type="checkbox" id="showProgressBar" name="showProgressBar" checked={formData.showProgressBar} onChange={handleChange} className="col-span-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="showDonorCount" className="text-right">Show Donor Count</Label>
                <input type="checkbox" id="showDonorCount" name="showDonorCount" checked={formData.showDonorCount} onChange={handleChange} className="col-span-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="showRecentDonations" className="text-right">Show Recent Donations</Label>
                <input type="checkbox" id="showRecentDonations" name="showRecentDonations" checked={formData.showRecentDonations} onChange={handleChange} className="col-span-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxRecentDonations" className="text-right">Max Recent Donations</Label>
                <Input id="maxRecentDonations" name="maxRecentDonations" type="number" value={formData.maxRecentDonations} onChange={handleChange} className="col-span-3" placeholder="5"/>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-8">Call-to-Action</h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="primaryCTAText" className="text-right">Primary CTA Text</Label>
                <Input id="primaryCTAText" name="primaryCTAText" value={formData.primaryCTAText} onChange={handleChange} className="col-span-3" placeholder="e.g., Donate Now"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="secondaryCTAText" className="text-right">Secondary CTA Text</Label>
                <Input id="secondaryCTAText" name="secondaryCTAText" value={formData.secondaryCTAText} onChange={handleChange} className="col-span-3" placeholder="e.g., Learn More"/>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="urgencyMessage" className="text-right pt-2">Urgency Message</Label>
                <Textarea id="urgencyMessage" name="urgencyMessage" value={formData.urgencyMessage} onChange={handleChange} className="col-span-3" rows={2} placeholder="e.g., Only 10 days left to reach our goal!"/>
              </div>

              
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleDialogClose}
            disabled={uploadingImage}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} disabled={isSaveDisabled}>
            {saveButtonText}
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
    useCampaignManagement(userSession.user.organizationId);

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
        // Optionally, show an error toast or message
      }
    } else {
      // Optionally, show an error message if input doesn't match
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
        tags: data.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean),
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

  const uniqueCategories = Array.from(new Set(campaigns.map(c => c.category).filter(Boolean)));

  const filteredAndSortedCampaigns = campaigns
    .filter((campaign) => {
      const matchesSearch = campaign.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            campaign.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || campaign.category === categoryFilter;
      const matchesDate = !dateFilter || (campaign.endDate && new Date(campaign.endDate.seconds * 1000).toDateString() === dateFilter.toDateString());
      return matchesSearch && matchesStatus && matchesCategory && matchesDate;
    })
    .sort((a, b) => {
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
    <>
      <div className="min-h-screen bg-gray-50 font-sans">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("admin-dashboard")}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Campaign Management
                  </h1>
                  <p className="text-sm text-gray-600">
                    Configure and monitor Campaigns
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={() => exportToCsv(filteredAndSortedCampaigns)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Logs
                </Button>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Campaign
                </Button>
              </div>
            </div>
          </div>
        </header>
        

        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Campaigns ({filteredAndSortedCampaigns.length})
            </h2>
            <p className="text-gray-500 text-sm">
              Manage your donation campaigns
            </p>
          </div>

          {/* Filters and Sorting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="lg:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="endDate">End Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="goal">Goal Amount</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
              </SelectContent>
            </Select>

            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger>
                <Button variant="outline" className="justify-start text-left font-normal w-full">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? dateFilter.toLocaleDateString() : "Filter by Date"}
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
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="hidden md:grid grid-cols-10 text-sm font-medium text-gray-500 bg-gray-50 py-3 px-6 border-b border-gray-200">
              <div className="col-span-3">Campaign</div>
              <div className="col-span-2">Progress</div>
              <div className="col-span-2">Performance</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">End Date</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            <div className="divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-10 items-center py-4 px-6">
                    <Skeleton className="h-10 w-full col-span-3" />
                    <Skeleton className="h-10 w-full col-span-2 ml-4" />
                    <Skeleton className="h-10 w-full col-span-2 ml-4" />
                    <Skeleton className="h-10 w-full col-span-1 ml-4" />
                    <Skeleton className="h-10 w-full col-span-1 ml-4" />
                    <Skeleton className="h-10 w-10 col-span-1 ml-auto" />
                  </div>
                ))
              ) : filteredAndSortedCampaigns.length > 0 ? (
                filteredAndSortedCampaigns.map((campaign) => {
                  const collected = Number(campaign.raised) || 0;
                  const goal = Number(campaign.goal) || 1;
                  const progress = Math.round((collected / goal) * 100);
                  const donors = campaign.donationCount || 0;
                  const avgDonation =
                    donors > 0 ? (collected / donors).toFixed(2) : "0.00";
                  const status = campaign.status || "Active";
                  const endDate = campaign.endDate?.seconds
                    ? new Date(
                        campaign.endDate.seconds * 1000
                      ).toLocaleDateString("en-US")
                    : "N/A";
                  const isExpired = campaign.endDate?.seconds
                    ? new Date(campaign.endDate.seconds * 1000) < new Date()
                    : false;

                  return (
                    <div
                      key={campaign.id}
                      className="block md:grid md:grid-cols-10 items-center py-4 px-6 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="md:col-span-3 flex items-center space-x-3 mb-4 md:mb-0">
                        <div className="relative">
                          <img
                            src={
                              campaign.coverImageUrl ||
                              "https://via.placeholder.com/40"
                            }
                            alt={campaign.title}
                            className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                          />
                          {campaign.coverImageUrl && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {campaign.title}
                          </p>
                          {/* <p className="text-xs text-gray-500">{campaign.tags.split(',').map((t: string) => t.trim()).filter(Boolean).join(' · ')}</p> */}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 md:col-span-7 md:grid-cols-7 md:gap-0">
                        <div className="col-span-1 md:col-span-2 space-y-1">
                          <p className="text-sm font-medium text-gray-800">
                            ${collected.toLocaleString()}{" "}
                            <span className="text-gray-500 font-normal">
                              ({progress}%)
                            </span>
                          </p>
                          <div className="w-4/5 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(
                                progress
                              )}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Goal: ${goal.toLocaleString()}
                          </p>
                        </div>

                        <div className="col-span-1 md:col-span-2 text-sm text-gray-800">
                          <p>{donors} donors</p>
                          <p>${avgDonation} avg</p>
                        </div>

                        <div className="col-span-1 md:col-span-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="col-span-1 md:col-span-1 text-sm text-gray-800">
                          <p>{endDate}</p>
                          {isExpired && (
                            <p className="text-xs text-red-500">Expired</p>
                          )}
                        </div>

                        <div className="col-span-2 md:col-span-1 flex justify-start md:justify-end items-center space-x-2 text-gray-500 mt-4 md:mt-0">
                          {hasPermission("edit_campaign") && (
                            <button
                              onClick={() => handleEditClick(campaign)}
                              className="p-2 hover:bg-gray-100 rounded-md"
                              title="Edit"
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClick(campaign)}
                            className="p-2 hover:bg-red-100 rounded-md text-red-500"
                            title="Delete"
                          >
                            <FaTrashAlt className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Ghost className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create a new campaign to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CampaignDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            // Call handleDialogClose only when the dialog is closing
            setEditingCampaign(null); // Additionally reset editing campaign state
          }
        }}
        campaign={editingCampaign}
        onSave={handleSave}
      />

      <CampaignDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            // Call handleDialogClose only when the dialog is closing
            // No need to reset editingCampaign for add dialog
          }
        }}
        onSave={(data, isNew) => handleSave(data, isNew, undefined)}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the campaign
              <span className="font-bold"> {campaignToDelete?.title} </span>
              and remove all its associated data.
              Please type "{campaignToDelete?.title}" to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder={campaignToDelete?.title}
            value={confirmDeleteInput}
            onChange={(e) => setConfirmDeleteInput(e.target.value)}
            className="mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={confirmDeleteInput !== campaignToDelete?.title}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CampaignManagement;
