const express = require("express");
const router = express.Router();
const {
  getLessons,
  getReviews,
  submitAnswer,
  getUserStats,
} = require("../controllers/progressController");
const { authenticate } = require("../middleware/auth");

// All progress routes require authentication
router.get("/lessons", authenticate, getLessons);
router.get("/reviews", authenticate, getReviews);
router.post("/submit", authenticate, submitAnswer);
router.get("/stats", authenticate, getUserStats);

module.exports = router;
