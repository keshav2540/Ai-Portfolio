import { useEffect, useRef, useState } from "react";
import { getHistory, streamChat, matchJD } from "./api";
import { loadChats, saveChats, makeChat } from "./chats";
import "./App.css";

const STARTERS = [
  "What projects has Keshav built?",
  "Which technologies does he know?",
  "Tell me about his education.",
];
const MAX_MB = 5;

function Chat({ sid, onSend }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    getHistory(sid)
      .then((d) => setMsgs(d.messages || []))
      .catch(() => {});
  }, [sid]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
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
        }),
      );
    } catch (e) {
      setMsgs((m) => [
        ...m.slice(0, -1),
        {
          role: "error",
          content: `${e.message}. Check that the backend is running, then send again.`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className='chat' aria-label='Chat about the resume'>
      <div className='log' aria-live='polite'>
        {msgs.length === 0 && (
          <div className='empty'>
            <p>
              Answers come only from Keshav's resume. If something isn't there,
              the bot says so.
            </p>
            <div className='chips'>
              {STARTERS.map((s) => (
                <button key={s} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.content || "Reading the resume…"}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className='composer'>
        <textarea
          rows={1}
          value={input}
          placeholder='Ask about skills, projects, experience'
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
        />
        <button
          className='primary'
          onClick={() => send(input)}
          disabled={busy || !input.trim()}
        >
          Send
        </button>
      </div>
    </section>
  );
}

function Gauge({ score }) {
  return (
    <div
      className='gauge'
      role='img'
      aria-label={`Match score ${score} percent`}
    >
      <div className='track'>
        <i className='z no' />
        <i className='z part' />
        <i className='z fit' />
        <span className='needle' style={{ left: `${score}%` }}>
          <b>{score}%</b>
        </span>
      </div>
      <div className='zlabels'>
        <span>Not fit · under 50</span>
        <span>Partial · 50–70</span>
        <span>Fit · 70+</span>
      </div>
    </div>
  );
}

const VERDICT = { fit: "Fit", partial: "Partial fit", not_fit: "Not fit" };

function Matcher({ sid }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState(null);
  const pick = useRef(null);

  function take(f) {
    if (!f) return;
    if (!/\.(pdf|docx)$/i.test(f.name))
      return setErr("Upload a PDF or Word (.docx) file.");
    if (f.size > MAX_MB * 1024 * 1024)
      return setErr(`File is over ${MAX_MB} MB.`);
    setErr("");
    setFile(f);
  }

  async function run() {
    setBusy(true);
    setErr("");
    setRes(null);
    try {
      setRes(await matchJD(sid, { file, text: file ? "" : text }));
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  const ready = file || text.trim().length > 30;

  return (
    <section className='matcher' aria-label='Match a job description'>
      <div
        className={`drop ${drag ? "over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          take(e.dataTransfer.files[0]);
        }}
      >
        <input
          ref={pick}
          type='file'
          accept='.pdf,.docx'
          hidden
          onChange={(e) => take(e.target.files[0])}
        />
        {file ?
          <p>
            <strong>{file.name}</strong>{" "}
            <button className='link' onClick={() => setFile(null)}>
              Remove
            </button>
          </p>
        : <p>
            Drop a job description here (PDF or DOCX, up to {MAX_MB} MB) or{" "}
            <button className='link' onClick={() => pick.current.click()}>
              choose a file
            </button>
          </p>
        }
      </div>

      {!file && (
        <>
          <p className='or'>or paste the text</p>
          <textarea
            className='jd'
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Paste the job description'
          />
        </>
      )}

      <button className='primary wide' onClick={run} disabled={!ready || busy}>
        {busy ? "Comparing…" : "Check match"}
      </button>
      {err && (
        <p className='err' role='alert'>
          {err}
        </p>
      )}

      {res && (
        <div className='result'>
          <div className='verdict'>
            <h2>{VERDICT[res.verdict] || res.verdict}</h2>
            <span className={`tag ${res.verdict}`}>{res.score}% match</span>
          </div>
          <Gauge score={res.score} />
          <p className='reason'>{res.reason}</p>
          <div className='cols'>
            <div>
              <h3>Matched</h3>
              <ul>
                {res.matched.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Missing</h3>
              <ul>
                {res.missing.length ?
                  res.missing.map((x) => <li key={x}>{x}</li>)
                : <li>Nothing required is missing</li>}
              </ul>
            </div>
          </div>
          {res.jd_preview && (
            <details>
              <summary>Text read from the job description</summary>
              <p className='preview'>{res.jd_preview}</p>
            </details>
          )}
        </div>
      )}
    </section>
  );
}

export default function App() {
  const [tab, setTab] = useState("chat");
  const [chats, setChats] = useState(loadChats);
  const [activeId, setActiveId] = useState(() => {
    const saved = localStorage.getItem("active_chat");
    return chats.some((c) => c.id === saved) ? saved : chats[0].id;
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("active_chat", activeId);
  }, [activeId]);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!e.target.closest(".hist")) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const active = chats.find((c) => c.id === activeId);
  const sorted = chats.slice().sort((a, b) => b.ts - a.ts);

  function update(next) {
    setChats(next);
    saveChats(next);
  }

  function startNew() {
    setTab("chat");
    setOpen(false);
    if (active.title === "New chat") return; // current chat is still empty
    const c = makeChat();
    update([c, ...chats]);
    setActiveId(c.id);
  }

  function pick(id) {
    setActiveId(id);
    setTab("chat");
    setOpen(false);
  }

  function touch(id, text) {
    update(
      chats.map((c) =>
        c.id === id ?
          {
            ...c,
            ts: Date.now(),
            title: c.title === "New chat" ? text.slice(0, 40) : c.title,
          }
        : c,
      ),
    );
  }

  return (
    <main className='shell'>
      <header>
        <div className='head-row'>
          <h1>Keshav</h1>
          <div className='head-actions'>
            <button className='primary small' onClick={startNew}>
              New chat
            </button>
            <div className='hist'>
              <button
                className='ghost'
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
              >
                Past chats ({chats.length})
              </button>
              {open && (
                <ul className='menu'>
                  {sorted.map((c) => (
                    <li key={c.id}>
                      <button
                        className={c.id === activeId ? "on" : ""}
                        onClick={() => pick(c.id)}
                      >
                        {c.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <p>
          B.Tech Computer Science, RTU Kota. Ask the resume directly, or check
          how it fits a role.
        </p>
      </header>
      <div className='tabs' role='tablist'>
        <button
          role='tab'
          aria-selected={tab === "chat"}
          onClick={() => setTab("chat")}
        >
          Ask the resume
        </button>
        <button
          role='tab'
          aria-selected={tab === "match"}
          onClick={() => setTab("match")}
        >
          Match a job
        </button>
      </div>
      <div hidden={tab !== "chat"}>
        <Chat
          key={activeId}
          sid={activeId}
          onSend={(t) => touch(activeId, t)}
        />
      </div>
      <div hidden={tab !== "match"}>
        <Matcher key={activeId} sid={activeId} />
      </div>
    </main>
  );
}
