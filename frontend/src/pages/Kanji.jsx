import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { kanjiAPI } from "../services/api";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";

const Kanji = () => {
  const [kanji, setKanji] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedJLPT, setSelectedJLPT] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 24,
    totalPages: 1,
  });

  useEffect(() => {
    fetchKanji();
  }, [pagination.page, selectedLevel, selectedJLPT]);

  const fetchKanji = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (search) params.search = search;
      if (selectedLevel) params.level = selectedLevel;
      if (selectedJLPT) params.jlptLevel = selectedJLPT;

      const response = await kanjiAPI.getKanji(params);
      setKanji(response.data.kanji);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch kanji:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchKanji();
  };

  const getSRSColor = (srsLevel) => {
    if (!srsLevel) return "";
    if (srsLevel <= 4) return "border-pink-500";
    if (srsLevel <= 6) return "border-purple-500";
    if (srsLevel === 7) return "border-blue-500";
    if (srsLevel === 8) return "border-cyan-500";
    return "border-amber-500";
  };

  if (loading && kanji.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Kanji Browser</h1>
        <p className="text-muted-foreground">
          Browse and study all kanji in the system
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search kanji or meaning..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button type="submit">Search</Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Level:</span>
                {[1, 2, 3, 4, 5].map((level) => (
                  <Button
                    key={level}
                    size="sm"
                    variant={selectedLevel === level ? "default" : "outline"}
                    onClick={() => {
                      setSelectedLevel(selectedLevel === level ? null : level);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                  >
                    {level}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">JLPT:</span>
                {[5, 4, 3, 2, 1].map((jlpt) => (
                  <Button
                    key={jlpt}
                    size="sm"
                    variant={selectedJLPT === jlpt ? "default" : "outline"}
                    onClick={() => {
                      setSelectedJLPT(selectedJLPT === jlpt ? null : jlpt);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                  >
                    N{jlpt}
                  </Button>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Kanji Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {kanji.map((k) => (
          <Link key={k.id} to={`/kanji/${k.id}`}>
            <Card
              className={cn(
                "hover:shadow-lg transition-all cursor-pointer border-2",
                getSRSColor(k.userProgress?.srsLevel)
              )}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2 kanji-display">
                    {k.character}
                  </div>
                  <p className="text-sm font-medium truncate">{k.meaning}</p>
                  <p className="text-xs text-muted-foreground">
                    {k.onyomi?.[0] || k.kunyomi?.[0] || "-"}
                  </p>
                  <div className="mt-2 flex justify-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      Lv.{k.level}
                    </Badge>
                    {k.jlptLevel && (
                      <Badge variant="outline" className="text-xs">
                        N{k.jlptLevel}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
            }
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            disabled={pagination.page === pagination.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Kanji;
