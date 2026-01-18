import { OcrLine } from './ocr';

export interface ParsedSong {
  extractedText: string;
  title: string;
  artist: string;
  duration: string | null;
  side: 'A' | 'B';
  trackNumber: number;
  confidence: number;
}

const ARTIST_ABBREVIATIONS: Record<string, string> = {
  'b. springsteen': 'Bruce Springsteen',
  'springsteen': 'Bruce Springsteen',
  'b. joel': 'Billy Joel',
  'billy j': 'Billy Joel',
  'e. john': 'Elton John',
  'elton j': 'Elton John',
  'p. collins': 'Phil Collins',
  'phil c': 'Phil Collins',
  'g n r': "Guns N' Roses",
  'gnr': "Guns N' Roses",
  'guns n roses': "Guns N' Roses",
  'def lep': 'Def Leppard',
  'def lepp': 'Def Leppard',
  'd.l.': 'Def Leppard',
  'dl': 'Def Leppard',
  'd l': 'Def Leppard',
  'd. l': 'Def Leppard',
  'd. l.': 'Def Leppard',
  'bon j': 'Bon Jovi',
  'b. jovi': 'Bon Jovi',
  'v. halen': 'Van Halen',
  'van h': 'Van Halen',
  'j. mellencamp': 'John Mellencamp',
  'mellencamp': 'John Mellencamp',
  'j. cougar': 'John Mellencamp',
  'cougar': 'John Mellencamp',
  'r.e.m.': 'R.E.M.',
  'rem': 'R.E.M.',
  'u2': 'U2',
  'inxs': 'INXS',
  'ac/dc': 'AC/DC',
  'acdc': 'AC/DC',
  'zz top': 'ZZ Top',
  'zztop': 'ZZ Top',
  'j. jackson': 'Janet Jackson',
  'm. jackson': 'Michael Jackson',
  'mj': 'Michael Jackson',
  'm jackson': 'Michael Jackson',
  'prince': 'Prince',
  'madonna': 'Madonna',
  'whitney': 'Whitney Houston',
  'w. houston': 'Whitney Houston',
  'c. lauper': 'Cyndi Lauper',
  'cyndi l': 'Cyndi Lauper',
  'p. benatar': 'Pat Benatar',
  'pat b': 'Pat Benatar',
  'h. lewis': 'Huey Lewis',
  'huey l': 'Huey Lewis',
  'hall & oates': 'Hall & Oates',
  'h&o': 'Hall & Oates',
  'tears': 'Tears for Fears',
  't4f': 'Tears for Fears',
  'duran': 'Duran Duran',
  'duran duran': 'Duran Duran',
  'd. duran': 'Duran Duran',
  'pet shop': 'Pet Shop Boys',
  'psb': 'Pet Shop Boys',
  'depeche': 'Depeche Mode',
  'd. mode': 'Depeche Mode',
  'the cure': 'The Cure',
  'cure': 'The Cure',
  'new order': 'New Order',
  'a-ha': 'a-ha',
  'aha': 'a-ha',
  'wham': 'Wham!',
  'g. michael': 'George Michael',
  'george m': 'George Michael',
  'foreigner': 'Foreigner',
  'journey': 'Journey',
  'boston': 'Boston',
  'styx': 'Styx',
  'toto': 'Toto',
  'chicago': 'Chicago',
  'eddie money': 'Eddie Money',
  'eddy money': 'Eddie Money',
  'eddit money': 'Eddie Money',
  'e money': 'Eddie Money',
  'e. money': 'Eddie Money',
  'dj jazzy jeff': 'DJ Jazzy Jeff',
  'd.j. jazzy jeff': 'DJ Jazzy Jeff',
  'd j jazzy jeff': 'DJ Jazzy Jeff',
  'jazzy jeff': 'DJ Jazzy Jeff',
  'steve winwood': 'Steve Winwood',
  'steve windwood': 'Steve Winwood',
  's. winwood': 'Steve Winwood',
  's. windwood': 'Steve Winwood',
  'steve w': 'Steve Winwood',
  'winwood': 'Steve Winwood',
  'windwood': 'Steve Winwood',
  'fleetwood': 'Fleetwood Mac',
  'f. mac': 'Fleetwood Mac',
  'eagles': 'Eagles',
  'the eagles': 'Eagles',
  's. nicks': 'Stevie Nicks',
  'stevie n': 'Stevie Nicks',
  'beatles': 'The Beatles',
  'the beatles': 'The Beatles',
  'stones': 'The Rolling Stones',
  'rolling stones': 'The Rolling Stones',
  'led zep': 'Led Zeppelin',
  'zeppelin': 'Led Zeppelin',
  'pink floyd': 'Pink Floyd',
  'floyd': 'Pink Floyd',
  'the who': 'The Who',
  'queen': 'Queen',
  'bowie': 'David Bowie',
  'd. bowie': 'David Bowie',
  's. hagar': 'Sammy Hagar',
  'sammy h': 'Sammy Hagar',
  's hagar': 'Sammy Hagar',
  'sammy haggar': 'Sammy Hagar',
  'hagar': 'Sammy Hagar',
  'r. stewart': 'Rod Stewart',
  'rod s': 'Rod Stewart',
  'e. clapton': 'Eric Clapton',
  'clapton': 'Eric Clapton',
  's. wonder': 'Stevie Wonder',
  'stevie w': 'Stevie Wonder',
  'l. richie': 'Lionel Richie',
  'lionel r': 'Lionel Richie',
  'r. marx': 'Richard Marx',
  'richard m': 'Richard Marx',
};

const COMMON_OCR_CORRECTIONS: Record<string, string> = {
  'greevy': 'groovy',
  'grevy': 'groovy',
  'grovy': 'groovy',
  'groovey': 'groovy',
  'loue': 'love',
  'luve': 'love',
  'luv': 'love',
  'kmd': 'kind',
  'klnd': 'kind',
  'livln': 'livin',
  'livin\'': "livin'",
  'prayor': 'prayer',
  'prayar': 'prayer',
  'sweot': 'sweet',
  'sweat': 'sweet',
  'summar': 'summer',
  'summor': 'summer',
  'dreamin': "dreamin'",
  'dancin': "dancin'",
  'walkin': "walkin'",
  'talkin': "talkin'",
  'rockin': "rockin'",
  'runnin': "runnin'",
  'tme': 'time',
  'tlme': 'time',
  'firn': 'fire',
  'firo': 'fire',
  'eyos': 'eyes',
  'eyas': 'eyes',
  'heort': 'heart',
  'hoart': 'heart',
  'nlght': 'night',
  'nite': 'night',
  'donl': "don't",
  'dont': "don't",
  'wont': "won't",
  'cant': "can't",
  'youre': "you're",
  'im': "i'm",
  'havn': "havin'",
  'babie': 'baby',
  'beby': 'baby',
  'babe': 'baby',
  'glrl': 'girl',
  'glri': 'girl',
  'mony': 'money',
  'monay': 'money',
  'paradiso': 'paradise',
  'paradice': 'paradise',
  'heven': 'heaven',
  'heavan': 'heaven',
  'anqel': 'angel',
  'anglel': 'angel',
  'hungr': 'hungry',
  'toqether': 'together',
  'togather': 'together',
  'forover': 'forever',
  'forevar': 'forever',
  'nover': 'never',
  'nevar': 'never',
  'alweys': 'always',
  'allways': 'always',
  'seperato': 'separate',
  'seperate': 'separate',
  'believn': "believin'",
  'believen': "believin'",
  'africa': 'africa',
  'afrlca': 'africa',
};

const KNOWN_SONG_TITLES: Record<string, string> = {
  'groovy kind of love': 'Groovy Kind of Love',
  'greevy kind of love': 'Groovy Kind of Love',
  'give to live': 'Give to Live',
  'livin on a prayer': "Livin' on a Prayer",
  'living on a prayer': "Livin' on a Prayer",
  'dont stop believin': "Don't Stop Believin'",
  'dont stop believing': "Don't Stop Believin'",
  'sweet child of mine': "Sweet Child O' Mine",
  'sweet child o mine': "Sweet Child O' Mine",
  'pour some sugar on me': 'Pour Some Sugar on Me',
  'pour some sugar': 'Pour Some Sugar on Me',
  'pour sugar on me': 'Pour Some Sugar on Me',
  'here i go again': 'Here I Go Again',
  'here i go': 'Here I Go Again',
  'is this love': 'Is This Love',
  'every rose has its thorn': 'Every Rose Has Its Thorn',
  'love bites': 'Love Bites',
  'heaven': 'Heaven',
  'wanted dead or alive': 'Wanted Dead or Alive',
  'youve got another thing coming': "You've Got Another Thing Comin'",
  'run to you': 'Run to You',
  'summer of 69': "Summer of '69",
  'somebody to love': 'Somebody to Love',
  'africa': 'Africa',
  'hold the line': 'Hold the Line',
  'rosanna': 'Rosanna',
  'open arms': 'Open Arms',
  'separate ways': 'Separate Ways',
  'faithfully': 'Faithfully',
  'in the air tonight': 'In the Air Tonight',
  'against all odds': 'Against All Odds',
  'one more night': 'One More Night',
  'easy lover': 'Easy Lover',
  'sussudio': 'Sussudio',
  'take me home tonight': 'Take Me Home Tonight',
  'take on me': 'Take on Me',
  'the final countdown': 'The Final Countdown',
  'eye of the tiger': 'Eye of the Tiger',
  'burning heart': 'Burning Heart',
  'jump': 'Jump',
  'panama': 'Panama',
  'hot for teacher': 'Hot for Teacher',
  'you really got me': 'You Really Got Me',
  'shakin': "Shakin'",
  'shaking': "Shakin'",
  'two tickets to paradise': 'Two Tickets to Paradise',
  'baby hold on': 'Baby Hold On',
  'remember the feeling': 'Remember the Feeling',
  'lets get busy baby': "Let's Get Busy Baby",
  'lets get busy': "Let's Get Busy Baby",
  'summertime': 'Summertime',
  'parents just dont understand': "Parents Just Don't Understand",
  'hard to say im sorry': "Hard to Say I'm Sorry",
  'youre the inspiration': "You're the Inspiration",
};

const SONG_TO_ARTIST: Record<string, string> = {
  'pour some sugar on me': 'Def Leppard',
  'pour some sugar': 'Def Leppard',
  'love bites': 'Def Leppard',
  'photograph': 'Def Leppard',
  'hysteria': 'Def Leppard',
  'animal': 'Def Leppard',
  'rock of ages': 'Def Leppard',
  'armageddon it': 'Def Leppard',
  'groovy kind of love': 'Phil Collins',
  'in the air tonight': 'Phil Collins',
  'against all odds': 'Phil Collins',
  'one more night': 'Phil Collins',
  'sussudio': 'Phil Collins',
  'easy lover': 'Phil Collins',
  "livin' on a prayer": 'Bon Jovi',
  'wanted dead or alive': 'Bon Jovi',
  'you give love a bad name': 'Bon Jovi',
  'bad medicine': 'Bon Jovi',
  "don't stop believin'": 'Journey',
  'open arms': 'Journey',
  'separate ways': 'Journey',
  'faithfully': 'Journey',
  "sweet child o' mine": "Guns N' Roses",
  'welcome to the jungle': "Guns N' Roses",
  'paradise city': "Guns N' Roses",
  'patience': "Guns N' Roses",
  'every rose has its thorn': 'Poison',
  'nothin but a good time': 'Poison',
  'talk dirty to me': 'Poison',
  'here i go again': 'Whitesnake',
  'is this love': 'Whitesnake',
  'jump': 'Van Halen',
  'panama': 'Van Halen',
  'hot for teacher': 'Van Halen',
  'you really got me': 'Van Halen',
  'africa': 'Toto',
  'rosanna': 'Toto',
  'hold the line': 'Toto',
  'eye of the tiger': 'Survivor',
  'burning heart': 'Survivor',
  'the final countdown': 'Europe',
  'take on me': 'a-ha',
  'take me home tonight': 'Eddie Money',
  'shakin': 'Eddie Money',
  "shakin'": 'Eddie Money',
  'two tickets to paradise': 'Eddie Money',
  'baby hold on': 'Eddie Money',
  'think im in love': 'Eddie Money',
  'remember the feeling': 'Chicago',
  'hard to say im sorry': 'Chicago',
  'youre the inspiration': 'Chicago',
  'look away': 'Chicago',
  'if you leave me now': 'Chicago',
  '25 or 6 to 4': 'Chicago',
  'saturday in the park': 'Chicago',
  'summertime': 'DJ Jazzy Jeff',
  'parents just dont understand': 'DJ Jazzy Jeff',
  'lets get busy baby': 'DJ Jazzy Jeff',
  'boom shake the room': 'DJ Jazzy Jeff',
  'higher love': 'Steve Winwood',
  'while you see a chance': 'Steve Winwood',
  'roll with it': 'Steve Winwood',
  'back in the high life': 'Steve Winwood',
  'valerie': 'Steve Winwood',
  'the finer things': 'Steve Winwood',
  'night can do': 'Steve Winwood',
  "summer of '69": 'Bryan Adams',
  'run to you': 'Bryan Adams',
  'heaven': 'Bryan Adams',
  'give to live': 'Sammy Hagar',
  'i cant drive 55': 'Sammy Hagar',
  'dreams': 'Van Halen',
  'why cant this be love': 'Van Halen',
};

const ARTIST_TO_SONGS: Record<string, string[]> = {
  'Def Leppard': ['Pour Some Sugar on Me', 'Love Bites', 'Photograph', 'Hysteria', 'Animal', 'Rock of Ages', 'Armageddon It', 'Foolin', 'Bringin On the Heartbreak'],
  'Phil Collins': ['Groovy Kind of Love', 'In the Air Tonight', 'Against All Odds', 'One More Night', 'Sussudio', 'Easy Lover', 'Another Day in Paradise'],
  'Bon Jovi': ["Livin' on a Prayer", 'Wanted Dead or Alive', 'You Give Love a Bad Name', 'Bad Medicine', 'Runaway', 'Never Say Goodbye', "It's My Life"],
  'Journey': ["Don't Stop Believin'", 'Open Arms', 'Separate Ways', 'Faithfully', 'Any Way You Want It', 'Wheel in the Sky', 'Lights'],
  "Guns N' Roses": ["Sweet Child O' Mine", 'Welcome to the Jungle', 'Paradise City', 'Patience', "November Rain", 'Knockin on Heaven\'s Door'],
  'Poison': ['Every Rose Has Its Thorn', "Nothin' But a Good Time", 'Talk Dirty to Me', 'Unskinny Bop', 'Something to Believe In'],
  'Whitesnake': ['Here I Go Again', 'Is This Love', 'Still of the Night', 'Fool for Your Loving'],
  'Van Halen': ['Jump', 'Panama', 'Hot for Teacher', 'You Really Got Me', 'Dreams', 'Why Cant This Be Love', 'Runnin with the Devil', 'Aint Talkin Bout Love'],
  'Toto': ['Africa', 'Rosanna', 'Hold the Line', 'I Wont Hold You Back'],
  'Survivor': ['Eye of the Tiger', 'Burning Heart', 'High on You', 'The Search Is Over'],
  'Europe': ['The Final Countdown', 'Carrie', 'Rock the Night'],
  'a-ha': ['Take on Me', 'The Sun Always Shines on TV', 'Hunting High and Low'],
  'Eddie Money': ['Take Me Home Tonight', 'Two Tickets to Paradise', 'Baby Hold On', "Shakin'", 'Think Im in Love', 'Walk on Water', 'I Wanna Go Back', 'Maybe Im a Fool'],
  'Bryan Adams': ["Summer of '69", 'Run to You', 'Heaven', 'Cuts Like a Knife', 'Everything I Do'],
  'Sammy Hagar': ['Give to Live', "I Can't Drive 55", 'Your Love Is Driving Me Crazy'],
  'Bruce Springsteen': ['Born in the USA', 'Dancing in the Dark', 'Glory Days', 'Born to Run', 'Thunder Road', 'Hungry Heart'],
  'Billy Joel': ['Piano Man', 'Uptown Girl', 'We Didnt Start the Fire', 'Just the Way You Are', 'New York State of Mind'],
  'Elton John': ['Rocket Man', 'Tiny Dancer', 'Crocodile Rock', 'Your Song', 'Bennie and the Jets', "I'm Still Standing"],
  'Michael Jackson': ['Billie Jean', 'Beat It', 'Thriller', 'Bad', 'Smooth Criminal', 'The Way You Make Me Feel', 'Black or White'],
  'Prince': ['Purple Rain', 'When Doves Cry', 'Kiss', '1999', 'Little Red Corvette', 'Lets Go Crazy'],
  'Madonna': ['Like a Virgin', 'Material Girl', 'Like a Prayer', 'Vogue', 'Papa Dont Preach', 'Express Yourself'],
  'Whitney Houston': ['I Wanna Dance with Somebody', 'Greatest Love of All', 'How Will I Know', 'I Will Always Love You'],
  'U2': ['With or Without You', 'Where the Streets Have No Name', 'Sunday Bloody Sunday', 'Pride', 'Beautiful Day', 'One'],
  'R.E.M.': ['Losing My Religion', 'Everybody Hurts', 'Man on the Moon', 'Its the End of the World', 'Shiny Happy People'],
  'INXS': ['Need You Tonight', 'Never Tear Us Apart', 'New Sensation', 'Devil Inside', 'What You Need'],
  'AC/DC': ['Back in Black', 'Highway to Hell', 'Thunderstruck', 'You Shook Me All Night Long', 'TNT', 'For Those About to Rock'],
  'ZZ Top': ['Sharp Dressed Man', 'Legs', 'La Grange', 'Tush', 'Gimme All Your Lovin'],
  'Foreigner': ['I Want to Know What Love Is', 'Waiting for a Girl Like You', 'Cold as Ice', 'Hot Blooded', 'Juke Box Hero'],
  'REO Speedwagon': ['Keep On Loving You', 'Cant Fight This Feeling', 'Take It on the Run', 'Roll with the Changes'],
  'Styx': ['Come Sail Away', 'Mr. Roboto', 'Renegade', 'Babe', 'Too Much Time on My Hands'],
  'Boston': ['More Than a Feeling', 'Peace of Mind', 'Foreplay/Long Time', "Don't Look Back", 'Amanda'],
  'Heart': ['Alone', 'Barracuda', 'What About Love', 'These Dreams', 'Magic Man', 'Crazy on You'],
  'Pat Benatar': ['Hit Me with Your Best Shot', 'Love Is a Battlefield', 'Heartbreaker', 'We Belong', 'Invincible'],
  'Cyndi Lauper': ['Girls Just Want to Have Fun', 'Time After Time', 'True Colors', 'She Bop'],
  'Huey Lewis': ['The Power of Love', 'Hip to Be Square', 'I Want a New Drug', 'Heart of Rock and Roll', 'Stuck with You'],
  'Hall and Oates': ['Maneater', 'I Cant Go for That', 'Kiss on My List', 'Private Eyes', 'Out of Touch', 'Rich Girl'],
  'The Police': ['Every Breath You Take', 'Roxanne', 'Message in a Bottle', 'Every Little Thing She Does Is Magic', 'King of Pain'],
  'Duran Duran': ['Hungry Like the Wolf', 'Rio', 'The Reflex', 'Save a Prayer', 'Ordinary World', 'Come Undone'],
  'Tears for Fears': ['Everybody Wants to Rule the World', 'Shout', 'Head Over Heels', 'Mad World', 'Sowing the Seeds of Love'],
  'Depeche Mode': ['Personal Jesus', 'Enjoy the Silence', 'Just Cant Get Enough', 'Policy of Truth', 'People Are People'],
  'The Cure': ['Friday Im in Love', 'Just Like Heaven', 'Lovesong', 'Boys Dont Cry', 'Pictures of You'],
  'Pet Shop Boys': ['West End Girls', 'Its a Sin', 'Always on My Mind', 'What Have I Done to Deserve This'],
  'George Michael': ['Faith', 'Father Figure', 'One More Try', 'Freedom 90', 'Careless Whisper', 'I Want Your Sex'],
  'Chicago': ['Remember the Feeling', 'Hard to Say Im Sorry', 'Youre the Inspiration', 'Look Away', 'If You Leave Me Now', '25 or 6 to 4', 'Saturday in the Park'],
  'DJ Jazzy Jeff': ["Summertime", "Boom! Shake the Room", "Parents Just Don't Understand", "Brand New Funk", "Lets Get Busy Baby"],
  'DJ Jazzy Jeff & The Fresh Prince': ["Summertime", "Boom! Shake the Room", "Parents Just Don't Understand", "Brand New Funk"],
  'Steve Winwood': ['Higher Love', 'While You See a Chance', 'Roll with It', 'Back in the High Life Again', 'Valerie', 'The Finer Things', 'Freedom Overspill', 'Night Can Do'],
  'Dire Straits': ['Money for Nothing', 'Sultans of Swing', 'Walk of Life', 'Romeo and Juliet', 'So Far Away'],
  'Genesis': ['Invisible Touch', 'Land of Confusion', 'Tonight Tonight Tonight', 'Thats All', 'In Too Deep'],
  'Peter Gabriel': ['Sledgehammer', 'In Your Eyes', 'Big Time', 'Shock the Monkey', 'Solsbury Hill'],
  'Simple Minds': ['Dont You Forget About Me', 'Alive and Kicking', 'Sanctify Yourself'],
  'The Human League': ['Dont You Want Me', 'Human', 'Mirror Man'],
  'Soft Cell': ['Tainted Love', 'Sex Dwarf'],
  'Erasure': ['A Little Respect', 'Chains of Love', 'Always'],
  'OMD': ['If You Leave', 'So in Love', 'Enola Gay'],
  'New Order': ['Blue Monday', 'Bizarre Love Triangle', 'True Faith'],
  'Echo and the Bunnymen': ['The Killing Moon', 'Lips Like Sugar', 'Bring On the Dancing Horses'],
  'Motley Crue': ['Girls Girls Girls', 'Home Sweet Home', 'Dr Feelgood', 'Kickstart My Heart', 'Smokin in the Boys Room'],
  'Ratt': ['Round and Round', 'Lay It Down', 'Way Cool Jr'],
  'Quiet Riot': ['Cum On Feel the Noize', 'Metal Health', 'Mama Weer All Crazee Now'],
  'Twisted Sister': ['Were Not Gonna Take It', 'I Wanna Rock'],
  'Scorpions': ['Rock You Like a Hurricane', 'Wind of Change', 'No One Like You', 'Still Loving You'],
  'Dokken': ['In My Dreams', 'Alone Again', 'Into the Fire'],
  'Cinderella': ['Nobody\'s Fool', 'Don\'t Know What You Got', 'Gypsy Road', 'Shelter Me'],
  'Warrant': ['Heaven', 'Cherry Pie', 'I Saw Red'],
  'Winger': ['Seventeen', 'Headed for a Heartbreak', 'Miles Away'],
  'Skid Row': ['18 and Life', 'I Remember You', 'Youth Gone Wild'],
  'Tesla': ['Love Song', 'Signs', 'What You Give'],
  'Great White': ['Once Bitten Twice Shy', 'Rock Me', 'Save Your Love'],
  'Lita Ford': ['Kiss Me Deadly', 'Close My Eyes Forever'],
  'Vixen': ['Edge of a Broken Heart', 'Cryin'],
};

function inferSongFromArtist(partialTitle: string, artist: string): string | null {
  const songs = ARTIST_TO_SONGS[artist];
  if (!songs) return null;

  const normalized = partialTitle.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  if (!normalized || normalized.length < 3) return null;

  for (const song of songs) {
    const songNorm = song.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    if (songNorm === normalized) return song;
    if (songNorm.includes(normalized) && normalized.length >= 5) return song;
    if (normalized.includes(songNorm) && songNorm.length >= 5) return song;
  }

  let bestMatch: { song: string; distance: number } | null = null;
  for (const song of songs) {
    const songNorm = song.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    if (Math.abs(normalized.length - songNorm.length) > 5) continue;

    const distance = levenshtein(normalized, songNorm);
    const threshold = Math.max(3, Math.floor(songNorm.length * 0.3));

    if (distance <= threshold) {
      if (!bestMatch || distance < bestMatch.distance) {
        bestMatch = { song, distance };
      }
    }
  }

  return bestMatch?.song || null;
}

function correctOcrErrors(text: string): string {
  let corrected = text;
  const words = text.toLowerCase().split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[.,!?;:'"]/g, '');
    if (COMMON_OCR_CORRECTIONS[word]) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      corrected = corrected.replace(regex, COMMON_OCR_CORRECTIONS[word]);
    }
  }

  return corrected;
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i - 1] === a[j - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

function matchKnownSongTitle(title: string): string {
  const normalized = title.toLowerCase().replace(/['']/g, "'").trim();

  if (KNOWN_SONG_TITLES[normalized]) {
    return KNOWN_SONG_TITLES[normalized];
  }

  const withoutPunctuation = normalized.replace(/[^a-z0-9\s]/g, '');

  for (const [key, value] of Object.entries(KNOWN_SONG_TITLES)) {
    const keyNormalized = key.replace(/[^a-z0-9\s]/g, '');
    if (withoutPunctuation === keyNormalized) {
      return value;
    }
  }

  for (const [key, value] of Object.entries(KNOWN_SONG_TITLES)) {
    const keyNormalized = key.replace(/[^a-z0-9\s]/g, '');
    if (withoutPunctuation.includes(keyNormalized) && keyNormalized.length >= 8) {
      return value;
    }
    if (keyNormalized.includes(withoutPunctuation) && withoutPunctuation.length >= 8) {
      return value;
    }
  }

  let bestMatch: { key: string; value: string; distance: number } | null = null;
  for (const [key, value] of Object.entries(KNOWN_SONG_TITLES)) {
    const keyNormalized = key.replace(/[^a-z0-9\s]/g, '');
    if (Math.abs(withoutPunctuation.length - keyNormalized.length) > 5) continue;

    const distance = levenshtein(withoutPunctuation, keyNormalized);
    const threshold = Math.max(3, Math.floor(keyNormalized.length * 0.25));

    if (distance <= threshold) {
      if (!bestMatch || distance < bestMatch.distance) {
        bestMatch = { key, value, distance };
      }
    }
  }

  if (bestMatch) {
    return bestMatch.value;
  }

  return title;
}

function inferArtistFromTitle(title: string): string | null {
  const normalized = title.toLowerCase().replace(/['']/g, "'").trim();

  if (SONG_TO_ARTIST[normalized]) {
    return SONG_TO_ARTIST[normalized];
  }

  const withoutPunctuation = normalized.replace(/[^a-z0-9\s]/g, '');

  for (const [key, value] of Object.entries(SONG_TO_ARTIST)) {
    const keyNormalized = key.replace(/[^a-z0-9\s]/g, '');
    if (withoutPunctuation === keyNormalized) {
      return value;
    }
  }

  for (const [key, value] of Object.entries(SONG_TO_ARTIST)) {
    const keyNormalized = key.replace(/[^a-z0-9\s]/g, '');
    if (withoutPunctuation.includes(keyNormalized) && keyNormalized.length >= 8) {
      return value;
    }
    if (keyNormalized.includes(withoutPunctuation) && withoutPunctuation.length >= 8) {
      return value;
    }
  }

  let bestMatch: { value: string; distance: number } | null = null;
  for (const [key, value] of Object.entries(SONG_TO_ARTIST)) {
    const keyNormalized = key.replace(/[^a-z0-9\s]/g, '');
    if (Math.abs(withoutPunctuation.length - keyNormalized.length) > 5) continue;

    const distance = levenshtein(withoutPunctuation, keyNormalized);
    const threshold = Math.max(3, Math.floor(keyNormalized.length * 0.25));

    if (distance <= threshold) {
      if (!bestMatch || distance < bestMatch.distance) {
        bestMatch = { value, distance };
      }
    }
  }

  if (bestMatch) {
    return bestMatch.value;
  }

  return null;
}

function normalizeForLookup(text: string): string {
  return text
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/['']/g, "'")
    .trim();
}

function expandArtistAbbreviation(artist: string): string {
  const normalized = normalizeForLookup(artist);

  if (ARTIST_ABBREVIATIONS[normalized]) {
    return ARTIST_ABBREVIATIONS[normalized];
  }

  for (const [key, value] of Object.entries(ARTIST_ABBREVIATIONS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      if (Math.abs(normalized.length - key.length) <= 2) {
        return value;
      }
    }
  }

  return artist;
}

function parseDuration(text: string): { duration: string | null; cleanedText: string } {
  const durationPatterns = [
    /\((\d{1,2}:\d{2})\)/,
    /\[(\d{1,2}:\d{2})\]/,
    /(\d{1,2}:\d{2})$/,
    /\s+(\d{1,2}'\d{2}")/,
  ];

  for (const pattern of durationPatterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        duration: match[1],
        cleanedText: text.replace(pattern, '').trim(),
      };
    }
  }

  return { duration: null, cleanedText: text };
}

function parseTrackNumber(text: string): { trackNumber: number | null; cleanedText: string } {
  const patterns = [
    /^(\d{1,2})\.\s*/,
    /^(\d{1,2})\)\s*/,
    /^(\d{1,2})\s*[-:]\s*/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        trackNumber: parseInt(match[1], 10),
        cleanedText: text.replace(pattern, '').trim(),
      };
    }
  }

  return { trackNumber: null, cleanedText: text };
}

function smartCorrectTitle(title: string, knownArtist?: string): string {
  let corrected = correctOcrErrors(title);

  if (knownArtist) {
    const fromArtist = inferSongFromArtist(corrected, knownArtist);
    if (fromArtist) {
      return fromArtist;
    }
  }

  corrected = matchKnownSongTitle(corrected);
  if (corrected === title) {
    corrected = correctOcrErrors(title);
  }
  return corrected;
}

function smartExpandArtist(rawArtist: string, title: string): string {
  const expanded = expandArtistAbbreviation(rawArtist.trim());

  if (expanded !== rawArtist.trim()) {
    return expanded;
  }

  const inferred = inferArtistFromTitle(title);
  if (inferred) {
    return inferred;
  }

  return expanded;
}

function findKnownArtist(text: string): string | null {
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const normalizedNoSpaces = normalized.replace(/\s+/g, '');

  for (const artist of Object.keys(ARTIST_TO_SONGS)) {
    const artistNorm = artist.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    if (artistNorm === normalized) return artist;
  }
  for (const artist of Object.values(ARTIST_ABBREVIATIONS)) {
    const artistNorm = artist.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    if (artistNorm === normalized) return artist;
  }
  for (const [abbr, fullName] of Object.entries(ARTIST_ABBREVIATIONS)) {
    const abbrNorm = abbr.replace(/[^a-z0-9\s]/g, '');
    if (abbrNorm === normalized || abbrNorm.replace(/\s+/g, '') === normalizedNoSpaces) {
      return fullName;
    }
  }
  return null;
}

function smartParseBidirectional(titlePart: string, artistPart: string): { title: string; artist: string } {
  const expandedArtist = expandArtistAbbreviation(artistPart.trim());
  const knownArtist = findKnownArtist(artistPart.trim());
  const finalArtist = knownArtist || (expandedArtist !== artistPart.trim() ? expandedArtist : null);

  if (finalArtist) {
    const correctedTitle = smartCorrectTitle(titlePart, finalArtist);
    return { title: correctedTitle, artist: finalArtist };
  }

  const correctedTitle = smartCorrectTitle(titlePart);
  const inferredArtist = inferArtistFromTitle(correctedTitle);

  if (inferredArtist) {
    const betterTitle = inferSongFromArtist(titlePart, inferredArtist);
    return {
      title: betterTitle || correctedTitle,
      artist: inferredArtist,
    };
  }

  return {
    title: correctedTitle,
    artist: expandedArtist,
  };
}

function detectLeadingArtist(text: string): { title: string; artist: string } | null {
  const words = text.split(/\s+/);
  for (let i = 1; i <= Math.min(4, words.length - 1); i++) {
    const potentialArtist = words.slice(0, i).join(' ');
    const expanded = expandArtistAbbreviation(potentialArtist);
    if (expanded !== potentialArtist) {
      const titleWords = words.slice(i);
      if (titleWords.length > 0) {
        return {
          title: titleWords.join(' '),
          artist: expanded,
        };
      }
    }
    const knownArtist = findKnownArtist(potentialArtist);
    if (knownArtist) {
      const titleWords = words.slice(i);
      if (titleWords.length > 0) {
        return {
          title: titleWords.join(' '),
          artist: knownArtist,
        };
      }
    }
  }
  return null;
}

function detectTrailingArtist(text: string): { title: string; artist: string } | null {
  const patterns = [
    /^(.+?)\s+([A-Z]\.?\s*[A-Z]\.?)$/,
    /^(.+?)\s+([A-Z][a-z]+\s+[A-Z]\.?)$/,
    /^(.+?)\s+([A-Z]\.\s*[A-Z]\.)$/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const possibleArtist = match[2].trim();
      const expanded = expandArtistAbbreviation(possibleArtist);
      if (expanded !== possibleArtist) {
        return {
          title: match[1].trim(),
          artist: expanded,
        };
      }
    }
  }

  const words = text.split(/\s+/);
  for (let i = words.length - 1; i >= Math.max(0, words.length - 4); i--) {
    const potentialArtist = words.slice(i).join(' ');
    const expanded = expandArtistAbbreviation(potentialArtist);
    if (expanded !== potentialArtist) {
      return {
        title: words.slice(0, i).join(' '),
        artist: expanded,
      };
    }
    const knownArtist = findKnownArtist(potentialArtist);
    if (knownArtist) {
      const titleWords = words.slice(0, i);
      if (titleWords.length > 0) {
        return {
          title: titleWords.join(' '),
          artist: knownArtist,
        };
      }
    }
  }

  return null;
}

function normalizeSeparators(text: string): string {
  return text
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-')
    .replace(/[~_\.]{2,}/g, '-')
    .replace(/\s*[·•]\s*/g, ' - ')
    .replace(/\s{2,}/g, ' ');
}

function isLikelyArtist(text: string): boolean {
  const normalized = normalizeForLookup(text);
  if (ARTIST_ABBREVIATIONS[normalized]) return true;
  for (const abbr of Object.keys(ARTIST_ABBREVIATIONS)) {
    if (normalized === abbr) return true;
  }
  for (const fullName of Object.values(ARTIST_ABBREVIATIONS)) {
    if (normalized === fullName.toLowerCase()) return true;
  }
  for (const artist of Object.keys(ARTIST_TO_SONGS)) {
    if (normalized === artist.toLowerCase()) return true;
    const artistNorm = artist.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const textNorm = normalized.replace(/[^a-z0-9\s]/g, '');
    if (artistNorm === textNorm) return true;
  }
  if (/^[A-Z]\.?\s*[A-Z]\.?$/.test(text.trim())) return true;
  return false;
}

function isLikelySong(text: string): boolean {
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  for (const key of Object.keys(KNOWN_SONG_TITLES)) {
    const keyNorm = key.replace(/[^a-z0-9\s]/g, '');
    if (normalized === keyNorm) return true;
    if (normalized.includes(keyNorm) && keyNorm.length >= 8) return true;
  }
  for (const key of Object.keys(SONG_TO_ARTIST)) {
    const keyNorm = key.replace(/[^a-z0-9\s]/g, '');
    if (normalized === keyNorm) return true;
    if (normalized.includes(keyNorm) && keyNorm.length >= 8) return true;
  }
  return false;
}

function parseSongAndArtist(text: string): { title: string; artist: string } {
  const normalized = normalizeSeparators(text);

  const separators = [
    /\s+-\s+/,
    /\s*[-]\s*/,
    /\s*[/:]\s*/,
    /\s+by\s+/i,
  ];

  for (const separator of separators) {
    const parts = normalized.split(separator);
    if (parts.length >= 2) {
      const [first, ...rest] = parts;
      const second = rest.join(' - ');

      const firstTrimmed = first.trim();
      const secondTrimmed = second.trim();

      if (!firstTrimmed || !secondTrimmed) continue;

      const firstIsArtist = isLikelyArtist(firstTrimmed);
      const secondIsArtist = isLikelyArtist(secondTrimmed);
      const firstIsSong = isLikelySong(firstTrimmed);
      const secondIsSong = isLikelySong(secondTrimmed);

      let titlePart: string;
      let artistPart: string;

      if (firstIsSong && !secondIsSong) {
        titlePart = firstTrimmed;
        artistPart = secondTrimmed;
      } else if (secondIsSong && !firstIsSong) {
        titlePart = secondTrimmed;
        artistPart = firstTrimmed;
      } else if (firstIsArtist && !secondIsArtist) {
        titlePart = secondTrimmed;
        artistPart = firstTrimmed;
      } else if (secondIsArtist && !firstIsArtist) {
        titlePart = firstTrimmed;
        artistPart = secondTrimmed;
      } else if (/^[A-Z]\.?\s*[A-Z]?\.?$/.test(firstTrimmed) || firstTrimmed.length < secondTrimmed.length) {
        titlePart = secondTrimmed;
        artistPart = firstTrimmed;
      } else {
        titlePart = firstTrimmed;
        artistPart = secondTrimmed;
      }

      return smartParseBidirectional(titlePart, artistPart);
    }
  }

  const trailingArtist = detectTrailingArtist(normalized);
  if (trailingArtist) {
    return smartParseBidirectional(trailingArtist.title, trailingArtist.artist);
  }

  const leadingArtist = detectLeadingArtist(normalized);
  if (leadingArtist) {
    return smartParseBidirectional(leadingArtist.title, leadingArtist.artist);
  }

  const title = smartCorrectTitle(normalized.trim());
  const inferred = inferArtistFromTitle(title);

  if (inferred) {
    const betterTitle = inferSongFromArtist(normalized.trim(), inferred);
    return { title: betterTitle || title, artist: inferred };
  }

  return { title, artist: '' };
}

function stripSongDuration(text: string): string {
  return text
    .replace(/\s*\(\s*\d{1,2}:\d{2}\s*\)\s*/g, ' ')
    .replace(/\s+\d{1,2}:\d{2}\s*$/g, '')
    .replace(/\s+\d{1,2}:\d{2}\s+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitWideSpanningLine(text: string): string[] {
  const cleanedText = stripSongDuration(text);

  const twoSongsPattern = /^(.+?[-–—·]\s*[A-Za-z][A-Za-z\s.']+?)([A-Z][a-z]+(?:\s+[A-Za-z]+)*\s*[-–—·]\s*[A-Za-z].+)$/;
  const twoSongsMatch = cleanedText.match(twoSongsPattern);
  if (twoSongsMatch) {
    const leftPart = twoSongsMatch[1].trim();
    const rightPart = twoSongsMatch[2].trim();
    if (leftPart.length > 5 && rightPart.length > 5 &&
        /[-–—·]/.test(leftPart) && /[-–—·]/.test(rightPart)) {
      return [leftPart, rightPart];
    }
  }

  const doubleSpaceMatch = cleanedText.match(/^(.+?[-–—·]\s*[A-Za-z][A-Za-z\s.']*?)\s{2,}(.+[-–—·].+)$/);
  if (doubleSpaceMatch) {
    const leftPart = doubleSpaceMatch[1].trim();
    const rightPart = doubleSpaceMatch[2].trim();
    if (leftPart.length > 5 && rightPart.length > 5) {
      return [leftPart, rightPart];
    }
  }

  const artistSeparatorPattern = /[-–—·]\s*([A-Z][a-z]*\.?\s*[A-Z]?[a-z]*\.?|[A-Z]{2,}|[A-Za-z]+)\s+([A-Z])/;
  const match = cleanedText.match(artistSeparatorPattern);

  if (match && match.index !== undefined) {
    const artistEndMatch = cleanedText.substring(match.index).match(/^[-–—·]\s*([A-Za-z][A-Za-z\s.]*?)(?:\s{2,}|\s+(?=[A-Z][a-z]))/);
    if (artistEndMatch) {
      const splitPoint = match.index + artistEndMatch[0].length;
      const leftPart = cleanedText.substring(0, splitPoint).trim();
      const rightPart = cleanedText.substring(splitPoint).trim();
      if (leftPart.length > 5 && rightPart.length > 5 &&
          /[-–—·]/.test(leftPart) && /[-–—·]/.test(rightPart)) {
        return [leftPart, rightPart];
      }
    }
  }

  return [cleanedText !== text ? [cleanedText] : [text]].flat();
}

function detectColumns(lines: OcrLine[]): { leftColumn: OcrLine[]; rightColumn: OcrLine[] } {
  if (lines.length === 0) {
    return { leftColumn: [], rightColumn: [] };
  }

  const preprocessedLines = lines.map(line => ({
    ...line,
    text: stripSongDuration(line.text),
  }));

  const maxRight = Math.max(...preprocessedLines.map(l => l.boundingBox.x + l.boundingBox.width));
  const avgWidth = preprocessedLines.reduce((sum, l) => sum + l.boundingBox.width, 0) / preprocessedLines.length;

  const expandedLines: OcrLine[] = [];

  for (const line of preprocessedLines) {
    const isWideSpanning = line.boundingBox.width > avgWidth * 1.5 ||
                           (line.boundingBox.x < maxRight * 0.2 &&
                            line.boundingBox.x + line.boundingBox.width > maxRight * 0.7);

    if (isWideSpanning) {
      const parts = splitWideSpanningLine(line.text);
      if (parts.length === 2) {
        const halfWidth = line.boundingBox.width / 2;
        expandedLines.push({
          text: parts[0],
          boundingBox: {
            x: line.boundingBox.x,
            y: line.boundingBox.y,
            width: halfWidth,
            height: line.boundingBox.height,
          },
          confidence: line.confidence,
        });
        expandedLines.push({
          text: parts[1],
          boundingBox: {
            x: line.boundingBox.x + halfWidth,
            y: line.boundingBox.y,
            width: halfWidth,
            height: line.boundingBox.height,
          },
          confidence: line.confidence,
        });
        continue;
      }
    }
    expandedLines.push(line);
  }

  const maxWidth = Math.max(...expandedLines.map(l => l.boundingBox.x + l.boundingBox.width));
  const midPoint = maxWidth / 2;

  const leftLines = expandedLines.filter(line => {
    const center = line.boundingBox.x + line.boundingBox.width / 2;
    return center < midPoint * 0.9;
  });

  const rightLines = expandedLines.filter(line => {
    const center = line.boundingBox.x + line.boundingBox.width / 2;
    return center > midPoint * 1.1;
  });

  if (leftLines.length > 2 && rightLines.length > 2) {
    const sortByY = (a: OcrLine, b: OcrLine) => a.boundingBox.y - b.boundingBox.y;
    return {
      leftColumn: leftLines.sort(sortByY),
      rightColumn: rightLines.sort(sortByY),
    };
  }

  return {
    leftColumn: expandedLines.sort((a, b) => a.boundingBox.y - b.boundingBox.y),
    rightColumn: [],
  };
}

const CASSETTE_TECHNICAL_TERMS = [
  /noise\s*reduction/i,
  /^eq\s*(high|low|normal)/i,
  /cro2/i,
  /chrome/i,
  /\d+\s*[μu]s/i,
  /type\s*(i|ii|iii|iv|\d)/i,
  /dolby/i,
  /bias/i,
  /metal/i,
  /normal\s*position/i,
  /high\s*position/i,
  /^side\s*[ab]/i,
  /^page\s*\d/i,
  /^\d{4}$/,
  /^(january|february|march|april|may|june|july|august|september|october|november|december)/i,
  /^[a-z]$/i,
  /^\d+$/,
  /^(tdk|maxell|sony|memorex|basf|scotch|fuji)\b/i,
  /^date$/i,
  /^n\.?r\.?$/i,
  /^o?\s*yes\s*o?\s*no$/i,
  /^oyes$/i,
  /^ono$/i,
  /^yes$/i,
  /^no$/i,
  /^\(?[\d:]+\)?$/,
];

const KNOWN_ARTISTS = Object.values(ARTIST_ABBREVIATIONS).map(a => a.toLowerCase());
Object.keys(ARTIST_ABBREVIATIONS).forEach(k => KNOWN_ARTISTS.push(k.toLowerCase()));

function isKnownArtist(text: string): boolean {
  const normalized = text.toLowerCase().trim();
  return KNOWN_ARTISTS.includes(normalized);
}

function isLikelySongEntry(text: string): boolean {
  const cleaned = text.trim();

  if (cleaned.length < 2) return false;

  for (const pattern of CASSETTE_TECHNICAL_TERMS) {
    if (pattern.test(cleaned)) return false;
  }

  const durationOnly = /^\(?\s*\d{1,2}[:\s]*\d{0,2}\s*\)?$/.test(cleaned);
  if (durationOnly) return false;

  const partialDuration = /^[(\d:\s)]+$/.test(cleaned);
  if (partialDuration) return false;

  return true;
}

function isPureArtistLine(text: string): boolean {
  const cleaned = text.trim();
  if (isKnownArtist(cleaned)) return true;
  if (/[-–—/:]/g.test(cleaned)) return false;
  const words = cleaned.split(/\s+/);
  if (words.length > 3) return false;
  return isKnownArtist(cleaned);
}

function isPureTitleLine(text: string): boolean {
  const cleaned = text.trim();
  if (/[-–—/:]/g.test(cleaned)) return false;
  if (isKnownArtist(cleaned)) return false;
  return true;
}

function combineConsecutiveLines(lines: OcrLine[]): OcrLine[] {
  const combined: OcrLine[] = [];
  let i = 0;

  while (i < lines.length) {
    const current = lines[i];
    const next = lines[i + 1];

    if (!isLikelySongEntry(current.text)) {
      i++;
      continue;
    }

    if (next && isLikelySongEntry(next.text)) {
      const currentHasSeparator = /[-–—/:]/g.test(current.text);
      const nextHasSeparator = /[-–—/:]/g.test(next.text);

      if (!currentHasSeparator && !nextHasSeparator) {
        const currentIsPureArtist = isPureArtistLine(current.text);
        const nextIsPureArtist = isPureArtistLine(next.text);
        const currentIsPureTitle = isPureTitleLine(current.text);
        const nextIsPureTitle = isPureTitleLine(next.text);

        if (currentIsPureTitle && nextIsPureArtist) {
          combined.push({
            text: `${current.text} - ${next.text}`,
            boundingBox: {
              x: Math.min(current.boundingBox.x, next.boundingBox.x),
              y: current.boundingBox.y,
              width: Math.max(current.boundingBox.width, next.boundingBox.width),
              height: current.boundingBox.height + next.boundingBox.height,
            },
            confidence: (current.confidence + next.confidence) / 2,
          });
          i += 2;
          continue;
        }

        if (currentIsPureArtist && nextIsPureTitle) {
          combined.push({
            text: `${next.text} - ${current.text}`,
            boundingBox: {
              x: Math.min(current.boundingBox.x, next.boundingBox.x),
              y: current.boundingBox.y,
              width: Math.max(current.boundingBox.width, next.boundingBox.width),
              height: current.boundingBox.height + next.boundingBox.height,
            },
            confidence: (current.confidence + next.confidence) / 2,
          });
          i += 2;
          continue;
        }
      }
    }

    combined.push(current);
    i++;
  }

  return combined;
}

export function parseOcrLines(
  lines: OcrLine[],
  defaultSide: 'A' | 'B' = 'A'
): ParsedSong[] {
  const { leftColumn, rightColumn } = detectColumns(lines);
  const songs: ParsedSong[] = [];

  let trackCounter = 1;

  const processColumn = (columnLines: OcrLine[], side: 'A' | 'B') => {
    const filteredLines = columnLines.filter(line => isLikelySongEntry(line.text));
    const combinedLines = combineConsecutiveLines(filteredLines);

    for (const line of combinedLines) {
      const { duration, cleanedText: textAfterDuration } = parseDuration(line.text);
      const { trackNumber, cleanedText: textAfterTrack } = parseTrackNumber(textAfterDuration);
      const { title, artist } = parseSongAndArtist(textAfterTrack);

      if (title) {
        songs.push({
          extractedText: line.text,
          title,
          artist,
          duration,
          side,
          trackNumber: trackNumber || trackCounter++,
          confidence: line.confidence,
        });
      }
    }
  };

  processColumn(leftColumn, defaultSide);

  if (rightColumn.length > 0) {
    processColumn(rightColumn, defaultSide);
  }

  return songs;
}

export function parseRawText(rawText: string, defaultSide: 'A' | 'B' = 'A'): ParsedSong[] {
  const rawLines = rawText.split('\n').filter(line => line.trim());
  const songs: ParsedSong[] = [];
  let trackCounter = 1;

  const ocrLines: OcrLine[] = rawLines
    .filter(text => isLikelySongEntry(text))
    .map((text, index) => ({
      text,
      boundingBox: { x: 0, y: index * 20, width: 100, height: 20 },
      confidence: 0.8,
    }));

  const combinedLines = combineConsecutiveLines(ocrLines);

  for (const line of combinedLines) {
    const { duration, cleanedText: textAfterDuration } = parseDuration(line.text);
    const { trackNumber, cleanedText: textAfterTrack } = parseTrackNumber(textAfterDuration);
    const { title, artist } = parseSongAndArtist(textAfterTrack);

    if (title) {
      songs.push({
        extractedText: line.text,
        title,
        artist,
        duration,
        side: defaultSide,
        trackNumber: trackNumber || trackCounter++,
        confidence: line.confidence,
      });
    }
  }

  return songs;
}
