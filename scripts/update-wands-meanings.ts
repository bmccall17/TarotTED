import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { cards } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

const getConnectionString = () => {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required');
  }
  return connectionString;
};

const wandsMeanings = [
  {
    name: "Ace of Wands",
    uprightMeaning: "The Ace of Wands reflects the initial spark of desire and the rush of fire ignited by romantic attraction, spiritual calling, or a new creative project. It is pure energy, virility, and strength, representing the starting point of passionate undertakings and a force with the power to change the course of your life. This card is the **root or seed of the element of fire**.\n\nFire marks our blood, passions, and hungers, defining the entire suit of careers, desires, and spirituality. The energy of the Ace, when used safely, nurtures and warms, but carries the potential to consume and incinerate when used carelessly. Its appearance in a reading signifies an extremely favorable beginning in matters of will and ambition.",
    reversedMeaning: "The reversed Ace of Wands traditionally signifies fall, decadence, ruin, perdition, or a **clouded joy**. This indicates a lack of enterprise or a situation where a powerful creative or passionate impulse is blocked or misused, leading to destruction or exhaustion. The challenge is often allowing the uncontained fire to rage out of control, resulting in ruin or failure to manifest the initial spark of potential.",
    symbolism: "An **angelic hand issues from a cloud** grasping a **stout wand or club**. The hand's stark whiteness contrasts with other figures, reflecting radiance, and its tight grip holds the masculine element of fire. The wand itself is phallic, symbolizing the outward nature of masculine energy. The wand has branches and leaves that represent the **ten Sephiroth** on the Tree of Life. The presence of a **house or castle** in the background reflects domesticity and security, while **water** suggests the forward flow of a journey away from home.",
    adviceWhenDrawn: "Use the spark of pure energy to initiate enterprise or a creative idea, following your passion and recognizing the strength available to you. Direct your focused intention toward your goals and trust the energy that motivates you.",
    journalingPrompts: ["What is the nature of my passion?", "What single action helps me to achieve it?", "Where will my passions take me if I follow up on them?", "What will emerge as I remain in tune to the stirrings within me?"],
    astrologicalCorrespondence: "Root of Fire. Element: Fire.",
    numerologicalSignificance: "One (1) represents the spark, beginning, pure wholeness, and ultimate creativity."
  },
  {
    name: "Two of Wands",
    uprightMeaning: "The Two of Wands signifies **mastery and dominion**, reflecting the realization of pure energy into a concrete plan for an enterprise. This card embodies the **Lord of Dominion**, suggesting mastery of one's circumstances, often seen as plotting and planning the next stage of action. The energy has doubled from the initial spark of the Ace.\n\nIt speaks to the necessity of weighing **dual opportunities** carefully and making strategic alliances. It represents cleverness and daring action, focusing on **execution** rather than folly. The energy is expansive but controlled, urging the querent to survey the landscape from a position of strength before making their move.",
    reversedMeaning: "The reversed Two of Wands traditionally indicates surprise, wonder, enchantment, emotion, trouble, or fear. This suggests that the doubling of energy has led to chaos, or the difficulty of choosing between dual opportunities causes confusion and emotional distress. It may also signal physical suffering or sadness arising from internal strife or external forces.",
    symbolism: "The figure surveys the landscape from a battlement, holding a **globe** in one hand and a **wand** in the other. He stands between two wands, aligning him with the **middle pillar of the Tree of Life**. The **Rose and Lily** are noted on the left side, symbolizing the sun and the moon and creating a **Rosy Cross**, connecting the figure to esoteric concepts of union and transformation. The globe symbolizes having the world at your fingertips and the power of intention.",
    adviceWhenDrawn: "Plot and plan your enterprise carefully, leveraging your power and dominion over the situation. Weigh your options before making your move, ensuring your actions are well-executed and purposeful.",
    journalingPrompts: ["What do I envision?", "How do I infuse authenticity in my work?", "What is my next small step?", "How do I remain open to divine inspiration?"],
    astrologicalCorrespondence: "Mars in Aries.",
    numerologicalSignificance: "Two (2) reflects energetic duality, often implying initiation and fecundation of a thing, requiring careful balance."
  },
  {
    name: "Three of Wands",
    uprightMeaning: "The Three of Wands signifies **established strength**, enterprise, effort, trade, commerce, and discovery. It moves the action forward into the execution phase, reflecting the energetic process of casting intention out into the world. The card suggests that the merchant prince is looking to aid the querent, signifying **able cooperation in business** and impending help.\n\nThis card reflects a maturity of self, standing at the forefront and taking responsibility for what has been generated. The appearance of this card encourages patience, urging the individual to trust that the ripples of cause and effect are already visible and that results will appear in time. It reflects the triplicity of fire coaxed into a purposeful direction.",
    reversedMeaning: "Reversed, the card traditionally means **the end of troubles, suspension or cessation of adversity**, toil, and disappointment. In a negative context, a reversal can suggest momentum is blocked or that a failure to follow through on the plan has led to delay or disappointment.",
    symbolism: "A figure stands with his back to the viewer on a cliff's edge, gazing out at three **ships sailing over the sea**. The figure stands between **three wands**, reflecting the three pillars of the Tree of Life (the spiritual triad). The ships symbolize desires, intentions, and material goods being set forth into the world. The setting (sea, cliff, and distant land) suggests the journey is ongoing, and **action has commenced**. The card is also linked to the **Fisher King** of Arthurian legend, suggesting the healing power of insight.",
    adviceWhenDrawn: "Trust the action already in motion and remain patient, knowing that your passionate ideas are generating results. Trust that you will receive help, even if in surprising and unanticipated ways.",
    journalingPrompts: ["What victory should I be celebrating right now?", "What can I do to remain steady?", "What wisdom do I possess?", "What response should I remain open to?"],
    astrologicalCorrespondence: "Sun in Aries.",
    numerologicalSignificance: "Three (3) represents triplicity, creation, realization, and perfection, fixing a matter."
  },
  {
    name: "Four of Wands",
    uprightMeaning: "The Four of Wands signifies **perfected work** and the achievement of stability and structure in a pursuit. It is a card of **celebration, repose, concord, and harmony**, marking a haven of refuge after hard work. The card suggests a return to the natural world and a feeling of peace and prosperity.\n\nThis is a signal to share joy and enthusiasm with others, reinforcing that shared happiness is richer than solitude. The presence of this card indicates that **success is assured** and that your passionate pursuits have stabilized in a healthy, sustainable manner.",
    reversedMeaning: "The reversed meaning **remains unaltered** in its core themes of **prosperity, increase, felicity, beauty, and embellishment**. If a negative influence is present, it suggests that internal emotional issues might be preventing the full enjoyment of the outward prosperity.",
    symbolism: "Four wands are planted in the foreground, forming a structure that supports a **garland**. This canopy or chuppah is a symbol of celebration. **Roses in the garland** symbolize Venus and passion. **Two female figures** uplift nosegays, signifying the festival spirit. A **bridge over a moat** leads to an old **manorial house**, symbolizing passage between realities and ancestral roots. The number four indicates **stability**.",
    adviceWhenDrawn: "Celebrate your success and embrace the peace and harmony you have achieved. Focus on stabilizing your passion in a steady, healthy, sustainable manner.",
    journalingPrompts: ["What is blooming?", "What reason do I have to celebrate?", "How do I protect my passion in a sustainable way?", "What is the long term aspiration?"],
    astrologicalCorrespondence: "Venus in Aries.",
    numerologicalSignificance: "Four (4) represents stability, foundation, and structure, symbolizing completion on a basic level."
  },
  {
    name: "Five of Wands",
    uprightMeaning: "The Five of Wands reflects **strife, mimic warfare, and sharp competition**, connecting to the deeper \"battle of life\". The unity of the Four is disrupted by conflict, struggle for riches, and gold. This conflict or **friction** is often necessary, leading to explosive results and required evolution, reflecting the intense nature of fire energy.\n\nWhile often depicted as a struggle, the card can represent a playful scramble or lively debate of ideas. The spiritual challenge here is discerning what is truly **worth fighting for** and avoiding the consumption of fire's bloodlust. The number five marks the halfway point of the suit's journey, making struggle and challenge imminent.",
    reversedMeaning: "Reversed, the card indicates litigation, disputes, trickery, and contradiction. This suggests that the competition has become malicious or that genuine progress is hindered by external conflict. The inner work required is surrendering resistance to allow for creative solutions.",
    symbolism: "Five youths brandish and cross wands against one another, as if in **sport or strife**. The collective position of the wands forms a **magical pentagram**, suggesting the uniting power of passion, even amid conflict. The figures represent a **posse of youths**. The scene reflects the **incendiary nature** of conflict and the potential for combustion.",
    adviceWhenDrawn: "Address competition by striving with tenacity and boldness, but anchor yourself in the present moment to avoid becoming reactive. Surrender the ego and look for creative solutions to transform the energy of strife.",
    journalingPrompts: ["Why am I so worked up?", "What is at stake?", "How can I transform the energy into a healing force?", "How do I cultivate the strength I need to wrap this up?"],
    astrologicalCorrespondence: "Saturn in Leo.",
    numerologicalSignificance: "Five (5) represents force and strength (Geburah), signifying opposition, struggle, and the necessary imposition of limits."
  },
  {
    name: "Six of Wands",
    uprightMeaning: "The Six of Wands is the **Lord of Victory**, symbolizing triumph, great news, and assurance of success. It is an achievement card, often depicted as a **victory parade** where a laurelled horseman is celebrated by footmen. The achievement signifies **expectation crowned with its own desire**.\n\nThis card appears as a reward for past experience and through challenging times. The theme is also related to the generous heart center (Tiphareth), urging the querent to give freely, as reflected in the idea of a courier bringing good news. However, as with all sixes, it implies a hierarchy or **separation** between people (the celebrated figure and the crowd).",
    reversedMeaning: "Reversed, the card suggests **apprehension, fear**, treachery, disloyalty, or **indefinite delay**. This may signal that internal fear or resistance is impeding the recognition of the victory, or external betrayal is jeopardizing success.",
    symbolism: "A laurelled horseman carries a staff crowned with a **laurel wreath**. The figure rides in a procession with **footmen** carrying staves, indicating collective support. The **wreath** symbolizes triumph and victory. The energy reflects a **ride** rather than a destination. The card suggests **victory after strife**.",
    adviceWhenDrawn: "Embrace the achievement you have earned and allow yourself to be recognized and celebrated. Look to cultivate allies and continue paving the road to your goal, knowing that success is assured.",
    journalingPrompts: ["What keeps me focused on my long-term goal?", "Where can I cultivate allies?", "What can I always rely on?", "What great lesson am I learning?"],
    astrologicalCorrespondence: "Jupiter in Leo.",
    numerologicalSignificance: "Six (6) is the heart center (Tiphareth), signifying beauty, achievement, and a force transcending the Material Plane."
  },
  {
    name: "Seven of Wands",
    uprightMeaning: "The Seven of Wands signifies **valor, successful defense, and the ability to fight off opposition** from a position of advantage. It is the **Lord of Valor**. This card appears during times of confrontation, whether that is **wordy strife** in intellectual debate, a war of trade in business, or defending personal passions.\n\nIt is a card of **success** because the combatant holds the high ground, suggesting that challenges are ultimately tests of inner strength. The number seven relates to endurance and perseverance in adversity. The core message is to **stand up for what you believe in**, even if you feel alone in the battle.",
    reversedMeaning: "Reversed, the card means perplexity, embarrassments, anxiety, and is a **caution against indecision**. This suggests that the confusion of the conflict is leading to uncertainty, blocking the valor needed to achieve success.",
    symbolism: "A man stands on **craggy eminence**, defending himself with a staff against six staves raised below him. He wears **mismatched footwear** (one boot, one slipper) which may symbolize a rapid exit, opposing choices, or deception. The visual design intentionally links to **Petruchio** from *The Taming of the Shrew*, underscoring the theme of a battle of words. The figure's high position represents holding the vantage position.",
    adviceWhenDrawn: "Cultivate valor and fortitude; meet opposition and challenges boldly, trusting your strength. Use your strong internal foundation to defend your passions and beliefs, as you hold the advantage.",
    journalingPrompts: ["What am I defending?", "What am I up against?", "What is my advantage?", "What will blossom if I stay the course...?"],
    astrologicalCorrespondence: "Mars in Leo.",
    numerologicalSignificance: "Seven (7) reflects victory (Netzach), endurance, and solitary success in the matter for the time being."
  },
  {
    name: "Eight of Wands",
    uprightMeaning: "The Eight of Wands is the **Lord of Swiftness**, representing **activity, great haste, and speed** toward assured felicity. It signifies a moment when intention is in flight and **events are unfolding lightning-fast**. This card suggests **travel, movement**, and a dramatic turning point.\n\nIt reflects the cosmic \"call and response\" of the universe, where intentions sent out return **threefold** (karmic action). The energy moves with natural ease, indicating that objectives put into motion are swiftly moving toward their end.",
    reversedMeaning: "Reversed, the card indicates **arrows of jealousy, internal dispute, stingings of conscience, quarrels**, and domestic disputes. This suggests that the momentum and swift action are blocked by emotional conflict or internal moral failings, preventing a favorable outcome.",
    symbolism: "**Eight wands fly through the air** toward an unknown destination, resembling arrows of love. The landscape below is fertile, with a river and a house, suggesting **forward flow** and generative power. The design visually represents **motion through the immovable**. The wands are mid-flight, marking the space between wish and culmination.",
    adviceWhenDrawn: "Act with swiftness and great haste, as this is the time for activity in all your undertakings. Trust the speed of events and prepare for assured felicity and movement.",
    journalingPrompts: ["What is the nature of my intention?", "How does my intention help others?", "What secret do I need to know?", "How can I steer clear and shoot over the obstacle?"],
    astrologicalCorrespondence: "Mercury in Sagittarius.",
    numerologicalSignificance: "Eight (8) symbolizes splendor (Hod), swift flow, and executive power, restoring a firm basis."
  },
  {
    name: "Nine of Wands",
    uprightMeaning: "The Nine of Wands is the **Lord of Great Strength**, signifying fortitude, **strength in opposition**, delay, and preparedness against attack. It is a quintessential **threshold card**, marking the passage from a painful past cycle into a new reality. The energy reflects pushing barriers and shattering a glass ceiling through **energetic reserves**.\n\nThis card appears when the individual is a **survivor**, holding on to ideals and passion despite being wounded. The **bandage on the head** symbolizes that every wound carries a lesson, providing wisdom. The querent is urged to maintain defenses, as strength and fortitude have been earned.",
    reversedMeaning: "Reversed, the card suggests **obstacles, adversity, and calamity**. This indicates that the necessary fortitude is lacking, or the past wounds (symbolized by the bandage) are preventing the individual from moving through the threshold and embracing the new cycle.",
    symbolism: "A figure leans on a staff, facing the past, with **eight erect staves** behind him forming a fence. The **bandage on his head** symbolizes recovery from sickness or past strife. The figure is preparing to meet opposition. The overall scene reflects a **boundary line** between the inner and outer worlds. The mountains signify the **unlimited potential** that stands in the distance.",
    adviceWhenDrawn: "Maintain your strength and fortitude, as you have earned this position. Be persistent and persistent in breaking barriers, knowing that every challenge you face reveals your deep resilience.",
    journalingPrompts: ["What is the wound that lets in the light?", "What stands before me?", "What do I have at my disposal as I move forward?", "What should I be wary of?"],
    astrologicalCorrespondence: "Moon in Sagittarius.",
    numerologicalSignificance: "Nine (9) represents foundation (Yesod), fixed, culminated, and complete force, marking the threshold before final manifestation."
  },
  {
    name: "Ten of Wands",
    uprightMeaning: "The Ten of Wands is the **Lord of Oppression**, signifying burden, false-seeming, and a kind of **success which itself becomes an oppression**. It represents the **end of a cycle** and the final stage of energetic reserves, leading to deep soul exhaustion. The figure carries the weight of all ten staves, bearing responsibility for his actions, accomplishments, or previous desires.\n\nThis card carries multiple meanings, including the **unintended consequence of gaining what is desired** (e.g., riches bringing crushing responsibility). The culmination of energy leads to a need for rest and regeneration, indicating that the situation has fully manifested and is drawing to a close.",
    reversedMeaning: "Reversed, the card suggests **contrarieties, difficulties, intrigues**, and their analogies. This signals that the burden is being resisted or that internal conflicts are frustrating the conclusion of the cycle. It can also warn that the approaching situation may suffer from the \"rods that he carries,\" indicating potential harm to others.",
    symbolism: "A figure is hunched over, carrying **ten wands** that look like the Ten of Swords from the Sola Busca deck, symbolizing the **physical toll of hard work**. He walks toward a **small estate**, signaling a safe haven awaits. The background implies a **plowed field**, ready for new beginnings. The entire image signifies **energy exhaustion**.",
    adviceWhenDrawn: "Acknowledge the end of this cycle and put down your burdens. Honor the need for rest and regeneration before embarking on new tasks, and be mindful of the unexpected consequences of past success.",
    journalingPrompts: ["How can I put down my burdens?", "Where can I go to rest and rejuvenate?", "What will appear as a result of my work?", "How can I quiet my mental chatter and learn to focus on my inner self?"],
    astrologicalCorrespondence: "Saturn in Sagittarius.",
    numerologicalSignificance: "Ten (10) represents Malkuth (Kingdom), finality, and the culmination or complete force of the cycle."
  },
  {
    name: "Page of Wands",
    uprightMeaning: "The Page of Wands represents the youthful, **unformed energy** of fire and the **purity of passion** in its primal stages. This card signifies a **bearer of fresh news or tidings**, application, and self-expression. The energy is excitable and charismatic, reflecting someone who is completely immersed in what thrills them.\n\nThe Page is often associated with the **inner child** or the innate curiosity that leads to exploring unique talents and dreams. It suggests that success comes from focusing attention fully on one's passion, allowing the past and future to slip away while living in the present.",
    reversedMeaning: "Reversed, the Page signifies **anecdotes, announcements, evil news**, **indecision**, and the instability that accompanies it. This suggests that the initial passionate energy is scattered or blocked, leading to a lack of focus or discipline. It may indicate that the incoming news is delayed or unfavorable.",
    symbolism: "The figure wears costuming with black and yellow **salamanders** (fire lizards). A **red flame feather** protrudes from his cap, indicating the fire quality. He holds a wand and gazes at the tip, symbolizing focus on the ultimate act of **manifestation**. **Three pyramids** stand in the background, echoing the Page's creative nature.",
    adviceWhenDrawn: "Embrace new beginnings and apply laser-like dedication to something that truly fascinates you. Trust the innocence of your curiosity to guide your self-expression and creative pursuits.",
    journalingPrompts: ["What stokes my passion?", "Where do I need to go?", "What sacred knowledge is learned when I am adventuring?", "How do I stay grounded and centered while circumstances and places change around me?"],
    astrologicalCorrespondence: "Earth of Fire. Element: Fire.",
    numerologicalSignificance: "Page represents unformed energy, marking the beginning or primary stage of their suit."
  },
  {
    name: "Knight of Wands",
    uprightMeaning: "The Knight of Wands is the essence of **unbridled and uncontrolled passion**, often characterized by hasty action, discord, and emigration. He is the expression of **teenage energy**—exciting, impetuous, and charismatic. His appearance signals **departure, absence, flight**, and change of residence.\n\nThis Knight is hot to the touch and represents a powerful force of change, such as the rush of romantic love or the **endorphin rush** that comes from pushing through a challenging task. However, his power can cause trouble if it goes unchecked, as he operates quickly and asks questions later.",
    reversedMeaning: "Reversed, the Knight suggests **rupture, division, interruption, and discord**. This indicates that the fiery energy is destructive and causing chaos, leading to conflict or emotional fragmentation. The unbridled passion is misdirected, often resulting in temporary failure or haste that needs correction.",
    symbolism: "The Knight rides a horse at a **breakneck pace**, reflecting hasty results. He is armored but decorated with black and yellow **salamanders** (fire lizards) on his costuming. A **red plume** explodes from his helmet like a burst of flame. The **motion of the horse** is a key to the rider's precipitate mood. The mountains in the background denote **ancient spiritual knowledge**.",
    adviceWhenDrawn: "Utilize this explosive energy to move your goals toward completion, but exercise caution. Balance your fiery passion with thoughtful planning to prevent rupture or discord.",
    journalingPrompts: ["How do I best harness my passion?", "What protects the vulnerable parts of myself?", "How does the energy affect my aura?", "What is my ultimate prize?"],
    astrologicalCorrespondence: "Sagittarius (Mutable Fire). Element: Fire.",
    numerologicalSignificance: "Knight represents directed energy, signifying the action or adolescent phase of their suit."
  },
  {
    name: "Queen of Wands",
    uprightMeaning: "The Queen of Wands is the **goddess of fire** and embodies **mature female passion**. She is the **Queen of the Thrones of Flame**. Her energy is extraordinarily magnetic, friendly, chaste, loving, and honorable, bringing success in business. She is the **firecracker** of the deck, energetic and compelling.\n\nShe is characterized by her ability to **execute passion**, expanding it in proactive and marked ways, leading by example. She represents taking what you love and putting it to work in the world, embodying certainty and enjoying every delicious step toward her goals.",
    reversedMeaning: "Reversed meanings include good, economical, obliging, and serviceable, but can also signify **opposition, jealousy, deceit, and infidelity** in certain positions. Blocked Queen energy suggests that powerful creative influence is being misused, or internal insecurities manifest as external opposition and jealousy toward others.",
    symbolism: "She sits on a throne adorned with a **lion** (solar energy, strength). She holds a wand and a **sunflower**, which symbolizes the sun's manifested beauty. A **black cat**, reflecting loyalty, magic, and charisma, sits at her feet. Her costuming is patterned with **salamanders** (fire lizards). The Queen is modeled on **Edy Craig** and her feline companion **Snuffles**.",
    adviceWhenDrawn: "Lead with conviction and trust your passion, knowing that nurturing your desires brings transformation. Focus on expanding your energy in proactive and marked ways.",
    journalingPrompts: ["What is my birthright?", "How can I best harness my energy?", "How do I maintain ownership over my physical body?", "How do I focus energy and attention toward elements that satisfy me?"],
    astrologicalCorrespondence: "Aries (Cardinal Fire). Element: Fire.",
    numerologicalSignificance: "Queen represents experienced energy, signifying the mature feminine command of the suit."
  },
  {
    name: "King of Wands",
    uprightMeaning: "The King of Wands is the **commander of fire**, a charismatic leader and **dynamic instigator of change**. He possesses **valour, honesty, and conscientious** nature, coupled with realizing intelligence. He is the **Lord of the Flame and the Lightning**.\n\nThis King is a visionary who alters the landscape of the world, leading with sweltering emotion yet maintaining control. His focus is set firmly on the goal; he is relentless in the scorching pursuit of desire. He represents the **preacher man and the rock star**, anyone who uses the passion and spirit of their guiding flame to move the world.",
    reversedMeaning: "Reversed, the King is **good, but severe; austere, yet tolerant**. Blocked King energy manifests as tyrannical misuse of charismatic power, often resulting in volatility or being quick to anger. It can suggest a failure to apply his intelligence effectively or excessive control over others.",
    symbolism: "The King is enthroned, associated with the **lion** (solar energy). A **salamander** is placed next to his throne, suggesting his toxic and dangerous nature should be recognized. His cloak is adorned with **grapes** (fecundity). The background denotes security and a kingdom. He holds a **flowering wand**.",
    adviceWhenDrawn: "Take action with focused intention, utilizing your charismatic power to lead and achieve your vision. Be relentless in the pursuit of your desire, but always lead with honesty and intelligence.",
    journalingPrompts: ["What is my vision?", "How does passion inspire direct action?", "What challenges me in obtaining my goal?", "What simple, singular action helps me to achieve it?"],
    astrologicalCorrespondence: "Leo (Fixed Fire). Element: Fire.",
    numerologicalSignificance: "King represents established energy, signifying the mature masculine mastery of the suit."
  }
];

async function updateWandsMeanings() {
  const client = postgres(getConnectionString(), { prepare: false });
  const db = drizzle(client);

  console.log('Starting Wands meanings update...\n');

  try {
    for (const card of wandsMeanings) {
      try {
        console.log(`Updating ${card.name}...`);

        await db
          .update(cards)
          .set({
            uprightMeaning: card.uprightMeaning,
            reversedMeaning: card.reversedMeaning,
            symbolism: card.symbolism,
            adviceWhenDrawn: card.adviceWhenDrawn,
            journalingPrompts: card.journalingPrompts,
            astrologicalCorrespondence: card.astrologicalCorrespondence,
            numerologicalSignificance: card.numerologicalSignificance
          })
          .where(eq(cards.name, card.name));

        console.log(`✓ ${card.name} updated successfully`);
      } catch (error) {
        console.error(`✗ Error updating ${card.name}:`, error);
      }
    }

    console.log('\nWands meanings update complete!');
  } finally {
    // Close the connection properly
    await client.end();
  }
}

updateWandsMeanings();
