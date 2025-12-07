import { generateSlug } from './helpers';

// Curated themes for organizing cards and talks
export const themesSeedData = [
  // EMOTIONS
  {
    slug: 'grief-and-gratitude',
    name: 'Grief & Gratitude',
    shortDescription: 'Navigating loss while finding meaning and appreciation.',
    longDescription: 'This theme explores the intertwined nature of grief and gratitude - how acknowledging our losses can deepen our appreciation for what remains and what was.',
    category: 'emotion' as const,
  },
  {
    slug: 'joy-and-celebration',
    name: 'Joy & Celebration',
    shortDescription: 'Embracing happiness, success, and moments of triumph.',
    longDescription: 'Cards and talks that celebrate life\'s victories, both big and small, and explore the science and practice of cultivating joy.',
    category: 'emotion' as const,
  },
  {
    slug: 'fear-and-courage',
    name: 'Fear & Courage',
    shortDescription: 'Facing our fears and finding the courage to move forward.',
    longDescription: 'Exploring anxiety, fear, and the inner strength needed to face challenges head-on.',
    category: 'emotion' as const,
  },

  // LIFE PHASES
  {
    slug: 'new-beginnings',
    name: 'New Beginnings',
    shortDescription: 'Starting fresh, taking leaps of faith, and embracing the unknown.',
    longDescription: 'Whether it\'s a new job, relationship, or life chapter, these cards and talks guide you through the excitement and uncertainty of starting something new.',
    category: 'life_phase' as const,
  },
  {
    slug: 'endings-and-transitions',
    name: 'Endings & Transitions',
    shortDescription: 'Letting go, saying goodbye, and moving through change.',
    longDescription: 'The wisdom of endings - how to gracefully close chapters, honor what was, and prepare for what comes next.',
    category: 'life_phase' as const,
  },
  {
    slug: 'transformation',
    name: 'Transformation',
    shortDescription: 'Deep change, death and rebirth, becoming who you\'re meant to be.',
    longDescription: 'Profound transformation isn\'t easy, but it\'s essential. These cards and talks explore the process of radical change and personal evolution.',
    category: 'life_phase' as const,
  },

  // ROLES
  {
    slug: 'leadership',
    name: 'Leadership',
    shortDescription: 'Guiding others, making decisions, and wielding power wisely.',
    longDescription: 'What makes a good leader? These cards and talks explore authority, responsibility, and the art of inspiring others.',
    category: 'role' as const,
  },
  {
    slug: 'creativity-and-calling',
    name: 'Creativity & Calling',
    shortDescription: 'Following your creative impulses and discovering your purpose.',
    longDescription: 'For artists, makers, and anyone seeking to live a creative life - guidance on overcoming blocks and trusting your genius.',
    category: 'role' as const,
  },
  {
    slug: 'relationships',
    name: 'Relationships',
    shortDescription: 'Love, partnership, community, and human connection.',
    longDescription: 'How we relate to others shapes our entire lives. These cards and talks explore romantic love, friendship, family, and community bonds.',
    category: 'role' as const,
  },

  // OTHER
  {
    slug: 'resilience',
    name: 'Resilience',
    shortDescription: 'Bouncing back, persevering, and finding strength in adversity.',
    longDescription: 'When life knocks you down, these cards and talks offer wisdom on getting back up and growing stronger.',
    category: 'other' as const,
  },
  {
    slug: 'wisdom-and-introspection',
    name: 'Wisdom & Introspection',
    shortDescription: 'Going within, seeking truth, and cultivating self-knowledge.',
    longDescription: 'The examined life - cards and talks for those who seek deeper understanding through reflection and contemplation.',
    category: 'other' as const,
  },
];

// Theme assignments for cards (to be inserted after themes are created)
export const cardThemeAssignments = [
  // NEW BEGINNINGS
  { cardSlug: 'the-fool', themeSlug: 'new-beginnings' },
  { cardSlug: 'ace-of-wands', themeSlug: 'new-beginnings' },
  { cardSlug: 'ace-of-cups', themeSlug: 'new-beginnings' },
  { cardSlug: 'ace-of-swords', themeSlug: 'new-beginnings' },
  { cardSlug: 'ace-of-pentacles', themeSlug: 'new-beginnings' },

  // ENDINGS & TRANSITIONS
  { cardSlug: 'death', themeSlug: 'endings-and-transitions' },
  { cardSlug: 'the-tower', themeSlug: 'endings-and-transitions' },
  { cardSlug: 'eight-of-cups', themeSlug: 'endings-and-transitions' },
  { cardSlug: 'six-of-swords', themeSlug: 'endings-and-transitions' },
  { cardSlug: 'ten-of-swords', themeSlug: 'endings-and-transitions' },

  // TRANSFORMATION
  { cardSlug: 'death', themeSlug: 'transformation' },
  { cardSlug: 'the-tower', themeSlug: 'transformation' },
  { cardSlug: 'judgement', themeSlug: 'transformation' },
  { cardSlug: 'temperance', themeSlug: 'transformation' },

  // LEADERSHIP
  { cardSlug: 'the-emperor', themeSlug: 'leadership' },
  { cardSlug: 'the-empress', themeSlug: 'leadership' },
  { cardSlug: 'king-of-wands', themeSlug: 'leadership' },
  { cardSlug: 'queen-of-wands', themeSlug: 'leadership' },
  { cardSlug: 'king-of-swords', themeSlug: 'leadership' },

  // GRIEF & GRATITUDE
  { cardSlug: 'five-of-cups', themeSlug: 'grief-and-gratitude' },
  { cardSlug: 'three-of-swords', themeSlug: 'grief-and-gratitude' },
  { cardSlug: 'death', themeSlug: 'grief-and-gratitude' },

  // JOY & CELEBRATION
  { cardSlug: 'the-sun', themeSlug: 'joy-and-celebration' },
  { cardSlug: 'three-of-cups', themeSlug: 'joy-and-celebration' },
  { cardSlug: 'four-of-wands', themeSlug: 'joy-and-celebration' },
  { cardSlug: 'nine-of-cups', themeSlug: 'joy-and-celebration' },
  { cardSlug: 'ten-of-cups', themeSlug: 'joy-and-celebration' },

  // FEAR & COURAGE
  { cardSlug: 'strength', themeSlug: 'fear-and-courage' },
  { cardSlug: 'nine-of-swords', themeSlug: 'fear-and-courage' },
  { cardSlug: 'the-devil', themeSlug: 'fear-and-courage' },

  // CREATIVITY & CALLING
  { cardSlug: 'the-magician', themeSlug: 'creativity-and-calling' },
  { cardSlug: 'the-empress', themeSlug: 'creativity-and-calling' },
  { cardSlug: 'the-world', themeSlug: 'creativity-and-calling' },
  { cardSlug: 'ace-of-wands', themeSlug: 'creativity-and-calling' },

  // RELATIONSHIPS
  { cardSlug: 'the-lovers', themeSlug: 'relationships' },
  { cardSlug: 'two-of-cups', themeSlug: 'relationships' },
  { cardSlug: 'three-of-cups', themeSlug: 'relationships' },
  { cardSlug: 'ten-of-cups', themeSlug: 'relationships' },

  // RESILIENCE
  { cardSlug: 'strength', themeSlug: 'resilience' },
  { cardSlug: 'nine-of-wands', themeSlug: 'resilience' },
  { cardSlug: 'seven-of-wands', themeSlug: 'resilience' },
  { cardSlug: 'the-star', themeSlug: 'resilience' },

  // WISDOM & INTROSPECTION
  { cardSlug: 'the-hermit', themeSlug: 'wisdom-and-introspection' },
  { cardSlug: 'the-high-priestess', themeSlug: 'wisdom-and-introspection' },
  { cardSlug: 'the-hanged-man', themeSlug: 'wisdom-and-introspection' },
  { cardSlug: 'four-of-cups', themeSlug: 'wisdom-and-introspection' },
];

// Theme assignments for talks (to be inserted after themes are created)
export const talkThemeAssignments = [
  { talkSlug: 'elizabeth-gilbert-your-elusive-creative-genius', themeSlug: 'creativity-and-calling' },
  { talkSlug: 'brené-brown-the-power-of-vulnerability', themeSlug: 'relationships' },
  { talkSlug: 'simon-sinek-why-good-leaders-make-you-feel-safe', themeSlug: 'leadership' },
  { talkSlug: 'angela-lee-duckworth-grit-the-power-of-passion-and-perseverance', themeSlug: 'resilience' },
  { talkSlug: 'bj-miller-what-really-matters-at-the-end-of-life', themeSlug: 'grief-and-gratitude' },
  { talkSlug: 'shawn-achor-the-happy-secret-to-better-work', themeSlug: 'joy-and-celebration' },
  { talkSlug: 'pico-iyer-the-art-of-stillness', themeSlug: 'wisdom-and-introspection' },
  // Additional theme assignments can be added
];
