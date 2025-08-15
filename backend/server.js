const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Create Payment Intent endpoint
app.post('/stripe/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, campaignId, donationData } = req.body;

    // Validate required fields
    if (!amount || !currency || !campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, currency, campaignId'
      });
    }

    // Convert amount to cents (Stripe expects amounts in smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        campaignId: campaignId,
        donorEmail: donationData.donorEmail || '',
        donorName: donationData.donorName || '',
        isRecurring: donationData.isRecurring ? 'true' : 'false',
        recurringInterval: donationData.recurringInterval || '',
        kioskId: donationData.kioskId || '',
      },
      description: `Donation to campaign: ${campaignId}`,
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create payment intent'
    });
  }
});

// Webhook endpoint for Stripe events
app.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Here you would typically:
      // 1. Update your database with the successful payment
      // 2. Send confirmation emails
      // 3. Update campaign totals
      // 4. Log the transaction
      
      break;
    }
      
    case 'payment_intent.payment_failed': {
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      
      // Handle failed payment
      break;
    }
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Create donation record endpoint
app.post('/donations', async (req, res) => {
  try {
    const donationData = req.body;
    
    // Validate donation data
    if (!donationData.campaignId || !donationData.amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required donation fields'
      });
    }

    // Here you would typically:
    // 1. Save the donation to your database
    // 2. Update campaign totals
    // 3. Send confirmation emails
    // 4. Log the transaction

    // For now, we'll just return a success response
    const donationId = 'donation_' + Date.now();
    
    res.json({
      success: true,
      donation: {
        id: donationId,
        ...donationData,
        timestamp: new Date().toISOString(),
        status: 'completed'
      },
      transactionId: donationData.transactionId || 'txn_' + Date.now()
    });

  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create donation'
    });
  }
});

// Get campaigns endpoint
app.get('/campaigns', async (req, res) => {
  try {
    // Mock campaigns data - replace with database query
    const campaigns = [
      {
        id: 'demo-1',
        title: 'Clean Water for All (Demo)',
        description: 'Help provide clean drinking water to communities in need.',
        goal: 50000,
        raised: 32500,
        image: 'https://images.unsplash.com/photo-1541199249251-f713e6145474?w=400&h=300&fit=crop',
        category: 'Global Health',
        status: 'active',
        createdAt: '2024-01-15T00:00:00Z',
        endDate: '2024-06-15T00:00:00Z',
        isGlobal: false,
        assignedKiosks: ['KIOSK-NYC-001', 'KIOSK-SF-002'],
        configuration: {
          predefinedAmounts: [25, 50, 100, 250, 500],
          allowCustomAmount: true,
          minCustomAmount: 1,
          maxCustomAmount: 10000,
          suggestedAmounts: [50, 100, 250],
          enableRecurring: true,
          recurringIntervals: ['monthly', 'quarterly'],
          defaultRecurringInterval: 'monthly',
          displayStyle: 'grid',
          showProgressBar: true,
          showDonorCount: true,
          showRecentDonations: true,
          maxRecentDonations: 5,
          primaryCTAText: 'Help Provide Clean Water',
          secondaryCTAText: 'Learn More',
          theme: 'default',
          requiredFields: ['email'],
          optionalFields: ['name'],
          enableAnonymousDonations: true,
          enableSocialSharing: true,
          enableDonorWall: true,
          enableComments: true
        }
      }
    ];

    res.json({ campaigns });

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch campaigns'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
