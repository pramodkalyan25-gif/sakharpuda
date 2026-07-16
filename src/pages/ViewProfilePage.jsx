import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  Heart, 
  Star, 
  X, 
  MessageCircle, 
  CheckCircle, 
  Image as ImageIcon,
  MapPin,
  Briefcase,
  GraduationCap,
  Info,
  Calendar,
  User as UserIcon,
  Phone,
  Share2,
  Mail,
  ArrowLeft,
  Copy,
  ChevronLeft,
  ChevronRight,
  FileText,
  Sparkles,
  Printer,
  Download,
  X as CloseIcon,
  Ban
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import TopNav from '../components/ui/TopNav';
import { profileService } from '../services/profileService';
import { interestService } from '../services/interestService';
import { contactService } from '../services/contactService';
import { photoService } from '../services/photoService';
import { shortlistService } from '../services/shortlistService';
import { searchService } from '../services/searchService';
import { useAuth } from '../hooks/useAuth';
import { differenceInYears, parseISO, format } from 'date-fns';
import { buildPatrika, calculateGunMilan, NAKSHATRAS, RASHIS, LABELS } from '../services/gunMilanService';
import { calculateFullKundali, VEDIC_PLANETS } from '../services/kundaliService';
import KundaliChart from '../components/profile/KundaliChart';
import GunMilanModal from '../components/profile/GunMilanModal';

// ─────────────────────────────────────────────────────────────
// GUN MILAN MODAL — standalone component to avoid IIFE in JSX
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// GENERATE KUNDALI MODAL — for viewing another user's Kundali
// ─────────────────────────────────────────────────────────────
function GenerateKundaliModal({ profile, onClose }) {
  const [kundali, setKundali] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('mr');
  const printRef = useRef(null);

  useEffect(() => {
    if (!profile?.dob) return;
    setLoading(true);
    calculateFullKundali(profile.dob, profile.time_of_birth, profile.place_of_birth)
      .then(data => setKundali(data))
      .catch(err => console.error('Kundali calc error:', err))
      .finally(() => setLoading(false));
  }, [profile]);

  const patrika = profile ? buildPatrika(profile) : null;
  const L = lang;

  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    const { default: h2c } = await import('html2canvas');
    const canvas = await h2c(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#fff' });
    const link = document.createElement('a');
    link.download = `kundali-${profile.name}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.92);
    link.click();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    const { default: h2c } = await import('html2canvas');
    const { jsPDF: PDF } = await import('jspdf');
    const canvas = await h2c(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#fff' });
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const pdf = new PDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pW = pdf.internal.pageSize.getWidth();
    const pH = (canvas.height * pW) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pW, pH);
    pdf.save(`kundali-${profile.name}.pdf`);
  };

  const PatrikaRow = ({ labelMr, labelEn, value, valueMr }) => (
    <div className="gm-patrika-row">
      <span className="gm-patrika-label">{L === 'mr' ? labelMr : labelEn}</span>
      <span className="gm-patrika-value">{L === 'mr' ? (valueMr || value) : value}</span>
    </div>
  );

  return (
    <div className="gm-overlay" onClick={onClose}>
      <div className="gm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '860px' }}>
        <div className="gm-toolbar no-print">
          <div className="gm-toolbar-left">
            <div className="gm-lang-toggle">
              <button className={lang === 'mr' ? 'active' : ''} onClick={() => setLang('mr')}>मराठी</button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>English</button>
            </div>
          </div>
          <div className="gm-toolbar-right">
            <button className="gm-dl-btn" onClick={handleDownloadImage}><Download size={14} /> Image</button>
            <button className="gm-dl-btn pdf" onClick={handleDownloadPDF}><FileText size={14} /> PDF</button>
            <button className="gm-close-btn" onClick={onClose}><CloseIcon size={20} /></button>
          </div>
        </div>

        <div className="gm-body">
          <div className="gm-print-area" ref={printRef}>
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center' }}><Spinner /><p>Calculating planet positions...</p></div>
            ) : (
              <div className="gm-patrika-card">
                <div className="gm-patrika-header">
                  <div className="gm-patrika-blessing">{L === 'mr' ? '॥ श्री गणेशाय नमः ॥' : '॥ Shri Ganeshaya Namah ॥'}</div>
                  <h2 className="gm-patrika-title">{L === 'mr' ? 'जन्म कुंडली' : 'Janma Kundali'}</h2>
                  <p className="gm-patrika-subtitle">{L === 'mr' ? 'सखरपुडा मॅट्रिमोनी' : 'SakharPuda Matrimony'}</p>
                </div>
                <div className="gm-person-banner">
                  <span className="gm-person-name">{profile.name}</span>
                  <span className="gm-person-id">{profile.profile_id}</span>
                </div>

                {patrika && (
                  <div className="gm-patrika-grid">
                    <PatrikaRow labelMr="जन्म तारीख" labelEn="Date of Birth" value={patrika.dob} valueMr={patrika.dob} />
                    {patrika.timeOfBirth && <PatrikaRow labelMr="जन्म वेळ" labelEn="Time of Birth" value={patrika.timeOfBirth} valueMr={patrika.timeOfBirth} />}
                    {patrika.placeOfBirth && <PatrikaRow labelMr="जन्म स्थान" labelEn="Place of Birth" value={patrika.placeOfBirth} valueMr={patrika.placeOfBirth} />}
                    <PatrikaRow labelMr="जन्म नक्षत्र" labelEn="Janma Nakshatra"
                      value={`${patrika.nakshatra.en} (Pada ${patrika.pada})`}
                      valueMr={`${patrika.nakshatra.mr} (पाद ${patrika.pada})`} />
                    <PatrikaRow labelMr="राशी" labelEn="Rashi (Moon Sign)" value={patrika.rashi.en} valueMr={patrika.rashi.mr} />
                    <PatrikaRow labelMr="गण" labelEn="Gana" value={LABELS.en.gana[patrika.gana]} valueMr={LABELS.mr.gana[patrika.gana]} />
                    <PatrikaRow labelMr="नाडी" labelEn="Nadi" value={LABELS.en.nadi[patrika.nadi]} valueMr={LABELS.mr.nadi[patrika.nadi]} />
                    <PatrikaRow labelMr="योनि" labelEn="Yoni" value={LABELS.en.yoni[patrika.yoni]} valueMr={LABELS.mr.yoni[patrika.yoni]} />
                    <PatrikaRow labelMr="नक्षत्र स्वामी" labelEn="Nakshatra Lord" value={patrika.nakshatraLord} valueMr={LABELS.mr.planets[patrika.nakshatraLord]} />
                    <PatrikaRow labelMr="राशी स्वामी" labelEn="Rashi Lord" value={patrika.rashiLord} valueMr={LABELS.mr.planets[patrika.rashiLord]} />
                    {kundali?.lagnaRashi && (
                      <PatrikaRow labelMr="लग्न (Ascendant)" labelEn="Lagna (Ascendant)" value={kundali.lagnaRashi.en} valueMr={kundali.lagnaRashi.mr} />
                    )}
                  </div>
                )}

                {kundali && (
                  <>
                    <div style={{ padding: '16px 20px 0', textAlign: 'center' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#7c1d1d', margin: '0 0 4px', fontFamily: 'Georgia, serif' }}>
                        {L === 'mr' ? '🪐 जन्म कुंडली चार्ट' : '🪐 Janma Kundali Chart'}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0, fontFamily: 'sans-serif' }}>
                        {kundali.chartType === 'lagna'
                          ? (L === 'mr' ? 'लग्न कुंडली — जन्म वेळ व स्थानावरून गणले' : 'Lagna Kundali — Calculated from birth time & place')
                          : (L === 'mr' ? 'चंद्र कुंडली — जन्म तारखेवरून गणले' : 'Chandra Kundali — Calculated from DOB only')
                        }
                      </p>
                    </div>
                    <KundaliChart houses={kundali.houses} chartType={kundali.chartType} lagnaRashi={kundali.lagnaRashi} lang={lang} />
                    <div style={{ padding: '0 20px 16px' }}>
                      <table className="gm-koota-table" style={{ fontSize: '12px' }}>
                        <thead><tr><th>{L === 'mr' ? 'ग्रह' : 'Planet'}</th><th>{L === 'mr' ? 'राशी' : 'Rashi'}</th><th>{L === 'mr' ? 'अंश' : 'Deg'}</th></tr></thead>
                        <tbody>
                          {kundali.planets.map((p, i) => (
                            <tr key={i}><td style={{ fontWeight: 700 }}>{L === 'mr' ? p.mr : p.en}{p.isRetrograde ? ' (R)' : ''}</td><td>{L === 'mr' ? p.rashi.mr : p.rashi.en}</td><td>{p.degInRashi}°</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {!profile.time_of_birth && (
                  <p className="gm-note">{L === 'mr' ? '* जन्म वेळ उपलब्ध नसल्याने चंद्र कुंडली दाखवली आहे. पूर्ण लग्न कुंडलीसाठी जन्म वेळ व ठिकाण आवश्यक आहे.' : '* Birth time not available — showing Chandra Kundali. For full Lagna Kundali, birth time & place are needed.'}</p>
                )}

                <div className="gm-patrika-footer"><span>SakharPuda Matrimony</span><span>www.sakharpuda.com</span></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewProfilePage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { user, profile: myProfile } = useAuth();
  const [searchParams] = useSearchParams();

  const [profile, setProfile]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [avatarUrl, setAvatarUrl]       = useState(null);
  const [interestStatus, setInterestStatus] = useState(null);
  const [contactStatus, setContactStatus]   = useState(null);
  const [allPhotos, setAllPhotos]       = useState([]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [matchesList, setMatchesList]     = useState([]);
  const [prevId, setPrevId]               = useState(null);
  const [nextId, setNextId]               = useState(null);
  const [showBioDataModal, setShowBioDataModal] = useState(false);
  const [biodataLang, setBiodataLang]           = useState('mr');

  useEffect(() => {
    if (searchParams.get('biodata') === 'true') {
      setShowBioDataModal(true);
    }
  }, [searchParams]);
  
  // DRAG & DROP & UPLOAD & RESIZE STATES
  const [sections, setSections]               = useState([]);
  const [customGodPhoto, setCustomGodPhoto]   = useState(null);
  const [customUserPhoto, setCustomUserPhoto] = useState(null);
  const [godPos, setGodPos]                   = useState({ x: 40, y: 30, w: 43 });
  const [userPos, setUserPos]                 = useState({ x: 510, y: 30, w: 140 });
  const [godPhoto, setGodPhoto]               = useState('/ganesha.png');
  const [showGodPhoto, setShowGodPhoto]       = useState(true);
  const [godBlessingText, setGodBlessingText] = useState('॥ श्री गणेशाय नमः ॥');
  const [bgType, setBgType]                   = useState('cream');
  const [showPhotoOnBio, setShowPhotoOnBio]   = useState(true);
  const [translitMode, setTranslitMode]       = useState('ai'); 
  const [translitStatus, setTranslitStatus]   = useState('active'); // 'active' | 'failed'

  // REBUILT ROBUST HISTORY (UNDO) SYSTEM
  const [history, setHistory] = useState([]);
  const handleDragStart = (e, type) => {
    const isTouch = e.type.startsWith('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    
    const initialPos = type === 'god' ? godPos : userPos;
    const startX = clientX - initialPos.x;
    const startY = clientY - initialPos.y;

    const onMove = (moveE) => {
      const mX = isTouch ? (moveE.touches ? moveE.touches[0].clientX : moveE.clientX) : moveE.clientX;
      const mY = isTouch ? (moveE.touches ? moveE.touches[0].clientY : moveE.clientY) : moveE.clientY;
      let nextX = mX - startX;
      let nextY = mY - startY;
      
      // Document is 800px wide. Constrain to 0-730 for x (w:70) and 0-200 for y (header height)
      nextX = Math.max(0, Math.min(nextX, 730));
      nextY = Math.max(0, Math.min(nextY, 200));

      if (type === 'god') setGodPos(p => ({ ...p, x: nextX, y: nextY }));
      else setUserPos(p => ({ ...p, x: nextX, y: nextY }));
    };

    const onEnd = () => {
      document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', onMove);
      document.removeEventListener(isTouch ? 'touchend' : 'mouseup', onEnd);
      
      // Save to history after drag ends
      setSections(prev => {
        saveHistory(prev, type === 'god' ? { x: 0, y: 0, w: 0 } : godPos, type === 'user' ? { x: 0, y: 0, w: 0 } : userPos); 
        return prev;
      });
    };

    document.addEventListener(isTouch ? 'touchmove' : 'mousemove', onMove);
    document.addEventListener(isTouch ? 'touchend' : 'mouseup', onEnd);
  };
  const saveHistory = (s, g, u) => {
    const snap = JSON.stringify({ sections: JSON.parse(JSON.stringify(s)), godPos: { ...g }, userPos: { ...u } });
    setHistory(prev => {
      if (prev[0] === snap) return prev; 
      return [snap, ...prev].slice(0, 50);
    });
  };

  const undo = () => {
    setHistory(prev => {
      if (prev.length <= 1) return prev;
      const [_, last, ...rest] = prev;
      const data = JSON.parse(last);
      setSections(data.sections);
      setGodPos(data.godPos);
      setUserPos(data.userPos);
      return [last, ...rest];
    });
  };

  const handleDownloadImage = async () => {
    const cardElement = document.getElementById('biodata-to-print');
    if (!cardElement) return;
    
    const loadingToast = toast.loading('Generating Image...');
    try {
      const canvas = await html2canvas(cardElement, {
        scale: 2, // High resolution crisp image
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `${profile?.name || 'biodata'}_biodata.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Image downloaded successfully!', { id: loadingToast });
    } catch (err) {
      console.error('Failed to generate image:', err);
      toast.error('Failed to generate image. Please try again.', { id: loadingToast });
    }
  };

  const handleDownloadPDF = async () => {
    const cardElement = document.getElementById('biodata-to-print');
    if (!cardElement) return;
    
    const loadingToast = toast.loading('Generating PDF...');
    try {
      const canvas = await html2canvas(cardElement, {
        scale: 2, // Crisp rendering
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2] // perfect dimension matching the crisp scale
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${profile?.name || 'biodata'}_biodata.pdf`);
      toast.success('PDF downloaded successfully!', { id: loadingToast });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      toast.error('Failed to generate PDF. Please try again.', { id: loadingToast });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); 

  // High-Quality Maharashtrian Deity Options (stable Wikimedia URLs)
  const godOptions = [
    { name: '॥ श्री गणेशाय नमः ॥', url: '/ganesha.png' },
    { name: 'विठ्ठल-रखुमाई', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Vithoba_Rukmini.jpg/240px-Vithoba_Rukmini.jpg' },
    { name: 'खंडोबा (Khandoba)', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Khandoba_Mhalsa.jpg/240px-Khandoba_Mhalsa.jpg' },
    { name: 'तुळजा भवानी', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Tulja_Bhavani_Idol.jpg/240px-Tulja_Bhavani_Idol.jpg' },
    { name: 'कोल्हापूर महालक्ष्मी', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Mahalakshmi_Idol_Kolhapur.jpg/240px-Mahalakshmi_Idol_Kolhapur.jpg' },
    { name: 'साई बाबा (Sai Baba)', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Shirdi_Sai_Baba.jpg/240px-Shirdi_Sai_Baba.jpg' },
    { name: 'गजानन महाराज', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Gajanan_Maharaj_Shegaon.jpg/240px-Gajanan_Maharaj_Shegaon.jpg' },
    { name: 'स्वामी समर्थ', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Swami_Samarth_Maharaj.jpg/240px-Swami_Samarth_Maharaj.jpg' }
  ];

  // Build default sections from profile data when modal opens
  useEffect(() => {
    let active = true;
    if (showBioDataModal && profile) {
      const mr = biodataLang === 'mr';
      const dob = profile.dob ? (() => { const d = new Date(profile.dob); const dd = String(d.getDate()).padStart(2,'0'); const mm = String(d.getMonth()+1).padStart(2,'0'); const yyyy = d.getFullYear(); return `${dd}-${mm}-${yyyy}`; })() : '---';
      const htCm = profile.height;
      const htFt = htCm ? `${Math.floor(htCm / 30.48)}'${Math.round((htCm / 2.54) % 12)}"` : '---';

      const initializeData = async () => {
        let nameVal = profile.name || '---';
        let tobVal = profile.time_of_birth || profile.tob || '---';
        let pobVal = profile.place_of_birth || profile.pob || '---';
        let bloodVal = profile.blood_group || '---';
        let casteVal = profile.caste || '---';
        let eduVal = profile.education || '---';
        let profVal = profile.profession || '---';
        let fatherVal = profile.father_name || '---';
        let motherVal = profile.mother_name || '---';
        let uncleVal = profile.maternal_uncle || '---';
        let addrVal = [profile.city, profile.state].filter(Boolean).join(', ') || '---';

        // Calculate Rashi using buildPatrika
        const patrika = profile ? buildPatrika(profile) : null;
        let rashiVal = patrika?.rashi ? (mr ? patrika.rashi.mr : patrika.rashi.en) : (profile.rashi || '---');

        if (mr) {
          const translateText = async (val) => {
            if (!val || val === '---') return '---';

            const dict = {
              // Castes
              'maratha': 'मराठा', 'kunbi': 'कुणबी', 'chambhar': 'चांभार', 'mahar': 'महार',
              'mali': 'माळी', 'dhangar': 'धनगर', 'brahmin': 'ब्राह्मण', 'bramhin': 'ब्राह्मण',
              'agri': 'आगरी', 'koli': 'कोळी', 'bhandari': 'भंडारी', 'nhavi': 'न्हावी',
              'sutar': 'सुतार', 'lohar': 'लोहार', 'shimpi': 'शिंपी', 'sonar': 'सोनार',
              'teli': 'तेली', 'lingayat': 'लिंगायत', 'gurav': 'गुरव', 'mang': 'मांग',
              'wadari': 'वडारी', 'vanjari': 'वंजारी', 'marwadi': 'मारवाडी',

              // Religions
              'hindu': 'हिंदू', 'buddhist': 'बौद्ध', 'jain': 'जैन', 'christian': 'ख्रिश्चन',
              'sikh': 'शीख', 'muslim': 'मुस्लिम',

              // Cities / States
              'pune': 'पुणे', 'mumbai': 'मुंबई', 'thane': 'ठाणे', 'nashik': 'नाशिक',
              'nasik': 'नाशिक', 'nagpur': 'नागपूर', 'solapur': 'सोलापूर',
              'kolhapur': 'कोल्हापूर', 'amravati': 'अमरावती', 'nanded': 'नांदेड',
              'latur': 'लातूर', 'sangli': 'सांगली', 'satara': 'सातारा',
              'jalgaon': 'जळगाव', 'akola': 'अकोला', 'chandrapur': 'चंद्रपूर',
              'dhule': 'धुळे', 'jalna': 'जालना', 'wardha': 'वर्धा',
              'yavatmal': 'यवतमाळ', 'beed': 'बीड', 'gondia': 'गोंदिया',
              'bhandara': 'भंडारा', 'gadchiroli': 'गडचिरोली', 'hingoli': 'हिंगोली',
              'nandurbar': 'नंदुरबार', 'osmanabad': 'धाराशिव', 'dharashiv': 'धाराशिव',
              'parbhani': 'परभणी', 'ratnagiri': 'रत्नागिरी', 'sindhudurg': 'सिंधुदुर्ग',
              'washim': 'वाशीम', 'buldhana': 'बुलढाणा', 'palghar': 'पालघर',
              'raigad': 'रायगड', 'ahmednagar': 'अहमदनगर', 'maharashtra': 'महाराष्ट्र',

              // Common designations/qualifications
              'engineer': 'अभियंता', 'software engineer': 'सॉफ्टवेअर अभियंता',
              'doctor': 'डॉक्टर', 'teacher': 'शिक्षक', 'business': 'व्यवसाय',
              'service': 'नोकरी', 'farmer': 'शेतकरी', 'farming': 'शेती'
            };

            const clean = val.trim().toLowerCase();
            if (dict[clean]) return dict[clean];

            // Handle comma-separated lists (like City, State)
            const parts = val.split(', ');
            if (parts.length > 1) {
              const transParts = await Promise.all(parts.map(p => translateText(p)));
              return transParts.join(', ');
            }

            // Word by word fallback
            const words = val.split(/\s+/);
            const transWords = await Promise.all(
              words.map(async (word) => {
                if (/^[a-zA-Z]+$/.test(word)) {
                  return await smartTransliterate(word);
                }
                return word;
              })
            );
            return transWords.join(' ');
          };

          const [
            tName,
            tTob,
            tPob,
            tBlood,
            tCaste,
            tEdu,
            tProf,
            tFather,
            tMother,
            tUncle,
            tAddr
          ] = await Promise.all([
            translateText(nameVal),
            translateText(tobVal),
            translateText(pobVal),
            translateText(bloodVal),
            translateText(casteVal),
            translateText(eduVal),
            translateText(profVal),
            translateText(fatherVal),
            translateText(motherVal),
            translateText(uncleVal),
            translateText(addrVal)
          ]);

          if (active) {
            nameVal = tName;
            tobVal = tTob;
            pobVal = tPob;
            bloodVal = tBlood;
            casteVal = tCaste;
            eduVal = tEdu;
            profVal = tProf;
            fatherVal = tFather;
            motherVal = tMother;
            uncleVal = tUncle;
            addrVal = tAddr;
          }
        }

        if (active) {
          const initialSections = [
            { id: 1, title: mr ? '❋ वैयक्तिक माहिती ❋' : '❋ Personal Details ❋', fields: [
              { label: mr ? 'पूर्ण नाव' : 'Full Name', value: nameVal },
              { label: mr ? 'जन्म तारीख' : 'Date of Birth', value: dob },
              { label: mr ? 'जन्म वेळ' : 'Time of Birth', value: tobVal },
              { label: mr ? 'जन्म स्थळ' : 'Place of Birth', value: pobVal },
              { label: mr ? 'उंची' : 'Height', value: htFt },
              { label: mr ? 'राशी' : 'Rashi', value: rashiVal },
              { label: mr ? 'रक्तगट' : 'Blood Group', value: bloodVal },
              { label: mr ? 'जात' : 'Caste', value: casteVal },
              { label: mr ? 'शिक्षण' : 'Education', value: eduVal },
              { label: mr ? 'नोकरी / व्यवसाय' : 'Profession', value: profVal },
            ]},
            { id: 2, title: mr ? '❋ कौटुंबिक माहिती ❋' : '❋ Family Details ❋', fields: [
              { label: mr ? 'वडिलांचे नाव' : "Father's Name", value: fatherVal },
              { label: mr ? 'आईचे नाव' : "Mother's Name", value: motherVal },
              { label: mr ? 'भाऊ' : 'Brother', value: '---' },
              { label: mr ? 'बहिण' : 'Sister', value: '---' },
              { label: mr ? 'चुलते' : 'Paternal Uncle', value: '---' },
              { label: mr ? 'मामा' : 'Maternal Uncle', value: uncleVal },
              { label: mr ? 'काका' : 'Paternal Uncle (Kaka)', value: '---' },
              { label: mr ? 'नातेवाईक' : 'Relatives', value: '---' },
            ]},
            { id: 3, title: mr ? '❋ संपर्क ❋' : '❋ Contact ❋', fields: [
              { label: mr ? 'नाव' : 'Contact Name', value: nameVal },
              { label: mr ? 'मोबाईल नंबर' : 'Mobile', value: profile.mobile || '---' },
              { label: mr ? 'घरचा पत्ता' : 'Home Address', value: addrVal },
            ]},
          ];
          setSections(initialSections);
          saveHistory(initialSections, { x: 20, y: 20, w: 43 }, { x: 480, y: 30, w: 150 });
        }
      };

      initializeData();
    }
    return () => {
      active = false;
    };
  }, [showBioDataModal, profile, biodataLang]);

  const updateField = (sId, fIdx, key, val) => {
    const cleanVal = val ? val.replace(/\u00A0/g, ' ') : val;
    setSections(prev => {
      const next = prev.map(s => s.id === sId ? { ...s, fields: s.fields.map((f, i) => i === fIdx ? { ...f, [key]: cleanVal } : f) } : s);
      saveHistory(next, godPos, userPos);
      return next;
    });
  };

  const removeField = (sId, fIdx) => {
    setSections(prev => {
      const next = prev.map(s => s.id === sId ? { ...s, fields: s.fields.filter((_, i) => i !== fIdx) } : s);
      saveHistory(next, godPos, userPos);
      return next;
    });
  };

  const addField = (sId) => {
    setSections(prev => {
      const next = prev.map(s => s.id === sId ? { ...s, fields: [...s.fields, { label: 'New Label', value: 'New Value' }] } : s);
      saveHistory(next, godPos, userPos);
      return next;
    });
  };

  const addSection = (afterId) => {
    const newId = Date.now();
    setSections(prev => {
      const newSection = { id: newId, title: biodataLang === 'mr' ? 'नवीन विभाग' : 'New Section', fields: [{ label: 'Field Name', value: 'Value' }] };
      let next;
      if (afterId) {
        const idx = prev.findIndex(s => s.id === afterId);
        next = [...prev.slice(0, idx + 1), newSection, ...prev.slice(idx + 1)];
      } else {
        next = [...prev, newSection];
      }
      saveHistory(next, godPos, userPos);
      return next;
    });
  };

  const removeSection = (id) => {
    setSections(prev => {
      const next = prev.filter(s => s.id !== id);
      saveHistory(next, godPos, userPos);
      return next;
    });
  };

  const offlineTransliterate = (text) => {
    const word = text.toLowerCase().trim();
    const dict = {
      'nav': 'नाव', 'naam': 'नाव', 'purna': 'पूर्ण', 'naw': 'नाव',
      'aai': 'आई', 'mother': 'आई', 'vadil': 'वडील', 'father': 'वडील',
      'bhau': 'भाऊ', 'brother': 'भाऊ', 'bahin': 'बहीण', 'sister': 'बहीण',
      'kaka': 'काका', 'mama': 'मामा', 'maternal': 'मामा', 'paternal': 'काका',
      'chulte': 'चुलते', 'koutumbik': 'कौटुंबिक', 'kautumbik': 'कौटुंबिक',
      'mahiti': 'माहिती', 'mahit': 'माहिती', 'vivah': 'विवाह', 'biodata': 'बायो-डाटा',
      'shikshan': 'शिक्षण', 'nokri': 'नोकरी', 'vyavasay': 'व्यवसाय',
      'kam': 'काम', 'rashi': 'राशी', 'rakta': 'रक्तगट', 'raktagat': 'रक्तगट',
      'janma': 'जन्म', 'tarikh': 'तारीख', 'vel': 'वेळ', 'sthal': 'स्थळ',
      'patta': 'पत्ता', 'unchi': 'उंची', 'jat': 'जात', 'caste': 'जात',
      'shubh': 'शुभ', 'mangalam': 'मंगलम्', 'ganesh': 'गणेश', 'ganesha': 'गणेश',
      'ganeshaya': 'गणेशाय', 'namah': 'नमः', 'shree': 'श्री', 'shri': 'श्री',
      'mumbai': 'मुंबई', 'pune': 'पुणे', 'nashik': 'नाशिक', 'nagpur': 'नागपूर',
      'satara': 'सातारा', 'sangli': 'सांगली', 'kolhapur': 'कोल्हापूर', 'kalyan': 'कल्याण'
    };

    if (dict[word]) return dict[word];

    let res = word;
    res = res.replace(/kautumbik/g, 'कौटुंबिक').replace(/koutumbik/g, 'कौटुंबिक');
    res = res.replace(/mahiti/g, 'माहिती');
    res = res.replace(/shree/g, 'श्री').replace(/shri/g, 'श्री');
    res = res.replace(/namah/g, 'नमः').replace(/ganeshaya/g, 'गणेशाय');
    res = res.replace(/janma/g, 'जन्म').replace(/sthal/g, 'स्थळ');
    res = res.replace(/shikshan/g, 'शिक्षण').replace(/vyavasay/g, 'व्यवसाय');
    res = res.replace(/nokri/g, 'नोकरी').replace(/vadil/g, 'वडील');
    res = res.replace(/bahin/g, 'बहीण').replace(/bhau/g, 'भाऊ');
    
    return res === word ? text : res;
  };

  const smartTransliterate = async (text) => {
    if (!text || biodataLang !== 'mr') return text;
    const cleanText = text.trim();
    if (!cleanText || !/^[a-zA-Z]+$/.test(cleanText)) return text;
    
    const dictionary = { 
      'pahune': 'पाहुणे', 'vayak': 'व्यक्ती', 'vayaktik': 'वैयक्तिक',
      'nav': 'नाव', 'aai': 'आई', 'vadil': 'वडील', 'mulga': 'मुलगा', 'mulgi': 'मुलगी',
      'patta': 'पत्ता', 'janma': 'जन्म', 'shikshan': 'शिक्षण', 'nokri': 'नोकरी',
      'parichay': 'परिचय', 'vivah': 'विवाह', 'patra': 'पत्र', 'mahit': 'माहिती',
      'shubh': 'शुभ', 'vivaha': 'विवाह', 'mangalam': 'मंगलम्', 'biadata': 'बायो-डाटा'
    };
    if (dictionary[cleanText.toLowerCase()]) return dictionary[cleanText.toLowerCase()];

    try {
      const url = `/api/transliterate?text=${encodeURIComponent(cleanText)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data[0] === 'SUCCESS' && data[1][0] && data[1][0][1][0]) {
        setTranslitStatus('active');
        return data[1][0][1][0];
      }
    } catch (e) { 
      console.warn("Translit Cloud failed, using offline fallback", e); 
    }
    
    setTranslitStatus('failed');
    return offlineTransliterate(cleanText);
  };

  const handleGenericTranslit = async (e, currentValue, onUpdate) => {
    if (biodataLang !== 'mr') return;
    
    const isBlur = e.type === 'blur';
    const el = e.target;
    const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
    if (!isInput) return;

    const cursorPos = el.selectionStart;
    const text = el.value;

    const lastChar = cursorPos > 0 ? text.substring(cursorPos - 1, cursorPos) : '';
    const isSpaceOrEnter = lastChar === ' ' || lastChar === '\n';
    const isAllowedKey = e.key === ' ' || e.key === 'Enter' || e.key === 'Tab';

    if (!isBlur && !isSpaceOrEnter && !isAllowedKey) return;

    const textBefore = text.substring(0, cursorPos);
    const trimmed = textBefore.trimEnd();
    const words = trimmed.split(/\s+/);
    const lastWord = words[words.length - 1];
    
    if (!lastWord || !/^[a-zA-Z]+$/.test(lastWord)) return;
    
    const converted = await smartTransliterate(lastWord);
    if (converted === lastWord) return;
    
    const beforeWord = textBefore.substring(0, textBefore.lastIndexOf(lastWord));
    const shouldAddSpace = e.key === ' ' || e.key === 'Enter' || isSpaceOrEnter;
    const newValue = beforeWord + converted + (shouldAddSpace ? ' ' : '') + text.substring(cursorPos);
    
    onUpdate(newValue.replace(/\u00A0/g, ' '));
    
    setTimeout(() => {
      const newPos = beforeWord.length + converted.length + (shouldAddSpace ? 1 : 0);
      el.setSelectionRange(newPos, newPos);
    }, 0);
  };
  

  const [sending, setSending]           = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [shortlisting, setShortlisting] = useState(false);
  const [showGunMilanModal, setShowGunMilanModal] = useState(false);
  const [showGenKundali, setShowGenKundali] = useState(false);
  const [gmTab, setGmTab] = useState('patrika'); // 'patrika' | 'milan'
  
  const aboutRef = useRef(null);
  const basicRef = useRef(null);
  const careerRef = useRef(null);
  const locationRef = useRef(null);
  const contactRef = useRef(null);

  const isOwn = user?.id === id;
  const loggedInGender = (myProfile?.gender || '').toLowerCase();
  const candidateGender = (profile?.gender || '').toLowerCase();
  const isOppositeGender = loggedInGender && candidateGender && loggedInGender !== candidateGender;
  const age   = profile?.dob ? differenceInYears(new Date(), parseISO(profile.dob)) : null;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // 1. Load Profile
        const [p, photo, photos] = await Promise.all([
          profileService.getPublicProfile(id),
          photoService.getPrimaryPhoto(id),
          photoService.getUserPhotos(id)
        ]);
        setProfile(p);
        setAllPhotos(photos || []);
        
        if (photo?.signed_url) {
          if (user?.id && !isOwn) {
            const wm = await photoService.applyWatermark(photo.signed_url, user.id).catch(() => photo.signed_url);
            setAvatarUrl(wm);
          } else {
            setAvatarUrl(photo.signed_url);
          }
        }
        
        // 2. Load Metadata
        if (user?.id && !isOwn) {
          try {
            const [interest, contact, shortlistMap, recs] = await Promise.all([
              interestService.getInterestStatus(user.id, id).catch(() => null),
              contactService.getContactAccessStatus(user.id, id).catch(() => 'not_requested'),
              shortlistService.getShortlistMap(user.id).catch(() => ({})),
              searchService.getRecommendedProfiles(user.id, p).catch(() => null)
            ]);
            
            setInterestStatus(interest);
            setContactStatus(contact);
            setIsShortlisted(!!shortlistMap[id]);
            
            // Handle Navigation List
            if (recs?.profiles) {
              const list = recs.profiles;
              setMatchesList(list);
              const idx = list.findIndex(m => m.user_id === id);
              if (idx !== -1) {
                setPrevId(idx > 0 ? list[idx - 1].user_id : null);
                setNextId(idx < list.length - 1 ? list[idx + 1].user_id : null);
              } else {
                setNextId(list[0]?.user_id || null);
              }
            }
            
            profileService.logProfileView(user.id, id).catch(() => {});
          } catch (e) {
            console.error('Non-critical load error:', e);
          }
        }
      } catch (err) {
        console.error('Load profile error:', err);
        toast.error('Profile not found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user?.id, isOwn, navigate]);

  const handleSendInterest = async (e) => {
    e.stopPropagation();
    if (!myProfile) {
      toast.error('Please complete your profile first.');
      navigate('/create-profile');
      return;
    }
    setSending(true);
    try {
      // Compute sender/receiver before the async call using the current interestStatus
      const myRow     = interestStatus;
      const iSent     = !!myRow && myRow.sender_id === user.id;
      const theyRejected = myRow?.status === 'rejected' && iSent;
      const iRejected    = myRow?.status === 'rejected' && !iSent;

      let successMsg = 'Interest sent!';
      if (myRow?.id && myRow.status === 'pending' && !iSent) {
        // Case: I received a pending interest, clicked the heart to accept/send back
        await interestService.acceptInterest(myRow.id);
        successMsg = 'Interest accepted! You are now connected.';
      } else if (myRow?.id && theyRejected) {
        // Case A: I sent, they rejected — update same row back to pending
        await interestService.resendInterest(myRow.id);
      } else if (myRow?.id && iRejected) {
        // Case B (Scenario 13): I rejected their interest, now I want to initiate
        await interestService.switchAndSendInterest(user.id, id, myProfile);
      } else {
        // Case C: No row — fresh send
        await interestService.sendInterest(user.id, id, myProfile);
      }
      const updated = await interestService.getInterestStatus(user.id, id);
      setInterestStatus(updated);
      toast.success(successMsg);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('DUPLICATE')) {
        toast.error('You have already sent interest to this profile.');
      } else if (msg.includes('DAILY_LIMIT_REACHED')) {
        toast.error('Daily limit reached. You can send up to 10 interests per day.');
      } else {
        toast.error(msg || 'Failed to send interest.');
      }
    } finally {
      setSending(false);
    }
  };

  const [blocking, setBlocking] = useState(false);

  const handleBlock = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to block this profile? They will only see your name, age and profile ID.')) return;
    setBlocking(true);
    try {
      const updated = await interestService.blockUserById(user.id, id);
      setInterestStatus(updated);
      toast.success('Profile blocked.');
    } catch (err) {
      toast.error('Failed to block profile.');
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblock = async (e) => {
    e.stopPropagation();
    setBlocking(true);
    try {
      const updated = await interestService.unblockUserById(user.id, id);
      setInterestStatus(updated);
      toast.success('Profile unblocked.');
    } catch (err) {
      toast.error('Failed to unblock profile.');
    } finally {
      setBlocking(false);
    }
  };

  const handleToggleShortlist = async (e) => {
    e.stopPropagation();
    if (!user) return;
    setShortlisting(true);
    try {
      const nowShortlisted = await shortlistService.toggleShortlist(user.id, id);
      setIsShortlisted(nowShortlisted);
      toast.success(nowShortlisted ? 'Added to shortlist' : 'Removed from shortlist');
    } catch (err) {
      toast.error('Error updating shortlist');
    } finally {
      setShortlisting(false);
    }
  };

  const getShareText = () => {
    const name = profile?.name || 'Candidate';
    const location = profile?.city ? `${profile.city}, ${profile.country}` : 'Maharashtra';
    const homeUrl = 'https://www.sakharpuda.com';
    const profileUrl = window.location.href;
    
    return `VISIT US AT:\n\n` +
           `${homeUrl}\n\n` +
           `------------------------------------\n` +
           `*SAKHARPUDA MATRIMONY*\n` +
           `_Built by Maharashtrians for Maharashtrians_\n` +
           `Finding perfect matches for the community\n` +
           `------------------------------------\n\n` +
           `Check out this profile on SakharPuda:\n\n` +
           `*Name:* ${name}\n` +
           `*Age:* ${age} Years\n` +
           `*Location:* ${location}\n\n` +
           `------------------------------------\n` +
           `VIEW FULL PROFILE HERE:\n\n\n` +
           `${profileUrl}`;
  };

  const handleNativeShare = async () => {
    const shareText = getShareText();
    try {
      if (navigator.share) {
        await navigator.share({
          title: `SakharPuda: ${profile.name}`,
          text: shareText,
          url: window.location.href
        });
      } else {
        copyToClipboard();
      }
    } catch (err) {
      if (err.name !== 'AbortError') toast.error('Sharing failed');
    }
    setShowShareModal(false);
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowShareModal(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getShareText());
    toast.success('Profile card copied!');
    setShowShareModal(false);
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const navigateToProfile = (targetId) => {
    if (!targetId) return;
    window.scrollTo(0, 0);
    navigate(`/profile/${targetId}`);
  };

  if (loading && !profile) return <div className="page-loading"><Spinner size="lg" /></div>;
  if (!profile) return <div className="page-loading"><h2>Profile not found</h2></div>;

  // Compute interest/block derived state
  // INVARIANT: when is_blocked=true, sender_id = the blocker (guaranteed by blockUserById)
  const isAnyBlocked  = !!interestStatus?.is_blocked;
  const iBlockedThem  = isAnyBlocked && interestStatus?.sender_id === user.id;
  const iAmBlocked    = isAnyBlocked && !iBlockedThem;
  const iAmSenderVP   = !!interestStatus && interestStatus.sender_id === user.id;
  const iAmReceiverVP = !!interestStatus && interestStatus.sender_id !== user.id;
  const isPendingVP   = interestStatus?.status === 'pending';
  const isAcceptedVP  = interestStatus?.status === 'accepted';
  const isRejectedVP  = interestStatus?.status === 'rejected';

  if (iAmBlocked) {
    return (
      <div className="vp-page-wrapper">
        <TopNav />
        
        <div className="js-view-profile-container" style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
          {/* HERO SECTION WITH RESTRICTED INFO */}
          <div className="js-profile-hero" style={{ marginBottom: '24px' }}>
            <div className="js-hero-card" style={{ height: '350px' }}>
              <div className="js-hero-photo-box" style={{ height: '100%' }}>
                {/* Restricted blurred avatar */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <UserIcon size={120} color="#94a3b8" />
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    cursor: 'pointer',
                    background: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: '50%',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10
                  }} onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={24} color="#fff" />
                  </div>
                </div>

                <div className="js-bottom-info-overlay">
                  <div className="js-name-row">
                    <h2 className="js-candidate-name">{profile.name},</h2>
                    <span className="js-candidate-age">{age} yrs,</span>
                    <span className="js-candidate-id">{profile.profile_id}</span>
                  </div>
                  <div className="js-managed-by">
                    Profile managed by {profile.profile_for || 'Self'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RESTRICTED NOTICE CARD */}
          <div className="js-detail-card" style={{
            textAlign: 'center',
            padding: '40px 30px',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid #fee2e2'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Ban size={32} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>Access Restricted</h3>
            <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
              This user has restricted access to their profile. You cannot view their photos, details, or communicate with them.
            </p>
            <Button
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'linear-gradient(135deg, #d63447 0%, #b02636 100%)',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(214, 52, 71, 0.2)'
              }}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const maskEmail = (email) => {
    if (!email) return 'N/A';
    return '********@****.***';
  };

  const maskPhone = (phone) => {
    if (!phone) return 'N/A';
    return phone.length > 5 ? phone.substring(0, phone.length - 5) + '*****' : '*****';
  };

  const candidateFirstName = profile?.name ? profile.name.trim().split(' ')[0] : 'Candidate';

  return (
    <div className="vp-page-wrapper">
      <TopNav />

      {/* USP ACTION BAR */}
      <div className="js-usp-bar">
        <div className="js-usp-container">
          <button className="js-usp-btn bio" onClick={() => {
            if (!isOwn && !isOppositeGender) {
              toast.error("You can only generate Bio-Data for candidates of the opposite gender.");
              return;
            }
            setShowBioDataModal(true);
          }}>
            <FileText size={18} />
            <span>Generate Bio-Data of {candidateFirstName}</span>
          </button>
          <button className="js-usp-btn guna" onClick={() => {
            if (!isOwn && !isOppositeGender) {
              toast.error("You can only match Kundali with candidates of the opposite gender.");
              return;
            }
            setGmTab('milan');
            setShowGunMilanModal(true);
          }}>
            <Sparkles size={18} />
            <span>Match Your Patrika With {candidateFirstName}</span>
          </button>
          <button className="js-usp-btn patrika" onClick={() => {
            if (!isOwn && !isOppositeGender) {
              toast.error("You can only generate Patrika for candidates of the opposite gender.");
              return;
            }
            setShowGenKundali(true);
          }}>
            <FileText size={18} />
            <span>Generate Patrika of {candidateFirstName}</span>
          </button>
        </div>
      </div>

      {/* SWIPE NAVIGATION ARROWS */}
      {prevId && (
        <button className="js-swipe-arrow left" onClick={() => navigateToProfile(prevId)}>
          <ChevronLeft size={32} />
        </button>
      )}
      {nextId && (
        <button className="js-swipe-arrow right" onClick={() => navigateToProfile(nextId)}>
          <ChevronRight size={32} />
        </button>
      )}
      
      <div className="js-view-profile-container">
        {/* HERO SECTION */}
        <div className="js-profile-hero">
          <div className="js-hero-card">
            <div className="js-hero-photo-box">
              <img src={avatarUrl || '/images/default-avatar.png'} alt={profile.name} className="js-hero-img" />
              
              {/* Top Left: Back Arrow */}
              <div className="js-top-left-overlay">
                <div className="js-circle-back" onClick={() => navigate('/dashboard')}>
                  <ArrowLeft size={24} color="#fff" />
                </div>
              </div>

              {/* Top Right: Badges */}
              <div className="js-top-right-overlay">
                <div className="js-badge-row">
                  {allPhotos.length > 0 && (
                    <div className="js-premium-badge" onClick={(e) => { e.stopPropagation(); setShowPhotoModal(true); }}>
                      <ImageIcon size={18} color="#1e293b" />
                      <span>{allPhotos.length}</span>
                    </div>
                  )}
                  <div className="js-premium-badge share" onClick={() => setShowShareModal(true)}>
                    <Share2 size={18} color="#1e293b" />
                  </div>
                </div>
              </div>

              {/* BOTTOM CONTENT OVERLAY (Matching ProfileCard) */}
              <div className="js-bottom-info-overlay">
                <div className="js-name-row">
                  <h2 className="js-candidate-name">{profile.name},</h2>
                  <span className="js-candidate-age">{age} yrs,</span>
                  <span className="js-candidate-id">{profile.profile_id}</span>
                </div>
                
                <div className="js-managed-by">
                  Profile managed by {profile.profile_for || 'Self'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ANCHOR NAVIGATION */}
        <div className="js-profile-anchors">
          <button onClick={() => scrollToSection(aboutRef)}>About</button>
          <button onClick={() => scrollToSection(basicRef)}>Basic</button>
          <button onClick={() => scrollToSection(careerRef)}>Career</button>
          <button onClick={() => scrollToSection(locationRef)}>Location</button>
          <button onClick={() => scrollToSection(contactRef)}>Contact</button>
        </div>

        {/* DETAILED CONTENT */}
        <div className="js-profile-details-content">
          <div ref={aboutRef} className="js-detail-card js-bio-card">
            <div className="js-card-header">
              <UserIcon size={18} />
              <h3>About {profile.name}</h3>
            </div>
            <p className="js-bio-text">{profile.bio || profile.about || "No description provided."}</p>
          </div>

          <div ref={basicRef} className="js-detail-card">
            <div className="js-card-header">
              <Info size={18} />
              <h3>Basic Information</h3>
            </div>
            <div className="js-info-list">
              {[
                { label: 'Religion', value: profile.religion },
                { label: 'Caste', value: profile.caste },
                { label: 'Height', value: profile.height ? `${profile.height} cm` : null },
                { label: 'Mother Tongue', value: profile.mother_tongue },
                { label: 'Marital Status', value: profile.marital_status?.replace(/_/g, ' ') },
              ].filter(i => i.value).map(item => (
                <div key={item.label} className="js-info-item">
                  <span className="js-info-label">{item.label}</span>
                  <span className="js-info-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div ref={careerRef} className="js-detail-card">
            <div className="js-card-header">
              <Briefcase size={18} />
              <h3>Education & Career</h3>
            </div>
            <div className="js-info-list">
              {[
                { label: 'Education', value: profile.education },
                { label: 'Profession', value: profile.profession },
                { label: 'Income', value: profile.income },
              ].filter(i => i.value).map(item => (
                <div key={item.label} className="js-info-item">
                  <span className="js-info-label">{item.label}</span>
                  <span className="js-info-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div ref={locationRef} className="js-detail-card">
            <div className="js-card-header">
              <MapPin size={18} />
              <h3>Location & Lifestyle</h3>
            </div>
            <div className="js-info-list">
              {[
                { label: 'City', value: profile.city },
                { label: 'State', value: profile.state },
                { label: 'Country', value: profile.country },
                { label: 'Eating', value: profile.eating_habits },
              ].filter(i => i.value).map(item => (
                <div key={item.label} className="js-info-item">
                  <span className="js-info-label">{item.label}</span>
                  <span className="js-info-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div ref={contactRef} className="js-detail-card js-contact-card">
            <div className="js-card-header">
              <Phone size={18} />
              <h3>Contact Details</h3>
            </div>
            <div className="js-info-list">
              <div className="js-info-item">
                <span className="js-info-label"><Mail size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Email ID</span>
                <span className="js-info-value blurred">{maskEmail(profile.email || profile.contact_details?.email)}</span>
              </div>
              <div className="js-info-item">
                <span className="js-info-label"><Phone size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Mobile Number</span>
                <span className="js-info-value blurred">{maskPhone(profile.mobile || profile.contact_details?.mobile)}</span>
              </div>
            </div>
            <p className="js-contact-hint">Visible after interest is accepted</p>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM ACTIONS */}
      {!isOwn && (
        <div className="js-sticky-action-bar">

          {/* INTEREST BUTTON — varies by scenario */}
          {isAnyBlocked ? (
            /* Blocked state — show block/unblock only */
            iBlockedThem ? (
              <button className="js-circle-action" onClick={handleUnblock} disabled={blocking}>
                <div className="js-icon-circle" style={{ background: '#64748b' }}><Ban size={24} color="#fff" /></div>
                <span>Unblock</span>
              </button>
            ) : null /* iAmBlocked — no interest action available */
          ) : isAcceptedVP ? (
            /* Mutual — show a connected tick */
            <button className="js-circle-action" disabled>
              <div className="js-icon-circle" style={{ background: '#16a34a' }}><CheckCircle size={24} fill="#fff" color="#fff" /></div>
              <span>Connected</span>
            </button>
          ) : isPendingVP && iAmSenderVP ? (
            /* I sent, waiting */
            <button className="js-circle-action sent" disabled>
              <div className="js-icon-circle"><CheckCircle size={24} fill="#D63447" color="#fff" /></div>
              <span>Interest Sent</span>
            </button>
          ) : (
            /* No interest, rejected or pending-received — show Send Interest */
            <button
              className="js-circle-action"
              onClick={handleSendInterest}
              disabled={sending}
            >
              <div className="js-icon-circle"><Heart size={24} color="#fff" /></div>
              <span>{isRejectedVP && iAmSenderVP ? 'Re-send' : 'Interest'}</span>
            </button>
          )}

          {/* SHORTLIST */}
          <button
            className={`js-circle-action ${isShortlisted ? 'active' : ''}`}
            onClick={handleToggleShortlist}
            disabled={shortlisting}
          >
            <div className="js-icon-circle">
              <Star size={24} fill={isShortlisted ? "#fff" : "none"} color="#fff" />
            </div>
            <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
          </button>
          {/* SHARE */}
          <button className="js-circle-action" onClick={() => setShowShareModal(true)}>
            <div className="js-icon-circle"><Share2 size={24} color="#fff" /></div>
            <span>Share</span>
          </button>          {/* CHAT */}
          <button className="js-circle-action" onClick={() => navigate(`/chat/${id}`)}>
            <div className="js-icon-circle"><MessageCircle size={24} color="#fff" /></div>
            <span>Chat</span>
          </button>

          {/* BLOCK — always available, shown last */}
          {!isAnyBlocked && (
            <button className="js-circle-action" onClick={handleBlock} disabled={blocking}>
              <div className="js-icon-circle" style={{ background: '#64748b' }}><Ban size={24} color="#fff" /></div>
              <span>Block</span>
            </button>
          )}

        </div>
      )}

      {/* TRADITIONAL BIO-DATA MODAL */}
      {showBioDataModal && (
        <div className="bm-overlay" onClick={() => setShowBioDataModal(false)}>
          <div className="bm-modal" onClick={e => e.stopPropagation()}>

            {/* ── TOP TOOLBAR ── */}
            <div className="bm-toolbar no-print">
              <div className="bm-toolbar-left">
                {/* Language toggle */}
                <div className="bm-lang-toggle">
                  <button className={biodataLang === 'mr' ? 'active' : ''} onClick={() => setBiodataLang('mr')}>मराठी</button>
                  <button className={biodataLang === 'en' ? 'active' : ''} onClick={() => setBiodataLang('en')}>English</button>
                </div>
                
                {/* Theme Dropdown to save maximum space */}
                <span className="bm-toolbar-label">Theme:</span>
                <select className="bm-theme-select" value={bgType} onChange={e => setBgType(e.target.value)}>
                  <option value="cream">🏺 Cream</option>
                  <option value="saffron">🌸 Saffron</option>
                  <option value="pink">🌷 Rose</option>
                  <option value="green">🍃 Green</option>
                  <option value="blue">🌊 Navy</option>
                  <option value="floral">🌺 Floral</option>
                  <option value="gold">✨ Gold</option>
                  <option value="dark-royal">👑 Dark Royal</option>
                  <option value="dark-maroon">🍷 Dark Maroon</option>
                  <option value="teal">🦚 Teal</option>
                  <option value="modern">⚡ Modern</option>
                </select>

                {/* Google Transliteration Status (Dynamic feedback button) */}
                {translitStatus === 'active' ? (
                  <button className="bm-status-btn bm-status-btn--success" disabled title="Google Transliteration Service is active and working successfully.">
                    Google Translator ✔
                  </button>
                ) : (
                  <button className="bm-status-btn bm-status-btn--danger" disabled title="Google Transliteration Service is disconnected. Using offline fallback dictionary.">
                    Google Translator
                  </button>
                )}
              </div>
              <div className="bm-toolbar-right">
                {isOwn && (
                  <button className="bm-btn-undo" onClick={undo} disabled={history.length < 2} title="Ctrl+Z">↩ Undo</button>
                )}
                <button className="bm-btn-print" onClick={handleDownloadImage} style={{ background: '#059669', color: '#fff' }}><Download size={14} /> Download Image</button>
                <button className="bm-btn-print" onClick={handleDownloadPDF} style={{ background: '#2563eb', color: '#fff' }}><FileText size={14} /> Download PDF</button>
                <button className="bm-btn-print" onClick={() => window.print()}><Printer size={14} /> Print</button>
                <button className="bm-btn-close" onClick={() => setShowBioDataModal(false)}><CloseIcon size={20} /></button>
              </div>
            </div>

            {/* ── SPLIT BODY ── */}
            <div className="bm-body">

              {/* ══ LEFT: FORM EDITOR ══ */}
              {isOwn && (
                <div className="bm-editor no-print">
                  {biodataLang === 'mr' && (
                    <div className="bm-translit-hint" style={{
                      background: 'rgba(244, 122, 32, 0.08)',
                      border: '1px solid rgba(244, 122, 32, 0.2)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      marginBottom: '15px',
                      fontSize: '12px',
                      color: '#c2410c',
                      lineHeight: '1.5',
                      fontFamily: 'Outfit, sans-serif'
                    }}>
                      💡 English typed word will get converted into Marathi Automatically,After any word is typed just enter Space bar to get that word converted into  Marathi
                    </div>
                  )}
                  {/* God photo controls */}
                  <div className="bm-editor-section">
                    <div className="bm-editor-sec-title">🙏 Blessing / Deity Photo</div>
                    <div className="bm-ctrl-row">
                      <label className="bm-check-label">
                        <input type="checkbox" checked={showGodPhoto}
                          onChange={e => setShowGodPhoto(e.target.checked)} />
                        Show God Photo
                      </label>
                      <input type="file" id="bm-god-file" hidden accept="image/*"
                        onChange={e => { const f = e.target.files[0]; if (f) setCustomGodPhoto(URL.createObjectURL(f)); }} />
                      <button className="bm-upload-btn" onClick={() => document.getElementById('bm-god-file').click()}>
                        ↑ Upload God Photo
                      </button>
                    </div>
                    <div className="bm-ctrl-row">
                      <label className="bm-small-label">Blessing Text</label>
                      <input className="bm-field-value" value={godBlessingText}
                        onChange={e => setGodBlessingText(e.target.value)}
                        onKeyUp={e => handleGenericTranslit(e, godBlessingText, (val) => setGodBlessingText(val))}
                        onBlur={e => handleGenericTranslit(e, godBlessingText, (val) => setGodBlessingText(val))}
                        placeholder="e.g. ॥ श्री गणेशाय नमः ॥" style={{ flex: 1 }} />
                    </div>
                    <div className="bm-ctrl-row">
                      <label className="bm-small-label">Size</label>
                      <input type="range" min="40" max="180" value={godPos.w}
                        onChange={e => setGodPos(p => ({ ...p, w: +e.target.value }))} style={{ flex: 1 }} />
                      <span className="bm-small-label">{godPos.w}px</span>
                    </div>
                  </div>

                  {/* Profile photo controls */}
                  <div className="bm-editor-section">
                    <div className="bm-editor-sec-title">📸 Profile Photo</div>
                    <div className="bm-ctrl-row">
                      <label className="bm-check-label">
                        <input type="checkbox" checked={showPhotoOnBio}
                          onChange={e => setShowPhotoOnBio(e.target.checked)} />
                        Show Photo
                      </label>
                      <input type="file" id="bm-user-file" hidden accept="image/*"
                        onChange={e => { const f = e.target.files[0]; if (f) setCustomUserPhoto(URL.createObjectURL(f)); }} />
                      <button className="bm-upload-btn" onClick={() => document.getElementById('bm-user-file').click()}>
                        ↑ Upload Photo
                      </button>
                    </div>
                    <div className="bm-ctrl-row">
                      <label className="bm-small-label">Size</label>
                      <input type="range" min="80" max="280" value={userPos.w}
                        onChange={e => setUserPos(p => ({ ...p, w: +e.target.value }))} style={{ flex: 1 }} />
                      <span className="bm-small-label">{userPos.w}px</span>
                    </div>
                  </div>

                  {/* Section editor */}
                  {sections.map((sec, sIdx) => (
                    <div key={sec.id} className="bm-editor-section">
                      <div className="bm-editor-sec-header">
                        <input className="bm-sec-title-input" value={sec.title}
                          onChange={e => setSections(prev => prev.map(s => s.id === sec.id ? { ...s, title: e.target.value } : s))}
                          onKeyUp={e => handleGenericTranslit(e, sec.title, (val) => setSections(prev => prev.map(s => s.id === sec.id ? { ...s, title: val } : s)))}
                          onBlur={e => handleGenericTranslit(e, sec.title, (val) => setSections(prev => prev.map(s => s.id === sec.id ? { ...s, title: val } : s)))}
                          placeholder="Section title..." />
                        <div className="bm-sec-btns">
                          {sIdx > 0 && (
                            <button className="bm-sec-move" title="Move Up"
                              onClick={() => setSections(prev => { const a = [...prev]; [a[sIdx-1], a[sIdx]] = [a[sIdx], a[sIdx-1]]; return a; })}>↑</button>
                          )}
                          {sIdx < sections.length - 1 && (
                            <button className="bm-sec-move" title="Move Down"
                              onClick={() => setSections(prev => { const a = [...prev]; [a[sIdx], a[sIdx+1]] = [a[sIdx+1], a[sIdx]]; return a; })}>↓</button>
                          )}
                          <button className="bm-sec-del" onClick={() => removeSection(sec.id)}>✕</button>
                        </div>
                      </div>

                      {sec.fields.map((f, fIdx) => (
                        <div key={fIdx} className="bm-field-row">
                          <input className="bm-field-label" value={f.label}
                            onChange={e => updateField(sec.id, fIdx, 'label', e.target.value)}
                            onKeyUp={e => handleGenericTranslit(e, f.label, (val) => updateField(sec.id, fIdx, 'label', val))}
                            onBlur={e => handleGenericTranslit(e, f.label, (val) => updateField(sec.id, fIdx, 'label', val))}
                            placeholder="Label" />
                          <span className="bm-colon">:</span>
                          <input className="bm-field-value" value={f.value}
                            onChange={e => updateField(sec.id, fIdx, 'value', e.target.value)}
                            onKeyUp={e => handleGenericTranslit(e, f.value, (val) => updateField(sec.id, fIdx, 'value', val))}
                            onBlur={e => handleGenericTranslit(e, f.value, (val) => updateField(sec.id, fIdx, 'value', val))}
                            placeholder="Value" />
                          <button className="bm-field-add" title="Add row below"
                            onClick={() => setSections(prev => prev.map(s => s.id === sec.id ? {
                              ...s, fields: [...s.fields.slice(0, fIdx + 1), { label: '', value: '' }, ...s.fields.slice(fIdx + 1)]
                            } : s))}>+</button>
                          <button className="bm-field-del" title="Remove row"
                            onClick={() => removeField(sec.id, fIdx)}>−</button>
                        </div>
                      ))}

                      <button className="bm-add-section-below"
                        onClick={() => addSection(sec.id)}>+ Add Section Below</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bm-preview-wrap">
                <div className="bm-preview-container">
                  <div className={`bm-card bm-card--${bgType}`} id="biodata-to-print">
                    <div className="bm-card-inner-border"></div>

                  {/* ── Card Header: 3-column [Ganesha | Title | Spacer] ── */}
                  <div className="bm-card-header">
                    {/* Left: Deity image */}
                    <div className="bm-card-header-god">
                      {showGodPhoto && (
                        <img src={customGodPhoto || godPhoto} alt="Deity"
                          style={{ width: godPos.w, height: 'auto', display: 'block', cursor: isOwn ? 'move' : 'default' }}
                          onMouseDown={isOwn ? e => handleDragStart(e, 'god') : undefined}
                          onTouchStart={isOwn ? e => handleDragStart(e, 'god') : undefined}
                          onError={e => { e.target.style.display = 'none'; }} />
                      )}
                    </div>
                    {/* Center: Title */}
                    <div className="bm-card-header-center">
                      <div className="bm-god-text">{godBlessingText}</div>
                      <div className="bm-card-title">परिचय पत्रिका</div>
                    </div>
                    {/* Right: Spacer to keep title centered */}
                    <div className="bm-card-header-spacer"></div>
                  </div>

                  {/* Sections — first section gets photo on right */}
                  {sections.map((sec, secIdx) => (
                    <div key={sec.id} className="bm-card-section">
                      <div className="bm-card-sec-title">{sec.title}</div>
                      {secIdx === 0 ? (
                        /* First section: fields on left, profile photo on right */
                        <div className="bm-sec1-layout">
                          <div className="bm-card-fields bm-card-fields--sec1">
                            {sec.fields.map((f, i) => (
                              <div key={i} className="bm-card-field-row">
                                <span className="bm-card-label">{f.label}</span>
                                <span className="bm-card-colon"> : </span>
                                <span className="bm-card-value">{f.value}</span>
                              </div>
                            ))}
                          </div>
                          {showPhotoOnBio && (
                            <div className="bm-sec1-photo">
                              <div className="bm-photo-frame" style={{ width: userPos.w, height: Math.round(userPos.w * 1.3) }}>
                                <img src={customUserPhoto || avatarUrl || '/images/default-avatar.png'} alt="Profile"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Other sections: normal full-width layout */
                        <div className="bm-card-fields">
                          {sec.fields.map((f, i) => (
                            <div key={i} className="bm-card-field-row">
                              <span className="bm-card-label">{f.label}</span>
                              <span className="bm-card-colon"> : </span>
                              <span className="bm-card-value">{f.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                </div>
              </div>
            </div>

            </div>{/* /bm-body */}
          </div>{/* /bm-modal */}
        </div>
      )}



      {/* PHOTO MODAL */}
      {showPhotoModal && (
        <div className="js-photo-modal-overlay" onClick={() => setShowPhotoModal(false)}>
          <div className="js-photo-modal-content" onClick={e => e.stopPropagation()}>
            <button className="js-modal-close" onClick={() => setShowPhotoModal(false)}><X size={28} /></button>
            <div className="js-photo-vertical-container">
              {allPhotos.map(p => (
                <div key={p.id} className="js-modal-card-wrap">
                  <img src={p.signed_url} alt="Gallery" className="js-modal-vertical-img" />
                </div>
              ))}
              <div className="js-modal-hint">End of album</div>
            </div>
          </div>
        </div>
      )}

      {/* GUN MILAN MODAL */}
      {showGunMilanModal && (
        <GunMilanModal
          profile={profile}
          myProfile={myProfile}
          defaultTab={gmTab}
          onClose={() => setShowGunMilanModal(false)}
        />
      )}

      {/* GENERATE KUNDALI MODAL */}
      {showGenKundali && (
        <GenerateKundaliModal
          profile={profile}
          onClose={() => setShowGenKundali(false)}
        />
      )}

      {/* PREMIUM SHARE MODAL */}
      {showShareModal && (
        <div className="js-share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="js-share-modal-content" onClick={e => e.stopPropagation()}>
            <div className="js-share-header">
              <img src="/images/sakharpuda-logo.png" alt="SakharPuda" className="js-share-logo" />
              <h3>Share Profile</h3>
              <p>Share this match with family and friends</p>
            </div>
            
            <div className="js-share-options">
              <button className="js-share-opt whatsapp" onClick={shareToWhatsApp}>
                <div className="js-opt-icon-big"><MessageCircle size={32} fill="#25D366" color="#fff" /></div>
                <span>WhatsApp</span>
              </button>
              
              <button className="js-share-opt copy" onClick={copyToClipboard}>
                <div className="js-opt-icon-big"><Copy size={28} color="#6366f1" /></div>
                <span>Copy Link</span>
              </button>
              
              <button className="js-share-opt more" onClick={handleNativeShare}>
                <div className="js-opt-icon-big"><Share2 size={28} color="#1e293b" /></div>
                <span>More Apps</span>
              </button>
            </div>
            
            <button className="js-share-cancel" onClick={() => setShowShareModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .vp-page-wrapper { min-height: 100vh; background: #f8fafc; padding-bottom: 80px; }
        .js-view-profile-container { max-width: 1200px; margin: 0 auto; padding: 20px; position: relative; }
        
        /* Swipe Arrows */
        .js-swipe-arrow {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          width: 56px;
          height: 56px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid #e2e8f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1000;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          color: #1e293b;
          transition: all 0.2s;
          backdrop-filter: blur(4px);
        }
        .js-swipe-arrow:hover { background: #fff; color: #D63447; transform: translateY(-50%) scale(1.1); }
        .js-swipe-arrow.left { left: 20px; }
        .js-swipe-arrow.right { right: 20px; }
        
        @media (max-width: 768px) {
          .js-swipe-arrow { width: 44px; height: 44px; }
          .js-swipe-arrow.left { left: 5px; background: rgba(255, 255, 255, 0.4); }
          .js-swipe-arrow.right { right: 5px; background: rgba(255, 255, 255, 0.4); }
        }

        .js-profile-hero { display: flex; justify-content: center; margin-bottom: 20px; }
        .js-hero-card { width: 100%; max-width: 500px; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); background: #fff; }
        .js-hero-photo-box { height: 550px; position: relative; }
        .js-hero-img { width: 100%; height: 100%; object-fit: cover; }
        
        .js-top-left-overlay { position: absolute; top: 20px; left: 20px; z-index: 100; }
        .js-circle-back { 
          width: 44px; height: 44px; background: rgba(0,0,0,0.3); border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; cursor: pointer; 
          backdrop-filter: blur(8px); transition: all 0.2s;
        }
        .js-circle-back:hover { background: rgba(0,0,0,0.5); transform: translateX(-4px); }

        .js-top-right-overlay { position: absolute; top: 20px; right: 20px; z-index: 100; }
        .js-badge-row { display: flex; gap: 10px; align-items: center; }
        
        .js-premium-badge { 
          background: #fff; 
          color: #1e293b; 
          padding: 8px 14px; 
          border-radius: 20px; 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          font-size: 14px; 
          font-weight: 800; 
          cursor: pointer; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.2s;
        }
        /* Bottom Info Overlay (Matching ProfileCard) */
        .js-bottom-info-overlay { 
          position: absolute; 
          bottom: 0; left: 0; right: 0; 
          background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 70%, transparent 100%); 
          padding: 60px 24px 24px; 
          color: #fff; 
          .js-bottom-info-content { width: 100%; }
        }
        .js-name-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
        .js-candidate-name { font-size: 24px; font-weight: 800; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.3); margin: 0; }
        .js-candidate-age, .js-candidate-id { font-size: 18px; font-weight: 600; color: rgba(255,255,255,0.9); text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .js-managed-by { font-size: 12px; opacity: 0.8; font-style: italic; color: #fff; }

        /* Sticky Action Bar */
        .js-sticky-action-bar {
          position: fixed;
          bottom: 70px; /* Above bottom nav */
          left: 0; right: 0;
          height: 90px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          background: transparent;
          z-index: 1100;
          padding: 0 15px;
          padding-right: 19px; /* Shifted left by ~1mm (+4px to existing padding-right) */
        }

        .js-circle-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
        }
        .js-circle-action:hover { transform: translateY(-3px); }
        .js-icon-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid rgba(0,0,0,0.3);
          transition: all 0.2s;
        }
        .js-circle-action span {
          color: #000000;
          font-size: 11.5px;
          font-weight: 900;
          opacity: 1;
          margin-top: 4px;
          letter-spacing: -0.2px;
          text-shadow: 0 0 1px #000; /* Simulated extra weight */
        }
        .js-circle-action.active .js-icon-circle { background: #D63447; border-color: rgba(214, 52, 71, 0.5); }
        .js-circle-action.sent .js-icon-circle { background: #fff; border-color: #e2e8f0; }
        .js-circle-action.sent span { color: #1e293b; text-shadow: none; }
        .js-circle-action.sent .js-icon-circle svg { color: #D63447; }
        
        /* Premium Share Modal */
        .js-share-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);
          display: flex; align-items: flex-end; justify-content: center;
          z-index: 10001; padding: 20px;
        }
        .js-share-modal-content {
          width: 100%; max-width: 450px; background: #fff;
          border-radius: 30px 30px 24px 24px; padding: 30px 24px;
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        
        .js-share-header { text-align: center; margin-bottom: 30px; }
        .js-share-logo { height: 26px; width: auto; margin-bottom: 12px; }
        .js-share-header h3 { font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 6px; }
        .js-share-header p { font-size: 14px; color: #64748b; }
        
        .js-share-options { display: flex; justify-content: space-around; margin-bottom: 30px; }
        .js-share-opt {
          background: none; border: none; display: flex; flex-direction: column;
          align-items: center; gap: 10px; cursor: pointer; transition: transform 0.2s;
        }
        .js-share-opt:hover { transform: scale(1.1); }
        .js-share-opt span { font-size: 12px; font-weight: 700; color: #1e293b; }
        
        .js-opt-icon-big {
          width: 64px; height: 64px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: #f8fafc; border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .js-share-opt.whatsapp .js-opt-icon-big { background: #f0fdf4; border-color: #dcfce7; }
        .js-share-opt.copy .js-opt-icon-big { background: #eef2ff; border-color: #e0e7ff; }
        
        .js-share-cancel {
          width: 100%; padding: 16px; border-radius: 16px; border: none;
          background: #f1f5f9; color: #1e293b; font-weight: 800; font-size: 15px;
          cursor: pointer; transition: background 0.2s;
        }
        .js-share-cancel:hover { background: #e2e8f0; }

        /* ANCHORS */
        .js-profile-anchors {
          display: flex; gap: 10px; overflow-x: auto; padding: 15px 0;
          position: sticky; top: 60px; background: #f8fafc; z-index: 100;
          scrollbar-width: none; border-bottom: 1px solid #e2e8f0; margin-bottom: 25px;
        }
        .js-profile-anchors::-webkit-scrollbar { display: none; }
        .js-profile-anchors button {
          flex-shrink: 0; padding: 8px 20px; border-radius: 20px;
          background: #fff; border: 1px solid #e2e8f0; color: #475569;
          font-size: 14px; font-weight: 700; cursor: pointer;
        }
        .js-profile-anchors button:hover { border-color: #D63447; color: #D63447; }

        .js-profile-details-content { display: flex; flex-direction: column; gap: 24px; }
        .js-detail-card { background: #fff; border-radius: 20px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); scroll-margin-top: 120px; }
        .js-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
        .js-card-header h3 { font-size: 18px; font-weight: 800; margin: 0; color: #1e293b; }
        
        .js-info-list { display: flex; flex-direction: column; gap: 16px; }
        .js-info-item { display: flex; justify-content: space-between; border-bottom: 1px solid #f8fafc; padding-bottom: 8px; }
        .js-info-label { font-size: 13px; color: #64748b; font-weight: 600; }
        .js-info-value { font-size: 14px; color: #1e293b; font-weight: 700; }
        .js-info-value.blurred { filter: blur(4px); opacity: 0.6; user-select: none; }
        
        .js-contact-hint { margin-top: 15px; font-size: 12px; color: #94a3b8; font-style: italic; }

        .js-photo-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 10000; overflow-y: auto; padding: 40px 20px; backdrop-filter: blur(10px); display: flex; flex-direction: column; align-items: center; }
        .js-photo-vertical-container { display: flex; flex-direction: column; gap: 20px; width: 100%; max-width: 500px; padding-bottom: 80px; }
        .js-modal-card-wrap { width: 100%; border-radius: 24px; overflow: hidden; height: 550px; background: #1a1a1a; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .js-modal-vertical-img { width: 100%; height: 100%; object-fit: cover; }
        .js-modal-close { position: fixed; top: 20px; right: 20px; background: rgba(255,255,255,0.2); border: none; border-radius: 50%; width: 44px; height: 44px; color: #fff; cursor: pointer; z-index: 10001; }

        @media (max-width: 600px) {
          .js-hero-photo-box, .js-modal-card-wrap { height: 450px; }
        }

        /* USP Bar */
        .js-usp-bar {
          background: #fff; border-bottom: 1px solid #e2e8f0; padding: 12px 0;
        }
        .js-usp-container { max-width: 1200px; margin: 0 auto; display: flex; gap: 12px; padding: 0 20px; }
        @media (max-width: 768px) {
          .js-usp-container {
            flex-direction: column;
            gap: 8px;
          }
          .js-usp-btn {
            width: 100%;
            padding: 12px;
            font-size: 13px !important;
          }
        }
        .js-usp-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px; border-radius: 12px; border: 1.5px solid #e2e8f0;
          font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.25s ease;
          background: #fff; color: #475569;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }
        .js-usp-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
        }
        .js-usp-btn.bio {
          border-color: var(--clr-primary);
          color: var(--clr-primary);
          background: #fff;
        }
        .js-usp-btn.bio:hover {
          background: rgba(214, 52, 71, 0.03);
          border-color: var(--clr-primary-light);
          color: var(--clr-primary-light);
        }
        .js-usp-btn.guna {
          border: none;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #d97706 100%);
          color: #fff;
          box-shadow: 0 4px 12px rgba(244, 122, 32, 0.2);
        }
        .js-usp-btn.guna:hover {
          background: linear-gradient(135deg, #ea580c 0%, #d84a00 50%, #b45309 100%);
          box-shadow: 0 6px 18px rgba(244, 122, 32, 0.35);
        }
        .js-usp-btn.patrika {
          border: none;
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
          color: #fff;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        }
        .js-usp-btn.patrika:hover {
          background: linear-gradient(135deg, #16133a 0%, #252269 50%, #3b1078 100%);
          box-shadow: 0 6px 18px rgba(79, 70, 229, 0.35);
        }

        /* MATCHING CHARTS */
        .gm-matching-charts-section {
          padding: 20px;
          background: #fffbeb;
          border-bottom: 1px solid #e2e8f0;
          font-family: sans-serif;
        }
        .gm-matching-charts-title {
          font-size: 16px;
          font-weight: 800;
          color: #7c1d1d;
          text-align: center;
          margin: 0 0 16px;
        }
        .gm-matching-charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .gm-chart-container-half {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #fff;
          border: 1px solid #fde68a;
          border-radius: 12px;
          padding: 12px;
        }
        .gm-chart-label {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 8px;
        }

        /* ── GUN MILAN MODAL ── */
        .gm-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85);
          z-index: 3000; display: flex; align-items: flex-start; justify-content: center;
          overflow-y: auto; padding: 10px; backdrop-filter: blur(8px);
        }
        .gm-modal {
          width: 100%; max-width: 820px; background: #fff;
          border-radius: 20px; overflow: hidden; position: relative;
          margin: auto; box-shadow: 0 30px 80px rgba(0,0,0,0.5);
        }
        .gm-toolbar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 16px; background: #1e1b4b; gap: 12px; flex-wrap: wrap;
        }
        .gm-toolbar-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .gm-toolbar-right { display: flex; align-items: center; gap: 8px; }
        .gm-lang-toggle { display: flex; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.2); }
        .gm-lang-toggle button { padding: 5px 12px; font-size: 12px; font-weight: 600; background: transparent; color: rgba(255,255,255,0.6); border: none; cursor: pointer; transition: all 0.2s; }
        .gm-lang-toggle button.active { background: rgba(255,255,255,0.15); color: #fff; }
        .gm-tab-btns { display: flex; gap: 6px; }
        .gm-tab-btns button { padding: 5px 12px; font-size: 12px; font-weight: 600; border-radius: 8px; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); border: none; cursor: pointer; transition: all 0.2s; }
        .gm-tab-btns button.active { background: rgba(255,255,255,0.25); color: #fff; }
        .gm-dl-btn { display: flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; background: #059669; color: #fff; border: none; cursor: pointer; }
        .gm-dl-btn.pdf { background: #2563eb; }
        .gm-close-btn { background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 8px; padding: 6px; cursor: pointer; display: flex; align-items: center; }
        .gm-body { overflow-y: auto; max-height: calc(100vh - 80px); }
        .gm-print-area { background: #fff; }

        /* PATRIKA CARD */
        .gm-patrika-card, .gm-milan-card {
          padding: 0;
          font-family: 'Georgia', serif;
        }
        .gm-patrika-header, .gm-milan-header {
          background: linear-gradient(135deg, #7c1d1d 0%, #b91c1c 40%, #f97316 100%);
          padding: 24px 20px 20px;
          text-align: center;
          color: #fff;
        }
        .gm-patrika-blessing { font-size: 14px; opacity: 0.9; letter-spacing: 2px; margin-bottom: 8px; font-style: italic; }
        .gm-patrika-title { font-size: 26px; font-weight: 800; margin: 0 0 4px; letter-spacing: 1px; }
        .gm-patrika-subtitle { font-size: 13px; opacity: 0.85; margin: 0; }
        .gm-person-banner {
          display: flex; justify-content: space-between; align-items: center;
          background: #fef3c7; padding: 10px 20px;
          border-bottom: 2px solid #f59e0b;
        }
        .gm-person-name { font-size: 18px; font-weight: 700; color: #92400e; }
        .gm-person-id { font-size: 12px; color: #78350f; opacity: 0.8; }
        .gm-patrika-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          padding: 16px;
          background: #fffbeb;
        }
        .gm-patrika-row {
          display: flex; flex-direction: column; padding: 10px 14px;
          border-bottom: 1px solid #fde68a;
          border-right: 1px solid #fde68a;
        }
        .gm-patrika-row:nth-child(even) { border-right: none; }
        .gm-patrika-label { font-size: 11px; color: #78350f; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; font-family: sans-serif; }
        .gm-patrika-value { font-size: 15px; color: #1e293b; font-weight: 600; margin-top: 2px; }
        .gm-note { font-size: 11px; color: #64748b; padding: 8px 20px; font-style: italic; text-align: center; font-family: sans-serif; }
        .gm-patrika-footer {
          display: flex; justify-content: space-between; padding: 12px 20px;
          background: #7c1d1d; color: rgba(255,255,255,0.8); font-size: 12px; font-family: sans-serif;
        }
        .gm-no-data {
          padding: 40px; text-align: center; color: #64748b; font-family: sans-serif;
        }

        /* MILAN CARD */
        .gm-persons-compare {
          display: flex; align-items: center; justify-content: center; gap: 12px;
          padding: 16px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;
          font-family: sans-serif;
        }
        .gm-person-box { flex: 1; text-align: center; background: #fff; border-radius: 12px; padding: 12px; border: 1px solid #e2e8f0; }
        .gm-person-role { font-size: 11px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; }
        .gm-person-name-sm { font-size: 15px; font-weight: 700; color: #1e293b; margin: 4px 0; }
        .gm-person-detail { font-size: 12px; color: #64748b; }
        .gm-vs-circle { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }

        .gm-score-wrap {
          display: flex; align-items: center; gap: 20px; padding: 20px 24px;
          background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-family: sans-serif;
        }
        .gm-score-wrap.excellent { background: #f0fdf4; border-color: #bbf7d0; }
        .gm-score-wrap.good { background: #eff6ff; border-color: #bfdbfe; }
        .gm-score-wrap.average { background: #fffbeb; border-color: #fde68a; }
        .gm-score-wrap.poor { background: #fff1f2; border-color: #fecdd3; }
        .gm-score-circle {
          width: 80px; height: 80px; border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(124,58,237,0.3);
        }
        .gm-score-wrap.excellent .gm-score-circle { background: linear-gradient(135deg, #16a34a, #15803d); box-shadow: 0 4px 16px rgba(22,163,74,0.3); }
        .gm-score-wrap.good .gm-score-circle { background: linear-gradient(135deg, #2563eb, #1d4ed8); box-shadow: 0 4px 16px rgba(37,99,235,0.3); }
        .gm-score-wrap.average .gm-score-circle { background: linear-gradient(135deg, #d97706, #b45309); box-shadow: 0 4px 16px rgba(217,119,6,0.3); }
        .gm-score-wrap.poor .gm-score-circle { background: linear-gradient(135deg, #dc2626, #b91c1c); box-shadow: 0 4px 16px rgba(220,38,38,0.3); }
        .gm-score-num { font-size: 28px; font-weight: 800; color: #fff; line-height: 1; }
        .gm-score-denom { font-size: 12px; color: rgba(255,255,255,0.8); }
        .gm-score-label { flex: 1; }
        .gm-score-level { font-size: 18px; font-weight: 700; color: #1e293b; }
        .gm-score-verdict { font-size: 13px; color: #475569; margin-top: 4px; }

        .gm-koota-table { width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 13px; }
        .gm-koota-table thead { background: #1e1b4b; color: #fff; }
        .gm-koota-table th { padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; }
        .gm-koota-table tbody tr { border-bottom: 1px solid #f1f5f9; }
        .gm-koota-table tbody tr:hover { background: #f8fafc; }
        .gm-row-dosha { background: #fff1f2 !important; }
        .gm-row-full { background: #f0fdf4 !important; }
        .gm-koota-name { padding: 10px 12px; min-width: 130px; }
        .gm-dosha-badge { display: block; font-size: 10px; color: #dc2626; font-weight: 600; margin-top: 2px; }
        .gm-koota-scored { padding: 10px 8px; width: 120px; }
        .gm-bar-wrap { background: #f1f5f9; border-radius: 4px; height: 6px; margin-bottom: 4px; overflow: hidden; }
        .gm-bar { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
        .gm-scored-num { font-size: 13px; font-weight: 700; }
        .gm-koota-max { padding: 10px 8px; color: #64748b; }
        .gm-koota-detail { padding: 10px 8px; color: #475569; font-size: 12px; }
        .gm-total-row { background: #1e1b4b !important; color: #fff; }
        .gm-total-row td { padding: 10px 12px; font-size: 15px; }

        .gm-dosha-warnings {
          padding: 16px 20px; background: #fff7ed; border-top: 2px solid #fed7aa;
          font-family: sans-serif;
        }
        .gm-dosha-warnings h4 { font-size: 14px; font-weight: 700; color: #c2410c; margin: 0 0 8px; }
        .gm-dosha-warnings p { font-size: 13px; color: #7c2d12; margin: 4px 0; }

        .gm-scale { padding: 16px 20px; font-family: sans-serif; }
        .gm-scale-bar { position: relative; background: linear-gradient(90deg, #dc2626 0%, #f97316 50%, #16a34a 100%); height: 10px; border-radius: 5px; margin-bottom: 6px; }
        .gm-scale-fill { position: absolute; top: 0; left: 0; height: 100%; background: transparent; }
        .gm-scale-marker { position: absolute; top: -4px; width: 18px; height: 18px; background: #1e293b; border: 2px solid #fff; border-radius: 50%; transform: translateX(-50%); box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .gm-scale-labels { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
        .gm-scale-text { font-size: 12px; color: #475569; text-align: center; margin-top: 4px; }

        @media (max-width: 600px) {
          .gm-modal { border-radius: 12px 12px 0 0; margin-top: auto; }
          .gm-patrika-grid { grid-template-columns: 1fr; }
          .gm-patrika-row { border-right: none !important; }
          .gm-persons-compare { flex-direction: column; }
          .gm-toolbar { flex-direction: column; align-items: flex-start; }
          .gm-koota-detail { display: none; }
        }


        /* BioData Modal - Fully Responsive */
        .js-biodata-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.95);
          z-index: 3000; display: flex; align-items: flex-start; justify-content: center;
          overflow-y: auto; padding: 10px; backdrop-filter: blur(12px);
        }
        .js-biodata-modal {
          width: 100%; max-width: 850px; background: #fff;
          border-radius: 20px; overflow: hidden; position: relative;
          box-shadow: 0 40px 80px rgba(0,0,0,0.8);
          margin: 20px auto 40px;
        }

        /* ── NEW BM BIODATA MAKER ── */
        .bm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 3000; display: flex; align-items: flex-start; justify-content: center; overflow-y: auto; padding: 0; backdrop-filter: blur(12px); }
        .bm-modal { width: 100%; max-width: 1300px; background: #fff; border-radius: 0 0 20px 20px; overflow: hidden; display: flex; flex-direction: column; height: 100vh; min-height: 100vh; }

        /* Toolbar */
        .bm-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; background: #1e293b; gap: 8px; flex-wrap: wrap; flex-shrink: 0; }
        .bm-toolbar-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .bm-toolbar-right { display: flex; align-items: center; gap: 8px; }
        .bm-toolbar-label { font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .bm-lang-toggle { display: flex; background: #334155; border-radius: 8px; overflow: hidden; }
        .bm-lang-toggle button { padding: 5px 14px; border: none; background: transparent; color: #94a3b8; font-size: 12px; font-weight: 700; cursor: pointer; }
        .bm-lang-toggle button.active { background: #F47A20; color: #fff; }
        .bm-theme-select { padding: 6px 12px; border: 1.5px solid #475569; border-radius: 8px; background: #334155; color: #f1f5f9; font-size: 11px; font-weight: 700; cursor: pointer; outline: none; transition: all 0.15s; border-radius: 8px; font-family: inherit; }
        .bm-theme-select:hover, .bm-theme-select:focus { border-color: #F47A20; background: #1e293b; color: #fff; }
        .bm-btn-undo { padding: 6px 12px; border: 1.5px solid #475569; border-radius: 8px; background: transparent; color: #94a3b8; font-size: 11px; font-weight: 700; cursor: pointer; }
        .bm-btn-undo:disabled { opacity: 0.3; cursor: not-allowed; }
        .bm-btn-print { display: flex; align-items: center; gap: 6px; padding: 6px 14px; background: #F47A20; border: none; border-radius: 8px; color: #fff; font-size: 12px; font-weight: 800; cursor: pointer; }
        .bm-btn-close { width: 34px; height: 34px; border-radius: 8px; border: 1px solid #475569; background: transparent; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; }

        /* Split body */
        .bm-body { display: flex; flex: 1; overflow: hidden; }

        /* LEFT EDITOR */
        .bm-editor { width: 42%; min-width: 320px; overflow-y: auto; background: #0f172a; padding: 16px; display: flex; flex-direction: column; gap: 12px; flex-shrink: 0; }
        .bm-editor-section { background: #1e293b; border-radius: 12px; padding: 14px; }
        .bm-editor-sec-title { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #F47A20; margin-bottom: 10px; }
        .bm-editor-sec-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .bm-sec-title-input { flex: 1; padding: 6px 10px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #f1f5f9; font-size: 13px; font-weight: 700; font-family: inherit; }
        .bm-sec-title-input::placeholder { color: #475569; }
        .bm-sec-btns { display: flex; gap: 4px; }
        .bm-sec-move { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: #94a3b8; cursor: pointer; font-size: 13px; }
        .bm-sec-del { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #7f1d1d; background: #450a0a; color: #fca5a5; cursor: pointer; font-size: 13px; }
        .bm-field-row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
        .bm-field-label { width: 38%; padding: 6px 8px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #cbd5e1; font-size: 12px; font-family: inherit; }
        .bm-field-value { flex: 1; padding: 6px 8px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #f1f5f9; font-size: 12px; font-family: inherit; }
        .bm-colon { color: #475569; font-weight: 700; }
        .bm-field-add { width: 26px; height: 26px; border-radius: 6px; border: 1px solid #16a34a; background: #052e16; color: #4ade80; cursor: pointer; font-size: 16px; line-height: 1; }
        .bm-field-del { width: 26px; height: 26px; border-radius: 6px; border: 1px solid #991b1b; background: #3b0606; color: #fca5a5; cursor: pointer; font-size: 16px; line-height: 1; }
        .bm-add-section-below { width: 100%; margin-top: 10px; padding: 7px; background: transparent; border: 1.5px dashed #334155; border-radius: 8px; color: #64748b; font-size: 12px; font-weight: 700; cursor: pointer; }
        .bm-add-section-below:hover { border-color: #22c55e; color: #22c55e; }
        .bm-ctrl-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .bm-select { flex: 1; padding: 6px 8px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #f1f5f9; font-size: 12px; }
        .bm-upload-btn { padding: 6px 12px; background: #F47A20; border: none; border-radius: 8px; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .bm-small-label { font-size: 11px; color: #64748b; white-space: nowrap; }
        .bm-check-label { display: flex; align-items: center; gap: 6px; color: #94a3b8; font-size: 12px; cursor: pointer; }

        /* RIGHT PREVIEW */
        .bm-preview-wrap { flex: 1; overflow-y: auto; background: #e2e8f0; display: flex; justify-content: center; padding: 20px; }
        .bm-preview-container { display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .bm-api-status-bar { width: 100%; display: flex; justify-content: flex-start; }
        .bm-status-btn { display: flex; align-items: center; gap: 8px; padding: 7px 15px; font-size: 11px; font-weight: 800; border-radius: 20px; border: none; cursor: default; box-shadow: 0 4px 10px rgba(0,0,0,0.06); transition: all 0.2s ease; text-transform: uppercase; letter-spacing: 0.5px; }
        .bm-status-btn--success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
        .bm-status-btn--danger { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; animation: pulse-danger 2s infinite; }
        .bm-status-dot { font-size: 10px; }
        @keyframes pulse-danger {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        /* THE CARD */
        .bm-card { position: relative; width: 680px; min-height: 960px; padding: 30px 50px 50px; font-family: 'Noto Sans Devanagari', 'Hind', sans-serif; box-shadow: 0 20px 60px rgba(0,0,0,0.25); }

        /* Themes — reference screenshot: thick dark outer frame + cream interior */
        .bm-card--cream      { background: #fff9f0; border: 10px solid #1a3a4a; box-shadow: 0 20px 60px rgba(0,0,0,0.25); }
        .bm-card--saffron    { background: #fff8ed; border: 10px solid #7a3010; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .bm-card--pink       { background: #fff0f5; border: 10px solid #5c1a38; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .bm-card--green      { background: #f0faf0; border: 10px solid #0d3d1a; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .bm-card--blue       { background: #f0f4ff; border: 10px solid #0d1a5c; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .bm-card--floral     { background: #fff5f8; border: 10px solid #b5476b; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .bm-card--gold       { background: #fffbf0; border: 10px solid #8b6914; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .bm-card--dark-royal { background: #1a1035; color: #e8d5ff; border: 10px solid #6a0dad; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .bm-card--dark-maroon{ background: #1a0808; color: #fce8e8; border: 10px solid #6b0000; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .bm-card--teal       { background: #f0fafa; border: 10px solid #0d4a4a; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .bm-card--modern     { background: #ffffff; border: 6px solid #F47A20; border-top: 20px solid #1e293b; }

        /* Inner border decoration for traditional frames (standard CSS instead of inset box-shadow) */
        .bm-card-inner-border {
          position: absolute;
          top: 8px;
          left: 8px;
          right: 8px;
          bottom: 8px;
          border: 3px solid transparent;
          pointer-events: none;
          border-radius: 4px;
          z-index: 1;
        }
        .bm-card--cream .bm-card-inner-border       { border-color: #8b1a1a; }
        .bm-card--saffron .bm-card-inner-border     { border-color: #c2591a; }
        .bm-card--pink .bm-card-inner-border        { border-color: #9b2a5c; }
        .bm-card--green .bm-card-inner-border       { border-color: #1a6b2a; }
        .bm-card--blue .bm-card-inner-border        { border-color: #1a2b7a; }
        .bm-card--floral .bm-card-inner-border      { border-color: #e8a0b8; }
        .bm-card--gold .bm-card-inner-border        { border-color: #d4a017; }
        .bm-card--dark-royal .bm-card-inner-border  { border-color: #b57bee; }
        .bm-card--dark-maroon .bm-card-inner-border { border-color: #c0392b; }
        .bm-card--teal .bm-card-inner-border        { border-color: #1a8a8a; }
        .bm-card--modern .bm-card-inner-border      { display: none; }
        /* Dark theme text overrides */
        .bm-card--dark-royal .bm-card-label, .bm-card--dark-royal .bm-god-text, .bm-card--dark-royal .bm-card-title, .bm-card--dark-royal .bm-card-sec-title { color: #d4aaff; }
        .bm-card--dark-royal .bm-card-colon { color: #e8d5ff; }
        .bm-card--dark-royal .bm-card-value { color: #f0e8ff; }
        .bm-card--dark-maroon .bm-card-label, .bm-card--dark-maroon .bm-god-text, .bm-card--dark-maroon .bm-card-title, .bm-card--dark-maroon .bm-card-sec-title { color: #ffaaaa; }
        .bm-card--dark-maroon .bm-card-colon { color: #fce8e8; }
        .bm-card--dark-maroon .bm-card-value { color: #fff0f0; }
        /* Floral / Gold / Teal label colors */
        .bm-card--floral .bm-card-label, .bm-card--floral .bm-god-text, .bm-card--floral .bm-card-title, .bm-card--floral .bm-card-sec-title { color: #b5476b; }
        .bm-card--gold   .bm-card-label, .bm-card--gold   .bm-god-text, .bm-card--gold   .bm-card-title, .bm-card--gold   .bm-card-sec-title { color: #8b6914; }
        .bm-card--teal   .bm-card-label, .bm-card--teal   .bm-god-text, .bm-card--teal   .bm-card-title, .bm-card--teal   .bm-card-sec-title { color: #0d4a4a; }

        /* Draggable deity */
        .bm-drag-god { position: absolute; cursor: move; z-index: 10; touch-action: none; }
        .bm-drag-god:hover { outline: 2px dashed #F47A20; outline-offset: 3px; }
        .bm-drag-photo { position: absolute; cursor: move; z-index: 10; touch-action: none; }
        .bm-drag-photo:hover { outline: 2px dashed #F47A20; outline-offset: 3px; }
        .bm-photo-frame { overflow: hidden; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); background: #fff; }

        /* Card header — 3-column flex */
        .bm-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; gap: 10px; }
        .bm-card-header-god { flex: 0 0 auto; min-width: 110px; max-width: 160px; }
        .bm-card-header-center { flex: 1; text-align: center; overflow: hidden; }
        .bm-card-header-spacer { flex: 0 0 auto; min-width: 110px; max-width: 160px; }
        .bm-god-text { font-size: 13px; color: #8b1a1a; font-weight: 700; letter-spacing: 1px; white-space: nowrap; }
        .bm-card-title { font-size: 26px; font-weight: 900; color: #8b1a1a; margin: 2px 0 0; letter-spacing: 2px; white-space: nowrap; font-family: 'Noto Sans Devanagari', serif; }
        .bm-card--blue .bm-god-text, .bm-card--blue .bm-card-title { color: #1a2b7a; }
        .bm-card--green .bm-god-text, .bm-card--green .bm-card-title { color: #1a6b2a; }
        .bm-card--pink .bm-god-text, .bm-card--pink .bm-card-title { color: #9b2a5c; }
        .bm-card--modern .bm-god-text, .bm-card--modern .bm-card-title { color: #F47A20; }

        /* Card sections */
        .bm-card-section { margin-bottom: 18px; }
        .bm-card-sec-title { font-size: 15px; font-weight: 900; color: #8b1a1a; text-align: center; margin-bottom: 10px; letter-spacing: 1px; }
        .bm-card--blue .bm-card-sec-title { color: #1a2b7a; }
        .bm-card--green .bm-card-sec-title { color: #1a6b2a; }
        .bm-card--pink .bm-card-sec-title { color: #9b2a5c; }
        .bm-card--modern .bm-card-sec-title { color: #F47A20; }

        /* Fields — CSS Grid so all colons align to the longest label */
        .bm-card-fields { display: grid; grid-template-columns: max-content auto 1fr; row-gap: 5px; column-gap: 0; }
        .bm-card-fields--sec1 { flex: 1; display: grid; grid-template-columns: max-content auto 1fr; row-gap: 5px; }
        .bm-sec1-layout { display: flex; gap: 16px; align-items: flex-start; }
        .bm-sec1-photo { flex-shrink: 0; display: flex; align-items: flex-start; }
        .bm-card-field-row { display: contents; }
        .bm-card-label { font-size: 14px; font-weight: 700; color: #8b1a1a; white-space: nowrap; padding-right: 2px; align-self: start; line-height: 1.6; }
        .bm-card--blue .bm-card-label { color: #1a2b7a; }
        .bm-card--green .bm-card-label { color: #1a6b2a; }
        .bm-card--pink .bm-card-label { color: #9b2a5c; }
        .bm-card--modern .bm-card-label { color: #F47A20; }
        .bm-card-colon { color: #333; font-weight: 700; padding: 0 6px 0 2px; align-self: start; line-height: 1.6; white-space: nowrap; }
        .bm-card-value { color: #222; font-weight: 500; font-size: 14px; line-height: 1.6; align-self: start; word-break: break-word; }
        .bm-card-footer { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; text-align: center; font-size: 12px; color: #999; letter-spacing: 1px; }

        /* Mobile responsive for split panel */
        @media (max-width: 768px) {
          .bm-modal { height: auto; min-height: 100vh; border-radius: 0; }
          .bm-body { flex-direction: column; }
          .bm-editor { width: 100%; min-width: 0; height: auto; }
          .bm-preview-wrap { padding: 8px; }
          .bm-card { width: 100%; min-height: auto; padding: 20px 16px 30px; }
          .bm-card-header { gap: 6px; }
          .bm-card-header-god { min-width: 70px; max-width: 90px; }
          .bm-card-header-spacer { min-width: 70px; max-width: 90px; }
          .bm-card-title { font-size: 16px; letter-spacing: 0; }
          .bm-god-text { font-size: 11px; }
          .bm-card-label, .bm-card-value, .bm-card-colon { font-size: 11px; }
          .bm-toolbar { flex-wrap: wrap; }
          .bm-sec1-layout { gap: 8px; }
        }

        /* Print */
        @media print {
          .no-print { display: none !important; }
          .bm-overlay { position: static; background: #fff; display: block; }
          .bm-modal { height: auto; display: block; border-radius: 0; }
          .bm-body { display: block; }
          .bm-editor { display: none !important; }
          .bm-preview-wrap { padding: 0; background: #fff; display: block; }
          .bm-card { width: 100%; box-shadow: none; border: 6px double #8b1a1a; min-height: auto; }
        }

        
        .js-biodata-actions {
          padding: 10px 15px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;
          display: flex; justify-content: space-between; align-items: center;
          gap: 10px; position: sticky; top: 0; z-index: 200;
        }
        .js-lang-toggle {
          display: flex; background: #e2e8f0; padding: 2px; border-radius: 6px; gap: 2px;
        }
        .js-lang-btn {
          padding: 4px 10px; border: none; border-radius: 4px; font-size: 11px; font-weight: 800;
          cursor: pointer; transition: all 0.2s; background: transparent; color: #64748b;
        }
        .js-lang-btn.active { background: #fff; color: #F47A20; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        
        /* Responsive Toolbar - Scrollable */
        .js-biodata-toolbar {
          padding: 10px 15px; background: #fff; border-bottom: 2px solid #F47A20;
          display: flex; gap: 12px; align-items: center; overflow-x: auto;
          scrollbar-width: none; -ms-overflow-style: none; white-space: nowrap;
        }
        .js-biodata-toolbar::-webkit-scrollbar { display: none; }
        
        .js-tool-group { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .js-tool-group label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
        .js-tool-group select { padding: 4px 8px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; background: #f8fafc; }
        
        .js-action-btn {
          background: #1e293b; color: #fff; border: none; padding: 6px 12px;
          border-radius: 6px; font-weight: 700; font-size: 11px; cursor: pointer;
          display: flex; align-items: center; gap: 4px; flex-shrink: 0;
        }
        .js-action-btn.secondary { background: #fff; color: #f47a20; border: 1.5px solid #f47a20; }
        .js-action-btn.undo { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

        .js-mini-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .js-mini-btn.js-upload-full { width: auto; padding: 0 12px; font-size: 11px; font-weight: 700; gap: 6px; color: #475569; }
        .js-mini-btn:hover { border-color: #F47A20; background: #fffcf9; color: #F47A20; }

        /* Document Preview with Smart Scaling */
        .js-biodata-preview-wrap {
          width: 100%; overflow: hidden; background: #f1f5f9;
          display: flex; flex-direction: column; align-items: center;
          padding: 40px 0;
        }
        .js-biodata-content {
          position: relative; min-height: 1100px; padding: 60px 50px; 
          background: #fff; color: #1e293b;
          transform-origin: top center;
          width: 800px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 820px) {
          .js-biodata-preview-wrap { padding: 20px 0; }
          .js-biodata-content {
            transform: scale(calc((100vw - 40px) / 800));
            /* Adjust parent height to compensate for scale */
            margin-bottom: calc(-1100px * (1 - (100vw - 40px) / 800));
          }
        }

        .js-biodata-header { text-align: center; margin-bottom: 50px; position: relative; min-height: 100px; display: flex; align-items: center; justify-content: center; flex-direction: column; }
        .js-biodata-header h1 { font-family: 'Georgia', serif; color: #F47A20; margin-bottom: 5px; font-size: 32px; font-weight: 900; }
        .js-biodata-header h2 { font-size: 14px; color: #94a3b8; letter-spacing: 4px; text-transform: uppercase; font-weight: 700; }

        .js-drag-wrapper { position: absolute; cursor: move; z-index: 50; touch-action: none; transition: transform 0.1s; }
        .js-drag-wrapper:hover { outline: 2px dashed #F47A20; outline-offset: 4px; border-radius: 4px; }
        .js-drag-wrapper:active { transform: scale(1.05); opacity: 0.8; }
        
        .js-design-photo-box { border: 3px solid #F47A20; border-radius: 12px; overflow: hidden; background: #f8fafc; box-shadow: 0 15px 35px rgba(0,0,0,0.15); }

        .js-biodata-section { margin-bottom: 40px; border: 1px solid transparent; transition: all 0.2s; position: relative; padding: 10px; }
        .js-biodata-section:hover { background: rgba(244, 122, 32, 0.02); border-radius: 12px; border-color: rgba(244, 122, 32, 0.1); }
        
        .js-section-title {
          font-size: 16px; text-transform: uppercase; color: #F47A20;
          letter-spacing: 2px; font-weight: 900; border-bottom: 2.5px solid #F47A20;
          padding-bottom: 10px; margin-bottom: 25px; text-align: center;
        }
        
        .js-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 40px; }
        .js-info-row-container { display: flex; align-items: center; gap: 10px; position: relative; }
        .js-info-row { flex: 1; font-size: 15px; border-bottom: 1.5px dashed #f1f5f9; padding-bottom: 8px; display: flex; gap: 15px; align-items: baseline; }
        .js-info-row strong { color: #64748b; min-width: 130px; flex-shrink: 0; font-weight: 700; }
        .js-info-row span { color: #1e293b; font-weight: 700; flex: 1; word-break: break-word; }

        .js-row-remove { 
          width: 24px; height: 24px; border-radius: 6px; background: #fff1f2; color: #e11d48; 
          border: 1px solid #fecdd3; display: flex; align-items: center; justify-content: center; 
          font-size: 14px; cursor: pointer; opacity: 0; transition: all 0.2s;
        }
        .js-info-row-container:hover .js-row-remove { opacity: 1; transform: scale(1.1); }
        
        .js-sec-actions { position: absolute; right: 0; top: -35px; display: flex; gap: 10px; opacity: 0; transition: all 0.2s; z-index: 10; }
        .js-biodata-section:hover .js-sec-actions { opacity: 1; }
        .js-sec-btn { font-size: 11px; font-weight: 900; padding: 5px 12px; border-radius: 8px; cursor: pointer; border: none; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .js-sec-btn.add { background: #22c55e; color: #fff; }
        .js-sec-btn.remove { background: #ef4444; color: #fff; }

        .js-biodata-footer {
          margin-top: 80px; text-align: center; border-top: 1.5px solid #f1f5f9;
          padding-top: 30px; color: #94a3b8; font-size: 13px; font-style: italic; letter-spacing: 1px;
        }

        @media print {
          .no-print { display: none !important; }
          .js-biodata-overlay { background: #fff; padding: 0; display: block; position: static; overflow: visible; }
          .js-biodata-modal { box-shadow: none; border-radius: 0; max-width: 100%; border: none; margin: 0; width: 100%; }
          .js-biodata-preview-wrap { padding: 0; background: #fff; }
          .js-biodata-content { padding: 50px; transform: none !important; margin: 0 !important; width: 100% !important; box-shadow: none; min-height: auto; }
        }

        /* Kundali Results */
        .js-share-modal-content.kundali { max-width: 400px; padding: 40px 30px; text-align: center; border-radius: 20px; }
        .js-kundali-match-result { margin: 30px 0; }
        .js-score-circle {
          width: 120px; height: 120px; border-radius: 50%;
          border: 8px solid #F47A20; margin: 0 auto 20px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: #fffcf9;
        }
        .js-score-num { font-size: 36px; font-weight: 900; color: #F47A20; line-height: 1; }
        .js-score-total { font-size: 14px; color: #94a3b8; font-weight: 700; }
        .js-kundali-match-result h4 { font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
        .js-kundali-match-result p { font-size: 14px; color: #64748b; line-height: 1.6; }
        .js-modal-close-btn { width: 100%; padding: 12px; background: #1e293b; color: #fff; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; margin-top: 10px; }

        @media print {
          .no-print { display: none !important; }
          .js-biodata-overlay { background: #fff; padding: 0; display: block; position: static; }
          .js-biodata-modal { box-shadow: none; border-radius: 0; max-width: 100%; border: none; }
          .js-biodata-content { padding: 40px; border: none; }
        }
      `}} />
    </div>
  );
}
