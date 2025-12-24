import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Progress } from './progress';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Heart, Info, ArrowRight, Star } from 'lucide-react';
import { Campaign } from '../types';
import { formatCurrency } from '../lib/currencyFormatter';

interface CampaignCardProps {
  campaign: Campaign;
  variant?: 'compact' | 'detailed';
  onDonate?: (campaign: Campaign) => void; 
  onViewDetails?: (campaign: Campaign, initialShowDetails: boolean) => void; 
  isDefault?: boolean;
  organizationCurrency?: string; 
}

export function CampaignCard({
  campaign,
  variant = 'detailed',
  onDonate,
  onViewDetails,
  isDefault = false,
  organizationCurrency 
}: CampaignCardProps) {
  if (!campaign.raised) {
    campaign.raised = 0;
  }


  const getProgressPercentage = (raised: number, goal: number) => {
    if (!raised) return 0;
    return Math.min((raised / goal) * 100, 100);
  };

  if (variant === 'compact') {
    return (
      <Card className={`rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 bg-white border border-gray-100 overflow-hidden hover:-translate-y-1 ${isDefault ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''}`}>
        <div className="flex">
          <div className="w-32 h-32 sm:w-40 sm:h-40 relative overflow-hidden flex-shrink-0">
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
                  <span className="text-green-600">{formatCurrency(campaign.raised, organizationCurrency || 'USD')}</span>
                </div>
                <Progress value={getProgressPercentage(campaign.raised, campaign.goal)} className="h-1.5" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{getProgressPercentage(campaign.raised, campaign.goal).toFixed(0)}% of {formatCurrency(campaign.goal, organizationCurrency || 'USD')}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-2 sm:mt-3">
              {onDonate && (
                <Button
                  onClick={() => onDonate(campaign)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 ease-in-out text-sm"
                >
                  <Heart className="mr-1 h-4 w-4" />
                  Donate Now
                </Button>
              )}

              {onViewDetails && (
                <Button
                  variant="outline"
                  onClick={() => onViewDetails(campaign, true)}
                  className="h-10 px-3"
                  size="sm"
                >
                  <Info className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 bg-white border border-gray-100 overflow-hidden hover:-translate-y-1 ${isDefault ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''} flex flex-col h-full`}>
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

      <CardHeader className="p-4 sm:p-6 pb-3">
        <CardTitle className="line-clamp-1 text-base sm:text-lg">{campaign.title}</CardTitle>
        <p className="line-clamp-2 text-sm sm:text-base text-muted-foreground">
          {campaign.description}
        </p>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Raised</span>
            <span className="text-green-600">{formatCurrency(campaign.raised, organizationCurrency || 'USD')}</span>
          </div>
          <Progress value={getProgressPercentage(campaign.raised, campaign.goal)} className="h-2" />
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">
              {campaign.goal ? getProgressPercentage(campaign.raised, campaign.goal).toFixed(1) + "% of goal" : 'N/A'}
            </span>
            <span className="text-muted-foreground">Goal: { campaign.goal ? formatCurrency(campaign.goal, organizationCurrency || 'USD') : 'N/A'}</span>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3 mt-auto">
          {onDonate && (
            <Button
              onClick={() => onDonate(campaign)}
              className="flex-1 h-12 sm:h-14 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200 ease-in-out text-base"
              size="lg"
            >
              <Heart className="mr-2 h-5 w-5" />
              <span className="text-base sm:text-lg">Donate Now</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}

          {onViewDetails && (
            <Button
              variant="outline"
              onClick={() => onViewDetails(campaign, true)}
              className="h-12 sm:h-14 px-4"
              size="lg"
            >
              <Info className="h-5 w-5" />
              <span className="sr-only">View details</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
