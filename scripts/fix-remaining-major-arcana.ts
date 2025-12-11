import { db } from '../lib/db';
import { cards } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

const remainingCards = [
  {
    slug: 'wheel-of-fortune',
    uprightMeaning: "The Wheel of Fortune symbolizes **cosmic momentum, fate, and cyclical change**. It represents the perpetual motion of a fluid universe and the **flux of human life**, reminding us that time is pliable and events exist on multiple levels (inner and outer time). Moderated by equilibrium (the Sphinx) and Divine Providence, the Wheel signifies a **reversal of current fortune**—a change of position arising from what has passed before. It is the cosmic odometer, recording traces of the deity at every level of life.",
    reversedMeaning: "Reversed meanings include increase, abundance, or superfluity. This often signifies that change is stagnating or being resisted,. It can also signal a loss of perspective, where the querent is overly focused on exterior luck while missing the underlying stability (the Sphinx).",
    symbolism: "A central **Wheel** contains the letters **TARO (or ROTA, 'wheel')** and the four Hebrew letters of the Tetragrammaton (YHVH),,. A **Sphinx** sits atop the wheel, symbolizing equilibrium and stability amidst movement,. The **four creatures (Tetramorphs)** in the corners (Man, Lion, Ox, Eagle) represent the four Evangelists and the four elements,. The snake (Typhon) and Hermanubis ascend and descend the wheel's sides.",
    adviceWhenDrawn: "Embrace the flux and flow of life, recognizing that your current situation is subject to change,. Make every effort to stay centered (the Sphinx) and trust that Providence is woven into the universal momentum,.",
    journalingPrompts: ["Where is natural energy moving me?", "What is the riddle I must solve?", "What is exiting?", "Where do I need to be strong?"],
    astrologicalCorrespondence: "Jupiter. Hebrew Letter: Kaph,.",
    numerologicalSignificance: "Ten (10) represents the Kingdom (Malkuth) and the **complete manifestation**. It signifies success, completion, and the final state of existence in the material world,."
  },
  {
    slug: 'the-moon',
    uprightMeaning: "The Moon symbolizes **illusion, imagination, and the subconscious depths**. It represents **uncertainty, psychic energy, and the path into the unknown** guided by intuition (reflected lunar light),. It is the card of myth and monster, reminding us that life is in a constant state of flux, where familiar things can be transformed into the uncanny,,. The Moon reflects the shadow self, urging confrontation with secrets and dark fantasies for healing.",
    reversedMeaning: "Reversed meanings include instability, inconstancy, silence, and lesser degrees of deception and error. This suggests being overwhelmed by psychic energy or being trapped by the mental terror of moving from the known into the unknown,.",
    symbolism: "A path meanders between **two white towers**,. A **dog and a wolf** bay at the Moon above, symbolizing tamed and wild animal nature, and the fears of the natural mind,,. A **crawfish** emerges from a pool (the subconscious depths). The **Moon** displays a face surrounded by thirty-two rays (paths on the Tree of Life). The Moon reflects the \"life of the imagination apart from life of the spirit\".",
    adviceWhenDrawn: "Trust your intuition and recognize that you are navigating uncertainty,. Embrace the current flux and flow, knowing that things will change. Explore your dreams and subconscious depths for hidden truths.",
    journalingPrompts: ["What false towers have I built?", "What does intuitive clarity tell me?", "What is my subconscious showing me?", "What is emerging from the depths of my soul?"],
    astrologicalCorrespondence: "Pisces,. Hebrew Letter: Qoph,.",
    numerologicalSignificance: "Eighteen (18) relates to illusion, imagination, and the depths of the subconscious."
  }
];

async function fixRemainingCards() {
  console.log('Fixing remaining Major Arcana cards...\n');

  for (const card of remainingCards) {
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
  }

  console.log('\n✅ Remaining Major Arcana cards fixed!');
  process.exit(0);
}

fixRemainingCards();
