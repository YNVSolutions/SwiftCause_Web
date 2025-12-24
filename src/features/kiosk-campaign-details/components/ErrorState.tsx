import React from 'react';
import { ErrorStateProps } from '../types';

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-700 mb-4">{message}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};
