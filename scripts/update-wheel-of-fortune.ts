import { db } from '../lib/db';
import { cards } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

const wheelData = {
  uprightMeaning: "The Wheel of Fortune symbolizes **cosmic momentum, fate, and cyclical change**. It represents the perpetual motion of a fluid universe and the **flux of human life**, reminding us that time is pliable and events exist on multiple levels (inner and outer time). Moderated by equilibrium (the Sphinx) and Divine Providence, the Wheel signifies a **reversal of current fortune**—a change of position arising from what has passed before. It is the cosmic odometer, recording traces of the deity at every level of life.",
  reversedMeaning: "Reversed meanings include increase, abundance, or superfluity. This often signifies that change is stagnating or being resisted,. It can also signal a loss of perspective, where the querent is overly focused on exterior luck while missing the underlying stability (the Sphinx).",
  symbolism: "A central **Wheel** contains the letters **TARO (or ROTA, 'wheel')** and the four Hebrew letters of the Tetragrammaton (YHVH),,. A **Sphinx** sits atop the wheel, symbolizing equilibrium and stability amidst movement,. The **four creatures (Tetramorphs)** in the corners (Man, Lion, Ox, Eagle) represent the four Evangelists and the four elements,. The snake (Typhon) and Hermanubis ascend and descend the wheel's sides.",
  adviceWhenDrawn: "Embrace the flux and flow of life, recognizing that your current situation is subject to change,. Make every effort to stay centered (the Sphinx) and trust that Providence is woven into the universal momentum,.",
  journalingPrompts: JSON.stringify(["Where is natural energy moving me?", "What is the riddle I must solve?", "What is exiting?", "Where do I need to be strong?"]),
  astrologicalCorrespondence: "Jupiter. Hebrew Letter: Kaph,.",
  numerologicalSignificance: "Ten (10) represents the Kingdom (Malkuth) and the **complete manifestation**. It signifies success, completion, and the final state of existence in the material world,.",
  updatedAt: new Date()
};

(async () => {
  await db.update(cards).set(wheelData).where(eq(cards.slug, 'wheel-of-fortune'));
  console.log('✓ Updated: Wheel of Fortune');
  process.exit(0);
})();
