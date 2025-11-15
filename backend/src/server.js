const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
require("dotenv").config();

// Import database and models
const { sequelize } = require("./models");
const { testConnection } = require("./config/database");

// Import routes
const authRoutes = require("./routes/authRoutes");
const kanjiRoutes = require("./routes/kanjiRoutes");
const progressRoutes = require("./routes/progressRoutes");
const aiRoutes = require("./routes/aiRoutes");
const contentRoutes = require("./routes/contentRoutes");
const learningPathRoutes = require("./routes/learningPathRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Setup
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "KanjAI Backend Server is running!",
    endpoints: {
      auth: "/api/auth",
      kanji: "/api/kanji",
      progress: "/api/progress",
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "KanjAI Backend",
    database: "Connected",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api", kanjiRoutes); // kanji, radicals, vocabulary
app.use("/api/progress", progressRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/learning-path", learningPathRoutes);

// Debug route to list all registered routes (place this BEFORE the 404 handler)
app.get("/api/routes", (req, res) => {
  const routes = [];

  // Function to extract routes from a router
  const extractRoutes = (stack, prefix = "") => {
    stack.forEach((middleware) => {
      if (middleware.route) {
        // Direct route
        routes.push({
          path: prefix + middleware.route.path,
          methods: Object.keys(middleware.route.methods),
        });
      } else if (middleware.name === "router" && middleware.handle.stack) {
        // Router middleware
        const routerPrefix = middleware.regexp.source
          .replace("\\/?(?=\\/|$)", "")
          .replace(/\\/g, "")
          .replace("^", "")
          .replace("$", "")
          .replace("(?:", "")
          .replace(")", "");
        extractRoutes(middleware.handle.stack, prefix + routerPrefix);
      }
    });
  };

  extractRoutes(app._router.stack);

  res.json({
    totalRoutes: routes.length,
    routes: routes.sort((a, b) => a.path.localeCompare(b.path)),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// Initialize database and start server
const initializeApp = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database models
    await sequelize.sync({ alter: true });
    console.log("📊 Database tables synchronized!");

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
      console.log(`\n📚 API Endpoints:`);
      console.log(`   Auth: http://localhost:${PORT}/api/auth`);
      console.log(`   Kanji: http://localhost:${PORT}/api/kanji`);
      console.log(`   Progress: http://localhost:${PORT}/api/progress`);
    });
  } catch (error) {
    console.error("Failed to initialize app:", error);
    process.exit(1);
  }
};

// Start the application
initializeApp();
