import React, { useState } from 'react';
import { createThankYouMail } from '../../shared/api';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Label } from '../../shared/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/card';
import { Mail, Send, Home, CheckCircle } from 'lucide-react';

interface EmailConfirmationScreenProps {
  transactionId?: string;
  onComplete: () => void;
}

export function EmailConfirmationScreen({ transactionId, onComplete }: EmailConfirmationScreenProps) {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      await createThankYouMail(email);
      alert('Thank you! Your receipt has been sent.');
      setEmailSent(true);
    } catch (err) {
      console.error('Error sending receipt email:', err);
      alert('There was an issue sending your receipt. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Email Sent!</CardTitle>
            <CardDescription>
              Your donation receipt has been sent to {email}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Please check your email inbox for the receipt.</p>
              <p>If you don't see it, please check your spam folder.</p>
            </div>
            
            <Button onClick={onComplete} className="w-full" size="lg">
              <Home className="mr-2 h-4 w-4" />
              Complete Transaction
            </Button>
            
            <div className="text-xs text-muted-foreground">
              <p>Thank you for your donation!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Send Receipt</CardTitle>
          <CardDescription>
            Would you like to receive a donation receipt by email?
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {transactionId && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Transaction Reference</p>
                <p className="font-mono text-sm">{transactionId}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                disabled={isSending}
              />
              <p className="text-xs text-muted-foreground">
                We'll only use this email to send your receipt
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                type="submit" 
                disabled={isSending || !email}
                className="w-full" 
                size="lg"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Receipt
                  </>
                )}
              </Button>
              
              <Button 
                type="button"
                variant="outline" 
                onClick={handleSkip} 
                disabled={isSending}
                className="w-full" 
                size="lg"
              >
                Skip Email Receipt
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Your donation has been successfully processed.</p>
              <p>Email receipt is optional and can be skipped.</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}