import { db } from '../lib/db';
import { cards } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

const fiveOfCupsData = {
  uprightMeaning: "The Five of Cups reflects **loss, bitterness, disappointment, and melancholy**. The number five, corresponding to Geburah, always marks a point of conflict and struggle in the suit's narrative, leading to constraint or pain. The card portrays a fixation on what has been lost (three spilled cups) rather than acknowledging what remains (two upright cups).\n\nThis card is often associated with addiction and the emotional challenges of long-term relationships, sometimes signifying marriage accompanied by frustration or bitterness. The figure is cloaked in sadness, unable to move past the immediate loss and embrace transformation or salvation, symbolized by the barrier of the river and bridge.",
  reversedMeaning: "The reversed card suggests **news, alliances, affinity, consanguinity, ancestry, return, or false projects**. This may indicate that the figure is finally turning around to confront the loss and seek new connections or return to supportive relationships. It can also warn that current attempts to forge alliances or projects are rooted in self-pity or deceptive motivations (false projects).",
  symbolism: "A dark, cloaked figure stands near three spilled cups, their liquid pooling, while two cups remain upright behind him. The figure turns his back on the upright cups, symbolizing fixation on loss. A bridge crosses a river in the distance, leading to a manor house (a symbol of inheritance or legacy). The **black cloak** symbolizes deep melancholy or the emotional intensity of the situation. The cups ooze a mysterious liquid, reflecting the Loss of Pleasure, the esoteric title of the card.",
  adviceWhenDrawn: "Acknowledge the pain of your loss, but consciously shift your focus to the resources and support that remain. Seek to cross the bridge into a new perspective by releasing the emotional bondage to the past, recognizing that transformation is possible.",
  journalingPrompts: JSON.stringify(["What loss am I currently fixating on?", "What resources or support do I have that I'm ignoring?", "How can I turn around and embrace what still stands?", "What bridge must I cross to move forward?"]),
  astrologicalCorrespondence: "Mars in Scorpio.",
  numerologicalSignificance: "Five (5) represents force and strength (Geburah), marking confrontation and conflict that imposes physical limits.",
  updatedAt: new Date()
};

(async () => {
  await db.update(cards).set(fiveOfCupsData).where(eq(cards.slug, 'five-of-cups'));
  console.log('✓ Updated: Five of Cups');
  process.exit(0);
})();
