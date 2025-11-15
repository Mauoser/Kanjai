# Learning Path API Response Examples

This document shows complete API response examples matching the WaniKani-style format specified in the requirements.

## 1. Radical Response - Fire Radical

### Request

```
GET /api/learning-path/radicals/1
Authorization: Bearer {token}
```

### Response

```json
{
  "id": 1,
  "character": "火",
  "primaryName": "Fire",
  "name": "fire",
  "meaning": "fire",
  "strokeCount": 4,
  "level": 1,
  "isPrimary": true,
  "isGenerated": true,
  "mnemonic": "This is the radical for fire. It's got three little flames on top and even a couple logs underneath. But if it helps you can also focus on the person radical here. See it? It's got things coming off of it... What are those thi— OH MY GOD IT'S FIRE!!! Help, help! Put the fire out! Wait, it's fine… It's just the fire radical.",
  "explanation": "The fire radical is one of the most fundamental building blocks in Japanese kanji. It represents flames and appears in many characters related to heat, burning, temperature, and light. The character consists of three flame-like strokes on top with a base, visually representing flames reaching upward.",
  "visualImage": "base64_encoded_image_or_url",
  "createdAt": "2025-11-12T10:00:00Z",
  "updatedAt": "2025-11-12T10:00:00Z"
}
```

## 2. Kanji Response - Fire Kanji (火)

### Request

```
GET /api/learning-path/kanji/1
Authorization: Bearer {token}
```

### Response

```json
{
  "id": 1,
  "character": "火",
  "meaning": "Fire",
  "alternativeMeanings": [],
  "onyomi": ["か"],
  "kunyomi": ["ひ", "ほ"],
  "nanori": [],
  "strokeCount": 4,
  "jlptLevel": 5,
  "level": 1,
  "radicalIds": [1],
  "isGenerated": true,
  "meaningMnemonic": "The fire radical and the fire kanji are the same as each other. When we need to remember か, we use the word car. For this kanji, when we think fire, we ought to think of something on fire. What's on fire? It's obviously your very own car (か)! Oh Goddd NOOO!",
  "readingMnemonic": "Remember the on'yomi reading 'か' by thinking of your CAR on fire. The visual of your burning car will help cement this reading in your memory.",
  "meaningHint": "Flames reaching upward",
  "readingHint": "Car = か",
  "contextSentences": [
    {
      "japanese": "キャンドルに火をつけた。",
      "english": "I lit the candle.",
      "reading": "きゃんどるにひをつけた"
    },
    {
      "japanese": "火がきえるのに五日かかりました。",
      "english": "It took five days to extinguish the fire.",
      "reading": "ひがきえるのにごにちかかりました"
    },
    {
      "japanese": "ストーブの火をつけるのが上手ですね。",
      "english": "You're good at lighting the stove.",
      "reading": "すとーぶのひをつけるのがじょうずですね"
    }
  ],
  "foundInVocabulary": [
    {
      "word": "火",
      "reading": "ひ",
      "meaning": "Fire",
      "explanation": "Single kanji word using the kun'yomi reading"
    },
    {
      "word": "火山",
      "reading": "かざん",
      "meaning": "Volcano",
      "explanation": "Compound word using on'yomi reading 'か' (fire) + 山 (mountain)"
    },
    {
      "word": "花火",
      "reading": "はなび",
      "meaning": "Fireworks",
      "explanation": "Compound word using on'yomi reading in the middle position"
    },
    {
      "word": "火星",
      "reading": "かせい",
      "meaning": "Mars",
      "explanation": "Literally 'fire star' - uses on'yomi reading"
    },
    {
      "word": "火事",
      "reading": "かじ",
      "meaning": "Fire (disaster)",
      "explanation": "Compound word for destructive fire"
    },
    {
      "word": "火曜日",
      "reading": "かようび",
      "meaning": "Tuesday",
      "explanation": "Fire day - Tuesday in Japanese calendar"
    },
    {
      "word": "火災",
      "reading": "かさい",
      "meaning": "Fire Disaster",
      "explanation": "Formal term for fire disaster"
    },
    {
      "word": "防火",
      "reading": "ぼうか",
      "meaning": "Fire Prevention",
      "explanation": "Prevention against fire"
    },
    {
      "word": "火傷",
      "reading": "やけど",
      "meaning": "Burn",
      "explanation": "Injury from fire"
    }
  ],
  "visualImage": "base64_encoded_image_or_url",
  "userProgress": {
    "id": 1,
    "userId": 5,
    "kanjiId": 1,
    "character": "火",
    "status": "learning",
    "masteredAt": null,
    "meaningScore": 0,
    "readingScore": 0,
    "repeatCount": 0,
    "lastReviewedAt": null,
    "nextReviewAt": null
  },
  "createdAt": "2025-11-12T10:00:00Z",
  "updatedAt": "2025-11-12T10:00:00Z"
}
```

## 3. Vocabulary Response - 火 (Fire)

### Request

```
GET /api/learning-path/kanji/1/vocabulary
Authorization: Bearer {token}
```

### Response (Array)

```json
[
  {
    "id": 1,
    "word": "火",
    "reading": "ひ",
    "meaning": "Fire",
    "alternativeMeanings": [],
    "wordType": "noun",
    "kanjiIds": [1],
    "isGenerated": true,
    "explanation": "This vocab is made from a single kanji, which means it shares the same meaning as the parent kanji: fire. It represents the element or phenomenon of combustion and heat.",
    "readingExplanation": "Since this word is made up of a single kanji, it uses the kun'yomi reading. When learning the kanji, you didn't learn that reading, so here's a mnemonic to help you with this word.",
    "readingMnemonic": "What comes off of fire? Lots and lots of heat (ひ). Feel it coming off the fire, touching and warming your face.",
    "contextUse": "This word is used to refer to actual fire or flames, and appears in many common expressions about cooking, weather, and dangers. It's one of the most fundamental vocabulary words in Japanese.",
    "contextSentences": [
      {
        "japanese": "キャンドルに火をつけた。",
        "english": "I lit the candle.",
        "reading": "きゃんどるにひをつけた"
      },
      {
        "japanese": "火がきえるのに五日かかりました。",
        "english": "It took five days to extinguish the fire.",
        "reading": "ひがきえるのにごにちかかりました"
      },
      {
        "japanese": "ストーブの火をつけるのが上手ですね。",
        "english": "You're good at lighting the stove.",
        "reading": "すとーぶのひをつけるのがじょうずですね"
      }
    ],
    "commonWordCombinations": [
      {
        "pattern": "火を〜",
        "description": "Taking an action with fire",
        "example": "火をつける",
        "meaning": "to light a fire, to turn on the stove"
      },
      {
        "pattern": "火を〜",
        "description": "Controlling fire",
        "example": "火をけす",
        "meaning": "to put out fire, to turn off the stove"
      },
      {
        "pattern": "火が〜",
        "description": "Fire as the subject doing something",
        "example": "火がつく",
        "meaning": "to catch fire"
      },
      {
        "pattern": "火が〜",
        "description": "Fire's state",
        "example": "火がきえる",
        "meaning": "to extinguish, to go out"
      },
      {
        "pattern": "火が〜",
        "description": "Fire moving through something",
        "example": "火がとおる",
        "meaning": "to cook through"
      },
      {
        "pattern": "火の〜",
        "description": "Things related to fire",
        "example": "火のそば",
        "meaning": "by the fire"
      },
      {
        "pattern": "火の〜",
        "description": "Fire byproducts",
        "example": "火のこ",
        "meaning": "sparks"
      }
    ],
    "userProgress": {
      "id": 1,
      "userId": 5,
      "vocabularyId": 1,
      "word": "火",
      "status": "learning",
      "masteredAt": null,
      "meaningScore": 0,
      "readingScore": 0,
      "repeatCount": 0,
      "lastReviewedAt": null,
      "nextReviewAt": null
    },
    "createdAt": "2025-11-12T10:05:00Z",
    "updatedAt": "2025-11-12T10:05:00Z"
  },
  {
    "id": 2,
    "word": "火山",
    "reading": "かざん",
    "meaning": "Volcano",
    "alternativeMeanings": ["volcanic"],
    "wordType": "noun",
    "kanjiIds": [1, 5],
    "isGenerated": true,
    "explanation": "A volcano is a mountain or hill that erupts with lava and ash. This word combines the kanji for fire (火 - using on'yomi か) and mountain (山 - yama). Literally: fire mountain.",
    "readingExplanation": "This compound word uses the on'yomi reading of 火 (か) because it's combined with another kanji. The reading of 山 (mountain) is ざん in this combination, creating かざん.",
    "readingMnemonic": null,
    "contextUse": "Used to describe actual volcanoes, geological features, and volcanic phenomena. Commonly used in geography, science, and travel contexts.",
    "contextSentences": [
      {
        "japanese": "富士山は有名な火山です。",
        "english": "Mt. Fuji is a famous volcano.",
        "reading": "ふじさんはゆうめいなかざんです"
      },
      {
        "japanese": "その火山は活動中です。",
        "english": "That volcano is currently active.",
        "reading": "そのかざんはかつどうちゅうです"
      }
    ],
    "commonWordCombinations": [
      {
        "pattern": "火山の〜",
        "description": "Things related to a volcano",
        "example": "火山の活動",
        "meaning": "volcanic activity"
      },
      {
        "pattern": "火山が〜",
        "description": "What a volcano does",
        "example": "火山が噴火する",
        "meaning": "a volcano erupts"
      }
    ],
    "userProgress": {
      "id": 2,
      "userId": 5,
      "vocabularyId": 2,
      "word": "火山",
      "status": "learning",
      "masteredAt": null,
      "meaningScore": 0,
      "readingScore": 0,
      "repeatCount": 0,
      "lastReviewedAt": null,
      "nextReviewAt": null
    },
    "createdAt": "2025-11-12T10:05:00Z",
    "updatedAt": "2025-11-12T10:05:00Z"
  }
]
```

## 4. Learning Path Progress Response

### Request

```
GET /api/learning-path/progress
Authorization: Bearer {token}
```

### Response

```json
{
  "radicals": {
    "total": 10,
    "mastered": 1,
    "percentage": 10
  },
  "kanji": {
    "total": 9,
    "mastered": 0,
    "percentage": 0
  },
  "vocabulary": {
    "total": 15,
    "mastered": 0,
    "percentage": 0
  }
}
```

## 5. Next Item Response - Radical

### Request

```
GET /api/learning-path/next
Authorization: Bearer {token}
```

### Response (Radical)

```json
{
  "type": "radical",
  "item": {
    "id": 1,
    "character": "火",
    "primaryName": "Fire",
    "name": "fire",
    "meaning": "fire",
    "mnemonic": "This is the radical for fire. It's got three little flames on top and even a couple logs underneath...",
    "strokeCount": 4
  },
  "progress": {
    "id": 1,
    "userId": 5,
    "radicalId": 1,
    "character": "火",
    "status": "learning",
    "meaningScore": 0,
    "repeatCount": 0
  }
}
```

## 6. Next Item Response - Kanji

### Request

```
GET /api/learning-path/next
Authorization: Bearer {token}
```

### Response (Kanji - after radicals mastered)

```json
{
  "type": "kanji",
  "item": {
    "id": 1,
    "character": "火",
    "meaning": "Fire",
    "onyomi": ["か"],
    "kunyomi": ["ひ", "ほ"],
    "meaningMnemonic": "The fire radical and the fire kanji are the same as each other...",
    "readingMnemonic": "Remember the on'yomi reading 'か' by thinking of your CAR on fire..."
  },
  "progress": {
    "id": 1,
    "userId": 5,
    "kanjiId": 1,
    "character": "火",
    "status": "learning",
    "meaningScore": 0,
    "readingScore": 0
  }
}
```

## 7. Curriculum Data Response

### Request

```
GET /api/learning-path/curriculum?jlptLevel=5
Authorization: Bearer {token}
```

### Response (Simplified - shows structure)

```json
{
  "level": 5,
  "radicals": [
    {
      "id": 1,
      "character": "火",
      "name": "fire",
      "meaning": "fire",
      "mnemonic": "This is the radical for fire...",
      "userProgress": {
        "status": "learning",
        "meaningScore": 0
      }
    }
    // ... more radicals
  ],
  "kanji": [
    {
      "id": 1,
      "character": "火",
      "meaning": "Fire",
      "onyomi": ["か"],
      "kunyomi": ["ひ", "ほ"],
      "userProgress": {
        "status": "learning"
      },
      "vocabulary": [
        {
          "id": 1,
          "word": "火",
          "reading": "ひ",
          "meaning": "Fire",
          "userProgress": {
            "status": "learning"
          }
        },
        {
          "id": 2,
          "word": "火山",
          "reading": "かざん",
          "meaning": "Volcano",
          "userProgress": {
            "status": "learning"
          }
        }
        // ... more vocabulary
      ]
    }
    // ... more kanji
  ]
}
```

## 8. Master Item Response

### Request

```
POST /api/learning-path/radicals/1/master
Authorization: Bearer {token}
```

### Response

```json
{
  "message": "Radical mastered"
}
```

### Request (Kanji)

```
POST /api/learning-path/kanji/1/master
Authorization: Bearer {token}
```

### Response

```json
{
  "message": "Kanji mastered, vocabulary unlocked"
}
```

## 9. Initialize Path Response

### Request

```
POST /api/learning-path/initialize
Authorization: Bearer {token}
Content-Type: application/json

{
  "jlptLevel": 5
}
```

### Response

```json
{
  "message": "Learning path initialized",
  "jlptLevel": 5,
  "radicalsCount": 10
}
```

## Response Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error

## Pagination (Future Enhancement)

The following endpoints support pagination:

```
GET /api/learning-path/radicals?jlptLevel=5&page=1&limit=20
GET /api/learning-path/kanji?jlptLevel=5&page=1&limit=20
```

Response headers:

```
X-Total-Count: 100
X-Page: 1
X-Per-Page: 20
```

## Error Response Examples

### Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Valid token required"
}
```

### Not Found

```json
{
  "error": "Not found",
  "message": "Radical not found"
}
```

### Validation Error

```json
{
  "error": "Validation error",
  "message": "jlptLevel must be between 1 and 5"
}
```
