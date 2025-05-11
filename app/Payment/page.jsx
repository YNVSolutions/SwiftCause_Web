"use client";
import React from 'react';
//import CheckoutPage from '@/components/CheckoutPage'; 
//import convertToSubcurrency from '@/lib/convertToSubcurrency';
import { loadStripe } from '@stripe/stripe-js';
import PaymentHeader from './Others/PaymentHeader';
import NavBar from '../Components/NavBar';

//if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
//  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
//}

//const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const Page = () => {
  return (
    <>
    <div className="fixed top-0 left-0 w-full z-50 bg-black">
        <NavBar />
      </div>
      <div className="pt-20 flex flex-col md:flex-row h-screen bg-black text-white overflow-hidden">
      </div>
    </>
  );
};

export default Page;