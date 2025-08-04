import { useState, useEffect, useRef } from "react";
import styled from "styled-components";

const CHAT_KEY = "email-search-chat";

const getInitialMessages = () => {
  const saved = localStorage.getItem(CHAT_KEY);
  if (saved) return JSON.parse(saved);
  return [];
};

const Wrapper = styled.div`
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
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  max-width: 80%;
  color: white;
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

export default function EmailSearchChat() {
  const [messages, setMessages] = useState(getInitialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save messages to localStorage on every update
  const updateMessages = (newMessages) => {
    setMessages(newMessages);
    localStorage.setItem(CHAT_KEY, JSON.stringify(newMessages));
  };

  const askQuestion = async () => {
    if (!input.trim()) return;

    const updatedMessages = [...messages, { role: "user", content: input }];
    updateMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/gmail/email-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
      const data = await res.json();
      updateMessages([
        ...updatedMessages,
        { role: "assistant", content: data.answer || "No answer found." },
      ]);
    } catch {
      updateMessages([
        ...updatedMessages,
        { role: "assistant", content: "⚠️ Failed to get an answer." },
      ]);
    }
    setLoading(false);
  };

  return (
    <Wrapper>
      <ChatArea>
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} role={msg.role}>
            {msg.content}
          </MessageBubble>
        ))}
        <div ref={chatRef} />
      </ChatArea>

      <InputBar>
        <ChatInput
          placeholder="Ask about your emails..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && askQuestion()}
          disabled={loading}
        />
        <SendButton onClick={askQuestion} disabled={loading}>
          {loading ? "Searching..." : "Ask"}
        </SendButton>
      </InputBar>
    </Wrapper>
  );
}
