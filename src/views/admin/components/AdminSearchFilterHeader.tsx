import React from 'react';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Card, CardContent } from '../../../shared/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Calendar } from '../../../shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../shared/ui/popover';
import { Search, Calendar as CalendarIcon, Download } from 'lucide-react';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'date' | 'dateRange';
  options?: { label: string; value: string }[];
}

export interface AdminSearchFilterConfig {
  searchPlaceholder: string;
  filters: FilterConfig[];
}

interface AdminPageHeaderProps {
  title: string;
  subtitle: string;
  config: AdminSearchFilterConfig;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterValues: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  showCalendar?: Record<string, boolean>;
  onCalendarToggle?: (key: string, open: boolean) => void;
  actions?: React.ReactNode;
  exportData?: any[];
  onExport?: () => void;
}

export function AdminPageHeader({
  title,
  subtitle,
  config,
  searchValue,
  onSearchChange,
  filterValues,
  onFilterChange,
  showCalendar = {},
  onCalendarToggle,
  actions,
  exportData,
  onExport
}: AdminPageHeaderProps) {
  const handleExport = () => {
    if (onExport) {
      onExport();
    } else if (exportData) {
      // Default export logic if no custom handler provided
      const { exportToCsv } = require('../../../shared/utils/csvExport');
      exportToCsv(exportData);
    }
  };

  const renderFilter = (filter: FilterConfig) => {
    const value = filterValues[filter.key];

    switch (filter.type) {
      case 'select':
        return (
          <Select 
            key={filter.key}
            value={value || 'all'} 
            onValueChange={(newValue) => onFilterChange(filter.key, newValue)}
          >
            <SelectTrigger className="w-full sm:w-auto sm:min-w-[120px] h-8 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Popover 
            key={filter.key}
            open={showCalendar[filter.key] || false} 
            onOpenChange={(open) => onCalendarToggle?.(filter.key, open)}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto sm:min-w-[120px] h-8 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 justify-start"
              >
                <CalendarIcon className="mr-2 h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {value
                    ? value.toLocaleDateString()
                    : filter.label}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value}
                onSelect={(date) => {
                  onFilterChange(filter.key, date);
                  onCalendarToggle?.(filter.key, false);
                }}
              />
              <div className="p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onFilterChange(filter.key, undefined);
                    onCalendarToggle?.(filter.key, false);
                  }}
                  className="w-full"
                >
                  Clear {filter.label}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="mb-4 sm:mb-6">
      <CardContent className="p-4 sm:p-6">
        {/* Header Row: Title/Subtitle on left, Actions on right (sm and above) */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 sm:mb-6">
          {/* Page Title and Subtitle */}
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 break-words">{title}</h1>
            <p className="text-sm text-gray-600 mt-1 sm:mt-2">{subtitle}</p>
          </div>

          {/* Actions Row - sm and above: Top Right, Mobile: Hidden (shown at bottom) */}
          <div className="hidden sm:flex sm:items-center gap-2">
            {(exportData || onExport) && (
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-gray-100 transition-colors"
                onClick={handleExport}
                aria-label="Export CSV"
              >
                <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Export</span>
              </Button>
            )}
            
            {/* Custom Actions */}
            {actions && (
              <div className="flex gap-2">
                {typeof actions === 'object' && React.isValidElement(actions) ? (
                  actions
                ) : Array.isArray(actions) ? (
                  actions.map((action) => action)
                ) : (
                  actions
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search Input - Pill Shaped with Reduced Width */}
        <div className="mb-4 sm:mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 flex-shrink-0" />
            <Input
              placeholder={config.searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-full h-10 sm:h-11 border border-gray-300 rounded-full text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Filter Row with Label - Responsive Layout */}
        {config.filters.length > 0 && (
          <div className="mb-4 sm:mb-6">
            {/* Mobile: Stacked Layout */}
            <div className="block sm:hidden space-y-3">
              <span className="text-sm font-medium text-gray-700">Filters:</span>
              <div className="grid grid-cols-1 gap-2">
                {config.filters.map(renderFilter)}
              </div>
            </div>
            
            {/* Desktop: Inline Layout */}
            <div className="hidden sm:flex sm:items-center sm:gap-3">
              <span className="text-sm font-medium text-gray-700 flex-shrink-0">Filters:</span>
              <div className="flex flex-wrap items-center gap-2">
                {config.filters.map(renderFilter)}
              </div>
            </div>
          </div>
        )}

        {/* Divider - Only show on mobile when actions exist */}
        {(actions || exportData || onExport) && (
          <div className="border-t border-gray-200 mb-4 sm:mb-6 sm:hidden" />
        )}

        {/* Actions Row - Mobile Only: Centered at Bottom */}
        <div className="flex sm:hidden flex-col gap-2">
          <div className="flex flex-col gap-2 w-full">
            {(exportData || onExport) && (
              <Button
                variant="outline"
                size="sm"
                className="w-full hover:bg-gray-100 transition-colors justify-center"
                onClick={handleExport}
                aria-label="Export CSV"
              >
                <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Export</span>
              </Button>
            )}
            
            {/* Custom Actions */}
            {actions && (
              <div className="flex flex-col gap-2 w-full">
                {typeof actions === 'object' && React.isValidElement(actions) ? (
                  // Single action element
                  React.cloneElement(actions as React.ReactElement<any>, {
                    className: `${(actions as any).props?.className || ''} w-full justify-center`.trim()
                  })
                ) : Array.isArray(actions) ? (
                  // Multiple action elements
                  actions.map((action) => {
                    if (React.isValidElement(action)) {
                      return React.cloneElement(action as React.ReactElement<any>, {
                        ...((action as any).props || {}),
                        className: `${(action as any).props?.className || ''} w-full justify-center`.trim(),
                        key: (action as any).key || Math.random()
                      });
                    }
                    return action;
                  })
                ) : (
                  // Fragment or other React node
                  <div className="w-full flex justify-center">{actions}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


// Keep the old component name for backward compatibility
export const AdminSearchFilterHeader = AdminPageHeader;
