# Configuration Guide

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SPOTIFY_CLIENT_ID=your-spotify-client-id
```

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings > API

### 2. Run Database Migrations

The database schema is defined in `supabase/migrations/`. Apply it through the Supabase dashboard SQL editor or using the Supabase CLI.

### 3. Configure Storage

The migration automatically creates a `mixtape-images` storage bucket. Ensure it's set to public for image access.

### 4. Deploy Edge Functions

Deploy the OCR edge function:
- Function location: `supabase/functions/ocr-scan/`
- Requires `GOOGLE_VISION_API_KEY` secret

#### Setting Edge Function Secrets

```bash
supabase secrets set GOOGLE_VISION_API_KEY=your-google-api-key
```

## Spotify Setup

### 1. Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Note your Client ID

### 2. Configure Redirect URIs

Add the following redirect URIs in your Spotify app settings:

**Development:**
```
http://localhost:5173/spotify-callback
```

**Production:**
```
https://your-domain.com/spotify-callback
```

### 3. Required Scopes

The app requests these Spotify scopes:
- `playlist-modify-public` - Create public playlists
- `playlist-modify-private` - Create private playlists
- `user-read-private` - Read user profile
- `user-read-email` - Read user email

## Google Cloud Vision Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the Cloud Vision API

### 2. Create API Key

1. Go to APIs & Services > Credentials
2. Create an API key
3. Restrict the key to Cloud Vision API only

### 3. Configure in Supabase

Add the API key as a secret in your Supabase project for the edge function.

## Development vs Production

### Development Mode

- Uses local Vite dev server on port 5173
- Supports demo mode without real Spotify connection
- Hot module replacement enabled

### Production Build

```bash
npm run build
npm run preview  # Test production build locally
```

### Environment-Specific Configuration

| Variable | Development | Production |
|----------|-------------|------------|
| Supabase URL | Local or cloud | Cloud project URL |
| Spotify Redirect | localhost:5173 | Production domain |
| Demo Mode | Enabled | Optional |
