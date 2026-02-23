import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../shared/lib/firebase';
import { Subscription } from '../model/types';

/**
 * Get all subscriptions for a campaign
 */
export async function getSubscriptionsByCampaign(campaignId: string): Promise<Subscription[]> {
  try {
    const subscriptionsRef = collection(db, 'subscriptions');
    const q = query(subscriptionsRef, where('campaignId', '==', campaignId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Subscription[];
  } catch (error) {
    console.error('Error fetching subscriptions by campaign:', error);
    throw error;
  }
}

/**
 * Get all subscriptions for an organization
 */
export async function getSubscriptionsByOrganization(organizationId: string): Promise<Subscription[]> {
  try {
    const subscriptionsRef = collection(db, 'subscriptions');
    const q = query(subscriptionsRef, where('organizationId', '==', organizationId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Subscription[];
  } catch (error) {
    console.error('Error fetching subscriptions by organization:', error);
    throw error;
  }
}

/**
 * Get subscription by ID
 */
export async function getSubscriptionById(subscriptionId: string): Promise<Subscription | null> {
  try {
    const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (!subscriptionDoc.exists()) {
      return null;
    }
    
    return {
      id: subscriptionDoc.id,
      ...subscriptionDoc.data(),
    } as Subscription;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
}

/**
 * Get subscriptions by donor email
 */
export async function getSubscriptionsByDonorEmail(email: string): Promise<Subscription[]> {
  try {
    const subscriptionsRef = collection(db, 'subscriptions');
    const q = query(subscriptionsRef, where('metadata.donorEmail', '==', email));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Subscription[];
  } catch (error) {
    console.error('Error fetching subscriptions by donor email:', error);
    throw error;
  }
}

/**
 * Get active subscriptions for a campaign
 */
export async function getActiveSubscriptionsByCampaign(campaignId: string): Promise<Subscription[]> {
  try {
    const subscriptionsRef = collection(db, 'subscriptions');
    const q = query(
      subscriptionsRef,
      where('campaignId', '==', campaignId),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Subscription[];
  } catch (error) {
    console.error('Error fetching active subscriptions:', error);
    throw error;
  }
}

/**
 * Update subscription status locally (actual cancellation should be done via backend)
 */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: Subscription['status']
): Promise<void> {
  try {
    const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
    await updateDoc(subscriptionRef, {
      status,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
}

/**
 * Calculate subscription statistics for a campaign
 */
export async function getSubscriptionStats(campaignId: string) {
  try {
    const subscriptions = await getSubscriptionsByCampaign(campaignId);
    
    const active = subscriptions.filter(s => s.status === 'active');
    const totalMonthlyRevenue = active.reduce((sum, sub) => {
      const monthlyAmount = sub.interval === 'year' ? sub.amount / 12 : sub.amount;
      return sum + monthlyAmount;
    }, 0);
    
    const totalAnnualRevenue = active.reduce((sum, sub) => {
      const annualAmount = sub.interval === 'month' ? sub.amount * 12 : sub.amount;
      return sum + annualAmount;
    }, 0);
    
    return {
      total: subscriptions.length,
      active: active.length,
      canceled: subscriptions.filter(s => s.status === 'canceled').length,
      pastDue: subscriptions.filter(s => s.status === 'past_due').length,
      totalMonthlyRevenue,
      totalAnnualRevenue,
      averageAmount: active.length > 0 ? totalMonthlyRevenue / active.length : 0,
    };
  } catch (error) {
    console.error('Error calculating subscription stats:', error);
    throw error;
  }
}
