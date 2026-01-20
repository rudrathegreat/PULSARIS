export default function PulsarMatches({ candidate, pulsars }) {
  if (!candidate) {
    return <div className="pulsar-table"><p>No candidate loaded</p></div>;
  }

  if (!pulsars || pulsars.length === 0) {
    return <div className="pulsar-table"><p>No pulsar catalogue loaded</p></div>;
  }

  const f = candidate.f0_new > 0 ? candidate.f0_new : candidate.f0_old;
  if (!f) {
    return <div className="pulsar-table"><p>Invalid candidate frequency</p></div>;
  }

  const period = 1 / f;
  const dm = candidate.dm_new ?? candidate.dm_old;

  const rows = pulsars
    .map(p => {
      // Harmonic matching: check ratios 1, 0.5, 2, 0.33, 3, 0.25, 4
      const ratios = [1, 0.5, 2, 0.33333, 3, 0.25, 4];
      const actualRatio = period / p.period;

      // Find the closest harmonic ratio
      let bestHarmonicDiff = Infinity;
      let closestRatio = actualRatio;

      ratios.forEach(r => {
        const diff = Math.abs((actualRatio / r) - 1);
        if (diff < bestHarmonicDiff) {
          bestHarmonicDiff = diff;
          closestRatio = actualRatio / r;
        }
      });

      const ratioDM = dm / p.dm;

      // Collective score: proximity to DM match AND proximity to closest harmonic
      // Score = DM deviation + Harmonic deviation
      const score = Math.abs(ratioDM - 1) + bestHarmonicDiff;

      return {
        ...p,
        ratioCP: actualRatio,
        ratioPC: 1 / actualRatio,
        ratioDM,
        score,
        closestHarmonicRatio: closestRatio
      };
    })
    .filter(p => p.ratioDM >= 0.85 && p.ratioDM <= 1.15) // Slightly wider 15% DM filter as safety
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  const isClose = (val, target = 1, tol = 0.05) => Math.abs(val - target) <= tol;

  return (
    <div className="pulsar-table">
      <h3>Known Pulsars</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>P (ms)</th>
            <th>DM (pc / cm³)</th>
            <th>C / P</th>
            <th>P / C</th>
            <th>Ratio DM</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map(p => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td>{(p.period * 1000).toFixed(2)}</td>
                <td>{p.dm.toFixed(1)}</td>
                <td style={isClose(p.closestHarmonicRatio) ? { color: "#19b563", fontWeight: "bold" } : {}}>
                  {p.ratioCP.toFixed(3)}
                </td>
                <td style={isClose(1 / p.closestHarmonicRatio) ? { color: "#19b563", fontWeight: "bold" } : {}}>
                  {p.ratioPC.toFixed(3)}
                </td>
                <td style={isClose(p.ratioDM) ? { color: "#19b563", fontWeight: "bold" } : {}}>
                  {p.ratioDM.toFixed(3)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                No matches found within DM tolerance.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
