export default function ClassificationPanel({
  candidate,
  setCandidates,
  index,
  onClassify,
}) {
  const setClass = label => {
    if (!candidate) return;
    setCandidates(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        candidate: {
          ...updated[index].candidate,
          classification: label,
        },
      };
      return updated;
    });
    if (onClassify) onClassify(label);
  };

  const isActive = label => candidate?.classification === label;
  const disabled = !candidate;

  return (
    <div>
      <h3 className="section-title">Classifications</h3>

      <div className="classification-panel">
        <button
          className={`btn-known ${isActive("Known Pulsar") ? "active" : ""}`}
          onClick={() => setClass("Known Pulsar")}
          disabled={disabled}
          style={disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}}
        >
          <span className="btn-text">Known Pulsar (P)</span>
          <div className="dark-mode-overlay" />
        </button>

        <button
          className={`btn-tier1 ${isActive("Tier 1") ? "active" : ""}`}
          onClick={() => setClass("Tier 1")}
          disabled={disabled}
          style={disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}}
        >
          <span className="btn-text">Tier 1 Candidate (1)</span>
          <div className="dark-mode-overlay" />
        </button>

        <button
          className={`btn-tier2 ${isActive("Tier 2") ? "active" : ""}`}
          onClick={() => setClass("Tier 2")}
          disabled={disabled}
          style={disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}}
        >
          <span className="btn-text">Tier 2 Candidate (2)</span>
          <div className="dark-mode-overlay" />
        </button>

        <button
          className={`btn-noise ${isActive("Noise") ? "active" : ""}`}
          onClick={() => setClass("Noise")}
          disabled={disabled}
          style={disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}}
        >
          <span className="btn-text">Noise (N)</span>
          <div className="dark-mode-overlay" />
        </button>

        <button
          className={`btn-rfi ${isActive("RFI") ? "active" : ""}`}
          onClick={() => setClass("RFI")}
          disabled={disabled}
          style={disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}}
        >
          <span className="btn-text">RFI (R)</span>
          <div className="dark-mode-overlay" />
        </button>
      </div>
    </div>
  );
}
