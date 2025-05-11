"use client";
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutPage from '../Components/CheckoutPage'; 
import convertToSubcurrency from '../lib/convertToSubcurrency';
import PaymentHeader from './Others/PaymentHeader';
import NavBar from '../Components/NavBar';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const Page = () => {
  const amount = 1000;
  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50 bg-black">
        <NavBar />
      </div>
      <div className="pt-24">
        <div>
          <PaymentHeader />
        </div>
        <Elements 
          stripe={stripePromise}
          options={{
            mode: 'payment',
            amount: convertToSubcurrency(amount),
            currency: 'usd',
          }}
        >
          <CheckoutPage amount={amount} />
        </Elements>
      </div>
    </>
  );
};

export default Page;