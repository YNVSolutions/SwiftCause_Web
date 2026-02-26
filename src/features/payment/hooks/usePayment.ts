import { useState, useCallback } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { PaymentResult } from '../../../shared/types';

interface UsePaymentReturn {
  isProcessing: boolean;
  error: string | null;
  handlePaymentSubmit: (amount: number, metadata: Record<string, unknown>, currency: string) => Promise<void>;
}

export function usePayment(onPaymentComplete: (result: PaymentResult) => void): UsePaymentReturn {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePaymentSubmit = useCallback(async (amount: number, metadata: Record<string, unknown>, currency: string) => {
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
      // Check if this is a recurring payment
      const isRecurring = metadata.isRecurring === true;
      
      if (isRecurring) {
        // Handle recurring subscription
        await handleRecurringPayment(stripe, cardElement, amount, metadata, currency, onPaymentComplete, setError);
      } else {
        // Handle one-time payment
        await handleOneTimePayment(stripe, cardElement, amount, metadata, currency, onPaymentComplete, setError);
      }
    } catch (err: unknown) {
      console.error('Payment error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
      onPaymentComplete({ success: false, error: errorMessage });
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

/**
 * Handle one-time payment
 */
async function handleOneTimePayment(
  stripe: unknown,
  cardElement: unknown,
  amount: number,
  metadata: Record<string, unknown>,
  currency: string,
  onPaymentComplete: (result: PaymentResult) => void,
  setError: (error: string) => void
) {
  const response = await fetch(
    `https://us-central1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net/createKioskPaymentIntent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, metadata, currency }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage =
      typeof errorData === 'string'
        ? errorData
        : errorData.error?.message ||
          errorData.message ||
          JSON.stringify(errorData) ||
          'Failed to create Payment Intent';
    setError(errorMessage);
    throw new Error(errorMessage);
  }

  const { clientSecret } = await response.json();

  if (!clientSecret) {
    const errorMessage = 'Client secret not received from backend.';
    setError(errorMessage);
    throw new Error(errorMessage);
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
}

/**
 * Handle recurring subscription payment
 */
async function handleRecurringPayment(
  stripe: unknown,
  cardElement: unknown,
  amount: number,
  metadata: Record<string, unknown>,
  currency: string,
  onPaymentComplete: (result: PaymentResult) => void,
  setError: (error: string) => void
) {

  // First, create a payment method
  const stripeInstance = stripe as { createPaymentMethod: (options: { type: string; card: unknown }) => Promise<{ paymentMethod?: { id: string }; error?: { message?: string } }> };
  const { paymentMethod, error: pmError } = await stripeInstance.createPaymentMethod({
    type: 'card',
    card: cardElement,
  });

  if (pmError) {
    setError(pmError.message || 'Failed to create payment method.');
    onPaymentComplete({ success: false, error: pmError.message || 'Failed to create payment method.' });
    return;
  }

  // Map recurring interval from UI format to API format
  const intervalMap: Record<string, string> = {
    monthly: 'month',
    quarterly: 'month', // Quarterly is handled as 3-month interval
    yearly: 'year',
  };

  const recurringInterval = metadata.recurringInterval as string;
  const interval = intervalMap[recurringInterval] || 'month';

  const requestBody = {
    amount,
    interval,
    campaignId: metadata.campaignId,
    donor: {
      email: metadata.donorEmail || 'anonymous@example.com',
      name: metadata.donorName || 'Anonymous',
      phone: metadata.donorPhone,
    },
    paymentMethodId: paymentMethod?.id,
    metadata: {
      ...metadata,
      platform: metadata.platform || 'web',
    },
  };

  console.log('Sending request to createRecurringSubscription:', requestBody);

  // Create subscription via backend
  const response = await fetch(
    `https://us-central1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net/createRecurringSubscription`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  console.log('Response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Backend error response:', errorData);
    const errorMessage =
      typeof errorData === 'string'
        ? errorData
        : errorData.error?.message ||
          errorData.message ||
          'Failed to create subscription';
    setError(errorMessage);
    onPaymentComplete({ success: false, error: errorMessage });
    return;
  }

  const result = await response.json();
  console.log('Subscription creation result:', result);

  if (result.requiresAction && result.clientSecret) {
    console.log('3D Secure authentication required');
    // Handle 3D Secure or other authentication
    const { error: confirmError } = await stripe.confirmCardPayment(result.clientSecret);
    
    if (confirmError) {
      console.error('Payment authentication error:', confirmError);
      setError(confirmError.message || 'Payment authentication failed.');
      onPaymentComplete({ success: false, error: confirmError.message || 'Payment authentication failed.' });
      return;
    }
  }

  if (result.success || result.subscriptionId) {
    console.log('Subscription created successfully:', result.subscriptionId);
    onPaymentComplete({
      success: true,
      transactionId: result.subscriptionId,
      subscriptionId: result.subscriptionId,
      customerId: result.customerId,
    });
  } else {
    console.error('Subscription creation failed:', result);
    setError(result.message || 'Subscription creation failed.');
    onPaymentComplete({
      success: false,
      error: result.message || 'Subscription creation failed.',
    });
  }
}
