import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, db } from '../../lib/firebase';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const formatCurrency = (amountInCents, currency = 'usd') => {
  const amount = typeof amountInCents === 'number' ? amountInCents / 100 : 0;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount);
};

const formatDate = (timestamp) => {
  if (!timestamp) return '—';
  try {
    // Supports both Firestore Timestamp and UNIX seconds
    const date = typeof timestamp?.toDate === 'function' ? timestamp.toDate() : new Date(timestamp * 1000);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
};

const SubscriptionManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setError('You must be logged in to view subscriptions.');
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          setSubscriptions([]);
          setLoading(false);
          return;
        }
        const data = snap.data() || {};
        const subsMap = data.subscriptions || {};
        const normalized = Object.keys(subsMap).map((id) => ({ id, ...subsMap[id] }));
        setSubscriptions(normalized);
      } catch (e) {
        setError(e?.message || 'Failed to load subscriptions.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleCancel = async (subscriptionId) => {
    try {
      setError(null);
      const functions = getFunctions();
      const cancelFn = httpsCallable(functions, 'cancelStripeSubscription');
      await cancelFn({ subscriptionId });
      // Optimistic UI update: mark status as canceled
      setSubscriptions((prev) => prev.map((s) => (s.id === subscriptionId ? { ...s, status: 'canceled' } : s)));
    } catch (e) {
      setError(e?.message || 'Failed to cancel subscription.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Your Subscriptions</h1>

      {loading && (
        <div className="text-gray-600">Loading subscriptions...</div>
      )}

      {error && (
        <div className="mb-4 text-sm text-red-600">{error}</div>
      )}

      {!loading && subscriptions.length === 0 && !error && (
        <div className="text-gray-600">You have no active subscriptions.</div>
      )}

      <div className="space-y-4">
        {subscriptions.map((sub) => {
          const isActive = (sub.status || '').toLowerCase() === 'active';
          const planLabel = sub.planName || sub.priceId || 'Subscription';
          const amountLabel = sub.amount != null ? formatCurrency(sub.amount, sub.currency || 'usd') : null;
          const nextBilling = sub.nextBillingDate || sub.currentPeriodEnd;

          return (
            <Card key={sub.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{planLabel}</span>
                  <div className="flex items-center gap-2">
                    {amountLabel && <span className="text-sm text-gray-700">{amountLabel}</span>}
                    <Badge variant={isActive ? 'default' : 'secondary'}>{(sub.status || 'unknown').toUpperCase()}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    <div>Subscription ID: {sub.id}</div>
                    <div>Next billing: {formatDate(nextBilling)}</div>
                  </div>
                  {isActive && (
                    <Button variant="outline" onClick={() => handleCancel(sub.id)}>
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionManagement;


