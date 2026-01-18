import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { handleSpotifyCallback } from '../services/spotify';
import { Layout } from '../components/layout';
import { Card, Button } from '../components/ui';

export function SpotifyCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setStatus('error');
      setError('Authorization was denied. Please try again.');
      return;
    }

    if (!code) {
      setStatus('error');
      setError('No authorization code received. Please try again.');
      return;
    }

    handleSpotifyCallback(code)
      .then(() => {
        setStatus('success');
        setTimeout(() => {
          navigate('/scan');
        }, 1500);
      })
      .catch((err) => {
        console.error('Spotify callback error:', err);
        setStatus('error');
        setError('Failed to connect to Spotify. Please try again.');
      });
  }, [searchParams, navigate]);

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-16">
        <Card className="text-center py-12">
          {status === 'processing' && (
            <>
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary-600 animate-spin" />
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                Connecting to Spotify...
              </h2>
              <p className="text-neutral-600">Please wait while we complete the connection.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-primary-600" />
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                Connected to Spotify!
              </h2>
              <p className="text-neutral-600">Redirecting you back to continue...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 mx-auto mb-4 text-accent-600" />
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                Connection Failed
              </h2>
              <p className="text-neutral-600 mb-6">{error}</p>
              <Button onClick={() => navigate('/scan')}>
                Back to Scan
              </Button>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
}
