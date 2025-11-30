"use client";

import React from 'react';
import { Input } from '../../../shared/ui/input';
import { Button } from '../../../shared/ui/button';
import { Search, Filter, X, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/select';

interface FilterOption {
  label: string;
  value: string;
}

interface FuturisticSearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filterLabel?: string;
  filterValue?: string;
  filterOptions?: FilterOption[];
  onFilterChange?: (value: string) => void;
  onAdd?: () => void;
  addLabel?: string;
  showFilter?: boolean;
}

export function FuturisticSearchBar({
  searchValue,
  onSearchChange,
  placeholder = 'Search...',
  filterLabel = 'Filter',
  filterValue,
  filterOptions = [],
  onFilterChange,
  onAdd,
  addLabel = 'Add New',
  showFilter = true,
}: FuturisticSearchBarProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        {showFilter && filterOptions.length > 0 && onFilterChange && (
          <div className="flex items-center gap-2 sm:w-auto w-full">
            <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <Select value={filterValue} onValueChange={onFilterChange}>
              <SelectTrigger className="sm:w-[180px] w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                <SelectValue placeholder={filterLabel} />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Add Button */}
        {onAdd && (
          <Button
            onClick={onAdd}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all sm:w-auto w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {addLabel}
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {searchValue && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-600 font-medium">Active filters:</span>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 px-2 py-1 bg-indigo-50 border border-indigo-200 rounded-md text-xs text-indigo-700">
              <span>Search: "{searchValue}"</span>
              <button
                onClick={() => onSearchChange('')}
                className="hover:text-indigo-900"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
