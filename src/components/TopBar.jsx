import { useState, useEffect, useRef } from "react";

export default function TopBar({
  index,
  setIndex,
  total,
  onSave,
  onZoom,
  searchTerm,
  setSearchTerm,
  onReset,
  allCandidates = [],
  onSelectCandidate,
  isDarkMode,
  setIsDarkMode
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef(null);
  const settingsRef = useRef(null);

  const goFirst = () => setIndex(0);
  const goPrev = () => setIndex(i => Math.max(i - 1, 0));
  const goNext = () => setIndex(i => Math.min(i + 1, total - 1));
  const goLast = () => setIndex(total - 1);

  const matches = searchTerm.length > 0
    ? allCandidates.filter(c => (c.png_name || c.png_file).toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 10)
    : [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="top-bar">
      <div className="nav-buttons">
        <button onClick={goFirst}>⏮</button>
        <button onClick={goPrev}>◀</button>
        <button onClick={goNext}>▶</button>
        <button onClick={goLast}>⏭</button>
        <button onClick={onZoom} title="Zoom Image (Z)">Zoom</button>
      </div>

      <div className="search-bar-container" ref={dropdownRef}>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search PNG filename..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
        </div>
        {showDropdown && matches.length > 0 && (
          <div className="search-dropdown">
            {matches.map((m, i) => (
              <div
                key={i}
                className="dropdown-item"
                onClick={() => {
                  onSelectCandidate(m);
                  setShowDropdown(false);
                }}
              >
                {m.png_name || m.png_file.split('/').pop()}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="right-side">
        <span className="counter">
          {index + 1} / {total}
        </span>

        <button className="save-btn" onClick={onSave}>
          Save CSV
        </button>

        <div className="settings-container" ref={settingsRef}>
          <button
            className="settings-toggle"
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          {showSettings && (
            <div className="settings-dropdown">
              <div className="settings-item">
                <span>Dark Mode</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={isDarkMode}
                    onChange={e => setIsDarkMode(e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="settings-divider"></div>
              <button className="settings-action-btn reset" onClick={() => {
                onReset();
                setShowSettings(false);
              }}>
                Clear All Classifications
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
