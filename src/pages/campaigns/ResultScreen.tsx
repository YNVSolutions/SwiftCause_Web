import React from 'react';
import { Button } from '../../shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/card';
import { CheckCircle, XCircle, Mail, Home, RefreshCw } from 'lucide-react';
import { PaymentResult } from '../../app/App';

interface ResultScreenProps {
  result: PaymentResult;
  onEmailConfirmation?: () => void;
  onReturnToStart: () => void;
}

export function ResultScreen({ result, onEmailConfirmation, onReturnToStart }: ResultScreenProps) {
  if (result.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Donation Successful!</CardTitle>
            <CardDescription>
              Thank you for your generous contribution. Your donation has been processed successfully.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {result.transactionId && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                <p className="font-mono text-sm">{result.transactionId}</p>
              </div>
            )}
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Your donation is making a real difference in the world.</p>
              <p>
                A receipt has been generated and you can optionally send it to your email address.
              </p>
            </div>
            
            <div className="space-y-3">
              {onEmailConfirmation && (
                <Button onClick={onEmailConfirmation} className="w-full" size="lg">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Receipt to Email
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={onReturnToStart} 
                className="w-full" 
                size="lg"
              >
                <Home className="mr-2 h-4 w-4" />
                Return to Campaigns
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>Thank you for using our donation kiosk.</p>
              <p>Your support helps create positive change in our communities.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-800">Payment Failed</CardTitle>
          <CardDescription>
            We encountered an issue processing your donation. Please try again.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {result.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{result.error}</p>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Common reasons for payment failure:</p>
            <ul className="text-left list-disc list-inside space-y-1">
              <li>Insufficient funds</li>
              <li>Incorrect card information</li>
              <li>Card expired or blocked</li>
              <li>Network connectivity issues</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <Button onClick={onReturnToStart} className="w-full" size="lg">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onReturnToStart} 
              className="w-full" 
              size="lg"
            >
              <Home className="mr-2 h-4 w-4" />
              Return to Campaigns
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>If you continue to experience issues, please contact support.</p>
            <p>Support: 1-800-DONATE-1</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}