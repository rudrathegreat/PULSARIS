import { useEffect, useState } from "react";
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
  const total = reviewItems.length;

  const goNext = () => setIndex(i => Math.min(i + 1, total - 1));
  const goPrev = () => setIndex(i => Math.max(i - 1, 0));

  const setClass = label => {
    setReviewItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        candidate: {
          ...updated[index].candidate,
          classification: label,
        },
      };
      return updated;
    });
    // Auto-advance
    if (index < total - 1) {
      setTimeout(goNext, 150);
    }
  };

  useEffect(() => {
    const handler = e => {
      // If zoom is open, Escape should close it
      if (showZoom && e.key === "Escape") {
        setShowZoom(false);
        return;
      }
      if (showZoom) return; // Ignore other keys if zoom is open? 
      // Actually, maybe allow 'z' to close it too.

      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();

      const key = e.key.toLowerCase();
      if (key === "p") setClass("Known Pulsar");
      if (key === "1") setClass("Tier 1");
      if (key === "2") setClass("Tier 2");
      if (key === "n") setClass("Noise");
      if (key === "r") setClass("RFI");
      if (key === "z") setShowZoom(prev => !prev);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, total, setIndex, setReviewItems, showZoom]);

  if (!reviewItems || reviewItems.length === 0) {
    return <div className="review-grid"><p>No data loaded</p></div>;
  }

  const item = reviewItems[index];

  if (!item) {
    return <div className="review-grid"><p>No data loaded</p></div>;
  }

  return (
    <div className="review-grid">
      <TopBar
        index={index}
        setIndex={setIndex}
        total={total}
        filter="All"
        setFilter={() => { }}
        onSave={() => { }}
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
            index={index}
            onClassify={() => {
              if (index < total - 1) {
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
            currentIndex={index}
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
