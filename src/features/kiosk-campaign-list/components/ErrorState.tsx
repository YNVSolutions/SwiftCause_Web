import React from 'react';
import { ErrorStateProps } from '../types';

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
      <div className="text-center py-12">
        <div className="bg-white border border-red-200 rounded-2xl p-6 max-w-md mx-auto shadow-lg">
          <p className="text-red-700 mb-4">{message}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};
