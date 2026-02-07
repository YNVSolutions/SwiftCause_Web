import React, { useState, useEffect } from 'react';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Label } from '../../shared/ui/label';
import { Checkbox } from '../../shared/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/card';
import { NavigationHeader } from '../../shared/ui/NavigationHeader';
import { User, MapPin, ArrowRight } from 'lucide-react';
import { Campaign } from '../../shared/types';
import { GiftAidDetails } from '../../entities/giftAid/model/types';
import { formatCurrency } from '../../shared/lib/currencyFormatter';

interface GiftAidDetailsScreenProps {
  campaign: Campaign;
  amount: number;
  onSubmit: (details: GiftAidDetails) => void;
  onBack: () => void;
  organizationCurrency?: string;
}

export function GiftAidDetailsScreen({
  campaign,
  amount,
  onSubmit,
  onBack,
  organizationCurrency = 'USD'
}: GiftAidDetailsScreenProps) {
  // Loading state for initial screen load
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Donor Information
  const [fullName, setFullName] = useState('');
  const [postcode, setPostcode] = useState('');
  
  // Declaration Requirements
  const [giftAidConsent, setGiftAidConsent] = useState(true);
  const [ukTaxpayerConfirmation, setUkTaxpayerConfirmation] = useState(true);
  
  const [errors, setErrors] = useState<{
    fullName?: string;
    postcode?: string;
    consent?: string;
    taxpayer?: string;
  }>({});

  // Show loading screen briefly when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const giftAidAmount = amount * 0.25;
  const totalWithGiftAid = amount + giftAidAmount;

  // Show loading screen when initially loading
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-white">
        <NavigationHeader
          title="Gift Aid Details"
          onBack={onBack}
          backLabel="Back"
        />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0E8F5A] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Gift Aid form...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show loading screen when submitting
  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-white">
        <NavigationHeader
          title="Gift Aid Details"
          onBack={onBack}
          backLabel="Back"
        />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0E8F5A] mx-auto mb-4"></div>
            <p className="text-gray-600">Processing your details...</p>
          </div>
        </main>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: {
      fullName?: string;
      postcode?: string;
      consent?: string;
      taxpayer?: string;
    } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    } else {
      const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
      if (nameParts.length < 2) {
        newErrors.fullName = 'Please enter both first name and surname';
      }
    }

    if (!postcode.trim()) {
      newErrors.postcode = 'Postcode is required';
    } else if (!/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(postcode.trim())) {
      newErrors.postcode = 'Please enter a valid UK postcode';
    }

    if (!giftAidConsent) {
      newErrors.consent = 'You must agree to the Gift Aid declaration to proceed';
    }

    if (!ukTaxpayerConfirmation) {
      newErrors.taxpayer = 'You must confirm UK taxpayer status to proceed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Add a small delay to show the loading state
      setTimeout(() => {
        const currentDate = new Date().toISOString();
        const currentYear = new Date().getFullYear();
        const taxYear = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
        
        // Split full name into first name and surname
        const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
        const firstName = nameParts[0] || '';
        const surname = nameParts.slice(1).join(' ') || '';
        
        const donationAmountPence = Math.round(amount * 100);
        const giftAidDetails: GiftAidDetails = {
          // Donor Information
          firstName: firstName,
          surname: surname,
          houseNumber: '', // Default to empty string
          addressLine1: '', // Default to empty string
          town: '', // Default to empty string
          postcode: postcode.trim().toUpperCase(),
          
          // Declaration Requirements
          giftAidConsent,
          ukTaxpayerConfirmation,
          declarationText: "I confirm that I am a UK taxpayer and understand that if I pay less Income Tax and/or Capital Gains Tax in the current tax year than the amount of Gift Aid claimed on all my donations, it is my responsibility to pay any difference.",
          declarationDate: currentDate,
          
          // Donation Details
          donationAmount: donationAmountPence,
          donationDate: currentDate,
          organizationId: campaign.organizationId || '',
          donationId: '', // Default empty string
          
          // Audit Trail
          timestamp: currentDate,
          taxYear: taxYear
        };
        
        onSubmit(giftAidDetails);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <NavigationHeader
        title="Gift Aid Details"
        onBack={onBack}
        backLabel="Back"
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl !bg-[#FCFCFA] shadow-[0_10px_30px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden border border-gray-200/50">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-8 h-8 rotate-45" />
                  </div>
                </div>
                <div
                  role="heading"
                  aria-level={2}
                  className="text-2xl sm:text-3xl font-bold mb-2"
                >
                  Boosting your {formatCurrency(amount, organizationCurrency)} to{' '}
                  {formatCurrency(totalWithGiftAid, organizationCurrency)}
                </div>
                <p className="text-green-100 text-lg">
                  Just a few details to claim your extra {formatCurrency(giftAidAmount, organizationCurrency)}
                </p>
              </div>
            </CardHeader>

            <CardContent className="p-8 !bg-[#FCFCFA]">
              {/* Campaign Info */}
              <div className="mb-8 p-4 bg-gray-100/50 rounded-lg text-center border border-gray-200/30">
                <p className="text-sm text-gray-600 mb-1">Donating to:</p>
                <p className="font-semibold text-gray-900 text-lg">{campaign.title}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2 text-gray-500" />
                    Personal Information
                  </h3>
                  
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-base font-medium text-gray-700">
                      Full Name (First Name and Surname) *
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
                      }}
                      className={`h-14 text-lg bg-[#FCFCFA] ${errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#0E8F5A]'}`}
                      placeholder="e.g. John Smith"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                    <p className="text-gray-500 text-sm">
                      Initials alone are NOT sufficient - please enter your full first name and surname
                    </p>
                  </div>
                </div>

                {/* UK Postcode Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                    UK Address Verification
                  </h3>
                  
                  {/* UK Postcode */}
                  <div className="space-y-2">
                    <Label htmlFor="postcode" className="text-base font-medium text-gray-700">
                      UK Postcode *
                    </Label>
                    <Input
                      id="postcode"
                      type="text"
                      value={postcode}
                      onChange={(e) => {
                        setPostcode(e.target.value);
                        if (errors.postcode) setErrors(prev => ({ ...prev, postcode: undefined }));
                      }}
                      className={`h-14 text-lg uppercase bg-[#FCFCFA] ${errors.postcode ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#0E8F5A]'}`}
                      placeholder="e.g. SW1A 1AA"
                      maxLength={8}
                    />
                    {errors.postcode && (
                      <p className="text-red-500 text-sm mt-1">{errors.postcode}</p>
                    )}
                    <p className="text-gray-500 text-sm">
                      We need your UK postcode to verify your taxpayer status for Gift Aid
                    </p>
                  </div>
                </div>

                {/* Declaration Requirements */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Declaration Requirements</h3>
                  
                  {/* UK Taxpayer Confirmation */}
                  <div className={`bg-yellow-50 border rounded-lg p-4 ${errors.taxpayer ? 'border-red-500' : 'border-yellow-200'}`}>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="ukTaxpayerConfirmation"
                        checked={ukTaxpayerConfirmation}
                        onCheckedChange={(checked) => {
                          setUkTaxpayerConfirmation(!!checked);
                          if (errors.taxpayer) setErrors(prev => ({ ...prev, taxpayer: undefined }));
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor="ukTaxpayerConfirmation" 
                          className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                        >
                          <span className="font-semibold text-gray-900 block mb-1">UK Taxpayer Confirmation</span>
                          I confirm that I have paid enough UK Income Tax and/or Capital Gains Tax in the current tax year 
                          to cover the amount of Gift Aid claimed on all my donations.
                        </Label>
                      </div>
                    </div>
                    {errors.taxpayer && (
                      <p className="text-red-500 text-sm mt-2 ml-8">{errors.taxpayer}</p>
                    )}
                  </div>

                  {/* Gift Aid Declaration */}
                  <div className={`bg-blue-50 border rounded-lg p-4 ${errors.consent ? 'border-red-500' : 'border-blue-200'}`}>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="giftAidConsent"
                        checked={giftAidConsent}
                        onCheckedChange={(checked) => {
                          setGiftAidConsent(!!checked);
                          if (errors.consent) setErrors(prev => ({ ...prev, consent: undefined }));
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor="giftAidConsent" 
                          className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                        >
                          <span className="font-semibold text-gray-900 block mb-1">Gift Aid Declaration</span>
                          I confirm that I am a UK taxpayer and understand that if I pay less Income Tax and/or 
                          Capital Gains Tax in the current tax year than the amount of Gift Aid claimed on all 
                          my donations, it is my responsibility to pay any difference.
                        </Label>
                      </div>
                    </div>
                    {errors.consent && (
                      <p className="text-red-500 text-sm mt-2 ml-8">{errors.consent}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!giftAidConsent || !ukTaxpayerConfirmation || isSubmitting}
                  className="w-full h-16 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Processing...
                      <div className="w-6 h-6 ml-3"></div>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-6 h-6 mr-3" />
                      Continue to Payment
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </>
                  )}
                </Button>

                {/* Additional Info */}
                <div className="text-center">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Your details are secure and will only be used for Gift Aid purposes. 
                    You can cancel Gift Aid at any time by contacting the charity.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
