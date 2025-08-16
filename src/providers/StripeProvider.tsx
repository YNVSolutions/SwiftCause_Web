import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

interface StripeProviderProps {
  children: React.ReactNode;
  clientSecret?: string;
}


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KE);

export const StripeProvider: React.FC<StripeProviderProps> = ({ 
  children, 
  clientSecret 
}) => {
  const [stripe, setStripe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const stripeInstance = await stripePromise;
        if (!stripeInstance) {
          throw new Error('Failed to load Stripe');
        }
        
        setStripe(stripeInstance);
      } catch (err: any) {
        console.error('Error initializing Stripe:', err);
        setError(err.message || 'Failed to initialize payment system');
      } finally {
        setLoading(false);
      }
    };

    initializeStripe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing payment system...</p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment System Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Please refresh the page or contact support.</p>
        </div>
      </div>
    );
  }

  if (!stripe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to initialize payment system. Please try again.</p>
        </div>
      </div>
    );
  }


  if (clientSecret) {
    return (
      <Elements stripe={stripe} options={{ clientSecret }}>
        {children}
      </Elements>
    );
  }

 
  return <>{children}</>;
};
