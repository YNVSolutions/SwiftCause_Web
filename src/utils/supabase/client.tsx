import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey, supabaseUrl, isSupabaseConfigured } from './info';

// Create a single supabase client for interacting with your database
// Only create if we have valid configuration
export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl, publicAnonKey)
  : null;

// Re-export the configuration check function
export { isSupabaseConfigured };

// API utility functions for making requests to our backend server
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://' + projectId + '.supabase.co/functions/v1/make-server-d9a2164e'
  : 'http://localhost:3001';

export class ApiClient {
  private static async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using mock data');
      throw new Error('Supabase not configured. Please set up your project credentials.');
    }

    const url = API_BASE_URL + endpoint;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + publicAnonKey,
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'HTTP ' + response.status + ': ' + response.statusText);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed for ' + endpoint + ':', error);
      throw error;
    }
  }

  // Authentication
  static async authenticateKiosk(kioskId: string, accessCode: string) {
    if (!isSupabaseConfigured()) {
      // Return mock success for demo
      return {
        success: true,
        kiosk: {
          id: kioskId,
          name: 'Demo Kiosk (' + kioskId + ')',
          location: 'Demo Location',
          assignedCampaigns: ['demo-1', 'demo-2'],
          settings: {
            displayMode: 'grid' as const,
            showAllCampaigns: false,
            maxCampaignsDisplay: 6,
            autoRotateCampaigns: false
          }
        }
      };
    }

    return this.request<{ success: boolean; kiosk: any }>('/auth/kiosk', {
      method: 'POST',
      body: JSON.stringify({ kioskId, accessCode }),
    });
  }

  static async signup(email: string, password: string, name: string, role = 'kiosk') {
    return this.request<{ user: any; message: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  }

  // Campaigns
  static async getCampaigns() {
    if (!isSupabaseConfigured()) {
      // Return mock campaigns for demo
      return {
        campaigns: [
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
          },
          {
            id: 'demo-2',
            title: 'Education for Every Child (Demo)',
            description: 'Support education initiatives for children.',
            goal: 75000,
            raised: 45300,
            image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop',
            category: 'Education',
            status: 'active',
            createdAt: '2024-01-10T00:00:00Z',
            endDate: '2024-08-10T00:00:00Z',
            isGlobal: true,
            assignedKiosks: [],
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
              showRecentDonations: false,
              maxRecentDonations: 3,
              primaryCTAText: 'Fund Education',
              secondaryCTAText: 'See Impact',
              theme: 'vibrant',
              requiredFields: ['email', 'name'],
              optionalFields: ['phone'],
              enableAnonymousDonations: false,
              enableSocialSharing: true,
              enableDonorWall: true,
              enableComments: false
            }
          },
          {
            id: 'demo-3',
            title: 'Emergency Disaster Relief (Demo)',
            description: 'Provide immediate assistance to families affected by natural disasters.',
            goal: 100000,
            raised: 78900,
            image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=300&fit=crop',
            category: 'Emergency Relief',
            status: 'active',
            createdAt: '2024-02-01T00:00:00Z',
            endDate: '2024-09-01T00:00:00Z',
            isGlobal: false,
            assignedKiosks: ['KIOSK-NYC-001', 'KIOSK-LA-003'],
            configuration: {
              predefinedAmounts: [10, 25, 50, 100, 250, 500],
              allowCustomAmount: true,
              minCustomAmount: 5,
              maxCustomAmount: 25000,
              suggestedAmounts: [25, 50, 100],
              enableRecurring: false,
              recurringIntervals: ['monthly'],
              defaultRecurringInterval: 'monthly',
              displayStyle: 'list',
              showProgressBar: true,
              showDonorCount: true,
              showRecentDonations: true,
              maxRecentDonations: 10,
              primaryCTAText: 'Help Now',
              secondaryCTAText: 'Share',
              urgencyMessage: 'URGENT: Families need immediate help!',
              theme: 'minimal',
              requiredFields: ['email'],
              optionalFields: ['name', 'phone', 'message'],
              enableAnonymousDonations: true,
              enableSocialSharing: true,
              enableDonorWall: false,
              enableComments: true
            }
          }
        ]
      };
    }

    return this.request<{ campaigns: any[] }>('/campaigns');
  }

  static async createCampaign(campaignData: any, accessToken: string) {
    return this.request<{ success: boolean; campaign: any }>('/campaigns', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      },
      body: JSON.stringify(campaignData),
    });
  }

  // Kiosks
  static async getKiosks() {
    if (!isSupabaseConfigured()) {
      // Return mock kiosks for demo
      return {
        kiosks: [
          {
            id: 'KIOSK-NYC-001',
            name: 'Times Square Terminal (Demo)',
            location: 'Times Square, New York, NY',
            status: 'online',
            accessCode: 'TS2024',
            totalDonations: 245,
            totalRaised: 12750,
            assignedCampaigns: ['demo-1', 'demo-3'],
            settings: {
              displayMode: 'grid',
              showAllCampaigns: false,
              maxCampaignsDisplay: 6,
              autoRotateCampaigns: false
            }
          },
          {
            id: 'KIOSK-SF-002',
            name: 'Golden Gate Hub (Demo)',
            location: 'Union Square, San Francisco, CA',
            status: 'online',
            accessCode: 'SF2024',
            totalDonations: 189,
            totalRaised: 9450,
            assignedCampaigns: ['demo-1'],
            settings: {
              displayMode: 'carousel',
              showAllCampaigns: true,
              maxCampaignsDisplay: 4,
              autoRotateCampaigns: true
            }
          }
        ]
      };
    }

    return this.request<{ kiosks: any[] }>('/kiosks');
  }

  static async createKiosk(kioskData: any, accessToken: string) {
    return this.request<{ success: boolean; kiosk: any }>('/kiosks', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      },
      body: JSON.stringify(kioskData),
    });
  }

  // Donations
  static async createDonation(donationData: any) {
    if (!isSupabaseConfigured()) {
      // Return mock success for demo
      return {
        success: true,
        donation: { ...donationData, id: 'demo-' + Date.now() },
        transactionId: 'DEMO-TXN-' + Date.now()
      };
    }

    return this.request<{ success: boolean; donation: any; transactionId: string }>('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  // Stripe Payment Intents
  static async createPaymentIntent(paymentData: {
    amount: number;
    currency: string;
    campaignId: string;
    donationData: any;
  }) {
    if (!isSupabaseConfigured()) {
      // Return mock payment intent for demo
      return {
        success: true,
        clientSecret: 'pi_mock_secret_' + Date.now() + '_secret_' + Math.random().toString(36).substr(2, 9),
        paymentIntentId: 'pi_mock_' + Date.now()
      };
    }

    return this.request<{ 
      success: boolean; 
      clientSecret: string; 
      paymentIntentId: string;
      error?: string;
    }>('/stripe/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  static async getDonations(filters: { campaignId?: string; kioskId?: string } = {}) {
    if (!isSupabaseConfigured()) {
      // Return mock donations for demo
      return {
        donations: [
          {
            id: 'demo-donation-1',
            campaignId: 'demo-1',
            amount: 100,
            donorName: 'John D.',
            donorEmail: 'john@example.com',
            timestamp: new Date().toISOString(),
            status: 'completed',
            isAnonymous: false
          },
          {
            id: 'demo-donation-2',
            campaignId: 'demo-2',
            amount: 250,
            donorName: 'Anonymous',
            donorEmail: 'anonymous@example.com',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'completed',
            isAnonymous: true
          }
        ]
      };
    }

    const params = new URLSearchParams();
    if (filters.campaignId) params.append('campaignId', filters.campaignId);
    if (filters.kioskId) params.append('kioskId', filters.kioskId);
    
    const queryString = params.toString();
    const endpoint = queryString ? '/donations?' + queryString : '/donations';
    
    return this.request<{ donations: any[] }>(endpoint);
  }

  // Users
  static async getUsers(accessToken: string) {
    return this.request<{ users: any[] }>('/users', {
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      },
    });
  }

  // Analytics
  static async getDashboardAnalytics() {
    if (!isSupabaseConfigured()) {
      // Return mock analytics for demo
      return {
        totalRaised: 125000,
        totalDonations: 450,
        activeCampaigns: 8,
        totalCampaigns: 12,
        onlineKiosks: 15,
        totalKiosks: 18,
        avgDonation: 278
      };
    }

    return this.request<{
      totalRaised: number;
      totalDonations: number;
      activeCampaigns: number;
      totalCampaigns: number;
      onlineKiosks: number;
      totalKiosks: number;
      avgDonation: number;
    }>('/analytics/dashboard');
  }

  // Health check
  static async healthCheck() {
    if (!isSupabaseConfigured()) {
      return {
        status: 'demo-mode',
        timestamp: new Date().toISOString(),
        version: '1.0.0-demo'
      };
    }

    return this.request<{ status: string; timestamp: string; version: string }>('/health');
  }
}

// Authentication helpers
export class AuthService {
  static async signInWithPassword(email: string, password: string) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Authentication error during sign in:', error);
      throw error;
    }
    
    return data;
  }

  static async signOut() {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  }

  static async getSession() {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      throw error;
    }
    return data;
  }

  static async getUser() {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      throw error;
    }
    return data;
  }

  // Social login support (requires additional Supabase configuration)
  static async signInWithGoogle() {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    // Do not forget to complete setup at https://supabase.com/docs/guides/auth/social-login/auth-google
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    
    if (error) {
      console.error('Google authentication error:', error);
      throw error;
    }
    
    return data;
  }
}