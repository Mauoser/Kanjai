import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { progressAPI } from "../services/api";
import useStore from "../store/useStore";
import {
  BookOpen,
  Brain,
  Flame,
  Trophy,
  TrendingUp,
  Clock,
  Target,
  Sparkles,
  Calendar,
  Award,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AiSensei from "../components/AiSensei";
import { aiAPI } from "../services/aiApi";

const Dashboard = () => {
  const user = useStore((state) => state.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);
  const [todayProgress, setTodayProgress] = useState({
    lessonsCompleted: 0,
    reviewsCompleted: 0,
    accuracy: 0,
  });

  // Add state for showing AI chat
  const [showAiSensei, setShowAiSensei] = useState(false);
  const [dailyTip, setDailyTip] = useState("");

  useEffect(() => {
    fetchStats();
    fetchReviewCount();
    fetchDailyTip();
    // Refresh stats when user data changes
  }, [user?.totalXP, user?.currentStreak]);

  const fetchDailyTip = async () => {
    try {
      const response = await aiAPI.getTip();
      setDailyTip(response.data.tip);
    } catch (error) {
      console.error("Failed to fetch tip:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await progressAPI.getStats();
      setStats(response.data);

      // Calculate today's progress (mock data for now)
      setTodayProgress({
        lessonsCompleted: Math.floor(Math.random() * 10),
        reviewsCompleted: Math.floor(Math.random() * 30),
        accuracy: 85 + Math.floor(Math.random() * 15),
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewCount = async () => {
    try {
      const response = await progressAPI.getReviews();
      setReviewCount(response.data.count || response.data.reviews?.length || 0);
    } catch (error) {
      console.error("Failed to fetch review count:", error);
      setReviewCount(0);
    }
  };

  // Calculate level progress
  const currentLevelXP = user?.totalXP % 1000;
  const levelProgress = (currentLevelXP / 1000) * 100;

  // Mock SRS distribution data
  const srsData = [
    {
      name: "Apprentice",
      value: stats?.progress?.kanji?.level1 || 0,
      color: "#ec4899",
    },
    {
      name: "Guru",
      value: stats?.progress?.kanji?.level5 || 0,
      color: "#a855f7",
    },
    {
      name: "Master",
      value: stats?.progress?.kanji?.level7 || 0,
      color: "#3b82f6",
    },
    {
      name: "Enlightened",
      value: stats?.progress?.kanji?.level8 || 0,
      color: "#06b6d4",
    },
    {
      name: "Burned",
      value: stats?.progress?.kanji?.level9 || 0,
      color: "#f59e0b",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-blue-100 mb-4">
          Ready to continue your kanji journey? You're on a roll!
        </p>
        <div className="flex gap-4">
          <Link to="/lessons">
            <Button size="lg" variant="secondary">
              <BookOpen className="mr-2 h-5 w-5" />
              Start Lessons
            </Button>
          </Link>
          <Link to="/reviews">
            <Button size="lg" variant="secondary">
              <Brain className="mr-2 h-5 w-5" />
              {reviewCount} Reviews {/* Use the actual count */}
            </Button>
          </Link>
        </div>
      </div>

      {/* Daily Tip Card */}
      {dailyTip && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Ai-Sensei's Daily Tip</p>
                <p className="text-sm text-muted-foreground mt-1">{dailyTip}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Level Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.level || 1}</div>
            <Progress value={levelProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {currentLevelXP}/1000 XP
            </p>
          </CardContent>
        </Card>

        {/* Ai-Sensei Chat Toggle */}
        <div className="fixed bottom-4 right-4 z-50">
          {!showAiSensei ? (
            <Button
              onClick={() => setShowAiSensei(true)}
              className="rounded-full h-14 w-14 shadow-lg"
            >
              <Sparkles className="h-6 w-6" />
            </Button>
          ) : (
            <div className="w-96">
              <AiSensei />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAiSensei(false)}
                className="mt-2"
              >
                Close
              </Button>
            </div>
          )}
        </div>

        {/* Streak Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.currentStreak || 0} days
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Best: {user?.longestStreak || 0} days
            </p>
          </CardContent>
        </Card>

        {/* Total XP Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Sparkles className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.totalXP || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Keep it up! 🚀</p>
          </CardContent>
        </Card>

        {/* Accuracy Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayProgress.accuracy}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Today's average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SRS Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>SRS Distribution</CardTitle>
            <CardDescription>Your kanji progress by level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height="200">
              <BarChart data={srsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Today's Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Progress</CardTitle>
            <CardDescription>Your learning activity today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Lessons Completed</span>
              </div>
              <span className="font-bold">
                {todayProgress.lessonsCompleted}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Reviews Completed</span>
              </div>
              <span className="font-bold">
                {todayProgress.reviewsCompleted}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-sm">Accuracy Rate</span>
              </div>
              <span className="font-bold">{todayProgress.accuracy}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump to any section</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/lessons">
              <Button variant="outline" className="w-full">
                <BookOpen className="mr-2 h-4 w-4" />
                New Lessons
              </Button>
            </Link>
            <Link to="/reviews">
              <Button variant="outline" className="w-full">
                <Brain className="mr-2 h-4 w-4" />
                Reviews
              </Button>
            </Link>
            <Link to="/kanji">
              <Button variant="outline" className="w-full">
                <Award className="mr-2 h-4 w-4" />
                Browse Kanji
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" className="w-full">
                <TrendingUp className="mr-2 h-4 w-4" />
                Statistics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
