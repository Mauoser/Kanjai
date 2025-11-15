const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Kanji = sequelize.define(
  "Kanji",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    character: {
      type: DataTypes.STRING(10),
      unique: true,
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
    nanori: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    strokeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jlptLevel: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5,
      },
    },
    grade: {
      type: DataTypes.INTEGER,
      comment: "Japanese school grade level",
    },
    frequency: {
      type: DataTypes.INTEGER,
      comment: "Usage frequency ranking",
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: "KanjAI level (1-60)",
    },
    meaningMnemonic: {
      type: DataTypes.TEXT,
      comment: "Story to remember meaning",
    },
    readingMnemonic: {
      type: DataTypes.TEXT,
      comment: "Story to remember reading",
    },
    meaningHint: {
      type: DataTypes.STRING,
      comment: "Quick hint for meaning",
    },
    readingHint: {
      type: DataTypes.STRING,
      comment: "Quick hint for reading",
    },
    visualImage: {
      type: DataTypes.TEXT,
      comment: "AI-generated image URL or base64",
    },
    radicalIds: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
      comment: "IDs of component radicals",
    },
    foundInVocabulary: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: "Array of {word, reading, meaning} vocabulary using this kanji",
    },
    isGenerated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether content was AI-generated",
    },
  },
  {
    indexes: [
      { fields: ["level"] },
      { fields: ["jlptLevel"] },
      { fields: ["frequency"] },
    ],
  }
);

module.exports = Kanji;
