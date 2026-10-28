import "./Gauge.css";

export default function Gauge({ score }) {
  const clampedScore = Math.max(0, Math.min(100, score || 0));
  let verdictClass = "no";
  if (clampedScore >= 70) verdictClass = "fit";
  else if (clampedScore >= 50) verdictClass = "part";

  return (
    <div className="gauge-card" role="img" aria-label={`Match score ${score} percent`}>
      <div className="gauge-header">
        <span className="gauge-title">Role Fit Match Score</span>
        <span className={`gauge-pill ${verdictClass}`}>{clampedScore}%</span>
      </div>
      <div className="track-wrapper">
        <div className="track">
          <div className="zone zone-no" title="Under 50%: Not fit" />
          <div className="zone zone-part" title="50-70%: Partial fit" />
          <div className="zone zone-fit" title="70%+: Strong fit" />
          <span className="needle" style={{ left: `${clampedScore}%` }} aria-hidden="true">
            <span className="needle-dot" />
          </span>
        </div>
      </div>
      <div className="zlabels">
        <span className="lbl-no">Low Fit (&lt;50%)</span>
        <span className="lbl-part">Partial Match (50–70%)</span>
        <span className="lbl-fit">Strong Fit (70%+)</span>
      </div>
    </div>
  );
}

