# Database Schema

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   profiles  │       │  mixtapes   │       │    songs    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │──┐    │ id (PK)     │
│ display_name│  │    │ user_id(FK) │◀─┘    │ mixtape_id  │◀─┘
│ spotify_    │  │    │ name        │       │ side        │
│  connected  │  │    │ description │       │ track_number│
│ created_at  │  │    │ image_urls  │       │ extracted_  │
│ updated_at  │  │    │ ocr_raw_text│       │  text       │
└─────────────┘  │    │ created_at  │       │ parsed_title│
                 │    │ updated_at  │       │ parsed_artist│
                 │    └─────────────┘       │ spotify_id  │
                 │           │              │ match_conf  │
                 │           │              │ created_at  │
                 │           ▼              └─────────────┘
                 │    ┌─────────────┐
                 │    │  playlists  │       ┌─────────────┐
                 │    ├─────────────┤       │ match_cache │
                 │    │ id (PK)     │       ├─────────────┤
                 └───▶│ user_id(FK) │       │ id (PK)     │
                      │ mixtape_id  │       │ ocr_text    │
                      │ service     │       │ ocr_text_   │
                      │ external_id │       │  normalized │
                      │ external_url│       │ spotify_id  │
                      │ name        │       │ verified    │
                      │ created_at  │       │ usage_count │
                      └─────────────┘       │ created_at  │
                                            └─────────────┘
```

## Tables

### profiles

Stores user profile information linked to Supabase Auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, FK to auth.users | User identifier |
| display_name | text | nullable | User's display name |
| spotify_connected | boolean | default false | Spotify connection status |
| apple_music_connected | boolean | default false | Apple Music status |
| amazon_music_connected | boolean | default false | Amazon Music status |
| created_at | timestamptz | default now() | Record creation time |
| updated_at | timestamptz | default now() | Last update time |

### mixtapes

Stores digitized mixtape records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| user_id | uuid | FK to profiles, NOT NULL | Owner |
| name | text | NOT NULL, default '' | Mixtape name |
| description | text | default '' | Story or notes |
| original_image_url | text | nullable | Primary image URL |
| side_a_image_url | text | nullable | Side A image |
| side_b_image_url | text | nullable | Side B image |
| ocr_raw_text | text | nullable | Raw OCR output |
| created_at | timestamptz | default now() | Creation time |
| updated_at | timestamptz | default now() | Last update |

### songs

Stores individual tracks extracted from mixtapes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| mixtape_id | uuid | FK to mixtapes, NOT NULL | Parent mixtape |
| side | text | CHECK ('A','B'), default 'A' | Tape side |
| track_number | integer | NOT NULL, default 1 | Position on side |
| extracted_text | text | NOT NULL, default '' | Raw OCR text |
| parsed_title | text | default '' | Cleaned song title |
| parsed_artist | text | default '' | Cleaned artist name |
| parsed_duration | text | nullable | Duration if detected |
| spotify_track_id | text | nullable | Matched Spotify ID |
| apple_music_id | text | nullable | Apple Music ID |
| amazon_music_id | text | nullable | Amazon Music ID |
| isrc | text | nullable | International code |
| match_confidence | numeric | CHECK (0-1), default 0 | Match score |
| manually_matched | boolean | default false | User override flag |
| created_at | timestamptz | default now() | Creation time |

### playlists

Stores created streaming service playlists.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| mixtape_id | uuid | FK to mixtapes, NOT NULL | Source mixtape |
| user_id | uuid | FK to profiles, NOT NULL | Owner |
| service | text | CHECK (spotify/apple/amazon) | Platform |
| external_playlist_id | text | NOT NULL | Platform's ID |
| external_url | text | nullable | Shareable link |
| name | text | NOT NULL, default '' | Playlist name |
| created_at | timestamptz | default now() | Creation time |

### match_cache

Shared cache of OCR text to track ID mappings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| ocr_text | text | NOT NULL | Original extracted text |
| ocr_text_normalized | text | NOT NULL | Lowercase/trimmed |
| spotify_track_id | text | nullable | Matched Spotify ID |
| apple_music_id | text | nullable | Apple Music ID |
| amazon_music_id | text | nullable | Amazon Music ID |
| verified | boolean | default false | User confirmed |
| usage_count | integer | default 1 | Times matched |
| created_at | timestamptz | default now() | Creation time |
| updated_at | timestamptz | default now() | Last update |

## Indexes

| Index | Table | Column(s) | Purpose |
|-------|-------|-----------|---------|
| idx_match_cache_normalized | match_cache | ocr_text_normalized | Fast text lookup |
| idx_songs_mixtape | songs | mixtape_id | Song queries by mixtape |
| idx_playlists_mixtape | playlists | mixtape_id | Playlist lookup |
| idx_playlists_user | playlists | user_id | User's playlists |

## Row Level Security Policies

### profiles
- SELECT: `auth.uid() = id`
- INSERT: `auth.uid() = id`
- UPDATE: `auth.uid() = id` (USING and WITH CHECK)

### mixtapes
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

### songs
- SELECT/INSERT/UPDATE/DELETE: User owns parent mixtape
  ```sql
  EXISTS (
    SELECT 1 FROM mixtapes
    WHERE mixtapes.id = songs.mixtape_id
    AND mixtapes.user_id = auth.uid()
  )
  ```

### playlists
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

### match_cache
- SELECT: All authenticated users (shared resource)
- INSERT: All authenticated users
- UPDATE: All authenticated users

## Storage

### Bucket: mixtape-images

Public bucket for storing mixtape photos.

**Policies:**
- INSERT: Authenticated, folder matches user ID
- SELECT: All authenticated users
- DELETE: Authenticated, folder matches user ID

**Path Structure:**
```
mixtape-images/
└── {user_id}/
    └── {timestamp}-{filename}
```
