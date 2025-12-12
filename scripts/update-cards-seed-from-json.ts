import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface CardFullMeaning {
  slug: string;
  keywords: string[];
  summary: string;
  uprightMeaning: string;
  reversedMeaning: string;
  symbolism: string;
  adviceWhenDrawn: string;
  journalingPrompts: string[];
  astrologicalCorrespondence: string;
  numerologicalSignificance: string;
}

interface CardSeedData {
  slug: string;
  name: string;
  arcanaType: 'major' | 'minor';
  suit: 'wands' | 'cups' | 'swords' | 'pentacles' | null;
  number: number;
  sequenceIndex: number;
  imageUrl: string;
  keywords: string;
  summary: string;
  uprightMeaning: string;
  reversedMeaning: string;
  symbolism?: string;
  adviceWhenDrawn?: string;
  journalingPrompts?: string;
  astrologicalCorrespondence?: string;
  numerologicalSignificance?: string;
}

async function updateCardsSeed() {
  // Read the JSON file with full meanings
  const jsonPath = join(process.cwd(), 'docs', 'fullmeaning_cards.json');
  const jsonContent = readFileSync(jsonPath, 'utf-8');
  const fullMeanings: CardFullMeaning[] = JSON.parse(jsonContent);

  console.log(`✅ Loaded ${fullMeanings.length} cards from JSON`);

  // Create a map for quick lookup
  const meaningsMap = new Map<string, CardFullMeaning>();
  fullMeanings.forEach(card => {
    meaningsMap.set(card.slug, card);
  });

  // Read existing cards.ts to get the structure
  const cardsPath = join(process.cwd(), 'lib', 'db', 'seed-data', 'cards.ts');
  const existingContent = readFileSync(cardsPath, 'utf-8');

  // Helper to escape strings for TypeScript
  const escapeString = (str: string): string => {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  };

  // Helper to format card object
  const formatCard = (slug: string, name: string, arcanaType: string, suit: string | null, number: number, sequenceIndex: number): string => {
    const meaning = meaningsMap.get(slug);

    if (!meaning) {
      console.warn(`⚠️  No full meaning found for: ${slug}`);
      return '';
    }

    const imageUrl = `/images/cards/${slug}.jpg`;

    let card = `  {\n`;
    card += `    slug: '${slug}',\n`;
    card += `    name: '${name}',\n`;
    card += `    arcanaType: '${arcanaType}' as const,\n`;
    card += `    suit: ${suit ? `'${suit}'` : 'null'},\n`;
    card += `    number: ${number},\n`;
    card += `    sequenceIndex: ${sequenceIndex},\n`;
    card += `    imageUrl: '${imageUrl}',\n`;
    card += `    keywords: JSON.stringify(${JSON.stringify(meaning.keywords)}),\n`;
    card += `    summary: '${escapeString(meaning.summary)}',\n`;
    card += `    uprightMeaning: '${escapeString(meaning.uprightMeaning)}',\n`;
    card += `    reversedMeaning: '${escapeString(meaning.reversedMeaning)}',\n`;
    card += `    symbolism: '${escapeString(meaning.symbolism)}',\n`;
    card += `    adviceWhenDrawn: '${escapeString(meaning.adviceWhenDrawn)}',\n`;
    card += `    journalingPrompts: JSON.stringify(${JSON.stringify(meaning.journalingPrompts)}),\n`;
    card += `    astrologicalCorrespondence: '${escapeString(meaning.astrologicalCorrespondence)}',\n`;
    card += `    numerologicalSignificance: '${escapeString(meaning.numerologicalSignificance)}',\n`;
    card += `  }`;

    return card;
  };

  // Build the new file content
  let newContent = `import { generateSlug } from './helpers';\n\n`;
  newContent += `// Major Arcana (0-21)\n`;
  newContent += `const majorArcanaCards = [\n`;

  // Major Arcana cards
  const majorArcana = [
    { slug: 'the-fool', name: 'The Fool', number: 0 },
    { slug: 'the-magician', name: 'The Magician', number: 1 },
    { slug: 'the-high-priestess', name: 'The High Priestess', number: 2 },
    { slug: 'the-empress', name: 'The Empress', number: 3 },
    { slug: 'the-emperor', name: 'The Emperor', number: 4 },
    { slug: 'the-hierophant', name: 'The Hierophant', number: 5 },
    { slug: 'the-lovers', name: 'The Lovers', number: 6 },
    { slug: 'the-chariot', name: 'The Chariot', number: 7 },
    { slug: 'strength', name: 'Strength', number: 8 },
    { slug: 'the-hermit', name: 'The Hermit', number: 9 },
    { slug: 'wheel-of-fortune', name: 'Wheel of Fortune', number: 10 },
    { slug: 'justice', name: 'Justice', number: 11 },
    { slug: 'the-hanged-man', name: 'The Hanged Man', number: 12 },
    { slug: 'death', name: 'Death', number: 13 },
    { slug: 'temperance', name: 'Temperance', number: 14 },
    { slug: 'the-devil', name: 'The Devil', number: 15 },
    { slug: 'the-tower', name: 'The Tower', number: 16 },
    { slug: 'the-star', name: 'The Star', number: 17 },
    { slug: 'the-moon', name: 'The Moon', number: 18 },
    { slug: 'the-sun', name: 'The Sun', number: 19 },
    { slug: 'judgement', name: 'Judgement', number: 20 },
    { slug: 'the-world', name: 'The World', number: 21 },
  ];

  majorArcana.forEach((card, index) => {
    const cardStr = formatCard(card.slug, card.name, 'major', null, card.number, index);
    if (cardStr) {
      newContent += cardStr;
      if (index < majorArcana.length - 1) newContent += ',\n';
    }
  });

  newContent += `\n];\n\n`;

  // Minor Arcana
  const suits = ['wands', 'cups', 'swords', 'pentacles'];
  const minorCards: any[] = [];

  suits.forEach((suit, suitIndex) => {
    const suitCards = [
      { name: `Ace of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`, rank: 'Ace', number: 1 },
      { name: `Two of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`, rank: 'Two', number: 2 },
      { name: `Three of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`, rank: 'Three', number: 3 },
      { name: `Four of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`, rank: 'Four', number: 4 },
      { name: `Five of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`, rank: 'Five', number: 5 },
      { name: `Six of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`, rank: 'Six', number: 6 },
      { name: `Seven of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`, rank: 'Seven', number: 7 },
      { name: `Eight of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`, rank: 'Eight', number: 8 },
      { name: `Nine of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`, rank: 'Nine', number: 9 },
      { name: `Ten of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`, rank: 'Ten', number: 10 },
      { name: `Page of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`, rank: 'Page', number: 11 },
      { name: `Knight of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`, rank: 'Knight', number: 12 },
      { name: `Queen of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`, rank: 'Queen', number: 13 },
      { name: `King of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`, rank: 'King', number: 14 },
    ];

    suitCards.forEach((card, cardIndex) => {
      const slug = `${card.rank.toLowerCase()}-of-${suit}`;
      const sequenceIndex = 22 + (suitIndex * 14) + cardIndex;
      minorCards.push({ slug, name: card.name, suit, number: card.number, sequenceIndex });
    });
  });

  newContent += `// Minor Arcana (56 cards)\n`;
  newContent += `const minorArcanaCards = [\n`;

  minorCards.forEach((card, index) => {
    const cardStr = formatCard(card.slug, card.name, 'minor', card.suit, card.number, card.sequenceIndex);
    if (cardStr) {
      newContent += cardStr;
      if (index < minorCards.length - 1) newContent += ',\n';
    }
  });

  newContent += `\n];\n\n`;
  newContent += `export const cardsSeedData = [...majorArcanaCards, ...minorArcanaCards];\n`;

  // Write the new file
  writeFileSync(cardsPath, newContent, 'utf-8');
  console.log(`✅ Updated cards.ts with ${majorArcana.length + minorCards.length} cards`);
}

updateCardsSeed();
