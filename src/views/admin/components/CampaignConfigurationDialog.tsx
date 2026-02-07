import React, { useState } from 'react';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Textarea } from '../../../shared/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../shared/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Badge } from '../../../shared/ui/badge';
import { Switch } from '../../../shared/ui/switch';
import { Checkbox } from '../../../shared/ui/checkbox';
import { Slider } from '../../../shared/ui/slider';
import { Separator } from '../../../shared/ui/separator';
import {
  Settings,
  DollarSign,
  Palette,
  Users,
  Share2,
  Eye,
  Plus,
  X,
  Wand2,
  Zap,
  Heart,
  Clock,
  Globe,
  Phone,
  Mail,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { Campaign, CampaignConfiguration } from '../../../entities/campaign';
import { 
  CAMPAIGN_CATEGORIES, 
  CAMPAIGN_THEMES, 
  PREDEFINED_AMOUNT_SETS,
  DEFAULT_CAMPAIGN_CONFIG,
  DEFAULT_CAMPAIGN_VALUES
} from '../../../shared/config';

interface CampaignConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
  onSave: (campaign: Campaign) => void;
  isCreating?: boolean;
}

export function CampaignConfigurationDialog({
  open,
  onOpenChange,
  campaign,
  onSave,
  isCreating = false
}: CampaignConfigurationDialogProps) {
  const [formData, setFormData] = useState<Campaign>(() => {
    if (campaign) return { ...campaign };
    
    // Default campaign with sensible configuration
    const defaults: Campaign = {
      id: '',
      title: '',
      description: '',
      coverImageUrl: '',
      createdAt: new Date().toISOString().split('T')[0],
      endDate: '',
      ...{ ...DEFAULT_CAMPAIGN_VALUES, assignedKiosks: [...DEFAULT_CAMPAIGN_VALUES.assignedKiosks] as string[], galleryImages: [...DEFAULT_CAMPAIGN_VALUES.galleryImages] as string[] },
      configuration: {
        ...DEFAULT_CAMPAIGN_CONFIG,
        predefinedAmounts: [...DEFAULT_CAMPAIGN_CONFIG.predefinedAmounts] as number[],
        suggestedAmounts: [...DEFAULT_CAMPAIGN_CONFIG.suggestedAmounts] as number[],
        recurringIntervals: [...DEFAULT_CAMPAIGN_CONFIG.recurringIntervals],
        requiredFields: [...DEFAULT_CAMPAIGN_CONFIG.requiredFields],
        optionalFields: [...DEFAULT_CAMPAIGN_CONFIG.optionalFields],
      }
    };
    return defaults;
  });

  const [customAmount, setCustomAmount] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  const categories = CAMPAIGN_CATEGORIES;
  const themes = CAMPAIGN_THEMES;
  const predefinedAmountSets = PREDEFINED_AMOUNT_SETS;

  const handleSave = () => {
    const campaignToSave = {
      ...formData,
      id: formData.id || `campaign-${Date.now()}`
    };
    onSave(campaignToSave);
    onOpenChange(false);
  };

  const updateConfiguration = (updates: Partial<CampaignConfiguration>) => {
    setFormData(prev => ({
      ...prev,
      configuration: { ...prev.configuration, ...updates }
    }));
  };

  const addPredefinedAmount = () => {
    const amount = parseFloat(customAmount);
    if (amount > 0 && !formData.configuration.predefinedAmounts.includes(amount)) {
      updateConfiguration({
        predefinedAmounts: [...formData.configuration.predefinedAmounts, amount].sort((a, b) => a - b)
      });
      setCustomAmount('');
    }
  };

  const removePredefinedAmount = (amount: number) => {
    updateConfiguration({
      predefinedAmounts: formData.configuration.predefinedAmounts.filter(a => a !== amount)
    });
  };

  const applyAmountSet = (amounts: number[] | readonly number[]) => {
    updateConfiguration({ predefinedAmounts: [...amounts] as number[] });
  };

  const toggleRecurringInterval = (interval: 'monthly' | 'quarterly' | 'yearly') => {
    const current = formData.configuration.recurringIntervals;
    const updated = current.includes(interval)
      ? current.filter(i => i !== interval)
      : [...current, interval];
    
    updateConfiguration({ recurringIntervals: updated });
  };

  const toggleRequiredField = (field: 'email' | 'name' | 'phone' | 'address') => {
    const current = formData.configuration.requiredFields;
    const updated = current.includes(field)
      ? current.filter(f => f !== field)
      : [...current, field];
    
    updateConfiguration({ requiredFields: updated });
  };

  const toggleOptionalField = (field: 'email' | 'name' | 'phone' | 'address' | 'message') => {
    const current = formData.configuration.optionalFields;
    const updated = current.includes(field)
      ? current.filter(f => f !== field)
      : [...current, field];
    
    updateConfiguration({ optionalFields: updated });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>{isCreating ? 'Create New Campaign' : 'Configure Campaign'}</span>
          </DialogTitle>
          <DialogDescription>
            {isCreating 
              ? 'Set up a new donation campaign with comprehensive configuration options.'
              : 'Modify campaign settings and client-side display options.'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic" className="flex items-center space-x-1">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Basic</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Pricing</span>
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center space-x-1">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger value="forms" className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Forms</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center space-x-1">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Features</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Information</CardTitle>
                <CardDescription>Basic details about your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Campaign Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter campaign title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description for campaign cards"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="longDescription">Detailed Description</Label>
                  <Textarea
                    id="longDescription"
                    value={formData.longDescription || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
                    placeholder="Detailed description for campaign page"
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="goal">Fundraising Goal ($)</Label>
                    <Input
                      id="goal"
                      type="number"
                      value={formData.goal}
                      onChange={(e) => setFormData(prev => ({ ...prev, goal: parseFloat(e.target.value) || 0 }))}
                      placeholder="10000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={formData.coverImageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, coverImageUrl: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Donation Amounts</CardTitle>
                <CardDescription>Configure predefined donation amounts and options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Quick Amount Presets</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {predefinedAmountSets.map((set, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => applyAmountSet(set.amounts)}
                        className="justify-start h-auto p-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">{set.name}</div>
                          <div className="text-xs text-gray-500">
                            ${set.amounts.join(', $')}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Current Predefined Amounts</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-4">
                    {formData.configuration.predefinedAmounts.map(amount => (
                      <Badge
                        key={amount}
                        variant="secondary"
                        className="flex items-center space-x-1 cursor-pointer hover:bg-red-100"
                        onClick={() => removePredefinedAmount(amount)}
                      >
                        <span>${amount}</span>
                        <X className="w-3 h-3" />
                      </Badge>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <Input
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount"
                      type="number"
                      className="flex-1"
                    />
                    <Button onClick={addPredefinedAmount} disabled={!customAmount}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allowCustom">Allow Custom Amounts</Label>
                      <Switch
                        id="allowCustom"
                        checked={formData.configuration.allowCustomAmount}
                        onCheckedChange={(checked) => updateConfiguration({ allowCustomAmount: checked })}
                      />
                    </div>

                    {formData.configuration.allowCustomAmount && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="minAmount">Minimum Amount ($)</Label>
                          <Input
                            id="minAmount"
                            type="number"
                            value={formData.configuration.minCustomAmount}
                            onChange={(e) => updateConfiguration({ minCustomAmount: parseFloat(e.target.value) || 1 })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxAmount">Maximum Amount ($)</Label>
                          <Input
                            id="maxAmount"
                            type="number"
                            value={formData.configuration.maxCustomAmount}
                            onChange={(e) => updateConfiguration({ maxCustomAmount: parseFloat(e.target.value) || 10000 })}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableRecurring">Enable Recurring Donations</Label>
                      <Switch
                        id="enableRecurring"
                        checked={formData.configuration.enableRecurring}
                        onCheckedChange={(checked) => updateConfiguration({ enableRecurring: checked })}
                      />
                    </div>

                    {formData.configuration.enableRecurring && (
                      <div className="space-y-3">
                        <Label>Recurring Intervals</Label>
                        <div className="space-y-2">
                          {(['monthly', 'quarterly', 'yearly'] as const).map(interval => (
                            <div key={interval} className="flex items-center space-x-2">
                              <Checkbox
                                id={interval}
                                checked={formData.configuration.recurringIntervals.includes(interval)}
                                onCheckedChange={() => toggleRecurringInterval(interval)}
                              />
                              <Label htmlFor={interval} className="capitalize">{interval}</Label>
                            </div>
                          ))}
                        </div>

                        <div>
                          <Label htmlFor="defaultInterval">Default Interval</Label>
                          <Select
                            value={formData.configuration.defaultRecurringInterval}
                            onValueChange={(value: 'monthly' | 'quarterly' | 'yearly') => 
                              updateConfiguration({ defaultRecurringInterval: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {formData.configuration.recurringIntervals.map(interval => (
                                <SelectItem key={interval} value={interval} className="capitalize">
                                  {interval}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="recurringDiscount">Recurring Discount (%)</Label>
                          <Input
                            id="recurringDiscount"
                            type="number"
                            min="0"
                            max="50"
                            value={formData.configuration.recurringDiscount || 0}
                            onChange={(e) => updateConfiguration({ recurringDiscount: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visual Theme & Layout</CardTitle>
                <CardDescription>Customize how your campaign appears to donors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Theme</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {themes.map(theme => (
                      <div
                        key={theme.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.configuration.theme === theme.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => updateConfiguration({ theme: theme.value as any })}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded ${
                            theme.value === 'default' ? 'bg-blue-500' :
                            theme.value === 'minimal' ? 'bg-gray-500' :
                            theme.value === 'vibrant' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                            'bg-gradient-to-r from-indigo-500 to-purple-500'
                          }`} />
                          <span className="font-medium">{theme.label}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{theme.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="displayStyle">Display Style</Label>
                      <Select
                        value={formData.configuration.displayStyle}
                        onValueChange={(value: 'grid' | 'list' | 'carousel') => 
                          updateConfiguration({ displayStyle: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">Grid Layout</SelectItem>
                          <SelectItem value="list">List Layout</SelectItem>
                          <SelectItem value="carousel">Carousel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="primaryCTA">Primary Button Text</Label>
                      <Input
                        id="primaryCTA"
                        value={formData.configuration.primaryCTAText}
                        onChange={(e) => updateConfiguration({ primaryCTAText: e.target.value })}
                        placeholder="Donate"
                      />
                    </div>

                    <div>
                      <Label htmlFor="secondaryCTA">Secondary Button Text</Label>
                      <Input
                        id="secondaryCTA"
                        value={formData.configuration.secondaryCTAText || ''}
                        onChange={(e) => updateConfiguration({ secondaryCTAText: e.target.value })}
                        placeholder="Learn More"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showProgress">Show Progress Bar</Label>
                      <Switch
                        id="showProgress"
                        checked={formData.configuration.showProgressBar}
                        onCheckedChange={(checked) => updateConfiguration({ showProgressBar: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showDonorCount">Show Donor Count</Label>
                      <Switch
                        id="showDonorCount"
                        checked={formData.configuration.showDonorCount}
                        onCheckedChange={(checked) => updateConfiguration({ showDonorCount: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showRecent">Show Recent Donations</Label>
                      <Switch
                        id="showRecent"
                        checked={formData.configuration.showRecentDonations}
                        onCheckedChange={(checked) => updateConfiguration({ showRecentDonations: checked })}
                      />
                    </div>

                    {formData.configuration.showRecentDonations && (
                      <div>
                        <Label htmlFor="maxRecent">Max Recent Donations</Label>
                        <Input
                          id="maxRecent"
                          type="number"
                          min="1"
                          max="20"
                          value={formData.configuration.maxRecentDonations}
                          onChange={(e) => updateConfiguration({ maxRecentDonations: parseInt(e.target.value) || 5 })}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="urgencyMessage">Urgency Message (Optional)</Label>
                  <Input
                    id="urgencyMessage"
                    value={formData.configuration.urgencyMessage || ''}
                    onChange={(e) => updateConfiguration({ urgencyMessage: e.target.value })}
                    placeholder="Only 7 days left to reach our goal!"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Donor Information Fields</CardTitle>
                <CardDescription>Configure what information to collect from donors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-medium">Required Fields</Label>
                    <div className="space-y-3 mt-3">
                      {(['email', 'name', 'phone', 'address'] as const).map(field => (
                        <div key={field} className="flex items-center space-x-2">
                          <Checkbox
                            id={`req-${field}`}
                            checked={formData.configuration.requiredFields.includes(field)}
                            onCheckedChange={() => toggleRequiredField(field)}
                          />
                          <Label htmlFor={`req-${field}`} className="flex items-center space-x-2 capitalize">
                            {field === 'email' && <Mail className="w-4 h-4" />}
                            {field === 'name' && <Users className="w-4 h-4" />}
                            {field === 'phone' && <Phone className="w-4 h-4" />}
                            {field === 'address' && <MapPin className="w-4 h-4" />}
                            <span>{field}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Optional Fields</Label>
                    <div className="space-y-3 mt-3">
                      {(['email', 'name', 'phone', 'address', 'message'] as const).map(field => (
                        <div key={field} className="flex items-center space-x-2">
                          <Checkbox
                            id={`opt-${field}`}
                            checked={formData.configuration.optionalFields.includes(field)}
                            onCheckedChange={() => toggleOptionalField(field)}
                            disabled={formData.configuration.requiredFields.includes(field as any)}
                          />
                          <Label 
                            htmlFor={`opt-${field}`} 
                            className={`flex items-center space-x-2 capitalize ${
                              formData.configuration.requiredFields.includes(field as any) 
                                ? 'text-gray-400' 
                                : ''
                            }`}
                          >
                            {field === 'email' && <Mail className="w-4 h-4" />}
                            {field === 'name' && <Users className="w-4 h-4" />}
                            {field === 'phone' && <Phone className="w-4 h-4" />}
                            {field === 'address' && <MapPin className="w-4 h-4" />}
                            {field === 'message' && <MessageSquare className="w-4 h-4" />}
                            <span>{field}</span>
                            {formData.configuration.requiredFields.includes(field as any) && 
                              <span className="text-xs">(Required)</span>
                            }
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="anonymous">Allow Anonymous Donations</Label>
                    <p className="text-sm text-gray-600">Donors can choose to remain anonymous</p>
                  </div>
                  <Switch
                    id="anonymous"
                    checked={formData.configuration.enableAnonymousDonations}
                    onCheckedChange={(checked) => updateConfiguration({ enableAnonymousDonations: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social & Engagement Features</CardTitle>
                <CardDescription>Enable features to increase engagement and sharing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="socialSharing">Social Sharing</Label>
                        <p className="text-sm text-gray-600">Allow donors to share on social media</p>
                      </div>
                      <Switch
                        id="socialSharing"
                        checked={formData.configuration.enableSocialSharing}
                        onCheckedChange={(checked) => updateConfiguration({ enableSocialSharing: checked })}
                      />
                    </div>

                    {formData.configuration.enableSocialSharing && (
                      <div>
                        <Label htmlFor="shareMessage">Custom Share Message</Label>
                        <Textarea
                          id="shareMessage"
                          value={formData.configuration.shareMessage || ''}
                          onChange={(e) => updateConfiguration({ shareMessage: e.target.value })}
                          placeholder="I just donated to this amazing cause! Join me in making a difference."
                          rows={3}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="donorWall">Donor Wall</Label>
                        <p className="text-sm text-gray-600">Display donor names and messages</p>
                      </div>
                      <Switch
                        id="donorWall"
                        checked={formData.configuration.enableDonorWall}
                        onCheckedChange={(checked) => updateConfiguration({ enableDonorWall: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="comments">Donor Comments</Label>
                        <p className="text-sm text-gray-600">Allow donors to leave messages</p>
                      </div>
                      <Switch
                        id="comments"
                        checked={formData.configuration.enableComments}
                        onCheckedChange={(checked) => updateConfiguration({ enableComments: checked })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview Configuration</CardTitle>
                <CardDescription>See how your settings will appear to donors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">{formData.title || 'Campaign Title'}</h3>
                    {formData.configuration.urgencyMessage && (
                      <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm mt-2 inline-block">
                        {formData.configuration.urgencyMessage}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Donation Amounts</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.configuration.predefinedAmounts.slice(0, 5).map(amount => (
                        <Badge key={amount} variant="outline" className="px-3 py-1">
                          ${amount}
                        </Badge>
                      ))}
                      {formData.configuration.allowCustomAmount && (
                        <Badge variant="outline" className="px-3 py-1">Custom</Badge>
                      )}
                    </div>
                  </div>

                  {formData.configuration.enableRecurring && (
                    <div>
                      <Label>Recurring Options</Label>
                      <div className="flex space-x-2 mt-1">
                        {formData.configuration.recurringIntervals.map(interval => (
                          <Badge key={interval} variant="secondary" className="capitalize">
                            {interval}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button className="flex-1">
                      {formData.configuration.primaryCTAText}
                    </Button>
                    {formData.configuration.secondaryCTAText && (
                      <Button variant="outline">
                        {formData.configuration.secondaryCTAText}
                      </Button>
                    )}
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
            disabled={!formData.title || !formData.description || !formData.category}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isCreating ? 'Create Campaign' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
