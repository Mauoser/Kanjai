import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import useStore from "../store/useStore";
import { convertRomajiToHiragana } from "../utils/romajiConverter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { progressAPI } from "../services/api";
import {
  BookOpen,
  ChevronRight,
  Volume2,
  Eye,
  CheckCircle,
  XCircle,
  Lightbulb,
  ArrowRight,
  Sparkles,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import AiSensei from "../components/AiSensei";
import { aiAPI } from "../services/aiApi";
import { contentAPI } from "../services/contentApi";

// Helper function to clean furigana readings (remove dots)
const cleanReading = (reading) => {
  if (!reading) return reading;
  return reading.replace(/\./g, "");
};

const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState("loading"); // loading, intro, quiz-meaning, quiz-reading, complete
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showAiSensei, setShowAiSensei] = useState(false);
  const [isGeneratingMnemonic, setIsGeneratingMnemonic] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
    meaningCorrect: 0,
    meaningIncorrect: 0,
    readingCorrect: 0,
    readingIncorrect: 0,
  });

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setPhase("loading");

      // First, try to get recommendations
      const recResponse = await contentAPI.getRecommendations();
      console.log("First recommendations response:", recResponse);
      let lessonsList = (recResponse.data.recommendations || []).map(
        (kanji) => ({
          id: kanji.id,
          type: "kanji",
          data: kanji,
        })
      );

      // If no recommendations, generate content and fetch again
      if (!lessonsList || lessonsList.length === 0) {
        console.log("No lessons found, generating content...");
        await contentAPI.generateContent(5);
        console.log("Content generated, fetching recommendations again...");
        const newRec = await contentAPI.getRecommendations();
        lessonsList = (newRec.data.recommendations || []).map((kanji) => ({
          id: kanji.id,
          type: "kanji",
          data: kanji,
        }));
      }

      setLessons(lessonsList);

      // Set the first lesson and phase
      if (lessonsList.length > 0) {
        setCurrentLesson(lessonsList[0]);
        setPhase("intro");
      } else {
        setPhase("complete");
      }
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
      setPhase("complete");
    }
  };

  const handleNext = () => {
    // Reset states for next question
    setUserAnswer("");
    setShowAnswer(false);
    setIsCorrect(null);
    setShowHint(false);

    if (phase === "intro") {
      // Move from intro to meaning quiz
      setPhase("quiz-meaning");
    } else if (phase === "quiz-meaning" && showAnswer) {
      // After meaning quiz, go to reading quiz (for kanji only)
      if (currentLesson.type === "kanji") {
        setPhase("quiz-reading");
      } else {
        // For radicals, skip reading and go to next lesson
        moveToNextLesson();
      }
    } else if (phase === "quiz-reading" && showAnswer) {
      // After reading quiz, go to next lesson
      moveToNextLesson();
    }
  };

  const moveToNextLesson = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < lessons.length) {
      setCurrentIndex(nextIndex);
      setCurrentLesson(lessons[nextIndex]);
      setPhase("intro");
    } else {
      setPhase("complete");
    }
  };

  const generateNewMnemonic = async (type = "meaning") => {
    if (!currentLesson || isGeneratingMnemonic) return;

    setIsGeneratingMnemonic(true);
    try {
      const response = await aiAPI.generateMnemonic(
        currentLesson.id,
        type,
        "visual"
      );

      setCurrentLesson((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [type === "meaning" ? "meaningMnemonic" : "readingMnemonic"]:
            response.data.mnemonic,
        },
      }));
    } catch (error) {
      console.error("Failed to generate mnemonic:", error);
    } finally {
      setIsGeneratingMnemonic(false);
    }
  };

  const updateUser = useStore((state) => state.updateUser);

  const handleSubmitAnswer = async () => {
    const correct = checkAnswer();
    setIsCorrect(correct);
    setShowAnswer(true);

    const questionType = phase === "quiz-meaning" ? "meaning" : "reading";

    // Update detailed stats
    setSessionStats((prev) => ({
      ...prev,
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
      total: prev.total + 1,
      ...(questionType === "meaning"
        ? {
            meaningCorrect: prev.meaningCorrect + (correct ? 1 : 0),
            meaningIncorrect: prev.meaningIncorrect + (correct ? 0 : 1),
          }
        : {
            readingCorrect: prev.readingCorrect + (correct ? 1 : 0),
            readingIncorrect: prev.readingIncorrect + (correct ? 0 : 1),
          }),
    }));

    // Submit to backend
    try {
      const response = await progressAPI.submitAnswer({
        itemType: currentLesson.type,
        itemId: currentLesson.id,
        answerType: questionType,
        answer: userAnswer,
        isCorrect: correct,
      });

      // Update user data in store
      if (response.data.user) {
        updateUser(response.data.user);
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const checkAnswer = () => {
    if (!currentLesson || !userAnswer) return false;

    const userAnswerLower = userAnswer.toLowerCase().trim();

    if (phase === "quiz-meaning") {
      // Check meaning (English)
      const correctAnswers = [
        currentLesson.data.meaning?.toLowerCase(),
        currentLesson.data.name?.toLowerCase(),
        ...(currentLesson.data.alternativeMeanings?.map((m) =>
          m.toLowerCase()
        ) || []),
      ].filter(Boolean);

      return correctAnswers.some((answer) => answer === userAnswerLower);
    } else if (phase === "quiz-reading") {
      // Check reading (hiragana)
      const correctReadings = [
        ...(currentLesson.data.onyomi?.map(cleanReading) || []),
        ...(currentLesson.data.kunyomi?.map(cleanReading) || []),
        currentLesson.data.reading,
      ]
        .filter(Boolean)
        .map((r) => r.toLowerCase());

      return correctReadings.some((reading) => reading === userAnswerLower);
    }
    return false;
  };

  const getCorrectAnswer = () => {
    if (!currentLesson) return "";

    if (phase === "quiz-meaning") {
      return currentLesson.data.meaning || currentLesson.data.name;
    } else if (phase === "quiz-reading") {
      // Prefer onyomi, then kunyomi, then any reading
      return cleanReading(
        currentLesson.data.onyomi?.[0] ||
          currentLesson.data.kunyomi?.[0] ||
          currentLesson.data.reading ||
          ""
      );
    }
    return "";
  };

  // Calculate progress based on total questions (2 per kanji for meaning+reading)
  const totalQuestions = lessons.reduce(
    (acc, lesson) => acc + (lesson.type === "kanji" ? 2 : 1),
    0
  );
  const questionsCompleted =
    currentIndex * 2 +
    (phase === "quiz-reading" || (phase === "quiz-meaning" && showAnswer)
      ? 1
      : 0) +
    (phase === "complete" ? (currentLesson?.type === "kanji" ? 2 : 1) : 0);
  const progress = (questionsCompleted / totalQuestions) * 100;

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            Generating your personalized lessons with AI...
          </p>
        </div>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Lesson Complete! 🎉</CardTitle>
            <CardDescription>Great job on today's lessons!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold mb-4">Session Stats</h2>

              {/* Overall Stats */}
              <div className="flex justify-center gap-8 mb-6">
                <div>
                  <div className="text-3xl font-bold text-green-500">
                    {sessionStats.correct}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-500">
                    {sessionStats.incorrect}
                  </div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-500">
                    {sessionStats.total > 0
                      ? Math.round(
                          (sessionStats.correct / sessionStats.total) * 100
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="text-sm font-medium mb-1">Meaning</div>
                  <div className="flex justify-center gap-4 text-sm">
                    <span className="text-green-600">
                      ✓ {sessionStats.meaningCorrect}
                    </span>
                    <span className="text-red-600">
                      ✗ {sessionStats.meaningIncorrect}
                    </span>
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <div className="text-sm font-medium mb-1">Reading</div>
                  <div className="flex justify-center gap-4 text-sm">
                    <span className="text-green-600">
                      ✓ {sessionStats.readingCorrect}
                    </span>
                    <span className="text-red-600">
                      ✗ {sessionStats.readingIncorrect}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => {
                  fetchLessons();
                  window.location.reload();
                }}
              >
                More Lessons
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isQuizPhase = phase === "quiz-meaning" || phase === "quiz-reading";
  const questionType = phase === "quiz-meaning" ? "meaning" : "reading";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Lesson Progress</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Kanji {currentIndex + 1} / {lessons.length}
              {isQuizPhase &&
                ` • ${questionType === "meaning" ? "Meaning" : "Reading"}`}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAiSensei(!showAiSensei)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Ask AI
            </Button>
          </div>
        </div>
        <Progress value={progress} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Lesson Card */}
        <div className={showAiSensei ? "lg:col-span-2" : "lg:col-span-3"}>
          <Card className="min-h-[400px]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="capitalize">
                  {currentLesson?.type} Lesson
                </CardTitle>
                {isQuizPhase && (
                  <Badge
                    variant={
                      questionType === "meaning" ? "default" : "secondary"
                    }
                  >
                    {questionType === "meaning"
                      ? "Meaning Question"
                      : "Reading Question"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {phase === "intro" && currentLesson && (
                <div className="space-y-6">
                  {/* Character Display */}
                  <div className="text-center">
                    <div className="text-8xl font-bold mb-4 kanji-display">
                      {currentLesson.data.character}
                    </div>

                    {/* Meaning */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg mb-2">Meaning</h3>
                      <p className="text-2xl">
                        {currentLesson.data.meaning || currentLesson.data.name}
                      </p>
                    </div>

                    {/* Readings (for kanji) */}
                    {currentLesson.type === "kanji" &&
                      currentLesson.data.onyomi && (
                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-4">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">
                              On'yomi
                            </h4>
                            <p className="text-lg">
                              {currentLesson.data.onyomi
                                .map(cleanReading)
                                .join(", ")}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground">
                              Kun'yomi
                            </h4>
                            <p className="text-lg">
                              {currentLesson.data.kunyomi
                                ?.map(cleanReading)
                                .join(", ") || "-"}
                            </p>
                          </div>
                        </div>
                      )}

                    {/* Mnemonic with AI Generation */}
                    {currentLesson.data.mnemonic ||
                    currentLesson.data.meaningMnemonic ? (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-left max-w-2xl mx-auto">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">Memory Tip</h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => generateNewMnemonic("meaning")}
                                disabled={isGeneratingMnemonic}
                              >
                                <RefreshCw
                                  className={`h-3 w-3 mr-1 ${
                                    isGeneratingMnemonic ? "animate-spin" : ""
                                  }`}
                                />
                                New
                              </Button>
                            </div>
                            <p className="text-sm">
                              {currentLesson.data.mnemonic ||
                                currentLesson.data.meaningMnemonic}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-2xl mx-auto">
                        <Button
                          onClick={() => generateNewMnemonic("meaning")}
                          disabled={isGeneratingMnemonic}
                          variant="outline"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          {isGeneratingMnemonic
                            ? "Generating..."
                            : "Generate AI Mnemonic"}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <Button onClick={handleNext} size="lg">
                      Got it! Test me
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {isQuizPhase && currentLesson && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-8xl font-bold mb-8 kanji-display">
                      {currentLesson.data.character}
                    </div>

                    <div className="max-w-md mx-auto space-y-4">
                      <div>
                        <label className="text-lg font-medium">
                          {questionType === "meaning"
                            ? `What does this ${currentLesson.type} mean?`
                            : `How do you read this ${currentLesson.type}?`}
                        </label>
                        <Input
                          type="text"
                          value={userAnswer}
                          onChange={(e) =>
                            setUserAnswer(
                              questionType === "reading"
                                ? convertRomajiToHiragana(e.target.value)
                                : e.target.value
                            )
                          }
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            !showAnswer &&
                            handleSubmitAnswer()
                          }
                          placeholder={
                            questionType === "meaning"
                              ? "Type the meaning..."
                              : "Type reading in hiragana..."
                          }
                          disabled={showAnswer}
                          className={cn(
                            "mt-3 text-center text-lg",
                            showAnswer && isCorrect && "border-green-500",
                            showAnswer && !isCorrect && "border-red-500"
                          )}
                        />
                      </div>

                      {/* Hint section */}
                      {!showAnswer && !showHint && (
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowHint(true)}
                          >
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Show Hint
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAiSensei(true)}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Ask AI
                          </Button>
                        </div>
                      )}

                      {/* Show hint */}
                      {showHint && !showAnswer && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm">
                          {questionType === "meaning"
                            ? currentLesson.data.meaningHint ||
                              currentLesson.data.mnemonic?.substring(0, 50) +
                                "..." ||
                              "Think about the components of this character"
                            : `First sound: ${getCorrectAnswer()[0]}...`}
                        </div>
                      )}

                      {/* Answer Feedback */}
                      {showAnswer && (
                        <div
                          className={cn(
                            "p-4 rounded-lg",
                            isCorrect
                              ? "bg-green-50 dark:bg-green-900/20"
                              : "bg-red-50 dark:bg-red-900/20"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            {isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold">
                                {isCorrect ? "Correct!" : "Not quite!"}
                              </p>
                              {!isCorrect && (
                                <p className="text-sm mt-1">
                                  The answer is:{" "}
                                  <strong>{getCorrectAnswer()}</strong>
                                </p>
                              )}
                              {/* Show all acceptable answers for reading */}
                              {!isCorrect && questionType === "reading" && (
                                <p className="text-xs mt-1 text-muted-foreground">
                                  Acceptable:{" "}
                                  {[
                                    ...(currentLesson.data.onyomi?.map(
                                      cleanReading
                                    ) || []),
                                    ...(currentLesson.data.kunyomi?.map(
                                      cleanReading
                                    ) || []),
                                  ].join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 justify-center">
                        {!showAnswer ? (
                          <Button
                            onClick={handleSubmitAnswer}
                            disabled={!userAnswer.trim()}
                          >
                            Submit Answer
                          </Button>
                        ) : (
                          <Button onClick={handleNext}>
                            {phase === "quiz-meaning" &&
                            currentLesson.type === "kanji"
                              ? "Next: Reading Question"
                              : currentIndex < lessons.length - 1
                              ? "Next Kanji"
                              : "Finish"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Sensei Sidebar */}
        {showAiSensei && (
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <AiSensei
                kanjiId={currentLesson?.id}
                context={{
                  phase,
                  lessonType: currentLesson?.type,
                  character: currentLesson?.data?.character,
                  meaning: currentLesson?.data?.meaning,
                  questionType,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lessons;
