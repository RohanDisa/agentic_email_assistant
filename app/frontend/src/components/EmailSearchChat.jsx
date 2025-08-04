import { useState } from "react";

export default function EmailSearchChat() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      const res = await fetch("/api/email-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setAnswer(data.answer || "No answer found.");
    } catch {
      setAnswer("Failed to fetch answer.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Ask About Emails</h2>
      <input
        type="text"
        placeholder="Ask about your emails..."
        className="w-full p-3 border rounded mb-3"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && askQuestion()}
      />
      <button
        onClick={askQuestion}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Searching..." : "Ask"}
      </button>

      {answer && (
        <div className="mt-4 p-4 bg-gray-100 rounded whitespace-pre-wrap">{answer}</div>
      )}
    </div>
  );
}
