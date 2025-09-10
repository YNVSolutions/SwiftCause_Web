import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Screen } from "../App"; // Import Screen type

interface OnboardingRedirectHandlerProps {
  onNavigate: (screen: Screen) => void;
}

export const OnboardingRedirectHandler: React.FC<OnboardingRedirectHandlerProps> = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  console.log("OnboardingRedirectHandler rendered.");
  console.log("Initial location.hash:", location.hash);

  useEffect(() => {
    console.log("OnboardingRedirectHandler useEffect triggered.");
    console.log("Current location.hash in useEffect:", location.hash);

    const params = new URLSearchParams(location.hash.split("?")[1]);
    const currentStatus = params.get("status");

    console.log("Parsed status from URL:", currentStatus);

    if (currentStatus === "success") {
      setStatus("success");
      setMessage(
        "Stripe onboarding complete! Your account is being reviewed. You will be able to accept payments and receive payouts shortly."
      );
    } else if (currentStatus === "refresh") {
      setStatus("refresh");
      setMessage(
        "Stripe onboarding session expired or was cancelled. Please try again."
      );
    } else {
      setStatus("unknown");
      setMessage("Unknown Stripe onboarding status.");
    }
    console.log("Updated status:", status, "message:", message); // Note: status/message might not reflect immediately due to useState async update
  }, [location.hash]);

  console.log("Rendering with status:", status, "message:", message); // Log before return

  const handleGoToDashboard = () => {
    onNavigate("admin-dashboard");
    navigate("/admin"); // Assuming /admin is your admin dashboard route
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          {status === "success" && (
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          )}
          {status === "refresh" && (
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          )}
          {status === "unknown" && (
            <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          )}
          {status === null && (
            <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
          )}
          <CardTitle className="text-2xl font-bold">
            {status === "success" && "Onboarding Successful"}
            {status === "refresh" && "Onboarding Incomplete"}
            {status === "unknown" && "Onboarding Status Unknown"}
            {status === null && "Processing Onboarding Status"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-gray-600 mb-6">
            {message}
          </CardDescription>
          <Button onClick={handleGoToDashboard} className="w-full">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
