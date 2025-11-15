const {
  generateMnemonic,
  aiSenseiChat,
  generateVisualDescription,
  getPersonalizedTip,
} = require("../services/aiService");
const { Kanji, UserProgress } = require("../models");

// Generate mnemonic for a kanji
const getMnemonic = async (req, res) => {
  try {
    const { kanjiId, type = "meaning", style = "visual" } = req.body;

    const kanji = await Kanji.findByPk(kanjiId);
    if (!kanji) {
      return res.status(404).json({ error: "Kanji not found" });
    }

    const mnemonic = await generateMnemonic(kanji, type, style);

    // Optionally save to database
    if (type === "meaning") {
      kanji.meaningMnemonic = mnemonic;
    } else {
      kanji.readingMnemonic = mnemonic;
    }
    await kanji.save();

    res.json({ mnemonic, type });
  } catch (error) {
    console.error("Get mnemonic error:", error);
    res.status(500).json({ error: "Failed to generate mnemonic" });
  }
};

// Chat with Ai-Sensei
const chatWithAiSensei = async (req, res) => {
  try {
    const { message, kanjiId, lessonContext } = req.body;
    const userId = req.user.id;

    // Build context
    let context = { userId };

    if (kanjiId) {
      const kanji = await Kanji.findByPk(kanjiId);
      if (kanji) {
        context.currentKanji = {
          character: kanji.character,
          meaning: kanji.meaning,
          readings: {
            onyomi: kanji.onyomi,
            kunyomi: kanji.kunyomi,
          },
        };
      }
    }

    if (lessonContext) {
      context.lessonContext = lessonContext;
    }

    // Get user's recent progress for context
    const recentProgress = await UserProgress.findAll({
      where: { userId },
      limit: 5,
      order: [["lastReviewedAt", "DESC"]],
    });

    if (recentProgress.length > 0) {
      context.recentStudy = recentProgress.map((p) => ({
        type: p.itemType,
        srsLevel: p.srsLevel,
        accuracy: p.totalCorrect / (p.totalCorrect + p.totalIncorrect),
      }));
    }

    const response = await aiSenseiChat(message, context);

    res.json({
      response,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Ai-Sensei chat error:", error);
    res
      .status(500)
      .json({ error: "Ai-Sensei is taking a break. Please try again!" });
  }
};

// Get personalized learning tip
const getLearningTip = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's progress stats
    const progress = await UserProgress.findAll({
      where: { userId },
      attributes: [
        "itemType",
        "srsLevel",
        "totalCorrect",
        "totalIncorrect",
        "meaningScore",
        "readingScore",
      ],
    });

    const stats = {
      totalItems: progress.length,
      averageAccuracy:
        progress.reduce((acc, p) => {
          const accuracy =
            p.totalCorrect / (p.totalCorrect + p.totalIncorrect || 1);
          return acc + accuracy;
        }, 0) / progress.length,
      weakAreas: progress
        .filter((p) => p.meaningScore < 0.6 || p.readingScore < 0.6)
        .map((p) => p.itemType),
    };

    const tip = await getPersonalizedTip(stats);

    res.json({ tip });
  } catch (error) {
    console.error("Get learning tip error:", error);
    res.status(500).json({ error: "Failed to generate learning tip" });
  }
};

// Generate all mnemonics for a batch of kanji
const generateBatchMnemonics = async (req, res) => {
  try {
    const { kanjiIds } = req.body;

    const results = [];

    for (const id of kanjiIds) {
      const kanji = await Kanji.findByPk(id);
      if (kanji && !kanji.meaningMnemonic) {
        const mnemonic = await generateMnemonic(kanji, "meaning");
        kanji.meaningMnemonic = mnemonic;
        await kanji.save();
        results.push({ kanjiId: id, success: true });
      }
    }

    res.json({
      message: "Mnemonics generated",
      results,
    });
  } catch (error) {
    console.error("Batch mnemonic generation error:", error);
    res.status(500).json({ error: "Failed to generate mnemonics" });
  }
};

module.exports = {
  getMnemonic,
  chatWithAiSensei,
  getLearningTip,
  generateBatchMnemonics,
};
