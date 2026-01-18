import { ParsedSong } from './textParser';
import { SpotifyTrack, searchTracks, isDemoMode, DEMO_SONGS } from './spotify';
import { supabase } from '../lib/supabase';
import { findDemoTrack } from './demoData';

export interface MatchedSong extends ParsedSong {
  spotifyTrack: SpotifyTrack | null;
  alternativeMatches: SpotifyTrack[];
  matchScore: number;
  matchStatus: 'matched' | 'low_confidence' | 'not_found' | 'manual';
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function calculateSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeText(str1);
  const norm2 = normalizeText(str2);

  if (norm1 === norm2) return 1;

  const distance = levenshteinDistance(norm1, norm2);
  const maxLength = Math.max(norm1.length, norm2.length);

  if (maxLength === 0) return 1;

  return 1 - distance / maxLength;
}

function getReleaseYear(releaseDate: string): number {
  return parseInt(releaseDate.split('-')[0], 10);
}

function calculateEraScore(releaseYear: number): number {
  if (releaseYear >= 1980 && releaseYear <= 1989) return 1.0;
  if (releaseYear >= 1975 && releaseYear <= 1994) return 0.9;
  if (releaseYear >= 1970 && releaseYear <= 1999) return 0.8;
  if (releaseYear >= 1960 && releaseYear <= 2005) return 0.7;
  return 0.5;
}

function scoreTrackMatch(
  parsedSong: ParsedSong,
  track: SpotifyTrack
): number {
  const titleSimilarity = calculateSimilarity(parsedSong.title, track.name);

  let artistSimilarity = 0;
  if (parsedSong.artist) {
    const artistNames = track.artists.map((a) => a.name);
    artistSimilarity = Math.max(
      ...artistNames.map((name) => calculateSimilarity(parsedSong.artist, name))
    );
  }

  const releaseYear = getReleaseYear(track.album.release_date);
  const eraScore = calculateEraScore(releaseYear);

  const isOriginal = !track.name.toLowerCase().includes('remaster') &&
    !track.name.toLowerCase().includes('live') &&
    !track.name.toLowerCase().includes('cover') &&
    !track.name.toLowerCase().includes('remix');
  const originalBonus = isOriginal ? 0.05 : 0;

  if (parsedSong.artist) {
    return (
      titleSimilarity * 0.45 +
      artistSimilarity * 0.35 +
      eraScore * 0.15 +
      originalBonus +
      0.05
    );
  } else {
    return titleSimilarity * 0.7 + eraScore * 0.25 + originalBonus + 0.05;
  }
}

async function checkMatchCache(
  normalizedText: string
): Promise<{ spotifyTrackId: string | null; verified: boolean } | null> {
  const { data, error } = await supabase
    .from('match_cache')
    .select('spotify_track_id, verified')
    .eq('ocr_text_normalized', normalizedText)
    .order('usage_count', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  await supabase
    .from('match_cache')
    .update({ usage_count: supabase.rpc('increment_usage') })
    .eq('ocr_text_normalized', normalizedText);

  return {
    spotifyTrackId: data.spotify_track_id,
    verified: data.verified,
  };
}

async function cacheMatch(
  ocrText: string,
  spotifyTrackId: string,
  verified: boolean = false
): Promise<void> {
  const normalizedText = normalizeText(ocrText);

  await supabase.from('match_cache').upsert(
    {
      ocr_text: ocrText,
      ocr_text_normalized: normalizedText,
      spotify_track_id: spotifyTrackId,
      verified,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'ocr_text_normalized' }
  );
}

export async function matchSong(
  parsedSong: ParsedSong,
  accessToken: string
): Promise<MatchedSong> {
  const normalizedText = normalizeText(parsedSong.extractedText);

  if (isDemoMode()) {
    const demoMatch = findDemoTrack(parsedSong.title, parsedSong.artist || '');
    if (demoMatch) {
      const alternatives = DEMO_SONGS
        .filter(t => t.id !== demoMatch.id)
        .slice(0, 3);
      return {
        ...parsedSong,
        spotifyTrack: demoMatch,
        alternativeMatches: alternatives,
        matchScore: 0.95,
        matchStatus: 'matched',
      };
    }
    const searchQuery = `${parsedSong.title} ${parsedSong.artist || ''}`.trim();
    const tracks = await searchTracks(searchQuery, accessToken, 10);
    if (tracks.length > 0) {
      const scoredTracks = tracks
        .map((track) => ({
          track,
          score: scoreTrackMatch(parsedSong, track),
        }))
        .sort((a, b) => b.score - a.score);
      const bestMatch = scoredTracks[0];
      return {
        ...parsedSong,
        spotifyTrack: bestMatch.track,
        alternativeMatches: scoredTracks.slice(1, 4).map((s) => s.track),
        matchScore: bestMatch.score,
        matchStatus: bestMatch.score >= 0.7 ? 'matched' : 'low_confidence',
      };
    }
    return {
      ...parsedSong,
      spotifyTrack: null,
      alternativeMatches: DEMO_SONGS.slice(0, 3),
      matchScore: 0,
      matchStatus: 'not_found',
    };
  }

  const cached = await checkMatchCache(normalizedText);
  if (cached?.spotifyTrackId) {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/tracks/${cached.spotifyTrackId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (response.ok) {
        const track: SpotifyTrack = await response.json();
        return {
          ...parsedSong,
          spotifyTrack: track,
          alternativeMatches: [],
          matchScore: cached.verified ? 1.0 : 0.95,
          matchStatus: cached.verified ? 'matched' : 'matched',
        };
      }
    } catch {
      // Cached track not found, continue with search
    }
  }

  let searchQuery = parsedSong.title;
  if (parsedSong.artist) {
    searchQuery = `${parsedSong.title} ${parsedSong.artist}`;
  }

  try {
    const tracks = await searchTracks(searchQuery, accessToken, 10);

    if (tracks.length === 0) {
      return {
        ...parsedSong,
        spotifyTrack: null,
        alternativeMatches: [],
        matchScore: 0,
        matchStatus: 'not_found',
      };
    }

    const scoredTracks = tracks
      .map((track) => ({
        track,
        score: scoreTrackMatch(parsedSong, track),
      }))
      .sort((a, b) => b.score - a.score);

    const bestMatch = scoredTracks[0];
    const alternatives = scoredTracks.slice(1, 4).map((s) => s.track);

    if (bestMatch.score >= 0.7) {
      await cacheMatch(parsedSong.extractedText, bestMatch.track.id, false);
    }

    return {
      ...parsedSong,
      spotifyTrack: bestMatch.track,
      alternativeMatches: alternatives,
      matchScore: bestMatch.score,
      matchStatus: bestMatch.score >= 0.7 ? 'matched' : 'low_confidence',
    };
  } catch (error) {
    console.error('Error matching song:', error);
    return {
      ...parsedSong,
      spotifyTrack: null,
      alternativeMatches: [],
      matchScore: 0,
      matchStatus: 'not_found',
    };
  }
}

export async function matchAllSongs(
  parsedSongs: ParsedSong[],
  accessToken: string,
  onProgress?: (completed: number, total: number) => void
): Promise<MatchedSong[]> {
  const results: MatchedSong[] = [];

  for (let i = 0; i < parsedSongs.length; i++) {
    const matched = await matchSong(parsedSongs[i], accessToken);
    results.push(matched);

    if (onProgress) {
      onProgress(i + 1, parsedSongs.length);
    }

    if (i < parsedSongs.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}
