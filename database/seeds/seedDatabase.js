const path = require("path");
// Load .env from backend folder
require("dotenv").config({ path: path.join(__dirname, "../../backend/.env") });

const {
  sequelize,
  Radical,
  Kanji,
  Vocabulary,
} = require("../../backend/src/models");
const radicalData = require("./radicalSeeds");
const kanjiData = require("./kanjiSeeds");

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Debug: Check if env variables are loaded
    console.log("📍 Database Config:");
    console.log("   DB_NAME:", process.env.DB_NAME);
    console.log("   DB_USER:", process.env.DB_USER);
    console.log(
      "   DB_PASSWORD:",
      process.env.DB_PASSWORD ? "***hidden***" : "NOT SET!"
    );

    // Connect to database
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Sync models (create tables)
    await sequelize.sync({ force: true }); // WARNING: force:true drops all tables!
    console.log("✅ Tables created");

    // Seed radicals
    const radicals = await Radical.bulkCreate(radicalData);
    console.log(`✅ ${radicals.length} radicals created`);

    // Seed kanji
    const kanji = await Kanji.bulkCreate(kanjiData);
    console.log(`✅ ${kanji.length} kanji created`);

    console.log("🎉 Database seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
