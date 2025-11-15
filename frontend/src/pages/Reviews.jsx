import { useState, useEffect } from "react";
import useStore from "../store/useStore";
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
import { cn } from "../lib/utils";
import {
  Brain,
  CheckCircle,
  XCircle,
  Lightbulb,
  ArrowRight,
  Clock,
  Zap,
  Sparkles,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import AiSensei from "../components/AiSensei";
import { aiAPI } from "../services/aiApi";
import { convertRomajiToHiragana } from "../utils/romajiConverter";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [currentReview, setCurrentReview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState("loading"); // loading, review, complete
  const [questionType, setQuestionType] = useState("meaning"); // meaning or reading
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showAiSensei, setShowAiSensei] = useState(false);
  const [aiHint, setAiHint] = useState("");
  const [gettingAiHint, setGettingAiHint] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
    startTime: Date.now(),
  });

  useEffect(() => {
    fetchReviews();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReviews = async () => {
    try {
      setPhase("loading");
      const response = await progressAPI.getReviews();
      if (response.data.reviews.length > 0) {
        setReviews(response.data.reviews);
        setCurrentReview(response.data.reviews[0]);
        setQuestionType(getRandomQuestionType(response.data.reviews[0]));
        setPhase("review");
      } else {
        setPhase("complete");
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setPhase("complete");
    }
  };

  const getRandomQuestionType = (review) => {
    // For radicals, only ask meaning
    if (review.type === "radical") return "meaning";
    // For kanji and vocabulary, randomly choose
    return Math.random() > 0.5 ? "meaning" : "reading";
  };

  const getSRSLevelName = (level) => {
    const names = [
      "Lesson",
      "Apprentice I",
      "Apprentice II",
      "Apprentice III",
      "Apprentice IV",
      "Guru I",
      "Guru II",
      "Master",
      "Enlightened",
      "Burned",
    ];
    return names[level] || "Unknown";
  };

  const getSRSLevelColor = (level) => {
    if (level <= 4) return "text-pink-500"; // Apprentice
    if (level <= 6) return "text-purple-500"; // Guru
    if (level === 7) return "text-blue-500"; // Master
    if (level === 8) return "text-cyan-500"; // Enlightened
    return "text-amber-500"; // Burned
  };

  const updateUser = useStore((state) => state.updateUser);

  const handleSubmitAnswer = async () => {
    const correct = checkAnswer();
    setIsCorrect(correct);
    setShowAnswer(true);

    // Update stats
    setSessionStats((prev) => ({
      ...prev,
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
      total: prev.total + 1,
    }));

    // Submit to backend
    try {
      const response = await progressAPI.submitAnswer({
        itemType: currentReview.type,
        itemId: currentReview.id,
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
    if (!currentReview || !userAnswer) return false;

    const userAnswerLower = userAnswer.toLowerCase().trim();

    if (questionType === "meaning") {
      const correctAnswers = [
        currentReview.data.meaning?.toLowerCase(),
        currentReview.data.name?.toLowerCase(),
        ...(currentReview.data.alternativeMeanings?.map((m) =>
          m.toLowerCase()
        ) || []),
      ].filter(Boolean);

      return correctAnswers.some((answer) => answer === userAnswerLower);
    } else {
      // Check reading
      const correctReadings = [
        ...(currentReview.data.onyomi || []),
        ...(currentReview.data.kunyomi || []),
        currentReview.data.reading,
      ]
        .filter(Boolean)
        .map((r) => r.toLowerCase());

      return correctReadings.some((reading) => reading === userAnswerLower);
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < reviews.length) {
      setCurrentIndex(nextIndex);
      setCurrentReview(reviews[nextIndex]);
      setQuestionType(getRandomQuestionType(reviews[nextIndex]));
      setUserAnswer("");
      setShowAnswer(false);
      setIsCorrect(null);
      setShowHint(false);
    } else {
      setPhase("complete");
    }
  };

  const progress = ((currentIndex + 1) / reviews.length) * 100;

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (phase === "complete") {
    const sessionTime = Math.floor(
      (Date.now() - sessionStats.startTime) / 1000
    );
    const minutes = Math.floor(sessionTime / 60);
    const seconds = sessionTime % 60;

    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Reviews Complete! 🎉</CardTitle>
            <CardDescription>Excellent work on your reviews!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold mb-2">Session Complete</h2>

              <div className="grid grid-cols-2 gap-4 mt-6 max-w-md mx-auto">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-green-500">
                    {sessionStats.correct}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-red-500">
                    {sessionStats.incorrect}
                  </div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
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
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-purple-500">
                    {minutes}:{seconds.toString().padStart(2, "0")}
                  </div>
                  <div className="text-sm text-muted-foreground">Time</div>
                </div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => {
                  fetchReviews();
                  // Optionally refresh the page to update counts
                  window.location.reload();
                }}
              >
                More Reviews
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

  const getAiHint = async () => {
    if (!currentReview || gettingAiHint) return;

    setGettingAiHint(true);
    try {
      const message =
        questionType === "meaning"
          ? `Give me a quick hint to remember the meaning of ${currentReview.data.character}`
          : `Give me a quick hint to remember how to read ${currentReview.data.character}`;

      const response = await aiAPI.chat(message, currentReview.id);
      setAiHint(response.data.response);
      setShowHint(true);
    } catch (error) {
      console.error("Failed to get AI hint:", error);
    } finally {
      setGettingAiHint(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm font-medium">
            Review Progress
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">
              {currentIndex + 1} / {reviews.length}
            </span>

            {/* Hide AI button on mobile, show as floating button instead */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAiSensei(!showAiSensei)}
              className="hidden sm:flex"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Ask AI
            </Button>
          </div>
        </div>
        <Progress value={progress} />
      </div>

      {/* Mobile Floating AI Button */}
      {!showAiSensei && (
        <Button
          size="sm"
          onClick={() => setShowAiSensei(true)}
          className="sm:hidden fixed bottom-4 right-4 z-40 rounded-full h-12 w-12 shadow-lg"
        >
          <Sparkles className="h-5 w-5" />
        </Button>
      )}

      {/* Mobile AI Modal */}
      {showAiSensei && (
        <div className="sm:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white dark:bg-gray-800 w-full h-3/4 rounded-t-xl animate-slide-up">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Ai-Sensei</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAiSensei(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 h-[calc(100%-60px)]">
              <AiSensei
                kanjiId={currentReview?.id}
                context={{
                  reviewType: currentReview?.type,
                  character: currentReview?.data?.character,
                  questionType,
                  srsLevel: currentReview?.srsLevel,
                }}
                compact={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="hidden sm:grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Review Card */}
        <div className={showAiSensei ? "lg:col-span-2" : "lg:col-span-3"}>
          <Card className="min-h-[400px]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CardTitle className="capitalize">
                    {currentReview?.type} Review
                  </CardTitle>
                  <Badge className={getSRSLevelColor(currentReview?.srsLevel)}>
                    {getSRSLevelName(currentReview?.srsLevel)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  {sessionStats.correct}/{sessionStats.total}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {currentReview && (
                <div className="space-y-6">
                  {/* Character/Word Display */}
                  <div className="text-center">
                    <div className="text-8xl font-bold mb-8 kanji-display">
                      {currentReview.data.character || currentReview.data.word}
                    </div>

                    {/* Question */}
                    <div className="max-w-md mx-auto space-y-4">
                      <div>
                        <label className="text-lg font-medium">
                          {questionType === "meaning"
                            ? `What does this ${currentReview.type} mean?`
                            : `How do you read this ${currentReview.type}?`}
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
                              ? "Type meaning..."
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

                      {/* Enhanced Hint Section */}
                      {!showAnswer && (
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowHint(true)}
                            disabled={showHint}
                          >
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Show Hint
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={getAiHint}
                            disabled={gettingAiHint || showHint}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            {gettingAiHint ? "Thinking..." : "AI Hint"}
                          </Button>
                        </div>
                      )}

                      {showHint && !showAnswer && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm">
                          {aiHint ||
                            (questionType === "meaning"
                              ? currentReview.data.meaningHint ||
                                "No hint available"
                              : currentReview.data.readingHint ||
                                "No hint available")}
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
                                  <strong>
                                    {questionType === "meaning"
                                      ? currentReview.data.meaning ||
                                        currentReview.data.name
                                      : currentReview.data.reading ||
                                        currentReview.data.onyomi?.[0] ||
                                        currentReview.data.kunyomi?.[0]}
                                  </strong>
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
                            Continue
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
                kanjiId={currentReview?.id}
                context={{
                  reviewType: currentReview?.type,
                  character: currentReview?.data?.character,
                  questionType,
                  srsLevel: currentReview?.srsLevel,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="sm:hidden">
        <Card className="min-h-[500px]">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg capitalize">
                  {currentReview?.type}
                </CardTitle>
                <Badge
                  className={`text-xs ${getSRSLevelColor(
                    currentReview?.srsLevel
                  )}`}
                >
                  {getSRSLevelName(currentReview?.srsLevel)}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Zap className="h-3 w-3" />
                {sessionStats.correct}/{sessionStats.total}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentReview && (
              <div className="space-y-4">
                {/* Character Display - Smaller on mobile */}
                <div className="text-center">
                  <div className="text-6xl sm:text-8xl font-bold mb-6 kanji-display">
                    {currentReview.data.character || currentReview.data.word}
                  </div>

                  {/* Question */}
                  <div className="space-y-4">
                    <label className="text-base sm:text-lg font-medium block">
                      {questionType === "meaning"
                        ? `What does this mean?`
                        : `How do you read this?`}
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
                        e.key === "Enter" && !showAnswer && handleSubmitAnswer()
                      }
                      placeholder={
                        questionType === "meaning"
                          ? "Type meaning..."
                          : "Type reading..."
                      }
                      disabled={showAnswer}
                      className={cn(
                        "text-base sm:text-lg text-center",
                        showAnswer && isCorrect && "border-green-500",
                        showAnswer && !isCorrect && "border-red-500"
                      )}
                    />

                    {/* Hint Buttons */}
                    {!showAnswer && (
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowHint(true)}
                          disabled={showHint}
                        >
                          <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Hint
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={getAiHint}
                          disabled={gettingAiHint || showHint}
                        >
                          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {gettingAiHint ? "..." : "AI Hint"}
                        </Button>
                      </div>
                    )}

                    {/* Hint Display */}
                    {showHint && !showAnswer && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm">
                        {aiHint ||
                          (questionType === "meaning"
                            ? currentReview.data.meaningHint ||
                              "No hint available"
                            : currentReview.data.readingHint ||
                              "No hint available")}
                      </div>
                    )}

                    {/* Answer Feedback */}
                    {showAnswer && (
                      <div
                        className={cn(
                          "p-3 rounded-lg text-sm",
                          isCorrect
                            ? "bg-green-50 dark:bg-green-900/20"
                            : "bg-red-50 dark:bg-red-900/20"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {isCorrect ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold">
                              {isCorrect ? "Correct!" : "Not quite!"}
                            </p>
                            {!isCorrect && (
                              <p className="text-xs mt-1">
                                Answer:{" "}
                                <strong>
                                  {questionType === "meaning"
                                    ? currentReview.data.meaning ||
                                      currentReview.data.name
                                    : currentReview.data.reading ||
                                      currentReview.data.onyomi?.[0] ||
                                      currentReview.data.kunyomi?.[0]}
                                </strong>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-2">
                      {!showAnswer ? (
                        <Button
                          onClick={handleSubmitAnswer}
                          disabled={!userAnswer.trim()}
                          className="w-full"
                        >
                          Submit Answer
                        </Button>
                      ) : (
                        <Button onClick={handleNext} className="w-full">
                          Continue
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
    </div>
  );
};

export default Reviews;
