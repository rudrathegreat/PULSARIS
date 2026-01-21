/**
 * Parses a JName (e.g., J0835-4510, J0024-7204ab) into decimal degrees.
 * Uses position-based parsing as IAU names have strict HHMM[SS][+-]DDMM[SS] format.
 */
export function parseJName(name) {
    if (!name || typeof name !== 'string') return null;

    // Clean: Remove J/B prefix and common metadata tags
    const clean = name.trim().replace(/^[JB]/i, '').trim();
    if (clean.length < 4) return null;

    // Find the sign that separates RA and Dec
    const signIdx = clean.search(/[+-]/);
    if (signIdx === -1) return null;

    const raStr = clean.slice(0, signIdx);
    const decStr = clean.slice(signIdx + 1);
    const sign = clean[signIdx] === '-' ? -1 : 1;

    // RA: Usually HHMM[SS]. HH can be 2 digits.
    const h = parseInt(raStr.slice(0, 2), 10);
    const m = parseInt(raStr.slice(2, 4) || "0", 10);
    const s = parseFloat(raStr.slice(4) || "0"); // Remaining is seconds

    // Dec: Usually DDMM[SS]
    const d = parseInt(decStr.slice(0, 2), 10);
    const dm = parseInt(decStr.slice(2, 4) || "0", 10);
    const ds = parseFloat(decStr.slice(4) || "0"); // Remaining is seconds

    if (isNaN(h) || isNaN(d)) return null;

    const ra = (h + m / 60 + (isNaN(s) ? 0 : s) / 3600) * 15;
    const dec = (d + dm / 60 + (isNaN(ds) ? 0 : ds) / 3600) * sign;

    return { ra, dec };
}

/**
 * Calculates angular separation between two RA/Dec pairs in degrees.
 */
export function getAngularSeparation(ra1, dec1, ra2, dec2) {
    if ([ra1, dec1, ra2, dec2].some(v => v === null || isNaN(v))) return Infinity;

    const toRad = Math.PI / 180;
    const toDeg = 180 / Math.PI;

    const r1 = ra1 * toRad;
    const d1 = dec1 * toRad;
    const r2 = ra2 * toRad;
    const d2 = dec2 * toRad;

    const cosSep = Math.sin(d1) * Math.sin(d2) + Math.cos(d1) * Math.cos(d2) * Math.cos(r1 - r2);
    return Math.acos(Math.max(-1, Math.min(1, cosSep))) * toDeg;
}

/**
 * Robustly parses coordinates from various strings.
 */
export function parseCoord(val, isRA = true) {
    if (typeof val === "number") return val;
    if (val === undefined || val === null) return NaN;

    const str = String(val).trim();
    if (!str) return NaN;

    // 1. Check for standard colon separation (HH:MM:SS)
    if (str.includes(":")) {
        const parts = str.split(":").map(parseFloat);
        let deg = Math.abs(parts[0] || 0);
        if (parts.length > 1) deg += parts[1] / 60;
        if (parts.length > 2) deg += (parts[2] || 0) / 3600;

        if (isRA) deg *= 15; // Assumption: colon RA is always hours
        const sign = (str.startsWith("-") || parts[0] < 0) ? -1 : 1;
        return deg * sign;
    }

    // 2. Check for qualifiers (h, m, s, d, deg, ', ")
    const qualMatch = str.match(/([+-]?\d+(?:\.\d+)?)\s*(h|d|deg|°)?\s*(\d+(?:\.\d+)?)\s*(m|min|'|)?\s*(\d+(?:\.\d+)?)?\s*(s|sec|"|)?/i);
    if (qualMatch && (qualMatch[2] || qualMatch[4])) {
        const v1 = parseFloat(qualMatch[1]);
        const m = parseFloat(qualMatch[3] || 0);
        const s = parseFloat(qualMatch[5] || 0);
        let deg = Math.abs(v1) + m / 60 + s / 3600;
        if (qualMatch[2]?.toLowerCase() === 'h' || (isRA && !qualMatch[2])) {
            deg *= 15;
        }
        const sign = (str.startsWith("-") || v1 < 0) ? -1 : 1;
        return deg * sign;
    }

    // 3. Simple decimal
    return parseFloat(str);
}

function toSexagesimal(val, isRA = true) {
    if (isNaN(val)) return "";
    const absolute = Math.abs(val);
    const d = Math.floor(absolute);
    const m = Math.floor((absolute - d) * 60);
    const s = Math.round(((absolute - d) * 60 - m) * 60);

    const sign = val < 0 ? "-" : (isRA ? "" : "+");
    const pad = (n) => n.toString().padStart(2, "0");

    return `${sign}${pad(d)}:${pad(m)}:${pad(s)}`;
}

export function formatRA(hours) { return toSexagesimal(hours, true); }
export function formatDec(deg) { return toSexagesimal(deg, false); }
