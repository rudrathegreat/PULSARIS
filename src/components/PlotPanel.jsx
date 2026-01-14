import Plot from "react-plotly.js";

export default function PlotPanel({ candidates, currentIndex }) {
  if (!candidates || candidates.length === 0) return null;

  // Extract values safely
  const periods = candidates.map(c => {
    const f =
      c.f0_new && c.f0_new > 0 ? c.f0_new : c.f0_old;
    return f ? 1.0 / f : null; // seconds
  });

  const dms = candidates.map(c =>
    c.dm_new ?? c.dm_old ?? null
  );

  const classifications = candidates.map(
    c => c.classification || "Unclassified"
  );

  const colourMap = {
    "Known Pulsar": "#7b5ce1",
    "Tier 1": "#38bdf8",
    "Tier 2": "#60d5d8",
    "Noise": "#fbbf24",
    "RFI": "#ef4444",
    "Unclassified": "#9ca3af",
  };

  const labels = [
    "Known Pulsar",
    "Tier 1",
    "Tier 2",
    "Noise",
    "RFI",
    "Unclassified",
  ];

  // Helper to get trace for a specific classification
  const getTraces = (xArr, yArr) => {
    return labels.map(label => {
      const xFiltered = [];
      const yFiltered = [];

      candidates.forEach((c, i) => {
        const cClass = c.classification || "Unclassified";
        if (cClass === label) {
          xFiltered.push(xArr[i]);
          yFiltered.push(yArr[i]);
        }
      });

      return {
        x: xFiltered,
        y: yFiltered,
        name: label,
        mode: "markers",
        type: "scatter",
        marker: {
          size: 8,
          color: colourMap[label],
        },
      };
    });
  };

  const sns = candidates.map(c => c["S/N_new"] ?? c["S/N"] ?? null);

  return (
    <div className="plot-panel">
      {/* Period vs DM */}
      <div className="plot-box">
        <Plot
          data={[
            ...getTraces(periods, dms),
            {
              x: [periods[currentIndex]],
              y: [dms[currentIndex]],
              name: "Current",
              mode: "markers",
              marker: {
                size: 14,
                color: "black",
                symbol: "circle-open",
                line: { width: 3 },
              },
              showlegend: false,
            },
          ]}
          layout={{
            title: "Period vs DM",
            xaxis: { title: "Period (s)", type: "log" },
            yaxis: { title: "DM (pc / cm³)" },
            margin: { l: 50, r: 20, t: 40, b: 45 },
            autosize: true,
            showlegend: true,
            legend: { x: 1, y: 1 },
          }}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%" }}
          config={{ displayModeBar: false }}
        />
      </div>

      {/* Period vs S/N */}
      <div className="plot-box">
        <Plot
          data={[
            ...getTraces(periods, sns),
            {
              x: [periods[currentIndex]],
              y: [sns[currentIndex]],
              name: "Current",
              mode: "markers",
              marker: {
                size: 14,
                color: "black",
                symbol: "circle-open",
                line: { width: 3 },
              },
              showlegend: false,
            },
          ]}
          layout={{
            title: "Period vs S/N",
            xaxis: { title: "Period (s)", type: "log" },
            yaxis: { title: "S/N" },
            margin: { l: 50, r: 20, t: 40, b: 45 },
            autosize: true,
            showlegend: true,
            legend: { x: 1, y: 1 },
          }}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%" }}
          config={{ displayModeBar: false }}
        />
      </div>
    </div>
  );
}
