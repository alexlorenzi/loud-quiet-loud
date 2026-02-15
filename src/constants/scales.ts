import type { ScaleShapePosition } from '../types/music.js';

export const SCALE_SHAPE_POSITIONS: ScaleShapePosition[] = [
  {
    id: 'pentatonic-minor-box1',
    name: 'Minor Pentatonic Box 1',
    scaleType: 'pentatonic-minor',
    description: 'The most common pentatonic shape, centered around the root on the low E string',
    usage: 'Essential for rock, blues, and metal solos',
    pattern: [
      { string: 5, fretOffset: 0, degree: 1, finger: 1 },
      { string: 5, fretOffset: 3, degree: 4, finger: 4 },
      { string: 4, fretOffset: 0, degree: 4, finger: 1 },
      { string: 4, fretOffset: 2, degree: 5, finger: 3 },
      { string: 3, fretOffset: 0, degree: 5, finger: 1 },
      { string: 3, fretOffset: 2, degree: 7, finger: 3 },
      { string: 2, fretOffset: 0, degree: 1, finger: 1 },
      { string: 2, fretOffset: 3, degree: 3, finger: 4 },
      { string: 1, fretOffset: 0, degree: 4, finger: 1 },
      { string: 1, fretOffset: 3, degree: 5, finger: 4 },
      { string: 0, fretOffset: 0, degree: 1, finger: 1 },
      { string: 0, fretOffset: 3, degree: 4, finger: 4 }
    ],
    span: 4,
    rootPositions: [
      { string: 5, fretOffset: 0 },
      { string: 2, fretOffset: 0 },
      { string: 0, fretOffset: 0 }
    ]
  },
  {
    id: 'pentatonic-major-box1',
    name: 'Major Pentatonic Box 1',
    scaleType: 'pentatonic-major',
    description: 'Major pentatonic shape starting with root on low E string',
    usage: 'Great for country, folk, and uplifting solos',
    pattern: [
      { string: 5, fretOffset: 0, degree: 1, finger: 1 },
      { string: 5, fretOffset: 2, degree: 2, finger: 3 },
      { string: 4, fretOffset: -1, degree: 5, finger: 1 },
      { string: 4, fretOffset: 2, degree: 1, finger: 4 },
      { string: 3, fretOffset: 0, degree: 2, finger: 2 },
      { string: 3, fretOffset: 2, degree: 3, finger: 4 },
      { string: 2, fretOffset: 0, degree: 5, finger: 1 },
      { string: 2, fretOffset: 2, degree: 6, finger: 3 },
      { string: 1, fretOffset: 0, degree: 1, finger: 1 },
      { string: 1, fretOffset: 2, degree: 2, finger: 3 },
      { string: 0, fretOffset: 0, degree: 5, finger: 1 },
      { string: 0, fretOffset: 3, degree: 6, finger: 4 }
    ],
    span: 4,
    rootPositions: [
      { string: 5, fretOffset: 0 },
      { string: 4, fretOffset: 2 },
      { string: 1, fretOffset: 0 }
    ]
  },
  {
    id: 'major-3nps',
    name: 'Major Scale 3-notes-per-string',
    scaleType: 'major',
    description: 'Three notes per string pattern for the major scale, excellent for speed and fluidity',
    usage: 'Used extensively in metal, shred, and technical playing',
    pattern: [
      { string: 5, fretOffset: 0, degree: 1, finger: 2 },
      { string: 5, fretOffset: 2, degree: 2, finger: 4 },
      { string: 5, fretOffset: 3, degree: 3, finger: 5 },
      { string: 4, fretOffset: 0, degree: 4, finger: 2 },
      { string: 4, fretOffset: 2, degree: 5, finger: 4 },
      { string: 4, fretOffset: 3, degree: 6, finger: 5 },
      { string: 3, fretOffset: 0, degree: 7, finger: 2 },
      { string: 3, fretOffset: 2, degree: 1, finger: 4 },
      { string: 3, fretOffset: 4, degree: 2, finger: 5 },
      { string: 2, fretOffset: 1, degree: 3, finger: 2 },
      { string: 2, fretOffset: 3, degree: 4, finger: 4 },
      { string: 2, fretOffset: 5, degree: 5, finger: 5 },
      { string: 1, fretOffset: 1, degree: 6, finger: 2 },
      { string: 1, fretOffset: 3, degree: 7, finger: 4 },
      { string: 1, fretOffset: 5, degree: 1, finger: 5 },
      { string: 0, fretOffset: 1, degree: 2, finger: 2 },
      { string: 0, fretOffset: 3, degree: 3, finger: 4 },
      { string: 0, fretOffset: 5, degree: 4, finger: 5 }
    ],
    span: 6,
    rootPositions: [
      { string: 5, fretOffset: 0 },
      { string: 3, fretOffset: 2 },
      { string: 1, fretOffset: 5 }
    ]
  },
  {
    id: 'natural-minor-3nps',
    name: 'Natural Minor Scale 3-notes-per-string',
    scaleType: 'natural-minor',
    description: 'Three notes per string pattern for the natural minor scale',
    usage: 'Essential for fast minor key passages and technical solos',
    pattern: [
      { string: 5, fretOffset: 0, degree: 1, finger: 1 },
      { string: 5, fretOffset: 2, degree: 2, finger: 3 },
      { string: 5, fretOffset: 3, degree: 3, finger: 4 },
      { string: 4, fretOffset: 0, degree: 4, finger: 1 },
      { string: 4, fretOffset: 2, degree: 5, finger: 3 },
      { string: 4, fretOffset: 3, degree: 6, finger: 4 },
      { string: 3, fretOffset: 0, degree: 7, finger: 1 },
      { string: 3, fretOffset: 2, degree: 1, finger: 3 },
      { string: 3, fretOffset: 4, degree: 2, finger: 4 },
      { string: 2, fretOffset: 1, degree: 3, finger: 2 },
      { string: 2, fretOffset: 3, degree: 4, finger: 4 },
      { string: 2, fretOffset: 5, degree: 5, finger: 5 },
      { string: 1, fretOffset: 1, degree: 6, finger: 2 },
      { string: 1, fretOffset: 3, degree: 7, finger: 4 },
      { string: 1, fretOffset: 5, degree: 1, finger: 5 },
      { string: 0, fretOffset: 1, degree: 2, finger: 2 },
      { string: 0, fretOffset: 3, degree: 3, finger: 4 },
      { string: 0, fretOffset: 5, degree: 4, finger: 5 }
    ],
    span: 6,
    rootPositions: [
      { string: 5, fretOffset: 0 },
      { string: 3, fretOffset: 2 },
      { string: 1, fretOffset: 5 }
    ]
  }
];
