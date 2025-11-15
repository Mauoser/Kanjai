const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UserProgress = sequelize.define(
  "UserProgress",
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
    itemType: {
      type: DataTypes.ENUM("radical", "kanji", "vocabulary"),
      allowNull: false,
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    srsLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "0=Lesson, 1=Apprentice1, 2=Apprentice2, ... 8=Burned",
    },
    nextReviewDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    totalCorrect: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalIncorrect: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    currentStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    meaningScore: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: "Success rate for meaning reviews",
    },
    readingScore: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: "Success rate for reading reviews",
    },
    lastReviewedAt: {
      type: DataTypes.DATE,
    },
    unlockedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    burnedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
      comment: "When item reached max SRS level",
    },
    timesResurrected: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "How many times unburned",
    },
  },
  {
    indexes: [
      { fields: ["userId", "itemType", "itemId"], unique: true },
      { fields: ["userId", "nextReviewDate"] },
      { fields: ["srsLevel"] },
    ],
  }
);

module.exports = UserProgress;
