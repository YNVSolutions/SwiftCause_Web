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
        <div className="flex mt-7">
        <div className='w-1/2'>
          <Image src="/head_image.png" width={800} height={800} alt='donate'/>
        </div>
        <div  className='w-1/2'>
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