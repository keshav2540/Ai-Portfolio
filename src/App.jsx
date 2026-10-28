import { useState } from "react";
import BentoProfile from "./components/BentoProfile/BentoProfile";
import Chat from "./components/Chat/Chat";
import Matcher from "./components/Matcher/Matcher";
import { getSessionId } from "./api";
import "./App.css";

export default function App() {
  const [tab, setTab] = useState("chat");
  const [sessionId, setSessionId] = useState(() => getSessionId());
  const [activePrompt, setActivePrompt] = useState(null);

  function handleSelectTopic(topicText) {
    setTab("chat");
    setActivePrompt(topicText);
  }

  function handleNewChat() {
    const newId = crypto.randomUUID();
    localStorage.setItem("session_id", newId);
    setSessionId(newId);
    setActivePrompt(null);
    setTab("chat");
  }

  return (
    <div className="bento-page-wrap">
      <main className="bento-app-container">
        {/* Left Column: Bento Profile Dashboard */}
        <BentoProfile onSelectTopic={handleSelectTopic} />

        {/* Right Column: Chat / Job Matcher */}
        <div className="bento-right-pane">
          {tab === "chat" ? (
            <Chat
              sid={sessionId}
              onSend={() => setActivePrompt(null)}
              onSwitchToMatch={() => setTab("match")}
              onNewChat={handleNewChat}
              activePrompt={activePrompt}
            />
          ) : (
            <Matcher
              sid={sessionId}
              onSwitchToChat={() => setTab("chat")}
            />
          )}
        </div>
      </main>
    </div>
  );
}
