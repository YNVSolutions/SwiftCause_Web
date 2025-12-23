import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { CampaignListHeaderProps } from '../types';

export const CampaignListHeader: React.FC<CampaignListHeaderProps> = ({ onBack }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">Choose a cause</h1>
        <div className="w-10" />
      </div>
    </div>
  );
};
