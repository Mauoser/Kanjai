const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  generateContent,
  getUserKanji,
  adaptDifficulty,
  getRecommendedLessons,
} = require("../controllers/contentController");

// All content routes require authentication
router.post("/generate", authenticate, generateContent);
router.get("/kanji", authenticate, getUserKanji);
router.post("/adapt", authenticate, adaptDifficulty);
router.get("/recommendations", authenticate, getRecommendedLessons);

module.exports = router;
