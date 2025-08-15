import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Switch } from "../../ui/switch";
import { Checkbox } from "../../ui/checkbox";
import { Separator } from "../../ui/separator";
import { ScrollArea } from "../../ui/scroll-area";
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
import { Kiosk, Campaign } from "../../../App";

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
  const [formData, setFormData] = useState<Kiosk>(() => {
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
        settings: { // Ensure settings object exists and new properties are merged
          displayMode: "grid",
          showAllCampaigns: false,
          maxCampaignsDisplay: 6,
          autoRotateCampaigns: false,
          rotationInterval: 30,
          ...kiosk.settings, // Merge existing settings
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
    onSave(formData);
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

      // If removing the default campaign, clear it
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Monitor className="w-5 h-5" />
            <span>Configure Kiosk: {kiosk?.name}</span>
          </DialogTitle>
          <DialogDescription>
            Manage campaign assignments and display settings for this kiosk
            device.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="campaigns"
              className="flex items-center space-x-1"
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Campaigns</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center space-x-1"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="flex items-center space-x-1"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Assignments</CardTitle>
                <CardDescription>
                  Select which campaigns should be available on this kiosk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Global Campaigns */}
                {globalCampaigns.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Globe className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium">Global Campaigns</h4>
                      <Badge variant="secondary" className="text-xs">
                        Auto-assigned to all kiosks
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {globalCampaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={campaign.image}
                              alt={campaign.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-green-900">
                              {campaign.title}
                            </h5>
                            <p className="text-sm text-green-700">
                              {campaign.category}
                            </p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-green-600">
                              <span>
                                {formatCurrency(campaign.raised)} raised
                              </span>
                              <span>•</span>
                              <span>
                                {Math.round(
                                  (campaign.raised / campaign.goal) * 100
                                )}
                                % funded
                              </span>
                            </div>
                          </div>
                          <Badge className="bg-green-600 text-white">
                            <Globe className="w-3 h-3 mr-1" />
                            Global
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assigned Campaigns */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium">Assigned Campaigns</h4>
                      <Badge variant="secondary" className="text-xs">
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
                      >
                        <Minus className="w-4 h-4 mr-1" />
                        Clear All
                      </Button>
                    )}
                  </div>

                  {assignedCampaigns.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-600">
                        No campaigns assigned to this kiosk
                      </p>
                      <p className="text-sm text-gray-500">
                        Select campaigns from the available list below
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assignedCampaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          className="flex items-center space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={campaign.image}
                              alt={campaign.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h5 className="font-medium text-blue-900">
                                {campaign.title}
                              </h5>
                              {formData.defaultCampaign === campaign.id && (
                                <Badge className="bg-indigo-600 text-white text-xs">
                                  <Star className="w-3 h-3 mr-1" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-blue-700">
                              {campaign.category}
                            </p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-blue-600">
                              <span>
                                {formatCurrency(campaign.raised)} raised
                              </span>
                              <span>•</span>
                              <span>
                                {Math.round(
                                  (campaign.raised / campaign.goal) * 100
                                )}
                                % funded
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {formData.defaultCampaign !== campaign.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDefaultCampaign(campaign.id)}
                              >
                                <Star className="w-4 h-4 mr-1" />
                                Set Default
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                toggleCampaignAssignment(campaign.id)
                              }
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Available Campaigns */}
                {unassignedCampaigns.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Plus className="w-5 h-5 text-gray-600" />
                      <h4 className="font-medium">Available Campaigns</h4>
                      <Badge variant="outline" className="text-xs">
                        {unassignedCampaigns.length} available
                      </Badge>
                    </div>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {unassignedCampaigns.map((campaign) => (
                          <div
                            key={campaign.id}
                            className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={campaign.image}
                                alt={campaign.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900">
                                {campaign.title}
                              </h5>
                              <p className="text-sm text-gray-600">
                                {campaign.category}
                              </p>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                <span>
                                  {formatCurrency(campaign.raised)} raised
                                </span>
                                <span>•</span>
                                <span>
                                  {Math.round(
                                    (campaign.raised / campaign.goal) * 100
                                  )}
                                  % funded
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toggleCampaignAssignment(campaign.id)
                              }
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Assign
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
  
              {/* Global Campaigns */}
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
                            src={campaign.image}
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

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Configure how campaigns are displayed on this kiosk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="displayMode">Display Layout</Label>
                      <Select
                        value={formData.settings?.displayMode || "grid"}
                        onValueChange={(value: "grid" | "list" | "carousel") =>
                          updateSettings({ displayMode: value })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">
                            <div className="flex items-center space-x-2">
                              <LayoutGrid className="w-4 h-4" />
                              <span>Grid Layout</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="list">
                            <div className="flex items-center space-x-2">
                              <List className="w-4 h-4" />
                              <span>List Layout</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="carousel">
                            <div className="flex items-center space-x-2">
                              <Shuffle className="w-4 h-4" />
                              <span>Carousel</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="maxDisplay">
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
                        className="mt-2"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Limit how many campaigns show at once
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="showAll">Show Global Campaigns</Label>
                        <p className="text-sm text-gray-600">
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

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoRotate">
                          Auto-Rotate Campaigns
                        </Label>
                        <p className="text-sm text-gray-600">
                          Automatically cycle through campaigns
                        </p>
                      </div>
                      <Switch
                        id="autoRotate"
                        checked={
                          formData.settings?.autoRotateCampaigns || false
                        }
                        onCheckedChange={(checked) =>
                          updateSettings({ autoRotateCampaigns: checked })
                        }
                      />
                    </div>

                    {formData.settings?.autoRotateCampaigns && (
                      <div>
                        <Label htmlFor="rotationInterval">
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
                          className="mt-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kiosk Preview</CardTitle>
                <CardDescription>
                  Preview how campaigns will appear on this kiosk
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-6 min-h-64">
                  <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Monitor className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-medium">{formData.name}</h3>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {formData.settings?.displayMode} layout
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        Available Campaigns:{" "}
                        {(formData.assignedCampaigns?.length || 0) +
                          globalCampaigns.length}
                      </div>

                      {formData.defaultCampaign && (
                        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-medium text-indigo-900">
                              Featured Campaign
                            </span>
                          </div>
                          <p className="text-sm text-indigo-700 mt-1">
                            {
                              campaigns.find(
                                (c) => c.id === formData.defaultCampaign
                              )?.title
                            }
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">
                          Display Settings:
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>Layout: {formData.settings?.displayMode}</div>
                          <div>
                            Max display:{" "}
                            {formData.settings?.maxCampaignsDisplay}
                          </div>
                          <div>
                            Global campaigns:{" "}
                            {formData.settings?.showAllCampaigns ? "Yes" : "No"}
                          </div>
                          <div>
                            Auto-rotate:{" "}
                            {formData.settings?.autoRotateCampaigns
                              ? "Yes"
                              : "No"}
                          </div>
                        </div>
                      </div>

                      {formData.settings?.autoRotateCampaigns && (
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Campaigns rotate every{" "}
                          {formData.settings.rotationInterval} seconds
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
