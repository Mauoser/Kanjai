const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UserVocabulary = sequelize.define(
  "UserVocabulary",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vocabularyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    word: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "learning",
      comment: "Current learning status (learning, reviewing, mastered)",
    },
    masteredAt: {
      type: DataTypes.DATE,
      comment: "When the vocabulary was marked as mastered",
    },
    meaningScore: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: { min: 0, max: 1 },
    },
    readingScore: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: { min: 0, max: 1 },
    },
    repeatCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Number of times reviewed",
    },
    lastReviewedAt: {
      type: DataTypes.DATE,
    },
    nextReviewAt: {
      type: DataTypes.DATE,
    },
  },
  {
    indexes: [
      { fields: ["userId"] },
      { fields: ["vocabularyId"] },
      { fields: ["status"] },
      { fields: ["userId", "status"] },
    ],
  }
);

module.exports = UserVocabulary;
