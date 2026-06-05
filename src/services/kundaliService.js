/**
 * kundaliService.js
 * ===================
 * Full Vedic Janma Kundali calculation engine using astronomy-engine.
 *
 * Calculates:
 *  - Positions of all 9 Vedic planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu)
 *  - Lagna (Ascendant) — requires birth time + place
 *  - House placements (1–12) relative to Lagna (or Moon if no Lagna)
 *  - Sidereal longitudes using Lahiri Ayanamsha
 *
 * Dependencies: astronomy-engine (npm)
 *
 * References:
 *  - Jean Meeus, "Astronomical Algorithms", 2nd Ed.
 *  - Lahiri Ayanamsha: ~23.85° at J2000.0
 *  - CosineKitty astronomy-engine: https://github.com/cosinekitty/astronomy
 */

import { RASHIS } from './gunMilanService';

// ─────────────────────────────────────────────────────────────
// 1. MAHARASHTRA CITY COORDINATES (lat, lng)
//    Used for Lagna calculation when user provides place of birth
// ─────────────────────────────────────────────────────────────

const CITY_COORDINATES = {
  // Major cities
  'mumbai':       { lat: 19.0760, lng: 72.8777 },
  'pune':         { lat: 18.5204, lng: 73.8567 },
  'nagpur':       { lat: 21.1458, lng: 79.0882 },
  'nashik':       { lat: 19.9975, lng: 73.7898 },
  'aurangabad':   { lat: 19.8762, lng: 75.3433 },
  'solapur':      { lat: 17.6599, lng: 75.9064 },
  'kolhapur':     { lat: 16.7050, lng: 74.2433 },
  'sangli':       { lat: 16.8524, lng: 74.5815 },
  'satara':       { lat: 17.6805, lng: 74.0183 },
  'thane':        { lat: 19.2183, lng: 72.9781 },
  'navi mumbai':  { lat: 19.0330, lng: 73.0297 },
  'kalyan':       { lat: 19.2437, lng: 73.1355 },
  'ratnagiri':    { lat: 16.9944, lng: 73.3000 },
  'latur':        { lat: 18.4088, lng: 76.5604 },
  'ahmednagar':   { lat: 19.0948, lng: 74.7480 },
  'jalgaon':      { lat: 21.0077, lng: 75.5626 },
  'amravati':     { lat: 20.9320, lng: 77.7523 },
  'akola':        { lat: 20.7069, lng: 77.0022 },
  'nanded':       { lat: 19.1383, lng: 77.3210 },
  'parbhani':     { lat: 19.2607, lng: 76.7748 },
  'beed':         { lat: 18.9892, lng: 75.7601 },
  'osmanabad':    { lat: 18.1860, lng: 76.0450 },
  'hingoli':      { lat: 19.7173, lng: 77.1517 },
  'washim':       { lat: 20.1120, lng: 77.1515 },
  'buldhana':     { lat: 20.5290, lng: 76.1840 },
  'yavatmal':     { lat: 20.3888, lng: 78.1204 },
  'chandrapur':   { lat: 19.9615, lng: 79.2961 },
  'wardha':       { lat: 20.7453, lng: 78.6022 },
  'gondia':       { lat: 21.4604, lng: 80.1920 },
  'bhandara':     { lat: 21.1669, lng: 79.6508 },
  'gadchiroli':   { lat: 20.1835, lng: 80.0098 },
  'sindhudurg':   { lat: 16.3457, lng: 73.7557 },
  'raigad':       { lat: 18.5158, lng: 73.1822 },
  'palghar':      { lat: 19.6968, lng: 72.7651 },
  'dhule':        { lat: 20.9042, lng: 74.7749 },
  'nandurbar':    { lat: 21.3687, lng: 74.2371 },
  'jalna':        { lat: 19.8347, lng: 75.8816 },
  'sambhajinagar':{ lat: 19.8762, lng: 75.3433 }, // Aurangabad renamed
  'dharashiv':    { lat: 18.1860, lng: 76.0450 },  // Osmanabad renamed
  // Default fallback
  'default':      { lat: 18.5204, lng: 73.8567 },  // Pune
};

/**
 * Look up coordinates for a place name.
 * Does fuzzy matching (lowercase, partial match).
 */
export function getCoordinatesForPlace(placeName) {
  if (!placeName) return CITY_COORDINATES['default'];
  
  const normalized = placeName.toLowerCase().trim();
  
  // Exact match
  if (CITY_COORDINATES[normalized]) return CITY_COORDINATES[normalized];
  
  // Partial match — find first city whose name is contained in the input
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (city !== 'default' && (normalized.includes(city) || city.includes(normalized))) {
      return coords;
    }
  }
  
  // Default to Pune (central Maharashtra)
  return CITY_COORDINATES['default'];
}

// ─────────────────────────────────────────────────────────────
// 2. LAHIRI AYANAMSHA (same formula as gunMilanService.js)
// ─────────────────────────────────────────────────────────────

function getLahiriAyanamsha(jd) {
  const t = (jd - 2451545.0) / 36525;
  return 23.8528 + t * 0.013611 * 100;
}

// ─────────────────────────────────────────────────────────────
// 3. JULIAN DAY CALCULATION
// ─────────────────────────────────────────────────────────────

function getJulianDay(dateStr, timeStr, coords) {
  const [y, m, d] = dateStr.split('-').map(Number);
  
  // Default: noon IST if no time provided
  let hourUTC = 6.5; // 12:00 IST = 06:30 UTC
  
  if (timeStr) {
    const [h, min] = timeStr.split(':').map(Number);
    // Convert IST to UTC: subtract 5h30m
    hourUTC = h + min / 60 - 5.5;
    if (hourUTC < 0) hourUTC += 24;
  }
  
  let Y = y, M = m;
  if (M <= 2) { Y -= 1; M += 12; }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d + hourUTC / 24 + B - 1524.5;
}

// ─────────────────────────────────────────────────────────────
// 4. PLANET NAMES & SYMBOLS (Vedic)
// ─────────────────────────────────────────────────────────────

export const VEDIC_PLANETS = [
  { id: 'Sun',     en: 'Sun',     mr: 'सूर्य',   abbr: 'Su', abbrMr: 'सू',  nature: 'malefic' },
  { id: 'Moon',    en: 'Moon',    mr: 'चंद्र',   abbr: 'Mo', abbrMr: 'चं',  nature: 'benefic' },
  { id: 'Mars',    en: 'Mars',    mr: 'मंगळ',    abbr: 'Ma', abbrMr: 'मं',  nature: 'malefic' },
  { id: 'Mercury', en: 'Mercury', mr: 'बुध',     abbr: 'Me', abbrMr: 'बु',  nature: 'neutral' },
  { id: 'Jupiter', en: 'Jupiter', mr: 'गुरू',    abbr: 'Ju', abbrMr: 'गु',  nature: 'benefic' },
  { id: 'Venus',   en: 'Venus',   mr: 'शुक्र',   abbr: 'Ve', abbrMr: 'शु',  nature: 'benefic' },
  { id: 'Saturn',  en: 'Saturn',  mr: 'शनि',     abbr: 'Sa', abbrMr: 'श',   nature: 'malefic' },
  { id: 'Rahu',    en: 'Rahu',    mr: 'राहु',    abbr: 'Ra', abbrMr: 'रा',  nature: 'malefic' },
  { id: 'Ketu',    en: 'Ketu',    mr: 'केतू',    abbr: 'Ke', abbrMr: 'के',  nature: 'malefic' },
];

// ─────────────────────────────────────────────────────────────
// 5. MAIN: CALCULATE FULL KUNDALI
// ─────────────────────────────────────────────────────────────

/**
 * Calculate the full Janma Kundali with all planet positions.
 * Uses dynamic import of astronomy-engine for lazy loading.
 *
 * @param {string} dob        - "YYYY-MM-DD"
 * @param {string} [timeStr]  - "HH:MM" 24h format (IST)
 * @param {string} [place]    - City name (for coordinates)
 * @returns {object} Full kundali data
 */
export async function calculateFullKundali(dob, timeStr, place) {
  // Dynamically import astronomy-engine (lazy load ~150KB)
  const Astronomy = await import('astronomy-engine');

  const coords = getCoordinatesForPlace(place);
  const jd = getJulianDay(dob, timeStr, coords);
  const ayanamsha = getLahiriAyanamsha(jd);

  // Build Date object in UTC for astronomy-engine
  const [y, m, d] = dob.split('-').map(Number);
  let hourUTC = 6.5;
  if (timeStr) {
    const [h, min] = timeStr.split(':').map(Number);
    hourUTC = h + min / 60 - 5.5;
    if (hourUTC < 0) hourUTC += 24;
  }
  const utcDate = new Date(Date.UTC(y, m - 1, d, Math.floor(hourUTC), Math.round((hourUTC % 1) * 60)));
  const astroTime = Astronomy.MakeTime(utcDate);

  // ── Calculate tropical ecliptic longitudes for all planets ──
  const planetBodies = [
    { id: 'Sun',     body: Astronomy.Body.Sun },
    { id: 'Moon',    body: Astronomy.Body.Moon },
    { id: 'Mars',    body: Astronomy.Body.Mars },
    { id: 'Mercury', body: Astronomy.Body.Mercury },
    { id: 'Jupiter', body: Astronomy.Body.Jupiter },
    { id: 'Venus',   body: Astronomy.Body.Venus },
    { id: 'Saturn',  body: Astronomy.Body.Saturn },
  ];

  const planetPositions = [];

  for (const { id, body } of planetBodies) {
    let tropicalLon;
    if (id === 'Moon') {
      // For Moon, use GeoMoon for geocentric position
      const moonVec = Astronomy.GeoMoon(astroTime);
      const ecliptic = Astronomy.Ecliptic(moonVec);
      tropicalLon = ecliptic.elon;
    } else if (id === 'Sun') {
      // For Sun, use SunPosition
      const sunPos = Astronomy.SunPosition(astroTime);
      tropicalLon = sunPos.elon;
    } else {
      // For other planets, use EclipticLongitude
      tropicalLon = Astronomy.EclipticLongitude(body, astroTime);
    }

    let siderealLon = tropicalLon - ayanamsha;
    if (siderealLon < 0) siderealLon += 360;
    if (siderealLon >= 360) siderealLon -= 360;

    const rashiIndex = Math.floor(siderealLon / 30);
    const degInRashi = siderealLon % 30;

    const planetInfo = VEDIC_PLANETS.find(p => p.id === id);

    planetPositions.push({
      id,
      ...planetInfo,
      tropicalLon,
      siderealLon,
      rashiIndex,
      rashi: RASHIS[rashiIndex],
      degInRashi: degInRashi.toFixed(2),
      isRetrograde: false, // Could be computed but not critical for chart display
    });
  }

  // ── Calculate Rahu & Ketu (Moon's Nodes) ──
  // Rahu = True North Node of the Moon (always retrograde in Vedic)
  // astronomy-engine provides MoonNodeAscending but we use a simpler approach:
  // The Moon's node can be calculated from the Moon's orbital elements.
  // We'll use the simplified formula from Meeus.
  const T = (jd - 2451545.0) / 36525;
  let rahuTropical = 125.0445479 - 1934.1362608 * T + 0.0020754 * T * T + T * T * T / 467441;
  rahuTropical = ((rahuTropical % 360) + 360) % 360;
  
  let rahuSidereal = rahuTropical - ayanamsha;
  if (rahuSidereal < 0) rahuSidereal += 360;
  if (rahuSidereal >= 360) rahuSidereal -= 360;

  let ketuSidereal = (rahuSidereal + 180) % 360;

  const rahuInfo = VEDIC_PLANETS.find(p => p.id === 'Rahu');
  const ketuInfo = VEDIC_PLANETS.find(p => p.id === 'Ketu');

  planetPositions.push({
    id: 'Rahu',
    ...rahuInfo,
    tropicalLon: rahuTropical,
    siderealLon: rahuSidereal,
    rashiIndex: Math.floor(rahuSidereal / 30),
    rashi: RASHIS[Math.floor(rahuSidereal / 30)],
    degInRashi: (rahuSidereal % 30).toFixed(2),
    isRetrograde: true,
  });

  planetPositions.push({
    id: 'Ketu',
    ...ketuInfo,
    tropicalLon: (rahuTropical + 180) % 360,
    siderealLon: ketuSidereal,
    rashiIndex: Math.floor(ketuSidereal / 30),
    rashi: RASHIS[Math.floor(ketuSidereal / 30)],
    degInRashi: (ketuSidereal % 30).toFixed(2),
    isRetrograde: true,
  });

  // ── Calculate Lagna (Ascendant) ──
  let lagnaIndex = null;
  let lagnaLon = null;
  let chartType = 'chandra'; // default: Moon-based chart

  if (timeStr && place) {
    // Lagna calculation using Local Sidereal Time
    lagnaLon = calculateLagna(jd, coords.lat, coords.lng, ayanamsha);
    lagnaIndex = Math.floor(lagnaLon / 30);
    chartType = 'lagna';
  }

  // ── Build house map (which planets are in which house) ──
  // House 1 = Lagna rashi (or Moon's rashi if no Lagna)
  const referenceRashi = chartType === 'lagna' ? lagnaIndex : planetPositions.find(p => p.id === 'Moon').rashiIndex;
  
  const houses = Array.from({ length: 12 }, (_, i) => ({
    houseNumber: i + 1,
    rashiIndex: (referenceRashi + i) % 12,
    rashi: RASHIS[(referenceRashi + i) % 12],
    planets: [],
  }));

  // Place planets in houses
  for (const planet of planetPositions) {
    const houseIndex = ((planet.rashiIndex - referenceRashi + 12) % 12);
    houses[houseIndex].planets.push(planet);
  }

  return {
    dob,
    timeOfBirth: timeStr || null,
    placeOfBirth: place || null,
    coordinates: coords,
    ayanamsha: ayanamsha.toFixed(4),
    chartType, // 'lagna' or 'chandra'
    lagnaIndex,
    lagnaLon: lagnaLon ? lagnaLon.toFixed(2) : null,
    lagnaRashi: lagnaIndex !== null ? RASHIS[lagnaIndex] : null,
    referenceRashi,
    planets: planetPositions,
    houses,
  };
}

// ─────────────────────────────────────────────────────────────
// 6. LAGNA (ASCENDANT) CALCULATION
//    Uses Local Sidereal Time → Ascendant sign
// ─────────────────────────────────────────────────────────────

function calculateLagna(jd, latitude, longitude, ayanamsha) {
  // Calculate Local Sidereal Time (LST)
  const T = (jd - 2451545.0) / 36525;
  
  // Greenwich Mean Sidereal Time (GMST) in degrees
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
  gmst = ((gmst % 360) + 360) % 360;
  
  // Local Sidereal Time
  let lst = gmst + longitude;
  lst = ((lst % 360) + 360) % 360;
  
  // Convert LST to radians for RAMC (Right Ascension of Midheaven)
  const ramcRad = lst * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;
  
  // Obliquity of the ecliptic
  const epsilon = 23.4393 - 0.0130 * T;
  const epsRad = epsilon * Math.PI / 180;
  
  // Ascendant (tropical) using the standard formula:
  // tan(Asc) = cos(RAMC) / [-(sin(eps) * tan(lat) + cos(eps) * sin(RAMC))]
  const y = Math.cos(ramcRad);
  const x = -(Math.sin(epsRad) * Math.tan(latRad) + Math.cos(epsRad) * Math.sin(ramcRad));
  
  let ascTropical = Math.atan2(y, x) * 180 / Math.PI;
  ascTropical = ((ascTropical % 360) + 360) % 360;
  
  // Convert to sidereal
  let ascSidereal = ascTropical - ayanamsha;
  if (ascSidereal < 0) ascSidereal += 360;
  if (ascSidereal >= 360) ascSidereal -= 360;
  
  return ascSidereal;
}

// ─────────────────────────────────────────────────────────────
// 7. EXPORT: LIST OF AVAILABLE CITIES
// ─────────────────────────────────────────────────────────────

export const MAHARASHTRA_CITIES = Object.keys(CITY_COORDINATES)
  .filter(c => c !== 'default')
  .map(c => c.charAt(0).toUpperCase() + c.slice(1));
