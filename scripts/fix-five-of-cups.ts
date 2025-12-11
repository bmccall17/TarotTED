import { db } from '../lib/db';
import { cards } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function fixFiveOfCups() {
  console.log('Fixing Five of Cups...\n');

  const card = {
    slug: 'five-of-cups',
    uprightMeaning: "The Five of Cups reflects **loss, bitterness, disappointment, and melancholy**. The number five, corresponding to Geburah, always marks a point of conflict and struggle in the suit's narrative, leading to constraint or pain. The card portrays a fixation on what has been lost (three spilled cups) rather than acknowledging what remains (two upright cups).\n\nThis card is often associated with addiction and the emotional challenges of long-term relationships, sometimes signifying marriage accompanied by frustration or bitterness. The figure is cloaked in sadness, unable to move past the immediate loss and embrace transformation or salvation, symbolized by the barrier of the river and bridge.",
    reversedMeaning: "The reversed card suggests **news, alliances, affinity, consanguinity, ancestry, return, or false projects**. This may indicate that the figure is finally turning around to confront the loss and seek new connections or return to supportive relationships. It can also warn that current attempts to forge alliances or projects are rooted in self-pity or deceptive motivations (false projects).",
    symbolism: "A dark, cloaked figure stands near three spilled cups, their liquid pooling, while two cups remain upright behind him. The figure turns his back on the upright cups, symbolizing fixation on loss. A bridge crosses a river in the distance, leading to a manor house (a symbol of inheritance or legacy). The **black cloak** symbolizes deep melancholy or the emotional intensity of the situation. The cups ooze a mysterious liquid, reflecting the \"Loss of Pleasure,\" the esoteric title of the card.",
    adviceWhenDrawn: "Acknowledge the pain of your loss, but consciously shift your focus to the resources and support that remain. Seek to cross the bridge into a new perspective by releasing the emotional bondage to the past, recognizing that transformation is possible.",
    journalingPrompts: ["What loss am I currently fixating on?", "What resources or relationships are still available to me?", "Am I being self-restrained and unable to cross the threshold of change?", "How can I heal the sadness caused by past disappointment?"],
    astrologicalCorrespondence: "Mars in Scorpio.",
    numerologicalSignificance: "Five (5) represents force and strength (Geburah), signifying struggle and conflict."
  };

  try {
    const result = await db
      .update(cards)
      .set({
        uprightMeaning: card.uprightMeaning,
        reversedMeaning: card.reversedMeaning,
        symbolism: card.symbolism,
        adviceWhenDrawn: card.adviceWhenDrawn,
        journalingPrompts: JSON.stringify(card.journalingPrompts),
        astrologicalCorrespondence: card.astrologicalCorrespondence,
        numerologicalSignificance: card.numerologicalSignificance,
        updatedAt: new Date(),
      })
      .where(eq(cards.slug, card.slug))
      .returning({ id: cards.id });

    if (result.length > 0) {
      console.log(`✓ Updated: ${card.slug}`);
    } else {
      console.log(`✗ Not found: ${card.slug}`);
    }
  } catch (error) {
    console.error(`Error updating ${card.slug}:`, error);
  }

  console.log('\n✅ Five of Cups fixed!');
  process.exit(0);
}

fixFiveOfCups();
