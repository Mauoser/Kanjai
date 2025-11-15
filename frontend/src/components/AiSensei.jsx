import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { aiAPI } from "../services/aiApi";
import { Sparkles, Send, Loader2 } from "lucide-react";

const AiSensei = ({ kanjiId = null, context = null, compact = false }) => {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: "Hello! I'm Ai-Sensei 🌸 How can I help you learn kanji today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await aiAPI.chat(userMessage, kanjiId, context);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: response.data.response,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Sorry, I couldn't process that. Let's try again! 🤔",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions =
    context?.phase === "quiz" || context?.reviewType
      ? [
          "Why did I get this wrong?",
          "Give me a memory trick",
          "Break down this kanji",
          "Similar kanji to watch for?",
        ]
      : [
          "How do I remember this?",
          "Give me a funny story",
          "What radicals are in this?",
          "Common mistakes?",
        ];

  return (
    <Card
      className={
        compact ? "h-[400px] flex flex-col" : "h-[500px] flex flex-col"
      }
    >
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <CardTitle className="text-lg">Ai-Sensei</CardTitle>
      </CardHeader>{" "}
      <CardContent className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick questions */}
        <div className="flex flex-wrap gap-2 mb-3">
          {quickQuestions.map((q, idx) => (
            <Button
              key={idx}
              size="sm"
              variant="outline"
              onClick={() => setInput(q)}
              className="text-xs"
            >
              {q}
            </Button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything about kanji..."
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AiSensei;
