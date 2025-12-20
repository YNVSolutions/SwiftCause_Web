import React from 'react';
import { Button } from '@/shared/ui/button';
import { PaginationProps } from '../types';

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-8 space-x-2">
      <Button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        variant="outline"
        className="px-4 py-2 disabled:opacity-50"
      >
        ← Previous
      </Button>
      <span className="px-4 py-2 text-gray-600 flex items-center">
        {currentPage} of {totalPages}
      </span>
      <Button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        variant="outline"
        className="px-4 py-2 disabled:opacity-50"
      >
        Next →
      </Button>
    </div>
  );
};
