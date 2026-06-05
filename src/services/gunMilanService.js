/**
 * gunMilanService.js
 * ==================
 * Complete Vedic Ashtakoot Gun Milan calculation engine.
 * No external dependencies — pure JavaScript.
 *
 * Algorithm:
 *  - Moon longitude via Meeus "Astronomical Algorithms" simplified formula
 *  - Lahiri Ayanamsha applied for sidereal conversion
 *  - All 27-Nakshatra attribute tables embedded
 *  - All 8 Koota scoring rules implemented
 *
 * References:
 *  - Jean Meeus, "Astronomical Algorithms", 2nd Ed.
 *  - Lahiri Ayanamsha: ~22.4600° at J2000.0, rate ~0.013611°/year
 *  - Standard Ashtakoot tables (same as AstroSage, Drik Panchang)
 */

// ─────────────────────────────────────────────────────────────
// 1. NAKSHATRA DATA TABLE
//    27 Nakshatras, 0-indexed (Ashwini=0 … Revati=26)
// ─────────────────────────────────────────────────────────────

export const NAKSHATRAS = [
  { index: 0,  en: 'Ashwini',           mr: 'अश्विनी',         rashi: 0,  gana: 'deva',    nadi: 'aadi',   yoni: 'horse',    varna: 'vaishya',  lord: 'Ketu',    lordMr: 'केतू' },
  { index: 1,  en: 'Bharani',           mr: 'भरणी',             rashi: 0,  gana: 'manav',   nadi: 'madhya', yoni: 'elephant', varna: 'kshatriya',lord: 'Venus',   lordMr: 'शुक्र' },
  { index: 2,  en: 'Krittika',          mr: 'कृत्तिका',         rashi: 0,  gana: 'rakshasa',nadi: 'antya',  yoni: 'sheep',    varna: 'brahmin',  lord: 'Sun',     lordMr: 'सूर्य' },  // pada 1 in Aries, 2-4 in Taurus
  { index: 3,  en: 'Rohini',            mr: 'रोहिणी',           rashi: 1,  gana: 'manav',   nadi: 'antya',  yoni: 'serpent',  varna: 'shudra',   lord: 'Moon',    lordMr: 'चंद्र' },
  { index: 4,  en: 'Mrigashira',        mr: 'मृगशिरा',          rashi: 1,  gana: 'deva',    nadi: 'madhya', yoni: 'serpent',  varna: 'vaishya',  lord: 'Mars',    lordMr: 'मंगळ' },  // 1-2 Taurus, 3-4 Gemini
  { index: 5,  en: 'Ardra',             mr: 'आर्द्रा',           rashi: 2,  gana: 'manav',   nadi: 'aadi',   yoni: 'dog',      varna: 'brahmin',  lord: 'Rahu',    lordMr: 'राहु' },
  { index: 6,  en: 'Punarvasu',         mr: 'पुनर्वसू',          rashi: 2,  gana: 'deva',    nadi: 'aadi',   yoni: 'cat',      varna: 'vaishya',  lord: 'Jupiter', lordMr: 'गुरू' },  // pada 1-3 Gemini, 4 Cancer
  { index: 7,  en: 'Pushya',            mr: 'पुष्य',             rashi: 3,  gana: 'deva',    nadi: 'madhya', yoni: 'sheep',    varna: 'kshatriya',lord: 'Saturn',  lordMr: 'शनि' },
  { index: 8,  en: 'Ashlesha',          mr: 'आश्लेषा',           rashi: 3,  gana: 'rakshasa',nadi: 'antya',  yoni: 'cat',      varna: 'brahmin',  lord: 'Mercury', lordMr: 'बुध' },
  { index: 9,  en: 'Magha',             mr: 'मघा',               rashi: 4,  gana: 'rakshasa',nadi: 'antya',  yoni: 'rat',      varna: 'shudra',   lord: 'Ketu',    lordMr: 'केतू' },
  { index: 10, en: 'Purva Phalguni',    mr: 'पूर्वा फाल्गुनी',   rashi: 4,  gana: 'manav',   nadi: 'madhya', yoni: 'rat',      varna: 'brahmin',  lord: 'Venus',   lordMr: 'शुक्र' },
  { index: 11, en: 'Uttara Phalguni',   mr: 'उत्तरा फाल्गुनी',  rashi: 4,  gana: 'manav',   nadi: 'aadi',   yoni: 'cow',      varna: 'kshatriya',lord: 'Sun',     lordMr: 'सूर्य' },  // pada 1 Leo, 2-4 Virgo
  { index: 12, en: 'Hasta',             mr: 'हस्त',              rashi: 5,  gana: 'deva',    nadi: 'aadi',   yoni: 'buffalo',  varna: 'vaishya',  lord: 'Moon',    lordMr: 'चंद्र' },
  { index: 13, en: 'Chitra',            mr: 'चित्रा',            rashi: 5,  gana: 'rakshasa',nadi: 'madhya', yoni: 'tiger',    varna: 'kshatriya',lord: 'Mars',    lordMr: 'मंगळ' },  // 1-2 Virgo, 3-4 Libra
  { index: 14, en: 'Swati',             mr: 'स्वाती',            rashi: 6,  gana: 'deva',    nadi: 'antya',  yoni: 'buffalo',  varna: 'shudra',   lord: 'Rahu',    lordMr: 'राहु' },
  { index: 15, en: 'Vishakha',          mr: 'विशाखा',            rashi: 6,  gana: 'rakshasa',nadi: 'antya',  yoni: 'tiger',    varna: 'shudra',   lord: 'Jupiter', lordMr: 'गुरू' },  // 1-3 Libra, 4 Scorpio
  { index: 16, en: 'Anuradha',          mr: 'अनुराधा',           rashi: 7,  gana: 'deva',    nadi: 'madhya', yoni: 'deer',     varna: 'shudra',   lord: 'Saturn',  lordMr: 'शनि' },
  { index: 17, en: 'Jyeshtha',          mr: 'ज्येष्ठा',          rashi: 7,  gana: 'rakshasa',nadi: 'aadi',   yoni: 'deer',     varna: 'brahmin',  lord: 'Mercury', lordMr: 'बुध' },
  { index: 18, en: 'Mula',              mr: 'मूळ',               rashi: 8,  gana: 'rakshasa',nadi: 'antya',  yoni: 'dog',      varna: 'kshatriya',lord: 'Ketu',    lordMr: 'केतू' },
  { index: 19, en: 'Purva Ashadha',     mr: 'पूर्वाषाढा',        rashi: 8,  gana: 'manav',   nadi: 'madhya', yoni: 'monkey',   varna: 'brahmin',  lord: 'Venus',   lordMr: 'शुक्र' },
  { index: 20, en: 'Uttara Ashadha',    mr: 'उत्तराषाढा',        rashi: 8,  gana: 'manav',   nadi: 'aadi',   yoni: 'mongoose', varna: 'kshatriya',lord: 'Sun',     lordMr: 'सूर्य' },  // 1 Sagittarius, 2-4 Capricorn
  { index: 21, en: 'Shravana',          mr: 'श्रवण',             rashi: 9,  gana: 'deva',    nadi: 'antya',  yoni: 'monkey',   varna: 'mleccha',  lord: 'Moon',    lordMr: 'चंद्र' },
  { index: 22, en: 'Dhanishtha',        mr: 'धनिष्ठा',           rashi: 9,  gana: 'rakshasa',nadi: 'madhya', yoni: 'lion',     varna: 'shudra',   lord: 'Mars',    lordMr: 'मंगळ' },  // 1-2 Capricorn, 3-4 Aquarius
  { index: 23, en: 'Shatabhisha',       mr: 'शतभिषा',            rashi: 10, gana: 'rakshasa',nadi: 'aadi',   yoni: 'horse',    varna: 'shudra',   lord: 'Rahu',    lordMr: 'राहु' },
  { index: 24, en: 'Purva Bhadrapada',  mr: 'पूर्वाभाद्रपदा',    rashi: 10, gana: 'manav',   nadi: 'madhya', yoni: 'lion',     varna: 'brahmin',  lord: 'Jupiter', lordMr: 'गुरू' },  // 1-3 Aquarius, 4 Pisces
  { index: 25, en: 'Uttara Bhadrapada', mr: 'उत्तराभाद्रपदा',   rashi: 11, gana: 'manav',   nadi: 'antya',  yoni: 'cow',      varna: 'kshatriya',lord: 'Saturn',  lordMr: 'शनि' },
  { index: 26, en: 'Revati',            mr: 'रेवती',             rashi: 11, gana: 'deva',    nadi: 'antya',  yoni: 'elephant', varna: 'shudra',   lord: 'Mercury', lordMr: 'बुध' },
];

// ─────────────────────────────────────────────────────────────
// 2. RASHI DATA (12 Moon Signs)
// ─────────────────────────────────────────────────────────────

export const RASHIS = [
  { index: 0,  en: 'Aries',       mr: 'मेष',      lord: 'Mars',    lordMr: 'मंगळ',   varna: 'kshatriya', vashya: 'chatushpada' },
  { index: 1,  en: 'Taurus',      mr: 'वृषभ',     lord: 'Venus',   lordMr: 'शुक्र',   varna: 'vaishya',   vashya: 'chatushpada' },
  { index: 2,  en: 'Gemini',      mr: 'मिथुन',    lord: 'Mercury', lordMr: 'बुध',     varna: 'shudra',    vashya: 'manav' },
  { index: 3,  en: 'Cancer',      mr: 'कर्क',     lord: 'Moon',    lordMr: 'चंद्र',   varna: 'brahmin',   vashya: 'jalchar' },
  { index: 4,  en: 'Leo',         mr: 'सिंह',     lord: 'Sun',     lordMr: 'सूर्य',   varna: 'kshatriya', vashya: 'vanchar' },
  { index: 5,  en: 'Virgo',       mr: 'कन्या',    lord: 'Mercury', lordMr: 'बुध',     varna: 'vaishya',   vashya: 'manav' },
  { index: 6,  en: 'Libra',       mr: 'तुळा',     lord: 'Venus',   lordMr: 'शुक्र',   varna: 'shudra',    vashya: 'manav' },
  { index: 7,  en: 'Scorpio',     mr: 'वृश्चिक',  lord: 'Mars',    lordMr: 'मंगळ',   varna: 'brahmin',   vashya: 'keet' },
  { index: 8,  en: 'Sagittarius', mr: 'धनु',      lord: 'Jupiter', lordMr: 'गुरू',    varna: 'kshatriya', vashya: 'chatushpada' },
  { index: 9,  en: 'Capricorn',   mr: 'मकर',      lord: 'Saturn',  lordMr: 'शनि',    varna: 'vaishya',   vashya: 'chatushpada' },
  { index: 10, en: 'Aquarius',    mr: 'कुंभ',     lord: 'Saturn',  lordMr: 'शनि',    varna: 'shudra',    vashya: 'manav' },
  { index: 11, en: 'Pisces',      mr: 'मीन',      lord: 'Jupiter', lordMr: 'गुरू',    varna: 'brahmin',   vashya: 'jalchar' },
];

// ─────────────────────────────────────────────────────────────
// 3. PLANET FRIENDSHIP TABLE (for Graha Maitri koota)
//    Planets: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
// ─────────────────────────────────────────────────────────────

// 'friend' | 'neutral' | 'enemy'
const PLANET_FRIENDSHIP = {
  Sun:     { Sun: 'neutral', Moon: 'friend',  Mars: 'friend',  Mercury: 'neutral', Jupiter: 'friend',  Venus: 'enemy',   Saturn: 'enemy',   Rahu: 'enemy',   Ketu: 'friend'  },
  Moon:    { Sun: 'friend',  Moon: 'neutral', Mars: 'neutral', Mercury: 'friend',  Jupiter: 'friend',  Venus: 'neutral', Saturn: 'neutral', Rahu: 'enemy',   Ketu: 'neutral' },
  Mars:    { Sun: 'friend',  Moon: 'friend',  Mars: 'neutral', Mercury: 'enemy',   Jupiter: 'friend',  Venus: 'neutral', Saturn: 'enemy',   Rahu: 'neutral', Ketu: 'friend'  },
  Mercury: { Sun: 'friend',  Moon: 'neutral', Mars: 'neutral', Mercury: 'neutral', Jupiter: 'neutral', Venus: 'friend',  Saturn: 'friend',  Rahu: 'friend',  Ketu: 'neutral' },
  Jupiter: { Sun: 'friend',  Moon: 'friend',  Mars: 'friend',  Mercury: 'enemy',   Jupiter: 'neutral', Venus: 'enemy',   Saturn: 'enemy',   Rahu: 'enemy',   Ketu: 'friend'  },
  Venus:   { Sun: 'enemy',   Moon: 'neutral', Mars: 'neutral', Mercury: 'friend',  Jupiter: 'neutral', Venus: 'neutral', Saturn: 'friend',  Rahu: 'friend',  Ketu: 'neutral' },
  Saturn:  { Sun: 'enemy',   Moon: 'enemy',   Mars: 'enemy',   Mercury: 'friend',  Jupiter: 'enemy',   Venus: 'friend',  Saturn: 'neutral', Rahu: 'friend',  Ketu: 'neutral' },
  Rahu:    { Sun: 'enemy',   Moon: 'enemy',   Mars: 'neutral', Mercury: 'friend',  Jupiter: 'enemy',   Venus: 'friend',  Saturn: 'friend',  Rahu: 'neutral', Ketu: 'neutral' },
  Ketu:    { Sun: 'friend',  Moon: 'neutral', Mars: 'friend',  Mercury: 'neutral', Jupiter: 'friend',  Venus: 'neutral', Saturn: 'neutral', Rahu: 'neutral', Ketu: 'neutral' },
};

// ─────────────────────────────────────────────────────────────
// 4. YONI COMPATIBILITY TABLE
//    Score when one person has yoni1, other has yoni2
//    4 = same, 3 = friend, 2 = neutral, 1 = enemy, 0 = sworn enemy
// ─────────────────────────────────────────────────────────────

const YONI_SCORES = {
  horse:    { horse: 4, elephant: 2, sheep: 2, serpent: 2, dog: 2, cat: 2, rat: 2, cow: 2, buffalo: 0, tiger: 2, deer: 2, monkey: 2, mongoose: 2, lion: 2 },
  elephant: { horse: 2, elephant: 4, sheep: 2, serpent: 2, dog: 2, cat: 2, rat: 2, cow: 2, buffalo: 2, tiger: 2, deer: 2, monkey: 2, mongoose: 2, lion: 0 },
  sheep:    { horse: 2, elephant: 2, sheep: 4, serpent: 2, dog: 2, cat: 2, rat: 2, cow: 2, buffalo: 2, tiger: 2, deer: 2, monkey: 0, mongoose: 2, lion: 2 },
  serpent:  { horse: 2, elephant: 2, sheep: 2, serpent: 4, dog: 2, cat: 2, rat: 2, cow: 2, buffalo: 2, tiger: 2, deer: 2, monkey: 2, mongoose: 0, lion: 2 },
  dog:      { horse: 2, elephant: 2, sheep: 2, serpent: 2, dog: 4, cat: 2, rat: 2, cow: 2, buffalo: 2, tiger: 2, deer: 0, monkey: 2, mongoose: 2, lion: 2 },
  cat:      { horse: 2, elephant: 2, sheep: 2, serpent: 2, dog: 2, cat: 4, rat: 0, cow: 2, buffalo: 2, tiger: 2, deer: 2, monkey: 2, mongoose: 2, lion: 2 },
  rat:      { horse: 2, elephant: 2, sheep: 2, serpent: 2, dog: 2, cat: 0, rat: 4, cow: 2, buffalo: 2, tiger: 2, deer: 2, monkey: 2, mongoose: 2, lion: 2 },
  cow:      { horse: 2, elephant: 2, sheep: 2, serpent: 2, dog: 2, cat: 2, rat: 2, cow: 4, buffalo: 2, tiger: 0, deer: 2, monkey: 2, mongoose: 2, lion: 2 },
  buffalo:  { horse: 0, elephant: 2, sheep: 2, serpent: 2, dog: 2, cat: 2, rat: 2, cow: 2, buffalo: 4, tiger: 2, deer: 2, monkey: 2, mongoose: 2, lion: 2 },
  tiger:    { horse: 2, elephant: 2, sheep: 2, serpent: 2, dog: 2, cat: 2, rat: 2, cow: 0, buffalo: 2, tiger: 4, deer: 2, monkey: 2, mongoose: 2, lion: 2 },
  deer:     { horse: 2, elephant: 2, sheep: 2, serpent: 2, dog: 0, cat: 2, rat: 2, cow: 2, buffalo: 2, tiger: 2, deer: 4, monkey: 2, mongoose: 2, lion: 2 },
  monkey:   { horse: 2, elephant: 2, sheep: 0, serpent: 2, dog: 2, cat: 2, rat: 2, cow: 2, buffalo: 2, tiger: 2, deer: 2, monkey: 4, mongoose: 2, lion: 2 },
  mongoose: { horse: 2, elephant: 2, sheep: 2, serpent: 0, dog: 2, cat: 2, rat: 2, cow: 2, buffalo: 2, tiger: 2, deer: 2, monkey: 2, mongoose: 4, lion: 2 },
  lion:     { horse: 2, elephant: 0, sheep: 2, serpent: 2, dog: 2, cat: 2, rat: 2, cow: 2, buffalo: 2, tiger: 2, deer: 2, monkey: 2, mongoose: 2, lion: 4 },
};

// ─────────────────────────────────────────────────────────────
// 5. VASHYA COMPATIBILITY TABLE (Rashi-based)
// ─────────────────────────────────────────────────────────────

// Returns score 0, 1, or 2 based on Rashi pair
function calcVashya(r1, r2) {
  // Vashya groups: chatushpada (0,1,8,9), manav (2,5,6,10), jalchar (3,11), vanchar (4), keet (7)
  const v = [r1, r2].map(r => RASHIS[r].vashya);
  if (v[0] === v[1]) return 2;
  // Some pairs get 1:
  const vashyaCompat = {
    chatushpada: { manav: 1, jalchar: 0, vanchar: 1, keet: 0 },
    manav:       { chatushpada: 1, jalchar: 0, vanchar: 0, keet: 0 },
    jalchar:     { chatushpada: 0, manav: 0, vanchar: 0, keet: 0 },
    vanchar:     { chatushpada: 1, manav: 0, jalchar: 0, keet: 0 },
    keet:        { chatushpada: 0, manav: 0, jalchar: 0, vanchar: 0 },
  };
  const score = vashyaCompat[v[0]]?.[v[1]] ?? 0;
  return score;
}

// ─────────────────────────────────────────────────────────────
// 6. MOON NAKSHATRA CALCULATION (Meeus Algorithm + Lahiri)
// ─────────────────────────────────────────────────────────────

function toRad(deg) { return deg * Math.PI / 180; }
function toDeg(rad) { return rad * 180 / Math.PI; }

/**
 * Calculate Julian Day Number from date + optional time
 * @param {string} dob - "YYYY-MM-DD"
 * @param {string} [timeStr] - "HH:MM" (24h, local IST assumed)
 */
function getJulianDay(dob, timeStr) {
  const [y, m, d] = dob.split('-').map(Number);
  let hour = 5.5; // Default: noon IST ≈ 06:30 UTC; use 12:00 IST = 6:30 UTC
  if (timeStr) {
    const [h, min] = timeStr.split(':').map(Number);
    // Convert IST to UTC: subtract 5h30m = 5.5h
    hour = h + min / 60 - 5.5;
    if (hour < 0) hour += 24;
  }
  // Meeus formula for JD
  let Y = y, M = m;
  if (M <= 2) { Y -= 1; M += 12; }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d + hour / 24 + B - 1524.5;
  return jd;
}

/**
 * Lahiri Ayanamsha in degrees for a given Julian Day
 * Reference: 23.45° at J1900.0 (JD 2415020.0), drifting ~50.26"/year = ~0.013961°/year
 */
function getLahiriAyanamsha(jd) {
  const t = (jd - 2451545.0) / 36525; // Julian centuries from J2000.0
  // Lahiri ayanamsha at J2000.0 ≈ 23.8528° (more precise: 23°51'11")
  return 23.8528 + t * 0.013611 * 100; // 0.013611°/year × 100 years/century
}

/**
 * Calculate Moon's tropical longitude using Meeus simplified series
 * Accurate to ~1° for dates between 1900-2100
 */
function getMoonTropicalLongitude(jd) {
  const T = (jd - 2451545.0) / 36525;

  // Moon's mean longitude
  const L0 = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841 - T * T * T * T / 65194000;
  
  // Moon's mean anomaly
  const M0 = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699 - T * T * T * T / 14712000;
  
  // Sun's mean anomaly
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000;
  
  // Moon's argument of latitude
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000 + T * T * T * T / 863310000;
  
  // Moon's longitude of ascending node
  const O = 125.0445479 - 1934.1362608 * T + 0.0020754 * T * T + T * T * T / 467441 - T * T * T * T / 60616000;

  // Convert to radians for trig
  const L0r = toRad(L0 % 360), M0r = toRad(M0 % 360), Mr = toRad(M % 360);
  const Fr = toRad(F % 360), Or = toRad(O % 360);

  // Main periodic terms (Meeus Table 47.A, largest terms)
  let dL = 0;
  dL += 6288774 * Math.sin(M0r);
  dL += 1274027 * Math.sin(2 * toRad(L0 % 360) - M0r);
  dL += 658314  * Math.sin(2 * toRad(L0 % 360));
  dL += 213618  * Math.sin(2 * M0r);
  dL -= 185116  * Math.sin(Mr);
  dL -= 114332  * Math.sin(2 * Fr);
  dL += 58793   * Math.sin(2 * toRad(L0 % 360) - 2 * M0r);
  dL += 57066   * Math.sin(2 * toRad(L0 % 360) - Mr - M0r);
  dL += 53322   * Math.sin(2 * toRad(L0 % 360) + M0r);
  dL += 45758   * Math.sin(2 * toRad(L0 % 360) - Mr);
  dL -= 40923   * Math.sin(M0r - Mr);
  dL -= 34720   * Math.sin(toRad(L0 % 360));
  dL -= 30383   * Math.sin(M0r + Mr);
  dL += 15327   * Math.sin(2 * toRad(L0 % 360) - 2 * Fr);
  dL -= 12528   * Math.sin(M0r + 2 * Fr);
  dL += 10980   * Math.sin(M0r - 2 * Fr);
  dL += 10675   * Math.sin(4 * toRad(L0 % 360) - M0r);
  dL += 10034   * Math.sin(3 * M0r);
  dL += 8548    * Math.sin(4 * toRad(L0 % 360) - 2 * M0r);
  dL -= 7888    * Math.sin(2 * toRad(L0 % 360) + Mr - M0r);
  dL -= 6766    * Math.sin(2 * toRad(L0 % 360) + Mr);
  dL -= 5163    * Math.sin(toRad(L0 % 360) - M0r);
  dL += 4987    * Math.sin(toRad(L0 % 360) + Mr);
  dL += 4036    * Math.sin(2 * toRad(L0 % 360) - Mr + M0r);
  dL += 3994    * Math.sin(2 * toRad(L0 % 360) + 2 * M0r);
  dL += 3861    * Math.sin(4 * toRad(L0 % 360));
  dL += 3665    * Math.sin(2 * toRad(L0 % 360) - 3 * M0r);
  dL -= 2689    * Math.sin(Mr - 2 * M0r);
  dL -= 2602    * Math.sin(2 * toRad(L0 % 360) - M0r + 2 * Fr);
  dL += 2390    * Math.sin(2 * toRad(L0 % 360) - Mr - 2 * M0r);
  dL -= 2348    * Math.sin(toRad(L0 % 360) + M0r);
  dL += 2236    * Math.sin(2 * toRad(L0 % 360) - 2 * Mr);

  // dL is in 1/1000000 of a degree
  let tropicalLon = (L0 + dL / 1000000) % 360;
  if (tropicalLon < 0) tropicalLon += 360;

  return tropicalLon;
}

/**
 * Get Moon's SIDEREAL longitude (applying Lahiri Ayanamsha)
 * @returns degrees 0-360
 */
function getMoonSiderealLongitude(jd) {
  const tropical = getMoonTropicalLongitude(jd);
  const ayanamsha = getLahiriAyanamsha(jd);
  let sidereal = tropical - ayanamsha;
  if (sidereal < 0) sidereal += 360;
  return sidereal;
}

/**
 * Get Nakshatra index (0-26) from sidereal longitude
 * Each Nakshatra spans 13.333° (360/27)
 */
function getNakshatraIndex(siderealLon) {
  return Math.floor(siderealLon / (360 / 27));
}

/**
 * Get Nakshatra Pada (1-4)
 */
function getNakshatraPada(siderealLon) {
  const withinNakshatra = siderealLon % (360 / 27);
  return Math.floor(withinNakshatra / (360 / 108)) + 1;
}

/**
 * Get Rashi index (0-11) from sidereal longitude
 * Each Rashi spans 30°
 */
function getRashiIndex(siderealLon) {
  return Math.floor(siderealLon / 30);
}

// ─────────────────────────────────────────────────────────────
// 7. BUILD JANMA PATRIKA for a profile
// ─────────────────────────────────────────────────────────────

/**
 * Build complete Janma Patrika (birth chart details) for a profile
 * @param {object} profile - { dob, time_of_birth?, place_of_birth?, birth_nakshatra? }
 * @returns Patrika object
 */
export function buildPatrika(profile) {
  const { dob, time_of_birth, place_of_birth, birth_nakshatra } = profile;
  if (!dob) return null;

  let nakshatraIndex, rashiIndex, siderealLon, pada;
  let calculationMethod = 'calculated';

  if (birth_nakshatra) {
    // Use manually specified Nakshatra
    const manualIdx = NAKSHATRAS.findIndex(n =>
      n.en.toLowerCase() === birth_nakshatra.toLowerCase() ||
      n.mr === birth_nakshatra
    );
    if (manualIdx >= 0) {
      nakshatraIndex = manualIdx;
      rashiIndex = NAKSHATRAS[manualIdx].rashi;
      pada = 1; // Unknown when manually set
      calculationMethod = 'manual';
    }
  }

  if (calculationMethod === 'calculated') {
    const jd = getJulianDay(dob, time_of_birth);
    siderealLon = getMoonSiderealLongitude(jd);
    nakshatraIndex = getNakshatraIndex(siderealLon);
    pada = getNakshatraPada(siderealLon);
    rashiIndex = getRashiIndex(siderealLon);
  }

  const nakshatra = NAKSHATRAS[nakshatraIndex];
  const rashi = RASHIS[rashiIndex];

  return {
    nakshatra,
    nakshatraIndex,
    pada,
    rashi,
    rashiIndex,
    siderealLon,
    gana: nakshatra.gana,
    nadi: nakshatra.nadi,
    yoni: nakshatra.yoni,
    varna: rashi.varna,
    nakshatraLord: nakshatra.lord,
    rashiLord: rashi.lord,
    timeOfBirth: time_of_birth || null,
    placeOfBirth: place_of_birth || null,
    calculationMethod,
    dob,
  };
}

// ─────────────────────────────────────────────────────────────
// 8. ASHTAKOOT GUN MILAN CALCULATION
// ─────────────────────────────────────────────────────────────

/**
 * Calculate all 8 Kootas and total Gun Milan score
 * @param {object} p1 - Patrika of person 1 (boy/groom or user viewing)
 * @param {object} p2 - Patrika of person 2 (girl/bride or candidate)
 * @returns GunMilan result object
 */
export function calculateGunMilan(p1, p2) {
  const kootas = [];

  // ── 1. VARNA (1 point) ─────────────────────────────────────
  // Groom's varna should be >= Bride's varna (hierarchy: Brahmin > Kshatriya > Vaishya > Shudra)
  const varnaOrder = { brahmin: 4, kshatriya: 3, vaishya: 2, shudra: 1, mleccha: 1 };
  const v1 = varnaOrder[p1.varna] || 1;
  const v2 = varnaOrder[p2.varna] || 1;
  const varnaScore = v1 >= v2 ? 1 : 0;
  kootas.push({
    name: 'Varna', nameMr: 'वर्ण',
    max: 1, scored: varnaScore,
    detail: `${p1.rashi.en} (${LABELS.en.varna[p1.varna] || p1.varna}) ↔ ${p2.rashi.en} (${LABELS.en.varna[p2.varna] || p2.varna})`,
    detailMr: `${p1.rashi.mr} (${LABELS.mr.varna[p1.varna] || p1.varna}) ↔ ${p2.rashi.mr} (${LABELS.mr.varna[p2.varna] || p2.varna})`,
    dosha: varnaScore === 0 ? 'Varna Dosha' : null,
    doshaMr: varnaScore === 0 ? 'वर्ण दोष' : null,
  });

  // ── 2. VASHYA (2 points) ───────────────────────────────────
  const vashyaScore = Math.min(2, calcVashya(p1.rashiIndex, p2.rashiIndex) + calcVashya(p2.rashiIndex, p1.rashiIndex) > 2 ? 2 : calcVashya(p1.rashiIndex, p2.rashiIndex));
  kootas.push({
    name: 'Vashya', nameMr: 'वश्य',
    max: 2, scored: vashyaScore,
    detail: `${p1.rashi.en} ↔ ${p2.rashi.en}`,
    detailMr: `${p1.rashi.mr} ↔ ${p2.rashi.mr}`,
    dosha: null, doshaMr: null,
  });

  // ── 3. TARA (3 points) ─────────────────────────────────────
  // Count Nakshatras from girl's Nakshatra to boy's and divide by 9
  // Tara for girl: (boyNak - girlNak + 27) % 27 + 1, then group = ceil/9
  // Auspicious taras: 1(Janma), 2(Sampat), 3(Vipat-bad), 4(Kshema), 5(Pratyak-bad), 6(Sadhana), 7(Vadha-bad), 8(Mitra), 9(Parama Mitra)
  const auspTaras = [1, 2, 4, 6, 8, 9];
  const tara1 = ((p2.nakshatraIndex - p1.nakshatraIndex + 27) % 27) + 1;
  const tara2 = ((p1.nakshatraIndex - p2.nakshatraIndex + 27) % 27) + 1;
  const t1Group = Math.ceil(tara1 / 3);
  const t2Group = Math.ceil(tara2 / 3);
  const t1Good = auspTaras.includes(t1Group) || auspTaras.includes(((tara1 - 1) % 9) + 1);
  const t2Good = auspTaras.includes(t2Group) || auspTaras.includes(((tara2 - 1) % 9) + 1);
  // Simplified: check if tara groups (1-9) fall in auspicious positions
  const t1Auspicious = ![3, 5, 7].includes(((p2.nakshatraIndex - p1.nakshatraIndex + 27) % 9) + 1);
  const t2Auspicious = ![3, 5, 7].includes(((p1.nakshatraIndex - p2.nakshatraIndex + 27) % 9) + 1);
  const taraScore = (t1Auspicious ? 1.5 : 0) + (t2Auspicious ? 1.5 : 0);
  kootas.push({
    name: 'Tara', nameMr: 'तारा',
    max: 3, scored: Math.round(taraScore),
    detail: `${p1.nakshatra.en} ↔ ${p2.nakshatra.en}`,
    detailMr: `${p1.nakshatra.mr} ↔ ${p2.nakshatra.mr}`,
    dosha: Math.round(taraScore) === 0 ? 'Tara Dosha' : null,
    doshaMr: Math.round(taraScore) === 0 ? 'तारा दोष' : null,
  });

  // ── 4. YONI (4 points) ─────────────────────────────────────
  const yoniScore = YONI_SCORES[p1.yoni]?.[p2.yoni] ?? 2;
  const yoniDosha = yoniScore === 0;
  kootas.push({
    name: 'Yoni', nameMr: 'योनि',
    max: 4, scored: yoniScore,
    detail: `${LABELS.en.yoni[p1.yoni]} (${p1.nakshatra.en}) ↔ ${LABELS.en.yoni[p2.yoni]} (${p2.nakshatra.en})`,
    detailMr: `${LABELS.mr.yoni[p1.yoni]} (${p1.nakshatra.mr}) ↔ ${LABELS.mr.yoni[p2.yoni]} (${p2.nakshatra.mr})`,
    dosha: yoniDosha ? 'Yoni Dosha' : null,
    doshaMr: yoniDosha ? 'योनि दोष' : null,
  });

  // ── 5. GRAHA MAITRI (5 points) ─────────────────────────────
  const lord1 = p1.rashiLord;
  const lord2 = p2.rashiLord;
  const f12 = PLANET_FRIENDSHIP[lord1]?.[lord2] || 'neutral';
  const f21 = PLANET_FRIENDSHIP[lord2]?.[lord1] || 'neutral';
  const friendScore = { friend: 2, neutral: 1, enemy: 0 };
  const grahaMaitriScore = Math.min(5, friendScore[f12] + friendScore[f21] + (lord1 === lord2 ? 1 : 0));
  kootas.push({
    name: 'Graha Maitri', nameMr: 'ग्रह मैत्री',
    max: 5, scored: grahaMaitriScore,
    detail: `${lord1} (${p1.rashi.en}) ↔ ${lord2} (${p2.rashi.en}): ${f12}/${f21}`,
    detailMr: `${LABELS.mr.planets[lord1]} (${p1.rashi.mr}) ↔ ${LABELS.mr.planets[lord2]} (${p2.rashi.mr})`,
    dosha: grahaMaitriScore <= 1 ? 'Graha Maitri Dosha' : null,
    doshaMr: grahaMaitriScore <= 1 ? 'ग्रह मैत्री दोष' : null,
  });

  // ── 6. GANA (6 points) ─────────────────────────────────────
  // Deva-Deva=6, Manav-Manav=6, Rakshasa-Rakshasa=6
  // Deva-Manav=5, Manav-Deva=6, Deva-Rakshasa=1, Rakshasa-Deva=1
  // Manav-Rakshasa=0, Rakshasa-Manav=0
  const ganaScoreMap = {
    deva:     { deva: 6, manav: 5, rakshasa: 1 },
    manav:    { deva: 6, manav: 6, rakshasa: 0 },
    rakshasa: { deva: 1, manav: 0, rakshasa: 6 },
  };
  const ganaScore = ganaScoreMap[p1.gana]?.[p2.gana] ?? 0;
  const ganaDosha = ganaScore === 0;
  kootas.push({
    name: 'Gana', nameMr: 'गण',
    max: 6, scored: ganaScore,
    detail: `${LABELS.en.gana[p1.gana]} ↔ ${LABELS.en.gana[p2.gana]}`,
    detailMr: `${LABELS.mr.gana[p1.gana]} ↔ ${LABELS.mr.gana[p2.gana]}`,
    dosha: ganaDosha ? 'Gana Dosha' : null,
    doshaMr: ganaDosha ? 'गण दोष' : null,
  });

  // ── 7. BHAKOOT (7 points) ──────────────────────────────────
  // Based on rashi positions relative to each other
  const rDiff = ((p2.rashiIndex - p1.rashiIndex + 12) % 12) + 1;
  const rDiffRev = ((p1.rashiIndex - p2.rashiIndex + 12) % 12) + 1;
  // Inauspicious: 2/12, 5/9, 6/8 (in either direction)
  const badPairs = [[2, 12], [5, 9], [6, 8]];
  const isBhakootBad = badPairs.some(([a, b]) =>
    (rDiff === a && rDiffRev === b) || (rDiff === b && rDiffRev === a)
  );
  // Check if same rashi lord (cancels dosha)
  const bhakootCancelled = RASHIS[p1.rashiIndex].lord === RASHIS[p2.rashiIndex].lord;
  const bhakootScore = isBhakootBad && !bhakootCancelled ? 0 : 7;
  kootas.push({
    name: 'Bhakoot', nameMr: 'भकूट',
    max: 7, scored: bhakootScore,
    detail: `${p1.rashi.en} ↔ ${p2.rashi.en} (${rDiff}/${rDiffRev})${bhakootCancelled ? ' [Dosha Cancelled]' : ''}`,
    detailMr: `${p1.rashi.mr} ↔ ${p2.rashi.mr}${bhakootCancelled ? ' [दोष रद्द]' : ''}`,
    dosha: isBhakootBad && !bhakootCancelled ? 'Bhakoot Dosha' : null,
    doshaMr: isBhakootBad && !bhakootCancelled ? 'भकूट दोष' : null,
  });

  // ── 8. NADI (8 points) ─────────────────────────────────────
  // Same nadi = 0 (Nadi Dosha), different nadi = 8
  // Cancelled if same Nakshatra (very rare) or same Rashi lord
  const nadiSame = p1.nadi === p2.nadi;
  const nadiCancelled = p1.nakshatraIndex === p2.nakshatraIndex ||
    RASHIS[p1.rashiIndex].lord === RASHIS[p2.rashiIndex].lord;
  const nadiScore = nadiSame && !nadiCancelled ? 0 : 8;
  kootas.push({
    name: 'Nadi', nameMr: 'नाडी',
    max: 8, scored: nadiScore,
    detail: `${LABELS.en.nadi[p1.nadi]} ↔ ${LABELS.en.nadi[p2.nadi]}${nadiCancelled ? ' [Dosha Cancelled]' : ''}`,
    detailMr: `${LABELS.mr.nadi[p1.nadi]} ↔ ${LABELS.mr.nadi[p2.nadi]}${nadiCancelled ? ' [दोष रद्द]' : ''}`,
    dosha: nadiSame && !nadiCancelled ? 'Nadi Dosha' : null,
    doshaMr: nadiSame && !nadiCancelled ? 'नाडी दोष' : null,
  });

  // ── TOTAL ──────────────────────────────────────────────────
  const total = kootas.reduce((sum, k) => sum + k.scored, 0);
  const doshas = kootas.filter(k => k.dosha).map(k => ({ en: k.dosha, mr: k.doshaMr }));

  return {
    kootas,
    total,
    maxTotal: 36,
    doshas,
    interpretation: getInterpretation(total, doshas),
  };
}

// ─────────────────────────────────────────────────────────────
// 9. BILINGUAL LABELS
// ─────────────────────────────────────────────────────────────

export const LABELS = {
  en: {
    gana:   { deva: 'Deva (Divine)', manav: 'Manushya (Human)', rakshasa: 'Rakshasa (Fierce)' },
    nadi:   { aadi: 'Aadi (Vata)', madhya: 'Madhya (Pitta)', antya: 'Antya (Kapha)' },
    yoni:   { horse: 'Horse', elephant: 'Elephant', sheep: 'Sheep', serpent: 'Serpent', dog: 'Dog', cat: 'Cat', rat: 'Rat', cow: 'Cow', buffalo: 'Buffalo', tiger: 'Tiger', deer: 'Deer', monkey: 'Monkey', mongoose: 'Mongoose', lion: 'Lion' },
    varna:  { brahmin: 'Brahmin', kshatriya: 'Kshatriya', vaishya: 'Vaishya', shudra: 'Shudra', mleccha: 'Mleccha' },
    planets:{ Sun: 'Sun', Moon: 'Moon', Mars: 'Mars', Mercury: 'Mercury', Jupiter: 'Jupiter', Venus: 'Venus', Saturn: 'Saturn', Rahu: 'Rahu', Ketu: 'Ketu' },
  },
  mr: {
    gana:   { deva: 'देव', manav: 'मानव', rakshasa: 'राक्षस' },
    nadi:   { aadi: 'आदी (वात)', madhya: 'मध्य (पित्त)', antya: 'अंत्य (कफ)' },
    yoni:   { horse: 'घोडा', elephant: 'हत्ती', sheep: 'मेंढा', serpent: 'साप', dog: 'कुत्रा', cat: 'मांजर', rat: 'उंदीर', cow: 'गाय', buffalo: 'म्हैस', tiger: 'वाघ', deer: 'हरण', monkey: 'माकड', mongoose: 'मुंगूस', lion: 'सिंह' },
    varna:  { brahmin: 'ब्राह्मण', kshatriya: 'क्षत्रिय', vaishya: 'वैश्य', shudra: 'शूद्र', mleccha: 'म्लेच्छ' },
    planets:{ Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगळ', Mercury: 'बुध', Jupiter: 'गुरू', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतू' },
  },
};

// ─────────────────────────────────────────────────────────────
// 10. INTERPRETATION
// ─────────────────────────────────────────────────────────────

function getInterpretation(total, doshas) {
  let levelEn, levelMr, colorClass, verdictEn, verdictMr;

  const hasNadiDosha = doshas.some(d => d.en === 'Nadi Dosha');
  const hasGanaDosha = doshas.some(d => d.en === 'Gana Dosha');
  const hasBhakootDosha = doshas.some(d => d.en === 'Bhakoot Dosha');

  if (total >= 33) {
    levelEn = 'Excellent Match'; levelMr = 'उत्कृष्ट जोडी';
    colorClass = 'excellent'; verdictEn = 'An auspicious match for a joyful married life.';
    verdictMr = 'सुखी वैवाहिक जीवनासाठी अत्यंत शुभ जोडी.';
  } else if (total >= 25) {
    levelEn = 'Very Good Match'; levelMr = 'उत्तम जोडी';
    colorClass = 'good'; verdictEn = 'A good match. Blessed with harmony and prosperity.';
    verdictMr = 'चांगली जोडी. सुख-समृद्धीने भरलेले वैवाहिक जीवन.';
  } else if (total >= 18) {
    levelEn = 'Average Match'; levelMr = 'सामान्य जोडी';
    colorClass = 'average'; verdictEn = 'An acceptable match. Some areas may need attention.';
    verdictMr = 'स्वीकार्य जोडी. काही बाबींकडे लक्ष देणे आवश्यक.';
  } else {
    levelEn = 'Below Average'; levelMr = 'अपुरी जोडी';
    colorClass = 'poor'; verdictEn = 'A challenging match. Consult an astrologer before proceeding.';
    verdictMr = 'कमी गुण. विवाह करण्यापूर्वी ज्योतिषाचा सल्ला घ्यावा.';
  }

  // Dosha warnings
  const warnings = [];
  if (hasNadiDosha) warnings.push({ en: '⚠ Nadi Dosha detected — may affect health and progeny. Seek expert advice.', mr: '⚠ नाडी दोष आढळला — आरोग्य व संतान प्राप्तीवर परिणाम होऊ शकतो. तज्ञांचा सल्ला घ्यावा.' });
  if (hasGanaDosha) warnings.push({ en: '⚠ Gana Dosha — temperament mismatch. May cause friction in relationship.', mr: '⚠ गण दोष — स्वभावातील विसंगती. नात्यात घर्षण होऊ शकते.' });
  if (hasBhakootDosha) warnings.push({ en: '⚠ Bhakoot Dosha — may affect health and financial stability.', mr: '⚠ भकूट दोष — आरोग्य व आर्थिक स्थैर्यावर परिणाम होऊ शकतो.' });

  return { levelEn, levelMr, colorClass, verdictEn, verdictMr, warnings };
}

// ─────────────────────────────────────────────────────────────
// 11. NAKSHATRA LIST FOR DROPDOWN (registration)
// ─────────────────────────────────────────────────────────────

export const NAKSHATRA_OPTIONS = NAKSHATRAS.map(n => ({
  value: n.en,
  label: `${n.mr} (${n.en})`,
}));
