const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  deleteAccount,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

// Debug log
console.log("Auth routes loading...");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logout);

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes working!" });
});

router.delete("/account", authenticate, deleteAccount);

module.exports = router;
