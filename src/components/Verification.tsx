import { useEffect, useMemo, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { useStripe } from "@stripe/react-stripe-js";
import { CheckCircle, ShieldAlert, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

type AmlStatus = "verified" | "failed" | "pending" | "not_started";

export function Verification() {
  const stripe = useStripe();
  const [status, setStatus] = useState<AmlStatus>("not_started");
  const [failureReason, setFailureReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const currentUser = useMemo(() => auth.currentUser, [auth.currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const ref = doc(db, "users", currentUser.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as any;
      const amlStatus = (data?.amlStatus as AmlStatus) || "not_started";
      setStatus(amlStatus);
      setFailureReason(data?.amlFailureReason || null);
    });
    return () => unsub();
  }, [currentUser]);

  
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-verification-dialog" as any, handler as any);
    return () => {
      window.removeEventListener("open-verification-dialog" as any, handler as any);
    };
  }, []);

  const handleStartVerification = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!currentUser) {
        throw new Error("You must be signed in to verify identity.");
      }
      if (!stripe) {
        throw new Error("Stripe not initialized.");
      }

      const idToken = await currentUser.getIdToken();
      const base = import.meta.env.VITE_CLOUD_FUNCTIONS_BASE;
      if (!base) {
        throw new Error("Missing VITE_CLOUD_FUNCTIONS_BASE configuration.");
      }
      const resp = await fetch(`${base}/startAmlVerification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({}),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.error || resp.statusText);
      }
      const data = await resp.json();
      const clientSecret = data?.client_secret || data?.clientSecret;
      if (!clientSecret) {
        throw new Error("No client secret returned from server.");
      }
      const result = await stripe.verifyIdentity(clientSecret);
      if (result.error) {
        throw new Error(result.error.message || "Failed to start verification");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to start verification.");
    } finally {
      setLoading(false);
    }
  };

  const isVerified = status === "verified";
  const isPending = status === "pending";
  const isFailed = status === "failed";
  const isNotVerified = status === "not_started" || isFailed;

  const statusLabel = isVerified
    ? "Verified"
    : isPending
    ? "Pending verification"
    : "Not verified";

  if (isVerified) return null;

  return (
    <div className="flex items-center">
      {isNotVerified && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
          aria-label="Open identity verification"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Not verified
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify your identity</DialogTitle>
            <DialogDescription>
              Complete a quick verification to keep your account secure and compliant.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-1">
              <li>Have a valid government-issued ID ready.</li>
              <li>Use a well-lit environment for clearer photos.</li>
              <li>Your information is securely processed by our partner.</li>
            </ul>

            <div className="flex items-center gap-2">
              {isPending && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Pending verification
                </span>
              )}
              {isFailed && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Verification failed
                </span>
              )}
            </div>

            {status === "failed" && failureReason && (
              <Alert>
                <AlertDescription>
                  Reason: {failureReason}
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={handleStartVerification}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? "Starting..." : "Start verification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


