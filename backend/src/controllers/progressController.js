const {
  UserProgress,
  Kanji,
  Radical,
  Vocabulary,
  User,
  UserKanji,
} = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");

// SRS intervals in hours
const SRS_INTERVALS = [
  0, // 0: Lesson
  4, // 1: Apprentice 1 → 4 hours
  8, // 2: Apprentice 2 → 8 hours
  24, // 3: Apprentice 3 → 1 day
  48, // 4: Apprentice 4 → 2 days
  168, // 5: Guru 1 → 1 week
  336, // 6: Guru 2 → 2 weeks
  720, // 7: Master → 1 month
  2880, // 8: Enlightened → 4 months
  null, // 9: Burned → Forever
];

// Get items available for lessons
const getLessons = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    // Get user's current level
    const user = await User.findByPk(userId);

    // Get items not yet studied (no progress record)
    const studiedItems = await UserProgress.findAll({
      where: { userId },
      attributes: ["itemType", "itemId"],
    });

    const studiedMap = {};
    studiedItems.forEach((item) => {
      const key = `${item.itemType}-${item.itemId}`;
      studiedMap[key] = true;
    });

    // Get available radicals
    const radicals = await Radical.findAll({
      where: {
        level: { [Op.lte]: user.level },
      },
      limit: parseInt(limit),
    });

    const availableRadicals = radicals.filter(
      (r) => !studiedMap[`radical-${r.id}`]
    );

    // Get available kanji
    const kanji = await Kanji.findAll({
      where: {
        level: { [Op.lte]: user.level },
      },
      limit: parseInt(limit),
    });

    const availableKanji = kanji.filter((k) => !studiedMap[`kanji-${k.id}`]);

    // Combine and limit
    const lessons = [
      ...availableRadicals.map((r) => ({
        type: "radical",
        id: r.id,
        data: r,
      })),
      ...availableKanji.map((k) => ({
        type: "kanji",
        id: k.id,
        data: k,
      })),
    ].slice(0, parseInt(limit));

    res.json({
      lessons,
      count: lessons.length,
    });
  } catch (error) {
    console.error("Get lessons error:", error);
    res.status(500).json({
      error: "Failed to fetch lessons",
    });
  }
};

// Get items due for review
const getReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Get all items due for review
    const reviews = await UserProgress.findAll({
      where: {
        userId,
        nextReviewDate: { [Op.lte]: now },
        srsLevel: { [Op.lt]: 9 }, // Not burned
      },
      order: [["nextReviewDate", "ASC"]],
    });

    // Fetch the actual items
    const reviewItems = [];

    for (const review of reviews) {
      let item;

      if (review.itemType === "radical") {
        item = await Radical.findByPk(review.itemId);
      } else if (review.itemType === "kanji") {
        // Use UserKanji for user-specific kanji with AI-generated content
        item = await UserKanji.findByPk(review.itemId);
      } else if (review.itemType === "vocabulary") {
        item = await Vocabulary.findByPk(review.itemId);
      }

      if (item) {
        reviewItems.push({
          type: review.itemType,
          id: review.itemId,
          data: item,
          srsLevel: review.srsLevel,
          totalCorrect: review.totalCorrect,
          totalIncorrect: review.totalIncorrect,
        });
      }
    }

    res.json({
      reviews: reviewItems,
      count: reviewItems.length,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      error: "Failed to fetch reviews",
    });
  }
};

// Submit answer for review or lesson
const submitAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      itemType,
      itemId,
      answerType, // 'meaning' or 'reading'
      answer,
      isCorrect,
    } = req.body;

    // Get or create progress
    let progress = await UserProgress.findOne({
      where: {
        userId,
        itemType,
        itemId,
      },
    });

    if (!progress) {
      // First time studying this item (lesson)
      progress = await UserProgress.create({
        userId,
        itemType,
        itemId,
        srsLevel: 0,
        nextReviewDate: new Date(), // Set to now so it appears in reviews immediately
      });
    }

    // Update statistics
    if (isCorrect) {
      progress.totalCorrect += 1;
      progress.currentStreak += 1;

      // Update SRS level (move up)
      if (progress.srsLevel < 9) {
        progress.srsLevel += 1;
      }
    } else {
      progress.totalIncorrect += 1;
      progress.currentStreak = 0;

      // Penalty: move down SRS levels
      if (progress.srsLevel > 1) {
        progress.srsLevel = Math.max(1, progress.srsLevel - 2);
      } else if (progress.srsLevel === 0) {
        // If it's a lesson (level 0), move to level 1 even if wrong
        progress.srsLevel = 1;
      }
    }

    // Update scores
    const totalAttempts = progress.totalCorrect + progress.totalIncorrect;
    if (answerType === "meaning") {
      progress.meaningScore = progress.totalCorrect / totalAttempts;
    } else if (answerType === "reading") {
      progress.readingScore = progress.totalCorrect / totalAttempts;
    }

    // Calculate next review date
    const hoursUntilNext = SRS_INTERVALS[progress.srsLevel];
    if (hoursUntilNext !== null && hoursUntilNext !== undefined) {
      const nextDate = new Date();
      // For testing, make intervals shorter (minutes instead of hours)
      // Change back to hours for production
      nextDate.setMinutes(nextDate.getMinutes() + hoursUntilNext); // Using minutes for testing
      // nextDate.setHours(nextDate.getHours() + hoursUntilNext); // Use this for production
      progress.nextReviewDate = nextDate;
    } else if (progress.srsLevel === 9) {
      // Burned - no more reviews
      progress.burnedAt = new Date();
      progress.nextReviewDate = null;
    }

    progress.lastReviewedAt = new Date();
    await progress.save();

    // Update user XP and streak
    const user = await User.findByPk(userId);
    const xpGained = isCorrect ? 10 : 2;
    user.totalXP += xpGained;

    // Check for level up (every 1000 XP)
    const newLevel = Math.floor(user.totalXP / 1000) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }

    // Update streak
    const today = new Date().toDateString();
    const lastStudy = user.lastStudyDate
      ? new Date(user.lastStudyDate).toDateString()
      : null;

    if (lastStudy !== today) {
      // First study of the day
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastStudy === yesterday.toDateString()) {
        // Continuing streak
        user.currentStreak += 1;
        if (user.currentStreak > user.longestStreak) {
          user.longestStreak = user.currentStreak;
        }
      } else {
        // Streak broken or first time
        user.currentStreak = 1;
      }

      user.lastStudyDate = new Date();
    }

    await user.save();

    res.json({
      success: true,
      isCorrect,
      progress: {
        srsLevel: progress.srsLevel,
        nextReviewDate: progress.nextReviewDate,
        totalCorrect: progress.totalCorrect,
        totalIncorrect: progress.totalIncorrect,
      },
      user: {
        totalXP: user.totalXP,
        level: user.level,
        currentStreak: user.currentStreak,
        xpGained,
      },
    });
  } catch (error) {
    console.error("Submit answer error:", error);
    res.status(500).json({
      error: "Failed to submit answer",
    });
  }
};
// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user
    const user = await User.findByPk(userId);

    // Get progress statistics
    const stats = await UserProgress.findAll({
      where: { userId },
      attributes: [
        "itemType",
        "srsLevel",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["itemType", "srsLevel"],
    });

    // Get total items per type
    const totals = await UserProgress.findAll({
      where: { userId },
      attributes: [
        "itemType",
        [sequelize.fn("COUNT", sequelize.col("id")), "total"],
        [sequelize.fn("SUM", sequelize.col("totalCorrect")), "totalCorrect"],
        [
          sequelize.fn("SUM", sequelize.col("totalIncorrect")),
          "totalIncorrect",
        ],
      ],
      group: ["itemType"],
    });

    // Get upcoming reviews count
    const now = new Date();
    const upcomingReviews = await UserProgress.count({
      where: {
        userId,
        nextReviewDate: { [Op.lte]: now },
        srsLevel: { [Op.lt]: 9 },
      },
    });

    // Format response - Initialize the structure first
    const formattedStats = {
      user: {
        level: user.level,
        totalXP: user.totalXP,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
      progress: {
        radicals: {},
        kanji: {},
        vocabulary: {},
      },
      totals: {},
      upcomingReviews,
      reviewCount: upcomingReviews,
    };

    // Process stats - Make sure the itemType exists before setting
    stats.forEach((stat) => {
      const data = stat.get({ plain: true });
      // Initialize the itemType object if it doesn't exist
      if (!formattedStats.progress[data.itemType]) {
        formattedStats.progress[data.itemType] = {};
      }
      formattedStats.progress[data.itemType][`level${data.srsLevel}`] =
        parseInt(data.count);
    });

    // Process totals
    totals.forEach((total) => {
      const data = total.get({ plain: true });
      formattedStats.totals[data.itemType] = {
        total: parseInt(data.total),
        correct: parseInt(data.totalCorrect) || 0,
        incorrect: parseInt(data.totalIncorrect) || 0,
        accuracy: data.totalCorrect
          ? (
              (parseInt(data.totalCorrect) /
                (parseInt(data.totalCorrect) + parseInt(data.totalIncorrect))) *
              100
            ).toFixed(1)
          : 0,
      };
    });

    res.json(formattedStats);
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      error: "Failed to fetch statistics",
    });
  }
};

module.exports = {
  getLessons,
  getReviews,
  submitAnswer,
  getUserStats,
};
