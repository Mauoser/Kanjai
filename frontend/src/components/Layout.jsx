import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import useStore from "../store/useStore";
import { progressAPI } from "../services/api";
import {
  Home,
  BookOpen,
  Brain,
  User,
  LogOut,
  Sparkles,
  BarChart,
  Menu,
  X,
} from "lucide-react";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useStore();
  const [reviewCount, setReviewCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchReviewCount();
    }
  }, [isAuthenticated, user]);

  const fetchReviewCount = async () => {
    try {
      const response = await progressAPI.getReviews();
      setReviewCount(response.data.count || response.data.reviews?.length || 0);
    } catch (error) {
      console.error("Failed to fetch review count:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                KanjAI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm">
                      <Home className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/lessons">
                    <Button variant="ghost" size="sm">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Lessons
                    </Button>
                  </Link>
                  <Link to="/reviews">
                    <Button variant="ghost" size="sm">
                      <Brain className="h-4 w-4 mr-2" />
                      Reviews {reviewCount > 0 && `(${reviewCount})`}
                    </Button>
                  </Link>
                  <Link to="/kanji">
                    <Button variant="ghost" size="sm">
                      <BarChart className="h-4 w-4 mr-2" />
                      Kanji
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      {user?.username}
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/kanji">
                    <Button variant="ghost" size="sm">
                      Browse Kanji
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="ghost" className="w-full justify-start">
                      <Home className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/lessons" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Lessons
                    </Button>
                  </Link>
                  <Link to="/reviews" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Brain className="h-4 w-4 mr-2" />
                      Reviews
                    </Button>
                  </Link>
                  <Link to="/kanji" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <BarChart className="h-4 w-4 mr-2" />
                      Kanji
                    </Button>
                  </Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start mt-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/kanji" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Browse Kanji
                    </Button>
                  </Link>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-start">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-8">{children}</main>

      {/* Footer - Hide on mobile for more space */}
      <footer className="hidden sm:block mt-auto bg-white dark:bg-gray-800 border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            © 2024 KanjAI - Learn Japanese with AI-powered mnemonics
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
