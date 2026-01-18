import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  display_name: string | null;
  spotify_connected: boolean;
  apple_music_connected: boolean;
  amazon_music_connected: boolean;
  created_at: string;
  updated_at: string;
};

export type Mixtape = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  original_image_url: string | null;
  side_a_image_url: string | null;
  side_b_image_url: string | null;
  ocr_raw_text: string | null;
  created_at: string;
  updated_at: string;
};

export type Song = {
  id: string;
  mixtape_id: string;
  side: 'A' | 'B';
  track_number: number;
  extracted_text: string;
  parsed_title: string;
  parsed_artist: string;
  parsed_duration: string | null;
  spotify_track_id: string | null;
  apple_music_id: string | null;
  amazon_music_id: string | null;
  isrc: string | null;
  match_confidence: number;
  manually_matched: boolean;
  created_at: string;
};

export type Playlist = {
  id: string;
  mixtape_id: string;
  user_id: string;
  service: 'spotify' | 'apple_music' | 'amazon_music';
  external_playlist_id: string;
  external_url: string | null;
  name: string;
  created_at: string;
};

export type MatchCache = {
  id: string;
  ocr_text: string;
  ocr_text_normalized: string;
  spotify_track_id: string | null;
  apple_music_id: string | null;
  amazon_music_id: string | null;
  verified: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
};
