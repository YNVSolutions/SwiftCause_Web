import React, { useState } from 'react';
import { User, MapPin, ArrowRight, Check } from 'lucide-react';
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
  const [giftAidConsent, setGiftAidConsent] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
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

    if (!postcode.trim()) {
      newErrors.postcode = 'Postcode is required';
    } else if (!/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(postcode.trim())) {
      newErrors.postcode = 'Please enter a valid UK postcode';
    }

    if (!giftAidConsent) {
      newErrors.consent = 'You must agree to the declaration to proceed';
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
      address: '',
      town: '',
      postcode: postcode.trim().toUpperCase(),
      giftAidConsent,
      ukTaxpayerConfirmation: giftAidConsent,
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
    <div className="bg-white/90 rounded-3xl border border-green-100 shadow-xl overflow-hidden h-full flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-5 sm:px-8 sm:py-6 text-center">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shadow-lg">
            <ArrowRight className="w-6 h-6 rotate-45" />
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">
          Boosting {formatAmount(amount)} to {formatAmount(totalWithGiftAid)}
        </h2>
        <p className="text-white/85 text-sm sm:text-base">
          Just a few details to add extra {formatAmount(giftAidAmount)} to your donation
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-8 lg:p-10 grow flex flex-col">
        {/* Campaign Info */}
        <div className="mb-8 p-4 bg-green-50/70 border border-green-100 rounded-2xl text-center">
          <p className="text-sm text-green-700">Donating to</p>
          <p className="font-semibold text-[#0A0A0A]">{campaignTitle}</p>
        </div>

        <div className="space-y-6 grow">
          {/* Full Name */}
          <div>
            <label className="flex items-center text-base font-medium text-[#0A0A0A] mb-2">
              <User className="w-5 h-5 mr-2 text-gray-400" />
              Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              className={`w-full h-14 px-4 rounded-xl border-2 text-lg focus:outline-none transition-colors bg-white ${
                errors.fullName
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200'
              }`}
              placeholder="e.g. John Smith"
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

          {/* Postcode */}
          <div>
            <label className="flex items-center text-base font-medium text-[#0A0A0A] mb-2">
              <MapPin className="w-5 h-5 mr-2 text-gray-400" />
              UK Postcode *
            </label>
            <input
              type="text"
              value={postcode}
              onChange={(e) => {
                setPostcode(e.target.value.toUpperCase());
                if (errors.postcode) setErrors((prev) => ({ ...prev, postcode: undefined }));
              }}
              className={`w-full h-14 px-4 rounded-xl border-2 text-lg uppercase focus:outline-none transition-colors bg-white ${
                errors.postcode
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200'
              }`}
              placeholder="e.g. SW1A 1AA"
              maxLength={8}
            />
            {errors.postcode && <p className="text-red-500 text-sm mt-1">{errors.postcode}</p>}
          </div>

          {/* Gift Aid Declaration - Single Checkbox */}
          <div
            onClick={() => {
              setGiftAidConsent(!giftAidConsent);
              if (errors.consent) setErrors((prev) => ({ ...prev, consent: undefined }));
            }}
            className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
              errors.consent
                ? 'border-red-400 bg-red-50'
                : giftAidConsent
                  ? 'border-green-500 bg-green-50'
                  : 'border-green-200 bg-white hover:border-green-400'
            }`}
          >
            {/* Custom Checkbox */}
            <div
              className={`w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center transition-all ${
                giftAidConsent
                  ? 'bg-green-600 border-green-600'
                  : 'bg-white border-gray-300'
              }`}
            >
              {giftAidConsent && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
            </div>
            <span className="ml-4 text-sm text-gray-600 leading-relaxed">
              I am a UK taxpayer and understand that if I pay less Income Tax and/or Capital Gains
              Tax than the amount of Gift Aid claimed on all my donations in this tax year, it is my
              responsibility to pay any difference.
            </span>
          </div>
          {errors.consent && <p className="text-red-500 text-sm -mt-4">{errors.consent}</p>}
        </div>

        {/* Buttons */}
        <div className="mt-8 space-y-4">
          <button
            type="submit"
            disabled={!giftAidConsent}
            className="w-full h-14 rounded-xl font-semibold text-lg text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-200/70"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Continue to Payment
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full h-12 text-green-700 hover:text-green-800 font-medium text-base transition-colors"
          >
            Back
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Your details are secure and only used for Gift Aid purposes.
        </p>
      </form>
    </div>
  );
};
