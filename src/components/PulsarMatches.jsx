export default function PulsarMatches({ candidate, pulsars }) {
  if (!candidate) {
    return <div className="pulsar-table"><p>No candidate loaded</p></div>;
  }

  if (!pulsars || pulsars.length === 0) {
    return <div className="pulsar-table"><p>No pulsar catalogue loaded</p></div>;
  }

  const f =
    candidate.f0_new && candidate.f0_new > 0
      ? candidate.f0_new
      : candidate.f0_old;

  if (!f) {
    return <div className="pulsar-table"><p>Invalid candidate frequency</p></div>;
  }

  const period = 1 / f;

  const rows = pulsars
    .map(p => ({
      ...p,
      ratioCP: period / p.period,
      ratioPC: p.period / period,
    }))
    .sort((a, b) => Math.abs(a.ratioCP - 1) - Math.abs(b.ratioCP - 1))
    .slice(0, 5);

  const isClose = val => val >= 0.9 && val <= 1.1;

  return (
    <div className="pulsar-table">
      <h3>Closest Known Pulsars</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>P (ms)</th>
            <th>DM (pc / cm³)</th>
            <th>C / P</th>
            <th>P / C</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(p => (
            <tr key={p.name}>
              <td>{p.name}</td>
              <td>{p.period.toFixed(6)}</td>
              <td>{p.dm.toFixed(2)}</td>
              <td style={isClose(p.ratioCP) ? { color: "#19b563", fontWeight: "bold" } : {}}>
                {p.ratioCP.toFixed(3)}
              </td>
              <td style={isClose(p.ratioPC) ? { color: "#19b563", fontWeight: "bold" } : {}}>
                {p.ratioPC.toFixed(3)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
