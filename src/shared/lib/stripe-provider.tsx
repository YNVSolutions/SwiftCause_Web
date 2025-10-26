'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { ENV } from '../config/env'

const stripePromise = loadStripe(ENV.STRIPE_PUBLISHABLE_KEY!)

interface StripeContextType {
  stripe: Promise<Stripe | null>
}

const StripeContext = createContext<StripeContextType | undefined>(undefined)

export const useStripe = () => {
  const context = useContext(StripeContext)
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider')
  }
  return context
}

interface StripeProviderProps {
  children: ReactNode
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const value: StripeContextType = {
    stripe: stripePromise,
  }

  return (
    <StripeContext.Provider value={value}>
      <Elements stripe={stripePromise}>
        {children}
      </Elements>
    </StripeContext.Provider>
  )
}
