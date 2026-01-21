import { getAngularSeparation, parseCoord } from "../utils/coords";

export default function PulsarMatches({ candidate, pulsars }) {
  if (!candidate || !pulsars) return null;

  const f = candidate.f0_new > 0 ? candidate.f0_new : candidate.f0_old;
  const period = f ? 1 / f : 0;
  const dm = candidate.dm_new ?? candidate.dm_old;

  const getV = (p) => {
    const k = Object.keys(candidate).find(k => k.toLowerCase().replace(/[^a-z]/g, '').includes(p));
    return k ? candidate[k] : undefined;
  };

  const raStr = getV('ra');
  const decStr = getV('dec');

  const hasCoords = raStr !== undefined && decStr !== undefined;
  const candRA = hasCoords ? parseCoord(raStr, true) : null;
  const candDec = hasCoords ? parseCoord(decStr, false) : null;

  const rows = pulsars
    .map(p => {
      const actualRatio = period / p.period;
      const ratios = [1, 0.5, 2, 0.33333, 3, 0.25, 4, 0.2, 5, 0.1, 10];
      let bestDiff = Infinity;
      let closest = actualRatio;
      ratios.forEach(r => {
        const d = Math.abs((actualRatio / r) - 1);
        if (d < bestDiff) {
          bestDiff = d;
          closest = actualRatio / r;
        }
      });

      const ratioDM = dm / p.dm;
      let dist = null;
      if (hasCoords && p.ra !== null && p.dec !== null) {
        dist = getAngularSeparation(candRA, candDec, p.ra, p.dec);
      }

      const score = Math.abs(ratioDM - 1) + bestDiff + (dist !== null ? dist / 10.0 : 0);
      return { ...p, ratioCP: actualRatio, ratioPC: 1 / actualRatio, ratioDM, score, dist, closest };
    })
    .filter(p => {
      const dmMatch = p.ratioDM >= 0.85 && p.ratioDM <= 1.15;
      const distMatch = p.dist === null || p.dist <= 10.0;
      return dmMatch && distMatch;
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  const isClose = (v) => Math.abs(v - 1) <= 0.05;

  return (
    <div className="pulsar-table">
      <h3>Known Pulsars</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>P (ms)</th>
            <th>DM</th>
            <th>C / P</th>
            <th>P / C</th>
            <th>Ratio DM</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p, idx) => (
            <tr key={p.name || idx}>
              <td>{p.name}</td>
              <td>{(p.period * 1000).toFixed(2)}</td>
              <td>{p.dm.toFixed(1)}</td>
              <td style={isClose(p.closest) ? { color: "#19b563", fontWeight: "bold" } : {}}>{p.ratioCP.toFixed(3)}</td>
              <td style={isClose(1 / p.closest) ? { color: "#19b563", fontWeight: "bold" } : {}}>{p.ratioPC.toFixed(3)}</td>
              <td style={isClose(p.ratioDM) ? { color: "#19b563", fontWeight: "bold" } : {}}>{p.ratioDM.toFixed(3)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>No matches found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
