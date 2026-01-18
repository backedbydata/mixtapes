import { SpotifyTrack } from './spotify';

export const DEMO_SONGS: SpotifyTrack[] = [
  {
    id: 'demo-1',
    name: "Pour Some Sugar on Me",
    artists: [{ id: 'a1', name: 'Def Leppard' }],
    album: {
      id: 'al1',
      name: 'Hysteria',
      images: [
        { url: 'https://images.pexels.com/photos/1021876/pexels-photo-1021876.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1021876/pexels-photo-1021876.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1987-08-03',
    },
    duration_ms: 264000,
    preview_url: null,
    uri: 'spotify:track:demo-1',
  },
  {
    id: 'demo-2',
    name: "Livin' on a Prayer",
    artists: [{ id: 'a2', name: 'Bon Jovi' }],
    album: {
      id: 'al2',
      name: 'Slippery When Wet',
      images: [
        { url: 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1986-08-18',
    },
    duration_ms: 249000,
    preview_url: null,
    uri: 'spotify:track:demo-2',
  },
  {
    id: 'demo-3',
    name: "Sweet Child O' Mine",
    artists: [{ id: 'a3', name: "Guns N' Roses" }],
    album: {
      id: 'al3',
      name: 'Appetite for Destruction',
      images: [
        { url: 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1987-07-21',
    },
    duration_ms: 356000,
    preview_url: null,
    uri: 'spotify:track:demo-3',
  },
  {
    id: 'demo-4',
    name: 'Jump',
    artists: [{ id: 'a4', name: 'Van Halen' }],
    album: {
      id: 'al4',
      name: '1984',
      images: [
        { url: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1984-01-09',
    },
    duration_ms: 241000,
    preview_url: null,
    uri: 'spotify:track:demo-4',
  },
  {
    id: 'demo-5',
    name: "Shakin'",
    artists: [{ id: 'a5', name: 'Eddie Money' }],
    album: {
      id: 'al5',
      name: 'No Control',
      images: [
        { url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1982-06-01',
    },
    duration_ms: 218000,
    preview_url: null,
    uri: 'spotify:track:demo-5',
  },
  {
    id: 'demo-6',
    name: 'Take Me Home Tonight',
    artists: [{ id: 'a5', name: 'Eddie Money' }],
    album: {
      id: 'al6',
      name: "Can't Hold Back",
      images: [
        { url: 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1986-06-03',
    },
    duration_ms: 269000,
    preview_url: null,
    uri: 'spotify:track:demo-6',
  },
  {
    id: 'demo-7',
    name: 'Higher Love',
    artists: [{ id: 'a6', name: 'Steve Winwood' }],
    album: {
      id: 'al7',
      name: 'Back in the High Life',
      images: [
        { url: 'https://images.pexels.com/photos/2111015/pexels-photo-2111015.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/2111015/pexels-photo-2111015.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1986-06-30',
    },
    duration_ms: 355000,
    preview_url: null,
    uri: 'spotify:track:demo-7',
  },
  {
    id: 'demo-8',
    name: 'Remember the Feeling',
    artists: [{ id: 'a7', name: 'Chicago' }],
    album: {
      id: 'al8',
      name: 'Chicago 18',
      images: [
        { url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1986-09-29',
    },
    duration_ms: 283000,
    preview_url: null,
    uri: 'spotify:track:demo-8',
  },
  {
    id: 'demo-9',
    name: "Let's Get Busy Baby",
    artists: [{ id: 'a8', name: 'DJ Jazzy Jeff & The Fresh Prince' }],
    album: {
      id: 'al9',
      name: 'And in This Corner...',
      images: [
        { url: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1989-10-17',
    },
    duration_ms: 234000,
    preview_url: null,
    uri: 'spotify:track:demo-9',
  },
  {
    id: 'demo-10',
    name: 'Every Breath You Take',
    artists: [{ id: 'a9', name: 'The Police' }],
    album: {
      id: 'al10',
      name: 'Synchronicity',
      images: [
        { url: 'https://images.pexels.com/photos/2147029/pexels-photo-2147029.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/2147029/pexels-photo-2147029.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1983-06-01',
    },
    duration_ms: 253000,
    preview_url: null,
    uri: 'spotify:track:demo-10',
  },
  {
    id: 'demo-11',
    name: 'Billie Jean',
    artists: [{ id: 'a10', name: 'Michael Jackson' }],
    album: {
      id: 'al11',
      name: 'Thriller',
      images: [
        { url: 'https://images.pexels.com/photos/1626481/pexels-photo-1626481.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1626481/pexels-photo-1626481.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1982-11-30',
    },
    duration_ms: 294000,
    preview_url: null,
    uri: 'spotify:track:demo-11',
  },
  {
    id: 'demo-12',
    name: 'I Wanna Dance with Somebody',
    artists: [{ id: 'a11', name: 'Whitney Houston' }],
    album: {
      id: 'al12',
      name: 'Whitney',
      images: [
        { url: 'https://images.pexels.com/photos/1460037/pexels-photo-1460037.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1460037/pexels-photo-1460037.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1987-06-02',
    },
    duration_ms: 291000,
    preview_url: null,
    uri: 'spotify:track:demo-12',
  },
  {
    id: 'demo-13',
    name: 'Like a Prayer',
    artists: [{ id: 'a12', name: 'Madonna' }],
    album: {
      id: 'al13',
      name: 'Like a Prayer',
      images: [
        { url: 'https://images.pexels.com/photos/1370545/pexels-photo-1370545.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1370545/pexels-photo-1370545.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1989-03-21',
    },
    duration_ms: 340000,
    preview_url: null,
    uri: 'spotify:track:demo-13',
  },
  {
    id: 'demo-14',
    name: 'Born in the U.S.A.',
    artists: [{ id: 'a13', name: 'Bruce Springsteen' }],
    album: {
      id: 'al14',
      name: 'Born in the U.S.A.',
      images: [
        { url: 'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1984-06-04',
    },
    duration_ms: 280000,
    preview_url: null,
    uri: 'spotify:track:demo-14',
  },
  {
    id: 'demo-15',
    name: 'Purple Rain',
    artists: [{ id: 'a14', name: 'Prince' }],
    album: {
      id: 'al15',
      name: 'Purple Rain',
      images: [
        { url: 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1984-06-25',
    },
    duration_ms: 520000,
    preview_url: null,
    uri: 'spotify:track:demo-15',
  },
  {
    id: 'demo-16',
    name: 'Back in Black',
    artists: [{ id: 'a15', name: 'AC/DC' }],
    album: {
      id: 'al16',
      name: 'Back in Black',
      images: [
        { url: 'https://images.pexels.com/photos/1010519/pexels-photo-1010519.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1010519/pexels-photo-1010519.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1980-07-25',
    },
    duration_ms: 255000,
    preview_url: null,
    uri: 'spotify:track:demo-16',
  },
  {
    id: 'demo-17',
    name: 'Girls Just Want to Have Fun',
    artists: [{ id: 'a16', name: 'Cyndi Lauper' }],
    album: {
      id: 'al17',
      name: "She's So Unusual",
      images: [
        { url: 'https://images.pexels.com/photos/1864637/pexels-photo-1864637.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1864637/pexels-photo-1864637.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1983-10-14',
    },
    duration_ms: 237000,
    preview_url: null,
    uri: 'spotify:track:demo-17',
  },
  {
    id: 'demo-18',
    name: 'Money for Nothing',
    artists: [{ id: 'a17', name: 'Dire Straits' }],
    album: {
      id: 'al18',
      name: 'Brothers in Arms',
      images: [
        { url: 'https://images.pexels.com/photos/1389428/pexels-photo-1389428.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1389428/pexels-photo-1389428.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1985-05-13',
    },
    duration_ms: 495000,
    preview_url: null,
    uri: 'spotify:track:demo-18',
  },
  {
    id: 'demo-19',
    name: "Summer of '69",
    artists: [{ id: 'a18', name: 'Bryan Adams' }],
    album: {
      id: 'al19',
      name: 'Reckless',
      images: [
        { url: 'https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1984-11-05',
    },
    duration_ms: 213000,
    preview_url: null,
    uri: 'spotify:track:demo-19',
  },
  {
    id: 'demo-20',
    name: 'With or Without You',
    artists: [{ id: 'a19', name: 'U2' }],
    album: {
      id: 'al20',
      name: 'The Joshua Tree',
      images: [
        { url: 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1987-03-09',
    },
    duration_ms: 296000,
    preview_url: null,
    uri: 'spotify:track:demo-20',
  },
  {
    id: 'demo-21',
    name: "Don't Stop Believin'",
    artists: [{ id: 'a20', name: 'Journey' }],
    album: {
      id: 'al21',
      name: 'Escape',
      images: [
        { url: 'https://images.pexels.com/photos/1493112/pexels-photo-1493112.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1493112/pexels-photo-1493112.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1981-07-17',
    },
    duration_ms: 251000,
    preview_url: null,
    uri: 'spotify:track:demo-21',
  },
  {
    id: 'demo-22',
    name: 'Separate Ways (Worlds Apart)',
    artists: [{ id: 'a20', name: 'Journey' }],
    album: {
      id: 'al22',
      name: 'Frontiers',
      images: [
        { url: 'https://images.pexels.com/photos/1493112/pexels-photo-1493112.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1493112/pexels-photo-1493112.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1983-02-01',
    },
    duration_ms: 325000,
    preview_url: null,
    uri: 'spotify:track:demo-22',
  },
  {
    id: 'demo-23',
    name: 'Open Arms',
    artists: [{ id: 'a20', name: 'Journey' }],
    album: {
      id: 'al21',
      name: 'Escape',
      images: [
        { url: 'https://images.pexels.com/photos/1493112/pexels-photo-1493112.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1493112/pexels-photo-1493112.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1981-07-17',
    },
    duration_ms: 211000,
    preview_url: null,
    uri: 'spotify:track:demo-23',
  },
  {
    id: 'demo-24',
    name: 'Give to Live',
    artists: [{ id: 'a21', name: 'Sammy Hagar' }],
    album: {
      id: 'al24',
      name: "I Never Said Goodbye",
      images: [
        { url: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1987-06-15',
    },
    duration_ms: 275000,
    preview_url: null,
    uri: 'spotify:track:demo-24',
  },
  {
    id: 'demo-25',
    name: "I Can't Drive 55",
    artists: [{ id: 'a21', name: 'Sammy Hagar' }],
    album: {
      id: 'al25',
      name: 'VOA',
      images: [
        { url: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1984-07-09',
    },
    duration_ms: 229000,
    preview_url: null,
    uri: 'spotify:track:demo-25',
  },
  {
    id: 'demo-26',
    name: 'Suzanne',
    artists: [{ id: 'a20', name: 'Journey' }],
    album: {
      id: 'al22',
      name: 'Frontiers',
      images: [
        { url: 'https://images.pexels.com/photos/1493112/pexels-photo-1493112.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1493112/pexels-photo-1493112.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1983-02-01',
    },
    duration_ms: 239000,
    preview_url: null,
    uri: 'spotify:track:demo-26',
  },
  {
    id: 'demo-27',
    name: 'Faithfully',
    artists: [{ id: 'a20', name: 'Journey' }],
    album: {
      id: 'al22',
      name: 'Frontiers',
      images: [
        { url: 'https://images.pexels.com/photos/1493112/pexels-photo-1493112.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1493112/pexels-photo-1493112.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1983-02-01',
    },
    duration_ms: 267000,
    preview_url: null,
    uri: 'spotify:track:demo-27',
  },
  {
    id: 'demo-28',
    name: "Lovin', Touchin', Squeezin'",
    artists: [{ id: 'a20', name: 'Journey' }],
    album: {
      id: 'al28',
      name: 'Evolution',
      images: [
        { url: 'https://images.pexels.com/photos/1493112/pexels-photo-1493112.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1493112/pexels-photo-1493112.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1979-03-23',
    },
    duration_ms: 228000,
    preview_url: null,
    uri: 'spotify:track:demo-28',
  },
  {
    id: 'demo-29',
    name: 'Any Way You Want It',
    artists: [{ id: 'a20', name: 'Journey' }],
    album: {
      id: 'al29',
      name: 'Departure',
      images: [
        { url: 'https://images.pexels.com/photos/1493112/pexels-photo-1493112.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1493112/pexels-photo-1493112.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1980-03-01',
    },
    duration_ms: 200000,
    preview_url: null,
    uri: 'spotify:track:demo-29',
  },
  {
    id: 'demo-30',
    name: 'Wheel in the Sky',
    artists: [{ id: 'a20', name: 'Journey' }],
    album: {
      id: 'al30',
      name: 'Infinity',
      images: [
        { url: 'https://images.pexels.com/photos/1493112/pexels-photo-1493112.jpeg?auto=compress&cs=tinysrgb&w=300', width: 300, height: 300 },
        { url: 'https://images.pexels.com/photos/1493112/pexels-photo-1493112.jpeg?auto=compress&cs=tinysrgb&w=64', width: 64, height: 64 },
      ],
      release_date: '1978-01-01',
    },
    duration_ms: 248000,
    preview_url: null,
    uri: 'spotify:track:demo-30',
  },
];

export const DEMO_USER = {
  id: 'demo-user-123',
  display_name: 'Demo User',
  email: 'demo@mixtapedigitizer.com',
};

const STOP_WORDS = new Set(['a', 'an', 'the', 'to', 'of', 'in', 'on', 'for', 'with', 'and', 'or', 'is', 'it', 'my', 'your', 'i', 'you', 'me', 'we']);

function normalizeForMatch(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function getSignificantWords(text: string): string[] {
  return normalizeForMatch(text)
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function calculateMatchScore(inputTitle: string, inputArtist: string, track: SpotifyTrack): number {
  const inputTitleNorm = normalizeForMatch(inputTitle);
  const inputArtistNorm = normalizeForMatch(inputArtist);
  const trackTitleNorm = normalizeForMatch(track.name);
  const trackArtistNorm = normalizeForMatch(track.artists[0].name);

  if (trackTitleNorm === inputTitleNorm) {
    return 1.0;
  }

  if (inputArtistNorm && trackArtistNorm === inputArtistNorm && trackTitleNorm === inputTitleNorm) {
    return 1.0;
  }

  const inputTitleWords = getSignificantWords(inputTitle);
  const trackTitleWords = getSignificantWords(track.name);

  if (inputTitleWords.length === 0 || trackTitleWords.length === 0) {
    return 0;
  }

  const matchingTitleWords = inputTitleWords.filter(w =>
    trackTitleWords.some(tw => tw === w || tw.includes(w) || w.includes(tw))
  );

  const titleMatchRatio = matchingTitleWords.length / Math.max(inputTitleWords.length, trackTitleWords.length);

  let artistBonus = 0;
  if (inputArtistNorm && trackArtistNorm) {
    if (trackArtistNorm.includes(inputArtistNorm) || inputArtistNorm.includes(trackArtistNorm)) {
      artistBonus = 0.3;
    }
  }

  return Math.min(titleMatchRatio * 0.7 + artistBonus, 1.0);
}

export function findDemoTrack(title: string, artist: string): SpotifyTrack | null {
  const inputTitleNorm = normalizeForMatch(title);
  const inputArtistNorm = normalizeForMatch(artist);

  for (const track of DEMO_SONGS) {
    const trackTitleNorm = normalizeForMatch(track.name);
    const trackArtistNorm = normalizeForMatch(track.artists[0].name);

    if (trackTitleNorm === inputTitleNorm) {
      return track;
    }

    if (inputArtistNorm && trackArtistNorm.includes(inputArtistNorm)) {
      if (trackTitleNorm.includes(inputTitleNorm) || inputTitleNorm.includes(trackTitleNorm)) {
        return track;
      }
    }
  }

  let bestMatch: SpotifyTrack | null = null;
  let bestScore = 0;

  for (const track of DEMO_SONGS) {
    const score = calculateMatchScore(title, artist, track);
    if (score > bestScore && score >= 0.6) {
      bestScore = score;
      bestMatch = track;
    }
  }

  return bestMatch;
}

export function searchDemoTracks(query: string): SpotifyTrack[] {
  const queryWords = getSignificantWords(query);

  if (queryWords.length === 0) {
    return [];
  }

  const results: { track: SpotifyTrack; score: number }[] = [];

  for (const track of DEMO_SONGS) {
    const trackTitleWords = getSignificantWords(track.name);
    const trackArtistWords = getSignificantWords(track.artists[0].name);
    const allTrackWords = [...trackTitleWords, ...trackArtistWords];

    const matchingWords = queryWords.filter(qw =>
      allTrackWords.some(tw => tw === qw || tw.includes(qw) || qw.includes(tw))
    );

    if (matchingWords.length > 0) {
      const score = matchingWords.length / queryWords.length;
      results.push({ track, score });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(r => r.track);
}
