import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, Heart, LayoutGrid, List } from 'lucide-react';

interface NavigationHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  showViewToggle?: boolean;
  isDetailedView?: boolean;
  onViewToggle?: (detailed: boolean) => void;
  campaignCount?: number;
  rightContent?: React.ReactNode;
}

export function NavigationHeader({
  title,
  subtitle,
  onBack,
  backLabel = "Back",
  showViewToggle = false,
  isDetailedView = true,
  onViewToggle,
  campaignCount,
  rightContent
}: NavigationHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-2 sm:mb-4 p-2 sm:p-3">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-sm sm:text-base">{backLabel}</span>
          </Button>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
            <div>
              <h1 className="text-lg sm:text-2xl text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            {campaignCount !== undefined && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-indigo-50 rounded-lg">
                <Heart className="h-4 w-4 text-indigo-600" />
                <span className="font-medium text-indigo-900">{campaignCount}</span>
              </div>
            )}
            
            {showViewToggle && onViewToggle && (
              <div className="flex items-center bg-gray-50 rounded-lg p-1">
                <Button
                  variant={!isDetailedView ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewToggle(false)}
                  className={`h-8 px-3 ${!isDetailedView ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={isDetailedView ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewToggle(true)}
                  className={`h-8 px-3 ${isDetailedView ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {rightContent}
          </div>
        </div>
      </div>
    </header>
  );
}