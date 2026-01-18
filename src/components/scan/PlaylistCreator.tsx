import { useState } from 'react';
import { Music, ExternalLink, Check, Loader2, ListMusic, Sparkles } from 'lucide-react';
import { Button, Card, Input } from '../ui';
import { MatchedSong } from '../../services/songMatcher';
import {
  createPlaylist,
  addTracksToPlaylist,
  getCurrentUser,
  SpotifyPlaylist,
  isDemoMode,
} from '../../services/spotify';

interface PlaylistCreatorProps {
  songs: MatchedSong[];
  accessToken: string;
  onPlaylistCreated: (playlist: SpotifyPlaylist, playlistUrl: string) => void;
}

export function PlaylistCreator({ songs, accessToken, onPlaylistCreated }: PlaylistCreatorProps) {
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [createdPlaylist, setCreatedPlaylist] = useState<SpotifyPlaylist | null>(null);

  const matchedSongs = songs.filter((s) => s.spotifyTrack);
  const unmatchedCount = songs.length - matchedSongs.length;

  const handleCreate = async () => {
    if (!playlistName.trim()) {
      setError('Please enter a playlist name');
      return;
    }

    if (matchedSongs.length === 0) {
      setError('No songs matched. Please review and match songs before creating a playlist.');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const user = await getCurrentUser(accessToken);

      const description = playlistDescription.trim()
        ? `${playlistDescription.trim()} | Created with Mixtape Memory`
        : 'Created with Mixtape Memory - digitizing handwritten song lists';

      const playlist = await createPlaylist(
        user.id,
        playlistName,
        description,
        accessToken,
        isPublic
      );

      const trackUris = matchedSongs
        .map((s) => s.spotifyTrack!.uri)
        .filter(Boolean);

      await addTracksToPlaylist(playlist.id, trackUris, accessToken);

      setCreatedPlaylist(playlist);
      onPlaylistCreated(playlist, playlist.external_urls.spotify);
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError('Failed to create playlist. Please try again.');
    }

    setCreating(false);
  };

  const inDemoMode = isDemoMode();

  if (createdPlaylist) {
    return (
      <Card className="text-center">
        <div className="py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
            <Check className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            {inDemoMode ? 'Demo Playlist Created!' : 'Playlist Created!'}
          </h3>
          <p className="text-neutral-600 mb-6">
            Your mixtape "{createdPlaylist.name}" has been created with {matchedSongs.length} songs.
          </p>
          {inDemoMode ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-sm mx-auto">
              <p className="text-sm text-amber-800">
                <Sparkles className="w-4 h-4 inline mr-1" />
                This is a demo playlist. Connect your Spotify account to create real playlists!
              </p>
            </div>
          ) : (
            <Button
              onClick={() => window.open(createdPlaylist.external_urls.spotify, '_blank')}
              icon={<ExternalLink className="w-4 h-4" />}
            >
              Open in Spotify
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <ListMusic className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Create Your Playlist</h3>
            <p className="text-sm text-neutral-600">
              {matchedSongs.length} of {songs.length} songs matched
              {unmatchedCount > 0 && ` (${unmatchedCount} unmatched)`}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-accent-50 border border-accent-200 text-accent-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Playlist Name"
            placeholder="Summer '87 - For Sarah"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Description (optional)
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
              rows={3}
              placeholder="The story behind this mixtape..."
              value={playlistDescription}
              onChange={(e) => setPlaylistDescription(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-10 h-6 rounded-full transition-colors ${
                  isPublic ? 'bg-primary-600' : 'bg-neutral-200'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-sm absolute top-1 transition-transform ${
                    isPublic ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </div>
            </div>
            <span className="text-sm text-neutral-700">Make playlist public</span>
          </label>
        </div>

        {inDemoMode && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
            <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              Demo mode: Playlist won't be saved to Spotify, but you can experience the full workflow!
            </span>
          </div>
        )}

        <div className="pt-4 border-t border-neutral-100">
          <Button
            onClick={handleCreate}
            disabled={creating || matchedSongs.length === 0}
            loading={creating}
            className="w-full"
            icon={creating ? undefined : <Music className="w-4 h-4" />}
          >
            {creating ? 'Creating Playlist...' : (inDemoMode ? 'Create Demo Playlist' : 'Create Playlist on Spotify')}
          </Button>
        </div>

        {matchedSongs.length > 0 && (
          <div className="pt-4 border-t border-neutral-100">
            <p className="text-xs text-neutral-500 mb-2">Songs to be added:</p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {matchedSongs.map((song, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-neutral-400 w-5">{index + 1}.</span>
                  <span className="text-neutral-700 truncate">
                    {song.spotifyTrack!.name} - {song.spotifyTrack!.artists[0].name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
