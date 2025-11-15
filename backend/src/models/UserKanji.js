const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UserKanji = sequelize.define(
  "UserKanji",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    character: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    meaning: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    alternativeMeanings: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    onyomi: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    kunyomi: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    jlptLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    userLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: "Level when this was generated for the user",
    },
    meaningMnemonic: {
      type: DataTypes.TEXT,
      comment: "Personalized mnemonic for this user",
    },
    readingMnemonic: {
      type: DataTypes.TEXT,
      comment: "Personalized reading mnemonic",
    },
    contextSentences: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: "Example sentences generated for this user",
    },
    difficulty: {
      type: DataTypes.STRING(10), // Changed from ENUM to STRING
      defaultValue: "medium",
      validate: {
        isIn: [["easy", "medium", "hard"]], // Validation instead of ENUM
      },
      comment: "Difficulty level for this specific user",
    },
    generatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    indexes: [
      { fields: ["userId", "character"], unique: true },
      { fields: ["userId", "jlptLevel"] },
      { fields: ["userId", "userLevel"] },
    ],
  }
);

module.exports = UserKanji;
