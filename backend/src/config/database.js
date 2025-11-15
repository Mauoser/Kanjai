const { Sequelize } = require("sequelize");
require("dotenv").config();

// Create connection to PostgreSQL
// Render provides DATABASE_URL, local dev uses separate variables
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: process.env.NODE_ENV === "development" ? console.log : false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Required for Render's PostgreSQL
        },
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: "postgres",
        logging: process.env.NODE_ENV === "development" ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    );

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully!");
  } catch (error) {
    console.error("❌ Unable to connect to database:", error);
    // Log which connection method was attempted
    console.error(
      "Connection method:",
      process.env.DATABASE_URL ? "DATABASE_URL" : "Individual variables"
    );
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
