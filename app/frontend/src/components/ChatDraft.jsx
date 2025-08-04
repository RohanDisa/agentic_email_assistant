import { useState, useEffect, useRef } from "react";
import styled from "styled-components";

const CHAT_KEY = "inbox-companion-chat";

const getInitialMessages = () => {
  const saved = localStorage.getItem(CHAT_KEY);
  if (saved) return JSON.parse(saved);
  return [
    {
      role: "system",
      content: "You're a helpful assistant who drafts emails.",
    },
  ];
};

const ChatWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 70vh;
`;

const ChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 1rem;
`;

const MessageBubble = styled.div`
  align-self: ${({ role }) => (role === "user" ? "flex-end" : "flex-start")};
  background-color: ${({ role }) =>
    role === "user" ? "rgba(96, 165, 250, 0.2)" : "rgba(168, 85, 247, 0.2)"};
  color: #e5e7eb;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  max-width: 80%;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const InputBar = styled.div`
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border-radius: 1rem;
  border: none;
  outline: none;
  background-color: rgba(255, 255, 255, 0.08);
  color: white;
`;

const SendButton = styled.button`
  background-color: #2563eb;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 1rem;
  border: none;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background-color: #1e40af;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SendDraftButton = styled.button`
  margin-top: 1rem;
  background-color: #059669;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #047857;
  }
`;

const ClearButton = styled.button`
  margin-top: 0.5rem;
  background-color: #ef4444;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 0.75rem;
  font-weight: 500;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #dc2626;
  }
`;

export default function ChatDraft() {
  const [messages, setMessages] = useState(getInitialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  // Auto scroll on new message
  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update localStorage whenever messages change
  const updateMessages = (newMessages) => {
    setMessages(newMessages);
    localStorage.setItem(CHAT_KEY, JSON.stringify(newMessages));
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const updatedMessages = [...messages, { role: "user", content: input }];
    updateMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/gmail/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();
      updateMessages([...updatedMessages, { role: "assistant", content: data.reply }]);
    } catch {
      updateMessages([...updatedMessages, { role: "assistant", content: "⚠️ Failed to get a reply." }]);
    }
    setLoading(false);
  };

  const handleSendDraft = async () => {
    const lastAssistant = messages.filter((m) => m.role === "assistant").pop();
    if (!lastAssistant) return alert("No draft to send.");

    setLoading(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: lastAssistant.content }),
      });

      if (!res.ok) throw new Error("Send failed");
      alert("Email sent!");
    } catch {
      alert("Failed to send email");
    }
    setLoading(false);
  };

  const clearChat = () => {
    const initial = [
      { role: "system", content: "You're a helpful assistant who drafts emails." },
    ];
    updateMessages(initial);
  };

  return (
    <ChatWrapper>
      <ChatArea>
        {messages
          .filter((m) => m.role !== "system")
          .map((msg, idx) => (
            <MessageBubble key={idx} role={msg.role}>
              {msg.content}
            </MessageBubble>
          ))}
        <div ref={chatRef} />
      </ChatArea>

      <InputBar>
        <ChatInput
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />
        <SendButton onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </SendButton>
      </InputBar>

      <SendDraftButton onClick={handleSendDraft} disabled={loading}>
        ✉️ Send Draft Email
      </SendDraftButton>

      <ClearButton onClick={clearChat} disabled={loading}>
        🗑️ Clear Chat
      </ClearButton>
    </ChatWrapper>
  );
}
