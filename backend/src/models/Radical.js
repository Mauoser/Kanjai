const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Radical = sequelize.define(
  "Radical",
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
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    primaryName: {
      type: DataTypes.STRING(100),
      comment: "Primary name of the radical",
    },
    meaning: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    strokeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: "Learning level (1-60)",
    },
    mnemonic: {
      type: DataTypes.TEXT,
      comment: "Story to remember the radical",
    },
    explanation: {
      type: DataTypes.TEXT,
      comment: "Detailed explanation of the radical",
    },
    visualImage: {
      type: DataTypes.TEXT,
      comment: "Visual representation URL or base64",
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Is this a primary/common radical",
    },
    isGenerated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether content was AI-generated",
    },
  },
  {
    indexes: [{ fields: ["level"] }, { fields: ["isPrimary"] }],
  }
);

module.exports = Radical;
