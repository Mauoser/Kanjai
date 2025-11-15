# Learning Path System - Quick Reference Guide

## What Was Built

A complete **WaniKani-style learning system** where users learn:

```
Radicals (火) → Kanji (火) → Vocabulary (火, 火山, 花火, etc.)
```

All content is AI-generated using Google Gemini to create vivid, memorable mnemonics.

---

## Core Concept: The Learning Funnel

```
┌─────────────────────────────────────┐
│ Learn Essential Radicals (火)       │ ← Start here
│ • Name: Fire                        │
│ • Mnemonic: Visual story            │
│ • Status: learning → mastered       │
└────────────┬────────────────────────┘
             │ (Radicals mastered)
             ↓
┌─────────────────────────────────────┐
│ Learn Related Kanji (火)            │
│ • Meaning: Fire                     │
│ • Readings: か (on), ひ (kun)       │
│ • Vocabulary examples shown         │
└────────────┬────────────────────────┘
             │ (Kanji mastered)
             ↓
┌─────────────────────────────────────┐
│ Learn Vocabulary (火, 火山, 火星)   │ ← Use kanji you learned
│ • Context sentences                 │
│ • Common patterns                   │
│ • Usage examples                    │
└─────────────────────────────────────┘
```

---

## 5-Minute Setup

### 1. Install (Already done - files created)

All necessary files are in:

- `backend/src/models/` - Database models
- `backend/src/services/` - Business logic
- `backend/src/controllers/` - API handlers
- `backend/src/routes/` - Endpoints

### 2. Sync Database

```javascript
// In your database setup
await sequelize.sync({ force: false });
```

### 3. Start Learning

```bash
# Initialize JLPT N5 learning path
curl -X POST http://localhost:5000/api/learning-path/initialize \
  -H "Authorization: Bearer TOKEN" \
  -d '{"jlptLevel": 5}'

# Get next item to learn
curl -X GET http://localhost:5000/api/learning-path/next \
  -H "Authorization: Bearer TOKEN"
```

---

## Core Endpoints (Quick Reference)

### Start Learning

```
POST /api/learning-path/initialize
Body: { jlptLevel: 5 }  // JLPT N5 = Beginner
```

### Get What to Learn

```
GET /api/learning-path/next
Returns: { type: "radical", item: {...}, progress: {...} }
```

### Learn Radicals

```
GET /api/learning-path/radicals?jlptLevel=5
POST /api/learning-path/radicals/{id}/master
```

### Learn Kanji

```
GET /api/learning-path/kanji?jlptLevel=5
GET /api/learning-path/kanji/{id}
POST /api/learning-path/kanji/{id}/master
```

### Learn Vocabulary

```
GET /api/learning-path/kanji/{kanjiId}/vocabulary
```

### Check Progress

```
GET /api/learning-path/progress
Returns:
{
  radicals: { total: 10, mastered: 5, percentage: 50 },
  kanji: { total: 9, mastered: 2, percentage: 22 },
  vocabulary: { total: 20, mastered: 0, percentage: 0 }
}
```

---

## Data Model (3-Tier Learning)

### Level 1: Radical (火)

```json
{
  "character": "火",
  "primaryName": "Fire",
  "meaning": "fire",
  "mnemonic": "Vivid story about flames...",
  "explanation": "The radical for fire..."
}
```

### Level 2: Kanji (火)

```json
{
  "character": "火",
  "meaning": "Fire",
  "onyomi": ["か"], // Reading: Car
  "kunyomi": ["ひ"], // Reading: Heat
  "meaningMnemonic": "Your car is on fire!",
  "readingMnemonic": "CAR = か",
  "foundInVocabulary": [
    { "word": "火山", "reading": "かざん", "meaning": "Volcano" },
    { "word": "火星", "reading": "かせい", "meaning": "Mars" }
  ]
}
```

### Level 3: Vocabulary (火 = Fire)

```json
{
  "word": "火",
  "reading": "ひ",
  "meaning": "Fire",
  "explanation": "Noun meaning the element of fire",
  "contextSentences": [
    { "japanese": "火がきえた", "english": "The fire went out" }
  ],
  "commonWordCombinations": [
    { "pattern": "火を〜", "example": "火をつける", "meaning": "to light fire" }
  ]
}
```

---

## User Progress States

```
Learning → Reviewing → Mastered
   ↓          ↓           ✓
 New      Repeat      Locked in
```

- **Learning**: First encounters the item
- **Reviewing**: Practicing to master
- **Mastered**: Knows it well (can unlock next level)

---

## JLPT Levels (The 5 Stages)

| Level | Name | Radicals | Kanji | Vocab  | Difficulty   |
| ----- | ---- | -------- | ----- | ------ | ------------ |
| 5     | N5   | 10       | ~9    | ~50    | Beginner     |
| 4     | N4   | 15+      | ~50   | ~150   | Elementary   |
| 3     | N3   | 20+      | ~200  | ~500   | Intermediate |
| 2     | N2   | 25+      | ~500  | ~1000  | Advanced     |
| 1     | N1   | 30+      | ~1000 | ~2000+ | Expert       |

Users progress through levels as they master items.

---

## Frontend Integration (React Example)

```jsx
import { useEffect, useState } from "react";

export function LearningComponent() {
  const [item, setItem] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    // 1. Initialize
    fetch("/api/learning-path/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ jlptLevel: 5 }),
    });

    // 2. Get next item
    fetchNext();

    // 3. Get progress
    fetchProgress();
  }, []);

  const fetchNext = async () => {
    const res = await fetch("/api/learning-path/next", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setItem(await res.json());
  };

  const fetchProgress = async () => {
    const res = await fetch("/api/learning-path/progress", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProgress(await res.json());
  };

  const handleMaster = async () => {
    const type = item.type;
    const id = item.item.id;
    const endpoint =
      type === "radical"
        ? `/api/learning-path/radicals/${id}/master`
        : `/api/learning-path/kanji/${id}/master`;

    await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    // Refresh
    await fetchNext();
    await fetchProgress();
  };

  return (
    <div>
      {/* Display current item */}
      {item && (
        <div className="card">
          <p className="type">{item.type}</p>
          <p className="character">{item.item.character}</p>
          <p className="name">{item.item.primaryName || item.item.meaning}</p>
          <p className="mnemonic">
            {item.item.mnemonic || item.item.meaningMnemonic}
          </p>
          <button onClick={handleMaster}>Mark as Mastered</button>
        </div>
      )}

      {/* Show progress */}
      {progress && (
        <div className="progress">
          <h3>Progress</h3>
          <p>
            Radicals: {progress.radicals.mastered}/{progress.radicals.total}
          </p>
          <p>
            Kanji: {progress.kanji.mastered}/{progress.kanji.total}
          </p>
          <p>
            Vocabulary: {progress.vocabulary.mastered}/
            {progress.vocabulary.total}
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## Key Files

| File                                    | Purpose                   |
| --------------------------------------- | ------------------------- |
| `models/UserRadical.js`                 | Track radical learning    |
| `models/UserVocabulary.js`              | Track vocabulary learning |
| `services/learningPathService.js`       | Learning logic            |
| `services/contentGenerationService.js`  | AI content generation     |
| `controllers/learningPathController.js` | API handlers              |
| `routes/learningPathRoutes.js`          | Endpoints                 |

---

## AI Content Generation

All content is auto-generated with vivid mnemonics:

### Radical Generation

- **Input**: Character (火)
- **Output**: Name, meaning, vivid mnemonic story
- **Example**: "Three little flames dancing, reaching for the sky!"

### Kanji Generation

- **Input**: Character, JLPT level, component radicals
- **Output**: Readings, meanings, mnemonics, context sentences, vocabulary
- **Example**: "Your car (か) is on fire! 🔥"

### Vocabulary Generation

- **Input**: Word, reading, component kanji
- **Output**: Meaning, explanation, context, common patterns
- **Example**: "火を〜 (to do something with fire)"

Uses Google Gemini API with fallback if generation fails.

---

## Database Schema

### New Tables

- `UserRadicals` - User → Radical progress
- `UserVocabularies` - User → Vocabulary progress

### Extended Tables

- `Radicals` - Added: primaryName, explanation, isGenerated
- `Kanjis` - Added: foundInVocabulary, isGenerated
- `Vocabularies` - Added: explanation, patternOfUse, readingExplanation, isGenerated

---

## Common Workflows

### Workflow 1: New User Starting

```
1. POST /initialize (JLPT 5)
   → Creates 10 radicals
2. GET /next
   → Returns first radical
3. GET /radicals/{id}
   → Full radical details
4. POST /radicals/{id}/master
   → Mark learned
5. Repeat until radicals done
```

### Workflow 2: Progress to Kanji

```
1. All radicals mastered
2. GET /next
   → Returns first kanji (radical components known)
3. GET /kanji/{id}
   → Kanji + vocabulary preview
4. POST /kanji/{id}/master
   → Unlocks vocabulary
```

### Workflow 3: Learn Vocabulary

```
1. Kanji mastered
2. GET /kanji/{id}/vocabulary
   → All vocabulary for this kanji
3. Learn vocabulary using kanji's readings
```

---

## Troubleshooting Quick Fixes

### No items showing up?

```bash
# Check if path initialized
GET /api/learning-path/next
# If null, must call initialize first
POST /api/learning-path/initialize
```

### AI content not generating?

```bash
# Check Google API key set
echo $GOOGLE_GENAI_API_KEY
# Check server logs for errors
```

### Database errors?

```bash
# Sync database
sequelize.sync({ alter: true })
```

---

## Next Steps

1. **Test the API** - Use cURL or Postman
2. **Build UI** - Display items from `/next` endpoint
3. **Add interactivity** - Buttons to master items
4. **Track progress** - Show `/progress` data
5. **Connect auth** - Use existing user tokens

---

## Files to Review

- 📖 `LEARNING_PATH_SYSTEM.md` - Full documentation
- 🚀 `LEARNING_PATH_SETUP.md` - Integration examples
- 📊 `LEARNING_PATH_API_RESPONSES.md` - Response formats
- 📝 `IMPLEMENTATION_SUMMARY.md` - What was built

---

## Questions?

Refer to the full documentation files for:

- Detailed API specs
- Response examples
- Frontend code samples
- Troubleshooting guides
- Future enhancements
