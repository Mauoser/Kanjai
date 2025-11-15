const learningPathService = require("../services/learningPathService");
const contentGenerationService = require("../services/contentGenerationService");
const { Radical, Kanji, Vocabulary } = require("../models");

/**
 * Initialize learning path for a user (create radicals, kanji, vocabulary)
 */
const initializePath = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jlptLevel = 5 } = req.body;

    const result = await learningPathService.initializeLearningPath(
      userId,
      jlptLevel
    );
    res.json({
      message: "Learning path initialized",
      ...result,
    });
  } catch (error) {
    console.error("Error initializing learning path:", error);
    res.status(500).json({ error: "Failed to initialize learning path" });
  }
};

/**
 * Get next item for the user to learn
 */
const getNextItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const nextItem = await learningPathService.getNextItem(userId);

    if (!nextItem) {
      return res.json({
        message: "No items to learn",
        nextItem: null,
      });
    }

    res.json({
      type: nextItem.type,
      item: nextItem.data,
      progress: nextItem.userProgress,
    });
  } catch (error) {
    console.error("Error getting next item:", error);
    res.status(500).json({ error: "Failed to get next item" });
  }
};

/**
 * Get all radicals at a specific JLPT level with user progress
 */
const getRadicals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jlptLevel = 5 } = req.query;

    const radicals = await learningPathService.getRadicalsByLevel(
      userId,
      parseInt(jlptLevel)
    );

    res.json({
      jlptLevel: parseInt(jlptLevel),
      count: radicals.length,
      radicals,
    });
  } catch (error) {
    console.error("Error getting radicals:", error);
    res.status(500).json({ error: "Failed to get radicals" });
  }
};

/**
 * Get radical details
 */
const getRadicalDetail = async (req, res) => {
  try {
    const { radicalId } = req.params;
    const radical = await Radical.findByPk(radicalId);

    if (!radical) {
      return res.status(404).json({ error: "Radical not found" });
    }

    res.json(radical);
  } catch (error) {
    console.error("Error getting radical detail:", error);
    res.status(500).json({ error: "Failed to get radical" });
  }
};

/**
 * Get all kanji at a specific JLPT level with user progress
 */
const getKanji = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jlptLevel = 5 } = req.query;

    const kanji = await learningPathService.getKanjiByLevel(
      userId,
      parseInt(jlptLevel)
    );

    res.json({
      jlptLevel: parseInt(jlptLevel),
      count: kanji.length,
      kanji,
    });
  } catch (error) {
    console.error("Error getting kanji:", error);
    res.status(500).json({ error: "Failed to get kanji" });
  }
};

/**
 * Get kanji details with vocabulary
 */
const getKanjiDetail = async (req, res) => {
  try {
    const { kanjiId } = req.params;
    const userId = req.user.id;

    const kanji = await Kanji.findByPk(kanjiId);
    if (!kanji) {
      return res.status(404).json({ error: "Kanji not found" });
    }

    const vocabulary = await learningPathService.getVocabularyForKanji(
      userId,
      kanjiId
    );

    res.json({
      ...kanji.toJSON(),
      vocabulary,
    });
  } catch (error) {
    console.error("Error getting kanji detail:", error);
    res.status(500).json({ error: "Failed to get kanji" });
  }
};

/**
 * Get vocabulary list for a kanji
 */
const getVocabulary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { kanjiId } = req.params;

    const vocabulary = await learningPathService.getVocabularyForKanji(
      userId,
      parseInt(kanjiId)
    );

    res.json({
      kanjiId: parseInt(kanjiId),
      count: vocabulary.length,
      vocabulary,
    });
  } catch (error) {
    console.error("Error getting vocabulary:", error);
    res.status(500).json({ error: "Failed to get vocabulary" });
  }
};

/**
 * Mark radical as mastered
 */
const masterRadical = async (req, res) => {
  try {
    const userId = req.user.id;
    const { radicalId } = req.params;

    const result = await learningPathService.masterRadical(
      userId,
      parseInt(radicalId)
    );

    res.json(result);
  } catch (error) {
    console.error("Error mastering radical:", error);
    res.status(500).json({ error: "Failed to master radical" });
  }
};

/**
 * Mark kanji as mastered
 */
const masterKanji = async (req, res) => {
  try {
    const userId = req.user.id;
    const { kanjiId } = req.params;

    const result = await learningPathService.masterKanji(
      userId,
      parseInt(kanjiId)
    );

    res.json(result);
  } catch (error) {
    console.error("Error mastering kanji:", error);
    res.status(500).json({ error: "Failed to master kanji" });
  }
};

/**
 * Get complete curriculum for a JLPT level
 */
const getCurriculum = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jlptLevel = 5 } = req.query;

    const curriculum = await learningPathService.getCurriculumData(
      userId,
      parseInt(jlptLevel)
    );

    res.json(curriculum);
  } catch (error) {
    console.error("Error getting curriculum:", error);
    res.status(500).json({ error: "Failed to get curriculum" });
  }
};

/**
 * Get user's learning progress
 */
const getProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await learningPathService.getLearningProgress(userId);

    res.json(progress);
  } catch (error) {
    console.error("Error getting progress:", error);
    res.status(500).json({ error: "Failed to get progress" });
  }
};

module.exports = {
  initializePath,
  getNextItem,
  getRadicals,
  getRadicalDetail,
  getKanji,
  getKanjiDetail,
  getVocabulary,
  masterRadical,
  masterKanji,
  getCurriculum,
  getProgress,
};
