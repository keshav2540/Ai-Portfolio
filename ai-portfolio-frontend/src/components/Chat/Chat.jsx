import { useEffect, useRef, useState } from "react";
import { getHistory, streamChat } from "../../api";
import "./Chat.css";

const SUGGESTED_PROMPTS = [
  {
    icon: "⚡",
    label: "Key Skills",
    prompt: "What are Keshav's core technical skills and tools?",
  },
  {
    icon: "🛍️",
    label: "Attire Platform",
    prompt: "Tell me about the Attire e-commerce platform and its MCP server.",
  },
  {
    icon: "🤖",
    label: "GenAI & RAG",
    prompt: "Explain Keshav's GenAI RAG pipeline and vector search setup.",
  },
  {
    icon: "🎓",
    label: "Education & CGPA",
    prompt: "What is Keshav's education, college, and CGPA?",
  },
];

function renderInlineFormatting(str) {
  if (!str) return null;
  // Match bold **text** or inline `code`
  const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ color: "#ffffff", fontWeight: 600 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          style={{
            backgroundColor: "#222328",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "0.85em",
            color: "#f59e0b",
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function FormattedContent({ text }) {
  if (!text) return null;
  const lines = text.split("\n");

  return (
    <div className="assistant-body">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        const isBullet =
          trimmed.startsWith("- ") ||
          trimmed.startsWith("* ") ||
          trimmed.startsWith("• ");
        const content = isBullet ? trimmed.replace(/^[-*•]\s+/, "") : line;

        if (trimmed === "") {
          return <div key={idx} style={{ height: "4px" }} />;
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="assistant-subheadline">
              {renderInlineFormatting(trimmed.slice(4))}
            </h4>
          );
        }

        if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
          return (
            <h3 key={idx} className="assistant-headline">
              {renderInlineFormatting(trimmed.replace(/^#+\s*/, ""))}
            </h3>
          );
        }

        if (isBullet) {
          return (
            <div key={idx} className="fmt-bullet-line">
              <span className="fmt-bullet-dot">•</span>
              <span>{renderInlineFormatting(content)}</span>
            </div>
          );
        }

        return <div key={idx}>{renderInlineFormatting(line)}</div>;
      })}
    </div>
  );
}

export default function Chat({
  sid,
  onSend,
  onSwitchToMatch,
  onNewChat,
  activePrompt,
}) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const logRef = useRef(null);

  useEffect(() => {
    let active = true;
    getHistory(sid)
      .then((d) => {
        if (active) setMsgs(d.messages || []);
      })
      .catch(() => {
        if (active) setMsgs([]);
      });
    return () => {
      active = false;
    };
  }, [sid]);

  useEffect(() => {
    if (activePrompt) {
      send(activePrompt);
    }
  }, [activePrompt]);

  // Smooth internal scroll container strictly within the chat log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTo({
        top: logRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [msgs, busy]);

  async function send(text) {
    const message = text.trim();
    if (!message || busy) return;
    setInput("");
    onSend(message);
    setMsgs((m) => [
      ...m,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
    setBusy(true);

    try {
      await streamChat(sid, message, (tok) =>
        setMsgs((m) => {
          const copy = m.slice();
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + tok };
          return copy;
        })
      );
    } catch (e) {
      setMsgs((m) => [
        ...m.slice(0, -1),
        {
          role: "assistant",
          content: `${e.message}. Please check that the backend is running.`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function copyText(idx, text) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  function handleStartNewChat() {
    setMsgs([]);
    setInput("");
    if (onNewChat) onNewChat();
  }

  return (
    <div className="bento-chat-card">
      {/* Top Header Row - Pinned */}
      <div className="chat-card-header">
        <h2 className="chat-card-title">Ask the resume</h2>
        <div className="chat-header-actions">
          <button
            className="new-chat-btn"
            onClick={handleStartNewChat}
            title="Start a fresh conversation"
          >
            <span className="plus-icon">+</span> New Chat
          </button>
          <button
            className="toggle-match-btn"
            onClick={onSwitchToMatch}
          >
            Match Job
          </button>
        </div>
      </div>

      {/* Messages Scroll View with Sleek Scroller */}
      <div className="bento-chat-log" ref={logRef}>
        {/* Sleek Welcome Screen for New Chat */}
        {msgs.length === 0 && (
          <div className="welcome-container">
            <div className="welcome-badge">
              <span className="welcome-badge-dot" />
              <span>Keshav AI · Ready</span>
            </div>
            <h3 className="welcome-title">Ask me anything about Keshav</h3>
            <p className="welcome-sub">
              Grounded in Keshav&apos;s verified resume data — projects, skills, education, and architecture.
            </p>

            <div className="welcome-suggestions">
              {SUGGESTED_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  className="welcome-suggestion-btn"
                  onClick={() => send(item.prompt)}
                  disabled={busy}
                >
                  <span className="suggestion-icon">{item.icon}</span>
                  <span className="suggestion-text">{item.prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Conversation */}
        {msgs.map((m, i) => {
          if (m.role === "user") {
            return (
              <div key={i} className="bubble-user-wrap">
                <div className="bubble-user-pill">{m.content}</div>
              </div>
            );
          }

          return (
            <div key={i} className="bubble-assistant-card">
              <div className="assistant-header-row">
                <span className="tag-keshav-ai">KESHAV AI</span>
                {m.content && (
                  <button
                    className="copy-text-btn"
                    onClick={() => copyText(i, m.content)}
                    title="Copy message"
                  >
                    {copiedIdx === i ? "✓ Copied" : "Copy"}
                  </button>
                )}
              </div>
              {m.content ? (
                <FormattedContent text={m.content} />
              ) : (
                <div className="typing-row">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span>Reading resume knowledge…</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Composer Bar - Pinned */}
      <div className="bento-composer-wrap">
        <div className="bento-composer-pill">
          <input
            type="text"
            className="bento-composer-input"
            value={input}
            placeholder="Ask about skills, projects, education"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send(input);
              }
            }}
          />
          <button
            className="bento-send-circle-btn"
            onClick={() => send(input)}
            disabled={busy || !input.trim()}
            title="Send"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
