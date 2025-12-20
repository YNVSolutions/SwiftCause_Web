import React, { useState, useEffect } from "react";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../shared/ui/tabs";
// import { ImageWithFallback } from "../../../shared/ui/figma/ImageWithFallback";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card";
import { Badge } from "../../../shared/ui/badge";
import { Switch } from "../../../shared/ui/switch";
import { Checkbox } from "../../../shared/ui/checkbox";
import { Separator } from "../../../shared/ui/separator";
import { ScrollArea } from "../../../shared/ui/scroll-area";
import {
  Monitor,
  Settings,
  Target,
  Users,
  DollarSign,
  MapPin,
  Star,
  Globe,
  LayoutGrid,
  List,
  Shuffle,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  RotateCcw,
  Eye,
} from "lucide-react";
import { Kiosk, Campaign } from "../../../shared/types";

type DeviceInfoForm = (Kiosk["deviceInfo"]) & {
  modelCustom?: string;
  osCustom?: string;
  screenSizeCustom?: string;
};

type KioskForm = Omit<Kiosk, "deviceInfo"> & { deviceInfo?: DeviceInfoForm };

interface KioskCampaignAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kiosk: Kiosk | null;
  onSave: (kiosk: Kiosk) => void;
  campaigns: Campaign[];
}

export function KioskCampaignAssignmentDialog({
  open,
  onOpenChange,
  kiosk,
  onSave,
  campaigns,
}: KioskCampaignAssignmentDialogProps) {
  const [formData, setFormData] = useState<KioskForm>(() => {
    if (kiosk) return { ...kiosk };

    return {
      id: "",
      name: "",
      location: "",
      status: "offline",
      assignedCampaigns: [],
      lastActive: "",
      totalDonations: 0,
      totalRaised: 0,
      accessCode: "",
      qrCode: "",
      defaultCampaign: "",
      settings: {
        displayMode: "grid",
        showAllCampaigns: false,
        maxCampaignsDisplay: 6,
        autoRotateCampaigns: false,
        rotationInterval: 30,
      },
    };
  });

  useEffect(() => {
    if (kiosk) {
      setFormData({
        ...kiosk,
        settings: { 
          displayMode: "grid",
          showAllCampaigns: false,
          maxCampaignsDisplay: 6,
          autoRotateCampaigns: false,
          rotationInterval: 30,
          ...kiosk.settings, 
        },
      });
    }
  }, [kiosk]);

  const [activeTab, setActiveTab] = useState("campaigns");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSave = () => {
    
    const device = formData.deviceInfo || {};
    const normalizedDevice: Kiosk["deviceInfo"] = {
      ...device,
      model:
        device.model === "Custom" && device.modelCustom
          ? device.modelCustom
          : device.model,
      os:
        device.os === "Other" && device.osCustom
          ? device.osCustom
          : device.os,
      screenSize:
        device.screenSize === "Custom" && device.screenSizeCustom
          ? device.screenSizeCustom
          : device.screenSize,
    };
    
    delete (normalizedDevice as any).modelCustom;
    delete (normalizedDevice as any).osCustom;
    delete (normalizedDevice as any).screenSizeCustom;

    const payload: Kiosk = { ...(formData as Kiosk), deviceInfo: normalizedDevice };
    onSave(payload);
    onOpenChange(false);
  };

  const updateSettings = (updates: Partial<Kiosk["settings"]>) => {
    setFormData((prev) => ({
      ...prev,
      settings: { ...prev.settings!, ...updates },
    }));
  };

  const toggleCampaignAssignment = (campaignId: string) => {
    setFormData((prev) => {
      const assigned = prev.assignedCampaigns || [];
      const isAssigned = assigned.includes(campaignId);

      const newAssigned = isAssigned
        ? assigned.filter((id) => id !== campaignId)
        : [...assigned, campaignId];

      
      let newDefault = prev.defaultCampaign;
      if (isAssigned && prev.defaultCampaign === campaignId) {
        newDefault = newAssigned.length > 0 ? newAssigned[0] : "";
      }

      return {
        ...prev,
        assignedCampaigns: newAssigned,
        defaultCampaign: newDefault,
      };
    });
  };

  const setDefaultCampaign = (campaignId: string) => {
    setFormData((prev) => ({
      ...prev,
      defaultCampaign: campaignId,
    }));
  };

  const assignedCampaigns = campaigns.filter((c) =>
    formData.assignedCampaigns?.includes(c.id)
  );

  const unassignedCampaigns = campaigns.filter(
    (c) => !formData.assignedCampaigns?.includes(c.id) && !c.isGlobal
  );

  const globalCampaigns = campaigns.filter((c) => c.isGlobal);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-5xl max-h-[90vh] flex flex-col w-full">
        <DialogHeader className="pb-6 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <Monitor className="w-6 h-6 text-indigo-600" />
            <span className="text-xl font-semibold">Configure Kiosk: {kiosk?.name}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Manage campaign assignments and display settings for this kiosk device.
          </DialogDescription>
        </DialogHeader>
  
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
          <TabsList className="flex w-full mb-6 flex-shrink-0">
            <TabsTrigger value="details" className="flex items-center gap-2 py-3">
              <Monitor className="w-4 h-4" />
              <span>Details</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2 py-3">
              <Target className="w-4 h-4" />
              <span>Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 py-3">
              <Settings className="w-4 h-4" />
              <span>Display</span>
            </TabsTrigger>
          </TabsList>
  
          <div className="flex-1 overflow-y-auto min-h-0">
            <TabsContent value="details" className="mt-0 space-y-0 p-6">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pb-6">
                  <CardTitle className="text-lg">Kiosk Details</CardTitle>
                  <CardDescription>
                    Modify the basic information for this kiosk.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="px-0 space-y-8">
                  
                  <div className="space-y-6">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-2">
                      Basic Information
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                          Kiosk Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                          className="h-10"
                          placeholder="Enter kiosk name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                          Location
                        </Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                          className="h-10"
                          placeholder="Enter location"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="accessCode" className="text-sm font-medium text-gray-700">
                          Access Code
                        </Label>
                        <Input
                          id="accessCode"
                          name="accessCode"
                          value={formData.accessCode}
                          onChange={(e) => setFormData(p => ({ ...p, accessCode: e.target.value }))}
                          className="h-10"
                          placeholder="Enter access code"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                          Status
                        </Label>
                        <Select
                          name="status"
                          value={formData.status}
                          onValueChange={(value) => setFormData(p => ({ ...p!, status: value as Kiosk['status'] }))}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="online">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Online
                              </div>
                            </SelectItem>
                            <SelectItem value="offline">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                Offline
                              </div>
                            </SelectItem>
                            <SelectItem value="maintenance">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                Maintenance
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
  
                    
                  <div className="space-y-6">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-2">
                      Device Information
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="model" className="text-sm font-medium text-gray-700">
                          Device Model
                        </Label>
                        <Select
                          value={formData.deviceInfo?.model || ''}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev!,
                            deviceInfo: { ...prev!.deviceInfo, model: value }
                          }))}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select or type a model" />
                          </SelectTrigger>
                          <SelectContent>
                           
                            <SelectItem value="iPad 10.2">iPad 10.2</SelectItem>
                            <SelectItem value="iPad Pro 12.9">iPad Pro 12.9</SelectItem>
                            <SelectItem value="Samsung Galaxy Tab A8">Samsung Galaxy Tab A8</SelectItem>
                            <SelectItem value="Samsung Galaxy Tab S7">Samsung Galaxy Tab S7</SelectItem>
                            <SelectItem value="Surface Pro 7">Surface Pro 7</SelectItem>
                            <SelectItem value="Custom">Custom...</SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.deviceInfo?.model === 'Custom' && (
                        <Input
                          id="model"
                          name="model"
                            value={formData.deviceInfo?.modelCustom || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev!,
                              deviceInfo: { ...prev!.deviceInfo, modelCustom: e.target.value }
                          }))}
                            className="h-10 mt-2"
                            placeholder="Enter custom model"
                        />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="os" className="text-sm font-medium text-gray-700">
                          Operating System
                        </Label>
                        <Select
                          value={formData.deviceInfo?.os || ''}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev!,
                            deviceInfo: { ...prev!.deviceInfo, os: value }
                          }))}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select OS" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="iOS">iOS</SelectItem>
                            <SelectItem value="Android">Android</SelectItem>
                            <SelectItem value="Windows">Windows</SelectItem>
                            <SelectItem value="ChromeOS">ChromeOS</SelectItem>
                            <SelectItem value="Linux">Linux</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.deviceInfo?.os === 'Other' && (
                          <Input
                            id="os"
                            name="osCustom"
                            value={formData.deviceInfo?.osCustom || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev!,
                              deviceInfo: { ...prev!.deviceInfo, osCustom: e.target.value }
                            }))}
                            className="h-10 mt-2"
                            placeholder="Enter OS name"
                          />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="screenSize" className="text-sm font-medium text-gray-700">
                          Screen Size
                        </Label>
                        <Select
                          value={formData.deviceInfo?.screenSize || ''}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev!,
                            deviceInfo: { ...prev!.deviceInfo, screenSize: value }
                          }))}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select screen size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10.2 inches">10.2 inches</SelectItem>
                            <SelectItem value="11 inches">11 inches</SelectItem>
                            <SelectItem value="12.9 inches">12.9 inches</SelectItem>
                            <SelectItem value="13.3 inches">13.3 inches</SelectItem>
                            <SelectItem value="15 inches">15 inches</SelectItem>
                            <SelectItem value="Custom">Custom...</SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.deviceInfo?.screenSize === 'Custom' && (
                          <Input
                            id="screenSize"
                            name="screenSizeCustom"
                            value={formData.deviceInfo?.screenSizeCustom || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev!,
                              deviceInfo: { ...prev!.deviceInfo, screenSizeCustom: e.target.value }
                            }))}
                            className="h-10 mt-2"
                            placeholder="Enter custom screen size"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
  
            <TabsContent value="campaigns" className="mt-0 space-y-8 p-6">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Assigned Campaigns</h3>
                    <Badge variant="secondary" className="text-xs font-medium">
                      {assignedCampaigns.length} selected
                    </Badge>
                  </div>
                  {assignedCampaigns.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          assignedCampaigns: [],
                          defaultCampaign: "",
                        }))
                      }
                      className="gap-2"
                    >
                      <Minus className="w-4 h-4" />
                      Clear All
                    </Button>
                  )}
                </div>
  
                {assignedCampaigns.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No campaigns assigned
                    </h4>
                    <p className="text-gray-600">
                      Select campaigns from the available list below to get started
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {assignedCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center gap-4 p-6 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                      >
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                          <img
                            src={campaign.coverImageUrl}
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-semibold text-blue-900 text-lg">
                              {campaign.title}
                            </h4>
                            {formData.defaultCampaign === campaign.id && (
                              <Badge className="bg-indigo-600 text-white text-xs gap-1">
                                <Star className="w-3 h-3" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-blue-700 mb-2">{campaign.category}</p>
                          <div className="flex items-center gap-4 text-sm text-blue-600">
                            <span className="font-medium">
                              {formatCurrency(campaign.raised)} raised
                            </span>
                            <span className="text-blue-400">•</span>
                            <span>
                              {Math.round((campaign.raised / campaign.goal) * 100)}% funded
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {formData.defaultCampaign !== campaign.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDefaultCampaign(campaign.id)}
                              className="gap-2 bg-white hover:bg-gray-50"
                            >
                              <Star className="w-4 h-4" />
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => toggleCampaignAssignment(campaign.id)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
  
             
              {unassignedCampaigns.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Plus className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold">Available Campaigns</h3>
                    <Badge variant="outline" className="text-xs font-medium">
                      {unassignedCampaigns.length} available
                    </Badge>
                  </div>
                  
                  <ScrollArea className="h-80 pr-4">
                    <div className="grid grid-cols-1 gap-4">
                      {unassignedCampaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          className="flex items-center gap-4 p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                            <img
                              src={campaign.coverImageUrl}
                              alt={campaign.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-lg mb-1">
                              {campaign.title}
                            </h4>
                            <p className="text-gray-600 mb-2">{campaign.category}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="font-medium">
                                {formatCurrency(campaign.raised)} raised
                              </span>
                              <span className="text-gray-400">•</span>
                              <span>
                                {Math.round((campaign.raised / campaign.goal) * 100)}% funded
                              </span>
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleCampaignAssignment(campaign.id)}
                            className="gap-2 flex-shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                            Assign
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
  

              {globalCampaigns.length > 0 && (
                <div className="space-y-4 pt-6 border-t">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Global Campaigns</h3>
                    <Badge variant="secondary" className="text-xs font-medium bg-green-100 text-green-800">
                      Auto-assigned to all kiosks
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {globalCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center gap-4 p-6 bg-green-50 border border-green-200 rounded-xl"
                      >
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                          <img
                            src={campaign.coverImageUrl}
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-green-900 text-lg mb-1">
                            {campaign.title}
                          </h4>
                          <p className="text-green-700 mb-2">{campaign.category}</p>
                          <div className="flex items-center gap-4 text-sm text-green-600">
                            <span className="font-medium">
                              {formatCurrency(campaign.raised)} raised
                            </span>
                            <span className="text-green-400">•</span>
                            <span>
                              {Math.round((campaign.raised / campaign.goal) * 100)}% funded
                            </span>
                          </div>
                        </div>
                        
                        <Badge className="bg-green-600 text-white gap-1 flex-shrink-0">
                          <Globe className="w-3 h-3" />
                          Global
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
  
            <TabsContent value="settings" className="mt-0 p-6">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pb-6">
                  <CardTitle className="text-lg">Display Settings</CardTitle>
                  <CardDescription>
                    Configure how campaigns are displayed on this kiosk
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="px-0 space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="displayMode" className="text-sm font-medium text-gray-700">
                          Display Layout
                        </Label>
                        <Select
                          value={formData.settings?.displayMode || "grid"}
                          onValueChange={(value: "grid" | "list" | "carousel") =>
                            updateSettings({ displayMode: value })
                          }
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grid">
                              <div className="flex items-center gap-3 py-2">
                                <LayoutGrid className="w-4 h-4" />
                                <span>Grid Layout</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="list">
                              <div className="flex items-center gap-3 py-2">
                                <List className="w-4 h-4" />
                                <span>List Layout</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="carousel">
                              <div className="flex items-center gap-3 py-2">
                                <Shuffle className="w-4 h-4" />
                                <span>Carousel</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
  
                      <div className="space-y-3">
                        <Label htmlFor="maxDisplay" className="text-sm font-medium text-gray-700">
                          Maximum Campaigns to Display
                        </Label>
                        <Input
                          id="maxDisplay"
                          type="number"
                          min="1"
                          max="20"
                          value={formData.settings?.maxCampaignsDisplay || 6}
                          onChange={(e) =>
                            updateSettings({
                              maxCampaignsDisplay: parseInt(e.target.value) || 6,
                            })
                          }
                          className="h-12"
                        />
                        <p className="text-sm text-gray-500">
                          Limit how many campaigns show at once
                        </p>
                      </div>
                    </div>
  
                    {/* Right Column */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <Label htmlFor="showAll" className="text-sm font-medium text-gray-700">
                            Show Global Campaigns
                          </Label>
                          <p className="text-sm text-gray-500 mt-1">
                            Include global campaigns in display
                          </p>
                        </div>
                        <Switch
                          id="showAll"
                          checked={formData.settings?.showAllCampaigns || false}
                          onCheckedChange={(checked) =>
                            updateSettings({ showAllCampaigns: checked })
                          }
                        />
                      </div>
  
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <Label htmlFor="autoRotate" className="text-sm font-medium text-gray-700">
                            Auto-Rotate Campaigns
                          </Label>
                          <p className="text-sm text-gray-500 mt-1">
                            Automatically cycle through campaigns
                          </p>
                        </div>
                        <Switch
                          id="autoRotate"
                          checked={formData.settings?.autoRotateCampaigns || false}
                          onCheckedChange={(checked) =>
                            updateSettings({ autoRotateCampaigns: checked })
                          }
                        />
                      </div>
  
                      {formData.settings?.autoRotateCampaigns && (
                        <div className="space-y-3">
                          <Label htmlFor="rotationInterval" className="text-sm font-medium text-gray-700">
                            Rotation Interval (seconds)
                          </Label>
                          <Input
                            id="rotationInterval"
                            type="number"
                            min="10"
                            max="300"
                            value={formData.settings?.rotationInterval || 30}
                            onChange={(e) =>
                              updateSettings({
                                rotationInterval: parseInt(e.target.value) || 30,
                              })
                            }
                            className="h-12"
                          />
                          <p className="text-sm text-gray-500">
                            How often to switch between campaigns
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
  
        <div className="flex justify-end gap-3 pt-6 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="px-6">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 px-6"
          >
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
