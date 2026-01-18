/*
  # Mixtape Memory Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `display_name` (text, optional display name)
      - `spotify_connected` (boolean, default false)
      - `apple_music_connected` (boolean, default false)
      - `amazon_music_connected` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `mixtapes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text, mixtape name)
      - `description` (text, optional story/notes)
      - `original_image_url` (text, Supabase Storage URL)
      - `side_a_image_url` (text, optional separate Side A image)
      - `side_b_image_url` (text, optional separate Side B image)
      - `ocr_raw_text` (text, raw OCR output for reference)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `songs`
      - `id` (uuid, primary key)
      - `mixtape_id` (uuid, references mixtapes)
      - `side` (text, 'A' or 'B')
      - `track_number` (integer, position on side)
      - `extracted_text` (text, original OCR text)
      - `parsed_title` (text, cleaned song title)
      - `parsed_artist` (text, cleaned artist name)
      - `parsed_duration` (text, optional duration from notes)
      - `spotify_track_id` (text, matched Spotify ID)
      - `apple_music_id` (text, matched Apple Music ID)
      - `amazon_music_id` (text, matched Amazon Music ID)
      - `isrc` (text, International Standard Recording Code)
      - `match_confidence` (numeric, 0-1 confidence score)
      - `manually_matched` (boolean, user override)
      - `created_at` (timestamptz)

    - `playlists`
      - `id` (uuid, primary key)
      - `mixtape_id` (uuid, references mixtapes)
      - `user_id` (uuid, references profiles)
      - `service` (text, 'spotify', 'apple_music', 'amazon_music')
      - `external_playlist_id` (text, ID from the streaming service)
      - `external_url` (text, shareable link)
      - `name` (text, playlist name)
      - `created_at` (timestamptz)

    - `match_cache`
      - `id` (uuid, primary key)
      - `ocr_text` (text, original extracted text)
      - `ocr_text_normalized` (text, lowercase/trimmed for matching)
      - `spotify_track_id` (text)
      - `apple_music_id` (text)
      - `amazon_music_id` (text)
      - `verified` (boolean, user-confirmed match)
      - `usage_count` (integer, how often this match was used)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Match cache is shared read but owned writes
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  spotify_connected boolean DEFAULT false,
  apple_music_connected boolean DEFAULT false,
  amazon_music_connected boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Mixtapes table
CREATE TABLE IF NOT EXISTS mixtapes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT '',
  description text DEFAULT '',
  original_image_url text,
  side_a_image_url text,
  side_b_image_url text,
  ocr_raw_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mixtapes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mixtapes"
  ON mixtapes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mixtapes"
  ON mixtapes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mixtapes"
  ON mixtapes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mixtapes"
  ON mixtapes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Songs table
CREATE TABLE IF NOT EXISTS songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mixtape_id uuid REFERENCES mixtapes(id) ON DELETE CASCADE NOT NULL,
  side text DEFAULT 'A' CHECK (side IN ('A', 'B')),
  track_number integer NOT NULL DEFAULT 1,
  extracted_text text NOT NULL DEFAULT '',
  parsed_title text DEFAULT '',
  parsed_artist text DEFAULT '',
  parsed_duration text,
  spotify_track_id text,
  apple_music_id text,
  amazon_music_id text,
  isrc text,
  match_confidence numeric DEFAULT 0 CHECK (match_confidence >= 0 AND match_confidence <= 1),
  manually_matched boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view songs from own mixtapes"
  ON songs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mixtapes
      WHERE mixtapes.id = songs.mixtape_id
      AND mixtapes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert songs to own mixtapes"
  ON songs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mixtapes
      WHERE mixtapes.id = songs.mixtape_id
      AND mixtapes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update songs in own mixtapes"
  ON songs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mixtapes
      WHERE mixtapes.id = songs.mixtape_id
      AND mixtapes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mixtapes
      WHERE mixtapes.id = songs.mixtape_id
      AND mixtapes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete songs from own mixtapes"
  ON songs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mixtapes
      WHERE mixtapes.id = songs.mixtape_id
      AND mixtapes.user_id = auth.uid()
    )
  );

-- Playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mixtape_id uuid REFERENCES mixtapes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  service text NOT NULL CHECK (service IN ('spotify', 'apple_music', 'amazon_music')),
  external_playlist_id text NOT NULL,
  external_url text,
  name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own playlists"
  ON playlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own playlists"
  ON playlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists"
  ON playlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Match cache table (shared for better matching over time)
CREATE TABLE IF NOT EXISTS match_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ocr_text text NOT NULL,
  ocr_text_normalized text NOT NULL,
  spotify_track_id text,
  apple_music_id text,
  amazon_music_id text,
  verified boolean DEFAULT false,
  usage_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE match_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read match cache"
  ON match_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert to match cache"
  ON match_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update match cache"
  ON match_cache FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for faster match cache lookups
CREATE INDEX IF NOT EXISTS idx_match_cache_normalized ON match_cache(ocr_text_normalized);

-- Create index for faster song lookups by mixtape
CREATE INDEX IF NOT EXISTS idx_songs_mixtape ON songs(mixtape_id);

-- Create index for faster playlist lookups
CREATE INDEX IF NOT EXISTS idx_playlists_mixtape ON playlists(mixtape_id);
CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(user_id);

-- Create storage bucket for mixtape images
INSERT INTO storage.buckets (id, name, public)
VALUES ('mixtape-images', 'mixtape-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for mixtape images
CREATE POLICY "Users can upload mixtape images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'mixtape-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view mixtape images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'mixtape-images');

CREATE POLICY "Users can delete own mixtape images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'mixtape-images' AND (storage.foldername(name))[1] = auth.uid()::text);