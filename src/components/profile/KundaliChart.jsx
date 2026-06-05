/**
 * KundaliChart.jsx
 * ================
 * Renders a classic North Indian diamond-grid Kundali chart.
 *
 * The chart is a 4×4 grid where:
 * - The center diamond is split diagonally into 4 triangular houses (1, 4, 7, 10)
 * - The outer 8 rectangular cells are houses (2, 3, 5, 6, 8, 9, 11, 12)
 *
 * Props:
 *  - houses: array of 12 house objects { houseNumber, rashiIndex, rashi, planets[] }
 *  - chartType: 'lagna' | 'chandra'
 *  - lagnaRashi: object (if available)
 *  - lang: 'mr' | 'en'
 */

import React from 'react';

// North Indian chart layout:
// The classic diamond has these houses at these positions:
//
//       ┌───┬───────┬───┐
//       │12 │       │ 2 │
//       │   │   1   │   │
//       ├───┤       ├───┤
//       │   │       │   │
//       │11 │       │ 3 │
//       ├───┤       ├───┤
//       │   │       │   │
//       │10 │   7   │ 4 │
//       │   │       │   │
//       ├───┤       ├───┤
//       │ 9 │       │ 5 │
//       │   │       │   │
//       └───┴───────┴───┘
//               6  8
//
// We'll use a CSS approach with a 4x4 grid and triangles via clip-path.

export default function KundaliChart({ houses = [], chartType = 'chandra', lagnaRashi, lang = 'mr' }) {
  if (!houses || houses.length !== 12) return null;

  const isMarathi = lang === 'mr';
  
  // House layout positions for North Indian chart
  // Each house is positioned in a specific cell of the visual layout
  // North Indian chart house numbering (fixed positions):
  // Top: 12 | 1 | 2
  // Left: 11 | Center | 3
  // Bottom: 10 | 7 | 4
  // Sides: 9 | 8,6 | 5
  
  const renderPlanets = (house) => {
    if (!house.planets || house.planets.length === 0) return null;
    return house.planets.map((p, i) => {
      const colorClass = p.nature === 'benefic' ? 'kc-planet-benefic' : 
                         p.nature === 'malefic' ? 'kc-planet-malefic' : 'kc-planet-neutral';
      return (
        <span key={i} className={`kc-planet ${colorClass}`} title={`${isMarathi ? p.mr : p.en}: ${p.degInRashi}°`}>
          {isMarathi ? p.abbrMr : p.abbr}
          {p.isRetrograde && <sup className="kc-retro">ᴿ</sup>}
        </span>
      );
    });
  };

  const getRashiLabel = (house) => {
    return isMarathi ? house.rashi.mr : house.rashi.en;
  };

  // Build house content for each of the 12 houses
  const HouseCell = ({ houseIdx, className = '' }) => {
    const house = houses[houseIdx];
    if (!house) return <div className={`kc-house ${className}`} />;
    
    return (
      <div className={`kc-house ${className}`}>
        <div className="kc-house-rashi">{getRashiLabel(house)}</div>
        <div className="kc-house-planets">{renderPlanets(house)}</div>
        {houseIdx === 0 && (
          <div className="kc-lagna-mark">
            {chartType === 'lagna' ? (isMarathi ? 'लग्न' : 'Asc') : (isMarathi ? 'चं' : 'Mo')}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="kc-wrapper">
      <div className="kc-chart">
        {/* The North Indian chart rendered as an SVG-based diamond with HTML overlays */}
        <svg className="kc-svg" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
          {/* Outer border */}
          <rect x="1" y="1" width="398" height="398" fill="none" stroke="#7c1d1d" strokeWidth="2" />
          
          {/* Inner diamond (center X) */}
          <line x1="0" y1="0" x2="200" y2="200" stroke="#7c1d1d" strokeWidth="1.5" />
          <line x1="400" y1="0" x2="200" y2="200" stroke="#7c1d1d" strokeWidth="1.5" />
          <line x1="0" y1="400" x2="200" y2="200" stroke="#7c1d1d" strokeWidth="1.5" />
          <line x1="400" y1="400" x2="200" y2="200" stroke="#7c1d1d" strokeWidth="1.5" />
          
          {/* Horizontal and vertical lines for the outer houses */}
          <line x1="100" y1="0" x2="100" y2="100" stroke="#7c1d1d" strokeWidth="1.5" />
          <line x1="300" y1="0" x2="300" y2="100" stroke="#7c1d1d" strokeWidth="1.5" />
          <line x1="100" y1="300" x2="100" y2="400" stroke="#7c1d1d" strokeWidth="1.5" />
          <line x1="300" y1="300" x2="300" y2="400" stroke="#7c1d1d" strokeWidth="1.5" />
          
          <line x1="0" y1="100" x2="100" y2="100" stroke="#7c1d1d" strokeWidth="1.5" />
          <line x1="0" y1="300" x2="100" y2="300" stroke="#7c1d1d" strokeWidth="1.5" />
          <line x1="300" y1="100" x2="400" y2="100" stroke="#7c1d1d" strokeWidth="1.5" />
          <line x1="300" y1="300" x2="400" y2="300" stroke="#7c1d1d" strokeWidth="1.5" />

          {/* Mid lines for house divisions */}
          <line x1="100" y1="100" x2="200" y2="0" stroke="#7c1d1d" strokeWidth="1.5" />
          <line x1="300" y1="100" x2="200" y2="0" stroke="#7c1d1d" strokeWidth="1.5" />
          <line x1="100" y1="100" x2="0" y2="200" stroke="#7c1d1d" strokeWidth="1.5" />
          <line x1="100" y1="300" x2="0" y2="200" stroke="#7c1d1d" strokeWidth="1.5" />
          <line x1="300" y1="100" x2="400" y2="200" stroke="#7c1d1d" strokeWidth="1.5" />
          <line x1="300" y1="300" x2="400" y2="200" stroke="#7c1d1d" strokeWidth="1.5" />
          <line x1="100" y1="300" x2="200" y2="400" stroke="#7c1d1d" strokeWidth="1.5" />
          <line x1="300" y1="300" x2="200" y2="400" stroke="#7c1d1d" strokeWidth="1.5" />
        </svg>

        {/* House overlays positioned absolutely over the SVG */}
        {/* House 1 — Top center triangle (Lagna / Ascendant) */}
        <div className="kc-cell kc-h1">
          <HouseCell houseIdx={0} />
        </div>
        {/* House 2 — Top right */}
        <div className="kc-cell kc-h2">
          <HouseCell houseIdx={1} />
        </div>
        {/* House 3 — Right upper */}
        <div className="kc-cell kc-h3">
          <HouseCell houseIdx={2} />
        </div>
        {/* House 4 — Right center triangle */}
        <div className="kc-cell kc-h4">
          <HouseCell houseIdx={3} />
        </div>
        {/* House 5 — Right lower */}
        <div className="kc-cell kc-h5">
          <HouseCell houseIdx={4} />
        </div>
        {/* House 6 — Bottom right */}
        <div className="kc-cell kc-h6">
          <HouseCell houseIdx={5} />
        </div>
        {/* House 7 — Bottom center triangle */}
        <div className="kc-cell kc-h7">
          <HouseCell houseIdx={6} />
        </div>
        {/* House 8 — Bottom left */}
        <div className="kc-cell kc-h8">
          <HouseCell houseIdx={7} />
        </div>
        {/* House 9 — Left lower */}
        <div className="kc-cell kc-h9">
          <HouseCell houseIdx={8} />
        </div>
        {/* House 10 — Left center triangle */}
        <div className="kc-cell kc-h10">
          <HouseCell houseIdx={9} />
        </div>
        {/* House 11 — Left upper */}
        <div className="kc-cell kc-h11">
          <HouseCell houseIdx={10} />
        </div>
        {/* House 12 — Top left */}
        <div className="kc-cell kc-h12">
          <HouseCell houseIdx={11} />
        </div>
      </div>

      {/* Legend */}
      <div className="kc-legend">
        <span className="kc-legend-item"><span className="kc-dot kc-dot-benefic" />{isMarathi ? 'शुभ' : 'Benefic'}</span>
        <span className="kc-legend-item"><span className="kc-dot kc-dot-malefic" />{isMarathi ? 'पापी' : 'Malefic'}</span>
        <span className="kc-legend-item"><span className="kc-dot kc-dot-neutral" />{isMarathi ? 'सम' : 'Neutral'}</span>
        <span className="kc-legend-item" style={{ opacity: 0.7 }}>
          {chartType === 'lagna' 
            ? (isMarathi ? '(लग्न कुंडली)' : '(Lagna Kundali)')
            : (isMarathi ? '(चंद्र कुंडली)' : '(Chandra Kundali)')
          }
        </span>
      </div>

      <style>{`
        .kc-wrapper {
          width: 100%;
          max-width: 420px;
          margin: 16px auto;
          font-family: 'Georgia', serif;
        }
        .kc-chart {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          background: #fffbeb;
          border: 2px solid #7c1d1d;
          border-radius: 4px;
          overflow: hidden;
        }
        .kc-svg {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          z-index: 1;
          pointer-events: none;
        }

        /* House cell positioning — all absolute over the SVG */
        .kc-cell {
          position: absolute;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .kc-house {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          width: 100%;
          height: 100%;
          position: relative;
        }

        /* ── House positions (percentage-based for responsiveness) ── */
        /* House 1: Top center triangle */
        .kc-h1  { top: 2%; left: 28%; width: 44%; height: 22%; }
        /* House 2: Top right rectangle */
        .kc-h2  { top: 1%; left: 76%; width: 23%; height: 24%; }
        /* House 3: Right upper triangle */
        .kc-h3  { top: 26%; left: 76%; width: 23%; height: 24%; }
        /* House 4: Right center triangle */
        .kc-h4  { top: 28%; left: 54%; width: 44%; height: 22%; }
        /* House 5: Right lower triangle */
        .kc-h5  { top: 51%; left: 76%; width: 23%; height: 24%; }
        /* House 6: Bottom right rectangle */
        .kc-h6  { top: 76%; left: 76%; width: 23%; height: 23%; }
        /* House 7: Bottom center triangle */
        .kc-h7  { top: 54%; left: 28%; width: 44%; height: 22%; }
        /* House 8: Bottom left rectangle */
        .kc-h8  { top: 76%; left: 1%; width: 23%; height: 23%; }
        /* House 9: Left lower triangle */
        .kc-h9  { top: 51%; left: 1%; width: 23%; height: 24%; }
        /* House 10: Left center triangle */
        .kc-h10 { top: 28%; left: 2%; width: 44%; height: 22%; }
        /* House 11: Left upper triangle */
        .kc-h11 { top: 26%; left: 1%; width: 23%; height: 24%; }
        /* House 12: Top left rectangle */
        .kc-h12 { top: 1%; left: 1%; width: 23%; height: 24%; }

        .kc-house-rashi {
          font-size: 10px;
          color: #92400e;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-align: center;
          line-height: 1.1;
        }
        .kc-house-planets {
          display: flex;
          flex-wrap: wrap;
          gap: 3px;
          justify-content: center;
          align-items: center;
        }
        .kc-planet {
          font-size: 12px;
          font-weight: 800;
          padding: 1px 3px;
          border-radius: 3px;
          line-height: 1;
          font-family: sans-serif;
        }
        .kc-planet-benefic { color: #166534; background: #dcfce7; }
        .kc-planet-malefic { color: #991b1b; background: #fee2e2; }
        .kc-planet-neutral { color: #1e40af; background: #dbeafe; }
        .kc-retro { font-size: 7px; color: #d97706; }

        .kc-lagna-mark {
          position: absolute;
          top: 2px;
          left: 4px;
          font-size: 8px;
          font-weight: 900;
          color: #7c1d1d;
          background: #fef3c7;
          padding: 1px 4px;
          border-radius: 3px;
          font-family: sans-serif;
          letter-spacing: 0.5px;
        }

        /* Legend */
        .kc-legend {
          display: flex;
          gap: 12px;
          justify-content: center;
          align-items: center;
          padding: 8px 0 4px;
          font-size: 11px;
          color: #64748b;
          font-family: sans-serif;
          flex-wrap: wrap;
        }
        .kc-legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .kc-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .kc-dot-benefic { background: #166534; }
        .kc-dot-malefic { background: #991b1b; }
        .kc-dot-neutral { background: #1e40af; }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .kc-wrapper { max-width: 320px; }
          .kc-house-rashi { font-size: 8px; }
          .kc-planet { font-size: 10px; padding: 0 2px; }
          .kc-lagna-mark { font-size: 7px; }
        }
      `}</style>
    </div>
  );
}
