"use client";
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutPage from './Others/CheckoutPage';
import convertToSubcurrency from './lib/convertToSubcurrency';
import PaymentHeader from './Others/PaymentHeader';
import NavBar from '../Components/NavBar';
import Image from 'next/image';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const Payment = () => {
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
        <div className="flex flex-col md:flex-row mt-7">
          <div className="w-full md:w-1/2 flex justify-center">
            <Image
              src="/head_image.png"
              width={800}
              height={800}
              alt="donate"
              className="w-full max-w-[400px] md:max-w-none"
            />
          </div>
          <div className="w-full md:w-1/2 mt-5 md:mt-0 px-4 md:px-0">
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
        </div>
      </div>
    </>
  );
};

export default Payment;