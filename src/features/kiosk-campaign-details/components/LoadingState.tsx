import React from 'react';
import { LoadingStateProps } from '../types';

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading campaign...',
}) => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#159A6F] mx-auto" />
        <p className="text-[#0A0A0A] text-base font-medium">{message}</p>
      </div>
    </div>
  );
};
