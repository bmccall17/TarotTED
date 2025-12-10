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

const pentaclesMeanings = [
  {
    name: "Ace of Pentacles",
    uprightMeaning: "The Ace of Pentacles is the seed, or root, of the element of **Earth**. It reflects the **perfect contentment, felicity, and ecstasy** associated with financial security and material manifestation. This card signifies an excellent beginning in tangible matters and the powerful potential for **growth and generation**. It is a reminder of all the natural power and opportunity already available to the querent.\n\nWhen this card appears, it confirms that good work will be rewarded and everything necessary will be provided to those who seize the opportunity. The energy is highly positive, offering a gift that must be tended and nurtured to reach its fullest potential in the material world.",
    reversedMeaning: "The reversed Ace of Pentacles suggests **the evil side of wealth**, bad intelligence, or great riches. While prosperity and material comfort may exist, the card reversed cautions that these conditions may not be advantageous to the possessor.\n\nThis reversal warns against a misuse of resources or placing too much emphasis on material gain, which can be an impediment to spiritual or personal growth. It can also signal a failure to act on a favorable opportunity or fear preventing the planting of the initial seed.",
    symbolism: "An angelic **hand issues from a cloud** holding up a pentacle, representing a gift from above. The **pentacle** (a five-pointed star) symbolizes the four elements and the human soul, serving as the building block of life. The palm is open and **receptive**, consistent with the feminine elemental suits (Earth and Water). A rich and lush **garden** with a flowering, ivy-covered **gate** reflects the threshold and promise of the perfected world (Eden) where manifestation occurs.",
    adviceWhenDrawn: "Embrace the excellent opportunity being offered right now and trust that you have everything needed to achieve your goal. Direct your energy toward growth and creation, recognizing that you are landing on your feet with assured security.",
    journalingPrompts: ["What is my current attitude toward wealth and money?", "What financial security am I currently manifesting?", "What spiritual seed am I planting right now?", "How can I best support my desire to grow?"],
    astrologicalCorrespondence: "Root of Earth. Element: Earth.",
    numerologicalSignificance: "One (1) represents the spark, beginning, pure wholeness, the Godhead (Kether), and the root of all thought."
  },
  {
    name: "Two of Pentacles",
    uprightMeaning: "The Two of Pentacles reflects **harmonious change**, duality of choice, and the need for emotional equilibrium when juggling responsibilities. It represents the energy of **delicate balance** in the pursuit of wealth and material goals. This is often seen as a choice between two equally engaging options, requiring the querent to weigh and manipulate elements in the physical world to achieve success.\n\nAs the number two is associated with duality, the card cautions against extremes while suggesting that the fundamental energy of the situation is stable and manageable. This is a card of gaiety and recreation, but it also warns that this energetic balance can be quickly disrupted by obstacles or agitation.",
    reversedMeaning: "The reversed Two of Pentacles suggests **enforced gaiety, simulated enjoyment**, obstacles, or trouble. The blocked energy indicates that difficulty in handling duality has resulted in instability or agitation. This reversal may signal issues with communication, handwriting, or letters of exchange.",
    symbolism: "A youthful figure dances, juggling **two pentacles** connected by a cord shaped like the **number 8 reversed** (lemniscate). This **lemniscate** symbolizes the eternal flow of energy and links the figure to the Magician. **Two tall ships** traverse **undulating ocean waves**, reflecting the energetic and changeable quality of life (water) beneath the duality of the physical choices (ships/pentacles). The figure wears an elaborate fourteenth-century sugar loaf hat.",
    adviceWhenDrawn: "Focus on making the most of your current situation, assessing your affairs, and weighing your opportunities carefully. Be mindful of miscommunications, especially in writing, and maintain an authentic demeanor rather than simulated enjoyment.",
    journalingPrompts: ["What dual opportunities am I currently juggling?", "Where am I feeling agitation or trouble?", "How can I manipulate elements in my life for success?", "Am I being authentic or showing 'enforced gaiety'?"],
    astrologicalCorrespondence: "Jupiter in Capricorn.",
    numerologicalSignificance: "Two (2) reflects energetic duality, representing wisdom (Chokmah) and the extreme delicacy of balance required at this stage."
  },
  {
    name: "Three of Pentacles",
    uprightMeaning: "The Three of Pentacles is the card of **skilled labor, métier, and trade**, often leading to nobility, renown, or glory. This card prominently features **collaboration**, reflecting the essential need for teamwork and outside help to achieve **long-term goals or projects**. It is the place where the apprentice has achieved proficiency, recognizing that the dedication put into work now will yield rewards later.\n\nThis card speaks to the realization of action and perfection in work. It is the process of translating raw creative energy (Ace/Two) into structural form, symbolizing the building of a sanctuary or sacred space through applied effort.",
    reversedMeaning: "The reversed card suggests **mediocrity, puerility, pettiness, or weakness** in work. This reversal implies that the necessary skill or diligence is lacking, resulting in a failure to manifest the potential inherent in the project. This can be a failure to collaborate effectively or an inability to see the high significance of one's work.",
    symbolism: "Three figures are depicted within the arch of a chapel or monastery: a sculptor (**Masonic builder**), a monk/cleric, and a master planner. The sculptor's apron, bench, and tool denote the act of operative Masonry and the creation of **sacred space**. The three pentacles form the shape of the **supernal triad**, symbolizing that the structure of creation (triplicity) is applied to the material world. The figures' historic costuming links them to the reign of Henry VI.",
    adviceWhenDrawn: "Recognize the importance of working with others and seek expert advice for your project. Dedicate yourself to perfecting your skills and view your work as the construction of a sacred space, fulfilling your ultimate career plan.",
    journalingPrompts: ["What helps me work with clarity on my projects?", "How does my sense of spirituality support my work?", "What skill am I perfecting right now?", "Who can I consult for help along the way?"],
    astrologicalCorrespondence: "Mars in Capricorn.",
    numerologicalSignificance: "Three (3) represents structure, realization, and perfection (Binah), making the matter settled and fixed."
  },
  {
    name: "Four of Pentacles",
    uprightMeaning: "The Four of Pentacles signifies **stability, authority, and the surety of possessions**. It reflects the structural power (number four) applied to the material world. This card is famously associated with the archetype of the **miser** or one who **cleaves to what one has**, relying on material possessions for total security and well-being.\n\nWhile offering a sense of stability, the energy warns that attachment to material resources can create a prison, inhibiting growth and leading to stagnation due to the fear of loss. It is the card of **Earthly Power**, emphasizing that material wealth is ephemeral.",
    reversedMeaning: "The reversed meaning suggests **suspense, delay, and opposition**. This signals stagnation, often due to an **inability to let go** of control, thereby stifling necessary growth. The burden of material possessions becomes overwhelming, and the individual may struggle to delegate or move past a fixed situation.",
    symbolism: "A **crowned figure** sits rigidly on a cube (stability) holding one pentacle to his chest, one on his crown, and two under his feet. The figure's posture, reflecting a character like **Richard III**, embodies clinging tightly to possessions. The **pentacles are placed on chakra locations** (crown, solar plexus, feet). A sprawling **city** behind him symbolizes the wealth and structure he has built. The card reflects the power of logic and reason (Emperor energy) applied to financial security.",
    adviceWhenDrawn: "Trust your ability to create stability, but practice **non-attachment** to material possessions. Examine where you are grasping too tightly to ideas or objects, and choose to release fear. In financial matters, be prudent and secure, but ensure you spread the load to avoid oppression.",
    journalingPrompts: ["What am I holding too tightly to that must be let go?", "What is the security I can depend on, no matter what?", "How can I set myself up for success in a practical manner?", "Am I using my financial resources to build a fortress or a kingdom?"],
    astrologicalCorrespondence: "Sun in Capricorn.",
    numerologicalSignificance: "Four (4) represents stability, foundation, and structure (Chesed), often signaling a necessary halt."
  },
  {
    name: "Five of Pentacles",
    uprightMeaning: "The Five of Pentacles foretells **material trouble above all**, such as destitution, financial loss, or poverty. This card often reflects the challenges and **downsides of long-term relationships** or marriages, showing a struggle faced by a pair rather than an individual.\n\nThe figures, walking through a frigid snowstorm, are confronted with a **spiritual or material crisis**. Although the situation is desolate, the card always contains a center of hope; the glowing, lighted **stained glass window** (symbolizing spiritual knowledge) suggests **salvation and refuge** are nearby, though the figures are failing to look up and see it. The figure is warned against self-pity and encouraged to utilize the faith that overcomes fear.",
    reversedMeaning: "The reversed meaning indicates **disorder, chaos, ruin, discord, or profligacy**. This can suggest that the figures are sinking deeper into their crisis, unable to take advantage of the salvation offered. The challenge is the lack of willingness to look up and seek help or refuge.",
    symbolism: "**Two mendicants** (one on crutches, suggesting material trouble or spiritual duress) trudge through a **snowstorm**, passing a church casement. The **stained glass window** above, containing the upper portion of the **Tree of Life** (pentacles as Sephiroth), is fully illuminated, contrasting the darkness outside and symbolizing a higher truth or hope. The figures' inability to see the light is symbolic of being blinded by desolation.",
    adviceWhenDrawn: "Look closely for the sanctuary and resources that are available to you, even if they are hidden in plain sight. If financial stability is lacking, use this time to reassess your material priorities and cultivate faith, recognizing the challenge is temporary.",
    journalingPrompts: ["What is our challenge in this relationship/situation?", "How can I let more light into the situation?", "What spiritual sanctuary is available to me that I am overlooking?", "What action will save us from despair?"],
    astrologicalCorrespondence: "Mercury in Taurus.",
    numerologicalSignificance: "Five (5) represents force, strength, and severity (Geburah), signifying struggle and ultimate restriction."
  },
  {
    name: "Six of Pentacles",
    uprightMeaning: "The Six of Pentacles is the **Lord of Material Success**, signifying presents, gifts, gratification, vigilance, and **charity**. This card reflects financial maturity, where material abundance is shared with those less fortunate. It is the successful outcome of the work/life balance, operating from the compassionate heart center of the suit.\n\nThe Merchant's act of distributing coins, often accompanied by the Hierophant's sign of benediction, suggests that success comes from **conscious and virtuous action**. The card implies an issue of hierarchy, where one figure is in a position of power, urging the querent to consider whether they are giving or receiving.",
    reversedMeaning: "The reversed card suggests **desire, cupidity, envy, jealousy, or illusion**. This signals an imbalance where the focus is on selfish gain or a misuse of resources, rather than genuine generosity. It warns against seeking material success purely for status or external validation.",
    symbolism: "A figure in the guise of a **merchant weighs money** in scales and distributes it to **two kneeling beggars**. The scales connect this card to **Justice**, symbolizing balance and equity. The merchant's hand gesture is the **Hierophant's sign of benediction**. The kneeling figures (mendicants) and the merchant's elevated position reflect the **hierarchy** inherent in the sixes. The figure giving coins is distributing **four coins**, evoking the stability of the Four of Pentacles.",
    adviceWhenDrawn: "Embrace charity and generosity, sharing your success with others. Be vigilant in balancing your resources and ensure your actions are driven by genuine kindness rather than a need for external validation.",
    journalingPrompts: ["How am I too judgmental of myself and others?", "What can I offer that is truly valuable?", "How can I cultivate balanced giving and receiving?", "What single action helps me to become more successful?"],
    astrologicalCorrespondence: "Moon in Taurus.",
    numerologicalSignificance: "Six (6) is the heart center (Tiphareth), signifying beauty, achievement, and the balance of forces."
  },
  {
    name: "Seven of Pentacles",
    uprightMeaning: "The Seven of Pentacles is the **Lord of Success Unfulfilled**, signifying a critical point of **careful stocktaking** in one's business, money, or creative endeavors. The figure is contemplative, leaning on his staff and questioning the effort expended versus the yield of his efforts. This is a card of **prudence**, urging the querent to evaluate investments before moving forward.\n\nThis card appears when there are contradictory feelings—success is evident, but satisfaction is lacking. The number seven relates to duration and perseverance, suggesting that final manifestation requires patience and time.",
    reversedMeaning: "The reversed card primarily signifies **cause for anxiety regarding money** which it may be proposed to lend. This reversal suggests anxiety, impatience, or the temptation to quit before the harvest is fully ripe, risking long-term success.",
    symbolism: "A young man, inspired by the Misero (Beggar) card in older decks, is leaning on a staff, gazing at seven pentacles growing on a clump of greenery. The growing pentacles symbolize the fruits of labor, reflecting the concept of **duration and perpetuity** inherent in the esoteric title (Netzach). The garden setting emphasizes the natural flow and time required for manifestation.",
    adviceWhenDrawn: "Pause and reflect on your current situation before taking action; engage in **prudent stocktaking** and avoid impatience. Trust the longevity of your investment and be aware that growth takes time and continuous nurturing.",
    journalingPrompts: ["What investments have I already made in this situation?", "What is the state of my current situation?", "Am I being patient enough with my creative/financial process?", "What do I need to focus on to proceed with prudence?"],
    astrologicalCorrespondence: "Saturn in Taurus.",
    numerologicalSignificance: "Seven (7) represents perseverance, victory (Netzach), and endurance."
  },
  {
    name: "Eight of Pentacles",
    uprightMeaning: "The Eight of Pentacles is the card of **master craftsmanship, work, and diligence**, reflecting a **productive phase** or apprenticeship. This card symbolizes having gained the **professional skill and proficiency** to make something substantial in the world. The work is done with dedication and a high level of **prudence** and self-respect.\n\nIt suggests that the individual is adding **value and beauty** to the world through their creation, reflecting the Sephirah Hod (splendor/ornament). The presence of this card assures success and freedom earned through commitment to craft.",
    reversedMeaning: "The reversed meaning suggests **voided ambition, vanity, cupidity, or exaction**. This signals a misuse of skill for cunning and intrigue, or a failure to maintain commitment, valuing the external appearance of success (ornament) over genuine quality. The work is likely stalled or lacking direction.",
    symbolism: "An **artisan** works diligently on a bench, hammering out pentacles. Completed pentacles are displayed above him like a **ladder of ascent**. The presence of **Masonic symbols** (apron, bench, tool) underscores the spiritual significance of dedication and working diligently toward a goal. The work is displayed as **trophies**, indicating success and recognition.",
    adviceWhenDrawn: "Focus on purposeful work and achieving **mastery** in your craft; apply prudence and diligence to your efforts. Believe in the value of your contribution and ensure your efforts are genuine, not motivated by vanity.",
    journalingPrompts: ["What vocational work truly satisfies me to my core?", "How can I apply greater diligence and prudence to my current project?", "What resources are available to me right now?", "Am I displaying my work with pride or hiding my true potential?"],
    astrologicalCorrespondence: "Sun in Virgo.",
    numerologicalSignificance: "Eight (8) symbolizes flow, splendor (Hod), executive power, and restorative force."
  },
  {
    name: "Nine of Pentacles",
    uprightMeaning: "The Nine of Pentacles is the Lord of **Material Gain**, signifying **prudence, safety, success, and luxury**. It embodies **self-sufficiency** and autonomy, reflecting wealth gained through effort or inheritance. The figure is completely at home, integrated, and **luxuriating in the present moment**.\n\nThis card assures that the querent has complete mastery over the physical world and emphasizes the appreciation of craft and beauty. The appearance of this card signifies a powerful stage of culmination, as intangible intentions solidify into material foundation.",
    reversedMeaning: "The reversed card suggests **roguery, deception, voided project, or bad faith**. This suggests that material gain has come at a moral cost, or that the security felt is based on an illusion. The shadow aspect warns against the **vanity** of material attachments.",
    symbolism: "A woman (modeled possibly on **Rosalind** from *As You Like It*) stands in a **vineyard** with nine pentacles at her feet. She wears a gown embellished with the **Venus symbol**. A **falcon** rests on her wrist (loyalty), and a **snail** (slowness and destiny/golden spiral) is nearby. The figure's gentle hand on the pentacles symbolizes complete **mastery** and control over the physical world.",
    adviceWhenDrawn: "Cultivate appreciation for the beautiful and simple things surrounding you, recognizing that true luxury is a state of mind. Embrace your self-sufficiency, but remain open and avoid becoming aloof or vain.",
    journalingPrompts: ["What am I willing to do to achieve my ambition?", "What beauty surrounds me right now?", "How can I slow down to appreciate what is right in front of me?", "What develops when I stay focused on the moment?"],
    astrologicalCorrespondence: "Venus in Virgo.",
    numerologicalSignificance: "Nine (9) represents foundation (Yesod), fixed, culminated, and complete force."
  },
  {
    name: "Ten of Pentacles",
    uprightMeaning: "The Ten of Pentacles reflects the **culmination of all things in the material world** and the successful conclusion of a cycle. It signifies **gain, riches, familial prosperity**, and a secure domestic environment. The card depicts three generations, symbolizing the legacy and archives of a family.\n\nThis card represents the final synthesis and **Malkuth (Kingdom)** made manifest on Earth. It implies wealth that extends beyond finance to include emotional security, community, and domestic harmony.",
    reversedMeaning: "The reversed meaning indicates **chance, fatality, loss, robbery, or instability** in family matters. This suggests that the security and prosperity achieved are being jeopardized by external events or internal conflicts within the family structure.",
    symbolism: "A multi-generational **family** stands at the threshold of a city, beneath an archway. The **ten pentacles** are arranged to depict the entire **Kabbalistic Tree of Life**. The grandfather's elaborate cloak is covered with **grapes** (fecundity) and may conceal the monogram of A. E. Waite. Two dogs are present. The background buildings and the family's location at the city's threshold denote security, commerce, and wealth.",
    adviceWhenDrawn: "Acknowledge the conclusion of this major cycle and celebrate the assured success you have achieved. Focus on creating **familial harmony** and passing down a valuable legacy. Cherish your material and emotional security.",
    journalingPrompts: ["What wealth, beyond money, do I possess in my life?", "What inheritance (material or emotional) did I receive?", "How does my upbringing affect my expectations of reward?", "How do I cultivate wisdom in my daily life?"],
    astrologicalCorrespondence: "Mercury in Virgo.",
    numerologicalSignificance: "Ten (10) represents completion, the ultimate manifestation, and the Kingdom (Malkuth)."
  },
  {
    name: "Page of Pentacles",
    uprightMeaning: "The Page of Pentacles, the youth of earth, embodies the simple curiosity and **unformed energy** of the suit. She is the **archetypal student**, signifying application, study, and reflection, especially focused on the material world and its physical transformations. Her energy is slow and sensate, reflecting the nature of earth.\n\nThis card suggests that **focused attention** and discipline will lead to **quantifiable results** (diplomas, creative products). It calls for a renewed dedication to a course of study or a physical goal, urging the querent to explore their innate talents.",
    reversedMeaning: "The reversed Page signifies **prodigality, dissipation, liberality, or unfavorable news**. This indicates a misuse of potential, often through lack of focus or scattering energy on superficial luxuries. The discipline required for steady growth has been lost, resulting in ungrounded action.",
    symbolism: "A **youthful figure** in Elizabethan costuming stands near a plowed field, holding a pentacle that resembles a seed. Her head is covered by a roundlet hat. The **plowed field** and distant mountains signify potential for **growth and manifestation** in the material world. Her slow posture and focused gaze reflect the grounded energy of Earth.",
    adviceWhenDrawn: "Apply **laser focus** and discipline to your current undertakings. Seek practical knowledge and trust the curiosity that guides your exploration of the material world.",
    journalingPrompts: ["What thought/idea/decision should I live by?", "How can I dedicate myself to learning this new skill?", "How can I maintain ownership over my choices?", "What simple, singular action helps me achieve my goal?"],
    astrologicalCorrespondence: "Earth of Earth. Element: Earth.",
    numerologicalSignificance: "Page represents unformed energy and the beginning phase of the suit."
  },
  {
    name: "Knight of Pentacles",
    uprightMeaning: "The Knight of Pentacles represents **utility, serviceableness, interest, and responsibility**. He is the **Lord of the Wild and Fertile Land** and embodies **slow, enduring, steady progress**. His energy is heavy and purposeful, reflecting a commitment to methodical change and stability.\n\nThis Knight encourages resilience and dedication to worthy work. He is focused on tangible results, using his experience and instincts to heal and cultivate the physical world.",
    reversedMeaning: "The reversed Knight indicates **inertia, idleness, repose of that kind, stagnation, or carelessness**. This signals a failure to move forward or a lack of responsibility toward duties, resulting in halted progress. The energy that should be methodical has become rigid or lazy.",
    symbolism: "The Knight is armored and rides a **heavy, slow horse** (like a Clydesdale) across a massive **plowed field**. His green plume symbolizes **growth**. He holds a pentacle but **does not look into it**, signifying his focus on observable results rather than abstract potential. His heavy armor suggests experience in battle and the protection of his stability.",
    adviceWhenDrawn: "Commit to **methodical and steady progress**, knowing that consistency creates enduring stability. Embrace work that is worthy and utilize your inner strength and resilience.",
    journalingPrompts: ["What supports my steady progress, even when results are slow?", "What worthy work should I be committing to?", "How can I be more reliable and responsible in this situation?", "Where in my life do I need to exchange speed for perseverance?"],
    astrologicalCorrespondence: "Virgo (Mutable Earth). Element: Earth.",
    numerologicalSignificance: "Knight represents **directed energy** and the action phase of the suit."
  },
  {
    name: "Queen of Pentacles",
    uprightMeaning: "The Queen of Pentacles, Queen of the Thrones of Earth, embodies **opulence, generosity, magnificence, and security**. She represents **mature feminine energy** focused on material comfort, physical beauty, and effectively managing resources. She is a **keen observer** who sees the spiritual essence of the world within her symbol, recognizing that material beauty can open the soul.\n\nHer energy is nurturing and devoted, making her an ideal homemaker, investor, or leader who effectively translates inspiration into physical harmony. She encourages self-care and the manifestation of her visions through conscious action.",
    reversedMeaning: "The reversed Queen suggests **evil, suspicion, suspense, fear, or mistrust**. This signals that her nurturing qualities are blocked by insecurity or emotional volatility, leading to a misuse of her influence. She may be seen as a perverse woman or one not to be trusted.",
    symbolism: "She sits enthroned in a **lush, natural garden**, symbolizing fertility and prosperity. Her throne is adorned with a **goat** (Capricorn) and symbols of **Pan**. She holds a pentacle and contemplates it, suggesting she sees profound meaning in the material world. A **bunny rabbit** sits at her side, emphasizing fertility. The scene reflects material security and the beauty of nature.",
    adviceWhenDrawn: "Focus on creating harmony and beauty in your immediate environment; cultivate **generosity and self-care**. Use your keen observational skills to gain deep insight into the material world.",
    journalingPrompts: ["What practical step can I take to make my home a sanctuary?", "How can I exercise self-love?", "What does security mean to me right now?", "Am I using my resources to nurture myself and others?"],
    astrologicalCorrespondence: "Capricorn (Cardinal Earth). Element: Earth.",
    numerologicalSignificance: "Queen represents **experienced energy** and the mature feminine command of the suit."
  },
  {
    name: "King of Pentacles",
    uprightMeaning: "The King of Pentacles is the **master of money** and the material world, embodying **valour and realizing intelligence**. He is a charismatic figure who leads with a **slow, methodical, and disciplined** approach, resulting in kingdoms of **security and stability**.\n\nHe signifies success in business and intellectual aptitude, reflecting a leader who grounds spiritual ideas into profitable manifestation. The King represents the attainment of physical power and control over one's body and environment.",
    reversedMeaning: "The reversed King suggests **vice, weakness, ugliness, perversity, or corruption**. Blocked King energy indicates a misuse of power or a failure to apply his intelligence effectively, leading to financial or moral ruin. He may suffer from lethargic tendencies, despite his capacity for command.",
    symbolism: "The King is enthroned, associated with the **bull** (Taurus). His cloak is adorned with **grapes** (fecundity). He holds a pentacle and a scepter, symbolizing his **command over the earthly realm**. The **castle** and city behind him denote his financial kingdom. Waite describes him as \"lethargic in tendency,\" nodding to the slow, steady quality of Earth.",
    adviceWhenDrawn: "Take action with **focused intention** and lead your business or personal life with discipline and logic. Focus on securing and protecting your assets, embodying emotional stability without becoming tyrannical.",
    journalingPrompts: ["How can I be a more effective leader in my field?", "How can I set realistic financial goals?", "What helps me focus on the end goal?", "How can I maintain control without becoming severe or cruel?"],
    astrologicalCorrespondence: "Taurus (Fixed Earth). Element: Earth.",
    numerologicalSignificance: "King represents **established energy** and the mature masculine mastery of the suit."
  }
];

async function updatePentaclesMeanings() {
  const client = postgres(getConnectionString(), { prepare: false });
  const db = drizzle(client);

  console.log('Starting Pentacles meanings update...\n');

  try {
    for (const card of pentaclesMeanings) {
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

    console.log('\nPentacles meanings update complete!');
  } finally {
    await client.end();
  }
}

updatePentaclesMeanings();
