export default function TopBar({
  index,
  setIndex,
  total,
  filter,
  setFilter,
  onSave,
  onZoom,
}) {
  const goFirst = () => setIndex(0);
  const goPrev = () => setIndex(i => Math.max(i - 1, 0));
  const goNext = () => setIndex(i => Math.min(i + 1, total - 1));
  const goLast = () => setIndex(total - 1);

  return (
    <div className="top-bar">
      <div className="nav-buttons">
        <button onClick={goFirst}>⏮</button>
        <button onClick={goPrev}>◀</button>
        <button onClick={goNext}>▶</button>
        <button onClick={goLast}>⏭</button>
        <button onClick={onZoom} title="Zoom Image (Z)">Zoom</button>
      </div>
      <div className="right-side">
        <span className="counter">
          {index + 1} / {total}
        </span>
        <div className="filter">
          <h2>Filter:</h2>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Unclassified">Unclassified</option>
            <option value="Known Pulsar">Known Pulsar</option>
            <option value="Tier 1">Tier 1</option>
            <option value="Tier 2">Tier 2</option>
            <option value="Noise">Noise</option>
            <option value="RFI">RFI</option>
          </select>
        </div>

        <button className="save-btn" onClick={onSave}>
          Save Classifications
        </button>
      </div>
    </div>
  );
}
