# Mixtape Memory

Transform your physical mixtapes into digital Spotify playlists using OCR technology and intelligent song matching.

## Overview

Mixtape Memory is a web application that allows users to photograph handwritten mixtape labels, extract song information using optical character recognition (OCR), match songs to streaming services, and create playlists automatically.

## Features

- **Image Capture**: Take photos of mixtape labels directly from your device camera or upload existing images
- **OCR Processing**: Advanced text extraction that handles handwritten text, multiple columns, and various cassette label formats
- **Intelligent Song Matching**: Fuzzy matching algorithm that finds songs on Spotify even with OCR errors or abbreviated artist names
- **Playlist Creation**: One-click playlist creation on Spotify
- **History Tracking**: View and manage all your digitized mixtapes
- **Demo Mode**: Try the app without connecting to Spotify

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18, TypeScript |
| Routing | React Router v7 |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Backend | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Storage | Supabase Storage |
| OCR | Google Cloud Vision API |
| Music API | Spotify Web API |
| Build Tool | Vite |

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your API keys (see [Configuration Guide](./CONFIGURATION.md) for details)
4. Start development server:
   ```bash
   npm run dev
   ```

## Documentation

- [Configuration Guide](./CONFIGURATION.md) - Environment setup and API keys
- [Architecture Overview](./ARCHITECTURE.md) - System design and components
- [Database Schema](./DATABASE.md) - Tables, relationships, and security
- [API Reference](./API.md) - Services and edge functions
- [OCR Parser](./OCR_PARSER.md) - Text parsing algorithms

## Project Structure

```
src/
├── components/
│   ├── layout/          # Header, Layout wrapper
│   ├── scan/            # Wizard step components
│   └── ui/              # Reusable UI components
├── contexts/
│   └── AuthContext.tsx  # Authentication state
├── lib/
│   └── supabase.ts      # Supabase client
├── pages/               # Route pages
└── services/            # Business logic
    ├── ocr.ts           # Image processing
    ├── songMatcher.ts   # Spotify matching
    ├── spotify.ts       # Spotify API
    └── textParser.ts    # OCR text parsing

supabase/
├── functions/           # Edge functions
└── migrations/          # Database schema
```

## License

MIT
