const { User } = require("../models");
const { generateToken } = require("../middleware/auth");
const { Op } = require("sequelize");

// Debug log
console.log("Auth controller loaded");

// Register new user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      console.log("Missing required fields");
      return res.status(400).json({
        error: "Please provide username, email, and password",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    console.log(
      "Existing user check:",
      existingUser ? "User found" : "No user found"
    );

    if (existingUser) {
      const errorMsg =
        existingUser.email === email
          ? "Email already registered"
          : "Username already taken";
      console.log("Registration blocked:", errorMsg);
      return res.status(400).json({
        error: errorMsg,
      });
    }

    // Create user
    console.log("Creating new user...");
    const user = await User.create({
      username,
      email,
      password, // Will be hashed automatically by the model hook
    });

    console.log("User created successfully:", user.id);

    // Generate token
    const token = generateToken(user.id);

    // Send response
    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        totalXP: user.totalXP,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Failed to register user",
      details: error.message,
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Please provide email and password",
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Check password
    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Update last study date
    user.lastStudyDate = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user.id);

    // Send response
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        totalXP: user.totalXP,
        currentStreak: user.currentStreak,
        preferredMnemonicStyle: user.preferredMnemonicStyle,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Failed to login",
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    res.json({
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      error: "Failed to get user information",
    });
  }
};

// Logout (optional - mainly for client-side)
const logout = async (req, res) => {
  try {
    // In a JWT system, logout is typically handled client-side
    // But we can add token blacklisting here if needed
    res.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to logout",
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: "Password is required to delete account",
      });
    }

    // Find user and verify password
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Verify password
    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid password",
      });
    }

    // Delete all user data (cascade delete will handle related records)
    await user.destroy();

    res.json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      error: "Failed to delete account",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  deleteAccount,
};
