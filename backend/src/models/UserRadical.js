const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UserRadical = sequelize.define(
  "UserRadical",
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
    radicalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    character: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "learning",
      comment: "Current learning status (learning, reviewing, mastered)",
    },
    masteredAt: {
      type: DataTypes.DATE,
      comment: "When the radical was marked as mastered",
    },
    meaningScore: {
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
      { fields: ["radicalId"] },
      { fields: ["status"] },
      { fields: ["userId", "status"] },
    ],
  }
);

module.exports = UserRadical;
