// Helper functions for generating image URLs and slugs

export function extractTalkInfo(tedTalkField: string): { title: string; url: string | null; speaker: string | null } {
  const lines = tedTalkField.trim().split('\n').filter(line => line.trim());

  let url: string | null = null;
  let title = '';
  let speaker: string | null = null;

  for (const line of lines) {
    if (line.startsWith('http')) {
      url = line.trim();
    } else if (line.includes(':')) {
      // Format: "Speaker Name: Talk Title" or "Title"
      const parts = line.split(':');
      if (parts.length >= 2) {
        speaker = parts[0].trim();
        title = parts.slice(1).join(':').trim();
      } else {
        title = line.trim();
      }
    } else if (!line.startsWith('alt')) {
      title = line.trim();
    }
  }

  // Extract speaker from title if not already extracted
  if (!speaker && title.includes(':')) {
    const parts = title.split(':');
    speaker = parts[0].trim();
    title = parts.slice(1).join(':').trim();
  }

  return { title, url, speaker };
}

/*
  //
  // manually disabled on 2025-12-12.
  // the cards should never change in this application. 
  // the slugs are good and the image files are correctly connected. 
  // preserved for reference during refactor.
  //

export function getCardImageUrl(cardName: string, suit: string | null, number: number | null): string {
  // All high-res images are in /images/cards/ with kebab-case filenames matching the slug
  // e.g., /images/cards/the-fool.jpg, /images/cards/ace-of-cups.jpg

  let slug: string;

  if (suit === null) {
    // Major Arcana: "The Fool" -> "the-fool"
    slug = generateSlug(cardName);
  } else {
    // Minor Arcana: construct the full name first
    // e.g., "Wands" + 1 -> "Ace of Wands" -> "ace-of-wands"
    const numberNames: Record<number, string> = {
      1: 'Ace',
      2: 'Two',
      3: 'Three',
      4: 'Four',
      5: 'Five',
      6: 'Six',
      7: 'Seven',
      8: 'Eight',
      9: 'Nine',
      10: 'Ten',
      11: 'Page',
      12: 'Knight',
      13: 'Queen',
      14: 'King',
    };

    const numberName = number !== null ? numberNames[number] : '';
    const fullName = `${numberName} of ${suit}`;
    slug = generateSlug(fullName);
  }

  return `/images/cards/${slug}.jpg`;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars except dash and space
    .replace(/\s+/g, '-')      // Replace spaces with dash
    .replace(/-+/g, '-')       // Replace multiple dashes with single
    .trim();
}

export function getCardNumber(cardName: string): number | null {
  // For minor arcana court cards
  const courtMap: Record<string, number> = {
    'page': 11,
    'knight': 12,
    'queen': 13,
    'king': 14,
  };

  const lowerName = cardName.toLowerCase();

  // Check if it's a court card
  for (const [court, num] of Object.entries(courtMap)) {
    if (lowerName.includes(court)) {
      return num;
    }
  }

  // Check if it's ace
  if (lowerName.includes('ace')) {
    return 1;
  }

  // Extract number from card name (e.g., "Two of Cups" -> 2)
  const numberWords: Record<string, number> = {
    'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  };

  for (const [word, num] of Object.entries(numberWords)) {
    if (lowerName.includes(word)) {
      return num;
    }
  }

  return null;
}
*/