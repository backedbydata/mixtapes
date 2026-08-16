# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    React Application                        ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   ││
│  │  │  Pages   │  │Components│  │ Services │  │ Contexts │   ││
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Supabase                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  PostgreSQL  │  │   Storage    │  │Edge Functions│         │
│  │   Database   │  │   Buckets    │  │   (Deno)     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External APIs                              │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │Google Vision │  │ Spotify API  │                            │
│  │     API      │  │              │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

## Application Flow

### 1. User Authentication

```
User → Login/Signup Page → Supabase Auth → Session Created → Profile Auto-Created
```

- Email/password authentication via Supabase
- Profile row created automatically on first sign-in
- Session managed via `AuthContext`

### 2. Mixtape Scanning Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Capture   │───▶│  OCR Scan   │───▶│   Review    │───▶│  Playlist   │
│   Image     │    │  Process    │    │   Songs     │    │  Creation   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼
   Camera/         Edge Function       Song Matcher       Spotify API
   File Upload     + Google Vision     + User Edits       Create Playlist
```

### 3. OCR Processing Pipeline

```
Raw Image
    │
    ▼
┌─────────────────┐
│ Image Compress  │  (Client-side, max 1920px)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Supabase Upload │  (Storage bucket)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Edge Function   │  (OCR processing)
│ - Google Vision │
│ - Line Detection│
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Text Parser     │  (Client-side)
│ - Column Detect │
│ - Song Extract  │
│ - Artist Parse  │
└─────────────────┘
    │
    ▼
Parsed Songs Array
```

## Component Architecture

### Page Components

| Page | Path | Description |
|------|------|-------------|
| Landing | `/` | Marketing page with feature overview |
| Login | `/login` | Email/password sign in |
| Signup | `/signup` | New user registration |
| ScanWizard | `/scan` | Multi-step scanning process |
| SpotifyCallback | `/spotify-callback` | OAuth redirect handler |
| History | `/history` | View past mixtapes |

### Scan Wizard Steps

```
ScanWizard
├── WizardProgress        (Step indicator)
├── Step 1: SpotifyConnect (Connect streaming service)
├── Step 2: ImageCapture   (Take/upload photo)
├── Step 3: SongReview     (Edit detected songs)
└── Step 4: PlaylistCreator (Name and create playlist)
```

### UI Component Library

```
components/ui/
├── Button.tsx    - Primary, secondary, outline variants
├── Card.tsx      - Container with shadow and padding
├── Input.tsx     - Form input with label and error
└── Modal.tsx     - Dialog overlay component
```

## State Management

### Authentication Context

```typescript
AuthContext provides:
- user: User | null
- profile: Profile | null
- loading: boolean
- signUp(email, password)
- signIn(email, password)
- signOut()
- updateProfile(updates)
```

### Local Component State

- Wizard step state managed in `ScanWizard`
- Form state managed per-component with `useState`
- No global state library (intentionally lightweight)

## Security Architecture

### Row Level Security (RLS)

All database tables have RLS enabled with policies:

- **profiles**: Users can only access their own profile
- **mixtapes**: Users can only access their own mixtapes
- **songs**: Users can access songs in their own mixtapes
- **playlists**: Users can access their own playlists
- **match_cache**: Shared read access, authenticated write

### API Security

- Supabase anon key used client-side (safe, RLS enforced)
- Edge functions use service role for elevated access
- Spotify tokens stored in localStorage (client-only)
- Google Vision API key stored as Supabase secret

## Performance Considerations

### Image Optimization

- Client-side compression before upload
- Maximum dimension: 1920px
- JPEG quality: 85%
- Reduces bandwidth and OCR processing time

### Caching Strategy

- Match cache table stores verified song matches
- Reduces API calls for common songs
- Usage count tracking for popular matches

### Code Splitting

- React Router handles route-based code splitting
- Vite handles module bundling and tree shaking
