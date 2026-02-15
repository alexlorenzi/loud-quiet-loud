export interface TheoryContent {
  id: string;
  title: string;
  category: 'chord-function' | 'progression' | 'scale' | 'interval';
  content: string; // Markdown-like text with {variable} placeholders
}

export const THEORY_CONTENT: TheoryContent[] = [
  // ─── Chord Function ──────────────────────────────────────────────
  {
    id: 'chord-function-I',
    title: 'The I Chord (Tonic)',
    category: 'chord-function',
    content:
      'The I chord is the tonal center of the key of {key} {mode}. ' +
      'It is the "home base" that feels most resolved and stable. ' +
      'Melodies and progressions tend to gravitate toward it. ' +
      'In {key} {mode}, the I chord is {chord}.',
  },
  {
    id: 'chord-function-iii',
    title: 'The iii Chord (Tonic Substitute)',
    category: 'chord-function',
    content:
      'The iii chord shares two of its three notes with the I chord, making it a tonic substitute. ' +
      'It provides a softer, more ambiguous version of the tonic sound. ' +
      'In {key} {mode}, the iii chord adds color without the full resolution of the I chord. ' +
      'It often appears as a passing chord between IV and ii.',
  },
  {
    id: 'chord-function-vi',
    title: 'The vi Chord (Relative Minor / Tonic)',
    category: 'chord-function',
    content:
      'The vi chord is the relative minor of the key. ' +
      'It shares two notes with the I chord and functions as a tonic substitute, ' +
      'but with a darker, more introspective quality. ' +
      'Starting a progression on vi instead of I is the classic "minor-feel" trick used in pop and rock. ' +
      'In {key} {mode}, the vi chord creates emotional depth without leaving the tonic family.',
  },
  {
    id: 'chord-function-ii',
    title: 'The ii Chord (Subdominant)',
    category: 'chord-function',
    content:
      'The ii chord belongs to the subdominant family. ' +
      'It creates a sense of gentle motion away from the tonic, often preparing the listener for a dominant chord. ' +
      'The ii-V-I movement is one of the strongest cadences in Western harmony. ' +
      'In {key} {mode}, the ii chord is commonly used to set up the V chord.',
  },
  {
    id: 'chord-function-IV',
    title: 'The IV Chord (Subdominant)',
    category: 'chord-function',
    content:
      'The IV chord is the primary subdominant chord. ' +
      'It creates a feeling of "lifting away" from the tonic without the strong pull of the dominant. ' +
      'The IV chord is everywhere in pop, rock, blues, and folk music. ' +
      'In {key} {mode}, moving from I to IV is one of the most natural harmonic movements.',
  },
  {
    id: 'chord-function-V',
    title: 'The V Chord (Dominant)',
    category: 'chord-function',
    content:
      'The V chord is the primary dominant chord. ' +
      'It contains the leading tone of the key, which creates strong tension that wants to resolve to the I chord. ' +
      'The V-I resolution is the most powerful cadence in tonal music. ' +
      'In {key} {mode}, the V chord provides the crucial pull back home.',
  },
  {
    id: 'chord-function-viidim',
    title: 'The vii dim Chord (Dominant Substitute)',
    category: 'chord-function',
    content:
      'The vii diminished chord is a dominant substitute. ' +
      'It shares two notes with the V chord (including the leading tone) and has an inherently unstable, tense sound. ' +
      'The diminished quality gives it a particularly urgent need to resolve to the tonic. ' +
      'In {key} {mode}, the vii dim chord appears less frequently but adds dramatic tension when used.',
  },

  // ─── Progressions ────────────────────────────────────────────────
  {
    id: 'pop-progression-1564',
    title: 'I-V-vi-IV: The Anthem Progression',
    category: 'progression',
    content:
      'The I-V-vi-IV progression is arguably the most widely used chord sequence in modern pop and rock music. ' +
      'In {key} {mode}, it starts on the tonic for stability, lifts to the dominant for energy, ' +
      'drops to the relative minor for emotional depth, then rests on the subdominant before cycling back. ' +
      'Its power lies in the balanced interplay of major and minor chords that keeps the listener engaged without ever feeling unresolved.',
  },
  {
    id: 'pop-progression-145',
    title: 'I-IV-V: The Three-Chord Classic',
    category: 'progression',
    content:
      'The I-IV-V is the foundation of rock and roll, blues, and countless folk songs. ' +
      'It uses only the three major chords in a major key: tonic, subdominant, and dominant. ' +
      'In {key} {mode}, these three chords cover every note of the scale between them, ' +
      'which is why entire songs can be built from this simple framework. ' +
      'The movement from I to IV lifts, IV to V builds tension, and V back to I resolves.',
  },
  {
    id: 'pop-progression-6415',
    title: 'vi-IV-I-V: The Emotional Rotation',
    category: 'progression',
    content:
      'This progression is a rotation of I-V-vi-IV, starting on the minor chord. ' +
      'Beginning on vi gives the progression a melancholic, introspective feel from the first beat. ' +
      'In {key} {mode}, the vi chord draws the listener into an emotional space, ' +
      'while the subsequent IV-I-V movement provides lift and resolution. ' +
      'It is widely used in modern pop ballads and emotionally driven songs.',
  },
  {
    id: 'pop-progression-1645',
    title: 'I-vi-IV-V: The Doo-Wop Progression',
    category: 'progression',
    content:
      'The I-vi-IV-V sequence dominated 1950s doo-wop and early rock and roll. ' +
      'In {key} {mode}, it moves from the bright tonic to the warm relative minor, ' +
      'then through the subdominant and dominant to create a smooth, nostalgic cycle. ' +
      'The steady alternation between major and minor chords gives it a bittersweet quality. ' +
      'It remains a go-to progression for evoking a classic, timeless feel.',
  },
  {
    id: 'blues-12bar',
    title: '12-Bar Blues: The Foundation',
    category: 'progression',
    content:
      'The 12-bar blues is a 12-measure form built on the I, IV, and V chords, typically played as dominant 7th chords. ' +
      'In {key}, the form follows: four bars of I7, two bars of IV7, two bars of I7, ' +
      'then V7-IV7-I7-V7 (the "turnaround"). ' +
      'Every chord being a dominant 7th creates a characteristic bluesy tension throughout. ' +
      'This form has been the backbone of blues, early rock, and jazz for over a century.',
  },
  {
    id: 'blues-shuffle',
    title: 'Blues Shuffle: I7-IV7-V7',
    category: 'progression',
    content:
      'The blues shuffle uses the same three dominant 7th chords as the 12-bar blues but in a shorter, looping form. ' +
      'In {key}, each chord gets a driving shuffle rhythm that propels the music forward. ' +
      'The dominant 7th quality on every chord is what gives the blues its distinctive sound: ' +
      'every chord has built-in tension that never fully resolves. ' +
      'This form is essential for blues-rock jamming and improvisation.',
  },
  {
    id: 'jazz-ii-V-I',
    title: 'ii-V-I: The Jazz Cadence',
    category: 'progression',
    content:
      'The ii-V-I is the most fundamental progression in jazz harmony. ' +
      'In {key} {mode}, the ii minor 7th chord sets up the V dominant 7th, ' +
      'which resolves to the I major 7th with the strongest possible cadence. ' +
      'The voice leading between these three chords is exceptionally smooth: ' +
      'each note moves by step or stays in place. ' +
      'Mastering ii-V-I in all keys is considered essential for any jazz musician.',
  },
  {
    id: 'jazz-rhythm-changes',
    title: 'Rhythm Changes: I-vi-ii-V',
    category: 'progression',
    content:
      'Rhythm changes derive from the chord progression of a famous 1930s standard. ' +
      'In {key} {mode}, the I-vi-ii-V turnaround cycles through all three harmonic functions: ' +
      'tonic (I, vi), subdominant (ii), and dominant (V). ' +
      'The pattern typically uses 7th chords throughout (Imaj7, vim7, iim7, V7). ' +
      'Countless bebop compositions are built on this harmonic framework.',
  },
  {
    id: 'jazz-minor-ii-V-i',
    title: 'Minor ii-V-i',
    category: 'progression',
    content:
      'The minor ii-V-i is the minor-key counterpart to the major ii-V-I. ' +
      'In a minor context, the ii chord becomes half-diminished (also called minor 7 flat 5), ' +
      'the V remains dominant 7th (often with altered tensions), ' +
      'and the i chord resolves as a minor chord (often with a major 7th for color). ' +
      'This progression appears throughout jazz standards and provides a darker, more dramatic resolution.',
  },
  {
    id: 'pop-punk-1564',
    title: 'Pop-Punk I-V-vi-IV',
    category: 'progression',
    content:
      'The pop-punk version of I-V-vi-IV uses the same chord sequence as its pop counterpart ' +
      'but is typically played with power chords, palm muting, and higher energy. ' +
      'In {key} {mode}, the driving eighth-note rhythm and distortion transform the familiar progression ' +
      'into something urgent and anthemic. ' +
      'The minor vi chord provides the angsty contrast that defines the pop-punk aesthetic.',
  },
  {
    id: 'pop-punk-6415',
    title: 'Pop-Punk vi-IV-I-V',
    category: 'progression',
    content:
      'Starting on the vi chord gives this pop-punk progression an immediate emotional intensity. ' +
      'In {key} {mode}, the minor opening sets a brooding or angsty tone ' +
      'before the major IV and I chords open things up. ' +
      'The V chord at the end drives back to vi for the repeat, creating a relentless cycle. ' +
      'This is a staple of emo-adjacent and pop-punk songwriting.',
  },
  {
    id: 'folk-I-IV-I-V',
    title: 'Folk I-IV-I-V',
    category: 'progression',
    content:
      'This folk progression alternates between tonic and subdominant before resolving through the dominant. ' +
      'In {key} {mode}, the I-IV movement has a hymn-like, grounded quality ' +
      'that suits storytelling and singalong traditions. ' +
      'Returning to I before hitting V creates a brief moment of rest before the cadential push. ' +
      'It appears across folk, country, and Americana music.',
  },
  {
    id: 'folk-I-iii-IV-V',
    title: 'Folk I-iii-IV-V',
    category: 'progression',
    content:
      'Adding the iii chord between I and IV creates a stepwise bass line that gives this progression a gentle, flowing quality. ' +
      'In {key} {mode}, the iii chord acts as a passing chord that smooths the transition from tonic to subdominant. ' +
      'The ascending harmonic motion (I to iii to IV to V) creates a sense of building warmth. ' +
      'This progression is well suited to ballads and melodic folk songwriting.',
  },

  // ─── Scales ──────────────────────────────────────────────────────
  {
    id: 'scale-major',
    title: 'The Major Scale',
    category: 'scale',
    content:
      'The major scale is the foundation of Western music theory. ' +
      'Its interval pattern (whole-whole-half-whole-whole-whole-half) produces seven distinct notes. ' +
      'In {key} major, these notes form the basis for all diatonic chords and melodies. ' +
      'Every chord in a major key is built by stacking thirds from scale degrees. ' +
      'Learning the major scale thoroughly unlocks understanding of harmony, melody, and chord construction.',
  },
  {
    id: 'scale-natural-minor',
    title: 'The Natural Minor Scale',
    category: 'scale',
    content:
      'The natural minor scale (also called the Aeolian mode) has the interval pattern: whole-half-whole-whole-half-whole-whole. ' +
      'It produces a darker, more somber sound than the major scale. ' +
      'In {key} minor, the natural minor scale is the starting point for building minor-key harmony. ' +
      'The lowered 3rd, 6th, and 7th degrees compared to major give it its characteristic melancholy.',
  },
  {
    id: 'scale-pentatonic-minor',
    title: 'The Minor Pentatonic Scale',
    category: 'scale',
    content:
      'The minor pentatonic is a five-note scale derived from the natural minor by removing the 2nd and 6th degrees. ' +
      'This elimination of half steps makes it nearly impossible to play a "wrong" note over minor chords. ' +
      'In {key} minor, the pentatonic minor is the go-to scale for rock, blues, and metal soloing. ' +
      'Its simplicity and versatility make it the most commonly used scale for guitar improvisation worldwide.',
  },
  {
    id: 'scale-pentatonic-major',
    title: 'The Major Pentatonic Scale',
    category: 'scale',
    content:
      'The major pentatonic is a five-note scale derived from the major scale by removing the 4th and 7th degrees. ' +
      'Without these tension-creating intervals, the scale sounds bright, happy, and consonant over major chords. ' +
      'In {key} major, the major pentatonic is essential for country, folk, and pop guitar playing. ' +
      'It shares the same five notes as the relative minor pentatonic, just starting from a different root.',
  },
  {
    id: 'scale-blues',
    title: 'The Blues Scale',
    category: 'scale',
    content:
      'The blues scale is the minor pentatonic with one added note: the flat 5th (also called the "blue note"). ' +
      'This chromatic addition creates the tension and grit that defines the blues sound. ' +
      'In {key}, the blue note sits between the 4th and 5th scale degrees, ' +
      'acting as a passing tone that resolves upward or downward. ' +
      'The blues scale works over both major and minor chord progressions, making it extremely versatile.',
  },
  {
    id: 'scale-harmonic-minor',
    title: 'The Harmonic Minor Scale',
    category: 'scale',
    content:
      'The harmonic minor scale raises the 7th degree of the natural minor by a half step. ' +
      'This creates a leading tone that pulls strongly to the tonic, enabling a major V chord in a minor key. ' +
      'The interval between the flat 6th and raised 7th creates an augmented 2nd gap ' +
      'that gives the scale its distinctive "exotic" or "classical" sound. ' +
      'In {key} minor, the harmonic minor is essential for creating dominant function in minor-key harmony.',
  },

  // ─── General Concepts ────────────────────────────────────────────
  {
    id: 'concept-diatonic-chords',
    title: 'How Diatonic Chords Are Built',
    category: 'interval',
    content:
      'Diatonic chords are built by stacking every other note from the scale (stacking in thirds). ' +
      'Starting on each of the seven scale degrees and adding the note a third above, then another third above that, ' +
      'produces seven triads. In a major key, the pattern is always: ' +
      'I (major), ii (minor), iii (minor), IV (major), V (major), vi (minor), vii (diminished). ' +
      'This pattern emerges naturally from the spacing of whole and half steps in the major scale. ' +
      'Understanding this construction is the key to understanding why certain chords "belong" in a key.',
  },
  {
    id: 'concept-nashville-numbers',
    title: 'The Nashville Number System',
    category: 'interval',
    content:
      'The Nashville number system replaces chord names with scale degree numbers: ' +
      '1 for the I chord, 4 for the IV chord, 5 for the V chord, and so on. ' +
      'This makes it possible to communicate chord progressions without specifying a key. ' +
      'A "1-5-6-4" progression is the same pattern whether you play it in C, G, or any other key. ' +
      'Session musicians in Nashville popularized this system because it allows instant transposition. ' +
      'Roman numerals (I, ii, iii) add chord quality information; Arabic numerals (1, 2, 3) are quicker shorthand.',
  },
  {
    id: 'concept-circle-of-fifths',
    title: 'The Circle of Fifths',
    category: 'interval',
    content:
      'The circle of fifths arranges all 12 keys in a circle where each adjacent key is a perfect fifth apart. ' +
      'Moving clockwise adds one sharp; moving counterclockwise adds one flat. ' +
      'Keys next to each other on the circle share most of their notes, which is why modulations between adjacent keys sound smooth. ' +
      'The circle also shows relative major/minor pairs (C major and A minor share the same notes). ' +
      'It is one of the most useful reference tools in all of music theory.',
  },
];

/**
 * Look up a single theory content entry by its ID.
 */
export function getTheoryContent(id: string): TheoryContent | undefined {
  return THEORY_CONTENT.find((item) => item.id === id);
}
