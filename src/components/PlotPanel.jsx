import { useState } from "react";
import Plot from "react-plotly.js";

export default function PlotPanel({ candidates, currentIndex }) {
  const [plot1, setPlot1] = useState({ x: "period", y: "dm", xLog: true, yLog: false });
  const [plot2, setPlot2] = useState({ x: "period", y: "sn", xLog: true, yLog: false });

  if (!candidates || candidates.length === 0) return null;

  const fields = {
    period: {
      label: "Period (s)",
      getValue: c => {
        const f = c.f0_new && c.f0_new > 0 ? c.f0_new : c.f0_old;
        return f ? 1.0 / f : null;
      }
    },
    dm: {
      label: "DM (pc / cm³)",
      getValue: c => c.dm_new ?? c.dm_old ?? null
    },
    sn: {
      label: "S/N",
      getValue: c => c["S/N_new"] ?? c["S/N"] ?? null
    },
    accel: {
      label: "Accel (m/s²)",
      getValue: c => c.accel_new ?? c.accel_old ?? c.accel ?? null
    }
  };

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

  const getTraces = (conf) => {
    const xData = candidates.map(fields[conf.x].getValue);
    const yData = candidates.map(fields[conf.y].getValue);

    return labels.map(label => {
      const xFiltered = [];
      const yFiltered = [];

      candidates.forEach((c, i) => {
        const cClass = c.classification || "Unclassified";
        if (cClass === label) {
          xFiltered.push(xData[i]);
          yFiltered.push(yData[i]);
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

  const renderControls = (id, config, setConfig) => (
    <div className="plot-controls">
      <div className="control-row">
        <div className="control-group">
          <label>X:</label>
          <select value={config.x} onChange={e => setConfig({ ...config, x: e.target.value })}>
            {Object.entries(fields).map(([k, v]) => <option key={k} value={k}>{v.label.split(" (")[0]}</option>)}
          </select>
          <label className="checkbox-label">
            <input type="checkbox" checked={config.xLog} onChange={e => setConfig({ ...config, xLog: e.target.checked })} />
            Log
          </label>
        </div>
        <div className="control-group">
          <label>Y:</label>
          <select value={config.y} onChange={e => setConfig({ ...config, y: e.target.value })}>
            {Object.entries(fields).map(([k, v]) => <option key={k} value={k}>{v.label.split(" (")[0]}</option>)}
          </select>
          <label className="checkbox-label">
            <input type="checkbox" checked={config.yLog} onChange={e => setConfig({ ...config, yLog: e.target.checked })} />
            Log
          </label>
        </div>
      </div>
    </div>
  );

  const renderPlot = (config, setConfig) => {
    const currentCand = candidates[currentIndex];
    const xVal = currentCand ? fields[config.x].getValue(currentCand) : null;
    const yVal = currentCand ? fields[config.y].getValue(currentCand) : null;

    const currentTrace = currentCand ? [{
      x: [xVal],
      y: [yVal],
      name: "Current",
      mode: "markers",
      marker: {
        size: 14,
        color: "black",
        symbol: "circle-open",
        line: { width: 3 },
      },
      showlegend: false,
    }] : [];

    return (
      <div className="plot-box">
        {renderControls(null, config, setConfig)}
        <div className="plot-container">
          <Plot
            data={[
              ...getTraces(config),
              ...currentTrace
            ]}
            layout={{
              title: `${fields[config.x].label} vs ${fields[config.y].label}`,
              xaxis: { title: fields[config.x].label, type: config.xLog ? "log" : "linear" },
              yaxis: { title: fields[config.y].label, type: config.yLog ? "log" : "linear" },
              margin: { l: 60, r: 20, t: 40, b: 45 },
              autosize: true,
              showlegend: true,
              legend: { x: 1, y: 1 },
            }}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
            config={{ displayModeBar: false }}
          />
          <div className="dark-mode-overlay" />
        </div>
      </div>
    );
  };

  return (
    <div className="plot-panel">
      {renderPlot(plot1, setPlot1)}
      {renderPlot(plot2, setPlot2)}
    </div>
  );
}
