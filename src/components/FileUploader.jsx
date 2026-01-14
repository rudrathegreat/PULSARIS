import Papa from "papaparse";

export default function FileUploader({ setCandidates, setImages }) {
  const handleCandidateCSV = (e) => {
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        setCandidates(
            res.data.map((r) => ({
                ...r,
                classification: "UNCLASSIFIED",
                period: 1 / parseFloat(r.f0_new),
                dm_new: parseFloat(r.dm_new),
                png_name: r.png_file.split("/").pop(), // 👈 KEY FIX
            }))
            );

      },
    });
  };

  const handleImages = (e) => {
    const files = {};
    [...e.target.files].forEach((f) => {
        files[f.name] = URL.createObjectURL(f);
    });
    setImages(files);
};

  return (
    <div className="upload">
      <h2>Upload Data</h2>

      <p><b>1. PNG folder</b></p>
      <input type="file" webkitdirectory="true" onChange={handleImages} />

      <p><b>2. Candidate CSV</b></p>
      <input type="file" accept=".csv" onChange={handleCandidateCSV} />
    </div>
  );
}
