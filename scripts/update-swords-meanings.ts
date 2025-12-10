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

const swordsMeanings = [
  {
    name: "Ace of Swords",
    uprightMeaning: "The Ace of Swords is the essence of the mind, with **swift, clever execution**, reflecting an excellent idea, intellectual instincts, and **mental acuity**. It is the foundation of the intellectual realm, symbolizing **triumph of force and conquest** in all matters, whether in love or hatred. This card signifies an **intellectual beginning** and the genesis of a swift idea.\n\nThe Ace of Swords is the root of the element of Air, containing everything that is **manifested in the world of thought, calculation, and mental acuity**. The appearance of this card reminds the querent that they already possess life's most transformational tool—the ability to choose their thoughts and direct their energy.",
    reversedMeaning: "Reversed, the Ace of Swords indicates that the results of action are **disastrous**. This reversal suggests **blind aggression, dominance, and power for their own sakes**, being devoid of reason. As the inversion of the sword invokes Demonic Force, it becomes a fearfully evil symbol. Alternatively, an older account suggests it can signify conception, childbirth, augmentation, or multiplicity.",
    symbolism: "An **angelic hand issues from a cloud, grasping a sword**. The sword's point is encircled by a **crown**. The crown represents the Hebrew name for the first Sephirah, Kether, symbolizing the head of creation. The sword is flanked by the **olive branch of Peace** and the **palm branch of suffering**, the latter symbolizing the victory of the soul over the flesh. The hand's tight grip reflects the masculine elemental force of Air. The card is symbolic of the power of the mind and thought, aligning with the suit of Air.",
    adviceWhenDrawn: "Follow your first instinct, as this card suggests a moment of **complete clarity**. Set clear intentions daily to direct your will and focus your consciousness, recognizing you already have mastery over your inner life.",
    journalingPrompts: ["What intellectual goal should I pursue?","What thought/idea/decision should I live by?", "How can I attain with the power of the mind?", "How can I conquer this situation with clarity?"],
    astrologicalCorrespondence: "Air element.",
    numerologicalSignificance: "One (1) represents the spark, beginning, pure wholeness, and ultimate creativity."
  },
  {
    name: "Two of Swords",
    uprightMeaning: "The Two of Swords reflects **stillness and calm**, suggesting **conformity, equipoise, courage, and peace restored**. It counsels blocking out the outer world and holding all intrusive things at bay to foster **extreme focus during problem-solving**. This stability is often a temporary moment where events, feelings, and observations are being digested.\n\nThis card highlights **duality**, reflecting the intellectual advantage of holding two opposing thoughts in equal measure, seeking the gray areas beyond black and white. It can signify a **purposeful and willing transformation**, where the figure has voluntarily blindfolded herself to engage in internal meditation.",
    reversedMeaning: "The reversed meaning suggests **imposture, falsehood, duplicity, and disloyalty**.",
    symbolism: "A **hoodwinked female figure** sits on a cube, wearing a **white blindfold** which symbolizes **initiation** and moving from incomprehension to enlightenment. Her **arms criss-cross** across her chest, holding **dual silver swords** in perfect symmetry. A **crescent moon** hangs above, reflecting the moon's feminine and intuitive energy. The figure's position between **two pillars** aligns with the High Priestess, with her body serving as the integrated center column of the Tree of Life.",
    adviceWhenDrawn: "Block out chaos and confusion to achieve internal focus and **restored peace**. Voluntarily choose to be patient and use this time for internal transformation. Trust your composure in balancing opposing forces.",
    journalingPrompts: ["What is the best way to block out chaos and confusion?", "How do I find inner peace?", "What possibilities await?", "How can I hold two opposing thoughts confidently in my head?"],
    astrologicalCorrespondence: "Moon in Libra.",
    numerologicalSignificance: "Two (2) reflects energetic duality, allowing oppositional forces to exist equally and signifying wisdom (Chokmah)."
  },
  {
    name: "Three of Swords",
    uprightMeaning: "The Three of Swords is a powerful card of **profound heartbreak, division, rupture, and dispersion**. It reflects **mental anguish** and the deepest emotional pain of loss or betrayal. The surgical perfection of the damage suggests the heartbreak is intentional, making it more excruciating.\n\nThis card appears when facing disappointment from a **duplicitous love triangle** or betrayal of friendship. It is the place where we feel **compassion, heartache, and despair** for the state of the world. The energy reminds us that the threefold law of return (karma) means that reacting from pain could result in hateful actions.",
    reversedMeaning: "The reversed meaning suggests **mental alienation, error, loss, distraction, disorder, or confusion**.",
    symbolism: "A blood-red **heart floats in the air**, pierced by **three swords** with exactitude and precision. **Cumulus storm clouds and thick rain** surround the heart, signifying thunder and sorrow. The image is a visual derivative of the **Immaculate Heart of Mary**, or the **\"Mother of Sorrows,\"** suggesting compassion amidst pain.",
    adviceWhenDrawn: "**Embrace the heartache** and feel every feeling to allow the pain to move through you. Be kind and loving toward yourself until the emotion subsides, and avoid reacting until clarity returns.",
    journalingPrompts: ["How can I stay present and experience the discomfort so it moves through me?", "What eases my suffering?", "What is the wound that lets in the light?", "What changes?"],
    astrologicalCorrespondence: "Saturn in Libra.",
    numerologicalSignificance: "Three (3) represents triplicity, the ultimate creative act, and understanding (Binah)."
  },
  {
    name: "Four of Swords",
    uprightMeaning: "The Four of Swords signifies **rest, repose, and the calm inner sanctum of the mind**. It is the ultimate card of **vigilance, retreat, solitude, or necessary respite after conflict**. The advice is to relax, sleep, and rest, recognizing that things will look and feel better tomorrow.\n\nThis peaceful imagery evokes the yogic *savasana*, or corpse pose, where **balance and regeneration** are sought. The deep sleep suggested is a consummation devoutly to be wished, reflecting sweet restoration after conflict.",
    reversedMeaning: "The reversed meaning suggests **wise administration, circumspection, economy, avarice, or precaution**.",
    symbolism: "An **effigy of a knight** rests upon a tomb inside a stone-gray chapel. **Three swords hang upon the wall** above him, and a **single sword is carved into the coffin**. The three hanging swords align with the third eye, throat, and solar plexus, referencing the Masonic tale of Hiram Abiff. A **stained glass window** showing a Christ figure with the word **PAX** (peace) is visible, suggesting a peaceful and sacred space.",
    adviceWhenDrawn: "Retreat and seek solitude to regenerate your mind and spirit. Embrace the rest well earned and trust that the needed change will happen during this stillness.",
    journalingPrompts: ["How can I become present in the moment and allow myself to drift to sleep?", "What peaceful thoughts can I focus on right now?", "What wisdom lies within this necessary stillness?", "How do I set up the most comfortable sleeping situation ever?"],
    astrologicalCorrespondence: "Jupiter in Libra.",
    numerologicalSignificance: "Four (4) represents stability (Chesed), foundation, and structure."
  },
  {
    name: "Five of Swords",
    uprightMeaning: "The Five of Swords is defined by **degradation, destruction, revocation, loss, and defeat**. It reflects **sharp conflict or mental abuse**. This card depicts the consequences of a terrible fight where a clear winner, loser, and mediator are present.\n\nThe energy of the card suggests **mimic warfare** or **strenuous competition**, often reflecting the **\"battle of life\"**. The individual holding the swords is the master in possession of the field, often taking pleasure in another's pain. It serves as a warning that participating in aggressive acts results in cycling through all the character roles involved.",
    reversedMeaning: "The reversed meaning is the **same as the upright**—degradation, destruction, and revocation—as well as burial and obsequies.",
    symbolism: "A **disdainful man** looks after **two retreating and dejected figures**, symbolizing clear winners and losers. He carries **three swords** and **two swords lie at his feet**. **Razor-sharp gray clouds** race across the sky, setting a dramatic scene. The card asks if the reality is as terrible as the mind perceives it. The card infers **bullying** or people ganging up on one another.",
    adviceWhenDrawn: "Take the high road, release the ego, and dissolve any energy leading to disagreements. If you are the victim, create **boundaries**; passive-aggressive behavior only works if you play into it.",
    journalingPrompts: ["What is the root of the issue?", "How do I stay calm and focused in the situation?", "What limits do I need to set?", "How do I avoid malicious conflict?"],
    astrologicalCorrespondence: "Venus in Aquarius.",
    numerologicalSignificance: "Five (5) represents force and strength (Geburah), signifying struggle and opposition."
  },
  {
    name: "Six of Swords",
    uprightMeaning: "The Six of Swords is the card of literal or figurative **journey by water**. It signifies **transition to better circumstances** and moving on to distant shores. The journey is typically smooth, with the water calm and the weather still. It is the **Lord of Earned Success**.\n\nThis card advises taking stock of a situation, leaving unnecessary baggage behind, and moving on when the time is right. It is a reminder that the work is not beyond your strength, and confronting challenges will bring assured success.",
    reversedMeaning: "The reversed meaning is often **declaration, confession, publicity**, or even a **proposal of love**.",
    symbolism: "A **ferryman carries passengers** (implied mother and child) in his punt to the **further shore**. **Six swords are stuck at the front of the boat**. The smooth water on the left (destination) and rippled water on the right (departure) reflect the **transition from trouble to smooth**. The setting is inspired by the landscape near Smallhythe Place. The **boat** suggests that all will be well if you **choose the right conditions**.",
    adviceWhenDrawn: "Move toward a positive future; a way forward will open, but you may need advice from someone **in the know**. Leave unnecessary baggage behind and move on when the time is right.",
    journalingPrompts: ["What is the root of the issue?", "Who helps me to move ahead?", "How can I remain emotionally open and deep?", "What can I look forward to?"],
    astrologicalCorrespondence: "Mercury in Aquarius.",
    numerologicalSignificance: "Six (6) is the heart center (Tiphareth), signifying beauty and achievement."
  },
  {
    name: "Seven of Swords",
    uprightMeaning: "The Seven of Swords reflects **trickery or betrayal** and warns of **unstable effort** or a plan that may fail. It suggests the figure is trying to **get away with something** or **cutting corners**. This card is the **editing card**, removing what is no longer needed.\n\nThe energy is subversive and often signifies **quarrelling, stealth, or annoyance**. The esoteric title is **Lord of Unstable Effort**, warning that the plan may not work and that the energy is unreliable.",
    reversedMeaning: "The reversed meaning suggests **good advice, counsel, or instruction**, but also **slander or babbling**.",
    symbolism: "A figure (the thief) carries **five swords** in his hands and is looking behind him as he **tiptoes away** from a camp of soldiers/figures. The **two swords left behind** represent things once serving you that you **no longer need**. The red hat and yellow background suggest intense, fiery energy. The design is a derivative of the Sola Busca 7 of Swords.",
    adviceWhenDrawn: "Move quietly, without fuss or fanfare. **Rely on your own approval** rather than seeking external validation. Slow down, wait, and think again as the current plan may fail.",
    journalingPrompts: ["What valuable lesson will I take from this situation?", "What do I no longer need?", "What permanent boundaries must I erect?", "Am I hiding my true intentions?"],
    astrologicalCorrespondence: "Moon in Aquarius.",
    numerologicalSignificance: "Seven (7) represents victory (Netzach) and perseverance."
  },
  {
    name: "Eight of Swords",
    uprightMeaning: "The Eight of Swords signifies **bad news, violent chagrin, crisis, and censure**. It is a card of **power in trammels (bondage)** and temporary durance. It indicates an oppressive mental situation where one feels they have **no good choices**.\n\nEsoterically, the blindfold and bonds signify **initiation and transformation**—a voluntary act to be patient until the situation resolves. It is a mental situation that seems insurmountable, but it is **transitory and will be overcome**.",
    reversedMeaning: "The reversed meaning suggests **disquiet, difficulty, opposition, accident, treachery, or fatality**.",
    symbolism: "A **woman is bound and blindfolded** at the seashore. **Eight swords surround her** in an oval prison. A **turreted castle** looms in the distance. The blindfold can symbolize temporary spiritual darkness before enlightenment. The swords are magical and mark the **boundaries of sacred ritual space**. The bondage is temporary durance.",
    adviceWhenDrawn: "Be patient, as the situation is **transitory and will soon be over**. Voluntarily choose to be patient and use this time for **internal transformation**.",
    journalingPrompts: ["What thoughts imprison me?", "How do I release old behavior?", "How can I save myself?", "How do I safely land on two feet?"],
    astrologicalCorrespondence: "Jupiter in Gemini.",
    numerologicalSignificance: "Eight (8) symbolizes splendor (Hod) and executive power."
  },
  {
    name: "Nine of Swords",
    uprightMeaning: "The Nine of Swords is a card of intense despair, symbolizing **utter desolation, failure, and mental suffering**. It reflects perpetual **slavery to runaway thoughts**, resulting in **insomnia** and nightmares. It signifies **death, failure, miscarriage, delay, or deception**. The figure is holding themselves to impossible standards, plunged into a dark night of the soul.\n\nThe card urges the individual to realize that life is dramatic and the ego loves to be placed in the center of all things, resulting in stories and impressions that are often untrue.",
    reversedMeaning: "The reversed meaning suggests **imprisonment, suspicion, doubt, reasonable fear, or shame**.",
    symbolism: "A woman sits up in bed, weeping, with her **head resting in her hands**. **Nine stacked swords** rise above her in darkness. Her **white hair** symbolizes stress. The carving on the bed depicts **violence**. The **nine swords on the wall** offer a difficult \"ladder\" out of despair. The colorful quilt is embroidered with **zodiac and planetary symbols**.",
    adviceWhenDrawn: "**Take a deep breath and open your eyes** to gain perspective. Treat yourself with **kindness and compassion** instead of criticism. Break free of old thoughts by replacing negative ones with empowering ones.",
    journalingPrompts: ["How do I let negative thoughts go and replace them with new, empowering ones?", "What fills me when I release angst and pain?", "How do I wipe the slate clean?", "How can I rejuvenate myself?"],
    astrologicalCorrespondence: "Mars in Gemini.",
    numerologicalSignificance: "Nine (9) represents foundation (Yesod) and fixed, culminated force."
  },
  {
    name: "Ten of Swords",
    uprightMeaning: "The Ten of Swords signifies the final conclusion of a cycle, representing **pain, affliction, tears, sadness, desolation, and ruin**. It signifies **total conclusion**, although not necessarily violent death. The mind is fully made up, finished calculating the situation, and becomes unchangeable.\n\nThis card appears when facing situations that cannot be altered, such as the actions, opinions, or morals of others. The **golden dawn** breaking above the mountains is a reference to the continuation of a cycle (Golden Dawn) and the **fresh possibility** appearing once a conclusion is drawn. It is not a card of violent death, but reflects the **ephemeral nature of life**.",
    reversedMeaning: "The reversed meaning suggests **advantage, profit, success, or favour**, though none of these are permanent; also **power and authority**.",
    symbolism: "A **man lies prostrate** on the ground, pierced by **ten silver swords**. A **golden dawn** pushes up against an inky night sky. The figure's hand makes the **Hierophant's sign of benediction**, suggesting the figure is not dead, but the scene is symbolic and metaphorical. The imagery is linked to the assassination scene in *Becket*, where the Hierophant is slain.",
    adviceWhenDrawn: "**Break the cycle** by acknowledging the conclusion. Focus on the **new reality** unfolding in the rising dawn. Integrate a new reality by accepting that the current stage is finished.",
    journalingPrompts: ["What is finished?", "How can I integrate a new reality?", "What will wash away past pain?", "What new reality unfolds?"],
    astrologicalCorrespondence: "Sun in Gemini.",
    numerologicalSignificance: "Ten (10) represents Malkuth (Kingdom), finality, and the culmination of a major cycle."
  },
  {
    name: "Page of Swords",
    uprightMeaning: "The Page of Swords, the youth of air, is a curious spirit gifted with **wild intelligence**. She signifies **authority, overseeing, secret service, vigilance, spying, and examination**. The Page relies only on her own cunning and instincts, dedicated to finding the **truth** at the heart of any situation.\n\nShe is the **ultimate sleuth** and a gifted writer who records experiences and keeps concise records. Her energy is focused on **logic** and a supreme willingness to experiment and play.",
    reversedMeaning: "The reversed meaning suggests the more **evil side of these qualities**; what is **unforeseen**, **unprepared state**, or **sickness**.",
    symbolism: "A **lithe, active figure** holds a sword upright in both hands. **Rugged land and wind-blown hair** connect her to the element of air. A **flock of birds** flies past, symbolizing the connection between humanity and the Divine. Her **swift walking** posture suggests quick action will bring results.",
    adviceWhenDrawn: "Cultivate truth by following your curiosity and instincts. Use your quick-witted intelligence to **unravel secrets** and solve mysteries.",
    journalingPrompts: ["How can I keep the highest thoughts and clearest thinking?", "What is revealed?", "How can I better interpret messages?", "Am I open to all ideas?"],
    astrologicalCorrespondence: "Earth of Air.",
    numerologicalSignificance: "Page represents unformed energy, marking the beginning or primary stage of the suit."
  },
  {
    name: "Knight of Swords",
    uprightMeaning: "The Knight of Swords carries the **fiery, expansive quality of air**, making him **fast, smart, and dangerous**. He is characterized by **skill, bravery, capacity, and defense**, often engaging in **war and destruction**. His thoughts are **impetuous and fast-moving**.\n\nHe is the **prototypical hero of romantic chivalry**. His energy is often an **unstoppable force** that is quickly overtaking you before you realize what is happening. He is the rush of energy that allows you to risk regardless of consequence.",
    reversedMeaning: "The reversed meaning suggests **imprudence, incapacity, and extravagance**.",
    symbolism: "The Knight rides a horse at a **breakneck pace**. He is armored and his **horse's motion** is a key to his precipitate mood. He is decorated with **butterfly, seagull, and hooded falcon motifs**, linking him to the element of air. He is likened to **Galahad on the Quest**.",
    adviceWhenDrawn: "Utilize this decisive and swift energy to execute ideas promptly. Approach a situation with tremendous **courage and risk**. Balance your fiery passion with thoughtful planning.",
    journalingPrompts: ["What needs my attention?", "How do I stand up for truth?", "What action is required?", "How do I trust the energy surrounding me?"],
    astrologicalCorrespondence: "Gemini (Mutable Air).",
    numerologicalSignificance: "Knight represents directed energy, signifying the action or adolescent phase of the suit."
  },
  {
    name: "Queen of Swords",
    uprightMeaning: "The Queen of Swords is the goddess of air and mistress of the winds, embodying **mature intelligence**. She signifies **widowhood, female sadness, separation, and mourning**. She is a **keen observer** who speaks the **truth as she sees it**, tossing distractions aside.\n\nHer presence reflects **intellectual severity** and dedication to **quality and truth**. Her clear, concise thoughts affect how she thinks about herself and organizes her life.",
    reversedMeaning: "The reversed meaning suggests **malice, bigotry, artifice, prudery, bale, or deceit**. Blocked energy indicates that intelligence is used for manipulation or that external opposition is creating sadness.",
    symbolism: "The Queen is enthroned, holding a **sword vertically in her right hand**. Her crown and throne are decorated with **butterflies** (symbol of air). She is often identified with Ellen Terry playing the **Viking Queen Hjördis**, the \"goddess of the sword\". Her head is literally **above the clouds**, showing clear, concise thoughts. The tassels on her wrists are emblazoned with **rose and lily designs** (symbols of passion and purity).",
    adviceWhenDrawn: "Address the situation with **clarity and poise**, speaking the truth as you see it. Take personal responsibility for your actions and inner thoughts.",
    journalingPrompts: ["How can I open to high-level wisdom?", "How can I invoke beauty through words?", "How do I keep my highest self with me during regular life?", "Am I speaking my truth clearly?"],
    astrologicalCorrespondence: "Libra (Cardinal Air).",
    numerologicalSignificance: "Queen represents experienced energy, signifying the mature feminine command of the suit."
  },
  {
    name: "King of Swords",
    uprightMeaning: "The King of Swords is the **master of air, ruler of the sky**, and embodiment of **militant intelligence**. He symbolizes **power, command, authority, law, and judgment**. His intelligence is responsible for mankind's scientific and mathematical advancement.\n\nThis King is **decisive and logical**, valuing truth above all else. He takes direct action, leading with his mental process and commanding every situation.",
    reversedMeaning: "The reversed meaning suggests **cruelty, perversity, barbarity, perfidy, or evil intention**. Blocked energy suggests a misuse of his mental power, leading to tyranny or aggressive dominance.",
    symbolism: "The King is enthroned, holding the **unsheathed sword**. His throne carries **butterflies** and **billowing clouds**, connecting him to his elemental suit. The symbol is equated with the **conventional symbol of Justice** in the Major Arcana. He sits in **judgment**, embodying the \"power of life and death\".",
    adviceWhenDrawn: "Take action with focused intention, utilizing your charismatic power to lead and achieve your vision. Focus on the **end goal** and express your truth clearly.",
    journalingPrompts: ["What helps me focus on the end goal?", "How can I best express my truth?", "What helps me rise to the challenge?", "How can I move past previous limitations?"],
    astrologicalCorrespondence: "Aquarius (Fixed Air).",
    numerologicalSignificance: "King represents established energy, signifying the mature masculine mastery of the suit."
  }
];

async function updateSwordsMeanings() {
  const client = postgres(getConnectionString(), { prepare: false });
  const db = drizzle(client);

  console.log('Starting Swords meanings update...\n');

  try {
    for (const card of swordsMeanings) {
      try {
        console.log(`Updating ${card.name}...`);

        await db
          .update(cards)
          .set({
            uprightMeaning: card.uprightMeaning,
            reversedMeaning: card.reversedMeaning,
            symbolism: card.symbolism,
            adviceWhenDrawn: card.adviceWhenDrawn,
            journalingPrompts: JSON.stringify(card.journalingPrompts),
            astrologicalCorrespondence: card.astrologicalCorrespondence,
            numerologicalSignificance: card.numerologicalSignificance
          })
          .where(eq(cards.name, card.name));

        console.log(`✓ ${card.name} updated successfully`);
      } catch (error) {
        console.error(`✗ Error updating ${card.name}:`, error);
      }
    }

    console.log('\nSwords meanings update complete!');
  } finally {
    await client.end();
  }
}

updateSwordsMeanings();
