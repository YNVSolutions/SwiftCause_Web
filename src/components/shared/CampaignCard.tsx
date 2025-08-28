import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Heart, Info, ArrowRight, Star } from 'lucide-react';
import { Campaign } from '../../App';

interface CampaignCardProps {
  campaign: Campaign;
  variant?: 'compact' | 'detailed';
  onDonate?: (campaign: Campaign) => void; // Modified to pass campaign object
  onViewDetails?: (campaign: Campaign, initialShowDetails: boolean) => void; // Modified to pass campaign and initialShowDetails
  isDefault?: boolean;
}

export function CampaignCard({ 
  campaign, 
  variant = 'detailed', 
  onDonate, 
  onViewDetails,
  isDefault = false 
}: CampaignCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  if (variant === 'compact') {
    return (
      <Card className={`overflow-hidden hover:shadow-md transition-shadow ${
        isDefault ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''
      }`}>
        <div className="flex">
          <div className="w-24 h-24 sm:w-32 sm:h-32 relative overflow-hidden flex-shrink-0">
            <ImageWithFallback 
              src={campaign.coverImageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
            {isDefault && (
              <div className="absolute top-1 left-1">
                <Badge className="bg-indigo-600 text-white text-xs px-1 py-0.5">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              </div>
            )}
            {campaign.isGlobal && (
              <div className="absolute top-1 right-1">
                <Badge className="bg-green-600 text-white text-xs px-1 py-0.5">
                  Global
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm sm:text-base line-clamp-1">{campaign.title}</h3>
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {campaign.category}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Raised</span>
                  <span className="text-green-600">{formatCurrency(campaign.raised)}</span>
                </div>
                <Progress value={getProgressPercentage(campaign.raised, campaign.goal)} className="h-1.5" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{getProgressPercentage(campaign.raised, campaign.goal).toFixed(0)}% of {formatCurrency(campaign.goal)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-2 sm:mt-3">
              {onDonate && (
                <Button 
                  onClick={() => onDonate(campaign)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-1.5 rounded-xl transition-all duration-200 ease-in-out"
                >
                  <Heart className="mr-1 h-3 w-3" />
                  Donate
                </Button>
              )}
              
              {onViewDetails && (
                <Button 
                  variant="outline" 
                  onClick={() => onViewDetails(campaign, true)}
                  className="h-8 sm:h-9 px-2 sm:px-3"
                  size="sm"
                >
                  <Info className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${
      isDefault ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''
    }`}>
      <div className="aspect-[16/10] sm:aspect-video relative overflow-hidden">
        <ImageWithFallback 
          src={campaign.coverImageUrl}
          alt={campaign.title}
          className="w-full h-full object-cover"
        />
        <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/90 text-gray-800 text-xs">
          {campaign.category}
        </Badge>
        {isDefault && (
          <Badge className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-indigo-600 text-white text-xs">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
        {campaign.isGlobal && (
          <Badge className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-green-600 text-white text-xs">
            Global Campaign
          </Badge>
        )}
      </div>
      
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="line-clamp-1 text-base sm:text-lg">{campaign.title}</CardTitle>
        <p className="line-clamp-2 text-sm sm:text-base text-muted-foreground">
          {campaign.description}
        </p>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Raised</span>
            <span className="text-green-600">{formatCurrency(campaign.raised)}</span>
          </div>
          <Progress value={getProgressPercentage(campaign.raised, campaign.goal)} className="h-2" />
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">
              {getProgressPercentage(campaign.raised, campaign.goal).toFixed(1)}% of goal
            </span>
            <span className="text-muted-foreground">Goal: {formatCurrency(campaign.goal)}</span>
          </div>
        </div>
        
        <div className="flex gap-2 sm:gap-3">
          {onDonate && (
            <Button 
              onClick={() => onDonate(campaign)}
              className="flex-1 h-11 sm:h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200 ease-in-out"
              size="lg"
            >
              <Heart className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="text-sm sm:text-base">Donate</span>
              <ArrowRight className="ml-1 sm:ml-2 h-4 w-4" />
            </Button>
          )}
          
          {onViewDetails && (
            <Button 
              variant="outline" 
              onClick={() => onViewDetails(campaign, true)}
              className="h-11 sm:h-12 px-3 sm:px-4"
              size="lg"
            >
              <Info className="h-4 w-4" />
              <span className="sr-only">View details</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
