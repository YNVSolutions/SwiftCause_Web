import React, { useState, useEffect } from 'react';
import { StripeProvider } from '../../../components/providers/StripeProvider';
import { StripePaymentScreen } from '../../../components/StripePaymentScreen';
import { Campaign, Donation, PaymentResult } from '../../../App';
import { useStripePayment } from '../hooks/useStripePayment';
import { ApiClient } from '../../../utils/supabase/client';

interface StripePaymentContainerProps {
  campaign: Campaign;
  donation: Donation;
  onPaymentComplete: (result: PaymentResult) => void;
  onBack: () => void;
}

export function StripePaymentContainer({ 
  campaign, 
  donation, 
  onPaymentComplete, 
  onBack 
}: StripePaymentContainerProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Create payment intent on the server
        const response = await ApiClient.createPaymentIntent({
          amount: donation.amount,
          currency: 'usd',
          campaignId: campaign.id,
          donationData: donation,
        });

        if (response.success && response.clientSecret) {
          setClientSecret(response.clientSecret);
        } else {
          throw new Error(response.error || 'Failed to create payment intent');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize payment');
        console.error('Error creating payment intent:', err);
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [campaign.id, donation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to initialize payment. Please try again.</p>
          <button
            onClick={onBack}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <StripeProvider clientSecret={clientSecret}>
      <StripePaymentScreen
        campaign={campaign}
        donation={donation}
        onPaymentComplete={onPaymentComplete}
        onBack={onBack}
      />
    </StripeProvider>
  );
}
