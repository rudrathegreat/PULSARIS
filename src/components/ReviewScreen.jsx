import { useEffect, useState } from "react";
import Papa from "papaparse";
import TopBar from "./TopBar";
import CandidateViewer from "./CandidateViewer";
import ClassificationPanel from "./ClassificationPanel";
import PulsarMatches from "./PulsarMatches";
import CandidateSummary from "./CandidateSummary";
import PlotPanel from "./PlotPanel";
import ImageViewer from "./ImageViewer";
import "../styles/review.css";

export default function ReviewScreen({
  reviewItems,
  setReviewItems,
  pulsars,
  index,
  setIndex,
  isDarkMode,
  setIsDarkMode
}) {
  const [showZoom, setShowZoom] = useState(false);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Filter and Sort items
  const filteredItems = reviewItems
    .filter(item => {
      // Classification filter
      let matchesFilter = true;
      if (filter === "Unclassified") matchesFilter = !item.candidate.classification || item.candidate.classification === "Unclassified";
      else if (filter !== "All") matchesFilter = item.candidate.classification === filter;

      // Search filter (by png_file)
      const matchesSearch = item.candidate.png_file.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (!sortKey) return 0;

      let valA = a.candidate[sortKey];
      let valB = b.candidate[sortKey];

      // Try numeric comparison if possible
      const numA = parseFloat(valA);
      const numB = parseFloat(valB);
      if (!isNaN(numA) && !isNaN(numB)) {
        valA = numA;
        valB = numB;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const total = filteredItems.length;
  // Ensure index is within bounds of filtered list
  const safeIndex = Math.min(index, Math.max(0, total - 1));

  const goNext = () => setIndex(i => Math.min(i + 1, total - 1));
  const goPrev = () => setIndex(i => Math.max(i - 1, 0));

  const handleSetFilter = (newFilter) => {
    setFilter(newFilter);
    setIndex(0); // Reset index when filter changes
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to remove all classifications and start from scratch?")) {
      setReviewItems(prev => prev.map(item => ({
        ...item,
        candidate: {
          ...item.candidate,
          classification: "Unclassified"
        }
      })));
      setIndex(0);
    }
  };

  const setClass = label => {
    const itemToUpdate = filteredItems[safeIndex];
    if (!itemToUpdate) return;

    setReviewItems(prev => {
      const updated = [...prev];
      // Find index in original array
      const origIndex = updated.findIndex(it => it.candidate === itemToUpdate.candidate);
      if (origIndex !== -1) {
        updated[origIndex] = {
          ...updated[origIndex],
          candidate: {
            ...updated[origIndex].candidate,
            classification: label,
          },
        };
      }
      return updated;
    });

    // Auto-advance
    if (safeIndex < total - 1) {
      setTimeout(goNext, 150);
    }
  };

  const handleSave = () => {
    // Export modified version of original CSV
    const dataToSave = reviewItems.map(item => {
      // Use _originalRow to ensure all columns are preserved
      const originalRow = item.candidate._originalRow || item.candidate;
      return {
        ...originalRow,
        classification: item.candidate.classification || "Unclassified"
      };
    });

    const csv = Papa.unparse(dataToSave);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "classifications_modified.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const handler = e => {
      // Ignore if user is typing in an input/select
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "SELECT" ||
        e.target.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (showZoom && e.key === "Escape") {
        setShowZoom(false);
        e.preventDefault();
        return;
      }
      if (showZoom) return;

      if (e.key === "ArrowRight") {
        goNext();
        e.preventDefault();
      }
      if (e.key === "ArrowLeft") {
        goPrev();
        e.preventDefault();
      }

      const key = e.key.toLowerCase();
      let handled = true;
      if (key === "p") setClass("Known Pulsar");
      else if (key === "1") setClass("Tier 1");
      else if (key === "2") setClass("Tier 2");
      else if (key === "n") setClass("Noise");
      else if (key === "r") setClass("RFI");
      else if (key === "z") setShowZoom(prev => !prev);
      else handled = false;

      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [safeIndex, total, setIndex, setReviewItems, showZoom, filteredItems]);

  const handleSelectCandidate = (cand) => {
    const filteredIdx = filteredItems.findIndex(it => it.candidate === cand);
    if (filteredIdx !== -1) {
      setIndex(filteredIdx);
    } else {
      setFilter("All");
      setSearchTerm("");
      const origIdx = reviewItems.findIndex(it => it.candidate === cand);
      if (origIdx !== -1) {
        setIndex(origIdx);
      }
    }
  };

  const sortOptions = [
    { label: "FFT DM", column: "dm_old" },
    { label: "Optimised DM", column: "dm_new" },
    { label: "FFT Spin Frequency", column: "f0_old" },
    { label: "Optimised Spin Frequency", column: "f0_new" },
    { label: "FTT S/N", column: "S/N_old" },
    { label: "Folded S/N", column: "S/N_new" },
    { label: "Filename", column: "png_file" }
  ];

  if (!reviewItems || reviewItems.length === 0) {
    return <div className="review-grid"><p>No data loaded</p></div>;
  }

  const item = total > 0 ? filteredItems[safeIndex] : null;

  return (
    <div className="review-grid">
      <TopBar
        index={total > 0 ? safeIndex : 0}
        setIndex={setIndex}
        total={total}
        onSave={handleSave}
        onZoom={() => total > 0 && setShowZoom(true)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onReset={handleReset}
        hasClassificationColumn={reviewItems.some(it => it.candidate._hadClassificationColumn)}
        allCandidates={reviewItems.map(it => it.candidate)}
        onSelectCandidate={handleSelectCandidate}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
      <div className="main">
        <div className="left-column">
          {total > 0 ? (
            <>
              <CandidateViewer image={item.image} />
              <CandidateSummary candidate={item.candidate} />
            </>
          ) : (
            <div className="no-matches-message">
              <p>No candidates match the current filter.</p>
            </div>
          )}
        </div>
        <div className="right-column">
          <ClassificationPanel
            candidate={item ? item.candidate : null}
            setCandidates={setReviewItems}
            index={item ? reviewItems.findIndex(it => it === item) : -1}
            onClassify={() => {
              if (safeIndex < total - 1) {
                setTimeout(goNext, 150);
              }
            }}
            unified
          />

          <div className="side-controls">
            <div className="filter-group-horizontal">
              <h3 className="section-title-small">Sort</h3>
              <div className="filter-controls">
                <select
                  value={sortKey}
                  onChange={e => setSortKey(e.target.value)}
                  className="side-select"
                >
                  <option value="">None</option>
                  {sortOptions.map(opt => (
                    <option key={opt.column} value={opt.column}>{opt.label}</option>
                  ))}
                </select>
                <select
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value)}
                  className="side-select order-select"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>

            <div className="filter-group-horizontal">
              <h3 className="section-title-small">Filter</h3>
              <select
                value={filter}
                onChange={e => handleSetFilter(e.target.value)}
                className="side-select full-width"
              >
                <option value="All">All Candidates</option>
                <option value="Unclassified">Unclassified</option>
                <option value="Known Pulsar">Known Pulsar</option>
                <option value="Tier 1">Tier 1</option>
                <option value="Tier 2">Tier 2</option>
                <option value="Noise">Noise</option>
                <option value="RFI">RFI</option>
              </select>
            </div>
          </div>

          <PulsarMatches
            candidate={item ? item.candidate : null}
            pulsars={pulsars}
          />

          <PlotPanel
            candidates={reviewItems.map(r => r.candidate)}
            currentIndex={item ? reviewItems.findIndex(it => it.candidate === item.candidate) : -1}
          />
        </div>
      </div>

      {showZoom && item && (
        <ImageViewer
          image={item.image}
          onClose={() => setShowZoom(false)}
        />
      )}
    </div>
  );
}
