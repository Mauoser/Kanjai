const {
  Radical,
  Kanji,
  Vocabulary,
  UserRadical,
  UserKanji,
  UserVocabulary,
  User,
} = require("../models");
const { Op } = require("sequelize");
const contentGenerationService = require("./contentGenerationService");

class LearningPathService {
  /**
   * Get next item in user's learning path
   * Priority: incomplete radicals -> incomplete kanji -> incomplete vocabulary
   */
  async getNextItem(userId) {
    try {
      // 1. Check for incomplete radicals
      const incompleteRadical = await UserRadical.findOne({
        where: {
          userId,
          status: { [Op.ne]: "mastered" },
        },
        order: [["createdAt", "ASC"]],
      });

      if (incompleteRadical) {
        const radical = await Radical.findByPk(incompleteRadical.radicalId);
        return {
          type: "radical",
          data: radical,
          userProgress: incompleteRadical,
        };
      }

      // 2. Check for incomplete kanji
      const incompleteKanji = await UserKanji.findOne({
        where: {
          userId,
          status: { [Op.ne]: "mastered" },
        },
        order: [["createdAt", "ASC"]],
      });

      if (incompleteKanji) {
        const kanji = await Kanji.findByPk(incompleteKanji.kanjiId);
        return {
          type: "kanji",
          data: kanji,
          userProgress: incompleteKanji,
        };
      }

      // 3. Check for incomplete vocabulary
      const incompleteVocab = await UserVocabulary.findOne({
        where: {
          userId,
          status: { [Op.ne]: "mastered" },
        },
        order: [["createdAt", "ASC"]],
      });

      if (incompleteVocab) {
        const vocab = await Vocabulary.findByPk(incompleteVocab.vocabularyId);
        return {
          type: "vocabulary",
          data: vocab,
          userProgress: incompleteVocab,
        };
      }

      return null;
    } catch (error) {
      console.error("Error getting next item:", error);
      throw error;
    }
  }

  /**
   * Initialize learning path for a user at a specific JLPT level
   * Creates: essential radicals -> kanji using those radicals -> vocabulary for kanji
   */
  async initializeLearningPath(userId, jlptLevel) {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error("User not found");

      const essentialRadicals =
        contentGenerationService.getEssentialRadicals(jlptLevel);

      // Step 1: Create or get radicals and add to user
      for (const radicalInfo of essentialRadicals) {
        let radical = await Radical.findOne({
          where: { character: radicalInfo.char },
        });

        if (!radical) {
          const radicalData =
            await contentGenerationService.generateRadicalData(
              radicalInfo.char,
              contentGenerationService.jlptToLevel(jlptLevel)
            );
          radical = await Radical.create(radicalData);
        }

        // Add to user if not already there
        const userRadical = await UserRadical.findOne({
          where: { userId, radicalId: radical.id },
        });
        if (!userRadical) {
          await UserRadical.create({
            userId,
            radicalId: radical.id,
            character: radical.character,
          });
        }
      }

      // Step 2: For JLPT N5, generate some kanji using these radicals
      if (jlptLevel === 5) {
        const basicKanji = [
          "火",
          "水",
          "木",
          "日",
          "月",
          "人",
          "土",
          "金",
          "山",
        ];
        for (const kanjiChar of basicKanji) {
          let kanji = await Kanji.findOne({
            where: { character: kanjiChar },
          });

          if (!kanji) {
            const kanjiData =
              await contentGenerationService.generateKanjiDataWithContext(
                kanjiChar,
                jlptLevel,
                essentialRadicals
                  .filter(
                    (r) => r.char === kanjiChar || kanjiChar.includes(r.char)
                  )
                  .map((r) => r.name)
              );
            kanji = await Kanji.create(kanjiData);
          }

          // Add to user if not already there
          const userKanji = await UserKanji.findOne({
            where: { userId, kanjiId: kanji.id },
          });
          if (!userKanji) {
            await UserKanji.create({
              userId,
              kanjiId: kanji.id,
              character: kanji.character,
              status: "learning",
              userLevel: user.level,
              jlptLevel: kanji.jlptLevel,
            });
          }
        }
      }

      return {
        message: "Learning path initialized",
        jlptLevel,
        radicalsCount: essentialRadicals.length,
      };
    } catch (error) {
      console.error("Error initializing learning path:", error);
      throw error;
    }
  }

  /**
   * Get all radicals at a specific level with user progress
   */
  async getRadicalsByLevel(userId, jlptLevel) {
    try {
      const level = contentGenerationService.jlptToLevel(jlptLevel);
      const radicals = await Radical.findAll({
        where: { level },
        attributes: ["id", "character", "name", "meaning", "mnemonic"],
      });

      const withProgress = await Promise.all(
        radicals.map(async (radical) => {
          const userProgress = await UserRadical.findOne({
            where: { userId, radicalId: radical.id },
          });
          return {
            ...radical.toJSON(),
            userProgress: userProgress?.toJSON() || null,
          };
        })
      );

      return withProgress;
    } catch (error) {
      console.error("Error getting radicals by level:", error);
      throw error;
    }
  }

  /**
   * Get kanji at a level, organized by prerequisites (radicals they use)
   */
  async getKanjiByLevel(userId, jlptLevel) {
    try {
      const kanji = await Kanji.findAll({
        where: { jlptLevel },
        attributes: [
          "id",
          "character",
          "meaning",
          "onyomi",
          "kunyomi",
          "radicalIds",
          "foundInVocabulary",
        ],
      });

      const withProgress = await Promise.all(
        kanji.map(async (k) => {
          const userProgress = await UserKanji.findOne({
            where: { userId, kanjiId: k.id },
          });
          return {
            ...k.toJSON(),
            userProgress: userProgress?.toJSON() || null,
          };
        })
      );

      return withProgress;
    } catch (error) {
      console.error("Error getting kanji by level:", error);
      throw error;
    }
  }

  /**
   * Get vocabulary for a specific kanji
   */
  async getVocabularyForKanji(userId, kanjiId) {
    try {
      const kanji = await Kanji.findByPk(kanjiId);
      if (!kanji) throw new Error("Kanji not found");

      let vocabulary = await Vocabulary.findAll({
        where: {
          kanjiIds: { [Op.contains]: [kanjiId] },
        },
      });

      // If no vocab exists, generate some
      if (vocabulary.length === 0 && kanji.foundInVocabulary?.length > 0) {
        for (const vocabInfo of kanji.foundInVocabulary.slice(0, 5)) {
          const vocabData =
            await contentGenerationService.generateVocabularyData(
              vocabInfo.word,
              vocabInfo.reading,
              [kanji.character]
            );
          vocabulary.push(
            await Vocabulary.create({
              ...vocabData,
              kanjiIds: [kanjiId],
            })
          );
        }
      }

      const withProgress = await Promise.all(
        vocabulary.map(async (vocab) => {
          const userProgress = await UserVocabulary.findOne({
            where: { userId, vocabularyId: vocab.id },
          });
          return {
            ...vocab.toJSON(),
            userProgress: userProgress?.toJSON() || null,
          };
        })
      );

      return withProgress;
    } catch (error) {
      console.error("Error getting vocabulary for kanji:", error);
      throw error;
    }
  }

  /**
   * Mark radical as mastered and unlock related kanji
   */
  async masterRadical(userId, radicalId) {
    try {
      const userRadical = await UserRadical.findOne({
        where: { userId, radicalId },
      });

      if (!userRadical) throw new Error("User radical not found");

      userRadical.status = "mastered";
      userRadical.masteredAt = new Date();
      await userRadical.save();

      // Check if all radicals for any kanji are mastered, if so unlock them
      const allRadicals = await UserRadical.findAll({
        where: { userId },
      });

      // This would be extended based on kanji-radical relationships
      return { message: "Radical mastered" };
    } catch (error) {
      console.error("Error mastering radical:", error);
      throw error;
    }
  }

  /**
   * Mark kanji as mastered and unlock related vocabulary
   */
  async masterKanji(userId, kanjiId) {
    try {
      const userKanji = await UserKanji.findOne({
        where: { userId, kanjiId },
      });

      if (!userKanji) throw new Error("User kanji not found");

      userKanji.status = "mastered";
      userKanji.masteredAt = new Date();
      await userKanji.save();

      // Get vocabulary for this kanji and add to user
      const vocabulary = await this.getVocabularyForKanji(userId, kanjiId);
      for (const vocab of vocabulary) {
        const existing = await UserVocabulary.findOne({
          where: { userId, vocabularyId: vocab.id },
        });
        if (!existing) {
          await UserVocabulary.create({
            userId,
            vocabularyId: vocab.id,
            word: vocab.word,
          });
        }
      }

      return { message: "Kanji mastered, vocabulary unlocked" };
    } catch (error) {
      console.error("Error mastering kanji:", error);
      throw error;
    }
  }

  /**
   * Get comprehensive curriculum data for a user
   */
  async getCurriculumData(userId, jlptLevel) {
    try {
      const curriculum = {
        level: jlptLevel,
        radicals: await this.getRadicalsByLevel(userId, jlptLevel),
        kanji: await this.getKanjiByLevel(userId, jlptLevel),
      };

      // Add vocabulary for each kanji
      curriculum.kanji = await Promise.all(
        curriculum.kanji.map(async (k) => ({
          ...k,
          vocabulary: await this.getVocabularyForKanji(userId, k.id),
        }))
      );

      return curriculum;
    } catch (error) {
      console.error("Error getting curriculum data:", error);
      throw error;
    }
  }

  /**
   * Get user's learning progress summary
   */
  async getLearningProgress(userId) {
    try {
      const [
        totalRadicals,
        masteredRadicals,
        totalKanji,
        masteredKanji,
        totalVocab,
        masteredVocab,
      ] = await Promise.all([
        UserRadical.count({ where: { userId } }),
        UserRadical.count({ where: { userId, status: "mastered" } }),
        UserKanji.count({ where: { userId } }),
        UserKanji.count({ where: { userId, status: "mastered" } }),
        UserVocabulary.count({ where: { userId } }),
        UserVocabulary.count({ where: { userId, status: "mastered" } }),
      ]);

      return {
        radicals: {
          total: totalRadicals,
          mastered: masteredRadicals,
          percentage:
            totalRadicals > 0
              ? Math.round((masteredRadicals / totalRadicals) * 100)
              : 0,
        },
        kanji: {
          total: totalKanji,
          mastered: masteredKanji,
          percentage:
            totalKanji > 0 ? Math.round((masteredKanji / totalKanji) * 100) : 0,
        },
        vocabulary: {
          total: totalVocab,
          mastered: masteredVocab,
          percentage:
            totalVocab > 0 ? Math.round((masteredVocab / totalVocab) * 100) : 0,
        },
      };
    } catch (error) {
      console.error("Error getting learning progress:", error);
      throw error;
    }
  }
}

module.exports = new LearningPathService();
