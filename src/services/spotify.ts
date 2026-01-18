import { DEMO_SONGS, DEMO_USER, searchDemoTracks } from './demoData';

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
const REDIRECT_URI = `${window.location.origin}/spotify-callback`;
const SCOPES = [
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-private',
  'user-read-email',
].join(' ');

const DEMO_ACCESS_TOKEN = 'demo-access-token';

export function isDemoMode(): boolean {
  return localStorage.getItem('spotify_demo_mode') === 'true';
}

export function enableDemoMode(): void {
  localStorage.setItem('spotify_demo_mode', 'true');
  const demoTokens: SpotifyTokens = {
    accessToken: DEMO_ACCESS_TOKEN,
    refreshToken: 'demo-refresh-token',
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };
  localStorage.setItem('spotify_tokens', JSON.stringify(demoTokens));
}

export function disableDemoMode(): void {
  localStorage.removeItem('spotify_demo_mode');
  localStorage.removeItem('spotify_tokens');
}

function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64encode(input: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export async function initiateSpotifyAuth(): Promise<void> {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  sessionStorage.setItem('spotify_code_verifier', codeVerifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: REDIRECT_URI,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function handleSpotifyCallback(code: string): Promise<SpotifyTokens> {
  const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
  if (!codeVerifier) {
    throw new Error('No code verifier found');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for tokens');
  }

  const tokens = await response.json();
  sessionStorage.removeItem('spotify_code_verifier');

  const spotifyTokens: SpotifyTokens = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  };

  localStorage.setItem('spotify_tokens', JSON.stringify(spotifyTokens));
  return spotifyTokens;
}

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export function getStoredTokens(): SpotifyTokens | null {
  const stored = localStorage.getItem('spotify_tokens');
  if (!stored) return null;

  const tokens: SpotifyTokens = JSON.parse(stored);
  if (Date.now() >= tokens.expiresAt - 60000) {
    return null;
  }

  return tokens;
}

export async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokens> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    localStorage.removeItem('spotify_tokens');
    throw new Error('Failed to refresh token');
  }

  const tokens = await response.json();
  const spotifyTokens: SpotifyTokens = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || refreshToken,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  };

  localStorage.setItem('spotify_tokens', JSON.stringify(spotifyTokens));
  return spotifyTokens;
}

export function clearSpotifyTokens(): void {
  localStorage.removeItem('spotify_tokens');
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; width: number; height: number }[];
    release_date: string;
  };
  duration_ms: number;
  external_urls?: { spotify: string };
  uri: string;
  preview_url: string | null;
}

export interface SpotifySearchResult {
  tracks: {
    items: SpotifyTrack[];
    total: number;
  };
}

export async function searchTracks(
  query: string,
  accessToken: string,
  limit: number = 5
): Promise<SpotifyTrack[]> {
  if (isDemoMode() || accessToken === DEMO_ACCESS_TOKEN) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return searchDemoTracks(query).slice(0, limit);
  }

  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: limit.toString(),
  });

  const response = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to search tracks');
  }

  const data: SpotifySearchResult = await response.json();
  return data.tracks.items;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
}

export async function getCurrentUser(accessToken: string): Promise<SpotifyUser> {
  if (isDemoMode() || accessToken === DEMO_ACCESS_TOKEN) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      ...DEMO_USER,
      images: [{ url: 'https://images.pexels.com/photos/1699159/pexels-photo-1699159.jpeg?auto=compress&cs=tinysrgb&w=100' }],
    };
  }

  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user profile');
  }

  return response.json();
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  external_urls: { spotify: string };
  images: { url: string }[];
}

let demoPlaylistCounter = 1;

export async function createPlaylist(
  userId: string,
  name: string,
  description: string,
  accessToken: string,
  isPublic: boolean = false
): Promise<SpotifyPlaylist> {
  if (isDemoMode() || accessToken === DEMO_ACCESS_TOKEN) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const playlistId = `demo-playlist-${demoPlaylistCounter++}`;
    return {
      id: playlistId,
      name,
      description,
      external_urls: { spotify: `https://open.spotify.com/playlist/${playlistId}` },
      images: [{ url: 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=300' }],
    };
  }

  const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description,
      public: isPublic,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create playlist');
  }

  return response.json();
}

export async function addTracksToPlaylist(
  playlistId: string,
  trackUris: string[],
  accessToken: string
): Promise<void> {
  if (isDemoMode() || accessToken === DEMO_ACCESS_TOKEN) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return;
  }

  const batchSize = 100;

  for (let i = 0; i < trackUris.length; i += batchSize) {
    const batch = trackUris.slice(i, i + batchSize);

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: batch }),
    });

    if (!response.ok) {
      throw new Error('Failed to add tracks to playlist');
    }
  }
}

export { DEMO_SONGS };
