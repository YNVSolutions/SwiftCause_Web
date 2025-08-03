import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Heart, Calendar, Target, Users, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Campaign } from '../App';

interface CampaignDetailsScreenProps {
  campaign: Campaign;
  onDonate: () => void;
  onBack: () => void;
}

export function CampaignDetailsScreen({ campaign, onDonate, onBack }: CampaignDetailsScreenProps) {
  const [showDetails, setShowDetails] = useState(false);

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

  const estimatedDonors = Math.floor(campaign.raised / 25); // Estimate based on average donation

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Minimized Campaign Preview */}
        <Card className="mb-6">
          <div className="flex">
            <div className="w-32 h-32 sm:w-40 sm:h-40 relative overflow-hidden flex-shrink-0 rounded-l-lg">
              <ImageWithFallback 
                src={campaign.image}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-2 left-2 bg-white/90 text-gray-800 text-xs">
                {campaign.category}
              </Badge>
            </div>
            
            <div className="flex-1 p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl font-semibold mb-2">{campaign.title}</h1>
                  <p className="text-gray-600 line-clamp-2 mb-3">{campaign.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="ml-2 flex-shrink-0"
                >
                  {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{formatCurrency(campaign.raised)} of {formatCurrency(campaign.goal)}</span>
                </div>
                <Progress value={getProgressPercentage(campaign.raised, campaign.goal)} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{getProgressPercentage(campaign.raised, campaign.goal).toFixed(1)}% funded</span>
                  <span>{estimatedDonors.toLocaleString()} donors</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Expandable Details */}
        {showDetails && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>About This Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose text-muted-foreground text-sm">
                  <p>
                    This campaign represents a critical need in our global community. Your support will directly 
                    impact the lives of those who need it most, providing essential resources and creating 
                    lasting positive change.
                  </p>
                  <p>
                    Every donation, regardless of size, contributes to meaningful progress. Together, we can 
                    achieve our goal and make a real difference in the world.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How Your Donation Helps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="font-medium">$25</span>
                    <span className="text-muted-foreground">Basic support package</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium">$50</span>
                    <span className="text-muted-foreground">Extended assistance</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium">$100</span>
                    <span className="text-muted-foreground">Comprehensive care</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium">$250</span>
                    <span className="text-muted-foreground">Community impact</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-indigo-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Campaign Started</p>
                        <p className="text-sm">January 15, 2024</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-4 w-4 text-indigo-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-sm">Global Impact</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Donation CTA */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Ready to make a difference?</h2>
                <p className="text-gray-600">
                  Choose your donation amount and help us reach our goal of {formatCurrency(campaign.goal)}
                </p>
              </div>
              
              <Button onClick={onDonate} size="lg" className="w-full max-w-md mx-auto h-14 text-lg">
                <Heart className="mr-2 h-5 w-5" />
                Select Donation Amount
              </Button>
              
              <p className="text-sm text-gray-500">
                Safe and secure payment processing
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}