const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  getMnemonic,
  chatWithAiSensei,
  getLearningTip,
  generateBatchMnemonics,
} = require("../controllers/aiController");

// All AI routes require authentication
router.post("/mnemonic", authenticate, getMnemonic);
router.post("/chat", authenticate, chatWithAiSensei);
router.get("/tip", authenticate, getLearningTip);
router.post("/batch-mnemonics", authenticate, generateBatchMnemonics);

module.exports = router;
