import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Download, FileText, X as CloseIcon, Sparkles } from 'lucide-react';
import { buildPatrika, calculateGunMilan, LABELS } from '../../services/gunMilanService';
import { calculateFullKundali } from '../../services/kundaliService';
import KundaliChart from './KundaliChart';
import Spinner from '../ui/Spinner';

export default function GunMilanModal({ profile, myProfile, defaultTab = 'milan', onClose }) {
  const [gmLang, setGmLang] = useState('mr'); // 'mr' | 'en'
  const [gmTab, setGmTab] = useState(defaultTab); // 'patrika' | 'milan'
  const gmPrintRef = useRef(null);

  const candidatePatrika = profile ? buildPatrika(profile) : null;
  const myPatrika        = myProfile ? buildPatrika(myProfile) : null;
  const gunMilan         = (candidatePatrika && myPatrika) ? calculateGunMilan(myPatrika, candidatePatrika) : null;
  const L                = gmLang;

  const [myKundali, setMyKundali] = useState(null);
  const [candidateKundali, setCandidateKundali] = useState(null);
  const [loadingKundali, setLoadingKundali] = useState(false);

  const bothHaveDetails = !!(profile?.time_of_birth && profile?.place_of_birth && myProfile?.time_of_birth && myProfile?.place_of_birth);

  useEffect(() => {
    if (bothHaveDetails && profile?.dob && myProfile?.dob) {
      setLoadingKundali(true);
      calculateFullKundali(myProfile.dob, myProfile.time_of_birth, myProfile.place_of_birth)
        .then(myK => {
          setMyKundali(myK);
          return calculateFullKundali(profile.dob, profile.time_of_birth, profile.place_of_birth);
        })
        .then(candK => {
          setCandidateKundali(candK);
        })
        .catch(err => console.error('Error calculating matching kundalis:', err))
        .finally(() => setLoadingKundali(false));
    }
  }, [profile, myProfile, bothHaveDetails]);

  const handleGmDownloadImage = async () => {
    if (!gmPrintRef.current) return;
    const loadingToast = toast.loading('Generating image...');
    try {
      const { default: h2c } = await import('html2canvas');
      const canvas = await h2c(gmPrintRef.current, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const link = document.createElement('a');
      link.download = `gun-milan-${profile.name}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.92);
      link.click();
      toast.success('Image downloaded!', { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error('Download failed.', { id: loadingToast });
    }
  };

  const handleGmDownloadPDF = async () => {
    if (!gmPrintRef.current) return;
    const loadingToast = toast.loading('Generating PDF...');
    try {
      const { default: h2c } = await import('html2canvas');
      const { jsPDF: PDF } = await import('jspdf');
      const canvas = await h2c(gmPrintRef.current, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new PDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pW = pdf.internal.pageSize.getWidth();
      const pH = (canvas.height * pW) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pW, pH);
      pdf.save(`gun-milan-${profile.name}.pdf`);
      toast.success('PDF downloaded!', { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error('Download failed.', { id: loadingToast });
    }
  };

  const PatrikaRow = ({ labelMr, labelEn, value, valueMr }) => (
    <div className="gm-patrika-row">
      <span className="gm-patrika-label">{L === 'mr' ? labelMr : labelEn}</span>
      <span className="gm-patrika-value">{L === 'mr' ? (valueMr || value) : value}</span>
    </div>
  );

  return (
    <div className="gm-overlay" onClick={onClose}>
      <div className="gm-modal" onClick={e => e.stopPropagation()}>

        {/* TOOLBAR */}
        <div className="gm-toolbar no-print">
          <div className="gm-toolbar-left">
            <div className="gm-lang-toggle">
              <button className={gmLang === 'mr' ? 'active' : ''} onClick={() => setGmLang('mr')}>मराठी</button>
              <button className={gmLang === 'en' ? 'active' : ''} onClick={() => setGmLang('en')}>English</button>
            </div>
            <div className="gm-tab-btns">
              <button className={gmTab === 'patrika' ? 'active' : ''} onClick={() => setGmTab('patrika')}>
                {gmLang === 'mr' ? '🪐 जन्म पत्रिका' : '🪐 Janma Patrika'}
              </button>
              <button className={gmTab === 'milan' ? 'active' : ''} onClick={() => setGmTab('milan')}>
                {gmLang === 'mr' ? '💫 गुण मिलान' : '💫 Gun Milan'}
              </button>
            </div>
          </div>
          <div className="gm-toolbar-right">
            <button className="gm-dl-btn" onClick={handleGmDownloadImage}><Download size={14} /> Image</button>
            <button className="gm-dl-btn pdf" onClick={handleGmDownloadPDF}><FileText size={14} /> PDF</button>
            <button className="gm-close-btn" onClick={onClose}><CloseIcon size={20} /></button>
          </div>
        </div>

        {/* PRINTABLE AREA */}
        <div className="gm-body">
          <div className="gm-print-area" ref={gmPrintRef}>

            {/* JANMA PATRIKA TAB */}
            {gmTab === 'patrika' && (
              <div className="gm-patrika-card">
                <div className="gm-patrika-header">
                  <div className="gm-patrika-blessing">{L === 'mr' ? '॥ श्री गणेशाय नमः ॥' : '॥ Shri Ganeshaya Namah ॥'}</div>
                  <h2 className="gm-patrika-title">{L === 'mr' ? 'जन्म पत्रिका' : 'Janma Patrika'}</h2>
                  <p className="gm-patrika-subtitle">{L === 'mr' ? 'सखरपुडा मॅट्रिमोनी' : 'SakharPuda Matrimony'}</p>
                </div>
                {candidatePatrika ? (
                  <>
                    <div className="gm-person-banner">
                      <span className="gm-person-name">{profile.name}</span>
                      <span className="gm-person-id">{profile.profile_id}</span>
                    </div>
                    <div className="gm-patrika-grid">
                      <PatrikaRow labelMr="जन्म तारीख" labelEn="Date of Birth" value={candidatePatrika.dob} valueMr={candidatePatrika.dob} />
                      {candidatePatrika.timeOfBirth && <PatrikaRow labelMr="जन्म वेळ" labelEn="Time of Birth" value={candidatePatrika.timeOfBirth} valueMr={candidatePatrika.timeOfBirth} />}
                      {candidatePatrika.placeOfBirth && <PatrikaRow labelMr="जन्म स्थान" labelEn="Place of Birth" value={candidatePatrika.placeOfBirth} valueMr={candidatePatrika.placeOfBirth} />}
                      <PatrikaRow labelMr="जन्म नक्षत्र" labelEn="Janma Nakshatra"
                        value={`${candidatePatrika.nakshatra.en} (Pada ${candidatePatrika.pada})`}
                        valueMr={`${candidatePatrika.nakshatra.mr} (पाद ${candidatePatrika.pada})`} />
                      <PatrikaRow labelMr="राशी" labelEn="Rashi (Moon Sign)" value={candidatePatrika.rashi.en} valueMr={candidatePatrika.rashi.mr} />
                      <PatrikaRow labelMr="गण" labelEn="Gana" value={LABELS.en.gana[candidatePatrika.gana]} valueMr={LABELS.mr.gana[candidatePatrika.gana]} />
                      <PatrikaRow labelMr="नाडी" labelEn="Nadi" value={LABELS.en.nadi[candidatePatrika.nadi]} valueMr={LABELS.mr.nadi[candidatePatrika.nadi]} />
                      <PatrikaRow labelMr="योनि" labelEn="Yoni" value={LABELS.en.yoni[candidatePatrika.yoni]} valueMr={LABELS.mr.yoni[candidatePatrika.yoni]} />
                      <PatrikaRow labelMr="वर्ण" labelEn="Varna" value={LABELS.en.varna[candidatePatrika.varna]} valueMr={LABELS.mr.varna[candidatePatrika.varna]} />
                      <PatrikaRow labelMr="नक्षत्र स्वामी" labelEn="Nakshatra Lord" value={candidatePatrika.nakshatraLord} valueMr={LABELS.mr.planets[candidatePatrika.nakshatraLord]} />
                      <PatrikaRow labelMr="राशी स्वामी" labelEn="Rashi Lord" value={candidatePatrika.rashiLord} valueMr={LABELS.mr.planets[candidatePatrika.rashiLord]} />
                    </div>
                    {candidatePatrika.calculationMethod === 'calculated' && (
                      <p className="gm-note">
                        {L === 'mr' ? '* नक्षत्र जन्मतारखेवरून गणले आहे. अधिक अचूकतेसाठी जन्म वेळ व ठिकाण द्यावे.' : '* Nakshatra calculated from date of birth. Provide birth time & place for higher accuracy.'}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="gm-no-data"><p>{L === 'mr' ? 'जन्म माहिती उपलब्ध नाही.' : 'Birth information not available.'}</p></div>
                )}
                <div className="gm-patrika-footer">
                  <span>SakharPuda Matrimony</span><span>www.sakharpuda.com</span>
                </div>
              </div>
            )}

            {/* GUN MILAN TAB */}
            {gmTab === 'milan' && (
              <div className="gm-milan-card">
                <div className="gm-milan-header">
                  <div className="gm-patrika-blessing">{L === 'mr' ? '॥ श्री गणेशाय नमः ॥' : '॥ Shri Ganeshaya Namah ॥'}</div>
                  <h2 className="gm-patrika-title">{L === 'mr' ? 'गुण मिलान (पत्रिका मिलान)' : 'Gun Milan (Kundali Matching)'}</h2>
                  <p className="gm-patrika-subtitle">{L === 'mr' ? 'अष्टकूट पद्धती — ३६ गुण' : 'Ashtakoot System — 36 Points'}</p>
                </div>

                <div style={{ textAlign: 'center', background: '#fef3c7', padding: '6px', borderBottom: '1px solid #fde68a' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '12px',
                    background: bothHaveDetails ? '#dcfce7' : '#fee2e2',
                    color: bothHaveDetails ? '#15803d' : '#b91c1c',
                    fontFamily: 'sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {bothHaveDetails 
                      ? (L === 'mr' ? 'पूर्ण मिलान (जन्म वेळ व स्थान समाविष्ट)' : 'Full Kundali Match (Time & Place Included)')
                      : (L === 'mr' ? 'प्राथमिक मिलान (केवळ जन्मतारीख)' : 'Basic Match (Date of Birth Only)')
                    }
                  </span>
                </div>

                {gunMilan && myPatrika && candidatePatrika ? (
                  <>
                    <div className="gm-persons-compare">
                      <div className="gm-person-box">
                        <div className="gm-person-role">{L === 'mr' ? 'वर (Boy)' : 'Boy'}</div>
                        <div className="gm-person-name-sm">{myProfile?.name}</div>
                        <div className="gm-person-detail">{L === 'mr' ? myPatrika.nakshatra.mr : myPatrika.nakshatra.en}</div>
                        <div className="gm-person-detail">{L === 'mr' ? myPatrika.rashi.mr : myPatrika.rashi.en}</div>
                      </div>
                      <div className="gm-vs-circle">✦</div>
                      <div className="gm-person-box">
                        <div className="gm-person-role">{L === 'mr' ? 'वधू (Girl)' : 'Girl'}</div>
                        <div className="gm-person-name-sm">{profile?.name}</div>
                        <div className="gm-person-detail">{L === 'mr' ? candidatePatrika.nakshatra.mr : candidatePatrika.nakshatra.en}</div>
                        <div className="gm-person-detail">{L === 'mr' ? candidatePatrika.rashi.mr : candidatePatrika.rashi.en}</div>
                      </div>
                    </div>

                    <div className={`gm-score-wrap ${gunMilan.interpretation.colorClass}`}>
                      <div className="gm-score-circle">
                        <span className="gm-score-num">{gunMilan.total}</span>
                        <span className="gm-score-denom">/36</span>
                      </div>
                      <div className="gm-score-label">
                        <div className="gm-score-level">{L === 'mr' ? gunMilan.interpretation.levelMr : gunMilan.interpretation.levelEn}</div>
                        <div className="gm-score-verdict">{L === 'mr' ? gunMilan.interpretation.verdictMr : gunMilan.interpretation.verdictEn}</div>
                      </div>
                    </div>

                    {bothHaveDetails && (
                      <div className="gm-matching-charts-section">
                        <h3 className="gm-matching-charts-title">
                          {L === 'mr' ? '🪐 कुंडली मिलान चार्ट' : '🪐 Kundali Matching Charts'}
                        </h3>
                        {loadingKundali ? (
                          <div style={{ padding: '20px', textAlign: 'center' }}><Spinner /> Calculating charts...</div>
                        ) : (
                          myKundali && candidateKundali && (
                            <div className="gm-matching-charts-grid">
                              <div className="gm-chart-container-half">
                                <h4 className="gm-chart-label">{myProfile?.name} ({L === 'mr' ? 'वर' : 'Boy'})</h4>
                                <KundaliChart
                                  houses={myKundali.houses}
                                  chartType={myKundali.chartType}
                                  lagnaRashi={myKundali.lagnaRashi}
                                  lang={gmLang}
                                />
                              </div>
                              <div className="gm-chart-container-half">
                                <h4 className="gm-chart-label">{profile?.name} ({L === 'mr' ? 'वधू' : 'Girl'})</h4>
                                <KundaliChart
                                  houses={candidateKundali.houses}
                                  chartType={candidateKundali.chartType}
                                  lagnaRashi={candidateKundali.lagnaRashi}
                                  lang={gmLang}
                                />
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    <table className="gm-koota-table">
                      <thead>
                        <tr>
                          <th>{L === 'mr' ? 'कूट' : 'Koota'}</th>
                          <th>{L === 'mr' ? 'प्राप्त गुण' : 'Score'}</th>
                          <th>{L === 'mr' ? 'कमाल' : 'Max'}</th>
                          <th>{L === 'mr' ? 'विवरण' : 'Detail'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gunMilan.kootas.map((k, i) => {
                          const pct = k.max > 0 ? (k.scored / k.max) * 100 : 0;
                          const rowClass = k.dosha ? 'gm-row-dosha' : k.scored === k.max ? 'gm-row-full' : '';
                          return (
                            <tr key={i} className={rowClass}>
                              <td className="gm-koota-name">
                                <strong>{L === 'mr' ? k.nameMr : k.name}</strong>
                                {k.dosha && <span className="gm-dosha-badge">{L === 'mr' ? k.doshaMr : k.dosha}</span>}
                              </td>
                              <td className="gm-koota-scored">
                                <div className="gm-bar-wrap">
                                  <div className="gm-bar" style={{ width: `${pct}%`, background: k.dosha ? '#ef4444' : pct === 100 ? '#16a34a' : '#F47A20' }} />
                                </div>
                                <span className="gm-scored-num">{k.scored}</span>
                              </td>
                              <td className="gm-koota-max">{k.max}</td>
                              <td className="gm-koota-detail">{L === 'mr' ? k.detailMr : k.detail}</td>
                            </tr>
                          );
                        })}
                        <tr className="gm-total-row">
                          <td><strong>{L === 'mr' ? 'एकूण' : 'Total'}</strong></td>
                          <td><strong>{gunMilan.total}</strong></td>
                          <td><strong>36</strong></td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>

                    {gunMilan.interpretation.warnings.length > 0 && (
                      <div className="gm-dosha-warnings">
                        <h4>{L === 'mr' ? 'दोष सूचना' : 'Dosha Warnings'}</h4>
                        {gunMilan.interpretation.warnings.map((w, i) => (
                          <p key={i}>{L === 'mr' ? w.mr : w.en}</p>
                        ))}
                      </div>
                    )}

                    <div className="gm-scale">
                      <div className="gm-scale-bar">
                        <div className="gm-scale-marker" style={{ left: `${(gunMilan.total / 36) * 100}%` }} />
                      </div>
                      <div className="gm-scale-labels"><span>0</span><span>18</span><span>25</span><span>32</span><span>36</span></div>
                      <div className="gm-scale-text">{L === 'mr' ? '≥ १८ स्वीकार्य | ≥ २५ उत्तम | ≥ ३३ उत्कृष्ट' : '≥ 18 Acceptable | ≥ 25 Good | ≥ 33 Excellent'}</div>
                    </div>

                    <p className="gm-note" style={{ marginTop: '12px' }}>
                      {L === 'mr' ? '* हे गुण मिलान केवळ मार्गदर्शनासाठी आहे. विवाहापूर्वी अनुभवी ज्योतिषाचा सल्ला घ्यावा.' : '* This Gun Milan is for guidance only. Consult an experienced astrologer before marriage.'}
                    </p>
                  </>
                ) : (
                  <div className="gm-no-data">
                    {!myPatrika
                      ? <p>{L === 'mr' ? 'आपली जन्म माहिती उपलब्ध नाही. कृपया प्रोफाईल अपडेट करा.' : 'Your birth information is not available. Please update your profile.'}</p>
                      : <p>{L === 'mr' ? 'या व्यक्तीची जन्म माहिती उपलब्ध नाही.' : 'Birth information not available for this person.'}</p>
                    }
                  </div>
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
