import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Search, User, Trash2, Star, Check, X, Globe, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '../../services/authService';
import { profileService } from '../../services/profileService';
import { photoService } from '../../services/photoService';
import { useAuth } from '../../hooks/useAuth';
import {
  MAHARASHTRA_DISTRICTS,
  MAHARASHTRA_CASTES,
  CATEGORIZED_PROFESSIONS,
  COMPREHENSIVE_EDUCATION,
  HEIGHTS_CM
} from '../../data/maharashtraData';
import {
  HiUser,
  HiUserGroup,
  HiIdentification,
  HiGlobeAlt,
  HiCalendarDays,
  HiMapPin,
  HiHeart,
  HiAcademicCap,
  HiBriefcase,
  HiCamera,
  HiLockClosed,
  HiSparkles
} from 'react-icons/hi2';

export default function RegistrationWizard({ isEditMode = false, onClose, initialStep = 1 }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user, profile, refreshProfile } = useAuth();

  const [currentStep, setCurrentStep] = useState(initialStep);
  const totalSteps = 10;
  const [submitting, setSubmitting] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    profileFor: '', gender: '', firstName: '', middleName: '', lastName: '',
    religion: '', caste: '', dobDay: '', dobMonth: '', dobYear: '',
    district: '', taluka: '', maritalStatus: '', height: '',
    highestQualification: '', college: '', workWith: '', workAs: '',
    income: '', email: '', mobile: '', password: '',
    photos: [], profilePhotoIndex: 0
  });

  const [customValues, setCustomValues] = useState({
    religion: '', caste: '', district: '', taluka: '',
    maritalStatus: '', highestQualification: '',
    workWith: '', workAs: '', income: ''
  });

  useEffect(() => {
    if (isEditMode && profile) {
      const dobParts = profile.dob ? profile.dob.split('-') : ['', '', ''];
      
      let normalizedProfileFor = '';
      if (profile.profile_for) {
        const pFor = profile.profile_for.trim().toLowerCase();
        const options = ["Myself", "Son", "Daughter", "Brother", "Sister", "Friend", "Relative"];
        normalizedProfileFor = options.find(opt => opt.toLowerCase() === pFor) || 
                               (profile.profile_for.charAt(0).toUpperCase() + profile.profile_for.slice(1).toLowerCase());
      }

      setFormData(prev => ({
        ...prev,
        profileFor: normalizedProfileFor,
        gender: profile.gender ? (profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1).toLowerCase()) : '',
        firstName: profile.first_name || profile.name?.split(' ')[0] || '',
        middleName: (profile.name?.split(' ').length > 2 ? profile.name.split(' ')[1] : ''),
        lastName: profile.last_name || (profile.name?.split(' ').length > 1 ? profile.name.split(' ').slice(-1)[0] : ''),
        religion: profile.religion || '',
        caste: profile.caste || '',
        dobDay: dobParts[2] || '',
        dobMonth: dobParts[1] || '',
        dobYear: dobParts[0] || '',
        district: profile.city || '',
        taluka: profile.state || '',
        maritalStatus: profile.marital_status?.replace(/_/g, ' ') || '',
        height: profile.height ? String(profile.height) : '',
        highestQualification: profile.education || '',
        college: profile.college_name || '',
        workWith: profile.company_type || '',
        workAs: profile.profession || '',
        income: profile.salary || '',
        email: user?.email || '',
      }));

      // Detect custom "Other" values
      const standardReligions = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Parsi"];
      const standardSectors = ["Private", "Government", "Defense", "Business", "Not Working"];
      const standardIncomes = ["Upto 3L", "3-5L", "5-10L", "10-20L", "20-30L", "30L+"];
      
      const newCustom = {};
      if (profile.religion && !standardReligions.includes(profile.religion)) {
        setFormData(prev => ({ ...prev, religion: 'Other' }));
        newCustom.religion = profile.religion;
      }
      if (profile.company_type && !standardSectors.includes(profile.company_type)) {
        setFormData(prev => ({ ...prev, workWith: 'Other' }));
        newCustom.workWith = profile.company_type;
      }
      if (profile.salary && !standardIncomes.includes(profile.salary)) {
        setFormData(prev => ({ ...prev, income: 'Other' }));
        newCustom.income = profile.salary;
      }
      
      // Check caste
      if (profile.caste && !MAHARASHTRA_CASTES.includes(profile.caste)) {
        setFormData(prev => ({ ...prev, caste: 'Other' }));
        newCustom.caste = profile.caste;
      }

      // Check profession (flatten categorized options first)
      const allProfessions = Object.values(CATEGORIZED_PROFESSIONS).flat();
      if (profile.profession && !allProfessions.includes(profile.profession)) {
        setFormData(prev => ({ ...prev, workAs: 'Other' }));
        newCustom.workAs = profile.profession;
      }

      setCustomValues(prev => ({ ...prev, ...newCustom }));

      photoService.getUserPhotos(user.id).then(photos => {
        setFormData(prev => ({
          ...prev,
          photos: photos.map(p => ({
            id: p.id,
            preview: p.signed_url,
            storagePath: p.storage_path,
            isExisting: true
          })),
          profilePhotoIndex: photos.findIndex(p => p.is_primary === true) || 0
        }));
      }).catch(err => console.error("Error fetching photos:", err));
    }
  }, [isEditMode, profile, user]);

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const startAdjusting = (field, delta) => {
    const adjust = () => {
      setFormData(prev => {
        let val = parseInt(prev[field]) || 0;
        if (isNaN(val)) {
          if (field === 'dobYear') val = 1995;
          else val = 1;
        }
        let newVal = val + delta;
        if (field === 'dobDay' && (newVal < 1 || newVal > 31)) return prev;
        if (field === 'dobMonth' && (newVal < 1 || newVal > 12)) return prev;
        const currentYear = new Date().getFullYear();
        if (field === 'dobYear' && (newVal < 1950 || newVal > currentYear - 18)) return prev;
        return { ...prev, [field]: String(newVal).padStart(field === 'dobYear' ? 0 : 2, '0') };
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

  const handleDOBChange = (field, value, nextFieldId) => {
    if (value.length > 4) return;
    if (field !== 'dobYear' && value.length > 2) return;
    updateForm(field, value);
    if ((field === 'dobDay' || field === 'dobMonth') && value.length === 2 && nextFieldId) {
      document.getElementById(nextFieldId)?.focus();
    }
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true
    }));
    setFormData(prev => {
      const combined = [...prev.photos, ...newPhotos].slice(0, 3);
      return { ...prev, photos: combined };
    });
    e.target.value = '';
  };

  const removePhoto = async (index) => {
    const photo = formData.photos[index];
    if (photo.isExisting) {
      try {
        await photoService.deletePhoto(photo.id, user.id, photo.storagePath);
      } catch (err) {
        toast.error("Failed to delete photo");
        return;
      }
    }
    setFormData(prev => {
      const newPhotos = prev.photos.filter((_, i) => i !== index);
      let newProfileIndex = prev.profilePhotoIndex;
      if (newProfileIndex === index) newProfileIndex = 0;
      else if (newProfileIndex > index) newProfileIndex--;
      return { ...prev, photos: newPhotos, profilePhotoIndex: newProfileIndex };
    });
  };

  const setAsProfilePhoto = async (index) => {
    const photo = formData.photos[index];
    if (photo.isExisting) {
      try {
        await photoService.setPrimaryPhoto(photo.id, user.id);
      } catch (err) {
        toast.error("Failed to set primary photo");
      }
    }
    setFormData(prev => {
      const newPhotos = [...prev.photos];
      const [selectedPhoto] = newPhotos.splice(index, 1);
      newPhotos.unshift(selectedPhoto);
      return {
        ...prev,
        photos: newPhotos,
        profilePhotoIndex: 0
      };
    });
  };

  const handleNext = () => {
    if (currentStep === 4 && !validateDOB()) return;
    const threshold = totalSteps;
    if (currentStep < threshold) setCurrentStep(prev => prev + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
    else if (onClose) onClose();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Resolve "Other" custom values
      const resolvedData = { ...formData };
      Object.keys(customValues).forEach(key => {
        if (formData[key] === 'Other' && customValues[key]) {
          resolvedData[key] = customValues[key];
        }
      });

      const dob = `${resolvedData.dobYear}-${String(resolvedData.dobMonth).padStart(2, '0')}-${String(resolvedData.dobDay).padStart(2, '0')}`;
      const fullName = `${resolvedData.firstName} ${resolvedData.middleName} ${resolvedData.lastName}`.replace(/\s+/g, ' ').trim();

      const profilePayload = {
        name: fullName, first_name: resolvedData.firstName, last_name: resolvedData.lastName, gender: resolvedData.gender?.toLowerCase(),
        dob, height: resolvedData.height ? parseInt(resolvedData.height) : null, religion: resolvedData.religion, caste: resolvedData.caste,
        sub_community: resolvedData.caste, education: resolvedData.highestQualification, profession: resolvedData.workAs,
        salary: resolvedData.income, city: resolvedData.district, state: resolvedData.taluka, country: 'India',
        bio: profile?.bio || '', marital_status: resolvedData.maritalStatus?.toLowerCase().replace(/\s+/g, '_'),
        profile_for: resolvedData.profileFor, college_name: resolvedData.college, company_type: resolvedData.workWith,
      };

      for(const p of formData.photos) {
        if(p.isNew) await photoService.uploadPhoto(user.id, p.file);
      }

      await profileService.updateProfile(user.id, profilePayload);
      await refreshProfile();
      toast.success('Profile updated successfully!');
      if (onClose) onClose();
    } catch (err) {
      toast.error(err.message || 'Update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const validateDOB = () => {
    const day = parseInt(formData.dobDay);
    const month = parseInt(formData.dobMonth);
    const year = parseInt(formData.dobYear);
    if (isNaN(day) || day < 1 || day > 31) return false;
    if (isNaN(month) || month < 1 || month > 12) return false;
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1950 || year > currentYear - 18) return false;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return !!(formData.profileFor && formData.gender);
      case 2: return !!(formData.firstName && formData.middleName && formData.lastName);
      case 3: return !!(formData.religion && formData.caste);
      case 4: return validateDOB();
      case 5: return !!(formData.district && formData.taluka);
      case 6: return !!(formData.maritalStatus && formData.height);
      case 7: return !!(formData.highestQualification);
      case 8: return !!(formData.workWith && formData.workAs && formData.income);
      case 9: return true;
      case 10: return true;
      default: return true;
    }
  };

  const iconConfig = (() => {
    const configs = [
      { icon: <HiUser size={40} />, bg: '#BEE3F8', color: '#2B6CB0' },
      { icon: <HiIdentification size={40} />, bg: '#C6F6D5', color: '#2F855A' },
      { icon: <HiUserGroup size={40} />, bg: '#FED7E2', color: '#B83280' },
      { icon: <HiCalendarDays size={40} />, bg: '#FEEBC8', color: '#C05621' },
      { icon: <HiMapPin size={40} />, bg: '#E2E8F0', color: '#2D3748' },
      { icon: <HiSparkles size={40} />, bg: '#FED7D7', color: '#C53030' },
      { icon: <HiAcademicCap size={40} />, bg: '#B2F5EA', color: '#2C7A7B' },
      { icon: <HiBriefcase size={40} />, bg: '#E9D8FD', color: '#6B46C1' },
      { icon: <HiCamera size={40} />, bg: '#BEE3F8', color: '#2B6CB0' },
      { icon: <HiSparkles size={40} />, bg: '#FEEBC8', color: '#C05621' },
    ];
    return configs[currentStep - 1] || configs[0];
  })();

  const renderSelectField = (label, field, options, isCategorized = false) => {
    const isOtherSelected = formData[field] === 'Other';
    return (
      <div className="form-group animate-fade-in">
        <label className="input-label">{label}</label>
        <select className="select-input" value={formData[field]} onChange={(e) => updateForm(field, e.target.value)}>
          <option value="">Select {label}</option>
          {isCategorized ? Object.entries(options).map(([cat, items]) => (
            <optgroup key={cat} label={cat}>{items.map(opt => <option key={opt} value={opt}>{opt}</option>)}</optgroup>
          )) : options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          <option value="Other">Other</option>
        </select>
        {isOtherSelected && (
          <div className="mt-2 animate-fade-in">
            <input
              type="text"
              className="text-input"
              placeholder={`Type your ${label.toLowerCase()}`}
              value={customValues[field]}
              onChange={(e) => setCustomValues(prev => ({ ...prev, [field]: e.target.value }))}
              autoFocus
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="wiz-modal-overlay">
      <div className="register-card">
        <button className="card-back-btn" onClick={handleBack} title="Go Back"><ArrowLeft size={20} /></button>
        <button className="wiz-close-btn" onClick={onClose} title="Close"><X size={20} /></button>

        <div className="step-icon-container">
          <div className="step-icon-circle" style={{ backgroundColor: iconConfig.bg, color: iconConfig.color }}>{iconConfig.icon}</div>
        </div>

        <div className="progress-container">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${(currentStep / 10) * 100}%` }}></div>
          </div>
          <span className="progress-text">Step {currentStep} of 10</span>
        </div>

        <div className="step-content">
          {currentStep === 1 && (
            <div className="animate-reveal">
              <h2 className="step-title">Who is this profile for?</h2>
              <p className="step-subtitle">Select the person for whom you are creating this profile.</p>
              <div className="chip-grid">
                {["Myself", "Son", "Daughter", "Brother", "Sister", "Friend", "Relative"].map(opt => (
                  <button key={opt} className={`chip-btn ${formData.profileFor === opt ? 'selected' : ''}`} onClick={() => updateForm('profileFor', opt)}>{opt}</button>
                ))}
              </div>
              {formData.profileFor && (
                <div className="mt-4 animate-reveal">
                  <h3 className="input-label">Gender</h3>
                  <div className="chip-grid gender-grid">
                    {["Male", "Female"].map(opt => (
                      <button key={opt} className={`chip-btn gender-btn ${formData.gender === opt ? 'selected' : ''}`} onClick={() => updateForm('gender', opt)}>{opt}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-reveal">
              <h2 className="step-title">What is your name?</h2>
              <p className="step-subtitle">Please enter your full legal name.</p>
              <div className="form-group"><label className="input-label">First Name</label><input type="text" className="text-input" value={formData.firstName} onChange={(e) => updateForm('firstName', e.target.value)} /></div>
              <div className="form-group animate-reveal delay-1"><label className="input-label">Middle Name</label><input type="text" className="text-input" value={formData.middleName} onChange={(e) => updateForm('middleName', e.target.value)} /></div>
              <div className="form-group animate-reveal delay-2"><label className="input-label">Last Name</label><input type="text" className="text-input" value={formData.lastName} onChange={(e) => updateForm('lastName', e.target.value)} /></div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-reveal">
              <h2 className="step-title">Background</h2>
              <p className="step-subtitle">Tell us about your religion and community.</p>
              {renderSelectField("Religion", "religion", ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Parsi"])}
              {formData.religion && <div className="animate-reveal">{renderSelectField("Caste", "caste", MAHARASHTRA_CASTES)}</div>}
            </div>
          )}

          {currentStep === 4 && (
            <div className="animate-reveal">
              <h2 className="step-title">Date of Birth</h2>
              <p className="step-subtitle">Your age helps us find better matches.</p>
              <div className="dob-grid">
                <div className="form-group">
                  <label className="input-label text-center">Day</label>
                  <div className="custom-number-input">
                    <input id="dobDay" type="number" className="text-input text-center" placeholder="DD" value={formData.dobDay} onChange={(e) => handleDOBChange('dobDay', e.target.value, 'dobMonth')} />
                    <div className="number-arrows">
                      <button type="button" onMouseDown={() => startAdjusting('dobDay', 1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting}><ChevronUp size={12} /></button>
                      <button type="button" onMouseDown={() => startAdjusting('dobDay', -1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting}><ChevronDown size={12} /></button>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="input-label text-center">Month</label>
                  <div className="custom-number-input">
                    <input id="dobMonth" type="number" className="text-input text-center" placeholder="MM" value={formData.dobMonth} onChange={(e) => handleDOBChange('dobMonth', e.target.value, 'dobYear')} />
                    <div className="number-arrows">
                      <button type="button" onMouseDown={() => startAdjusting('dobMonth', 1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting}><ChevronUp size={12} /></button>
                      <button type="button" onMouseDown={() => startAdjusting('dobMonth', -1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting}><ChevronDown size={12} /></button>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="input-label text-center">Year</label>
                  <div className="custom-number-input">
                    <input id="dobYear" type="number" className="text-input text-center" placeholder="YYYY" value={formData.dobYear} onChange={(e) => handleDOBChange('dobYear', e.target.value)} />
                    <div className="number-arrows">
                      <button type="button" onMouseDown={() => startAdjusting('dobYear', 1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting}><ChevronUp size={12} /></button>
                      <button type="button" onMouseDown={() => startAdjusting('dobYear', -1)} onMouseUp={stopAdjusting} onMouseLeave={stopAdjusting}><ChevronDown size={12} /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="animate-reveal">
              <h2 className="step-title">Location</h2>
              <p className="step-subtitle">Where do you currently reside?</p>
              {renderSelectField("District", "district", MAHARASHTRA_DISTRICTS.map(d => d.district))}
              {formData.district && <div className="animate-reveal">{renderSelectField("Taluka", "taluka", MAHARASHTRA_DISTRICTS.find(d => d.district === formData.district)?.talukas || [])}</div>}
            </div>
          )}

          {currentStep === 6 && (
            <div className="animate-reveal">
              <h2 className="step-title">Personal Traits</h2>
              <p className="step-subtitle">Basic details for better compatibility.</p>
              {renderSelectField("Marital Status", "maritalStatus", ["Never Married", "Divorced", "Widowed", "Awaiting Divorce"])}
              <div className="form-group animate-reveal"><label className="input-label">Height</label><select className="select-input" value={formData.height} onChange={(e) => updateForm('height', e.target.value)}><option value="">Select Height</option>{HEIGHTS_CM.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}</select></div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="animate-reveal">
              <h2 className="step-title">Education</h2>
              <p className="step-subtitle">Tell us about your educational background.</p>
              {renderSelectField("Qualification", "highestQualification", COMPREHENSIVE_EDUCATION, true)}
              <div className="form-group animate-reveal"><label className="input-label">College</label><input type="text" className="text-input" value={formData.college} onChange={(e) => updateForm('college', e.target.value)} /></div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="animate-reveal">
              <h2 className="step-title">Work & Income</h2>
              <p className="step-subtitle">Career details are important for matches.</p>
              {renderSelectField("Sector", "workWith", ["Private", "Government", "Defense", "Business", "Not Working"])}
              {formData.workWith && <div className="animate-reveal">{renderSelectField("Profession", "workAs", CATEGORIZED_PROFESSIONS, true)}</div>}
              {formData.workAs && <div className="animate-reveal delay-1">{renderSelectField("Income", "income", ["Upto 3L", "3-5L", "5-10L", "10-20L", "20-30L", "30L+"])}</div>}
            </div>
          )}

          {currentStep === 9 && (
            <div className="animate-reveal">
              <h2 className="step-title">Photos</h2>
              <p className="step-subtitle">Upload 1-3 photos. Minimum 1 required.</p>
              <div className="photo-container-centered">
                <div className="multi-photo-grid">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="photo-item-card">
                      <img src={photo.preview} alt="Upload" className="photo-item-img" />
                      <div className="photo-actions-overlay">
                        <button className="photo-action-text-btn" onClick={() => setAsProfilePhoto(index)}>
                          {formData.profilePhotoIndex === index ? <span>Profile Photo</span> : <span>Set as profile</span>}
                        </button>
                      </div>
                      <button className="photo-corner-btn" onClick={() => removePhoto(index)}><X size={16} /></button>
                    </div>
                  ))}
                  {formData.photos.length < 3 && (
                    <div className="photo-add-card centered-box" onClick={() => fileInputRef.current.click()}>
                      <HiCamera size={36} />
                      <span>Add Photo</span>
                    </div>
                  )}
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" hidden multiple onChange={handlePhotoSelect} />
              <p className="photo-tip-sub text-center mt-4">🔒 Photos are kept private and secure</p>
            </div>
          )}

          {currentStep === 10 && (
            <div className="animate-reveal text-center">
              <h2 className="step-title">Ready to Update?</h2>
              <p className="step-subtitle">Review your changes and click update to save.</p>
              <div className="trust-info-box">
                <ShieldCheck className="info-icon" size={24} />
                <p className="info-text">Your information is secure and will be updated across your profile immediately.</p>
              </div>
            </div>
          )}

          <button className="primary-btn full-width mt-6" onClick={handleNext} disabled={!isStepValid() || submitting}>
            {submitting ? 'Saving...' : (currentStep === 10 ? 'Update Profile' : 'Continue')}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .wiz-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; z-index: 2000;
          padding: 20px;
        }
        .register-card {
          background: #fff; width: 100%; max-width: 480px; border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: visible;
          display: flex; flex-direction: column; position: relative;
        }
        .wiz-close-btn { position: absolute; top: 20px; right: 20px; background: none; border: none; cursor: pointer; color: #4a5568; z-index: 20; }
        .card-back-btn { position: absolute; top: 20px; left: 20px; background: #f7fafc; border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #4a5568; z-index: 20; transition: all 0.2s; }
        .card-back-btn:hover { background: #edf2f7; color: #D9475C; }
        
        .step-icon-container { display: flex; justify-content: center; margin-top: -20px; margin-bottom: 20px; }
        .step-icon-circle { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(217, 71, 92, 0.1); }
        
        .progress-container { padding: 20px 25px 0; display: flex; flex-direction: column; gap: 8px; }
        .progress-bar-bg { width: 100%; height: 6px; background: #edf2f7; border-radius: 3px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: #D9475C; border-radius: 3px; transition: width 0.3s ease; }
        .progress-text { font-size: 11px; color: #718096; font-weight: 600; text-transform: uppercase; align-self: flex-end; }
        
        .step-content { padding: 20px 25px 30px; flex: 1; display: flex; flex-direction: column; max-height: 70vh; overflow-y: auto; scrollbar-width: none; }
        .step-content::-webkit-scrollbar { display: none; }
        
        .step-title { font-size: 22px; font-weight: 700; color: #1a202c; margin: 0 0 12px; line-height: 1.3; }
        .step-subtitle { font-size: 14px; color: #718096; margin: 0 0 25px; }
        .form-group { margin-bottom: 15px; display: flex; flex-direction: column; }
        .input-label { font-size: 13px; font-weight: 600; color: #4a5568; margin-bottom: 8px; }
        
        .select-input { width: 100%; padding: 14px 40px 14px 16px; border: 1px solid #cbd5e0; border-radius: 10px; font-size: 15px; color: #2d3748; background: #fff; outline: none; box-sizing: border-box; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 15px center; background-size: 16px; }
        .text-input { width: 100%; padding: 14px 16px; border: 1px solid #cbd5e0; border-radius: 10px; font-size: 15px; color: #2d3748; background: #fff; outline: none; box-sizing: border-box; transition: border-color 0.2s; }
        .text-input:focus, .select-input:focus { border-color: #D9475C; }
        
        .dob-grid { display: grid; grid-template-columns: 1fr 1fr 1.5fr; gap: 10px; }
        .chip-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
        .chip-btn { padding: 10px 18px; background: #fff; border: 1px solid #cbd5e0; border-radius: 30px; font-size: 14px; font-weight: 500; color: #4a5568; cursor: pointer; transition: all 0.2s; }
        .chip-btn.selected { background: rgba(217, 71, 92, 0.1); border-color: #D9475C; color: #D9475C; font-weight: 600; }
        .gender-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .gender-btn { padding: 14px; text-align: center; }
        
        .primary-btn { background: #D9475C; color: white; border: none; padding: 16px; border-radius: 30px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .primary-btn:disabled { background: #e2e8f0; color: #a0aec0; cursor: not-allowed; }
        .full-width { width: 100%; }
        .mt-4 { margin-top: 25px; }
        .mt-6 { margin-top: 30px; }
        .text-center { text-align: center; }
        
        .trust-info-box { background: #f0fff4; border: 1px solid #c6f6d5; border-radius: 12px; padding: 16px; display: flex; gap: 12px; margin-top: 30px; text-align: left; align-items: center; }
        .info-icon { color: #2f855a; flex-shrink: 0; }
        .info-text { font-size: 13px; color: #2f855a; line-height: 1.5; margin: 0; }

        /* Photo Gallery Styles */
        .photo-container-centered { display: flex; justify-content: center; margin: 20px 0; }
        .multi-photo-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; width: 100%; }
        .photo-item-card { position: relative; width: 130px; height: 130px; border-radius: 12px; overflow: hidden; background: #f7fafc; border: 1px solid #edf2f7; }
        .photo-item-img { width: 100%; height: 100%; object-fit: cover; }
        .photo-actions-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; z-index: 10; cursor: pointer; }
        .photo-item-card:hover .photo-actions-overlay { opacity: 1; }
        .photo-action-text-btn { background: none; border: none; color: white; font-size: 11px; font-weight: 600; cursor: pointer; width: 100%; height: 100%; padding: 10px; text-align: center; line-height: 1.4; display: flex; align-items: center; justify-content: center; }
        .photo-corner-btn { position: absolute; top: 5px; right: 5px; width: 24px; height: 24px; border-radius: 50%; background: rgba(0,0,0,0.6); color: white; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 20; transition: background 0.2s; }
        .photo-corner-btn:hover { background: #e53e3e; }
        .photo-add-card { width: 130px; height: 130px; border: 2px dashed #cbd5e0; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; color: #a0aec0; gap: 8px; font-size: 12px; transition: all 0.2s; }
        .photo-add-card:hover { border-color: #D9475C; color: #D9475C; background: #fff5f7; }
        .photo-tip-sub { font-size: 12px; color: #718096; }

        /* DOB Arrow Styles */
        .custom-number-input { position: relative; display: flex; align-items: center; }
        .custom-number-input input { padding-right: 38px !important; }
        .number-arrows { position: absolute; right: 5px; display: flex; flex-direction: column; height: calc(100% - 10px); justify-content: center; gap: 2px; }
        .number-arrows button { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; width: 26px; height: calc(50% - 1px); display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: all 0.2s; padding: 0; font-size: 10px; }
        .number-arrows button:hover { background: #f1f5f9; color: #D9475C; border-color: #cbd5e0; }
        
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-reveal { animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both; }
        .animate-fade-in { animation: fadeInUp 0.25s ease forwards; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
      `}} />
    </div>
  );
}
