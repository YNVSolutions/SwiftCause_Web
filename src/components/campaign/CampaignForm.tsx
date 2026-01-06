'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Calendar } from '@/shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { AlertTriangle, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/currencyFormatter';
import { CAMPAIGN_STATUS_OPTIONS } from '@/shared/config';
import { Campaign } from '@/shared/types';

interface CampaignFormData {
  title: string;
  description: string;
  goal: number;
  status: 'active' | 'paused' | 'completed';
  startDate: Date | null;
  endDate: Date | null;
}

interface CampaignFormProps {
  onSubmit: (data: CampaignFormData) => Promise<void>;
  initialData?: Partial<CampaignFormData>;
  isLoading?: boolean;
  onCancel?: () => void;
}

interface FormErrors {
  [key: string]: string;
}

export const CampaignForm: React.FC<CampaignFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CampaignFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    goal: initialData?.goal || 0,
    status: initialData?.status || 'active',
    startDate: initialData?.startDate || null,
    endDate: initialData?.endDate || null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);

  // Validation logic
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Campaign title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Campaign description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Goal validation
    if (formData.goal <= 0) {
      newErrors.goal = 'Campaign goal must be greater than 0';
    } else if (formData.goal > 1000000) {
      newErrors.goal = 'Campaign goal cannot exceed $1,000,000';
    }

    // Date validation
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    // End date must be after start date
    if (formData.startDate && formData.endDate) {
      if (formData.endDate <= formData.startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid (for submit button)
  const isFormValid = useMemo(() => {
    return (
      formData.title.trim().length >= 3 &&
      formData.description.trim().length >= 10 &&
      formData.goal > 0 &&
      formData.goal <= 1000000 &&
      formData.startDate !== null &&
      formData.endDate !== null &&
      formData.startDate < formData.endDate
    );
  }, [formData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'goal' ? parseFloat(value) || 0 : value,
    }));
    // Clear error for this field on change
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = value === '' ? 0 : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      goal: isNaN(numValue) ? 0 : numValue,
    }));
    if (errors.goal) {
      setErrors(prev => ({
        ...prev,
        goal: '',
      }));
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value as 'active' | 'paused' | 'completed',
    }));
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        startDate: date,
      }));
      setOpenStartDate(false);
      if (errors.startDate) {
        setErrors(prev => ({
          ...prev,
          startDate: '',
        }));
      }
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        endDate: date,
      }));
      setOpenEndDate(false);
      if (errors.endDate) {
        setErrors(prev => ({
          ...prev,
          endDate: '',
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to create campaign',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Campaign</CardTitle>
        <CardDescription>
          Set up a new fundraising campaign with basic details and timeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">Campaign Title *</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="e.g., Help Us Build a New Library"
              value={formData.title}
              onChange={handleInputChange}
              disabled={isLoading || isSubmitting}
              className={errors.title ? 'border-red-500' : ''}
              maxLength={100}
            />
            {errors.title && (
              <div className="flex items-center gap-2 text-sm text-red-500 mt-1">
                <AlertTriangle size={16} />
                {errors.title}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Campaign Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what this campaign is about and why it matters..."
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading || isSubmitting}
              className={`resize-none ${errors.description ? 'border-red-500' : ''}`}
              rows={4}
            />
            {errors.description && (
              <div className="flex items-center gap-2 text-sm text-red-500 mt-1">
                <AlertTriangle size={16} />
                {errors.description}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length} characters
            </p>
          </div>

          {/* Goal Field */}
          <div className="space-y-2">
            <Label htmlFor="goal">Fundraising Goal (£) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                id="goal"
                name="goal"
                type="number"
                placeholder="0.00"
                value={formData.goal || ''}
                onChange={handleGoalChange}
                disabled={isLoading || isSubmitting}
                className={`pl-10 ${errors.goal ? 'border-red-500' : ''}`}
                min="0"
                step="0.01"
                max="1000000"
              />
            </div>
            {errors.goal && (
              <div className="flex items-center gap-2 text-sm text-red-500 mt-1">
                <AlertTriangle size={16} />
                {errors.goal}
              </div>
            )}
            {formData.goal > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Goal: {formatCurrency(formData.goal)}
              </p>
            )}
          </div>

          {/* Status Field */}
          <div className="space-y-2">
            <Label htmlFor="status">Campaign Status *</Label>
            <Select value={formData.status} onValueChange={handleStatusChange} disabled={isLoading || isSubmitting}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date Field */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    errors.startDate ? 'border-red-500' : ''
                  }`}
                  disabled={isLoading || isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? formatDate(formData.startDate) : 'Pick a start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.startDate || undefined}
                  onSelect={handleStartDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.startDate && (
              <div className="flex items-center gap-2 text-sm text-red-500 mt-1">
                <AlertTriangle size={16} />
                {errors.startDate}
              </div>
            )}
          </div>

          {/* End Date Field */}
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date *</Label>
            <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    errors.endDate ? 'border-red-500' : ''
                  }`}
                  disabled={isLoading || isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.endDate ? formatDate(formData.endDate) : 'Pick an end date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.endDate || undefined}
                  onSelect={handleEndDateSelect}
                  initialFocus
                  disabled={date =>
                    formData.startDate ? date <= formData.startDate : false
                  }
                />
              </PopoverContent>
            </Popover>
            {errors.endDate && (
              <div className="flex items-center gap-2 text-sm text-red-500 mt-1">
                <AlertTriangle size={16} />
                {errors.endDate}
              </div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={!isFormValid || isLoading || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Creating Campaign...' : 'Continue to Kiosk Assignment'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading || isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Required Fields Note */}
          <p className="text-xs text-gray-500 text-center">
            * indicates required fields
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
