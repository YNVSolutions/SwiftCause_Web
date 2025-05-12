"use client";

import { use, useState, useEffect } from "react";
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

  return (
    <form className=" p-2 rounded-md shadow-md px-40 py-20">
      {clientSecret && <PaymentElement />}

      <button 
        type="submit" 
        className="mt-4 w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
      >
        Donate
      </button>
    </form>
  )
};
export default CheckoutPage;