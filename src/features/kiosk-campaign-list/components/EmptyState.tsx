import React from 'react';
import { EmptyStateProps } from '../types';

export const EmptyState: React.FC<EmptyStateProps> = ({ kioskName }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-gray-400 mb-4">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Campaigns Available</h3>
      <p className="text-gray-500">
        {kioskName
          ? `No campaigns have been assigned to ${kioskName}. Please contact your administrator.`
          : 'No active campaigns are currently available.'}
      </p>
    </div>
  );
};
