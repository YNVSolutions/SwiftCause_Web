"use client";

import { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import convertToSubcurrency from "../lib/convertToSubcurrency";

const CheckoutPage = ({ amount }: { amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error("Error fetching client secret:", error);
        setErrorMessage("Failed to fetch client secret");
      });
  }, [amount]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    if (!stripe || !elements) {
      setLoading(false);
      return;
    }
    const { error: submitError } = await elements.submit();

    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `http://localhost:3000/PaymentSucess?amount=${amount}`,
      },
    });
    if (confirmError) {
      setErrorMessage(confirmError.message);
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  if (!stripe || !elements) {
    return (
      <div className="flex justify-center items-center ">

        <div className="flex-col gap-4 w-full flex items-center justify-center">
          <div
            className="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full"
          >
            <div
              className="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full"
            ></div>
          </div>
        </div>

      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-2 rounded-md shadow-md">
      {clientSecret && <PaymentElement />}
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">
          {errorMessage}
        </div>
      )}
      <button
        disabled={!stripe || loading}
        type="submit"
        className="mt-4 w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
        aria-busy={loading}
      >
        {loading ? "Processing..." : `Donate $${amount}`}
      </button>
    </form>
  );
};

export default CheckoutPage;