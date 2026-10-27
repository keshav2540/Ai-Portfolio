import { useRef, useState } from "react";
import { matchJD } from "../../api";
import Gauge from "../Gauge/Gauge";
import "./Matcher.css";

const MAX_MB = 5;

const VERDICT = {
  fit: "Strong Fit",
  partial: "Partial Fit",
  not_fit: "Low Fit",
};

export default function Matcher({ sid, onSwitchToChat }) {
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
      return setErr(`File exceeds ${MAX_MB} MB limit.`);
    setErr("");
    setFile(f);
  }

  async function run() {
    setBusy(true);
    setErr("");
    setRes(null);
    try {
      const data = await matchJD(sid, { file, text: file ? "" : text });
      setRes(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  const ready = file || text.trim().length > 30;

  return (
    <div className="bento-matcher-card">
      <div className="matcher-card-header">
        <h2 className="matcher-card-title">Job Matcher</h2>
        <button className="toggle-chat-btn" onClick={onSwitchToChat}>
          Ask the resume
        </button>
      </div>

      <p className="matcher-subtext">
        Upload a Job Description or paste requirements to evaluate alignment against Keshav's verified resume.
      </p>

      {/* Dropzone */}
      <div
        className={`bento-dropzone ${drag ? "drag-over" : ""} ${file ? "has-file" : ""}`}
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
          type="file"
          accept=".pdf,.docx"
          hidden
          onChange={(e) => take(e.target.files[0])}
        />
        {file ? (
          <div className="bento-file-chip">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <polyline points="13 2 13 9 20 9" />
            </svg>
            <div>
              <span className="file-chip-title">{file.name}</span>
              <span className="file-chip-size">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
            <button className="file-chip-remove" onClick={() => setFile(null)}>
              ✕
            </button>
          </div>
        ) : (
          <div onClick={() => pick.current.click()}>
            <div className="drop-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="drop-main-text">Drop job description PDF or DOCX</p>
            <p className="drop-sub-text">
              or <span className="browse-inline">browse files</span> (up to {MAX_MB}MB)
            </p>
          </div>
        )}
      </div>

      {!file && (
        <div className="bento-paste-box">
          <div className="bento-divider">
            <span className="line" />
            <span className="text">OR PASTE TEXT</span>
            <span className="line" />
          </div>
          <textarea
            className="bento-textarea"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste role requirements here..."
          />
        </div>
      )}

      <button
        className="bento-run-btn"
        onClick={run}
        disabled={!ready || busy}
      >
        {busy ? "Analyzing Alignment…" : "Check Role Fit"}
      </button>

      {err && (
        <p style={{ color: "#f87171", fontSize: "0.85rem", marginTop: "10px" }}>
          ⚠️ {err}
        </p>
      )}

      {res && (
        <div className="bento-results-wrap">
          <div className="result-banner-row">
            <h3 className="result-verdict-text">{VERDICT[res.verdict] || res.verdict}</h3>
            <span className="result-score-badge">{res.score}%</span>
          </div>

          <Gauge score={res.score} />

          <div className="bento-reason-box">
            {res.reason}
          </div>

          <div className="bento-skills-cols">
            <div className="skills-card matched">
              <h4>Matched Skills ({res.matched.length})</h4>
              <div className="skills-pills">
                {res.matched.map((s, idx) => (
                  <span key={idx} className="pill-item good">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="skills-card missing">
              <h4>Missing Skills ({res.missing.length})</h4>
              <div className="skills-pills">
                {res.missing.length ? (
                  res.missing.map((s, idx) => (
                    <span key={idx} className="pill-item bad">
                      ✕ {s}
                    </span>
                  ))
                ) : (
                  <span style={{ color: "#34d399", fontSize: "0.78rem" }}>
                    ✓ All required skills met
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
