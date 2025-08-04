import { useState } from "react";

export default function ChatDraft() {
  const [chatInput, setChatInput] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendDraft = async () => {
    if (!draft.trim()) return alert("Draft is empty!");
    setLoading(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft }),
      });
      if (!res.ok) throw new Error("Send failed");
      alert("Email sent!");
      setDraft("");
      setChatInput("");
    } catch (err) {
      alert("Failed to send email");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Chat to Draft Email</h2>

      <textarea
        className="w-full p-3 rounded border mb-3"
        rows={5}
        placeholder="Chat here to draft your email..."
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
      />

      <button
        onClick={() => setDraft(chatInput)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Generate Draft
      </button>

      {draft && (
        <>
          <h3 className="font-semibold mb-2">Draft Preview:</h3>
          <div className="bg-gray-100 p-4 rounded mb-4 whitespace-pre-wrap">{draft}</div>

          <button
            onClick={handleSendDraft}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Sending..." : "Send Email"}
          </button>
        </>
      )}
    </div>
  );
}
