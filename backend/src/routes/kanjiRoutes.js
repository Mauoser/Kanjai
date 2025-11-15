const express = require("express");
const router = express.Router();
const {
  getAllKanji,
  getKanjiById,
  getAllRadicals,
  getAllVocabulary,
} = require("../controllers/kanjiController");
const { optionalAuth } = require("../middleware/auth");

// All routes use optional auth to add progress if user is logged in
router.get("/kanji", optionalAuth, getAllKanji);
router.get("/kanji/:id", optionalAuth, getKanjiById);
router.get("/radicals", optionalAuth, getAllRadicals);
router.get("/vocabulary", optionalAuth, getAllVocabulary);

module.exports = router;
