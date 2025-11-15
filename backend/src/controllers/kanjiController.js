const { Kanji, Radical, Vocabulary, UserProgress } = require("../models");
const { Op } = require("sequelize");

// Get all kanji with pagination and filters
const getAllKanji = async (req, res) => {
  try {
    const { page = 1, limit = 20, level, jlptLevel, search } = req.query;

    // Build filter conditions
    const where = {};

    if (level) {
      where.level = level;
    }

    if (jlptLevel) {
      where.jlptLevel = jlptLevel;
    }

    if (search) {
      where[Op.or] = [
        { character: { [Op.like]: `%${search}%` } },
        { meaning: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Get kanji with pagination
    const offset = (page - 1) * limit;
    const { count, rows: kanji } = await Kanji.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ["level", "ASC"],
        ["strokeCount", "ASC"],
      ],
    });

    // If user is logged in, add their progress
    if (req.user) {
      const kanjiIds = kanji.map((k) => k.id);
      const progress = await UserProgress.findAll({
        where: {
          userId: req.user.id,
          itemType: "kanji",
          itemId: kanjiIds,
        },
      });

      // Map progress to kanji
      const progressMap = {};
      progress.forEach((p) => {
        progressMap[p.itemId] = {
          srsLevel: p.srsLevel,
          nextReviewDate: p.nextReviewDate,
          totalCorrect: p.totalCorrect,
          totalIncorrect: p.totalIncorrect,
        };
      });

      // Add progress to each kanji
      kanji.forEach((k) => {
        k.dataValues.userProgress = progressMap[k.id] || null;
      });
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
    console.error("Get kanji error:", error);
    res.status(500).json({
      error: "Failed to fetch kanji",
    });
  }
};

// Get single kanji with details
const getKanjiById = async (req, res) => {
  try {
    const { id } = req.params;

    const kanji = await Kanji.findByPk(id);

    if (!kanji) {
      return res.status(404).json({
        error: "Kanji not found",
      });
    }

    // Get radicals that make up this kanji
    let radicals = [];
    if (kanji.radicalIds && kanji.radicalIds.length > 0) {
      radicals = await Radical.findAll({
        where: {
          id: kanji.radicalIds,
        },
      });
    }

    // Get vocabulary that uses this kanji
    const vocabulary = await Vocabulary.findAll({
      where: {
        kanjiIds: {
          [Op.contains]: [parseInt(id)],
        },
      },
      limit: 10,
    });

    // Get user progress if logged in
    let userProgress = null;
    if (req.user) {
      userProgress = await UserProgress.findOne({
        where: {
          userId: req.user.id,
          itemType: "kanji",
          itemId: id,
        },
      });
    }

    res.json({
      kanji,
      radicals,
      vocabulary,
      userProgress,
    });
  } catch (error) {
    console.error("Get kanji by ID error:", error);
    res.status(500).json({
      error: "Failed to fetch kanji details",
    });
  }
};

// Get all radicals
const getAllRadicals = async (req, res) => {
  try {
    const { level } = req.query;

    const where = {};
    if (level) {
      where.level = level;
    }

    const radicals = await Radical.findAll({
      where,
      order: [
        ["level", "ASC"],
        ["strokeCount", "ASC"],
      ],
    });

    res.json({
      radicals,
    });
  } catch (error) {
    console.error("Get radicals error:", error);
    res.status(500).json({
      error: "Failed to fetch radicals",
    });
  }
};

// Get vocabulary
const getAllVocabulary = async (req, res) => {
  try {
    const { page = 1, limit = 20, level, search } = req.query;

    const where = {};

    if (level) {
      where.level = level;
    }

    if (search) {
      where[Op.or] = [
        { word: { [Op.like]: `%${search}%` } },
        { meaning: { [Op.iLike]: `%${search}%` } },
        { reading: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    const { count, rows: vocabulary } = await Vocabulary.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["level", "ASC"]],
    });

    res.json({
      vocabulary,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
      },
    });
  } catch (error) {
    console.error("Get vocabulary error:", error);
    res.status(500).json({
      error: "Failed to fetch vocabulary",
    });
  }
};

module.exports = {
  getAllKanji,
  getKanjiById,
  getAllRadicals,
  getAllVocabulary,
};
