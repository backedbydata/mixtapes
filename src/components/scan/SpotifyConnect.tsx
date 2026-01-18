import { Music, Play } from 'lucide-react';
import { Button, Card } from '../ui';
import { initiateSpotifyAuth, getStoredTokens, enableDemoMode, isDemoMode } from '../../services/spotify';

interface SpotifyConnectProps {
  onConnected: () => void;
}

export function SpotifyConnect({ onConnected }: SpotifyConnectProps) {
  const tokens = getStoredTokens();

  if (tokens) {
    onConnected();
    return null;
  }

  const handleDemoMode = () => {
    enableDemoMode();
    onConnected();
  };

  return (
    <Card className="text-center">
      <div className="py-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#1DB954]/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-10 h-10 fill-[#1DB954]">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </div>

        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
          Connect to Spotify
        </h3>
        <p className="text-neutral-600 mb-8 max-w-sm mx-auto">
          Sign in with Spotify to search for songs and create your playlist directly in your account.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            onClick={initiateSpotifyAuth}
            className="bg-[#1DB954] hover:bg-[#1ed760] focus:ring-[#1DB954]"
            icon={<Music className="w-5 h-5" />}
          >
            Connect Spotify
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={handleDemoMode}
            icon={<Play className="w-5 h-5" />}
          >
            Try Demo Mode
          </Button>
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-md mx-auto">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Spotify API is currently limited. Use Demo Mode to explore all features with 20 sample songs from the 80s!
          </p>
        </div>

        <p className="text-xs text-neutral-400 mt-6 max-w-xs mx-auto">
          We only request permission to create playlists. We never access your listening history or personal data.
        </p>
      </div>
    </Card>
  );
}
