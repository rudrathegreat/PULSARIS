export default function ClassificationPanel({
  candidate,
  setCandidates,
  index,
  onClassify,
}) {
  if (!candidate) return null;

  const setClass = label => {
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

  const isActive = label => candidate.classification === label;

  return (
    <div>
      <h3 className="section-title">Classifications</h3>

      <div className="classification-panel">
        <button
          className={`btn-known ${isActive("Known Pulsar") ? "active" : ""}`}
          onClick={() => setClass("Known Pulsar")}
        >
          Known Pulsar (P)
        </button>

        <button
          className={`btn-tier1 ${isActive("Tier 1") ? "active" : ""}`}
          onClick={() => setClass("Tier 1")}
        >
          Tier 1 Candidate (1)
        </button>

        <button
          className={`btn-tier2 ${isActive("Tier 2") ? "active" : ""}`}
          onClick={() => setClass("Tier 2")}
        >
          Tier 2 Candidate (2)
        </button>

        <button
          className={`btn-noise ${isActive("Noise") ? "active" : ""}`}
          onClick={() => setClass("Noise")}
        >
          Noise (N)
        </button>

        <button
          className={`btn-rfi ${isActive("RFI") ? "active" : ""}`}
          onClick={() => setClass("RFI")}
        >
          RFI (R)
        </button>
      </div>

      {candidate.classification && (
        <p style={{ marginTop: "8px", fontSize: "14px" }}>
          Current classification:{" "}
          <strong>{candidate.classification}</strong>
        </p>
      )}
    </div>
  );
}
