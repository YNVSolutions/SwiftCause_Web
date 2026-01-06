'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Badge } from '@/shared/ui/badge';
import { AlertTriangle, Loader, MapPin } from 'lucide-react';
import { useKiosks } from '@/shared/lib/hooks/useKiosks';

interface Kiosk {
  id: string;
  name: string;
  location?: string;
  organizationId?: string;
  [key: string]: any;
}

interface KioskSelectorProps {
  onKiosksChange: (selectedKioskIds: string[]) => void;
  selectedKioskIds?: string[];
  organizationId?: string;
  isLoading?: boolean;
  required?: boolean;
}

export const KioskSelector: React.FC<KioskSelectorProps> = ({
  onKiosksChange,
  selectedKioskIds = [],
  organizationId,
  isLoading: externalLoading = false,
  required = false,
}) => {
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedKioskIds);
  const { kiosks, loading, error } = useKiosks(organizationId);
  const [expandedKiosks, setExpandedKiosks] = useState<boolean>(true);

  // Update local state when external selectedKioskIds changes
  useEffect(() => {
    setLocalSelectedIds(selectedKioskIds);
  }, [selectedKioskIds]);

  const handleKioskToggle = (kioskId: string, checked: boolean) => {
    let updatedIds: string[];
    if (checked) {
      updatedIds = [...localSelectedIds, kioskId];
    } else {
      updatedIds = localSelectedIds.filter(id => id !== kioskId);
    }
    setLocalSelectedIds(updatedIds);
    onKiosksChange(updatedIds);
  };

  const handleSelectAll = () => {
    const allIds = kiosks.map(k => k.id);
    setLocalSelectedIds(allIds);
    onKiosksChange(allIds);
  };

  const handleDeselectAll = () => {
    setLocalSelectedIds([]);
    onKiosksChange([]);
  };

  const isLoading = loading || externalLoading;
  const displayKiosks = kiosks.filter(k => !organizationId || k.organizationId === organizationId);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Assign Kiosks</CardTitle>
        <CardDescription>
          Select which kiosks will display this campaign
          {required && <span className="text-red-500 ml-1">*</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Error State */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-600">Failed to load kiosks</p>
                <p className="text-xs text-red-500 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader className="animate-spin mr-2" size={20} />
              <p className="text-sm text-gray-600">Loading available kiosks...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && displayKiosks.length === 0 && !error && (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-600">No kiosks available in your organization</p>
            </div>
          )}

          {/* Kiosks List */}
          {!isLoading && displayKiosks.length > 0 && (
            <>
              {/* Select/Deselect All Actions */}
              <div className="flex gap-2 pb-4 border-b">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={isLoading}
                >
                  Select All ({displayKiosks.length})
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={isLoading}
                >
                  Clear
                </Button>
              </div>

              {/* Kiosk Items */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {displayKiosks.map(kiosk => (
                  <div
                    key={kiosk.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Checkbox
                      id={`kiosk-${kiosk.id}`}
                      checked={localSelectedIds.includes(kiosk.id)}
                      onCheckedChange={(checked) =>
                        handleKioskToggle(kiosk.id, checked as boolean)
                      }
                      disabled={isLoading}
                      className="mt-1"
                    />
                    <label
                      htmlFor={`kiosk-${kiosk.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{kiosk.name}</p>
                          {kiosk.location && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                              <MapPin size={14} />
                              {kiosk.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              {/* Selected Kiosks Summary */}
              {localSelectedIds.length > 0 && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  <p className="text-sm font-medium">
                    {localSelectedIds.length} kiosk{localSelectedIds.length !== 1 ? 's' : ''}{' '}
                    selected
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {localSelectedIds.map(kioskId => {
                      const kiosk = displayKiosks.find(k => k.id === kioskId);
                      return (
                        <Badge key={kioskId} variant="secondary" className="cursor-pointer">
                          {kiosk?.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Validation Message */}
              {required && localSelectedIds.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-red-500 mt-4">
                  <AlertTriangle size={16} />
                  Please select at least one kiosk
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
