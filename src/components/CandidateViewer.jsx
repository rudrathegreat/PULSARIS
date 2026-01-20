export default function CandidateViewer({ image }) {
  return (
    <div className="candidate-viewer">
      {image ? (
        <div className="image-wrapper">
          <img src={image.url} alt={image.name} />
          <div className="dark-mode-overlay" />
        </div>
      ) : (
        <p>No image</p>
      )}
    </div>
  );
}
