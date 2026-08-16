# OCR Parser Technical Specification

## Overview

The OCR parser transforms raw text from Google Cloud Vision into structured song data. It handles common challenges with handwritten mixtape labels including:

- Two-column layouts (Side A / Side B)
- Various song/artist separator formats
- Abbreviated artist names
- Song durations and track numbers
- Cassette label header text
- OCR errors and misreadings

## Processing Pipeline

```
Raw OCR Lines
      │
      ▼
┌─────────────────┐
│ Preprocess Text │  Strip durations, normalize whitespace
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Detect Columns  │  Identify left (A) and right (B) columns
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Split Wide Lines│  Separate lines spanning both columns
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Filter Non-Songs│  Remove headers, technical terms
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Combine Lines   │  Merge title/artist on separate lines
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Parse Each Song │  Extract title, artist, track number
└─────────────────┘
      │
      ▼
Structured ParsedSong[]
```

## Column Detection

### Algorithm

1. Calculate bounding box statistics for all lines
2. Find maximum right edge of all lines
3. Identify lines spanning > 1.5x average width as "wide"
4. Split wide lines at detected song boundaries
5. Classify remaining lines by center position relative to midpoint:
   - Center < midpoint * 0.9 = Left column (Side A)
   - Center > midpoint * 1.1 = Right column (Side B)
6. Sort each column by Y coordinate (top to bottom)

### Wide Line Splitting

Wide lines are split using these patterns (in priority order):

1. **Two-song pattern:** `Song1 - Artist1 Song2 - Artist2`
2. **Double-space separation:** `Song - Artist  Song - Artist`
3. **Artist followed by title:** `- Artist Song Title -`

## Song/Artist Parsing

### Separator Detection

The parser recognizes multiple separator formats:

| Format | Example |
|--------|---------|
| Hyphen | `Thriller - Michael Jackson` |
| En-dash | `Thriller – Michael Jackson` |
| Em-dash | `Thriller — Michael Jackson` |
| Middle dot | `Thriller · Michael Jackson` |
| Slash | `Thriller / Michael Jackson` |
| Colon | `Thriller: Michael Jackson` |
| By keyword | `Thriller by Michael Jackson` |

### Artist Abbreviation Expansion

Common abbreviations are automatically expanded:

| Abbreviation | Full Name |
|--------------|-----------|
| MJ | Michael Jackson |
| Zep, LZ | Led Zeppelin |
| Stones | Rolling Stones |
| Crue | Motley Crue |
| GnR | Guns N' Roses |
| VH | Van Halen |
| Def Lep | Def Leppard |
| Bon Jov | Bon Jovi |
| U2 | U2 |
| RHCP | Red Hot Chili Peppers |
| AC/DC | AC/DC |
| ELO | Electric Light Orchestra |
| CCR | Creedence Clearwater Revival |
| ... | (50+ mappings) |

### Title/Artist Position Detection

The parser determines whether title or artist comes first by:

1. Checking if either part matches known artist database
2. Analyzing capitalization patterns
3. Looking for common title words (The, A, My, Your, etc.)
4. Checking for possessives and common artist name patterns

## Noise Filtering

### Cassette Technical Terms

These patterns are automatically filtered out:

- Noise reduction markers
- EQ settings (High, Low, Normal)
- Tape types (CrO2, Chrome, Metal, Type I/II/III/IV)
- Dolby indicators
- Bias settings
- Position markers
- Brand names (TDK, Maxell, Sony, Memorex, BASF, Scotch, Fuji)

### Header Text Filtering

Common cassette label headers are removed:

- DATE, N.R.
- YES/NO checkboxes (OYES ONO)
- Side markers (already used for column detection)
- Single letters or numbers
- Year-only entries (e.g., "1985")
- Month names

### Duration Stripping

Song durations in these formats are removed before parsing:

- `(5:12)` - Parenthesized
- `[5:12]` - Bracketed
- `5:12` - Plain at end of line
- `5'12"` - Minutes/seconds notation

## Track Number Detection

Track numbers are extracted from:

- Leading numbers: `1. Song Title`
- Leading numbers with parentheses: `(1) Song Title`
- Leading numbers with hyphen: `1 - Song Title`
- Implicit ordering: First song = 1, second = 2, etc.

## Output Format

```typescript
interface ParsedSong {
  id: string;           // UUID for React keys
  side: 'A' | 'B';      // Detected tape side
  trackNumber: number;  // Position on side
  extractedText: string;// Original OCR text
  title: string;        // Cleaned song title
  artist: string;       // Cleaned/expanded artist
  duration?: string;    // If detected
  confidence: number;   // OCR confidence (0-1)
}
```

## Known Limitations

1. **Vertical text:** Not supported; text must be horizontal
2. **Decorative fonts:** May have lower OCR accuracy
3. **Very faded text:** May not be detected
4. **Non-Latin scripts:** Limited support
5. **Mixed columns:** Works best with clear A/B separation

## Extending the Parser

### Adding Artist Abbreviations

Edit `ARTIST_ABBREVIATIONS` in `textParser.ts`:

```typescript
const ARTIST_ABBREVIATIONS: Record<string, string> = {
  'newabbrev': 'Full Artist Name',
  // ...existing entries
};
```

### Adding Filter Patterns

Add to `CASSETTE_TECHNICAL_TERMS` array:

```typescript
const CASSETTE_TECHNICAL_TERMS = [
  /your-pattern/i,
  // ...existing patterns
];
```

### Adjusting Column Detection

Modify thresholds in `detectColumns()`:

- `avgWidth * 1.5` - Wide line threshold
- `midpoint * 0.9` - Left column boundary
- `midpoint * 1.1` - Right column boundary

## Testing Tips

1. **High-contrast images** produce better OCR results
2. **Flat, well-lit photos** reduce distortion
3. **Multiple photos** can be combined for A/B sides
4. **Manual corrections** improve match accuracy
5. **Common songs** benefit from the shared match cache
