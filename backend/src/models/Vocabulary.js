const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Vocabulary = sequelize.define("Vocabulary", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  word: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  reading: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: "Hiragana reading",
  },
  meaning: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  alternativeMeanings: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  wordType: {
    type: DataTypes.STRING(50),
    comment: "noun, verb, adjective, etc.",
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  contextSentences: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: "Array of {japanese, english, reading} objects",
  },
  commonWordCombinations: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: "Common phrases using this word",
  },
  readingMnemonic: {
    type: DataTypes.TEXT,
  },
  meaningMnemonic: {
    type: DataTypes.TEXT,
  },
  kanjiIds: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
    comment: "Kanji contained in this word",
  },
  explanation: {
    type: DataTypes.TEXT,
    comment: "Explanation of the vocabulary",
  },
  patternOfUse: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: "Array of {pattern, description} for common usage patterns",
  },
  readingExplanation: {
    type: DataTypes.TEXT,
    comment: "Explanation of why this reading is used",
  },
  isGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: "Whether content was AI-generated",
  },
});

module.exports = Vocabulary;
