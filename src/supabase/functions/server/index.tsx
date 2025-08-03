import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Enable CORS for all routes
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Enable logging
app.use('*', logger(console.log));

// Initialize Supabase client with service role key for server operations
let supabase: any = null;

try {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('⚠️ Supabase environment variables not set. Some features may not work.');
    console.log('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  } else {
    supabase = createClient(supabaseUrl, serviceRoleKey);
    console.log('✅ Supabase client initialized successfully');
  }
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error);
}

// Health check endpoint
app.get('/make-server-d9a2164e/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    supabaseConnected: !!supabase
  });
});

// Authentication endpoints
app.post('/make-server-d9a2164e/auth/signup', async (c) => {
  try {
    if (!supabase) {
      return c.json({ error: 'Authentication service not available' }, 503);
    }

    const { email, password, name, role = 'kiosk' } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        role
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error for ${email}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
      isActive: true
    });

    return c.json({ 
      user: data.user,
      message: 'User created successfully' 
    });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Kiosk authentication
app.post('/make-server-d9a2164e/auth/kiosk', async (c) => {
  try {
    const { kioskId, accessCode } = await c.req.json();
    
    // Get kiosk from KV store
    const kiosk = await kv.get(`kiosk:${kioskId}`);
    
    if (!kiosk || kiosk.accessCode !== accessCode) {
      return c.json({ error: 'Invalid kiosk credentials' }, 401);
    }

    // Update last active timestamp
    await kv.set(`kiosk:${kioskId}`, {
      ...kiosk,
      lastActive: new Date().toISOString(),
      status: 'online'
    });

    return c.json({ 
      success: true,
      kiosk: {
        id: kiosk.id,
        name: kiosk.name,
        location: kiosk.location,
        assignedCampaigns: kiosk.assignedCampaigns || [],
        settings: kiosk.settings || {}
      }
    });
  } catch (error) {
    console.log(`Kiosk authentication error: ${error}`);
    return c.json({ error: 'Internal server error during kiosk auth' }, 500);
  }
});

// Campaign management
app.get('/make-server-d9a2164e/campaigns', async (c) => {
  try {
    const campaigns = await kv.getByPrefix('campaign:');
    return c.json({ campaigns });
  } catch (error) {
    console.log(`Error fetching campaigns: ${error}`);
    return c.json({ error: 'Failed to fetch campaigns' }, 500);
  }
});

app.post('/make-server-d9a2164e/campaigns', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    if (supabase) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json({ error: 'Invalid authorization' }, 401);
      }
    }

    const campaignData = await c.req.json();
    const campaignId = `campaign-${Date.now()}`;
    
    const campaign = {
      id: campaignId,
      ...campaignData,
      createdAt: new Date().toISOString(),
      status: 'active',
      raised: 0
    };

    await kv.set(`campaign:${campaignId}`, campaign);
    
    return c.json({ 
      success: true, 
      campaign 
    });
  } catch (error) {
    console.log(`Error creating campaign: ${error}`);
    return c.json({ error: 'Failed to create campaign' }, 500);
  }
});

// Kiosk management
app.get('/make-server-d9a2164e/kiosks', async (c) => {
  try {
    const kiosks = await kv.getByPrefix('kiosk:');
    return c.json({ kiosks });
  } catch (error) {
    console.log(`Error fetching kiosks: ${error}`);
    return c.json({ error: 'Failed to fetch kiosks' }, 500);
  }
});

app.post('/make-server-d9a2164e/kiosks', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    if (supabase) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json({ error: 'Invalid authorization' }, 401);
      }
    }

    const kioskData = await c.req.json();
    const kioskId = `KIOSK-${kioskData.name.replace(/\s+/g, '').toUpperCase().slice(0, 6)}-${String(Date.now()).slice(-3)}`;
    
    const kiosk = {
      id: kioskId,
      ...kioskData,
      createdAt: new Date().toISOString(),
      status: 'offline',
      totalDonations: 0,
      totalRaised: 0,
      assignedCampaigns: [],
      settings: {
        displayMode: 'grid',
        showAllCampaigns: false,
        maxCampaignsDisplay: 6,
        autoRotateCampaigns: false
      }
    };

    await kv.set(`kiosk:${kioskId}`, kiosk);
    
    return c.json({ 
      success: true, 
      kiosk 
    });
  } catch (error) {
    console.log(`Error creating kiosk: ${error}`);
    return c.json({ error: 'Failed to create kiosk' }, 500);
  }
});

// Donation processing
app.post('/make-server-d9a2164e/donations', async (c) => {
  try {
    const donationData = await c.req.json();
    const donationId = `donation-${Date.now()}`;
    
    const donation = {
      id: donationId,
      ...donationData,
      timestamp: new Date().toISOString(),
      status: 'completed', // In real app, this would be 'pending' until payment confirms
      transactionId: `TXN-${Date.now()}`,
      processingFee: donationData.amount * 0.03, // 3% processing fee
      netAmount: donationData.amount * 0.97
    };

    await kv.set(`donation:${donationId}`, donation);
    
    // Update campaign raised amount
    const campaign = await kv.get(`campaign:${donationData.campaignId}`);
    if (campaign) {
      campaign.raised += donationData.amount;
      await kv.set(`campaign:${donationData.campaignId}`, campaign);
    }

    // Update kiosk stats if kioskId provided
    if (donationData.kioskId) {
      const kiosk = await kv.get(`kiosk:${donationData.kioskId}`);
      if (kiosk) {
        kiosk.totalDonations = (kiosk.totalDonations || 0) + 1;
        kiosk.totalRaised = (kiosk.totalRaised || 0) + donationData.amount;
        await kv.set(`kiosk:${donationData.kioskId}`, kiosk);
      }
    }
    
    return c.json({ 
      success: true, 
      donation,
      transactionId: donation.transactionId
    });
  } catch (error) {
    console.log(`Error processing donation: ${error}`);
    return c.json({ error: 'Failed to process donation' }, 500);
  }
});

// Get donations with filtering
app.get('/make-server-d9a2164e/donations', async (c) => {
  try {
    const donations = await kv.getByPrefix('donation:');
    const campaignId = c.req.query('campaignId');
    const kioskId = c.req.query('kioskId');
    
    let filteredDonations = donations;
    
    if (campaignId) {
      filteredDonations = filteredDonations.filter(d => d.campaignId === campaignId);
    }
    
    if (kioskId) {
      filteredDonations = filteredDonations.filter(d => d.kioskId === kioskId);
    }
    
    return c.json({ donations: filteredDonations });
  } catch (error) {
    console.log(`Error fetching donations: ${error}`);
    return c.json({ error: 'Failed to fetch donations' }, 500);
  }
});

// User management
app.get('/make-server-d9a2164e/users', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    if (supabase) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return c.json({ error: 'Invalid authorization' }, 401);
      }
    }

    const users = await kv.getByPrefix('user:');
    return c.json({ users });
  } catch (error) {
    console.log(`Error fetching users: ${error}`);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// Analytics endpoints
app.get('/make-server-d9a2164e/analytics/dashboard', async (c) => {
  try {
    const campaigns = await kv.getByPrefix('campaign:');
    const donations = await kv.getByPrefix('donation:');
    const kiosks = await kv.getByPrefix('kiosk:');
    
    const totalRaised = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalDonations = donations.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const onlineKiosks = kiosks.filter(k => k.status === 'online').length;
    
    return c.json({
      totalRaised,
      totalDonations,
      activeCampaigns,
      totalCampaigns: campaigns.length,
      onlineKiosks,
      totalKiosks: kiosks.length,
      avgDonation: totalDonations > 0 ? totalRaised / totalDonations : 0
    });
  } catch (error) {
    console.log(`Error fetching analytics: ${error}`);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// Initialize default data on startup
async function initializeDefaultData() {
  try {
    // Check if we already have campaigns
    const existingCampaigns = await kv.getByPrefix('campaign:');
    if (existingCampaigns.length === 0) {
      console.log('Initializing default campaigns...');
      
      const defaultCampaigns = [
        {
          id: 'campaign-1',
          title: 'Clean Water for All',
          description: 'Help provide clean drinking water to communities in need across developing nations.',
          goal: 50000,
          raised: 32500,
          image: 'https://images.unsplash.com/photo-1541199249251-f713e6145474?w=400&h=300&fit=crop',
          category: 'Global Health',
          status: 'active',
          createdAt: '2024-01-15T00:00:00Z',
          endDate: '2024-06-15T00:00:00Z',
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
            primaryCTAText: 'Help Provide Clean Water',
            theme: 'default',
            requiredFields: ['email'],
            optionalFields: ['name', 'message'],
            enableAnonymousDonations: true,
            enableSocialSharing: true
          }
        },
        {
          id: 'campaign-2',
          title: 'Education for Every Child',
          description: 'Support education initiatives that give children access to quality learning materials and teachers.',
          goal: 75000,
          raised: 45300,
          image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop',
          category: 'Education',
          status: 'active',
          createdAt: '2024-01-10T00:00:00Z',
          endDate: '2024-08-10T00:00:00Z',
          configuration: {
            predefinedAmounts: [50, 100, 200, 500, 1000],
            allowCustomAmount: true,
            minCustomAmount: 10,
            maxCustomAmount: 5000,
            suggestedAmounts: [100, 200, 500],
            enableRecurring: true,
            recurringIntervals: ['monthly', 'yearly'],
            defaultRecurringInterval: 'monthly',
            displayStyle: 'grid',
            showProgressBar: true,
            showDonorCount: true,
            primaryCTAText: 'Fund Education',
            theme: 'vibrant',
            requiredFields: ['email', 'name'],
            optionalFields: ['phone'],
            enableAnonymousDonations: false,
            enableSocialSharing: true
          }
        }
      ];

      for (const campaign of defaultCampaigns) {
        await kv.set(`campaign:${campaign.id}`, campaign);
      }
    }

    // Initialize default kiosks
    const existingKiosks = await kv.getByPrefix('kiosk:');
    if (existingKiosks.length === 0) {
      console.log('Initializing default kiosks...');
      
      const defaultKiosks = [
        {
          id: 'KIOSK-NYC-001',
          name: 'Times Square Terminal',
          location: 'Times Square, New York, NY',
          status: 'online',
          accessCode: 'TS2024',
          lastActive: new Date().toISOString(),
          totalDonations: 0,
          totalRaised: 0,
          assignedCampaigns: ['campaign-1', 'campaign-2'],
          defaultCampaign: 'campaign-1',
          settings: {
            displayMode: 'grid',
            showAllCampaigns: false,
            maxCampaignsDisplay: 6,
            autoRotateCampaigns: false
          }
        },
        {
          id: 'KIOSK-SF-002',
          name: 'Golden Gate Hub',
          location: 'Union Square, San Francisco, CA',
          status: 'online',
          accessCode: 'SF2024',
          lastActive: new Date().toISOString(),
          totalDonations: 0,
          totalRaised: 0,
          assignedCampaigns: ['campaign-1', 'campaign-2'],
          defaultCampaign: 'campaign-2',
          settings: {
            displayMode: 'carousel',
            showAllCampaigns: true,
            maxCampaignsDisplay: 4,
            autoRotateCampaigns: true
          }
        }
      ];

      for (const kiosk of defaultKiosks) {
        await kv.set(`kiosk:${kiosk.id}`, kiosk);
      }
    }

    console.log('✅ Default data initialization complete');
  } catch (error) {
    console.log(`❌ Error initializing default data: ${error}`);
  }
}

// Initialize default data
await initializeDefaultData();

// Start the server
console.log('🚀 Starting Donation Kiosk Server...');
Deno.serve(app.fetch);