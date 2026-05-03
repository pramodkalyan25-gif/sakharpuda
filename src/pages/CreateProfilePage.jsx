import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { profileService } from '../services/profileService';
import { photoService } from '../services/photoService';
import { useAuth } from '../hooks/useAuth';
import './CreateProfileWizard.css';
import {
  PROFILE_FOR_OPTIONS, RELIGIONS, MARITAL_STATUSES, HEIGHTS, DIETS,
  EDUCATIONS, COMPANY_TYPES, PROFESSIONS, INCOME_RANGES, MOTHER_TONGUES,
  FAMILY_OCCUPATIONS, FAMILY_FINANCIAL_STATUSES, HOBBIES, SUB_COMMUNITIES,
} from './wizardData';

const TOTAL_STEPS = 12;

export default function CreateProfilePage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef(null);

  // If user already has a profile, redirect to dashboard
  useEffect(() => {
    if (profile) {
      toast.success('You already have a profile!');
      navigate('/dashboard', { replace: true });
    }
  }, [profile, navigate]);

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // All form data in one state object
  const [data, setData] = useState({
    profile_for: '',
    first_name: '', last_name: '',
    dob_day: '', dob_month: '', dob_year: '',
    gender: 'male',
    religion: '',
    city: '', live_with_family: true, sub_community: '', caste_no_bar: false,
    marital_status: 'never_married', height: '', diet: '',
    education: '', college_name: '',
    salary: '', company_type: '', profession: '', company_name: '',
    bio: '',
    hobbies: [],
    family_mother_occupation: '', family_father_occupation: '',
    num_sisters: 0, num_brothers: 0,
    family_financial_status: 'middle',
    // Partner preferences
    pref_age_min: 22, pref_age_max: 35,
    pref_religion: '', pref_caste: '', pref_city: '',
  });

  const set = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  // --- Fast Increment Logic for DOB ---
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const startAdjusting = (field, delta) => {
    const adjust = () => {
      setData(prev => {
        let val = parseInt(prev[field]) || 0;
        if (isNaN(val)) {
          if (field === 'dob_year') val = 1995;
          else val = 1;
        }
        let newVal = val + delta;

        // Bounds
        if (field === 'dob_day' && (newVal < 1 || newVal > 31)) return prev;
        if (field === 'dob_month' && (newVal < 1 || newVal > 12)) return prev;
        const currentYear = new Date().getFullYear();
        if (field === 'dob_year' && (newVal < 1950 || newVal > currentYear - 18)) return prev;

        return { ...prev, [field]: String(newVal) };
      });
    };

    adjust();
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(adjust, 60);
    }, 400);
  };

  const stopAdjusting = () => {
    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);
  };

  const toggleHobby = (hobby) => {
    setData(prev => {
      const arr = prev.hobbies.includes(hobby)
        ? prev.hobbies.filter(h => h !== hobby)
        : [...prev.hobbies, hobby];
      return { ...prev, hobbies: arr };
    });
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Photo must be less than 15 MB');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleFinalSubmit = async () => {
    setSaving(true);
    try {
      const dob = `${data.dob_year}-${String(data.dob_month).padStart(2, '0')}-${String(data.dob_day).padStart(2, '0')}`;
      const fullName = `${data.first_name} ${data.last_name}`.trim();

      await profileService.createProfile(user.id, {
        name: fullName,
        first_name: data.first_name,
        last_name: data.last_name,
        gender: data.gender,
        dob,
        height: data.height ? parseInt(data.height) : null,
        religion: data.religion,
        caste: data.sub_community,
        sub_community: data.sub_community,
        education: data.education,
        profession: data.profession,
        salary: data.salary,
        city: data.city,
        state: '',
        country: 'India',
        bio: data.bio,
        marital_status: data.marital_status,
        profile_for: data.profile_for.toLowerCase(),
        diet: data.diet,
        mother_tongue: '',
        college_name: data.college_name,
        company_name: data.company_name,
        company_type: data.company_type,
        hobbies: data.hobbies,
        family_mother_occupation: data.family_mother_occupation,
        family_father_occupation: data.family_father_occupation,
        num_sisters: parseInt(data.num_sisters) || 0,
        num_brothers: parseInt(data.num_brothers) || 0,
        family_financial_status: data.family_financial_status,
        live_with_family: data.live_with_family,
        caste_no_bar: data.caste_no_bar,
      });

      await profileService.savePreferences(user.id, {
        preferred_age_min: parseInt(data.pref_age_min) || 22,
        preferred_age_max: parseInt(data.pref_age_max) || 35,
        preferred_religion: data.pref_religion,
        preferred_caste: data.pref_caste,
        preferred_city: data.pref_city,
      });

      if (photoFile) {
        try { await photoService.uploadPhoto(user.id, photoFile, true); } catch { /* ignore photo errors */ }
      }

      await refreshProfile();
      toast.success('🎉 Profile created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to create profile');
    } finally {
      setSaving(false);
    }
  };

  const subCommunities = SUB_COMMUNITIES[data.religion] || [];

  return (
    <div className="wizard-page">
      <div className="wizard-card">
        <div className="wizard-progress">
          <div className="wizard-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        {step > 0 && <button className="wizard-back" onClick={back}>←</button>}

        <div className="wizard-content">

          {/* Step 0: Profile For */}
          {step === 0 && (
            <>
              <div className="wizard-icon orange">👤</div>
              <h2 className="wizard-title">This Profile is for</h2>
              <div className="wizard-fields">
                <div className="wizard-pills" style={{ justifyContent: 'center', marginTop: 20 }}>
                  {PROFILE_FOR_OPTIONS.map(opt => (
                    <button key={opt} type="button"
                      className={`wizard-pill ${data.profile_for === opt ? 'active' : ''}`}
                      onClick={() => set('profile_for', opt)}>
                      <span className="pill-radio" />{opt}
                    </button>
                  ))}
                </div>
                <div style={{
                  background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 8,
                  padding: '14px 18px', marginTop: 30, fontSize: 13, color: '#666', lineHeight: 1.6
                }}>
                  <strong style={{ color: '#ef6c00' }}>ℹ</strong> ManglaSutra is built for genuine match-seekers. Any falsification, commercial use or marriage bureaus is strictly prohibited & may be reported to law enforcement.
                </div>
              </div>
              <button className="wizard-continue" disabled={!data.profile_for} onClick={next}>Continue</button>
            </>
          )}

          {/* Step 1: Name & DOB & Gender */}
          {step === 1 && (
            <>
              <div className="wizard-icon purple">👤</div>
              <h2 className="wizard-title">Your name</h2>
              <div className="wizard-fields">
                <div className="wizard-field-group">
                  <input className="wizard-input" placeholder="First name" value={data.first_name}
                    onChange={e => set('first_name', e.target.value)} autoFocus />
                </div>
                <div className="wizard-field-group">
                  <input className="wizard-input" placeholder="Last name" value={data.last_name}
                    onChange={e => set('last_name', e.target.value)} />
                </div>
                <div className="wizard-field-group">
                  <label>Gender</label>
                  <div className="wizard-pills">
                    {['male', 'female', 'other'].map(g => (
                      <button key={g} type="button"
                        className={`wizard-pill ${data.gender === g ? 'active' : ''}`}
                        onClick={() => set('gender', g)}>
                        <span className="pill-radio" />{g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="wizard-field-group">
                  <label>Date of birth</label>
                  <div className="wizard-row">
                    <div className="custom-number-wrapper">
                      <small style={{ color: '#888', fontSize: 11 }}>Day</small>
                      <div className="custom-number-input">
                        <input className="wizard-input" placeholder="DD" type="number" min="1" max="31"
                          value={data.dob_day} onChange={e => set('dob_day', e.target.value)} />
                        <div className="number-arrows">
                          <button type="button" onMouseDown={() => startAdjusting('dob_day', 1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting}>
                            <ChevronUp size={12} />
                          </button>
                          <button type="button" onMouseDown={() => startAdjusting('dob_day', -1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting}>
                            <ChevronDown size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="custom-number-wrapper">
                      <small style={{ color: '#888', fontSize: 11 }}>Month</small>
                      <div className="custom-number-input">
                        <input className="wizard-input" placeholder="MM" type="number" min="1" max="12"
                          value={data.dob_month} onChange={e => set('dob_month', e.target.value)} />
                        <div className="number-arrows">
                          <button type="button" onMouseDown={() => startAdjusting('dob_month', 1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting}>
                            <ChevronUp size={12} />
                          </button>
                          <button type="button" onMouseDown={() => startAdjusting('dob_month', -1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting}>
                            <ChevronDown size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="custom-number-wrapper">
                      <small style={{ color: '#888', fontSize: 11 }}>Year</small>
                      <div className="custom-number-input">
                        <input className="wizard-input" placeholder="YYYY" type="number" min="1960" max="2008"
                          value={data.dob_year} onChange={e => set('dob_year', e.target.value)} />
                        <div className="number-arrows">
                          <button type="button" onMouseDown={() => startAdjusting('dob_year', 1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting}>
                            <ChevronUp size={12} />
                          </button>
                          <button type="button" onMouseDown={() => startAdjusting('dob_year', -1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting}>
                            <ChevronDown size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button className="wizard-continue"
                disabled={!data.first_name || !data.dob_day || !data.dob_month || !data.dob_year}
                onClick={next}>Continue</button>
            </>
          )}

          {/* Step 2: Religion */}
          {step === 2 && (
            <>
              <div className="wizard-icon green">👥</div>
              <h2 className="wizard-title">Your religion</h2>
              <div className="wizard-fields">
                <select className="wizard-select" value={data.religion}
                  onChange={e => set('religion', e.target.value)}>
                  <option value="">Religion</option>
                  {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button className="wizard-continue" disabled={!data.religion} onClick={next}>Continue</button>
            </>
          )}

          {/* Step 3: City, Live with family, Sub-community */}
          {step === 3 && (
            <>
              <div className="wizard-icon red">📍</div>
              <h2 className="wizard-title">Now let's build your Profile</h2>
              <div className="wizard-fields">
                <div className="wizard-field-group">
                  <label>City</label>
                  <input className="wizard-input" placeholder="City you live in?" value={data.city}
                    onChange={e => set('city', e.target.value)} />
                </div>
                <div className="wizard-field-group">
                  <label>You live with your family?</label>
                  <div className="wizard-pills">
                    <button type="button" className={`wizard-pill ${data.live_with_family ? 'active' : ''}`}
                      onClick={() => set('live_with_family', true)}>
                      <span className="pill-radio" />Yes
                    </button>
                    <button type="button" className={`wizard-pill ${!data.live_with_family ? 'active' : ''}`}
                      onClick={() => set('live_with_family', false)}>
                      <span className="pill-radio" />No
                    </button>
                  </div>
                </div>
                {subCommunities.length > 0 && (
                  <div className="wizard-field-group">
                    <label>Sub-community</label>
                    <select className="wizard-select" value={data.sub_community}
                      onChange={e => set('sub_community', e.target.value)}>
                      <option value="">Your Sub-community</option>
                      {subCommunities.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 14, color: '#666', fontWeight: 400, cursor: 'pointer' }}>
                      <input type="checkbox" checked={data.caste_no_bar}
                        onChange={e => set('caste_no_bar', e.target.checked)} />
                      Not particular about my Partner's Community (caste no bar)
                    </label>
                  </div>
                )}
              </div>
              <button className="wizard-continue" disabled={!data.city} onClick={next}>Continue</button>
              <span className="wizard-required">* Required fields</span>
            </>
          )}

          {/* Step 4: Marital status, Height, Diet */}
          {step === 4 && (
            <>
              <div className="wizard-icon purple">👥</div>
              <div className="wizard-fields">
                <div className="wizard-field-group">
                  <label>Marital status</label>
                  <select className="wizard-select" value={data.marital_status}
                    onChange={e => set('marital_status', e.target.value)}>
                    {MARITAL_STATUSES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div className="wizard-field-group">
                  <label>Height</label>
                  <select className="wizard-select" value={data.height}
                    onChange={e => set('height', e.target.value)}>
                    <option value="">Your Height *</option>
                    {HEIGHTS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                  </select>
                </div>
                <div className="wizard-field-group">
                  <label>Diet</label>
                  <div className="wizard-pills">
                    {DIETS.map(d => (
                      <button key={d} type="button"
                        className={`wizard-pill ${data.diet === d ? 'active' : ''}`}
                        onClick={() => set('diet', d)}>
                        <span className="pill-radio" />{d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button className="wizard-continue" onClick={next}>Continue</button>
              <span className="wizard-required">* Required fields</span>
            </>
          )}

          {/* Step 5: Education & College */}
          {step === 5 && (
            <>
              <div className="wizard-icon blue">🎓</div>
              <h2 className="wizard-title">Great! Few more details</h2>
              <div className="wizard-fields">
                <div className="wizard-field-group">
                  <label>Highest qualification</label>
                  <select className="wizard-select" value={data.education}
                    onChange={e => set('education', e.target.value)}>
                    <option value="">Your highest qualification *</option>
                    {EDUCATIONS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="wizard-field-group">
                  <label>College name</label>
                  <input className="wizard-input" placeholder="e.g : Saint Francis Institute Of Technology,Mumbai"
                    value={data.college_name} onChange={e => set('college_name', e.target.value)} />
                </div>
              </div>
              <button className="wizard-continue" onClick={next}>Continue</button>
              <span className="wizard-required">* Required fields</span>
            </>
          )}

          {/* Step 6: Income & Work */}
          {step === 6 && (
            <>
              <div className="wizard-icon teal">💼</div>
              <h2 className="wizard-title">You are almost done!</h2>
              <div className="wizard-fields">
                <div className="wizard-field-group">
                  <label>Income</label>
                  <select className="wizard-select" value={data.salary}
                    onChange={e => set('salary', e.target.value)}>
                    <option value="">Select your income *</option>
                    {INCOME_RANGES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="wizard-field-group">
                  <label>Work details</label>
                  <select className="wizard-select" value={data.company_type}
                    onChange={e => set('company_type', e.target.value)} style={{ marginBottom: 12 }}>
                    <option value="">You work with</option>
                    {COMPANY_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select className="wizard-select" value={data.profession}
                    onChange={e => set('profession', e.target.value)} style={{ marginBottom: 12 }}>
                    <option value="">You work as</option>
                    {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input className="wizard-input" placeholder="Your current company name"
                    value={data.company_name} onChange={e => set('company_name', e.target.value)} />
                  <small style={{ color: '#00897b', fontSize: 12, marginTop: 4, display: 'block' }}>Specify current organization</small>
                </div>
              </div>
              <button className="wizard-continue green-btn" onClick={next}>Create Profile</button>
              <span className="wizard-required">* Required fields</span>
            </>
          )}

          {/* Step 7: About Yourself */}
          {step === 7 && (
            <>
              <div className="wizard-icon yellow">📝</div>
              <p className="wizard-subtitle">We have added a short description about you</p>
              <div className="wizard-fields">
                <div className="wizard-field-group">
                  <label>About yourself *</label>
                  <textarea className="wizard-textarea" value={data.bio}
                    onChange={e => set('bio', e.target.value)}
                    placeholder="Let me introduce myself..."
                    maxLength={4000} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <small style={{ color: '#888', fontStyle: 'italic' }}>Edit the text above to make it more personal.</small>
                    <small style={{ color: '#00897b' }}>{data.bio.length} /4000</small>
                  </div>
                </div>
              </div>
              <button className="wizard-continue" onClick={next}>Continue</button>
              <span className="wizard-required">* Required fields</span>
            </>
          )}

          {/* Step 8: Photo Upload */}
          {step === 8 && (
            <>
              <h2 className="wizard-title" style={{ color: '#6a1b9a' }}>Congrats! Your Profile has been created.</h2>
              <p className="wizard-subtitle">Upload Photo and get better Matches</p>
              <div className="wizard-fields">
                <div className="wizard-photo-area">
                  <div className="wizard-photo-circle">
                    {photoPreview ? <img src={photoPreview} alt="Preview" /> : '👤'}
                    <span className="wizard-photo-camera">📷</span>
                  </div>
                  <p className="wizard-photo-privacy">🔒 100% Privacy controls available</p>
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoSelect} />
                  <button className="wizard-photo-upload-btn" onClick={() => fileInputRef.current?.click()}>
                    🖥 Upload From Computer
                  </button>
                </div>
                <div className="wizard-photo-guidelines">
                  <h4>Photo guidelines</h4>
                  <ul>
                    <li className="do">✅ Your Photo should be front facing and your entire face should be visible.</li>
                    <li className="do">✅ Ensure that your Photo is recent and not with a group.</li>
                    <li className="do">✅ You can upload upto 20 Photos to your Profile.</li>
                    <li className="do">✅ Each Photo must be less than 15 MB in size.</li>
                    <li className="dont">❌ Watermarked, digitally enhanced, or morphed Photos will be rejected.</li>
                    <li className="dont">❌ Irrelevant Photographs will lead to deactivation of your Profile.</li>
                  </ul>
                </div>
              </div>
              <button className="wizard-continue" onClick={next}>
                {photoFile ? 'Continue' : 'Skip for now'}
              </button>
            </>
          )}

          {/* Step 9: Hobbies & Interests */}
          {step === 9 && (
            <>
              <h2 className="wizard-title">Now let's add hobbies & interests</h2>
              <p className="wizard-subtitle">This will help find better Matches</p>
              <div className="wizard-fields" style={{ maxHeight: 400, overflowY: 'auto' }}>
                {Object.entries(HOBBIES).map(([category, items]) => (
                  <div key={category} className="wizard-chip-section">
                    <h4>{category}</h4>
                    <div className="wizard-chips">
                      {items.map(hobby => (
                        <button key={hobby} type="button"
                          className={`wizard-chip ${data.hobbies.includes(hobby) ? 'selected' : ''}`}
                          onClick={() => toggleHobby(hobby)}>
                          {hobby}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button className="wizard-continue" onClick={next}>
                Save & continue ({data.hobbies.length}/5)
              </button>
            </>
          )}

          {/* Step 10: Family Details */}
          {step === 10 && (
            <>
              <div className="wizard-icon pink">👨‍👩‍👧</div>
              <h2 className="wizard-title">Add family details</h2>
              <p className="wizard-subtitle">This really helps find common connections</p>
              <div className="wizard-fields">
                <div className="wizard-field-group">
                  <small style={{ color: '#888' }}>Mother's details</small>
                  <select className="wizard-select" value={data.family_mother_occupation}
                    onChange={e => set('family_mother_occupation', e.target.value)}>
                    <option value="">Select</option>
                    {FAMILY_OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="wizard-field-group">
                  <small style={{ color: '#888' }}>Father's details</small>
                  <select className="wizard-select" value={data.family_father_occupation}
                    onChange={e => set('family_father_occupation', e.target.value)}>
                    <option value="">Select</option>
                    {FAMILY_OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="wizard-row">
                  <div className="wizard-field-group">
                    <small style={{ color: '#888' }}>No. of Sisters</small>
                    <select className="wizard-select" value={data.num_sisters}
                      onChange={e => set('num_sisters', e.target.value)}>
                      {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n === 0 ? 'None' : n}</option>)}
                    </select>
                  </div>
                  <div className="wizard-field-group">
                    <small style={{ color: '#888' }}>No. of Brothers</small>
                    <select className="wizard-select" value={data.num_brothers}
                      onChange={e => set('num_brothers', e.target.value)}>
                      {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n === 0 ? 'None' : n}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <button className="wizard-continue" onClick={next}>Continue</button>
            </>
          )}

          {/* Step 11: Family Financial Status */}
          {step === 11 && (
            <>
              <div className="wizard-icon pink">👨‍👩‍👧</div>
              <h2 className="wizard-title">Add family details</h2>
              <p className="wizard-subtitle">This really helps find common connections</p>
              <div className="wizard-fields">
                <div className="wizard-field-group">
                  <label>Your Family's Financial Status</label>
                  {FAMILY_FINANCIAL_STATUSES.map(fs => (
                    <div key={fs.value}
                      className={`wizard-financial-option ${data.family_financial_status === fs.value ? 'selected' : ''}`}
                      onClick={() => set('family_financial_status', fs.value)}>
                      <span className="fin-radio" />
                      <div>
                        <div className="fin-label">{fs.label}</div>
                        {data.family_financial_status === fs.value && (
                          <div className="fin-desc">{fs.desc}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="wizard-continue" onClick={handleFinalSubmit} disabled={saving}>
                {saving ? 'Saving...' : 'Submit'}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
