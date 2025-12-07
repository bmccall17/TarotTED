// Helper functions for generating image URLs and slugs

export function getCardImageUrl(cardName: string, suit: string | null, number: number | null): string {
  // Major Arcana: /images/cards/major-arcana/00-The-Fool.jpg
  if (suit === null) {
    const paddedNumber = String(number).padStart(2, '0');
    return `/images/cards/major-arcana/${paddedNumber}-${cardName}.jpg`;
  }

  // Minor Arcana: /images/cards/cups/Cups1.jpg (1-14)
  const suitLower = suit.toLowerCase();
  const suitCap = suit.charAt(0).toUpperCase() + suit.slice(1);
  return `/images/cards/${suitLower}/${suitCap}${number}.jpg`;
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
