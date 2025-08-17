import { useCallback, useMemo, useState } from 'react';
import { ApiClient } from '../../../utils/supabase/client';
import { Campaign, Donation, PaymentResult } from '../../../App';

export interface UsePaymentReturn {
  isProcessing: boolean;
  paymentMethod: 'card' | 'paypal' | 'bank';
  setPaymentMethod: (method: 'card' | 'paypal' | 'bank') => void;
  cardData: { number: string; expiry: string; cvv: string; name: string };
  setCardData: (updater: (prev: { number: string; expiry: string; cvv: string; name: string }) => { number: string; expiry: string; cvv: string; name: string }) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  formatCardNumber: (value: string) => string;
  formatExpiry: (value: string) => string;
}

export function usePayment(
  campaign: Campaign,
  donation: Donation,
  onPaymentComplete: (result: PaymentResult) => void
): UsePaymentReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'bank'>('card');
  const [cardData, setCardDataState] = useState({ number: '', expiry: '', cvv: '', name: '' });

  const setCardData = useCallback((updater: (prev: { number: string; expiry: string; cvv: string; name: string }) => { number: string; expiry: string; cvv: string; name: string }) => {
    setCardDataState(prev => updater(prev));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const success = Math.random() > 0.05;

      if (success) {
        const result = await ApiClient.createDonation({
          ...donation,
          donorName: cardData.name,
          paymentMethod: paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'paypal' ? 'PayPal' : 'Bank Transfer'
        });

        if (result.success) {
          onPaymentComplete({ success: true, transactionId: result.transactionId });
        } else {
          throw new Error('Failed to process donation');
        }
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error: any) {
      onPaymentComplete({ success: false, error: error?.message || 'Payment processing failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  }, [donation, cardData.name, paymentMethod, onPaymentComplete]);

  const formatCardNumber = useCallback((value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts: string[] = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    }
    return v;
  }, []);

  const formatExpiry = useCallback((value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  }, []);

  return {
    isProcessing,
    paymentMethod,
    setPaymentMethod,
    cardData: cardDataState,
    setCardData,
    handleSubmit,
    formatCardNumber,
    formatExpiry
  };
}


