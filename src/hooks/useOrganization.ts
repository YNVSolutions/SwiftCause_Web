import { useState, useEffect } from "react";
import { doc, onSnapshot, DocumentData } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface StripeAccountInfo {
  accountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

export interface Organization {
  id: string;
  name: string;
  stripe?: StripeAccountInfo;
  // Add other organization fields as necessary
}

export const useOrganization = (organizationId: string | null) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setOrganization(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const orgRef = doc(db, "organizations", organizationId);

    const unsubscribe = onSnapshot(
      orgRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setOrganization({ id: docSnap.id, ...docSnap.data() } as Organization);
        } else {
          setOrganization(null);
          setError("Organization not found.");
        }
        setLoading(false);
      },
      (e) => {
        setError("Failed to load organization data.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organizationId]);

  return { organization, loading, error };
};
