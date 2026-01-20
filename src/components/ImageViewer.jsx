import { useState, useRef, useEffect } from "react";

export default function ImageViewer({ image, onClose }) {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale((s) => Math.min(Math.max(s * delta, 0.5), 10));
    };

    const handleMouseDown = (e) => {
        setIsPanning(true);
        setStartPan({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e) => {
        if (!isPanning) return;
        setPosition({
            x: e.clientX - startPan.x,
            y: e.clientY - startPan.y,
        });
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const reset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener("wheel", handleWheel, { passive: false });
        }
        return () => {
            if (container) {
                container.removeEventListener("wheel", handleWheel);
            }
        };
    }, []);

    return (
        <div className="image-viewer-overlay">
            <div className="image-viewer-header">
                <div className="viewer-controls">
                    <button onClick={() => setScale(s => s * 1.2)}>Zoom In (+)</button>
                    <button onClick={() => setScale(s => s * 0.8)}>Zoom Out (-)</button>
                    <button onClick={reset}>Reset</button>
                </div>
                <button className="close-btn" onClick={onClose}>Close (Esc)</button>
            </div>

            <div
                className="image-viewer-container"
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div
                    className="image-wrapper"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        cursor: isPanning ? "grabbing" : "grab",
                    }}
                >
                    <img
                        src={image.url}
                        alt={image.name}
                        draggable="false"
                    />
                    <div className="dark-mode-overlay" />
                </div>
            </div>
        </div>
    );
}
