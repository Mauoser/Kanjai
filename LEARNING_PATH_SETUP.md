# Learning Path System - Setup Guide

## Quick Start

### 1. Database Setup

The learning path system requires new models and fields. If you're using Sequelize with auto-sync enabled:

```javascript
// In your database connection, ensure force: false is set
// The models will automatically create tables on sync
await sequelize.sync({ force: false });
```

Or run the migration manually:

```bash
npx sequelize-cli db:migrate
```

### 2. Initialize a User's Learning Path

Once the backend is running, initialize learning for a user:

```bash
# Start learning path for JLPT N5
curl -X POST http://localhost:5000/api/learning-path/initialize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jlptLevel": 5}'
```

This creates:

- 10 essential radicals
- ~9 basic kanji using those radicals
- Vocabulary for each kanji

### 3. Fetch Learning Content

#### Get Next Item to Learn

```bash
curl -X GET http://localhost:5000/api/learning-path/next \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get All Radicals

```bash
curl -X GET http://localhost:5000/api/learning-path/radicals?jlptLevel=5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Kanji for a Level

```bash
curl -X GET http://localhost:5000/api/learning-path/kanji?jlptLevel=5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Vocabulary for a Kanji

```bash
curl -X GET http://localhost:5000/api/learning-path/kanji/1/vocabulary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Track Progress

#### Mark Item as Mastered

```bash
# Master a radical
curl -X POST http://localhost:5000/api/learning-path/radicals/1/master \
  -H "Authorization: Bearer YOUR_TOKEN"

# Master a kanji (unlocks related vocabulary)
curl -X POST http://localhost:5000/api/learning-path/kanji/1/master \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Progress Summary

```bash
curl -X GET http://localhost:5000/api/learning-path/progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Example response:

```json
{
  "radicals": {
    "total": 10,
    "mastered": 3,
    "percentage": 30
  },
  "kanji": {
    "total": 9,
    "mastered": 0,
    "percentage": 0
  },
  "vocabulary": {
    "total": 0,
    "mastered": 0,
    "percentage": 0
  }
}
```

## Frontend Integration

### React Component Example

```jsx
import { useEffect, useState } from "react";

export function LearningPathComponent() {
  const [currentItem, setCurrentItem] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    // Initialize path for new users
    initializePath();
    // Get first item
    fetchNextItem();
    // Get progress
    fetchProgress();
  }, []);

  const initializePath = async () => {
    const response = await fetch("/api/learning-path/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ jlptLevel: 5 }),
    });
    return response.json();
  };

  const fetchNextItem = async () => {
    const response = await fetch("/api/learning-path/next", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setCurrentItem(data);
  };

  const fetchProgress = async () => {
    const response = await fetch("/api/learning-path/progress", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setProgress(data);
  };

  const masterItem = async (type, id) => {
    const endpoint =
      type === "radical"
        ? `/api/learning-path/radicals/${id}/master`
        : `/api/learning-path/kanji/${id}/master`;

    await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    // Refresh
    await fetchNextItem();
    await fetchProgress();
  };

  return (
    <div>
      <h1>Learning Path</h1>

      {/* Display current item */}
      {currentItem && (
        <div className="current-item">
          <h2>{currentItem.type}</h2>
          {currentItem.type === "radical" && (
            <div>
              <p className="character">{currentItem.item.character}</p>
              <p className="name">{currentItem.item.primaryName}</p>
              <p className="mnemonic">{currentItem.item.mnemonic}</p>
            </div>
          )}
          {currentItem.type === "kanji" && (
            <div>
              <p className="character">{currentItem.item.character}</p>
              <p className="meaning">{currentItem.item.meaning}</p>
              <p className="mnemonic">{currentItem.item.meaningMnemonic}</p>
            </div>
          )}
          <button
            onClick={() => masterItem(currentItem.type, currentItem.item.id)}
          >
            Mark as Mastered
          </button>
        </div>
      )}

      {/* Display progress */}
      {progress && (
        <div className="progress">
          <h3>Your Progress</h3>
          <div className="progress-item">
            <p>
              Radicals: {progress.radicals.mastered}/{progress.radicals.total}
            </p>
            <progress value={progress.radicals.percentage} max={100}></progress>
          </div>
          <div className="progress-item">
            <p>
              Kanji: {progress.kanji.mastered}/{progress.kanji.total}
            </p>
            <progress value={progress.kanji.percentage} max={100}></progress>
          </div>
          <div className="progress-item">
            <p>
              Vocabulary: {progress.vocabulary.mastered}/
              {progress.vocabulary.total}
            </p>
            <progress
              value={progress.vocabulary.percentage}
              max={100}
            ></progress>
          </div>
        </div>
      )}
    </div>
  );
}
```

## JLPT Level Progression

The system supports five JLPT levels. Users progress through them:

1. **Initialize JLPT N5** (100 basic kanji)

   - Learn 10 essential radicals
   - Learn ~9 basic kanji
   - Learn ~50 vocabulary words

2. **Progress to JLPT N4** (200 kanji total)

   - Learn additional radicals
   - Learn ~50 new kanji
   - Learn ~150 vocabulary words

3. **Continue to JLPT N3, N2, N1** as needed

### To Progress to Next Level

```bash
curl -X POST http://localhost:5000/api/learning-path/initialize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jlptLevel": 4}'  # Next level
```

## API Response Examples

### Radical Response

```json
{
  "id": 1,
  "character": "火",
  "primaryName": "Fire",
  "name": "fire",
  "meaning": "fire",
  "mnemonic": "This radical looks like flames dancing...",
  "explanation": "The radical for fire is one of the most...",
  "strokeCount": 4,
  "level": 1,
  "isPrimary": true,
  "isGenerated": true,
  "userProgress": {
    "status": "learning",
    "meaningScore": 0,
    "repeatCount": 0
  }
}
```

### Kanji Response

```json
{
  "id": 1,
  "character": "火",
  "meaning": "Fire",
  "onyomi": ["か"],
  "kunyomi": ["ひ", "ほ"],
  "jlptLevel": 5,
  "meaningMnemonic": "The fire radical and the fire kanji...",
  "readingMnemonic": "When you read the on'yomi 'か'...",
  "foundInVocabulary": [
    {
      "word": "火山",
      "reading": "かざん",
      "meaning": "volcano"
    }
  ],
  "userProgress": {
    "status": "learning",
    "meaningScore": 0,
    "readingScore": 0
  }
}
```

### Vocabulary Response

```json
{
  "id": 1,
  "word": "火",
  "reading": "ひ",
  "meaning": "fire",
  "wordType": "noun",
  "explanation": "This vocab is made from a single kanji...",
  "readingExplanation": "This uses the kun'yomi reading 'ひ'...",
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
      "meaning": "to light a fire"
    }
  ]
}
```

## Troubleshooting

### Models Not Syncing

Make sure your database connection has `sequelize.sync()` called:

```javascript
await sequelize.sync({ force: false, alter: true });
```

### AI Content Not Generating

Check:

1. Google Gemini API key is set in `.env`
2. Network connectivity to Google API
3. Check server logs for error messages

### Authorization Errors

Ensure:

1. User has valid JWT token
2. Token is passed in `Authorization: Bearer TOKEN` header
3. User exists in database

### Empty Learning Path

If initialization returns 0 items:

1. Check that radicals are being created
2. Verify kanji are being generated
3. Check database for constraint violations
