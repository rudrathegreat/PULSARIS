import { useState } from "react";
import Papa from "papaparse";
import "../styles/loader.css";
import textLogo from "../assets/text-logo.svg";
import logo from "../assets/logo.svg";

export default function LoaderScreen({
  setReviewItems,
  setPulsars,
  setDataLoaded,
}) {
  const [pngFiles, setPngFiles] = useState([]);
  const [csvFile, setCsvFile] = useState(null);

  const loadData = () => {
    if (!pngFiles || pngFiles.length === 0) {
      alert("Please select a PNG folder first.");
      return;
    }
    if (!csvFile) {
      alert("Please select a candidate CSV file first.");
      return;
    }

    // Map PNG basename → object URL
    const imageMap = {};
    Array.from(pngFiles).forEach(f => {
      const basename = f.name.split(/[/\\]/).pop();
      imageMap[basename] = {
        name: f.name,
        url: URL.createObjectURL(f),
      };
    });

    Papa.parse(csvFile, {
      header: true,
      dynamicTyping: true,
      complete: res => {
        const items = res.data
          .filter(r => {
            if (!r.png_file) return false;
            const csvBasename = r.png_file.split(/[/\\]/).pop();
            return imageMap[csvBasename];
          })
          .map(r => {
            const csvBasename = r.png_file.split(/[/\\]/).pop();
            return {
              candidate: { ...r, classification: "" },
              image: imageMap[csvBasename],
            };
          });

        if (items.length === 0) {
          alert("No matching PNG files found for the rows in your CSV. Please ensure the PNG files in the folder match the 'png_file' column in your CSV.");
          return;
        }

        setReviewItems(items);
        setDataLoaded(true);
      },
    });
  };

  return (
    <div className="loader-container">
      <img src={logo} alt="" />
      <div className="title">
        <h1>Welcome to</h1>
        <img src={textLogo} alt="" />
      </div>

      <div className="loader-inputs">
        <label>
          <p>Load PNG Folder</p> <span>*</span>
          <input
            type="file"
            webkitdirectory="true"
            onChange={e => setPngFiles(e.target.files)}
          />
        </label>

        <label>
          <p>Load Candidate CSV</p> <span>*</span>
          <input
            type="file"
            accept=".csv"
            onChange={e => setCsvFile(e.target.files[0])}
          />
        </label>
      </div>

      <button onClick={loadData}>Load Data</button>
    </div>
  );
}
