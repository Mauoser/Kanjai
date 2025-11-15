-- Migration: Add Learning Path Tables and Update Existing Models
-- This migration creates the UserRadical and UserVocabulary tables
-- and updates Radical, Kanji, and Vocabulary models with new fields

-- Note: Using Sequelize migrations, these will be auto-generated when models sync

-- UserRadical Table Structure
CREATE TABLE IF NOT EXISTS "UserRadicals" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "radicalId" INTEGER NOT NULL REFERENCES "Radicals"("id") ON DELETE CASCADE,
  "character" VARCHAR(10) NOT NULL,
  "status" ENUM('learning', 'reviewing', 'mastered') DEFAULT 'learning',
  "masteredAt" TIMESTAMP,
  "meaningScore" FLOAT DEFAULT 0 CHECK ("meaningScore" >= 0 AND "meaningScore" <= 1),
  "repeatCount" INTEGER DEFAULT 0,
  "lastReviewedAt" TIMESTAMP,
  "nextReviewAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_radicals_user_id ON "UserRadicals"("userId");
CREATE INDEX idx_user_radicals_radical_id ON "UserRadicals"("radicalId");
CREATE INDEX idx_user_radicals_status ON "UserRadicals"("status");
CREATE INDEX idx_user_radicals_user_status ON "UserRadicals"("userId", "status");

-- UserVocabulary Table Structure
CREATE TABLE IF NOT EXISTS "UserVocabularies" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "vocabularyId" INTEGER NOT NULL REFERENCES "Vocabularies"("id") ON DELETE CASCADE,
  "word" VARCHAR(50) NOT NULL,
  "status" ENUM('learning', 'reviewing', 'mastered') DEFAULT 'learning',
  "masteredAt" TIMESTAMP,
  "meaningScore" FLOAT DEFAULT 0 CHECK ("meaningScore" >= 0 AND "meaningScore" <= 1),
  "readingScore" FLOAT DEFAULT 0 CHECK ("readingScore" >= 0 AND "readingScore" <= 1),
  "repeatCount" INTEGER DEFAULT 0,
  "lastReviewedAt" TIMESTAMP,
  "nextReviewAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_vocabularies_user_id ON "UserVocabularies"("userId");
CREATE INDEX idx_user_vocabularies_vocabulary_id ON "UserVocabularies"("vocabularyId");
CREATE INDEX idx_user_vocabularies_status ON "UserVocabularies"("status");
CREATE INDEX idx_user_vocabularies_user_status ON "UserVocabularies"("userId", "status");

-- Radical Table Updates
-- Add new columns (if using raw SQL, otherwise Sequelize handles this)
ALTER TABLE "Radicals" ADD COLUMN IF NOT EXISTS "primaryName" VARCHAR(100);
ALTER TABLE "Radicals" ADD COLUMN IF NOT EXISTS "explanation" TEXT;
ALTER TABLE "Radicals" ADD COLUMN IF NOT EXISTS "isGenerated" BOOLEAN DEFAULT false;

-- Kanji Table Updates
ALTER TABLE "Kanjis" ADD COLUMN IF NOT EXISTS "foundInVocabulary" JSONB DEFAULT '[]';
ALTER TABLE "Kanjis" ADD COLUMN IF NOT EXISTS "isGenerated" BOOLEAN DEFAULT false;

-- Vocabulary Table Updates
ALTER TABLE "Vocabularies" ADD COLUMN IF NOT EXISTS "explanation" TEXT;
ALTER TABLE "Vocabularies" ADD COLUMN IF NOT EXISTS "patternOfUse" JSONB DEFAULT '[]';
ALTER TABLE "Vocabularies" ADD COLUMN IF NOT EXISTS "readingExplanation" TEXT;
ALTER TABLE "Vocabularies" ADD COLUMN IF NOT EXISTS "isGenerated" BOOLEAN DEFAULT false;

-- Note: When using Sequelize, run:
-- npx sequelize-cli db:migrate
-- Or let Sequelize auto-sync in development mode
