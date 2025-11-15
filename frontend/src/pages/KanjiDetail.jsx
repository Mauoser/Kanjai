import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { kanjiAPI } from "../services/api";
import { ArrowLeft, Volume2, BookOpen, Lightbulb } from "lucide-react";

const KanjiDetail = () => {
  const { id } = useParams();
  const [kanji, setKanji] = useState(null);
  const [radicals, setRadicals] = useState([]);
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKanjiDetail();
  }, [id]);

  const fetchKanjiDetail = async () => {
    try {
      setLoading(true);
      const response = await kanjiAPI.getKanjiById(id);
      setKanji(response.data.kanji);
      setRadicals(response.data.radicals);
      setVocabulary(response.data.vocabulary);
    } catch (error) {
      console.error("Failed to fetch kanji details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!kanji) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Kanji not found</h2>
        <Link to="/kanji">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Kanji List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link to="/kanji">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Kanji List
        </Button>
      </Link>

      {/* Main Kanji Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Kanji Details</CardTitle>
              <CardDescription>
                Level {kanji.level} • JLPT N{kanji.jlptLevel} •{" "}
                {kanji.strokeCount} strokes
              </CardDescription>
            </div>
            <Button size="sm" variant="ghost">
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Character */}
            <div className="text-center">
              <div className="text-9xl font-bold mb-4 kanji-display">
                {kanji.character}
              </div>
              <div className="space-y-2">
                <Badge variant="outline">Frequency #{kanji.frequency}</Badge>
                <Badge variant="outline">Grade {kanji.grade}</Badge>
              </div>
            </div>

            {/* Right Column - Information */}
            <div className="space-y-4">
              {/* Meaning */}
              <div>
                <h3 className="font-semibold mb-2">Meaning</h3>
                <p className="text-xl">{kanji.meaning}</p>
                {kanji.alternativeMeanings?.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Also: {kanji.alternativeMeanings.join(", ")}
                  </p>
                )}
              </div>

              {/* Readings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">On'yomi</h4>
                  <p className="text-lg">{kanji.onyomi?.join("、") || "-"}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Kun'yomi</h4>
                  <p className="text-lg">{kanji.kunyomi?.join("、") || "-"}</p>
                </div>
              </div>

              {/* Nanori */}
              {kanji.nanori?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Nanori</h4>
                  <p className="text-lg">{kanji.nanori.join("、")}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mnemonics */}
      {(kanji.meaningMnemonic || kanji.readingMnemonic) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Mnemonics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {kanji.meaningMnemonic && (
              <div>
                <h4 className="font-semibold mb-2">Meaning Mnemonic</h4>
                <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  {kanji.meaningMnemonic}
                </p>
                {kanji.meaningHint && (
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Quick hint: {kanji.meaningHint}
                  </p>
                )}
              </div>
            )}

            {kanji.readingMnemonic && (
              <div>
                <h4 className="font-semibold mb-2">Reading Mnemonic</h4>
                <p className="text-sm bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  {kanji.readingMnemonic}
                </p>
                {kanji.readingHint && (
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Quick hint: {kanji.readingHint}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Component Radicals */}
      {radicals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Component Radicals</CardTitle>
            <CardDescription>
              The building blocks that make up this kanji
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
              {radicals.map((radical) => (
                <div key={radical.id} className="text-center">
                  <div className="text-3xl font-bold mb-1 kanji-display">
                    {radical.character}
                  </div>
                  <p className="text-xs">{radical.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Example Vocabulary */}
      {vocabulary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Example Vocabulary</CardTitle>
            <CardDescription>Words that use this kanji</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {vocabulary.map((word) => (
                <div key={word.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xl font-bold kanji-display">
                      {word.word}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {word.wordType}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {word.reading}
                  </p>
                  <p className="text-sm font-medium">{word.meaning}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KanjiDetail;
