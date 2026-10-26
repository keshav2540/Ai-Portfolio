// Past chats live in this browser's localStorage. Each chat id is also the
// session_id the backend uses, so its messages are loaded from MongoDB.
const KEY = "chats";

export function makeChat() {
  return { id: crypto.randomUUID(), title: "New chat", ts: Date.now() };
}

export function saveChats(chats) {
  localStorage.setItem(KEY, JSON.stringify(chats));
}

export function loadChats() {
  try {
    const c = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(c) && c.length) return c;
  } catch {}
  // First run after this update: keep the chat that already exists
  const old = localStorage.getItem("session_id");
  const first =
    old ? { id: old, title: "Earlier chat", ts: Date.now() } : makeChat();
  saveChats([first]);
  return [first];
}
