const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      validate: {
        len: [3, 50],
      },
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    totalXP: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    currentStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    longestStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastStudyDate: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    studyGoal: {
      type: DataTypes.INTEGER,
      defaultValue: 10, // Daily kanji goal
      validate: {
        min: 1,
        max: 50,
      },
    },
    preferredMnemonicStyle: {
      type: DataTypes.ENUM("funny", "visual", "story", "logical"),
      defaultValue: "visual",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    hooks: {
      // Automatically hash password before saving
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

// Method to check password
User.prototype.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
