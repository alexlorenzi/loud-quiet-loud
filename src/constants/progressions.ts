import type { ChordQuality } from '../types/music.js';

export interface ProgressionChord {
  degree: number;
  quality?: ChordQuality;
  romanNumeral: string;
}

export interface PresetProgression {
  id: string;
  name: string;
  genre: string;
  feel: string;
  pattern: ProgressionChord[];
  beatsPerChord: number;
  theoryContentId: string;
  examples: string[];
}

export const PRESET_PROGRESSIONS: PresetProgression[] = [
  {
    id: 'pop-I-V-vi-IV',
    name: 'I-V-vi-IV',
    genre: 'Pop/Rock',
    feel: 'Uplifting, anthemic',
    pattern: [
      { degree: 1, romanNumeral: 'I' },
      { degree: 5, romanNumeral: 'V' },
      { degree: 6, romanNumeral: 'vi' },
      { degree: 4, romanNumeral: 'IV' }
    ],
    beatsPerChord: 2,
    theoryContentId: 'pop-progression-1564',
    examples: ['Let It Be - The Beatles', 'Don\'t Stop Believin\' - Journey', 'Someone Like You - Adele']
  },
  {
    id: 'pop-I-IV-V',
    name: 'I-IV-V',
    genre: 'Pop/Rock',
    feel: 'Classic, upbeat',
    pattern: [
      { degree: 1, romanNumeral: 'I' },
      { degree: 4, romanNumeral: 'IV' },
      { degree: 5, romanNumeral: 'V' }
    ],
    beatsPerChord: 2,
    theoryContentId: 'pop-progression-145',
    examples: ['La Bamba - Ritchie Valens', 'Twist and Shout - The Beatles', 'Wild Thing - The Troggs']
  },
  {
    id: 'pop-vi-IV-I-V',
    name: 'vi-IV-I-V',
    genre: 'Pop/Rock',
    feel: 'Emotional, melancholic',
    pattern: [
      { degree: 6, romanNumeral: 'vi' },
      { degree: 4, romanNumeral: 'IV' },
      { degree: 1, romanNumeral: 'I' },
      { degree: 5, romanNumeral: 'V' }
    ],
    beatsPerChord: 2,
    theoryContentId: 'pop-progression-6415',
    examples: ['Grenade - Bruno Mars', 'Apologize - OneRepublic', 'Africa - Toto']
  },
  {
    id: 'pop-I-vi-IV-V',
    name: 'I-vi-IV-V',
    genre: 'Pop/Rock',
    feel: 'Classic doo-wop',
    pattern: [
      { degree: 1, romanNumeral: 'I' },
      { degree: 6, romanNumeral: 'vi' },
      { degree: 4, romanNumeral: 'IV' },
      { degree: 5, romanNumeral: 'V' }
    ],
    beatsPerChord: 2,
    theoryContentId: 'pop-progression-1645',
    examples: ['Stand By Me - Ben E. King', 'Every Breath You Take - The Police', 'Blue Moon - The Marcels']
  },
  {
    id: 'blues-12bar',
    name: '12-Bar Blues',
    genre: 'Blues',
    feel: 'Classic blues form',
    pattern: [
      { degree: 1, quality: '7', romanNumeral: 'I7' },
      { degree: 1, quality: '7', romanNumeral: 'I7' },
      { degree: 1, quality: '7', romanNumeral: 'I7' },
      { degree: 1, quality: '7', romanNumeral: 'I7' },
      { degree: 4, quality: '7', romanNumeral: 'IV7' },
      { degree: 4, quality: '7', romanNumeral: 'IV7' },
      { degree: 1, quality: '7', romanNumeral: 'I7' },
      { degree: 1, quality: '7', romanNumeral: 'I7' },
      { degree: 5, quality: '7', romanNumeral: 'V7' },
      { degree: 4, quality: '7', romanNumeral: 'IV7' },
      { degree: 1, quality: '7', romanNumeral: 'I7' },
      { degree: 5, quality: '7', romanNumeral: 'V7' }
    ],
    beatsPerChord: 4,
    theoryContentId: 'blues-12bar',
    examples: ['Sweet Home Chicago - Robert Johnson', 'Hound Dog - Elvis Presley', 'Johnny B. Goode - Chuck Berry']
  },
  {
    id: 'blues-I7-IV7-V7',
    name: 'I7-IV7-V7 Blues Shuffle',
    genre: 'Blues',
    feel: 'Driving shuffle rhythm',
    pattern: [
      { degree: 1, quality: '7', romanNumeral: 'I7' },
      { degree: 4, quality: '7', romanNumeral: 'IV7' },
      { degree: 5, quality: '7', romanNumeral: 'V7' }
    ],
    beatsPerChord: 4,
    theoryContentId: 'blues-shuffle',
    examples: ['Pride and Joy - Stevie Ray Vaughan', 'Crossroads - Cream', 'The Thrill Is Gone - B.B. King']
  },
  {
    id: 'jazz-ii-V-I',
    name: 'ii-V-I',
    genre: 'Jazz',
    feel: 'Classic jazz cadence',
    pattern: [
      { degree: 2, quality: 'm7', romanNumeral: 'iim7' },
      { degree: 5, quality: '7', romanNumeral: 'V7' },
      { degree: 1, quality: 'maj7', romanNumeral: 'Imaj7' }
    ],
    beatsPerChord: 4,
    theoryContentId: 'jazz-ii-V-I',
    examples: ['Autumn Leaves - Joseph Kosma', 'Satin Doll - Duke Ellington', 'Blue Bossa - Kenny Dorham']
  },
  {
    id: 'jazz-I-vi-ii-V',
    name: 'I-vi-ii-V (Rhythm Changes)',
    genre: 'Jazz',
    feel: 'Bebop standard form',
    pattern: [
      { degree: 1, quality: 'maj7', romanNumeral: 'Imaj7' },
      { degree: 6, quality: 'm7', romanNumeral: 'vim7' },
      { degree: 2, quality: 'm7', romanNumeral: 'iim7' },
      { degree: 5, quality: '7', romanNumeral: 'V7' }
    ],
    beatsPerChord: 2,
    theoryContentId: 'jazz-rhythm-changes',
    examples: ['I Got Rhythm - George Gershwin', 'Oleo - Sonny Rollins', 'Anthropology - Charlie Parker']
  },
  {
    id: 'jazz-iihd7-V7-imaj7',
    name: 'iiø7-V7-imaj7 (Minor ii-V-i)',
    genre: 'Jazz',
    feel: 'Minor key jazz progression',
    pattern: [
      { degree: 2, quality: 'm7b5', romanNumeral: 'iiø7' },
      { degree: 5, quality: '7', romanNumeral: 'V7' },
      { degree: 1, quality: 'maj7', romanNumeral: 'imaj7' }
    ],
    beatsPerChord: 4,
    theoryContentId: 'jazz-minor-ii-V-i',
    examples: ['Beautiful Love - Victor Young', 'Black Orpheus - Luiz Bonfá', 'Softly As In A Morning Sunrise - Sigmund Romberg']
  },
  {
    id: 'pop-punk-I-V-vi-IV',
    name: 'I-V-vi-IV (Power Chords)',
    genre: 'Pop-Punk',
    feel: 'Energetic, driving',
    pattern: [
      { degree: 1, romanNumeral: 'I' },
      { degree: 5, romanNumeral: 'V' },
      { degree: 6, romanNumeral: 'vi' },
      { degree: 4, romanNumeral: 'IV' }
    ],
    beatsPerChord: 2,
    theoryContentId: 'pop-punk-1564',
    examples: ['Fat Lip - Sum 41', 'Ocean Avenue - Yellowcard', 'The Anthem - Good Charlotte']
  },
  {
    id: 'pop-punk-vi-IV-I-V',
    name: 'vi-IV-I-V',
    genre: 'Pop-Punk',
    feel: 'Angsty, emotional',
    pattern: [
      { degree: 6, romanNumeral: 'vi' },
      { degree: 4, romanNumeral: 'IV' },
      { degree: 1, romanNumeral: 'I' },
      { degree: 5, romanNumeral: 'V' }
    ],
    beatsPerChord: 2,
    theoryContentId: 'pop-punk-6415',
    examples: ['Dear Maria Count Me In - All Time Low', 'Check Yes Juliet - We The Kings', 'MakeDamnSure - Taking Back Sunday']
  },
  {
    id: 'folk-I-IV-I-V',
    name: 'I-IV-I-V',
    genre: 'Folk/Country',
    feel: 'Simple, folk tradition',
    pattern: [
      { degree: 1, romanNumeral: 'I' },
      { degree: 4, romanNumeral: 'IV' },
      { degree: 1, romanNumeral: 'I' },
      { degree: 5, romanNumeral: 'V' }
    ],
    beatsPerChord: 4,
    theoryContentId: 'folk-I-IV-I-V',
    examples: ['This Land Is Your Land - Woody Guthrie', 'Ring of Fire - Johnny Cash', 'Jambalaya - Hank Williams']
  },
  {
    id: 'folk-I-iii-IV-V',
    name: 'I-iii-IV-V',
    genre: 'Folk/Country',
    feel: 'Gentle, melodic',
    pattern: [
      { degree: 1, romanNumeral: 'I' },
      { degree: 3, romanNumeral: 'iii' },
      { degree: 4, romanNumeral: 'IV' },
      { degree: 5, romanNumeral: 'V' }
    ],
    beatsPerChord: 4,
    theoryContentId: 'folk-I-iii-IV-V',
    examples: ['Take Me Home, Country Roads - John Denver', 'I Walk The Line - Johnny Cash', 'Can\'t Help Falling In Love - Elvis Presley']
  }
];
