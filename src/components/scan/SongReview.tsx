import { useState } from 'react';
import { Check, X, Search, Music, AlertCircle, ChevronDown, Play, Pause, Pencil } from 'lucide-react';
import { Button, Card, Input, Modal } from '../ui';
import { MatchedSong } from '../../services/songMatcher';
import { SpotifyTrack, searchTracks } from '../../services/spotify';

interface SongReviewProps {
  songs: MatchedSong[];
  onUpdateSong: (index: number, song: MatchedSong) => void;
  accessToken: string;
}

export function SongReview({ songs, onUpdateSong, accessToken }: SongReviewProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchingSongIndex, setSearchingSongIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [audioRef] = useState<HTMLAudioElement | null>(() =>
    typeof window !== 'undefined' ? new Audio() : null
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await searchTracks(searchQuery, accessToken, 10);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
    setSearching(false);
  };

  const handleSelectTrack = (track: SpotifyTrack) => {
    if (searchingSongIndex === null) return;

    const song = songs[searchingSongIndex];
    onUpdateSong(searchingSongIndex, {
      ...song,
      spotifyTrack: track,
      alternativeMatches: [],
      matchScore: 1.0,
      matchStatus: 'manual',
    });

    setSearchModalOpen(false);
    setSearchingSongIndex(null);
    setSearchQuery('');
    setSearchResults([]);
    stopPreview();
  };

  const handleSelectAlternative = (songIndex: number, track: SpotifyTrack) => {
    const song = songs[songIndex];
    onUpdateSong(songIndex, {
      ...song,
      spotifyTrack: track,
      alternativeMatches: song.spotifyTrack
        ? [song.spotifyTrack, ...song.alternativeMatches.filter((t) => t.id !== track.id)]
        : song.alternativeMatches.filter((t) => t.id !== track.id),
      matchScore: 1.0,
      matchStatus: 'manual',
    });
    setExpandedIndex(null);
  };

  const openSearchModal = (index: number) => {
    const song = songs[index];
    setSearchingSongIndex(index);
    setSearchQuery(`${song.title} ${song.artist}`.trim());
    setSearchModalOpen(true);
    setSearchResults([]);
  };

  const startEditing = (index: number) => {
    const song = songs[index];
    setEditingIndex(index);
    setEditTitle(song.title);
    setEditArtist(song.artist);
  };

  const saveEdit = async () => {
    if (editingIndex === null) return;

    const song = songs[editingIndex];
    const updatedSong: MatchedSong = {
      ...song,
      title: editTitle.trim() || song.title,
      artist: editArtist.trim(),
      spotifyTrack: null,
      alternativeMatches: [],
      matchScore: 0,
      matchStatus: 'not_found',
    };

    onUpdateSong(editingIndex, updatedSong);

    if (editTitle.trim() || editArtist.trim()) {
      const query = `${editTitle.trim()} ${editArtist.trim()}`.trim();
      try {
        const results = await searchTracks(query, accessToken, 5);
        if (results.length > 0) {
          onUpdateSong(editingIndex, {
            ...updatedSong,
            spotifyTrack: results[0],
            alternativeMatches: results.slice(1, 4),
            matchScore: 0.9,
            matchStatus: 'matched',
          });
        }
      } catch (error) {
        console.error('Search failed:', error);
      }
    }

    setEditingIndex(null);
    setEditTitle('');
    setEditArtist('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditTitle('');
    setEditArtist('');
  };

  const playPreview = (previewUrl: string) => {
    if (!audioRef) return;

    if (playingPreview === previewUrl) {
      audioRef.pause();
      setPlayingPreview(null);
    } else {
      audioRef.src = previewUrl;
      audioRef.play();
      setPlayingPreview(previewUrl);
    }
  };

  const stopPreview = () => {
    if (audioRef) {
      audioRef.pause();
      setPlayingPreview(null);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: MatchedSong['matchStatus']) => {
    switch (status) {
      case 'matched':
        return 'text-primary-600';
      case 'manual':
        return 'text-primary-600';
      case 'low_confidence':
        return 'text-secondary-600';
      case 'not_found':
        return 'text-accent-600';
    }
  };

  const getStatusIcon = (status: MatchedSong['matchStatus']) => {
    switch (status) {
      case 'matched':
      case 'manual':
        return <Check className="w-4 h-4" />;
      case 'low_confidence':
        return <AlertCircle className="w-4 h-4" />;
      case 'not_found':
        return <X className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-3">
      {songs.map((song, index) => (
        <Card key={index} padding="none" className="overflow-hidden">
          <div className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-medium text-neutral-600">
                {index + 1}
              </div>

              {editingIndex === index ? (
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Pencil className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Song title"
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editArtist}
                        onChange={(e) => setEditArtist(e.target.value)}
                        placeholder="Artist name"
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 ml-15">
                    <Button size="sm" onClick={saveEdit}>
                      Save & Match
                    </Button>
                    <Button size="sm" variant="secondary" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : song.spotifyTrack ? (
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <img
                      src={song.spotifyTrack.album.images[2]?.url || song.spotifyTrack.album.images[0]?.url}
                      alt={song.spotifyTrack.album.name}
                      className="w-12 h-12 rounded-lg shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 truncate">
                        {song.spotifyTrack.name}
                      </p>
                      <p className="text-sm text-neutral-600 truncate">
                        {song.spotifyTrack.artists.map((a) => a.name).join(', ')}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {song.spotifyTrack.album.name} ({song.spotifyTrack.album.release_date.split('-')[0]})
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {song.spotifyTrack.preview_url && (
                        <button
                          onClick={() => playPreview(song.spotifyTrack!.preview_url!)}
                          className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
                          title={playingPreview === song.spotifyTrack.preview_url ? 'Pause' : 'Preview'}
                        >
                          {playingPreview === song.spotifyTrack.preview_url ? (
                            <Pause className="w-4 h-4 text-primary-600" />
                          ) : (
                            <Play className="w-4 h-4 text-neutral-600" />
                          )}
                        </button>
                      )}
                      <span className={`flex items-center gap-1 text-sm ${getStatusColor(song.matchStatus)}`}>
                        {getStatusIcon(song.matchStatus)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Music className="w-6 h-6 text-neutral-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 truncate">{song.title || song.extractedText}</p>
                      {song.artist && <p className="text-sm text-neutral-600">{song.artist}</p>}
                      <p className="text-xs text-accent-600 mt-0.5">No match found</p>
                    </div>
                  </div>
                </div>
              )}

              {editingIndex !== index && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEditing(index)}
                    className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                    title="Edit song info"
                  >
                    <Pencil className="w-4 h-4 text-neutral-500" />
                  </button>
                  {song.alternativeMatches.length > 0 && (
                    <button
                      onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                      className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                      title="Show alternatives"
                    >
                      <ChevronDown
                        className={`w-4 h-4 text-neutral-500 transition-transform ${
                          expandedIndex === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  )}
                  <button
                    onClick={() => openSearchModal(index)}
                    className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                    title="Search manually"
                  >
                    <Search className="w-4 h-4 text-neutral-500" />
                  </button>
                </div>
              )}
            </div>

            {editingIndex !== index && (
              <div className="mt-2 ml-12 text-xs text-neutral-400 truncate">
                Original: "{song.extractedText}"
              </div>
            )}
          </div>

          {expandedIndex === index && song.alternativeMatches.length > 0 && (
            <div className="px-4 pb-4 pt-2 bg-neutral-50 border-t border-neutral-100">
              <p className="text-xs font-medium text-neutral-500 mb-2">Alternative matches:</p>
              <div className="space-y-2">
                {song.alternativeMatches.map((alt) => (
                  <button
                    key={alt.id}
                    onClick={() => handleSelectAlternative(index, alt)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors text-left"
                  >
                    <img
                      src={alt.album.images[2]?.url || alt.album.images[0]?.url}
                      alt={alt.album.name}
                      className="w-10 h-10 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{alt.name}</p>
                      <p className="text-xs text-neutral-500 truncate">
                        {alt.artists.map((a) => a.name).join(', ')} - {alt.album.release_date.split('-')[0]}
                      </p>
                    </div>
                    <span className="text-xs text-neutral-400">{formatDuration(alt.duration_ms)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}

      <Modal
        isOpen={searchModalOpen}
        onClose={() => {
          setSearchModalOpen(false);
          setSearchingSongIndex(null);
          stopPreview();
        }}
        title="Search for song"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by song title and artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} loading={searching}>
              Search
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {searchResults.map((track) => (
                <button
                  key={track.id}
                  onClick={() => handleSelectTrack(track)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors text-left border border-neutral-200"
                >
                  <img
                    src={track.album.images[2]?.url || track.album.images[0]?.url}
                    alt={track.album.name}
                    className="w-12 h-12 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{track.name}</p>
                    <p className="text-sm text-neutral-600 truncate">
                      {track.artists.map((a) => a.name).join(', ')}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {track.album.name} ({track.album.release_date.split('-')[0]})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {track.preview_url && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playPreview(track.preview_url!);
                        }}
                        className="p-2 rounded-full hover:bg-neutral-100"
                      >
                        {playingPreview === track.preview_url ? (
                          <Pause className="w-4 h-4 text-primary-600" />
                        ) : (
                          <Play className="w-4 h-4 text-neutral-600" />
                        )}
                      </button>
                    )}
                    <span className="text-xs text-neutral-400">{formatDuration(track.duration_ms)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !searching && (
            <p className="text-center text-neutral-500 py-8">
              No results found. Try a different search term.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
