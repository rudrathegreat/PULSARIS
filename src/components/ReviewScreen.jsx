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
}) {
  const [showZoom, setShowZoom] = useState(false);
  const [filter, setFilter] = useState("All");

  // Filter items
  const filteredItems = reviewItems.filter(item => {
    if (filter === "All") return true;
    if (filter === "Unclassified") return !item.candidate.classification;
    return item.candidate.classification === filter;
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
    // Columns: png_file, S/N, period, DM, classification
    const dataToSave = reviewItems.map(item => {
      const cand = item.candidate;
      // Get period in ms if possible
      const freq = cand.f0_new && cand.f0_new > 0 ? cand.f0_new : cand.f0_old;
      const period_ms = freq ? (1000.0 / freq) : 0;

      return {
        png_file: cand.png_file,
        "S/N": cand["S/N_new"] ?? cand["S/N"],
        period: (period_ms / 1000.0).toFixed(6), // period in seconds as requested? Or ms? 
        // Instructions said: png_file, S/N, period, DM, classification. 
        // Usually period is in seconds in these CSVs.
        DM: cand.dm_new ?? cand.dm_old,
        classification: cand.classification || "Unclassified"
      };
    });

    const csv = Papa.unparse(dataToSave);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "classifications.csv");
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

  if (!reviewItems || reviewItems.length === 0) {
    return <div className="review-grid"><p>No data loaded</p></div>;
  }

  if (total === 0) {
    return (
      <div className="review-grid">
        <TopBar
          index={0}
          setIndex={setIndex}
          total={0}
          filter={filter}
          setFilter={handleSetFilter}
          onSave={handleSave}
          onZoom={() => { }}
        />
        <div className="main"><p>No candidates match the current filter.</p></div>
      </div>
    );
  }

  const item = filteredItems[safeIndex];

  return (
    <div className="review-grid">
      <TopBar
        index={safeIndex}
        setIndex={setIndex}
        total={total}
        filter={filter}
        setFilter={handleSetFilter}
        onSave={handleSave}
        onZoom={() => setShowZoom(true)}
      />
      <div className="main">
        <div className="left-column">
          <CandidateViewer image={item.image} />
          <CandidateSummary candidate={item.candidate} />
        </div>
        <div className="right-column">
          <ClassificationPanel
            candidate={item.candidate}
            setCandidates={setReviewItems}
            index={reviewItems.findIndex(it => it === item)} // original index for ClassificationPanel
            onClassify={() => {
              if (safeIndex < total - 1) {
                setTimeout(goNext, 150);
              }
            }}
            unified
          />

          <PulsarMatches
            candidate={item.candidate}
            pulsars={pulsars}
          />

          <PlotPanel
            candidates={reviewItems.map(r => r.candidate)}
            currentIndex={reviewItems.findIndex(it => it.candidate === item.candidate)}
          />
        </div>
      </div>

      {showZoom && (
        <ImageViewer
          image={item.image}
          onClose={() => setShowZoom(false)}
        />
      )}
    </div>
  );
}
