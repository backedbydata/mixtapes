# API Reference

## Services

### OCR Service

**File:** `src/services/ocr.ts`

#### compressImage(file: File): Promise<Blob>

Compresses an image for optimal OCR processing.

- **Parameters:** `file` - Original image file
- **Returns:** Compressed image blob (max 1920px, JPEG 85% quality)
- **Usage:**
  ```typescript
  const compressed = await compressImage(imageFile);
  ```

#### scanImage(imageUrl: string): Promise<OcrResult>

Sends image to OCR edge function for text extraction.

- **Parameters:** `imageUrl` - Supabase Storage URL
- **Returns:** `OcrResult` with lines, text, and confidence
- **Throws:** Error if OCR fails

#### uploadMixtapeImage(file: File, userId: string): Promise<string>

Uploads image to Supabase Storage.

- **Parameters:**
  - `file` - Image file to upload
  - `userId` - User's UUID for folder path
- **Returns:** Public URL of uploaded image

---

### Spotify Service

**File:** `src/services/spotify.ts`

#### SpotifyService.initiateAuth(): void

Starts Spotify OAuth flow with PKCE.

- **Side Effects:**
  - Generates code verifier and challenge
  - Stores verifier in localStorage
  - Redirects to Spotify authorization

#### SpotifyService.handleCallback(code: string): Promise<boolean>

Exchanges authorization code for access token.

- **Parameters:** `code` - Authorization code from callback
- **Returns:** `true` if successful
- **Side Effects:** Stores tokens in localStorage

#### SpotifyService.searchTrack(query: string): Promise<SpotifyTrack[]>

Searches Spotify catalog for tracks.

- **Parameters:** `query` - Search string (title + artist)
- **Returns:** Array of matching tracks (max 5)

#### SpotifyService.createPlaylist(name: string, trackIds: string[]): Promise<SpotifyPlaylist>

Creates a new playlist with specified tracks.

- **Parameters:**
  - `name` - Playlist name
  - `trackIds` - Array of Spotify track IDs
- **Returns:** Created playlist with ID and URL

#### SpotifyService.isConnected(): boolean

Checks if user has valid Spotify tokens.

#### SpotifyService.disconnect(): void

Clears stored Spotify tokens.

#### SpotifyService.getAccessToken(): string | null

Returns current access token if valid.

---

### Song Matcher Service

**File:** `src/services/songMatcher.ts`

#### matchSongsToSpotify(songs: ParsedSong[]): Promise<MatchedSong[]>

Matches parsed songs to Spotify tracks.

- **Parameters:** `songs` - Array of parsed song data
- **Returns:** Array with Spotify matches and confidence scores
- **Algorithm:**
  1. Search Spotify for each song
  2. Score results using Levenshtein distance
  3. Consider title similarity, artist similarity, era
  4. Return best match above threshold

#### MatchScore Calculation

```typescript
interface MatchScore {
  titleScore: number;    // 0-1, weighted 0.5
  artistScore: number;   // 0-1, weighted 0.4
  eraScore: number;      // 0-1, weighted 0.1
  total: number;         // Combined score
}
```

---

### Text Parser Service

**File:** `src/services/textParser.ts`

#### parseOcrLines(lines: OcrLine[], defaultSide?: 'A' | 'B'): ParsedSong[]

Main entry point for parsing OCR output.

- **Parameters:**
  - `lines` - OCR line data with bounding boxes
  - `defaultSide` - Default tape side (default: 'A')
- **Returns:** Array of parsed songs

#### Key Internal Functions

| Function | Purpose |
|----------|---------|
| `detectColumns()` | Identifies left/right columns for A/B sides |
| `splitWideSpanningLine()` | Splits lines spanning both columns |
| `parseSongAndArtist()` | Extracts title and artist from text |
| `stripSongDuration()` | Removes duration timestamps |
| `isLikelySongEntry()` | Filters non-song text |
| `combineConsecutiveLines()` | Merges split lines |

---

## Edge Functions

### ocr-scan

**Endpoint:** `{SUPABASE_URL}/functions/v1/ocr-scan`

#### POST /ocr-scan

Processes an image URL through Google Cloud Vision OCR.

**Request:**
```typescript
{
  imageUrl: string;  // URL of image to process
}
```

**Response:**
```typescript
{
  lines: Array<{
    text: string;
    confidence: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  fullText: string;
  confidence: number;
}
```

**Headers Required:**
- `Authorization: Bearer {SUPABASE_ANON_KEY}`
- `Content-Type: application/json`

**Error Responses:**
- `400` - Missing imageUrl
- `500` - OCR processing failed

---

## Data Types

### OcrLine

```typescript
interface OcrLine {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
```

### ParsedSong

```typescript
interface ParsedSong {
  id: string;
  side: 'A' | 'B';
  trackNumber: number;
  extractedText: string;
  title: string;
  artist: string;
  duration?: string;
  confidence: number;
}
```

### MatchedSong

```typescript
interface MatchedSong extends ParsedSong {
  spotifyTrack?: SpotifyTrack;
  matchConfidence: number;
  manuallyMatched: boolean;
}
```

### SpotifyTrack

```typescript
interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
    release_date: string;
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
}
```

---

## Authentication Flow

### Supabase Auth

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Sign out
await supabase.auth.signOut();

// Get session
const { data: { session } } = await supabase.auth.getSession();
```

### Spotify OAuth (PKCE)

```typescript
// 1. Generate verifier and challenge
const verifier = generateCodeVerifier();
const challenge = await generateCodeChallenge(verifier);

// 2. Redirect to Spotify
window.location.href = `https://accounts.spotify.com/authorize?
  client_id=${CLIENT_ID}&
  response_type=code&
  redirect_uri=${REDIRECT_URI}&
  code_challenge=${challenge}&
  code_challenge_method=S256&
  scope=${SCOPES}`;

// 3. Exchange code for token (in callback)
const response = await fetch('https://accounts.spotify.com/api/token', {
  method: 'POST',
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: verifier
  })
});
```
