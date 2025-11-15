const contentGenerationService = require("../services/contentGenerationService");
const { UserKanji, UserProgress, sequelize } = require("../models");
const { Op } = require("sequelize");

// Generate new content for user
const generateContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { count = 5 } = req.body;

    // Generate personalized kanji batch
    const generatedKanji =
      await contentGenerationService.generateUserKanjiBatch(userId, count);

    res.json({
      message: "Content generated successfully",
      kanji: generatedKanji,
      count: generatedKanji.length,
    });
  } catch (error) {
    console.error("Content generation error:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
};

// Get user's personalized kanji
const getUserKanji = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jlptLevel, page = 1, limit = 20 } = req.query;

    const where = { userId };
    if (jlptLevel) {
      where.jlptLevel = jlptLevel;
    }

    const offset = (page - 1) * limit;
    const { count, rows: kanji } = await UserKanji.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ["userLevel", "ASC"],
        ["jlptLevel", "DESC"],
      ],
    });

    // Add progress data
    for (const k of kanji) {
      const progress = await UserProgress.findOne({
        where: {
          userId,
          itemType: "kanji",
          itemId: k.id,
        },
      });
      k.dataValues.progress = progress;
    }

    res.json({
      kanji,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
      },
    });
  } catch (error) {
    console.error("Get user kanji error:", error);
    res.status(500).json({ error: "Failed to fetch kanji" });
  }
};

// Adapt content difficulty based on performance
const adaptDifficulty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { kanjiId, performance } = req.body;

    await contentGenerationService.adaptDifficulty(
      userId,
      kanjiId,
      performance
    );

    res.json({ message: "Difficulty adapted successfully" });
  } catch (error) {
    console.error("Adapt difficulty error:", error);
    res.status(500).json({ error: "Failed to adapt difficulty" });
  }
};

// Get recommended next lessons based on performance
const getRecommendedLessons = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Getting recommendations for user:", userId);

    // Check if user needs new content
    const existingKanji = await UserKanji.count({ where: { userId } });
    console.log("Existing kanji count:", existingKanji);

    const masteredKanji = await UserProgress.count({
      where: {
        userId,
        itemType: "kanji",
        srsLevel: { [Op.gte]: 7 }, // Master or above
      },
    });
    console.log("Mastered kanji count:", masteredKanji);

    // Generate new content if user has mastered most of their kanji
    if (existingKanji === 0 || masteredKanji / existingKanji > 0.7) {
      console.log("Generating new content batch...");
      await contentGenerationService.generateUserKanjiBatch(userId, 10);
    }

    // Get unlearned kanji
    const unlearnedKanji = await UserKanji.findAll({
      where: {
        userId,
        id: {
          [Op.notIn]: sequelize.literal(
            `(SELECT "itemId" FROM "UserProgresses" WHERE "userId" = ${userId} AND "itemType" = 'kanji')`
          ),
        },
      },
      limit: 5,
      plain: false,
    });

    console.log("Unlearned kanji found:", unlearnedKanji.length);

    // Convert Sequelize instances to plain objects
    const plainKanji = unlearnedKanji.map(
      (k) => k.dataValues || k.get({ plain: true })
    );

    const responseData = {
      recommendations: plainKanji,
      message:
        plainKanji.length > 0
          ? "New lessons available"
          : "All caught up! Generating more content...",
    };

    console.log(
      "About to send response with",
      plainKanji.length,
      "recommendations"
    );

    // Disable caching completely - send fresh data every time
    res.set("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    res.set("Pragma", "no-cache");
    res.set("Expires", "-1");
    res.removeHeader("ETag");
    res.removeHeader("Last-Modified");

    // Log before sending
    console.log(
      "Response data to send:",
      JSON.stringify(responseData).substring(0, 100)
    );

    res.status(200).json(responseData);
    console.log("Response sent (after json call)");
  } catch (error) {
    console.error("Get recommendations error:", error);
    return res
      .status(500)
      .json({ error: "Failed to get recommendations", details: error.message });
  }
};

module.exports = {
  generateContent,
  getUserKanji,
  adaptDifficulty,
  getRecommendedLessons,
};
