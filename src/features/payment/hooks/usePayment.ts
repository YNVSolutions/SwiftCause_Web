import { useState, useCallback } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { PaymentResult } from '../../../App'; // Adjust path if needed
import { Campaign, Donation } from '../../../App';

interface UsePaymentReturn {
  isProcessing: boolean;
  error: string | null;
  handlePaymentSubmit: (amount: number, metadata: any, currency: string) => Promise<void>;
}

export function usePayment(onPaymentComplete: (result: PaymentResult) => void): UsePaymentReturn {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePaymentSubmit = useCallback(async (amount: number, metadata: any, currency: string) => {
    setIsProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe.js has not loaded.');
      setIsProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card details not found.');
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch('https://createkioskpaymentintent-j2f5w4qwxq-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amount, metadata: metadata, currency: currency }), // Use amount, metadata and currency from props
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = typeof errorData === 'string' ? errorData : errorData.error?.message || errorData.message || JSON.stringify(errorData) || 'Failed to create Payment Intent';
        setError(errorMessage);
        setIsProcessing(false);
        return;
      }

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        setError('Client secret not received from backend.');
        setIsProcessing(false);
        return;
      }

      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'An unknown error occurred during payment confirmation.');
        onPaymentComplete({ success: false, error: stripeError.message || 'Payment failed.' });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentComplete({ success: true, transactionId: paymentIntent.id });
      } else {
        setError('Payment not successful.');
        onPaymentComplete({ success: false, error: 'Payment not successful.' });
      }
    } catch (err: any) {
      console.error('Fetch or Stripe error:', err);
      setError(err.message || 'An unexpected error occurred.');
      onPaymentComplete({ success: false, error: err.message || 'An unexpected error occurred.' });
    } finally {
      setIsProcessing(false);
    }
  }, [stripe, elements, onPaymentComplete]);

  return {
    isProcessing,
    error,
    handlePaymentSubmit,
  };
}
