"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import convertToSubcurrency from "../lib/convertToSubcurrency";
 const CheckoutPage = ({amount}:{amount:number}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string>();
    const[clientSecret, setClientSecret] = useState("");
    const [loading, setLoading] = useState(false);
 };
 export default CheckoutPage;