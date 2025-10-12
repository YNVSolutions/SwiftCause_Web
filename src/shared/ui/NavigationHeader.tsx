import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, Heart, LayoutGrid, List, Shuffle } from 'lucide-react';

interface NavigationHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  showViewToggle?: boolean; 
  campaignCount?: number;
  rightContent?: React.ReactNode;
  layoutMode?: 'grid' | 'list' | 'carousel'; // New prop for current layout
  onLayoutChange?: (mode: 'grid' | 'list' | 'carousel') => void; // New prop for changing layout
}


export function NavigationHeader({
  title,
  subtitle,
  onBack,
  backLabel = "Back",
  showViewToggle = false,
  campaignCount,
  rightContent,
  layoutMode = 'grid', // Default to grid
  onLayoutChange,
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
            
            {showViewToggle && onLayoutChange && ( // Use onLayoutChange instead of onViewToggle
              <div className="flex items-center bg-gray-50 rounded-lg p-1">
                <Button
                  variant={layoutMode === 'grid' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onLayoutChange('grid')}
                  className={`h-8 px-3 ${layoutMode === 'grid' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={layoutMode === 'list' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onLayoutChange('list')}
                  className={`h-8 px-3 ${layoutMode === 'list' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={layoutMode === 'carousel' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onLayoutChange('carousel')}
                  className={`h-8 px-3 ${layoutMode === 'carousel' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
                >
                  <Shuffle className="h-4 w-4" />
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