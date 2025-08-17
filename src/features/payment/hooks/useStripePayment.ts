import { useCallback, useState } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { PaymentElement } from '@stripe/react-stripe-js';
import { Campaign, Donation, PaymentResult } from '../../../App';
import { ApiClient } from '../../../utils/supabase/client';

export interface UseStripePaymentReturn {
  isProcessing: boolean;
  error: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  PaymentElement: typeof PaymentElement;
}

export function useStripePayment(
  campaign: Campaign,
  donation: Donation,
  onPaymentComplete: (result: PaymentResult) => void
): UseStripePaymentReturn {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Confirm the payment with Stripe
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        // Handle payment error
        setError(result.error.message || 'Payment failed. Please try again.');
        onPaymentComplete({ 
          success: false, 
          error: result.error.message || 'Payment failed. Please try again.' 
        });
      } else if (result.paymentIntent) {
        // Payment succeeded
        const paymentIntent = result.paymentIntent;
        
        // Create donation record in our system
        const donationResult = await ApiClient.createDonation({
          ...donation,
          transactionId: paymentIntent.id,
          paymentMethod: 'stripe',
          status: paymentIntent.status,
        });

        if (donationResult.success) {
          onPaymentComplete({ 
            success: true, 
            transactionId: paymentIntent.id 
          });
        } else {
          throw new Error('Failed to record donation');
        }
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Payment processing failed. Please try again.';
      setError(errorMessage);
      onPaymentComplete({ success: false, error: errorMessage });
    } finally {
      setIsProcessing(false);
    }
  }, [stripe, elements, donation, onPaymentComplete]);

  return {
    isProcessing,
    error,
    handleSubmit,
    PaymentElement,
  };
}
