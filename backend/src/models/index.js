const User = require("./User");
const Kanji = require("./Kanji");
const Radical = require("./Radical");
const Vocabulary = require("./Vocabulary");
const UserProgress = require("./UserProgress");
const { sequelize } = require("../config/database");
const UserKanji = require("./UserKanji");
const UserRadical = require("./UserRadical");
const UserVocabulary = require("./UserVocabulary");

// Define relationships
User.hasMany(UserProgress, { foreignKey: "userId", as: "progress" });
UserProgress.belongsTo(User, { foreignKey: "userId" });
User.hasMany(UserKanji, { foreignKey: "userId", as: "userKanji" });
UserKanji.belongsTo(User, { foreignKey: "userId" });
User.hasMany(UserRadical, { foreignKey: "userId", as: "userRadicals" });
UserRadical.belongsTo(User, { foreignKey: "userId" });
User.hasMany(UserVocabulary, { foreignKey: "userId", as: "userVocabulary" });
UserVocabulary.belongsTo(User, { foreignKey: "userId" });

// Export all models
module.exports = {
  sequelize,
  User,
  Kanji,
  Radical,
  Vocabulary,
  UserProgress,
  UserKanji,
  UserRadical,
  UserVocabulary,
};
