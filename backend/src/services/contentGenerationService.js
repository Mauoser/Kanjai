const { GoogleGenAI } = require("@google/genai");
const { UserKanji, User, UserProgress } = require("../models");
const { Op } = require("sequelize");

const genAI = new GoogleGenAI({});

class ContentGenerationService {
  constructor() {
    this.jlptKanjiSets = {
      5: [
        "日",
        "本",
        "人",
        "月",
        "火",
        "水",
        "木",
        "金",
        "土",
        "子",
        "女",
        "学",
        "生",
        "先",
        "大",
        "小",
        "中",
        "上",
        "下",
        "左",
        "右",
        "百",
        "千",
        "万",
        "円",
        "年",
        "時",
        "間",
        "今",
        "何",
        "分",
      ],
      4: [
        "朝",
        "昼",
        "夕",
        "夜",
        "春",
        "夏",
        "秋",
        "冬",
        "天",
        "雨",
        "雪",
        "風",
        "空",
        "海",
        "山",
        "川",
        "田",
        "森",
        "花",
        "草",
        "犬",
        "猫",
        "牛",
        "馬",
        "鳥",
        "魚",
        "肉",
        "野",
        "菜",
      ],
      3: [
        "政",
        "治",
        "経",
        "済",
        "社",
        "会",
        "法",
        "律",
        "歴",
        "史",
        "文",
        "化",
        "教",
        "育",
        "科",
        "技",
        "術",
        "医",
        "療",
        "福",
        "祉",
        "環",
        "境",
        "国",
        "際",
        "平",
        "和",
        "戦",
        "争",
        "問",
      ],
      2: [
        "複",
        "雑",
        "抽",
        "象",
        "具",
        "体",
        "現",
        "実",
        "仮",
        "想",
        "論",
        "理",
        "実",
        "践",
        "批",
        "判",
        "創",
        "造",
        "革",
        "新",
        "伝",
        "統",
        "継",
        "承",
        "発",
        "展",
        "衰",
        "退",
        "繁",
        "栄",
      ],
      1: [
        "憂",
        "鬱",
        "薔",
        "薇",
        "檸",
        "檬",
        "醍",
        "醐",
        "麒",
        "麟",
        "鳳",
        "凰",
        "瑠",
        "璃",
        "珊",
        "瑚",
        "翡",
        "翠",
        "琥",
        "珀",
        "瑪",
        "瑙",
        "絢",
        "爛",
        "豪",
        "華",
        "荘",
        "厳",
        "崇",
        "高",
      ],
    };
  }

  // Get appropriate kanji based on user level and JLPT level
  async getAppropriateKanji(userId, count = 5) {
    const user = await User.findByPk(userId);

    // Determine JLPT level based on user level
    let jlptLevel;
    if (user.level <= 10) jlptLevel = 5; // Levels 1-10: JLPT N5
    else if (user.level <= 20) jlptLevel = 4; // Levels 11-20: JLPT N4
    else if (user.level <= 35) jlptLevel = 3; // Levels 21-35: JLPT N3
    else if (user.level <= 50) jlptLevel = 2; // Levels 36-50: JLPT N2
    else jlptLevel = 1; // Levels 51+: JLPT N1

    // Get user's learning history to avoid duplicates
    const alreadyLearned = await UserKanji.findAll({
      where: { userId },
      attributes: ["character"],
    });
    const learnedCharacters = alreadyLearned.map((k) => k.character);

    // Get user's performance data to determine difficulty
    const recentPerformance = await UserProgress.findAll({
      where: {
        userId,
        lastReviewedAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
        },
      },
      attributes: ["meaningScore", "readingScore"],
    });

    const avgScore =
      recentPerformance.length > 0
        ? recentPerformance.reduce(
            (acc, p) => acc + (p.meaningScore + p.readingScore) / 2,
            0
          ) / recentPerformance.length
        : 0.5;

    // Select appropriate difficulty
    let difficulty = "medium";
    if (avgScore > 0.8) difficulty = "hard";
    else if (avgScore < 0.4) difficulty = "easy";

    // Filter available kanji
    const availableKanji = this.jlptKanjiSets[jlptLevel].filter(
      (k) => !learnedCharacters.includes(k)
    );

    // Select kanji based on difficulty
    let selectedKanji = [];
    if (difficulty === "easy") {
      // Pick simpler kanji (fewer strokes, common meanings)
      selectedKanji = availableKanji.slice(0, count);
    } else if (difficulty === "hard") {
      // Pick more complex kanji
      selectedKanji = availableKanji.slice(-count);
    } else {
      // Mix of difficulties
      selectedKanji = this.shuffleArray(availableKanji).slice(0, count);
    }

    return { selectedKanji, jlptLevel, difficulty };
  }

  // Generate complete kanji data with AI
  async generateKanjiData(character, jlptLevel, userId) {
    try {
      const user = await User.findByPk(userId);
      const style = user.preferredMnemonicStyle || "visual";

      // Generate comprehensive kanji data
      const prompt = `Generate comprehensive learning data for the Japanese kanji "${character}" (JLPT N${jlptLevel}).

Please provide the following in JSON format:
{
  "meaning": "primary English meaning",
  "alternativeMeanings": ["other", "meanings"],
  "onyomi": ["おん", "よみ"],
  "kunyomi": ["くん", "よみ"],
  "strokeCount": number,
  "radicals": ["component", "radicals"],
  "meaningMnemonic": "A ${style} mnemonic story to remember the meaning (2-3 sentences, vivid and memorable)",
  "readingMnemonic": "A mnemonic to remember the main reading using sound associations",
  "contextSentences": [
    {
      "japanese": "example sentence in Japanese",
      "english": "English translation",
      "reading": "hiragana reading"
    }
  ],
  "commonWords": ["common", "vocabulary", "using", "this", "kanji"],
  "difficulty": "easy/medium/hard based on complexity"
}

Make the mnemonics creative, emotional, and unforgettable. Use humor when appropriate.`;

      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
      });

      const text = response.text.trim();
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }

      const kanjiData = JSON.parse(jsonMatch[0]);

      return {
        character,
        meaning: kanjiData.meaning,
        alternativeMeanings: kanjiData.alternativeMeanings || [],
        onyomi: kanjiData.onyomi || [],
        kunyomi: kanjiData.kunyomi || [],
        jlptLevel,
        meaningMnemonic: kanjiData.meaningMnemonic,
        readingMnemonic: kanjiData.readingMnemonic,
        contextSentences: kanjiData.contextSentences || [],
        difficulty: kanjiData.difficulty || "medium",
      };
    } catch (error) {
      console.error("Failed to generate kanji data:", error);

      // Fallback data
      return {
        character,
        meaning: "Unknown",
        alternativeMeanings: [],
        onyomi: [],
        kunyomi: [],
        jlptLevel,
        meaningMnemonic: `Remember ${character} by visualizing its shape.`,
        readingMnemonic: `Practice the reading of ${character}.`,
        contextSentences: [],
        difficulty: "medium",
      };
    }
  }

  // Generate personalized batch of kanji for user
  async generateUserKanjiBatch(userId, count = 5) {
    const { selectedKanji, jlptLevel, difficulty } =
      await this.getAppropriateKanji(userId, count);
    const generatedKanji = [];

    for (const character of selectedKanji) {
      // Check if already exists for this user
      const existing = await UserKanji.findOne({
        where: { userId, character },
      });

      if (!existing) {
        const kanjiData = await this.generateKanjiData(
          character,
          jlptLevel,
          userId
        );

        const userKanji = await UserKanji.create({
          userId,
          character,
          ...kanjiData,
          userLevel: (await User.findByPk(userId)).level,
        });

        generatedKanji.push(userKanji);
      }
    }

    return generatedKanji;
  }

  // Adapt difficulty based on performance
  async adaptDifficulty(userId, kanjiId, performance) {
    const userKanji = await UserKanji.findOne({
      where: { userId, id: kanjiId },
    });

    if (!userKanji) return;

    // Update difficulty based on performance
    if (performance < 0.3) {
      userKanji.difficulty = "easy";
      // Generate easier mnemonic
      const easierMnemonic = await this.generateEasierMnemonic(userKanji);
      userKanji.meaningMnemonic = easierMnemonic;
    } else if (performance > 0.9) {
      userKanji.difficulty = "hard";
    }

    await userKanji.save();
  }

  // Generate easier mnemonic for struggling users
  async generateEasierMnemonic(userKanji) {
    const prompt = `The user is struggling with the kanji "${userKanji.character}" (${userKanji.meaning}).

Create a VERY simple, easy-to-remember mnemonic that:
1. Uses basic, everyday concepts
2. Creates a clear visual image
3. Uses repetition or rhyme
4. Is only 1-2 sentences

Example: "This looks like a TREE with branches. TREE = ${userKanji.meaning}."`;

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
      });

      return response.text.trim();
    } catch (error) {
      return `Remember ${userKanji.character} means ${userKanji.meaning}.`;
    }
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // =====================================================
  // NEW: Learning Path Generation Methods
  // =====================================================

  /**
   * Generate comprehensive radical content with primary name and mnemonic
   */
  async generateRadicalData(character, level = 1) {
    try {
      const prompt = `Generate comprehensive learning data for the Japanese radical "${character}" (Level ${level}/60).

Please provide the following in JSON format:
{
  "primaryName": "Primary name of this radical",
  "name": "Alternative name",
  "meaning": "English meaning",
  "mnemonic": "A creative, memorable mnemonic story (3-4 sentences) that helps learners remember this radical. Use vivid imagery, humor, or emotional connection. Example format: 'This radical looks like a person with their hands up in the air. See the stick arms? They're celebrating because they just found FIRE! The person is doing a happy dance, waving those arms around like they're on fire (but in a good way)!'",
  "explanation": "Detailed explanation of the radical's visual structure and its role in kanji (2-3 sentences)",
  "strokeCount": number
}

Make the mnemonic VIVID, EMOTIONAL, and UNFORGETTABLE. Use humor, storytelling, or memorable imagery.`;

      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
      });

      const text = response.text.trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }

      const radicalData = JSON.parse(jsonMatch[0]);
      return {
        character,
        ...radicalData,
        level,
        isGenerated: true,
      };
    } catch (error) {
      console.error("Failed to generate radical data:", error);
      return {
        character,
        primaryName: character,
        name: "Radical",
        meaning: "Radical",
        mnemonic: `Remember this radical ${character} by visualizing its unique shape and how it appears in kanji.`,
        explanation:
          "This is a basic radical used as a building block in Japanese kanji.",
        strokeCount: 1,
        level,
        isGenerated: false,
      };
    }
  }

  /**
   * Generate comprehensive kanji content matching WaniKani format
   */
  async generateKanjiDataWithContext(character, jlptLevel, radicalsUsed = []) {
    try {
      const user = await User.findByPk(1); // This will be parameterized in controller
      const style = user?.preferredMnemonicStyle || "visual";

      const prompt = `Generate comprehensive learning data for the Japanese kanji "${character}" (JLPT N${jlptLevel}).

The kanji is composed of these radicals: ${
        radicalsUsed.join(", ") || "various"
      }.

Please provide the following in VALID JSON format (no markdown, just the JSON object):
{
  "meaning": "primary English meaning",
  "alternativeMeanings": ["other", "meanings"],
  "onyomi": ["on", "readings"],
  "kunyomi": ["kun", "readings"],
  "nanori": ["name", "readings"],
  "strokeCount": number,
  "meaningMnemonic": "A ${style} mnemonic story (3-4 sentences) to remember the meaning. Use vivid storytelling, humor, and emotional connection. Make it UNFORGETTABLE. Example: 'The fire radical looks like flames dancing. When you see this kanji, imagine a campfire you're sitting around with friends. The flames are reaching up toward the sky, and you feel the warm glow on your face. That's the essence of FIRE (火)!'",
  "readingMnemonic": "A mnemonic to remember the main on'yomi reading using sound associations and storytelling (2-3 sentences)",
  "contextSentences": [
    {
      "japanese": "example sentence using the kanji",
      "english": "English translation",
      "reading": "full hiragana reading"
    }
  ],
  "commonVocabulary": [
    {
      "word": "kanji word",
      "reading": "reading in hiragana",
      "meaning": "English meaning",
      "explanation": "Brief explanation of why this reading is used"
    }
  ]
}

Make the mnemonics CREATIVE, EMOTIONAL, and MEMORABLE. Use vivid imagery and storytelling.`;

      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
      });

      const text = response.text.trim();
      // Remove markdown code blocks if present
      let jsonText = text
        .replace(/^```json\n?/, "")
        .replace(/\n?```$/, "")
        .trim();
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }

      const kanjiData = JSON.parse(jsonMatch[0]);
      return {
        character,
        meaning: kanjiData.meaning,
        alternativeMeanings: kanjiData.alternativeMeanings || [],
        onyomi: kanjiData.onyomi || [],
        kunyomi: kanjiData.kunyomi || [],
        nanori: kanjiData.nanori || [],
        jlptLevel,
        strokeCount: kanjiData.strokeCount,
        meaningMnemonic: kanjiData.meaningMnemonic,
        readingMnemonic: kanjiData.readingMnemonic,
        contextSentences: kanjiData.contextSentences || [],
        foundInVocabulary: kanjiData.commonVocabulary || [],
        level: this.jlptToLevel(jlptLevel),
        radicalIds: [],
        isGenerated: true,
      };
    } catch (error) {
      console.error("Failed to generate kanji data:", error);
      return {
        character,
        meaning: "Unknown",
        alternativeMeanings: [],
        onyomi: [],
        kunyomi: [],
        nanori: [],
        jlptLevel,
        strokeCount: 1,
        meaningMnemonic: `Remember ${character} by focusing on its visual structure.`,
        readingMnemonic: `Practice the reading of ${character}.`,
        contextSentences: [],
        foundInVocabulary: [],
        level: this.jlptToLevel(jlptLevel),
        isGenerated: false,
      };
    }
  }

  /**
   * Generate vocabulary data with detailed explanations and context
   */
  async generateVocabularyData(word, reading, kanjiCharacters = []) {
    try {
      const prompt = `Generate comprehensive learning data for the Japanese vocabulary word "${word}" (reading: ${reading}).

This word contains these kanji: ${kanjiCharacters.join(", ") || "various"}.

Please provide the following in VALID JSON format (no markdown, just the JSON object):
{
  "meaning": "primary English meaning",
  "alternativeMeanings": ["other", "meanings"],
  "wordType": "noun/verb/adjective/adverb/etc",
  "explanation": "Detailed explanation of what this word means and how it's used (2-3 sentences)",
  "readingExplanation": "Explanation of why this reading is used (e.g., 'on'yomi from the kanji' or 'irregular reading'). Only include a reading mnemonic if this is a new/unusual reading not predictable from the kanji.",
  "readingMnemonic": "Optional: Only provide if the reading is unusual and needs a mnemonic",
  "contextSentences": [
    {
      "japanese": "example sentence using the word",
      "english": "English translation",
      "reading": "full hiragana reading of the sentence"
    }
  ],
  "commonWordCombinations": [
    {
      "pattern": "pattern with the word (e.g., '${word}を〜')",
      "description": "what this pattern means",
      "example": "example phrase",
      "meaning": "meaning of the example"
    }
  ],
  "contextUse": "Description of common contexts where this word appears (2-3 sentences)"
}

Focus on practical, real-world usage. Make explanations clear and memorable.`;

      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
      });

      const text = response.text.trim();
      let jsonText = text
        .replace(/^```json\n?/, "")
        .replace(/\n?```$/, "")
        .trim();
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }

      const vocabData = JSON.parse(jsonMatch[0]);
      return {
        word,
        reading,
        meaning: vocabData.meaning,
        alternativeMeanings: vocabData.alternativeMeanings || [],
        wordType: vocabData.wordType,
        explanation: vocabData.explanation,
        readingExplanation: vocabData.readingExplanation,
        readingMnemonic: vocabData.readingMnemonic || null,
        contextSentences: vocabData.contextSentences || [],
        commonWordCombinations: vocabData.commonWordCombinations || [],
        contextUse: vocabData.contextUse,
        kanjiIds: [],
        isGenerated: true,
      };
    } catch (error) {
      console.error("Failed to generate vocabulary data:", error);
      return {
        word,
        reading,
        meaning: "Unknown",
        alternativeMeanings: [],
        wordType: "noun",
        explanation: "A Japanese word.",
        readingExplanation: "Standard reading.",
        contextSentences: [],
        commonWordCombinations: [],
        contextUse: "Used in various contexts.",
        isGenerated: false,
      };
    }
  }

  /**
   * Convert JLPT level to KanjAI level
   */
  jlptToLevel(jlptLevel) {
    const mapping = { 5: 1, 4: 15, 3: 25, 2: 40, 1: 55 };
    return mapping[jlptLevel] || 1;
  }

  /**
   * Get essential radicals for a given JLPT level
   */
  getEssentialRadicals(jlptLevel) {
    // Essential radicals organized by JLPT level
    const radicalsByLevel = {
      5: [
        { char: "人", name: "person", meaning: "person" },
        { char: "火", name: "fire", meaning: "fire" },
        { char: "水", name: "water", meaning: "water" },
        { char: "木", name: "tree", meaning: "tree" },
        { char: "土", name: "earth", meaning: "earth" },
        { char: "日", name: "sun", meaning: "sun/day" },
        { char: "月", name: "moon", meaning: "moon/month" },
        { char: "手", name: "hand", meaning: "hand" },
        { char: "目", name: "eye", meaning: "eye" },
        { char: "口", name: "mouth", meaning: "mouth" },
      ],
      4: [
        { char: "山", name: "mountain", meaning: "mountain" },
        { char: "金", name: "metal", meaning: "metal/gold" },
        { char: "石", name: "stone", meaning: "stone" },
        { char: "糸", name: "thread", meaning: "thread" },
        { char: "女", name: "woman", meaning: "woman" },
        { char: "心", name: "heart", meaning: "heart/mind" },
        { char: "力", name: "power", meaning: "power/strength" },
        { char: "刀", name: "sword", meaning: "sword" },
      ],
      3: [
        { char: "馬", name: "horse", meaning: "horse" },
        { char: "鳥", name: "bird", meaning: "bird" },
        { char: "魚", name: "fish", meaning: "fish" },
        { char: "舟", name: "boat", meaning: "boat" },
      ],
      2: [],
      1: [],
    };
    return radicalsByLevel[jlptLevel] || [];
  }

  /**
   * Generate a complete learning path for a user
   * Returns: radicals -> kanji using those radicals -> vocabulary for that kanji
   */
  async generateLearningPath(userId, jlptLevel) {
    const { Radical, Kanji, Vocabulary } = require("../models");

    try {
      const learningPath = {
        jlptLevel,
        radicals: [],
        kanji: [],
        vocabulary: [],
      };

      // Step 1: Get or generate essential radicals
      const essentialRadicals = this.getEssentialRadicals(jlptLevel);
      for (const radicalInfo of essentialRadicals) {
        let radical = await Radical.findOne({
          where: { character: radicalInfo.char },
        });

        if (!radical) {
          const radicalData = await this.generateRadicalData(
            radicalInfo.char,
            this.jlptToLevel(jlptLevel)
          );
          radical = await Radical.create(radicalData);
        }
        learningPath.radicals.push(radical);
      }

      return learningPath;
    } catch (error) {
      console.error("Failed to generate learning path:", error);
      throw error;
    }
  }
}

module.exports = new ContentGenerationService();
