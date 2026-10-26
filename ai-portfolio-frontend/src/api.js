// Backend contract (build the Python side to match):
//  POST /api/chat     {session_id, message}            -> {reply}
//  GET  /api/history?session_id=...                    -> {messages:[{role,content}]}
//  POST /api/match    multipart: session_id, file?, jd_text?
//                     -> {score, verdict:"fit"|"partial"|"not_fit",
//                         matched:[], missing:[], reason, jd_preview}
const BASE = import.meta.env.VITE_API_URL || "";

export function getSessionId() {
  let id = localStorage.getItem("session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("session_id", id);
  }
  return id;
}

async function handle(res) {
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json()).detail;
    } catch {}
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export const getHistory = (sid) =>
  fetch(`${BASE}/api/history?session_id=${sid}`).then(handle);

export const sendChat = (sid, message) =>
  fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sid, message }),
  }).then(handle);

export const matchJD = (sid, { file, text }) => {
  const fd = new FormData();
  fd.append("session_id", sid);
  if (file) fd.append("file", file);
  if (text) fd.append("jd_text", text);
  return fetch(`${BASE}/api/match`, { method: "POST", body: fd }).then(handle);
};
export async function streamChat(sid, message, onToken) {
  const res = await fetch(`${BASE}/api/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sid, message }),
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json()).detail;
    } catch {}
    throw new Error(detail || `Request failed (${res.status})`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onToken(decoder.decode(value, { stream: true }));
  }
}