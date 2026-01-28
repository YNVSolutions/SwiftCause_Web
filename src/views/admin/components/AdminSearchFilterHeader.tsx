import React from 'react';
import { Button } from '../../../shared/ui/button';
import { Card, CardContent } from '../../../shared/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Calendar } from '../../../shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../shared/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'date' | 'dateRange';
  options?: { label: string; value: string }[];
}

export interface AdminSearchFilterConfig {
  filters: FilterConfig[];
}

interface AdminPageHeaderProps {
  config: AdminSearchFilterConfig;
  filterValues: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  actions?: React.ReactNode;
}

export function AdminPageHeader({
  config,
  filterValues,
  onFilterChange,
  actions
}: AdminPageHeaderProps) {
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
            <SelectTrigger className="w-full sm:w-auto sm:min-w-[120px] h-8 text-sm border border-[#F3F1EA]/60 rounded-2xl bg-[#F7F6F2] hover:bg-[#F3F1EA] transition-all duration-300">
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
          <Popover key={filter.key}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto sm:min-w-[120px] h-8 text-sm border border-[#F3F1EA]/60 rounded-2xl bg-[#F7F6F2] hover:bg-[#F3F1EA] transition-all duration-300 justify-start"
              >
                <CalendarIcon className="mr-2 h-3 w-3 shrink-0" />
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
                }}
              />
              <div className="p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onFilterChange(filter.key, undefined);
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
    <Card className="mb-4 sm:mb-6 bg-[#F7F6F2] rounded-4xl border border-[#F3F1EA]/60 shadow-lg shadow-emerald-900/4">
      <CardContent className="p-6 sm:p-8">
        {/* Filter Row with Label - Responsive Layout */}
        {config.filters.length > 0 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              <span className="text-sm font-medium text-slate-700 shrink-0">Filters:</span>
              <div className="flex flex-wrap items-center gap-2">
                {config.filters.map(renderFilter)}
              </div>
            </div>
            {actions && (
              <div className="flex items-center gap-2">
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
        )}
      </CardContent>
    </Card>
  );
}


// Keep the old component name for backward compatibility
export const AdminSearchFilterHeader = AdminPageHeader;
