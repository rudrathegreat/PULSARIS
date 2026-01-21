export default function CandidateViewer({ image, onZoom }) {
  return (
    <div className="candidate-viewer">
      {image ? (
        <div
          className="image-wrapper"
          onClick={onZoom}
          style={{ cursor: "zoom-in" }}
        >
          <img src={image.url} alt={image.name} />
          <div className="dark-mode-overlay" />
        </div>
      ) : (
        <p>No image</p>
      )}
    </div>
  );
}
