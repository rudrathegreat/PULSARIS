export default function CandidateSummary({ candidate }) {
  if (!candidate) return null;

  // Helper to safely format numbers
  const fmt = (value, digits = 4) => {
    if (value === undefined || value === null || isNaN(value)) return "—";
    return Number(value).toFixed(digits);
  };

  // Period calculation (ms)
  // Prefer optimised frequency if available
  const freq =
    candidate.f0_new && candidate.f0_new > 0
      ? candidate.f0_new
      : candidate.f0_old;

  const period_ms = freq ? (1000.0 / freq) : null;

  // Filename only
  const filename = candidate.png_file
    ? candidate.png_file.split(/[/\\]/).pop()
    : "—";

  // Colour mapping
  const colourMap = {
    "Known Pulsar": "#7b5ce1",
    "Tier 1": "#38bdf8",
    "Tier 2": "#60d5d8",
    "Noise": "#fbbf24",
    "RFI": "#ef4444",
    "Unclassified": "#9ca3af",
  };

  const tagStyle = {
    backgroundColor: colourMap[candidate.classification || "Unclassified"] || "#9ca3af"
  };

  return (
    <div className="candidate-summary">
      <h3 style={{ paddingLeft: "20px" }}>Candidate Summary</h3>
      <div className="cands-info">
        <div className="first-column">
          <p><b>PNG File: </b> {filename}</p>
          <p><b>Period (ms): </b> {fmt(period_ms, 3)}</p>
          <p><b>DM (pc / cm³): </b> {fmt(candidate.dm_new ?? candidate.dm_old, 2)}</p>
        </div>
        <div className="second-column">
          <p><b>S/N: </b> {fmt(candidate["S/N_new"] ?? candidate["S/N"], 2)}</p>
          <p><b>Acceleration: </b> {fmt(candidate.acc_new, 4)}</p>
          <p><b>Classification: </b></p>
          <p className="tag" style={tagStyle}>{candidate.classification || "Unclassified"}</p>
        </div>
      </div>
      {/* <table>
        <tbody>
          <tr>
            <td><strong>PNG File</strong></td>
            <td>{candidate.png_file || "—"}</td>
          </tr>

          <tr>
            <td><strong>Period (ms)</strong></td>
            <td>{fmt(period_ms, 3)}</td>
          </tr>

          <tr>
            <td><strong>DM (pc / cm³)</strong></td>
            <td>{fmt(candidate.dm_new ?? candidate.dm_old, 2)}</td>
          </tr>

          <tr>
            <td><strong>S/N</strong></td>
            <td>{fmt(candidate["S/N_new"] ?? candidate["S/N"], 2)}</td>
          </tr>

          <tr>
            <td><strong>Acceleration</strong></td>
            <td>{fmt(candidate.acc_new, 4)}</td>
          </tr>

          <tr>
            <td><strong>Classification</strong></td>
            <td>
              {candidate.classification
                ? candidate.classification
                : "Unclassified"}
            </td>
          </tr>
        </tbody>
      </table> */}
    </div>
  );
}
