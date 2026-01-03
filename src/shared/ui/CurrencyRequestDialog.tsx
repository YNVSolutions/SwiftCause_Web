import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Textarea } from './textarea';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface CurrencyRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (currency: string, notes: string) => Promise<void>;
  email: string;
  organizationName: string;
  firstName: string;
  lastName: string;
}

export function CurrencyRequestDialog({
  isOpen,
  onClose,
  onSubmit,
  email,
  organizationName,
  firstName,
  lastName,
}: CurrencyRequestDialogProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [customCurrency, setCustomCurrency] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
    setError('');
    if (value !== 'CUSTOM') {
      setCustomCurrency('');
    }
  };

  const handleCustomCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
    setCustomCurrency(value);
    setError('');
  };

  const validateCurrency = (): boolean => {
    if (!selectedCurrency) {
      setError('Please select a currency');
      return false;
    }

    if (selectedCurrency === 'CUSTOM') {
      if (!customCurrency) {
        setError('Please enter a custom currency code');
        return false;
      }
      if (customCurrency.length !== 3) {
        setError('Currency code must be exactly 3 letters (e.g., AUD, CAD, JPY)');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateCurrency()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const currencyToSubmit = selectedCurrency === 'CUSTOM' ? customCurrency : selectedCurrency;
      await onSubmit(currencyToSubmit, notes);
      // Reset form
      setSelectedCurrency('');
      setCustomCurrency('');
      setNotes('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedCurrency('');
      setCustomCurrency('');
      setNotes('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Request Different Currency</span>
          </DialogTitle>
          <DialogDescription>
            Select the currency you'd like to use for your organization. We'll review your request and notify you when it's available.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Requested Currency *</Label>
            <Select
              value={selectedCurrency}
              onValueChange={handleCurrencyChange}
              disabled={isSubmitting}
            >
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($) - United States Dollar</SelectItem>
                <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                <SelectItem value="CUSTOM">Custom - Enter your own currency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Currency Input */}
          {selectedCurrency === 'CUSTOM' && (
            <div className="space-y-2">
              <Label htmlFor="customCurrency">Custom Currency Code *</Label>
              <Input
                id="customCurrency"
                placeholder="e.g., AUD, CAD, JPY"
                value={customCurrency}
                onChange={handleCustomCurrencyChange}
                disabled={isSubmitting}
                maxLength={3}
                className="uppercase font-mono text-lg tracking-wider"
              />
              <p className="text-xs text-gray-600">
                Enter a 3-letter currency code (e.g., AUD for Australian Dollar, CAD for Canadian Dollar)
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Tell us why you need this currency or any additional information..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              className="resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Request Summary</p>
                <ul className="space-y-1 text-xs">
                  <li><strong>Email:</strong> {email}</li>
                  <li><strong>Organization:</strong> {organizationName}</li>
                  <li><strong>Name:</strong> {firstName} {lastName}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedCurrency || (selectedCurrency === 'CUSTOM' && customCurrency.length !== 3)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
