import { pgTable, text, integer, boolean, timestamp, uuid, varchar, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const arcanaTypeEnum = pgEnum('arcana_type', ['major', 'minor']);
export const suitEnum = pgEnum('suit', ['wands', 'cups', 'swords', 'pentacles']);
export const themeCategoryEnum = pgEnum('theme_category', ['emotion', 'life_phase', 'role', 'other']);

// Cards table
export const cards = pgTable('cards', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  arcanaType: arcanaTypeEnum('arcana_type').notNull(),
  suit: suitEnum('suit'),
  number: integer('number'),
  sequenceIndex: integer('sequence_index').notNull(),
  imageUrl: text('image_url').notNull(),
  keywords: text('keywords').notNull(), // JSON array as string
  summary: text('summary').notNull(),
  uprightMeaning: text('upright_meaning'),
  reversedMeaning: text('reversed_meaning'),
  symbolism: text('symbolism'),
  adviceWhenDrawn: text('advice_when_drawn'),
  journalingPrompts: text('journaling_prompts'), // JSON array as string
  astrologicalCorrespondence: text('astrological_correspondence'),
  numerologicalSignificance: text('numerological_significance'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Talks table
export const talks = pgTable('talks', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  title: varchar('title', { length: 300 }).notNull(),
  speakerName: varchar('speaker_name', { length: 200 }).notNull(),
  tedUrl: text('ted_url').notNull(),
  description: text('description'),
  durationSeconds: integer('duration_seconds'),
  eventName: varchar('event_name', { length: 200 }),
  year: integer('year'),
  thumbnailUrl: text('thumbnail_url'),
  language: varchar('language', { length: 10 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Card-Talk Mappings table
export const cardTalkMappings = pgTable('card_talk_mappings', {
  id: uuid('id').defaultRandom().primaryKey(),
  cardId: uuid('card_id').references(() => cards.id, { onDelete: 'cascade' }).notNull(),
  talkId: uuid('talk_id').references(() => talks.id, { onDelete: 'cascade' }).notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  strength: integer('strength').notNull(), // 1-5
  rationaleShort: text('rationale_short').notNull(),
  rationaleLong: text('rationale_long'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Themes table
export const themes = pgTable('themes', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  shortDescription: text('short_description').notNull(),
  longDescription: text('long_description'),
  category: themeCategoryEnum('category'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Card-Themes join table
export const cardThemes = pgTable('card_themes', {
  cardId: uuid('card_id').references(() => cards.id, { onDelete: 'cascade' }).notNull(),
  themeId: uuid('theme_id').references(() => themes.id, { onDelete: 'cascade' }).notNull(),
});

// Talk-Themes join table
export const talkThemes = pgTable('talk_themes', {
  talkId: uuid('talk_id').references(() => talks.id, { onDelete: 'cascade' }).notNull(),
  themeId: uuid('theme_id').references(() => themes.id, { onDelete: 'cascade' }).notNull(),
});
