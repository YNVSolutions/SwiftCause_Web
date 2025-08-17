import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

interface PaymentFormProps {
  onPaymentSuccess: (paymentIntentId: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      return;
    }

    try {
      const response = await fetch('https://createkioskpaymentintent-j2f5w4qwxq-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: 1000 }), // Example amount in cents
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from backend:', errorData);
        setError(typeof errorData === 'string' ? errorData : errorData.error?.message || errorData.message || JSON.stringify(errorData) || 'Failed to create Payment Intent');
        setLoading(false);
        return;
      }

      const { clientSecret } = await response.json();
      console.log('Received clientSecret:', clientSecret);

      if (!clientSecret) {
        setError('Client secret not received from backend.');
        setLoading(false);
        return;
      }

      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        setError(error.message || 'An unknown error occurred');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
      } else {
        setError('Payment not successful.');
      }
    } catch (err: any) {
      console.error('Fetch or Stripe error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

export default PaymentForm;
