import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, Pencil, Check, Trash2, LogOut } from 'lucide-react';
import { Button, Card } from '../components/ui';
import { Layout } from '../components/layout';
import {
  ImageCapture,
  WizardProgress,
  SongReview,
  PlaylistCreator,
  SpotifyConnect,
} from '../components/scan';
import { useAuth } from '../contexts/AuthContext';
import { performOcr, uploadMixtapeImage } from '../services/ocr';
import { parseOcrLines, parseRawText, ParsedSong } from '../services/textParser';
import { matchAllSongs, MatchedSong } from '../services/songMatcher';
import { getStoredTokens, SpotifyPlaylist, isDemoMode, disableDemoMode } from '../services/spotify';
import { supabase } from '../lib/supabase';

const STEPS = [
  { label: 'Capture', description: 'Take a photo' },
  { label: 'Review', description: 'Check songs' },
  { label: 'Connect', description: 'Spotify' },
  { label: 'Create', description: 'Make playlist' },
];

type WizardStep = 0 | 1 | 2 | 3;

export function ScanWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<WizardStep>(0);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [parsedSongs, setParsedSongs] = useState<ParsedSong[]>([]);
  const [matchedSongs, setMatchedSongs] = useState<MatchedSong[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mixtapeId, setMixtapeId] = useState<string | null>(null);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [editingParsedIndex, setEditingParsedIndex] = useState<number | null>(null);
  const [editParsedTitle, setEditParsedTitle] = useState('');
  const [editParsedArtist, setEditParsedArtist] = useState('');

  useEffect(() => {
    const tokens = getStoredTokens();
    if (tokens) {
      setSpotifyConnected(true);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleImageCaptured = async (dataUrl: string, file: File) => {
    setImageDataUrl(dataUrl);
    setImageFile(file);
    setError(null);
    setProcessing(true);
    setProcessingStatus('Analyzing handwriting...');

    try {
      let imageUrl = '';
      if (user) {
        try {
          imageUrl = await uploadMixtapeImage(user.id, file);
        } catch (uploadErr) {
          console.warn('Image upload failed, continuing with OCR:', uploadErr);
        }
      }

      const ocrResult = await performOcr(dataUrl);
      setProcessingStatus('Parsing song list...');
      let songs: ParsedSong[];
      if (ocrResult.lines && ocrResult.lines.length > 0) {
        songs = parseOcrLines(ocrResult.lines);
      } else {
        songs = parseRawText(ocrResult.rawText);
      }

      setParsedSongs(songs);

      if (user) {
        const { data: mixtape, error: mixtapeError } = await supabase
          .from('mixtapes')
          .insert({
            user_id: user.id,
            name: `Mixtape ${new Date().toLocaleDateString()}`,
            original_image_url: imageUrl,
            ocr_raw_text: ocrResult.rawText,
          })
          .select()
          .single();

        if (!mixtapeError && mixtape) {
          setMixtapeId(mixtape.id);
        }
      }

      setProcessing(false);
      setCurrentStep(1);
    } catch (err) {
      console.error('Processing error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to process image: ${message}`);
      setProcessing(false);
    }
  };

  const handleProceedToConnect = async () => {
    const tokens = getStoredTokens();
    if (tokens) {
      setSpotifyConnected(true);
      await handleMatchSongs(tokens.accessToken);
      setCurrentStep(3);
    } else {
      setCurrentStep(2);
    }
  };

  const handleSpotifyConnected = async () => {
    setSpotifyConnected(true);
    const tokens = getStoredTokens();
    if (tokens) {
      await handleMatchSongs(tokens.accessToken);
    }
    setCurrentStep(3);
  };

  const handleMatchSongs = async (accessToken: string) => {
    setProcessing(true);
    setProcessingStatus('Matching songs on Spotify...');

    try {
      const matched = await matchAllSongs(parsedSongs, accessToken, (completed, total) => {
        setProcessingStatus(`Matching songs... ${completed}/${total}`);
      });
      setMatchedSongs(matched);
    } catch (err) {
      console.error('Matching error:', err);
      setError('Failed to match songs. Please try again.');
    }

    setProcessing(false);
  };

  const handleUpdateSong = (index: number, song: MatchedSong) => {
    setMatchedSongs((prev) => {
      const updated = [...prev];
      updated[index] = song;
      return updated;
    });
  };

  const startEditingParsed = (index: number) => {
    const song = parsedSongs[index];
    setEditingParsedIndex(index);
    setEditParsedTitle(song.title);
    setEditParsedArtist(song.artist);
  };

  const saveEditParsed = () => {
    if (editingParsedIndex === null) return;
    setParsedSongs((prev) => {
      const updated = [...prev];
      updated[editingParsedIndex] = {
        ...updated[editingParsedIndex],
        title: editParsedTitle.trim() || updated[editingParsedIndex].title,
        artist: editParsedArtist.trim(),
      };
      return updated;
    });
    setEditingParsedIndex(null);
    setEditParsedTitle('');
    setEditParsedArtist('');
  };

  const cancelEditParsed = () => {
    setEditingParsedIndex(null);
    setEditParsedTitle('');
    setEditParsedArtist('');
  };

  const deleteParsedSong = (index: number) => {
    setParsedSongs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDisconnectSpotify = () => {
    disableDemoMode();
    setSpotifyConnected(false);
    setMatchedSongs([]);
    setCurrentStep(2);
  };

  const handlePlaylistCreated = async (playlist: SpotifyPlaylist, playlistUrl: string) => {
    if (mixtapeId && user) {
      await supabase.from('playlists').insert({
        mixtape_id: mixtapeId,
        user_id: user.id,
        service: 'spotify',
        external_playlist_id: playlist.id,
        external_url: playlistUrl,
        name: playlist.name,
      });

      const songInserts = matchedSongs
        .filter((s) => s.spotifyTrack)
        .map((song) => ({
          mixtape_id: mixtapeId,
          side: song.side,
          track_number: song.trackNumber,
          extracted_text: song.extractedText,
          parsed_title: song.title,
          parsed_artist: song.artist,
          parsed_duration: song.duration,
          spotify_track_id: song.spotifyTrack?.id,
          match_confidence: song.matchScore,
          manually_matched: song.matchStatus === 'manual',
        }));

      if (songInserts.length > 0) {
        await supabase.from('songs').insert(songInserts);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const renderStepContent = () => {
    if (processing) {
      return (
        <Card className="text-center py-16">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary-600 animate-spin" />
          <p className="text-neutral-600">{processingStatus}</p>
        </Card>
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <ImageCapture onImageCaptured={handleImageCaptured} />
            {error && (
              <div className="p-4 rounded-lg bg-accent-50 border border-accent-200 text-accent-700">
                {error}
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <Card>
              <div className="flex items-start gap-4">
                {imageDataUrl && (
                  <img
                    src={imageDataUrl}
                    alt="Scanned mixtape"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    {parsedSongs.length} songs detected
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Review and edit the extracted songs below. Click the pencil icon to correct any OCR errors before matching.
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              {parsedSongs.map((song, index) => (
                <Card key={index} padding="sm">
                  {editingParsedIndex === index ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-600 mt-1">
                          {index + 1}
                        </span>
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={editParsedTitle}
                            onChange={(e) => setEditParsedTitle(e.target.value)}
                            placeholder="Song title"
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            autoFocus
                          />
                          <input
                            type="text"
                            value={editParsedArtist}
                            onChange={(e) => setEditParsedArtist(e.target.value)}
                            placeholder="Artist name"
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            onKeyDown={(e) => e.key === 'Enter' && saveEditParsed()}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 ml-9">
                        <button
                          onClick={saveEditParsed}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={cancelEditParsed}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-medium text-neutral-600">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate">{song.title}</p>
                        {song.artist && (
                          <p className="text-sm text-neutral-600">{song.artist}</p>
                        )}
                      </div>
                      {song.duration && (
                        <span className="text-xs text-neutral-400">{song.duration}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditingParsed(index)}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                          title="Edit song"
                        >
                          <Pencil className="w-4 h-4 text-neutral-500" />
                        </button>
                        <button
                          onClick={() => deleteParsedSong(index)}
                          className="p-1.5 rounded-lg hover:bg-accent-50 transition-colors"
                          title="Remove song"
                        >
                          <Trash2 className="w-4 h-4 text-neutral-400 hover:text-accent-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={handleBack} icon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button onClick={handleProceedToConnect} icon={<ArrowRight className="w-4 h-4" />} disabled={parsedSongs.length === 0}>
                Continue to Match
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <SpotifyConnect onConnected={handleSpotifyConnected} />
            <Button variant="ghost" onClick={handleBack} icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </div>
        );

      case 3:
        const tokens = getStoredTokens();
        if (!tokens) {
          setCurrentStep(2);
          return null;
        }

        const inDemoMode = isDemoMode();

        return (
          <div className="space-y-6">
            <Card padding="sm" className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${inDemoMode ? 'bg-amber-100' : 'bg-[#1DB954]/10'}`}>
                  <svg viewBox="0 0 24 24" className={`w-4 h-4 ${inDemoMode ? 'fill-amber-600' : 'fill-[#1DB954]'}`}>
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {inDemoMode ? 'Demo Mode' : 'Connected to Spotify'}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {inDemoMode ? 'Using sample 80s songs for matching' : 'Searching your real Spotify catalog'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDisconnectSpotify}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Switch
              </button>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Matched Songs</h3>
                <SongReview
                  songs={matchedSongs}
                  onUpdateSong={handleUpdateSong}
                  accessToken={tokens.accessToken}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Create Playlist</h3>
                <PlaylistCreator
                  songs={matchedSongs}
                  accessToken={tokens.accessToken}
                  onPlaylistCreated={handlePlaylistCreated}
                />
              </div>
            </div>

            <Button variant="ghost" onClick={handleBack} icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-neutral-900 mb-2">
            Scan Your Mixtape
          </h1>
          <p className="text-neutral-600">
            Capture, review, and transform your handwritten song list into a Spotify playlist.
          </p>
        </div>

        <WizardProgress currentStep={currentStep} steps={STEPS} />

        {renderStepContent()}
      </div>
    </Layout>
  );
}
