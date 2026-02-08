import React from 'react';
import { EmptyStateProps } from '../types';

export const EmptyState: React.FC<EmptyStateProps> = ({ kioskName }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-white/80 border border-[rgba(15,23,42,0.08)] shadow-lg rounded-2xl px-8 py-8 max-w-xl">
        <div className="text-[#0E8F5A] mb-4">
          <svg
            className="mx-auto h-12 w-12 text-[#0E8F5A]"
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
        <p className="text-gray-600">
          {kioskName
            ? `No campaigns have been assigned to ${kioskName}. Please contact your administrator.`
            : 'No active campaigns are currently available.'}
        </p>
      </div>
    </div>
  );
};
