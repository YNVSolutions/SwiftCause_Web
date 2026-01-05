import { useState, useCallback } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { getAuth } from 'firebase/auth';
import { PaymentResult } from '../../../shared/types';

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

  const handlePaymentSubmit = useCallback(
    async (amount: number, metadata: any, currency: string) => {
      console.log('usePayment - handlePaymentSubmit: received metadata', metadata);
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

      const isRecurring = metadata?.isRecurring;
      const recurringInterval = metadata?.recurringInterval;

      try {
        // Recurring flow
        if (isRecurring && recurringInterval) {
          const auth = getAuth();
          const token = await auth.currentUser?.getIdToken();
          if (!token) {
            setError('Please sign in to start a subscription.');
            setIsProcessing(false);
            return;
          }

          const baseSetupUrl =
            process.env.NEXT_PUBLIC_CREATE_SETUP_INTENT_URL ||
            'https://us-central1-swiftcause-app.cloudfunctions.net/createSetupIntent';
          const baseSubscriptionUrl =
            process.env.NEXT_PUBLIC_CREATE_SUBSCRIPTION_URL ||
            'https://us-central1-swiftcause-app.cloudfunctions.net/createSubscription';

          // 1) Create SetupIntent
          const setupRes = await fetch(baseSetupUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              campaignId: metadata.campaignId,
              interval: recurringInterval,
            }),
          });

          if (!setupRes.ok) {
            const errorData = await setupRes.json();
            const message =
              typeof errorData === 'string'
                ? errorData
                : errorData.error || errorData.message || 'Failed to create setup intent';
            throw new Error(message);
          }

          const setupData = await setupRes.json();
          const setupClientSecret = setupData?.clientSecret;
          if (!setupClientSecret) {
            throw new Error('SetupIntent client secret missing from response.');
          }

          // 2) Confirm card setup
          const { setupIntent, error: setupError } = await stripe.confirmCardSetup(setupClientSecret, {
            payment_method: {
              card: cardElement,
            },
          });
          if (setupError) {
            throw new Error(setupError.message || 'Failed to confirm card setup.');
          }
          const paymentMethodId = setupIntent?.payment_method;
          if (!paymentMethodId) {
            throw new Error('Payment method missing after setup.');
          }

          // 3) Create Subscription
          const subscriptionRes = await fetch(baseSubscriptionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              campaignId: metadata.campaignId,
              interval: recurringInterval,
              amount: Math.round(amount * 100),
              currency: (currency || 'EUR').toLowerCase(),
              paymentMethodId,
              isGiftAid: !!metadata?.isGiftAid,
              platform: metadata?.platform || 'web',
            }),
          });

          if (!subscriptionRes.ok) {
            const errorData = await subscriptionRes.json();
            const message =
              typeof errorData === 'string'
                ? errorData
                : errorData.error || errorData.message || 'Failed to create subscription';
            throw new Error(message);
          }

          const subscriptionData = await subscriptionRes.json();
          const clientSecret = subscriptionData.paymentIntentClientSecret;
          const subscriptionId = subscriptionData.subscriptionId;
          const status = subscriptionData.status;

          // 4) Handle 3DS if required
          if (clientSecret) {
            const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret);
            if (confirmError) {
              throw new Error(confirmError.message || '3DS confirmation failed');
            }
            if (!paymentIntent || paymentIntent.status !== 'succeeded') {
              throw new Error('Payment authorization incomplete.');
            }
          }

          onPaymentComplete({
            success: true,
            transactionId: subscriptionId || undefined,
          });
          setIsProcessing(false);
          return;
        }

        // One-time flow (existing)
        const response = await fetch('https://createkioskpaymentintent-j2f5w4qwxq-uc.a.run.app', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: Math.round(amount * 100), metadata: metadata, currency: currency }),
        });

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
    },
    [stripe, elements, onPaymentComplete]
  );

  return {
    isProcessing,
    error,
    handlePaymentSubmit,
  };
}
