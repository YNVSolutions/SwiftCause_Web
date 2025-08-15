
## Setup Instructions

### 1. Install Dependencies

The Stripe packages are already installed in the project:

```bash
npm install --save @stripe/react-stripe-js @stripe/stripe-js
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
  

4. Start the backend server:
   ```bash
   npm run dev
   ```


## Testing

### Test Cards

Use these test card numbers for testing:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Expired Card**: `4000 0000 0000 0069`

