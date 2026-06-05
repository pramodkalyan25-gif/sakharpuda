import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, FileText, X as CloseIcon } from 'lucide-react';
import { buildPatrika, LABELS } from '../../services/gunMilanService';
import { calculateFullKundali } from '../../services/kundaliService';
import KundaliChart from './KundaliChart';
import Spinner from '../ui/Spinner';

export default function MyPatrikaModal({ profile, onClose }) {
  const [kundali, setKundali] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('mr');
  const printRef = useRef(null);

  useEffect(() => {
    if (!profile?.dob) return;
    setLoading(true);
    calculateFullKundali(profile.dob, profile.time_of_birth, profile.place_of_birth)
      .then(data => { setKundali(data); })
      .catch(err => { console.error('Kundali calc error:', err); toast.error('Kundali calculation failed.'); })
      .finally(() => setLoading(false));
  }, [profile]);

  const patrika = profile ? buildPatrika(profile) : null;
  const L = lang;

  const handleDownloadImage = async () => {
    if (!printRef.current) return;
    const loadingToast = toast.loading('Generating image...');
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const link = document.createElement('a');
      link.download = `janma-kundali-${profile.name}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.92);
      link.click();
      toast.success('Image downloaded!', { id: loadingToast });
    } catch { toast.error('Download failed.', { id: loadingToast }); }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    const loadingToast = toast.loading('Generating PDF...');
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pW = pdf.internal.pageSize.getWidth();
      const pH = (canvas.height * pW) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pW, pH);
      pdf.save(`janma-kundali-${profile.name}.pdf`);
      toast.success('PDF downloaded!', { id: loadingToast });
    } catch { toast.error('Download failed.', { id: loadingToast }); }
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
        {/* TOOLBAR */}
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

        {/* PRINTABLE AREA */}
        <div className="gm-body">
          <div className="gm-print-area" ref={printRef}>
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center' }}><Spinner /> <p>Calculating planet positions...</p></div>
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

                {/* Patrika Details */}
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
                    <PatrikaRow labelMr="वर्ण" labelEn="Varna" value={LABELS.en.varna[patrika.varna]} valueMr={LABELS.mr.varna[patrika.varna]} />
                    <PatrikaRow labelMr="नक्षत्र स्वामी" labelEn="Nakshatra Lord" value={patrika.nakshatraLord} valueMr={LABELS.mr.planets[patrika.nakshatraLord]} />
                    <PatrikaRow labelMr="राशी स्वामी" labelEn="Rashi Lord" value={patrika.rashiLord} valueMr={LABELS.mr.planets[patrika.rashiLord]} />
                    {kundali && kundali.lagnaRashi && (
                      <PatrikaRow labelMr="लग्न (Ascendant)" labelEn="Lagna (Ascendant)" value={kundali.lagnaRashi.en} valueMr={kundali.lagnaRashi.mr} />
                    )}
                  </div>
                )}

                {/* KUNDALI CHART */}
                {kundali && (
                  <>
                    <div style={{ padding: '16px 20px 0', textAlign: 'center' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#7c1d1d', margin: '0 0 4px', fontFamily: 'Georgia, serif' }}>
                        {L === 'mr' ? '🪐 जन्म कुंडली चार्ट' : '🪐 Janma Kundali Chart'}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0, fontFamily: 'sans-serif' }}>
                        {kundali.chartType === 'lagna'
                          ? (L === 'mr' ? 'लग्न कुंडली — जन्म वेळ व स्थानावरून गणले' : 'Lagna Kundali — Calculated from birth time & place')
                          : (L === 'mr' ? 'चंद्र कुंडली — जन्म तारखेवरून गणले (जन्म वेळ दिल्यास अधिक अचूक)' : 'Chandra Kundali — Calculated from DOB (provide birth time for full accuracy)')
                        }
                      </p>
                    </div>
                    <KundaliChart
                      houses={kundali.houses}
                      chartType={kundali.chartType}
                      lagnaRashi={kundali.lagnaRashi}
                      lang={lang}
                    />
                    {/* Planet positions table */}
                    <div style={{ padding: '0 20px 16px' }}>
                      <table className="gm-koota-table" style={{ fontSize: '12px' }}>
                        <thead>
                          <tr>
                            <th>{L === 'mr' ? 'ग्रह' : 'Planet'}</th>
                            <th>{L === 'mr' ? 'राशी' : 'Rashi'}</th>
                            <th>{L === 'mr' ? 'अंश' : 'Degrees'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kundali.planets.map((p, i) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 700 }}>{L === 'mr' ? p.mr : p.en}{p.isRetrograde ? ' (R)' : ''}</td>
                              <td>{L === 'mr' ? p.rashi.mr : p.rashi.en}</td>
                              <td>{p.degInRashi}°</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {patrika?.calculationMethod === 'calculated' && !profile.time_of_birth && (
                  <p className="gm-note">
                    {L === 'mr' ? '* नक्षत्र जन्मतारखेवरून गणले आहे. जन्म वेळ व ठिकाण दिल्यास पूर्ण लग्न कुंडली मिळेल.' : '* Nakshatra calculated from DOB. Provide birth time & place for full Lagna Kundali.'}
                  </p>
                )}

                <div className="gm-patrika-footer">
                  <span>SakharPuda Matrimony</span><span>www.sakharpuda.com</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
