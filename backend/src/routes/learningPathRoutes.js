const express = require("express");
const learningPathController = require("../controllers/learningPathController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Learning path initialization
router.post("/initialize", learningPathController.initializePath);

// Get next item to learn
router.get("/next", learningPathController.getNextItem);

// Get learning progress
router.get("/progress", learningPathController.getProgress);

// Get full curriculum for a JLPT level
router.get("/curriculum", learningPathController.getCurriculum);

// Radical endpoints
router.get("/radicals", learningPathController.getRadicals);
router.get("/radicals/:radicalId", learningPathController.getRadicalDetail);
router.post(
  "/radicals/:radicalId/master",
  learningPathController.masterRadical
);

// Kanji endpoints
router.get("/kanji", learningPathController.getKanji);
router.get("/kanji/:kanjiId", learningPathController.getKanjiDetail);
router.post("/kanji/:kanjiId/master", learningPathController.masterKanji);

// Vocabulary endpoints
router.get("/kanji/:kanjiId/vocabulary", learningPathController.getVocabulary);

module.exports = router;
