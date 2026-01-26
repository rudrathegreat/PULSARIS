import { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import "../styles/loader.css";
import textLogo from "../assets/text-logo.svg";
import logo from "../assets/logo.svg";
import textureMap from "../assets/texturemap.jpg";
import { parseCoord, getAngularSeparation, formatRA, formatDec } from "../utils/coords";
import { TARGETS } from "../utils/targets";

export default function LoaderScreen({
  setReviewItems,
  setPulsars,
  allPulsars,
  setDataLoaded,
}) {
  const [pngFiles, setPngFiles] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [pendingItems, setPendingItems] = useState([]);

  // Unified Survey Search State
  const [searchMode, setSearchMode] = useState("source"); // "source" or "manual"
  const [sourceName, setSourceName] = useState("");
  const [surveyRA, setSurveyRA] = useState("");
  const [surveyDec, setSurveyDec] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const mapRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchMatches = sourceName.length > 0
    ? TARGETS.filter(t => t.name.toLowerCase().includes(sourceName.toLowerCase())).slice(0, 10)
    : [];

  const handleMapClick = (e) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Center is 0h RA. Left is increasing RA.
    let raVal = (0.5 - x / rect.width) * 24;
    while (raVal < 0) raVal += 24;
    while (raVal >= 24) raVal -= 24;

    const decVal = 90 - (y / rect.height) * 180;

    setSurveyRA(formatRA(raVal));
    setSurveyDec(formatDec(decVal));
  };

  const getMarkerPos = () => {
    let raVal = parseCoord(surveyRA, true) / 15; // deg to hours
    const decVal = parseCoord(surveyDec, false);

    if (isNaN(raVal) || isNaN(decVal)) return null;

    let left = (0.5 - raVal / 24) * 100;
    while (left < 0) left += 100;
    while (left >= 100) left -= 100;

    const top = ((90 - decVal) / 180) * 100;

    return { left: `${left}%`, top: `${top}%` };
  };

  const loadData = () => {
    if (!pngFiles || pngFiles.length === 0) {
      alert("Please select a PNG folder first.");
      return;
    }
    if (!csvFile) {
      alert("Please select a candidate CSV file first.");
      return;
    }

    // Resolve Coordinates based on Mode
    let raVal = NaN;
    let decVal = NaN;

    if (searchMode === "source") {
      const query = sourceName.trim().toLowerCase();
      const selected = TARGETS.find(t =>
        t.name.toLowerCase() === query ||
        t.name.split(' (')[0].toLowerCase() === query ||
        t.name.toLowerCase().includes(query)
      );
      if (selected) {
        raVal = parseCoord(selected.ra, true);
        decVal = parseCoord(selected.dec, false);
      } else if (sourceName.trim()) {
        alert("Source not found in database.");
        return;
      }
    } else {
      raVal = parseCoord(surveyRA, true);
      decVal = parseCoord(surveyDec, false);
    }

    // Proximity Filtering (within 10 deg)
    if (!isNaN(raVal) && !isNaN(decVal)) {
      const filtered = allPulsars.filter(p => {
        if (p.ra === null || p.dec === null) return false;
        const dist = getAngularSeparation(raVal, decVal, p.ra, p.dec);
        return dist <= 20.0;
      });
      setPulsars(filtered);
    } else {
      setPulsars(allPulsars);
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
          alert("No matching PNG files found.");
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
      error: () => alert("Failed to parse CSV file.")
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

  const markerPos = getMarkerPos();

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

      <div className="survey-section">
        <div className="survey-header">
          <h3>Survey Configuration</h3>
          <div className="mode-toggle">
            <button
              className={searchMode === "source" ? "active" : ""}
              onClick={() => setSearchMode("source")}
            >
              Source Search
            </button>
            <button
              className={searchMode === "manual" ? "active" : ""}
              onClick={() => setSearchMode("manual")}
            >
              Manual Coords
            </button>
          </div>
        </div>

        <div className="survey-search-box">
          {searchMode === "source" ? (
            <div className="input-field single search-bar-container" ref={dropdownRef}>
              <p>Source Name</p>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search Clusters/Galaxies..."
                  value={sourceName}
                  onChange={e => {
                    setSourceName(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                />
              </div>
              {showDropdown && searchMatches.length > 0 && (
                <div className="search-dropdown">
                  {searchMatches.map((m, i) => (
                    <div
                      key={i}
                      className="dropdown-item"
                      onClick={() => {
                        setSourceName(m.name);
                        setShowDropdown(false);
                      }}
                    >
                      {m.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="manual-coords-container">
              <div className="input-field double">
                <div className="field">
                  <p>RA (HH:MM:SS)</p>
                  <input
                    type="text"
                    placeholder="00:24:05"
                    value={surveyRA}
                    onChange={e => setSurveyRA(e.target.value)}
                  />
                </div>
                <div className="field">
                  <p>DEC (DD:MM:SS)</p>
                  <input
                    type="text"
                    placeholder="-72:04:53"
                    value={surveyDec}
                    onChange={e => setSurveyDec(e.target.value)}
                  />
                </div>
              </div>

              <div className="map-selector" ref={mapRef} onClick={handleMapClick}>
                <img src={textureMap} alt="" className="map-image" />
                {markerPos && <div className="map-marker" style={markerPos} />}
              </div>
            </div>
          )}
        </div>
      </div>

      <button onClick={loadData}>
        Load Data
      </button>

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
