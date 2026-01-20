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
  const [showPopup, setShowPopup] = useState(false);
  const [pendingItems, setPendingItems] = useState([]);

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
        const hasClassification = res.data.some(r => "classification" in r && r.classification);

        const items = res.data
          .filter(r => {
            if (!r.png_file) return false;
            const csvBasename = r.png_file.split(/[/\\]/).pop();
            return imageMap[csvBasename];
          })
          .map(r => {
            const csvBasename = r.png_file.split(/[/\\]/).pop();
            return {
              candidate: {
                ...r,
                classification: r.classification || "Unclassified",
                png_name: csvBasename,
                _originalRow: { ...r }
              },
              image: imageMap[csvBasename],
            };
          });

        if (items.length === 0) {
          alert("No matching PNG files found. Please ensure files match the 'png_file' column.");
          return;
        }

        if (hasClassification) {
          setPendingItems(items);
          setShowPopup(true);
        } else {
          setReviewItems(items);
          setDataLoaded(true);
        }
      },
    });
  };

  const handlePopupChoice = (clear) => {
    const finalItems = clear
      ? pendingItems.map(it => ({
        ...it,
        candidate: { ...it.candidate, classification: "Unclassified" }
      }))
      : pendingItems;

    setReviewItems(finalItems);
    setDataLoaded(true);
    setShowPopup(false);
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

      {showPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Existing Classifications Found</h2>
            <p>Your CSV file already contains classifications. Would you like to keep them or clear them and start from scratch?</p>
            <div className="modal-buttons">
              <button className="modal-btn secondary" onClick={() => handlePopupChoice(false)}>Keep Existing</button>
              <button className="modal-btn primary" onClick={() => handlePopupChoice(true)}>Clear All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
