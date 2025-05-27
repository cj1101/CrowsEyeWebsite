import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface CheckoutOptions {
  tier: string;
  hasByok?: boolean;
}

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createCheckoutSession = async ({ tier, hasByok = false }: CheckoutOptions) => {
    if (!user) {
      setError('Please sign in to subscribe');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Creating checkout session for:', { tier, hasByok, userId: user.uid, userEmail: user.email });

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          hasByok,
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      console.log('Checkout response status:', response.status);
      console.log('Checkout response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response received:', textResponse);
        throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 200)}...`);
      }

      const data = await response.json();
      console.log('Checkout response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to create checkout session`);
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      
      let errorMessage = 'An error occurred while creating the checkout session';
      
      if (err instanceof Error) {
        if (err.message.includes('Unexpected token')) {
          errorMessage = 'Server configuration error. Please check your environment variables and try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckoutSession,
    loading,
    error,
    clearError: () => setError(null),
  };
}; 