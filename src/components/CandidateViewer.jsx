export default function CandidateViewer({ image }) {
  return (
    <div className="candidate-viewer">
      {image ? (
        <img src={image.url} alt={image.name} />
      ) : (
        <p>No image</p>
      )}
    </div>
  );
}
