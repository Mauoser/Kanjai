# KanjAI Learning Path System

## Overview

The Learning Path system implements a WaniKani-like progression model where users learn Japanese through a structured sequence:

**Radicals → Kanji → Vocabulary**

All content is AI-generated using Google's Gemini API to create personalized, memorable mnemonics and explanations.

## Architecture

### Models

#### Radical

- **Purpose**: Building blocks of kanji
- **Key Fields**:
  - `character`: The radical symbol
  - `primaryName`: Primary name (e.g., "Fire")
  - `meaning`: English meaning
  - `mnemonic`: AI-generated memorable story
  - `explanation`: Detailed explanation of the radical
  - `level`: Learning level (1-60)
  - `isGenerated`: Whether content was AI-generated

#### Kanji

- **Purpose**: Full kanji characters
- **Key Fields**:
  - `character`: Kanji symbol
  - `meaning`: Primary meaning
  - `onyomi`: On'yomi readings (Chinese origin)
  - `kunyomi`: Kun'yomi readings (Japanese origin)
  - `radicalIds`: Component radicals
  - `foundInVocabulary`: List of vocabulary using this kanji
  - `meaningMnemonic`: AI-generated story for meaning
  - `readingMnemonic`: AI-generated story for reading
  - `contextSentences`: Example sentences with translations

#### Vocabulary

- **Purpose**: Words made from kanji
- **Key Fields**:
  - `word`: The vocabulary word
  - `reading`: Hiragana reading
  - `meaning`: English meaning
  - `kanjiIds`: Kanji contained in this word
  - `explanation`: Usage explanation
  - `readingExplanation`: Why this reading is used
  - `contextSentences`: Example sentences
  - `commonWordCombinations`: Patterns of use
  - `patternOfUse`: Common usage patterns

#### User Tracking Models

- **UserRadical**: Tracks user progress through radicals
- **UserKanji**: Tracks user progress through kanji
- **UserVocabulary**: Tracks user progress through vocabulary

All have statuses: `learning`, `reviewing`, `mastered`

## AI Content Generation

### Radical Generation

Generates vivid, memorable mnemonics for radicals using storytelling and humor.

```javascript
const radicalData = await contentGenerationService.generateRadicalData(
  character,
  level
);
// Returns: { character, primaryName, name, meaning, mnemonic, explanation, strokeCount }
```

### Kanji Generation

Creates comprehensive kanji data including:

- Primary and alternative meanings
- On'yomi and Kun'yomi readings
- Memorable mnemonics for both meaning and readings
- Context sentences
- Common vocabulary using the kanji

```javascript
const kanjiData = await contentGenerationService.generateKanjiDataWithContext(
  character,
  jlptLevel,
  radicalsUsed
);
// Returns: { character, meaning, onyomi, kunyomi, meaningMnemonic, readingMnemonic, ... }
```

### Vocabulary Generation

Creates vocabulary entries with:

- Meanings and word types
- Explanations of readings
- Context sentences with translations
- Common word combinations and patterns

```javascript
const vocabData = await contentGenerationService.generateVocabularyData(
  word,
  reading,
  kanjiCharacters
);
// Returns: { word, reading, meaning, explanation, contextSentences, commonWordCombinations, ... }
```

## Learning Flow

### 1. Initialize Learning Path

```
POST /api/learning-path/initialize
Body: { jlptLevel: 5 } // JLPT N5 (beginner)
```

Creates:

- Essential radicals for the level
- Kanji using those radicals
- Vocabulary for each kanji

### 2. Get Next Item

```
GET /api/learning-path/next
```

Returns the next item to learn in priority order:

1. Incomplete radicals
2. Incomplete kanji
3. Incomplete vocabulary

### 3. Learn Radicals

```
GET /api/learning-path/radicals?jlptLevel=5
GET /api/learning-path/radicals/:radicalId
POST /api/learning-path/radicals/:radicalId/master
```

### 4. Learn Kanji

```
GET /api/learning-path/kanji?jlptLevel=5
GET /api/learning-path/kanji/:kanjiId
POST /api/learning-path/kanji/:kanjiId/master
```

When a kanji is mastered, related vocabulary is unlocked.

### 5. Learn Vocabulary

```
GET /api/learning-path/kanji/:kanjiId/vocabulary
```

Vocabulary for a specific kanji. Uses the kanji's readings to help remember vocabulary readings.

## Progress Tracking

### Get Overall Progress

```
GET /api/learning-path/progress
```

Returns:

```json
{
  "radicals": {
    "total": 10,
    "mastered": 5,
    "percentage": 50
  },
  "kanji": {
    "total": 30,
    "mastered": 12,
    "percentage": 40
  },
  "vocabulary": {
    "total": 100,
    "mastered": 45,
    "percentage": 45
  }
}
```

### Get Full Curriculum

```
GET /api/learning-path/curriculum?jlptLevel=5
```

Returns complete structure for a JLPT level with all radicals, kanji, and vocabulary.

## API Endpoints

### Learning Path Management

- `POST /api/learning-path/initialize` - Initialize learning path for a JLPT level
- `GET /api/learning-path/next` - Get next item to learn
- `GET /api/learning-path/progress` - Get learning progress summary
- `GET /api/learning-path/curriculum` - Get full curriculum for a level

### Radicals

- `GET /api/learning-path/radicals?jlptLevel=5` - Get all radicals for a level
- `GET /api/learning-path/radicals/:radicalId` - Get radical details
- `POST /api/learning-path/radicals/:radicalId/master` - Mark radical as mastered

### Kanji

- `GET /api/learning-path/kanji?jlptLevel=5` - Get all kanji for a level
- `GET /api/learning-path/kanji/:kanjiId` - Get kanji details with vocabulary
- `POST /api/learning-path/kanji/:kanjiId/master` - Mark kanji as mastered

### Vocabulary

- `GET /api/learning-path/kanji/:kanjiId/vocabulary` - Get vocabulary for a kanji

## JLPT Levels

The system supports 5 JLPT levels:

- **JLPT N5** (Beginner): ~100 kanji, basic radicals
- **JLPT N4** (Elementary): ~200 kanji
- **JLPT N3** (Intermediate): ~600 kanji
- **JLPT N2** (Upper-Intermediate): ~1000 kanji
- **JLPT N1** (Advanced): ~2000+ kanji

Each level builds on the previous one.

## Example: Fire Radical → 火 Kanji → Vocabulary

### Radical: Fire (火)

```json
{
  "character": "火",
  "primaryName": "Fire",
  "name": "Radical",
  "meaning": "fire",
  "mnemonic": "This radical looks like flames dancing upward. See the three little tongues of fire? They're reaching toward the sky. When you see this shape, remember: FIRE is reaching up to escape!",
  "explanation": "The radical for fire is one of the most recognizable radicals. It appears in many kanji related to heat, burning, and temperature.",
  "level": 1
}
```

### Kanji: 火 Fire

```json
{
  "character": "火",
  "meaning": "Fire",
  "onyomi": ["か"],
  "kunyomi": ["ひ", "ほ"],
  "meaningMnemonic": "The fire radical and the fire kanji are the same thing. When you see this kanji, picture your favorite car (か) completely on fire. Oh no! Your beautiful car is burning up in flames!",
  "readingMnemonic": "When you read the on'yomi 'か', think of 'car' - your car is on fire!",
  "foundInVocabulary": [
    {
      "word": "火山",
      "reading": "かざん",
      "meaning": "volcano",
      "explanation": "Literally 'fire mountain' - uses the on'yomi reading"
    },
    {
      "word": "火星",
      "reading": "かせい",
      "meaning": "Mars",
      "explanation": "Literally 'fire star' - uses the on'yomi reading"
    }
  ],
  "contextSentences": [
    {
      "japanese": "キャンドルに火をつけた。",
      "english": "I lit the candle.",
      "reading": "キャンドルにひをつけた。"
    }
  ]
}
```

### Vocabulary: 火 (ひ)

```json
{
  "word": "火",
  "reading": "ひ",
  "meaning": "fire",
  "wordType": "noun",
  "explanation": "This vocab is made from a single kanji, so it shares the same meaning as the kanji: fire.",
  "readingExplanation": "This uses the kun'yomi reading 'ひ'. When learning the kanji, you learned the on'yomi 'か', so here's a new reading for you.",
  "readingMnemonic": "What comes off of fire? Lots and lots of heat (ひ). Feel it radiating from the flames!",
  "contextSentences": [
    {
      "japanese": "火がきえるのに五日かかりました。",
      "english": "It took five days to extinguish the fire.",
      "reading": "ひがきえるのにごにちかかりました。"
    }
  ],
  "commonWordCombinations": [
    {
      "pattern": "火を〜",
      "description": "Actions done to fire",
      "example": "火をつける",
      "meaning": "to light a fire, to turn on the stove"
    },
    {
      "pattern": "火が〜",
      "description": "What fire does",
      "example": "火がつく",
      "meaning": "to catch fire"
    }
  ]
}
```

## Service Integration

### ContentGenerationService

Handles all AI content generation for radicals, kanji, and vocabulary.

### LearningPathService

Manages:

- Learning path initialization
- Getting next items
- Tracking mastery progression
- Curriculum data retrieval
- Progress calculation

## SRS (Spaced Repetition) - Future Enhancement

The models include fields for implementing Spaced Repetition Scheduling:

- `masteredAt`: When item was mastered
- `lastReviewedAt`: Last review time
- `nextReviewAt`: Next scheduled review
- `repeatCount`: Total reviews

This allows implementing WaniKani-style SRS for optimal retention.

## Future Enhancements

1. **Kanji Composition** - Detailed breakdown of how radicals combine
2. **Stroke Order** - AI-guided stroke order with animations
3. **Audio Pronunciation** - Text-to-speech for readings
4. **Visual Mnemonics** - AI-generated images for each item
5. **Adaptive Learning** - Adjust difficulty based on performance
6. **Kanji Components Breakdown** - Show which radicals make up each kanji
7. **Related Kanji** - Show similar looking kanji and differences
