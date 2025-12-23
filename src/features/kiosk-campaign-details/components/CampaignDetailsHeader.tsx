import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { CampaignDetailsHeaderProps } from '../types';

export const CampaignDetailsHeader: React.FC<CampaignDetailsHeaderProps> = ({ onBack }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex items-center max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center text-[#0A0A0A] hover:text-gray-600 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
          <span className="ml-1 font-medium">Back</span>
        </button>
      </div>
    </div>
  );
};
