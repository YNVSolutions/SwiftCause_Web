import React, { useState } from 'react';
import { User, MapPin, ArrowRight, Check, CheckCircle, Shield } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/currencyFormatter';
import { GiftAidDetails } from '@/entities/giftAid/model/types';
import { HMRC_DECLARATION_TEXT } from '@/shared/config/constants';

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
  const [houseNumber, setHouseNumber] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [town, setTown] = useState('');
  const [postcode, setPostcode] = useState('');
  
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [errors, setErrors] = useState<{
    fullName?: string;
    houseNumber?: string;
    addressLine1?: string;
    town?: string;
    postcode?: string;
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

    if (!town.trim()) {
      newErrors.town = 'Town/City is required';
    }

    if (!postcode.trim()) {
      newErrors.postcode = 'Postcode is required';
    } else {
      const normalizedPostcode = postcode.trim().toUpperCase();
      if (!/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(normalizedPostcode)) {
        newErrors.postcode = 'Please enter a valid UK postcode';
      }
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

    setSubmitting(true);

    const currentDate = new Date().toISOString();
    const currentYear = new Date().getFullYear();
    const taxYear = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;

    const nameParts = fullName.trim().split(' ').filter((part) => part.length > 0);
    const firstName = nameParts[0] || '';
    const surname = nameParts.slice(1).join(' ') || '';

    // Normalize postcode before storage
    const normalizedPostcode = postcode.trim().toUpperCase();

    const giftAidDetails: GiftAidDetails = {
      firstName,
      surname,
      houseNumber: houseNumber.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || undefined,
      town: town.trim(),
      postcode: normalizedPostcode,
      giftAidConsent: declarationAccepted,
      ukTaxpayerConfirmation: declarationAccepted,
      declarationText: HMRC_DECLARATION_TEXT,
      declarationDate: currentDate,
      donationAmount: Math.round(amount * 100), // Convert GBP pounds to pence for HMRC compliance
      donationDate: currentDate,
      organizationId,
      donationId: '', // Intentionally empty: populated after donation creation to enforce 1:1 Gift Aid ↔ Donation mapping
      timestamp: currentDate,
      taxYear,
    };

    try {
      onSubmit(giftAidDetails);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFFBF7] rounded-[20px] border border-[rgba(15,23,42,0.08)] shadow-[0_12px_32px_rgba(15,23,42,0.08)] overflow-hidden h-full flex flex-col max-w-xl mx-auto font-lexend">
      {/* Header */}
      <div className="bg-[#0E8F5A] text-white px-6 py-4 text-center relative">
        <div className="flex justify-center mb-2">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowRight className="w-4 h-4 rotate-45" />
          </div>
        </div>
        <h2 className="text-[22px] sm:text-[26px] font-semibold mb-1 tracking-[-0.01em] leading-[1.3]">
          Boosting {formatAmount(amount)} to {formatAmount(totalWithGiftAid)}
        </h2>
        <p className="text-white/90 text-[16px] font-normal">
          Claim Gift Aid and boost your donation by 25%
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-4 grow flex flex-col">
        {/* Campaign Info */}
        <div className="mb-3 p-3 bg-gray-100/50 border border-[rgba(15,23,42,0.08)] rounded-xl text-center">
          <p className="text-[11px] text-[#0E8F5A] font-medium tracking-[0.18em] uppercase">Donating to</p>
          <p className="font-medium text-slate-900 mt-1 tracking-[-0.01em] text-[17px]">{campaignTitle}</p>
        </div>

        <div className="space-y-3 grow">
          {/* Section 1: Donor details */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 pb-1">
              <User className="w-4 h-4 text-[#0E8F5A]" />
              <h3 className="text-[18px] font-semibold text-slate-900 tracking-[-0.01em]">Donor details</h3>
            </div>
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-[15px] font-medium text-slate-600">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                className={`w-full h-11 px-4 rounded-lg border-2 text-[16px] font-normal focus:outline-none transition-all bg-white ${
                  errors.fullName
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : 'border-gray-200 focus:border-[#0E8F5A] focus:ring-2 focus:ring-[#0E8F5A]/10'
                }`}
                placeholder="e.g. John Smith"
              />
              {errors.fullName && <p className="text-red-500 text-[14px] mt-0.5 font-normal">{errors.fullName}</p>}
            </div>

            {/* House Number and Address Line 1 - side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[15px] font-medium text-slate-600">
                  House Number
                </label>
                <input
                  type="text"
                  value={houseNumber}
                  onChange={(e) => {
                    setHouseNumber(e.target.value);
                    if (errors.houseNumber) setErrors((prev) => ({ ...prev, houseNumber: undefined }));
                  }}
                  className={`w-full h-11 px-4 rounded-lg border-2 text-[16px] font-normal focus:outline-none transition-all bg-white ${
                    errors.houseNumber
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-200 focus:border-[#0E8F5A] focus:ring-2 focus:ring-[#0E8F5A]/10'
                  }`}
                  placeholder="e.g. 123"
                />
                {errors.houseNumber && <p className="text-red-500 text-[14px] mt-0.5 font-normal">{errors.houseNumber}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-[15px] font-medium text-slate-600">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => {
                    setAddressLine1(e.target.value);
                    if (errors.addressLine1) setErrors((prev) => ({ ...prev, addressLine1: undefined }));
                  }}
                  className={`w-full h-11 px-4 rounded-lg border-2 text-[16px] font-normal focus:outline-none transition-all bg-white ${
                    errors.addressLine1
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-200 focus:border-[#0E8F5A] focus:ring-2 focus:ring-[#0E8F5A]/10'
                  }`}
                  placeholder="e.g. Main Street"
                />
                {errors.addressLine1 && <p className="text-red-500 text-[14px] mt-0.5 font-normal">{errors.addressLine1}</p>}
              </div>
            </div>

            {/* Address Line 2 and Town - side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[15px] font-medium text-slate-600">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 focus:border-[#0E8F5A] focus:ring-2 focus:ring-[#0E8F5A]/10 text-[16px] font-normal focus:outline-none transition-all bg-white"
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[15px] font-medium text-slate-600">
                  Town/City *
                </label>
                <input
                  type="text"
                  value={town}
                  onChange={(e) => {
                    setTown(e.target.value);
                    if (errors.town) setErrors((prev) => ({ ...prev, town: undefined }));
                  }}
                  className={`w-full h-11 px-4 rounded-lg border-2 text-[16px] font-normal focus:outline-none transition-all bg-white ${
                    errors.town
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-200 focus:border-[#0E8F5A] focus:ring-2 focus:ring-[#0E8F5A]/10'
                  }`}
                  placeholder="e.g. London"
                />
                {errors.town && <p className="text-red-500 text-[14px] mt-0.5 font-normal">{errors.town}</p>}
              </div>
            </div>

            {/* UK Postcode */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-[15px] font-medium text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  UK Postcode *
                </label>
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => {
                    const normalizedPostcode = e.target.value.trim().toUpperCase();
                    setPostcode(normalizedPostcode);
                    if (errors.postcode) setErrors((prev) => ({ ...prev, postcode: undefined }));
                  }}
                  className={`w-full h-11 px-4 rounded-lg border-2 text-[16px] font-normal uppercase focus:outline-none transition-all bg-white ${
                    errors.postcode
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-200 focus:border-[#0E8F5A] focus:ring-2 focus:ring-[#0E8F5A]/10'
                  }`}
                  placeholder="E.G. SW1A 1AA"
                  maxLength={8}
                />
                {errors.postcode && <p className="text-red-500 text-[14px] mt-0.5 font-normal">{errors.postcode}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-[15px] font-medium text-slate-600">
                  Country
                </label>
                <input
                  type="text"
                  value="United Kingdom"
                  disabled
                  className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed text-[16px] font-normal"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Gift Aid declaration */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 pb-1">
              <CheckCircle className="w-4 h-4 text-[#0E8F5A]" />
              <h3 className="text-[18px] font-semibold text-slate-900 tracking-[-0.01em]">Gift Aid declaration</h3>
            </div>
            
            {/* Declaration */}
            <div
              onClick={() => {
                setDeclarationAccepted(!declarationAccepted);
                if (errors.consent) setErrors((prev) => ({ ...prev, consent: undefined }));
              }}
              className={`flex items-start p-4 rounded-xl cursor-pointer transition-all ${
                errors.consent
                  ? 'border-2 border-red-400 bg-red-50'
                  : declarationAccepted
                    ? 'bg-gray-100/50 border-2 border-[rgba(15,23,42,0.08)]'
                    : 'bg-gray-100/50 border-2 border-[rgba(15,23,42,0.08)] hover:bg-gray-100/70'
              }`}
            >
              {/* Custom Checkbox */}
              <div
                className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all mt-0.5 ${
                  declarationAccepted
                    ? 'bg-[#0E8F5A] border-[#0E8F5A]'
                    : 'bg-white border-gray-300'
                }`}
              >
                {declarationAccepted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <div className="ml-4 flex-1">
                <span className="text-[15px] text-slate-700 leading-[1.6] block font-normal">
                  {HMRC_DECLARATION_TEXT}
                </span>
              </div>
            </div>
            {errors.consent && <p className="text-red-500 text-xs">{errors.consent}</p>}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 space-y-2">
          <button
            type="submit"
            disabled={submitting || !declarationAccepted}
            className="w-full h-12 rounded-full font-semibold text-[17px] text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center bg-[#0E8F5A] hover:brightness-[1.02] active:brightness-[0.98] shadow-[0_12px_32px_rgba(15,23,42,0.08)] tracking-[0.01em]"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            {submitting ? 'Processing...' : 'Continue to Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};
