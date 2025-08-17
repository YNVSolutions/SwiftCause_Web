import { useCallback, useMemo, useState } from 'react';
import { ApiClient } from '../../../utils/supabase/client';
import { Campaign, Donation, PaymentResult } from '../../../App';

export interface UsePaymentReturn {
  isProcessing: boolean;
  paymentMethod: 'card' | 'paypal' | 'bank';
  setPaymentMethod: (method: 'card' | 'paypal' | 'bank') => void;
}

export function usePayment(
  campaign: Campaign,
  donation: Donation,
  onPaymentComplete: (result: PaymentResult) => void
): UsePaymentReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'bank'>('card');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const success = Math.random() > 0.05;

      if (success) {
        const result = await ApiClient.createDonation({
          ...donation,
          // donorName: cardData.name, // This is no longer collected here
          paymentMethod: paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'paypal' ? 'PayPal' : 'Bank Transfer'
        });

        if (result.success) {
          onPaymentComplete({ success: true, transactionId: result.transactionId });
        } else {
          throw new Error('Failed to process donation');
        }
      } else {
        onPaymentComplete({ success: false, error: 'Payment processing failed. Please try again.' });
      }
    } catch (error: any) {
      onPaymentComplete({ success: false, error: error?.message || 'Payment processing failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  }, [donation, paymentMethod, onPaymentComplete]);


  return {
    isProcessing,
    paymentMethod,
    setPaymentMethod,
  };
}


