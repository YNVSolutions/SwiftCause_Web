import React, { useState } from 'react';
import { User, MapPin, ArrowRight, Check, CheckCircle, Shield } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/currencyFormatter';
import { GiftAidDetails } from '@/shared/types';

interface GiftAidDetailsPanelProps {
  amount: number;
  currency: string;
  campaignTitle: string;
  organizationId: string;
  onSubmit: (details: GiftAidDetails) => void;
  onBack: () => void;
}

export const GiftAidDetailsPanel: React.FC<GiftAidDetailsPanelProps> = ({
  amount,
  currency,
  campaignTitle,
  organizationId,
  onSubmit,
  onBack,
}) => {
  const [fullName, setFullName] = useState('');
  const [postcode, setPostcode] = useState('');
  
  // New form fields for the redesign
  const [addressLine1, setAddressLine1] = useState(''); // giftAid.donorDetails.addressLine1
  const [addressLine2, setAddressLine2] = useState(''); // giftAid.donorDetails.addressLine2
  const [country] = useState('United Kingdom'); // giftAid.donorDetails.country (UK only)
  
  const [declarationAccepted, setDeclarationAccepted] = useState(false); // giftAid.declarationAccepted (required for Gift Aid)
  
  const [errors, setErrors] = useState<{
    fullName?: string;
    postcode?: string;
    addressLine1?: string;
    consent?: string;
  }>({});

  const giftAidAmount = amount * 0.25;
  const totalWithGiftAid = amount + giftAidAmount;

  const formatAmount = (amt: number) => {
    return formatCurrency(amt, currency).replace(/\.00$/, '');
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    } else {
      const nameParts = fullName.trim().split(' ').filter((part) => part.length > 0);
      if (nameParts.length < 2) {
        newErrors.fullName = 'Please enter both first name and surname';
      }
    }

    if (!addressLine1.trim()) {
      newErrors.addressLine1 = 'Address Line 1 is required';
    }

    if (!postcode.trim()) {
      newErrors.postcode = 'Postcode is required';
    } else if (!/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(postcode.trim())) {
      newErrors.postcode = 'Please enter a valid UK postcode';
    }

    if (!declarationAccepted) {
      newErrors.consent = 'You must accept the Gift Aid declaration to proceed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const currentDate = new Date().toISOString();
    const currentYear = new Date().getFullYear();
    const taxYear = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;

    const nameParts = fullName.trim().split(' ').filter((part) => part.length > 0);
    const firstName = nameParts[0] || '';
    const surname = nameParts.slice(1).join(' ') || '';

    const giftAidDetails: GiftAidDetails = {
      firstName,
      surname,
      houseNumber: '',
      address: addressLine1.trim(),
      town: addressLine2.trim(),
      postcode: postcode.trim().toUpperCase(),
      giftAidConsent: declarationAccepted,
      ukTaxpayerConfirmation: declarationAccepted,
      declarationText:
        'I am a UK taxpayer and understand that if I pay less Income Tax and/or Capital Gains Tax than the amount of Gift Aid claimed on all my donations in this tax year, it is my responsibility to pay any difference.',
      declarationDate: currentDate,
      donationAmount: amount,
      donationDate: currentDate,
      organizationId,
      donationId: '',
      timestamp: currentDate,
      taxYear,
    };

    onSubmit(giftAidDetails);
  };

  return (
    <div className="bg-white rounded-3xl border border-green-100 shadow-xl overflow-hidden h-full flex flex-col max-w-xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 text-center">
        <div className="flex justify-center mb-2">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowRight className="w-4 h-4 rotate-45" />
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-1">
          Boosting {formatAmount(amount)} to {formatAmount(totalWithGiftAid)}
        </h2>
        <p className="text-white/90 text-sm">
          Claim Gift Aid and boost your donation by 25%
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-8 py-4 grow flex flex-col">
        {/* Campaign Info */}
        <div className="mb-4 p-3 bg-green-50/70 border border-green-100 rounded-2xl text-center">
          <p className="text-xs text-green-700 font-medium tracking-wide uppercase">Donating to</p>
          <p className="font-semibold text-[#0A0A0A] mt-1">{campaignTitle}</p>
        </div>

        <div className="space-y-4 grow">
          {/* Section 1: Donor details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-1">
              <User className="w-4 h-4 text-green-600" />
              <h3 className="text-base font-semibold text-gray-900 tracking-tight">Donor details</h3>
            </div>
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                className={`w-full h-11 px-4 rounded-lg border-2 text-sm focus:outline-none transition-all bg-white ${
                  errors.fullName
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : 'border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                }`}
                placeholder="e.g. John Smith"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-0.5">{errors.fullName}</p>}
            </div>

            {/* Address Line 1 and Address Line 2 - side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => {
                    setAddressLine1(e.target.value);
                    if (errors.addressLine1) setErrors((prev) => ({ ...prev, addressLine1: undefined }));
                  }}
                  className={`w-full h-11 px-4 rounded-lg border-2 text-sm focus:outline-none transition-all bg-white ${
                    errors.addressLine1
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                  }`}
                  placeholder="House number and street"
                />
                {errors.addressLine1 && <p className="text-red-500 text-xs mt-0.5">{errors.addressLine1}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm focus:outline-none transition-all bg-white"
                  placeholder="Apartment, suite, etc."
                />
              </div>
            </div>

            {/* UK Postcode and Country */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  UK Postcode *
                </label>
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => {
                    setPostcode(e.target.value.toUpperCase());
                    if (errors.postcode) setErrors((prev) => ({ ...prev, postcode: undefined }));
                  }}
                  className={`w-full h-11 px-4 rounded-lg border-2 text-sm uppercase focus:outline-none transition-all bg-white ${
                    errors.postcode
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                  }`}
                  placeholder="E.G. SW1A 1AA"
                  maxLength={8}
                />
                {errors.postcode && <p className="text-red-500 text-xs mt-0.5">{errors.postcode}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  disabled
                  className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Gift Aid declaration */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <h3 className="text-base font-semibold text-gray-900 tracking-tight">Gift Aid declaration</h3>
            </div>
            
            {/* Declaration */}
            <div
              onClick={() => {
                setDeclarationAccepted(!declarationAccepted);
                if (errors.consent) setErrors((prev) => ({ ...prev, consent: undefined }));
              }}
              className={`flex items-start p-4 rounded-2xl cursor-pointer transition-all ${
                errors.consent
                  ? 'border-2 border-red-400 bg-red-50'
                  : declarationAccepted
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-green-50 border-2 border-green-200 hover:bg-green-100'
              }`}
            >
              {/* Custom Checkbox */}
              <div
                className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all mt-0.5 ${
                  declarationAccepted
                    ? 'bg-green-600 border-green-600'
                    : 'bg-white border-gray-300'
                }`}
              >
                {declarationAccepted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <div className="ml-4 flex-1">
                <span className="text-sm text-gray-700 leading-relaxed block">
                  I am a UK taxpayer and understand that if I pay less Income Tax and/or Capital Gains
                  Tax than the amount of Gift Aid claimed on all my donations in this tax year, it is my
                  responsibility to pay any difference.
                </span>
              </div>
            </div>
            {errors.consent && <p className="text-red-500 text-xs">{errors.consent}</p>}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-5 space-y-3">
          <button
            type="submit"
            disabled={!declarationAccepted}
            className="w-full h-12 rounded-lg font-semibold text-sm text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-200/50 hover:shadow-green-300/60"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Continue to Payment
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full h-10 text-green-700 hover:text-green-800 font-medium text-sm transition-colors"
          >
            Back
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 mt-3 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>Your details are secure and only used for Gift Aid purposes.</span>
          </div>
        </div>
      </form>
    </div>
  );
};
