import React, { useEffect, useState, useRef } from 'react';
import { Screen, AdminSession, Permission } from '../../App';
import { DocumentData, Timestamp } from 'firebase/firestore';
import { useCampaignManagement } from '../../hooks/useCampaignManagement';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FaEdit, FaSearch, FaEllipsisV, FaUpload, FaImage } from 'react-icons/fa';
import {
  Plus,
  ArrowLeft,
  Settings,
  Download,
} from 'lucide-react';

interface CampaignEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: DocumentData | null;
  onSave: (updatedData: DocumentData) => void;
}

interface CampaignAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (newData: DocumentData) => void;
}

const CampaignEditDialog = ({ open, onOpenChange, campaign, onSave }: CampaignEditDialogProps) => {
  const [formData, setFormData] = useState<DocumentData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    uploadingImage,
    selectedImage,
    imagePreview,
    handleImageSelect,
    handleImageUpload,
    clearImageSelection,
    setImagePreviewUrl
  } = useCampaignManagement();

  useEffect(() => {
    if (campaign) {
      const editableData = {
        title: campaign.title || '',
        description: campaign.description || '',
        status: campaign.status || 'active',
        goalAmount: campaign.goalAmount || 0,
        tags: Array.isArray(campaign.tags) ? campaign.tags.join(', ') : '',
        startDate: campaign.startDate?.seconds ? new Date(campaign.startDate.seconds * 1000).toISOString().split('T')[0] : '',
        endDate: campaign.endDate?.seconds ? new Date(campaign.endDate.seconds * 1000).toISOString().split('T')[0] : '',
        coverImageUrl: campaign.coverImageUrl || '',
      };
      setFormData(editableData);
      setImagePreviewUrl(campaign.coverImageUrl || null);
    }
  }, [campaign, setImagePreviewUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage || !campaign || !formData) return;
    
    try {
      const updatedData = await handleImageUpload(campaign.id, formData);
      if (updatedData) {
        setFormData(prev => (prev ? { ...prev, coverImageUrl: updatedData.coverImageUrl } : null));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image. Please try again.';
      alert(errorMessage);
    }
  };

  const handleSaveChanges = () => {
    if (formData) {
      onSave(formData);
    }
  };

  const handleDialogClose = () => {
    clearImageSelection();
    onOpenChange(false);
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" /> Edit Campaign: {campaign?.title}
          </DialogTitle>
          <DialogDescription>
            Make changes to your campaign below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} className="col-span-3" rows={3} />
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
                    <p>Current cover image</p>
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
                    <Button
                      type="button"
                      onClick={handleUploadImage}
                      disabled={uploadingImage}
                      className="flex items-center space-x-2"
                    >
                      <FaUpload className={`w-4 h-4 ${uploadingImage ? 'animate-spin' : ''}`} />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    </Button>
                  )}
                </div>
                
                {selectedImage && (
                  <div className="text-sm text-gray-600">
                    <p>Selected: {selectedImage.name}</p>
                    <p>Size: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tags" className="text-right">Tags</Label>
            <Input id="tags" name="tags" value={formData.tags} onChange={handleChange} className="col-span-3" placeholder="health, education, etc."/>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              <div className="space-y-2">
                 <Label htmlFor="goalAmount">Fundraising Goal ($)</Label>
                 <Input id="goalAmount" name="goalAmount" type="number" value={formData.goalAmount} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                 <Select name="status" value={formData.status} onValueChange={(value) => handleChange({ target: { name: 'status', value } } as any)}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
              </div>
           </div>

        </div>
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleDialogClose} disabled={uploadingImage}>Cancel</Button>
          <Button onClick={handleSaveChanges} disabled={uploadingImage}>
            {uploadingImage ? 'Uploading...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CampaignAddDialog = ({ open, onOpenChange, onSave }: CampaignAddDialogProps) => {
  const [formData, setFormData] = useState<DocumentData>({
    title: '',
    description: '',
    status: 'active',
    goalAmount: 0,
    tags: '',
    startDate: '',
    endDate: '',
    coverImageUrl: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    uploadingImage,
    selectedImage,
    imagePreview,
    handleImageSelect,
    clearImageSelection,
    setImagePreviewUrl
  } = useCampaignManagement();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleSaveChanges = () => {
    if (formData.title && formData.description) {
      onSave(formData);
    }
  };

  const handleDialogClose = () => {
    setFormData({
      title: '',
      description: '',
      status: 'active',
      goalAmount: 0,
      tags: '',
      startDate: '',
      endDate: '',
      coverImageUrl: ''
    });
    clearImageSelection();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="mr-2 h-5 w-5" /> Add New Campaign
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new campaign.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title *</Label>
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
            <Label htmlFor="description" className="text-right pt-2">Description *</Label>
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
                    <p>Selected image</p>
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
                </div>
                
                {selectedImage && (
                  <div className="text-sm text-gray-600">
                    <p>Selected: {selectedImage.name}</p>
                    <p>Size: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tags" className="text-right">Tags</Label>
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
              <Label htmlFor="goalAmount">Fundraising Goal ($)</Label>
              <Input 
                id="goalAmount" 
                name="goalAmount" 
                type="number" 
                value={formData.goalAmount} 
                onChange={handleChange} 
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                name="status" 
                value={formData.status} 
                onValueChange={(value) => handleChange({ target: { name: 'status', value } } as any)}
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
        </div>
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleDialogClose} disabled={uploadingImage}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveChanges} 
            disabled={uploadingImage || !formData.title || !formData.description}
          >
            Create Campaign
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

const CampaignManagement = ({ onNavigate, onLogout, userSession, hasPermission }: CampaignManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<DocumentData | null>(null);
  
  const { campaigns, updateWithImage, createWithImage } = useCampaignManagement();

  const handleEditClick = (campaign: DocumentData) => {
    setEditingCampaign(campaign);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (updatedData: DocumentData) => {
    if (!editingCampaign) return;

    const campaignId = editingCampaign.id;
    try {
        const dataToSave: { [key: string]: any } = {
          title: updatedData.title,
          description: updatedData.description,
          status: updatedData.status,
          goalAmount: Number(updatedData.goalAmount),
          tags: updatedData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        };

        if (updatedData.startDate) dataToSave.startDate = Timestamp.fromDate(new Date(updatedData.startDate));
        if (updatedData.endDate) dataToSave.endDate = Timestamp.fromDate(new Date(updatedData.endDate));
        if (updatedData.coverImageUrl) dataToSave.coverImageUrl = updatedData.coverImageUrl;

        await updateWithImage(campaignId, dataToSave);
    } catch (error) {
        console.error("Error updating document: ", error);
    } finally {
        setIsEditDialogOpen(false);
        setEditingCampaign(null);
    }
  };

  const handleAddCampaign = async (newData: DocumentData) => {
    try {
        const dataToSave: { [key: string]: any } = {
          title: newData.title,
          description: newData.description,
          status: newData.status,
          goalAmount: Number(newData.goalAmount),
          tags: newData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        };

        if (newData.startDate) dataToSave.startDate = Timestamp.fromDate(new Date(newData.startDate));
        if (newData.endDate) dataToSave.endDate = Timestamp.fromDate(new Date(newData.endDate));

        await createWithImage(dataToSave);
    } catch (error) {
        console.error("Error creating campaign: ", error);
    } finally {
        setIsAddDialogOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                        onClick={() => onNavigate('admin-dashboard')}
                        className="flex items-center space-x-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                      </Button>
                      <div className="h-6 w-px bg-gray-300" />
                      <div>
                        <h1 className="text-xl font-semibold text-gray-900">Campaign Management</h1>
                        <p className="text-sm text-gray-600">Configure and monitor Campaigns</p>
                      </div>
                    </div>
        
                    <div className="flex items-center space-x-4">
                      <Button variant="outline" size="sm">
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
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="relative w-full sm:w-1/2 mb-4 sm:mb-0 sm:mr-4">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Campaigns ({filteredCampaigns.length})</h2>
            <p className="text-gray-500 text-sm">Manage your donation campaigns</p>
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
              {filteredCampaigns.map((campaign) => {
                const collected = Number(campaign.collectedAmount) || 0;
                const goal = Number(campaign.goalAmount) || 1;
                const progress = Math.round((collected / goal) * 100);
                const donors = campaign.donationCount || 0;
                const avgDonation = donors > 0 ? (collected / donors).toFixed(2) : '0.00';
                const status = campaign.status || 'Active';
                const endDate = campaign.endDate?.seconds
                  ? new Date(campaign.endDate.seconds * 1000).toLocaleDateString('en-US')
                  : 'N/A';
                const isExpired = campaign.endDate?.seconds ? new Date(campaign.endDate.seconds * 1000) < new Date() : false;

                return (
                  <div key={campaign.id} className="block md:grid md:grid-cols-10 items-center py-4 px-6 hover:bg-gray-50 transition-colors duration-150">
                    <div className="md:col-span-3 flex items-center space-x-3 mb-4 md:mb-0">
                      <div className="relative">
                        <img
                          src={campaign.coverImageUrl || 'https://via.placeholder.com/40'}
                          alt={campaign.title}
                          className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                        />
                        {campaign.coverImageUrl && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{campaign.title}</p>
                        <p className="text-xs text-gray-500">{(campaign.tags || []).join(' · ')}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 md:col-span-7 md:grid-cols-7 md:gap-0">
                      <div className="col-span-1 md:col-span-2 space-y-1">
                        <p className="text-sm font-medium text-gray-800">${collected.toLocaleString()} <span className="text-gray-500 font-normal">({progress}%)</span></p>
                        <div className="w-4/5 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">Goal: ${goal.toLocaleString()}</p>
                      </div>
                      
                      <div className="col-span-1 md:col-span-2 text-sm text-gray-800">
                        <p>{donors} donors</p>
                        <p>${avgDonation} avg</p>
                      </div>
                      
                      <div className="col-span-1 md:col-span-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                      
                      <div className="col-span-1 md:col-span-1 text-sm text-gray-800">
                        <p>{endDate}</p>
                        {isExpired && <p className="text-xs text-red-500">Expired</p>}
                      </div>
                      
                      <div className="col-span-2 md:col-span-1 flex justify-start md:justify-end items-center space-x-2 text-gray-500 mt-4 md:mt-0">
                        {hasPermission('edit_campaign') && <button onClick={() => handleEditClick(campaign)} className="p-2 hover:bg-gray-100 rounded-md" title="Edit"><FaEdit className="h-4 w-4" /></button>}
                        <button className="p-2 hover:bg-gray-100 rounded-md"><FaEllipsisV className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      <CampaignEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        campaign={editingCampaign}
        onSave={handleSave}
      />
      
      <CampaignAddDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddCampaign}
      />
    </>
  );
};

export default CampaignManagement;
