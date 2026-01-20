# Stripe Card Information Collection - Complete Flow

## Where Card Info is Collected

### Main File: `src/widgets/payment-flow/PaymentForm.tsx`

**Line 28-42:** The Stripe `CardElement` component collects card information

```typescript
<CardElement options={{
  style: {
    base: {
      fontSize: '16px',
      color: '#333',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
}} />
```

**What it collects:**
- Card number
- Expiration date (MM/YY)
- CVC/CVV code
- ZIP/Postal code (optional)

**Security:** The card data never touches your server - it goes directly to Stripe's secure servers.

---

## Complete Payment Flow

### 1. **User Interface** 
**File:** `src/views/campaigns/PaymentScreen.tsx`
- Displays donation summary
- Shows Gift Aid details (if applicable)
- Renders the PaymentForm component
- **Line 177:** `<PaymentForm />` component is rendered

### 2. **Card Collection Component**
**File:** `src/widgets/payment-flow/PaymentForm.tsx`
- **Line 2:** Imports `CardElement` from `@stripe/react-stripe-js`
- **Line 28:** Renders `<CardElement>` to collect card details
- **Line 44:** Submit button triggers payment
- **Line 18:** `handleSubmit` function prevents default and calls `onSubmit` prop

### 3. **Payment Processing Hook**
**File:** `src/features/payment/hooks/usePayment.ts`
- **Line 28:** Gets the `CardElement` instance: `elements.getElement(CardElement)`
- **Line 36-44:** Creates Payment Intent by calling backend
- **Line 62-66:** Confirms card payment with Stripe:
  ```typescript
  const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,  // Card data from CardElement
    },
  });
  ```

### 4. **Alternative Payment Hook** (for campaign donations)
**File:** `src/features/donate-to-campaign/hooks/usePayment.ts`
- Similar implementation to the main payment hook
- **Line 27:** Gets CardElement
- **Line 61-64:** Confirms payment with card data

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PaymentScreen.tsx                                        │
│    - User sees donation summary                             │
│    - Renders PaymentForm component                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PaymentForm.tsx (Line 28)                                │
│    ┌──────────────────────────────────────────────┐         │
│    │  <CardElement />                             │         │
│    │  - Collects card number                      │         │
│    │  - Collects expiry date                      │         │
│    │  - Collects CVC                              │         │
│    │  - Collects ZIP (optional)                   │         │
│    └──────────────────────────────────────────────┘         │
│    User clicks "Pay Now" button (Line 44)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. usePayment.ts Hook                                       │
│    - Gets CardElement instance (Line 28)                    │
│    - Creates Payment Intent with backend (Line 36)          │
│    - Confirms payment with Stripe (Line 62)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Stripe API                                               │
│    - Validates card                                         │
│    - Processes payment                                      │
│    - Returns payment result                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Security Features

### 1. **PCI Compliance**
- Card data is collected by Stripe's `CardElement`
- Card information **never** touches your server
- Stripe handles all PCI compliance requirements

### 2. **Tokenization**
- Stripe converts card details into a secure token
- Only the token is sent to your backend
- Original card data stays with Stripe

### 3. **HTTPS Only**
- All communication is encrypted
- Stripe Elements only work on HTTPS domains

---

## File Summary

| File | Purpose | Key Lines |
|------|---------|-----------|
| `src/widgets/payment-flow/PaymentForm.tsx` | **Renders CardElement** | **Line 28-42** |
| `src/views/campaigns/PaymentScreen.tsx` | Displays payment UI | Line 177 |
| `src/features/payment/hooks/usePayment.ts` | Processes payment | Line 28, 62-66 |
| `src/features/donate-to-campaign/hooks/usePayment.ts` | Alternative payment hook | Line 27, 61-64 |

---

## How to Test

1. Navigate to a campaign donation page
2. Enter donation amount
3. Proceed to payment screen
4. The `CardElement` will appear in a white box with green border
5. Enter test card: `4242 4242 4242 4242`
6. Any future expiry date
7. Any 3-digit CVC
8. Click "Pay Now"

---

## Stripe Test Cards

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0002 | Card declined |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |

---

## Backend Integration

The payment flow calls this endpoint:
```
https://createkioskpaymentintent-j2f5w4qwxq-uc.a.run.app
```

**Request:**
```json
{
  "amount": 5000,  // Amount in cents (£50.00)
  "metadata": {
    "campaignId": "...",
    "donorName": "...",
    "isGiftAid": true
  },
  "currency": "GBP"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx"
}
```

The `clientSecret` is then used with `stripe.confirmCardPayment()` to complete the payment.
