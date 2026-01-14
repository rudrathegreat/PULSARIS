import Plot from "react-plotly.js";

export default function CandidatePlot({ candidates }) {
  return (
    <Plot
      data={[
        {
          x: candidates.map((c) => c.period),
          y: candidates.map((c) => c.dm_new),
          mode: "markers",
          marker: {
            color: candidates.map((c) =>
              c.classification === "Candidate" ? "red" :
              c.classification === "Noise" ? "gray" : "blue"
            ),
          },
        },
      ]}
      layout={{
        title: "Candidates",
        xaxis: { title: "Period (s)" },
        yaxis: { title: "DM" },
      }}
    />
  );
}
