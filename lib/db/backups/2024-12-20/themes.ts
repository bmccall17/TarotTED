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

  // NEW THEMES
  {
    slug: 'work-and-productivity',
    name: 'Work & Productivity',
    shortDescription: 'Mastering your craft, managing time, and finding flow.',
    longDescription: 'Practical wisdom for getting things done, staying motivated, and creating meaningful work in a distracted world.',
    category: 'role' as const,
  },
  {
    slug: 'truth-and-perception',
    name: 'Truth & Perception',
    shortDescription: 'Seeing clearly, questioning assumptions, and finding what\'s real.',
    longDescription: 'Our minds can deceive us. These cards and talks explore how we perceive reality, recognize deception, and find truth.',
    category: 'other' as const,
  },
  {
    slug: 'justice-and-ethics',
    name: 'Justice & Ethics',
    shortDescription: 'Doing what\'s right, fighting for fairness, and moral courage.',
    longDescription: 'What does it mean to live ethically? Cards and talks exploring justice, compassion, and our responsibility to each other.',
    category: 'other' as const,
  },
  {
    slug: 'self-worth-and-confidence',
    name: 'Self-Worth & Confidence',
    shortDescription: 'Knowing your value, speaking up, and owning your power.',
    longDescription: 'Believing in yourself isn\'t arrogance—it\'s necessary. Talks about building confidence, advocating for yourself, and recognizing your worth.',
    category: 'emotion' as const,
  },
  {
    slug: 'love-and-intimacy',
    name: 'Love & Intimacy',
    shortDescription: 'The science and art of romantic love, desire, and deep connection.',
    longDescription: 'Beyond friendship and family—the unique territory of romantic love, passion, intimacy, and the challenges of long-term partnership.',
    category: 'role' as const,
  },
  {
    slug: 'the-future',
    name: 'The Future',
    shortDescription: 'What lies ahead—technology, society, and preparing for tomorrow.',
    longDescription: 'Forward-looking talks about where humanity is headed, the technologies shaping our future, and how to prepare for what\'s coming.',
    category: 'life_phase' as const,
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

  // WORK & PRODUCTIVITY
  { cardSlug: 'eight-of-pentacles', themeSlug: 'work-and-productivity' },
  { cardSlug: 'three-of-pentacles', themeSlug: 'work-and-productivity' },
  { cardSlug: 'knight-of-pentacles', themeSlug: 'work-and-productivity' },
  { cardSlug: 'the-magician', themeSlug: 'work-and-productivity' },

  // TRUTH & PERCEPTION
  { cardSlug: 'the-moon', themeSlug: 'truth-and-perception' },
  { cardSlug: 'seven-of-swords', themeSlug: 'truth-and-perception' },
  { cardSlug: 'the-high-priestess', themeSlug: 'truth-and-perception' },

  // JUSTICE & ETHICS
  { cardSlug: 'justice', themeSlug: 'justice-and-ethics' },
  { cardSlug: 'the-hierophant', themeSlug: 'justice-and-ethics' },
  { cardSlug: 'six-of-pentacles', themeSlug: 'justice-and-ethics' },
  { cardSlug: 'king-of-swords', themeSlug: 'justice-and-ethics' },

  // SELF-WORTH & CONFIDENCE
  { cardSlug: 'the-emperor', themeSlug: 'self-worth-and-confidence' },
  { cardSlug: 'queen-of-wands', themeSlug: 'self-worth-and-confidence' },
  { cardSlug: 'nine-of-pentacles', themeSlug: 'self-worth-and-confidence' },
  { cardSlug: 'the-chariot', themeSlug: 'self-worth-and-confidence' },

  // LOVE & INTIMACY
  { cardSlug: 'the-lovers', themeSlug: 'love-and-intimacy' },
  { cardSlug: 'two-of-cups', themeSlug: 'love-and-intimacy' },
  { cardSlug: 'ace-of-cups', themeSlug: 'love-and-intimacy' },
  { cardSlug: 'the-empress', themeSlug: 'love-and-intimacy' },

  // THE FUTURE
  { cardSlug: 'the-star', themeSlug: 'the-future' },
  { cardSlug: 'wheel-of-fortune', themeSlug: 'the-future' },
  { cardSlug: 'the-world', themeSlug: 'the-future' },
];

// Theme assignments for talks (to be inserted after themes are created)
// Comprehensive mappings for all TED talks organized by theme
export const talkThemeAssignments = [
  // =====================
  // LEADERSHIP (5 talks)
  // =====================
  { talkSlug: 'simon-sinek-why-good-leaders-make-you-feel-safe', themeSlug: 'leadership' },
  { talkSlug: 'simon-sinek-how-great-leaders-inspire-action', themeSlug: 'leadership' },
  { talkSlug: 'derek-sivers-how-to-start-a-movement', themeSlug: 'leadership' },
  { talkSlug: 'sheryl-sandberg-why-we-have-too-few-women-leaders', themeSlug: 'leadership' },
  { talkSlug: 'ray-dalio-how-to-build-a-company-where-the-best-ideas-win', themeSlug: 'leadership' },

  // =====================
  // CREATIVITY & CALLING (8 talks)
  // =====================
  { talkSlug: 'elizabeth-gilbert-your-elusive-creative-genius', themeSlug: 'creativity-and-calling' },
  { talkSlug: 'elizabeth-gilbert-success-failure-and-the-drive-to-keep-creating', themeSlug: 'creativity-and-calling' },
  { talkSlug: 'steven-johnson-where-good-ideas-come-from', themeSlug: 'creativity-and-calling' },
  { talkSlug: 'adam-grant-the-surprising-habits-of-original-thinkers', themeSlug: 'creativity-and-calling' },
  { talkSlug: 'emilie-wapnick-why-some-of-us-dont-have-one-true-calling', themeSlug: 'creativity-and-calling' },
  { talkSlug: 'stuart-brown-play-is-more-than-just-fun', themeSlug: 'creativity-and-calling' },
  { talkSlug: 'eliza-lay-ryan-sparking-curiosity-connection-and-creativity', themeSlug: 'creativity-and-calling' },
  { talkSlug: 'rose-cain-ignite-your-curiosity', themeSlug: 'creativity-and-calling' },

  // =====================
  // RESILIENCE (7 talks)
  // =====================
  { talkSlug: 'angela-lee-duckworth-grit-the-power-of-passion-and-perseverance', themeSlug: 'resilience' },
  { talkSlug: 'david-blaine-how-i-held-my-breath-for-17-minutes', themeSlug: 'resilience' },
  { talkSlug: 'caroline-casey-looking-past-limits', themeSlug: 'resilience' },
  { talkSlug: 'sam-berns-my-philosophy-for-a-happy-life', themeSlug: 'resilience' },
  { talkSlug: 'jia-jiang-what-i-learned-from-100-days-of-rejection', themeSlug: 'resilience' },
  { talkSlug: 'carol-dweck-the-power-of-believing-that-you-can-improve', themeSlug: 'resilience' },
  { talkSlug: 'kelly-mcgonigal-how-to-make-stress-your-friend', themeSlug: 'resilience' },

  // =====================
  // RELATIONSHIPS (7 talks)
  // =====================
  { talkSlug: 'bren-brown-the-power-of-vulnerability', themeSlug: 'relationships' },
  { talkSlug: 'johann-hari-everything-you-think-you-know-about-addiction-is-wrong', themeSlug: 'relationships' },
  { talkSlug: 'robert-waldinger-what-makes-a-good-life-lessons-from-the-longest-study-on-happiness', themeSlug: 'relationships' },
  { talkSlug: 'priya-parker-3-steps-to-turn-everyday-get-togethers-into-transformative-gatherings', themeSlug: 'relationships' },
  { talkSlug: 'celeste-headlee-10-ways-to-have-a-better-conversation', themeSlug: 'relationships' },
  { talkSlug: 'mandy-len-catron-a-better-way-to-talk-about-love', themeSlug: 'relationships' },
  { talkSlug: 'chip-conley-what-baby-boomers-can-learn-from-millennials-at-work-and-vice-versa', themeSlug: 'relationships' },

  // =====================
  // LOVE & INTIMACY (6 talks)
  // =====================
  { talkSlug: 'helen-fisher-the-brain-in-love', themeSlug: 'love-and-intimacy' },
  { talkSlug: 'hannah-fry-the-mathematics-of-love', themeSlug: 'love-and-intimacy' },
  { talkSlug: 'esther-perel-the-secret-to-desire-in-a-long-term-relationship', themeSlug: 'love-and-intimacy' },
  { talkSlug: 'esther-perel-rethinking-infidelity-a-talk-for-anyone-who-has-ever-loved', themeSlug: 'love-and-intimacy' },
  { talkSlug: 'al-vernacchio-sex-needs-a-new-metaphor-heres-one', themeSlug: 'love-and-intimacy' },
  { talkSlug: 'gary-lewandowski-the-psychology-of-betrayal-and-recovery', themeSlug: 'love-and-intimacy' },

  // =====================
  // JOY & CELEBRATION (5 talks)
  // =====================
  { talkSlug: 'shawn-achor-the-happy-secret-to-better-work', themeSlug: 'joy-and-celebration' },
  { talkSlug: 'dan-gilbert-the-surprising-science-of-happiness', themeSlug: 'joy-and-celebration' },
  { talkSlug: 'ingrid-fetell-lee-where-joy-hides-and-how-to-find-it', themeSlug: 'joy-and-celebration' },
  { talkSlug: 'david-steindl-rast-want-to-be-happy-be-grateful', themeSlug: 'joy-and-celebration' },
  { talkSlug: 'michael-norton-how-to-buy-happiness', themeSlug: 'joy-and-celebration' },

  // =====================
  // GRIEF & GRATITUDE (4 talks)
  // =====================
  { talkSlug: 'bj-miller-what-really-matters-at-the-end-of-life', themeSlug: 'grief-and-gratitude' },
  { talkSlug: 'nora-mcinerny-we-dont-move-on-from-grief-we-move-forward-with-it', themeSlug: 'grief-and-gratitude' },
  { talkSlug: 'steve-jobs-how-to-live-before-you-die', themeSlug: 'grief-and-gratitude' },
  { talkSlug: 'dan-buettner-how-to-live-to-be-100', themeSlug: 'grief-and-gratitude' },

  // =====================
  // FEAR & COURAGE (5 talks)
  // =====================
  { talkSlug: 'tim-ferriss-why-you-should-define-your-fears-instead-of-your-goals', themeSlug: 'fear-and-courage' },
  { talkSlug: 'bren-brown-listening-to-shame', themeSlug: 'fear-and-courage' },
  { talkSlug: 'mel-robbins-how-to-stop-screwing-yourself-over', themeSlug: 'fear-and-courage' },
  { talkSlug: 'gever-tulley-5-dangerous-things-you-should-let-your-kids-do', themeSlug: 'fear-and-courage' },
  { talkSlug: 'megan-phelps-roper-i-grew-up-in-the-westboro-baptist-church-heres-why-i-left', themeSlug: 'fear-and-courage' },

  // =====================
  // SELF-WORTH & CONFIDENCE (5 talks)
  // =====================
  { talkSlug: 'amy-cuddy-your-body-language-may-shape-who-you-are', themeSlug: 'self-worth-and-confidence' },
  { talkSlug: 'adam-galinsky-how-to-speak-up-for-yourself', themeSlug: 'self-worth-and-confidence' },
  { talkSlug: 'casey-brown-know-your-worth-and-then-ask-for-it', themeSlug: 'self-worth-and-confidence' },
  { talkSlug: 'carla-harris-how-to-find-the-person-who-can-help-you-get-ahead-at-work', themeSlug: 'self-worth-and-confidence' },
  { talkSlug: 'jia-jiang-what-i-learned-from-100-days-of-rejection', themeSlug: 'self-worth-and-confidence' },

  // =====================
  // WISDOM & INTROSPECTION (6 talks)
  // =====================
  { talkSlug: 'pico-iyer-the-art-of-stillness', themeSlug: 'wisdom-and-introspection' },
  { talkSlug: 'jill-bolte-taylor-my-stroke-of-insight', themeSlug: 'wisdom-and-introspection' },
  { talkSlug: 'andy-puddicombe-all-it-takes-is-10-mindful-minutes', themeSlug: 'wisdom-and-introspection' },
  { talkSlug: 'ruth-chang-how-to-make-hard-choices', themeSlug: 'wisdom-and-introspection' },
  { talkSlug: 'jonathan-haidt-the-moral-roots-of-liberals-and-conservatives', themeSlug: 'wisdom-and-introspection' },
  { talkSlug: 'daniel-goleman-why-arent-we-more-compassionate', themeSlug: 'wisdom-and-introspection' },

  // =====================
  // TRANSFORMATION (5 talks)
  // =====================
  { talkSlug: 'megan-phelps-roper-i-grew-up-in-the-westboro-baptist-church-heres-why-i-left', themeSlug: 'transformation' },
  { talkSlug: 'gretchen-rubin-the-four-ways-to-successfully-change-behavior', themeSlug: 'transformation' },
  { talkSlug: 'jill-bolte-taylor-my-stroke-of-insight', themeSlug: 'transformation' },
  { talkSlug: 'caroline-casey-looking-past-limits', themeSlug: 'transformation' },
  { talkSlug: 'sam-berns-my-philosophy-for-a-happy-life', themeSlug: 'transformation' },

  // =====================
  // WORK & PRODUCTIVITY (7 talks)
  // =====================
  { talkSlug: 'jason-fried-why-work-doesnt-happen-at-work', themeSlug: 'work-and-productivity' },
  { talkSlug: 'david-allen-the-art-of-stress-free-productivity', themeSlug: 'work-and-productivity' },
  { talkSlug: 'dan-pink-the-puzzle-of-motivation', themeSlug: 'work-and-productivity' },
  { talkSlug: 'laura-vanderkam-how-to-gain-control-of-your-free-time', themeSlug: 'work-and-productivity' },
  { talkSlug: 'bill-gross-the-single-biggest-reason-why-startups-succeed', themeSlug: 'work-and-productivity' },
  { talkSlug: 'tom-wujec-build-a-tower-build-a-team', themeSlug: 'work-and-productivity' },
  { talkSlug: 'tim-urban-inside-the-mind-of-a-master-procrastinator', themeSlug: 'work-and-productivity' },

  // =====================
  // TRUTH & PERCEPTION (5 talks)
  // =====================
  { talkSlug: 'pamela-meyer-how-to-spot-a-liar', themeSlug: 'truth-and-perception' },
  { talkSlug: 'margaret-heffernan-the-dangers-of-willful-blindness', themeSlug: 'truth-and-perception' },
  { talkSlug: 'elizabeth-loftus-how-reliable-is-your-memory', themeSlug: 'truth-and-perception' },
  { talkSlug: 'beau-lotto-optical-illusions-show-how-we-see', themeSlug: 'truth-and-perception' },
  { talkSlug: 'ray-dalio-how-to-build-a-company-where-the-best-ideas-win', themeSlug: 'truth-and-perception' },

  // =====================
  // JUSTICE & ETHICS (5 talks)
  // =====================
  { talkSlug: 'bryan-stevenson-we-need-to-talk-about-an-injustice', themeSlug: 'justice-and-ethics' },
  { talkSlug: 'peter-singer-the-why-and-how-of-effective-altruism', themeSlug: 'justice-and-ethics' },
  { talkSlug: 'amy-gutmann-what-it-means-to-be-a-global-citizen', themeSlug: 'justice-and-ethics' },
  { talkSlug: 'paul-piff-does-money-make-you-mean', themeSlug: 'justice-and-ethics' },
  { talkSlug: 'daniel-goleman-why-arent-we-more-compassionate', themeSlug: 'justice-and-ethics' },

  // =====================
  // THE FUTURE (2 talks)
  // =====================
  { talkSlug: 'bill-gates-the-next-outbreak-were-not-ready', themeSlug: 'the-future' },
  { talkSlug: 'sam-harris-can-we-build-ai-without-losing-control-over-it', themeSlug: 'the-future' },

  // =====================
  // NEW BEGINNINGS (3 talks)
  // =====================
  { talkSlug: 'derek-sivers-how-to-start-a-movement', themeSlug: 'new-beginnings' },
  { talkSlug: 'emilie-wapnick-why-some-of-us-dont-have-one-true-calling', themeSlug: 'new-beginnings' },
  { talkSlug: 'bill-gross-the-single-biggest-reason-why-startups-succeed', themeSlug: 'new-beginnings' },

  // =====================
  // ENDINGS & TRANSITIONS (3 talks)
  // =====================
  { talkSlug: 'bj-miller-what-really-matters-at-the-end-of-life', themeSlug: 'endings-and-transitions' },
  { talkSlug: 'nora-mcinerny-we-dont-move-on-from-grief-we-move-forward-with-it', themeSlug: 'endings-and-transitions' },
  { talkSlug: 'steve-jobs-how-to-live-before-you-die', themeSlug: 'endings-and-transitions' },
];
