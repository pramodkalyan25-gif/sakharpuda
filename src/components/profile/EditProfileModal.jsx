import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  ArrowLeft, 
  ShieldCheck, 
  ChevronUp, 
  ChevronDown, 
  Star, 
  Check 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { profileService } from '../../services/profileService';
import { photoService } from '../../services/photoService';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import {
  MAHARASHTRA_DISTRICTS,
  MAHARASHTRA_CASTES,
  CATEGORIZED_PROFESSIONS,
  COMPREHENSIVE_EDUCATION,
  HEIGHTS_CM
} from '../../data/maharashtraData';

const RELIGION_OPTIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Parsi"];
const WORK_WITH_OPTIONS = ["Private Company", "Government", "Defense", "Self Employed", "Not Working"];
const INCOME_OPTIONS = ["Upto 3L", "3-5L", "5-10L", "10-20L", "20L+"];
const MARITAL_STATUS_OPTIONS = ["Never Married", "Divorced", "Widowed", "Awaiting Divorce"];
import {
  HiUser,
  HiUserGroup,
  HiIdentification,
  HiCalendarDays,
  HiMapPin,
  HiAcademicCap,
  HiBriefcase,
  HiCamera,
  HiLockClosed,
  HiSparkles
} from 'react-icons/hi2';

export default function EditProfileModal({ isOpen, onClose, onSave, defaultStep = 1 }) {
  const { user, profile } = useAuth();
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(defaultStep);
  const totalSteps = 10;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    profileFor: '',
    gender: '',
    firstName: '',
    middleName: '',
    lastName: '',
    religion: '',
    caste: '',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
    district: '',
    taluka: '',
    maritalStatus: '',
    height: '',
    highestQualification: '',
    college: '',
    workWith: '',
    workAs: '',
    income: '',
    email: '',
    mobile: '',
    password: '', // Kept empty for edit
    existingPhotos: [], // Photos already in DB
    newPhotos: [], // Photos added during edit { file, preview }
    photosToDelete: [], // IDs of existing photos to delete on save
    newPrimaryPhotoId: null, // ID of existing photo to set as primary
    profilePhotoIndex: -1 // -1 means use existing primary, >= 0 means index in newPhotos
  });

  const [customValues, setCustomValues] = useState({
    religion: '',
    caste: '',
    district: '',
    taluka: '',
    maritalStatus: '',
    highestQualification: '',
    workWith: '',
    workAs: '',
    income: ''
  });

  // Load existing data
  useEffect(() => {
    if (profile && isOpen) {
      // Split name: "First Middle Last"
      const nameParts = (profile.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

      // Split DOB: "YYYY-MM-DD"
      const [year, month, day] = (profile.dob || '--').split('-');

      const resolveOther = (value, standardOptions, isCategorized = false) => {
        if (!value) return { value: '', custom: '' };
        let allOptions = [];
        if (isCategorized) {
          allOptions = Object.values(standardOptions).flat();
        } else {
          allOptions = standardOptions;
        }
        if (allOptions.includes(value)) {
          return { value, custom: '' };
        } else {
          return { value: 'Other', custom: value };
        }
      };

      const resReligion = resolveOther(profile.religion, RELIGION_OPTIONS);
      const resCaste = resolveOther(profile.caste, MAHARASHTRA_CASTES);
      const resDistrict = resolveOther(profile.city, MAHARASHTRA_DISTRICTS.map(d => d.district));
      
      // For Taluka, we need the specific district's talukas
      const districtData = MAHARASHTRA_DISTRICTS.find(d => d.district === profile.city);
      const resTaluka = resolveOther(profile.state, districtData ? districtData.talukas : []);
      
      const resEdu = resolveOther(profile.education, COMPREHENSIVE_EDUCATION, true);
      const resWorkWith = resolveOther(profile.company_type, WORK_WITH_OPTIONS);
      const resWorkAs = resolveOther(profile.profession, CATEGORIZED_PROFESSIONS, true);
      const resIncome = resolveOther(profile.salary, INCOME_OPTIONS);
      const resMarital = resolveOther(formatMaritalStatus(profile.marital_status), MARITAL_STATUS_OPTIONS);

      console.log("Initializing Edit Modal with profile:", profile);
      setFormData(prev => ({
        ...prev,
        profileFor: profile.profile_for || 'Myself',
        gender: capitalize(profile.gender || 'Male'),
        firstName,
        middleName,
        lastName,
        religion: resReligion.value,
        caste: resCaste.value,
        dobDay: day || '',
        dobMonth: month || '',
        dobYear: year || '',
        district: resDistrict.value,
        taluka: resTaluka.value,
        maritalStatus: resMarital.value,
        height: profile.height?.toString() || '',
        highestQualification: resEdu.value,
        college: profile.college_name || '',
        workWith: resWorkWith.value,
        workAs: resWorkAs.value,
        income: resIncome.value,
        email: user?.email || '',
        mobile: '', 
        existingPhotos: [],
        newPhotos: [],
        profilePhotoIndex: -1
      }));

      setCustomValues({
        religion: resReligion.custom,
        caste: resCaste.custom,
        district: resDistrict.custom,
        taluka: resTaluka.custom,
        maritalStatus: resMarital.custom,
        highestQualification: resEdu.custom,
        workWith: resWorkWith.custom,
        workAs: resWorkAs.custom,
        income: resIncome.custom
      });
      
      // Fetch mobile separately as it's in another table
      profileService.getMobileNumber(user.id).then(m => {
        if (m) setFormData(prev => ({ ...prev, mobile: m.replace('+91', '') }));
      });

      loadPhotos();
      setCurrentStep(defaultStep); // Reset to default step when opened
    }
  }, [profile, isOpen, user, defaultStep]);

  const loadPhotos = async () => {
    if (!user?.id) return;
    try {
      const p = await photoService.getUserPhotos(user.id);
      setFormData(prev => ({ ...prev, existingPhotos: p }));
    } catch (err) {
      console.error(err);
    }
  };

  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  const formatMaritalStatus = (s) => {
    if (!s) return '';
    return s.split('_').map(capitalize).join(' ');
  };

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const updateCustomValue = (field, value) => {
    setCustomValues(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 4 && !validateDOB()) return;
    if (currentStep < totalSteps) setCurrentStep(prev => prev + 1);
    else handleSave();
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const validateDOB = () => {
    const day = parseInt(formData.dobDay);
    const month = parseInt(formData.dobMonth);
    const year = parseInt(formData.dobYear);
    const newErrors = {};

    if (isNaN(day) || day < 1 || day > 31) newErrors.dobDay = "Invalid Day";
    if (isNaN(month) || month < 1 || month > 12) newErrors.dobMonth = "Invalid Month";
    const curYear = new Date().getFullYear();
    if (isNaN(year) || year < 1950 || year > curYear - 18) newErrors.dobYear = "Must be 18+";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return !!(formData.profileFor && formData.gender);
      case 2: return !!(formData.firstName && formData.lastName);
      case 3: return !!(formData.religion && formData.caste);
      case 4: return !!(formData.dobDay && formData.dobMonth && formData.dobYear.length === 4);
      case 5: return !!(formData.district && formData.taluka);
      case 6: return !!(formData.maritalStatus && formData.height);
      case 7: return !!(formData.highestQualification);
      case 8: return !!(formData.workWith && formData.workAs && formData.income);
      case 9: return (formData.existingPhotos.length + formData.newPhotos.length) > 0;
      case 10: return !!(formData.email && formData.mobile);
      default: return true;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Resolve "Other" custom values
      const finalData = {
        ...formData,
        ...Object.keys(customValues).reduce((acc, key) => {
          if (formData[key] === 'Other') {
            acc[key] = customValues[key];
          }
          return acc;
        }, {})
      };

      const dob = `${finalData.dobYear}-${String(finalData.dobMonth).padStart(2, '0')}-${String(finalData.dobDay).padStart(2, '0')}`;
      const fullName = `${finalData.firstName} ${finalData.middleName} ${finalData.lastName}`.replace(/\s+/g, ' ').trim();

      // 1. Update Profile
      await profileService.updateProfile(user.id, {
        name: fullName,
        first_name: finalData.firstName,
        last_name: finalData.lastName,
        gender: finalData.gender?.toLowerCase(),
        dob,
        height: finalData.height ? parseInt(finalData.height) : null,
        religion: finalData.religion,
        caste: finalData.caste,
        sub_community: finalData.caste,
        education: finalData.highestQualification,
        profession: finalData.workAs,
        salary: finalData.income,
        city: finalData.district,
        state: finalData.taluka,
        marital_status: finalData.maritalStatus?.toLowerCase().replace(/\s+/g, '_'),
        profile_for: finalData.profileFor,
        college_name: finalData.college,
        company_type: finalData.workWith,
      });

      // 2. Handle Photos
      // Delete photos marked for deletion
      if (formData.photosToDelete.length > 0) {
        for (const item of formData.photosToDelete) {
          await photoService.deletePhoto(item.id, user.id, item.storagePath);
        }
      }

      // Set primary if an existing photo was selected
      if (formData.newPrimaryPhotoId) {
        await photoService.setPrimaryPhoto(formData.newPrimaryPhotoId, user.id);
      }

      // Upload new photos
      if (formData.newPhotos.length > 0) {
        for (let i = 0; i < formData.newPhotos.length; i++) {
          const isPrimary = i === formData.profilePhotoIndex;
          await photoService.uploadPhoto(user.id, formData.newPhotos[i].file, isPrimary);
        }
      }

      toast.success('Profile updated successfully!');
      onSave?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // Photo Handlers
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setFormData(prev => {
      const currentTotal = prev.existingPhotos.length + prev.newPhotos.length;
      const allowedCount = 3 - currentTotal;

      if (allowedCount <= 0) {
        toast.error("Max 3 photos allowed");
        return prev;
      }

      // Only take up to what's allowed
      const filesToAdd = files.slice(0, allowedCount);
      if (files.length > allowedCount) {
        toast.error(`Only ${allowedCount} more photo(s) allowed. Skipping extras.`);
      }

      const newOnes = filesToAdd.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));

      return {
        ...prev,
        newPhotos: [...prev.newPhotos, ...newOnes]
      };
    });
    
    e.target.value = '';
  };

  const removeNewPhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      newPhotos: prev.newPhotos.filter((_, i) => i !== index),
      profilePhotoIndex: prev.profilePhotoIndex === index ? -1 : prev.profilePhotoIndex > index ? prev.profilePhotoIndex - 1 : prev.profilePhotoIndex
    }));
  };

  const removeExistingPhoto = (photoId, storagePath) => {
    setFormData(prev => ({
      ...prev,
      existingPhotos: prev.existingPhotos.filter(p => p.id !== photoId),
      photosToDelete: [...prev.photosToDelete, { id: photoId, storagePath }],
      newPrimaryPhotoId: prev.newPrimaryPhotoId === photoId ? null : prev.newPrimaryPhotoId
    }));
  };

  const setAsProfilePhoto = (index, isExisting = false, photoId = null) => {
    if (isExisting && photoId) {
      setFormData(prev => ({ 
        ...prev, 
        newPrimaryPhotoId: photoId,
        profilePhotoIndex: -1,
        // Update UI state for existing photos
        existingPhotos: prev.existingPhotos.map(p => ({ ...p, is_primary: p.id === photoId }))
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        profilePhotoIndex: index,
        newPrimaryPhotoId: null,
        // Mark all existing as non-primary in UI
        existingPhotos: prev.existingPhotos.map(p => ({ ...p, is_primary: false }))
      }));
    }
  };

  if (!isOpen) return null;

  const iconConfig = getStepIconConfig(currentStep);

  return (
    <div className="edit-modal-overlay">
      <div className="edit-card">
        <button className="card-close-btn" onClick={onClose} title="Close">
          <X size={20} />
        </button>
        
        {currentStep > 1 && (
          <button className="card-back-btn" onClick={handleBack} title="Go Back">
            <ArrowLeft size={20} />
          </button>
        )}

        <div className="step-icon-container">
          <div className="step-icon-circle" style={{ backgroundColor: iconConfig.bg, color: iconConfig.color }}>
            {iconConfig.icon}
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          <span className="progress-text">Step {currentStep} of {totalSteps}</span>
        </div>

        <div className="step-scroll-area">
          {currentStep === 1 && renderStep1(formData, updateForm)}
          {currentStep === 2 && renderStep2(formData, updateForm)}
          {currentStep === 3 && renderStep3(formData, updateForm, customValues, updateCustomValue)}
          {currentStep === 4 && renderStep4(formData, updateForm, errors, setErrors)}
          {currentStep === 5 && renderStep5(formData, updateForm, customValues, updateCustomValue)}
          {currentStep === 6 && renderStep6(formData, updateForm)}
          {currentStep === 7 && renderStep7(formData, updateForm, customValues, updateCustomValue)}
          {currentStep === 8 && renderStep8(formData, updateForm, customValues, updateCustomValue)}
          {currentStep === 9 && renderStep9(formData, fileInputRef, handlePhotoSelect, removeExistingPhoto, removeNewPhoto, setAsProfilePhoto)}
          {currentStep === 10 && renderStep10(formData, updateForm, loading, handleSave, isStepValid)}
        </div>

        {currentStep < 10 && (
          <div className="step-footer">
            <button
              className="primary-btn full-width"
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              {currentStep === 9 ? "Continue to Last Step" : "Continue"}
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .edit-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .edit-card {
          background: #fff;
          width: 100%;
          max-width: 480px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
          position: relative;
          max-height: 90vh;
        }

        .card-close-btn {
          position: absolute;
          top: 20px; right: 20px;
          background: #f7fafc; border: none; color: #4a5568;
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 20;
        }
        .card-back-btn {
          position: absolute;
          top: 20px; left: 20px;
          background: #f7fafc; border: none; color: #4a5568;
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 20;
        }

        .step-icon-container { display: flex; justify-content: center; margin-top: -30px; margin-bottom: 10px; }
        .step-icon-circle {
          width: 70px; height: 70px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        .progress-container { padding: 15px 25px 0; display: flex; flex-direction: column; gap: 6px; }
        .progress-bar-bg { width: 100%; height: 4px; background: #edf2f7; border-radius: 2px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: #D9475C; transition: width 0.3s ease; }
        .progress-text { font-size: 10px; color: #718096; font-weight: 700; text-transform: uppercase; align-self: flex-end; }

        .step-scroll-area {
          flex: 1;
          overflow-y: auto;
          padding: 10px 25px 20px;
        }

        .step-footer { padding: 0 25px 25px; }

        /* Reusing Registration Styles */
        .step-title { font-size: 20px; font-weight: 700; color: #1a202c; margin: 10px 0 8px; }
        .step-subtitle { font-size: 13px; color: #718096; margin-bottom: 20px; }
        .form-group { margin-bottom: 15px; }
        .input-label { font-size: 12px; font-weight: 600; color: #4a5568; margin-bottom: 6px; display: block; }
        
        .select-input, .text-input {
          width: 100%; padding: 12px 14px; border: 1px solid #cbd5e0; border-radius: 10px;
          font-size: 14px; color: #2d3748; outline: none; box-sizing: border-box;
        }
        .select-input {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center; background-size: 14px;
        }
        .text-input:focus, .select-input:focus { border-color: #D9475C; }

        .chip-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .chip-btn {
          padding: 8px 16px; background: #fff; border: 1px solid #cbd5e0; border-radius: 20px;
          font-size: 13px; font-weight: 500; color: #4a5568; cursor: pointer;
        }
        .chip-btn.selected { background: rgba(217, 71, 92, 0.1); border-color: #D9475C; color: #D9475C; font-weight: 600; }
        
        .dob-grid { display: grid; grid-template-columns: 1fr 1fr 1.5fr; gap: 8px; }
        .custom-number-input { position: relative; display: flex; align-items: center; }
        .number-arrows { position: absolute; right: 4px; display: flex; flex-direction: column; gap: 1px; }
        .number-arrows button {
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 3px;
          width: 22px; height: 18px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #64748b; font-size: 10px; padding: 0;
        }

        .text-input-locked {
          position: relative;
          display: flex;
          align-items: center;
        }
        .text-input-locked .text-input {
          background: #f8fafc !important;
          color: #1e293b !important;
          cursor: not-allowed;
          padding-right: 40px;
          border-color: #e2e8f0;
        }
        .lock-icon {
          position: absolute;
          right: 12px;
          color: #94a3b8;
          font-size: 14px;
        }

        .multi-photo-grid { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 15px; }
        .photo-item-card {
          position: relative; width: 100px; height: 100px; border-radius: 10px; overflow: hidden;
          background: #f7fafc; border: 1px solid #edf2f7;
        }
        .photo-item-img { width: 100%; height: 100%; object-fit: cover; }
        .photo-actions-overlay {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s; z-index: 10; cursor: pointer;
        }
        .photo-item-card:hover .photo-actions-overlay { opacity: 1; }
        .photo-action-text-btn { background: none; border: none; color: white; font-size: 9px; font-weight: 600; padding: 5px; text-align: center; }
        .photo-corner-btn {
          position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border-radius: 50%;
          background: rgba(0,0,0,0.6); color: white; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 20;
        }
        .photo-add-card {
          width: 100px; height: 100px; border: 2px dashed #cbd5e0; border-radius: 10px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; color: #a0aec0; gap: 4px; font-size: 10px;
        }

        .primary-btn {
          background: #D9475C; color: white; border: none; padding: 14px; border-radius: 25px;
          font-size: 15px; font-weight: 600; cursor: pointer; transition: 0.2s;
        }
        .primary-btn:disabled { background: #e2e8f0; color: #a0aec0; cursor: not-allowed; }

        .error-text { color: #e53e3e; font-size: 10px; margin-top: 2px; }
        .full-width { width: 100%; }

        @media (max-width: 480px) {
          .edit-card { border-radius: 0; max-height: 100vh; height: 100vh; max-width: 100%; }
        }
      `}} />
    </div>
  );
}

// --- Sub-components (Copied from Registration with adjustments) ---

function getStepIconConfig(step) {
  const configs = {
    1: { icon: <HiUser size={30} />, bg: '#BEE3F8', color: '#2B6CB0' },
    2: { icon: <HiIdentification size={30} />, bg: '#C6F6D5', color: '#2F855A' },
    3: { icon: <HiUserGroup size={30} />, bg: '#FED7E2', color: '#B83280' },
    4: { icon: <HiCalendarDays size={30} />, bg: '#FEEBC8', color: '#C05621' },
    5: { icon: <HiMapPin size={30} />, bg: '#E2E8F0', color: '#2D3748' },
    6: { icon: <HiSparkles size={30} />, bg: '#FED7D7', color: '#C53030' },
    7: { icon: <HiAcademicCap size={30} />, bg: '#B2F5EA', color: '#2C7A7B' },
    8: { icon: <HiBriefcase size={30} />, bg: '#E9D8FD', color: '#6B46C1' },
    9: { icon: <HiCamera size={30} />, bg: '#BEE3F8', color: '#2B6CB0' },
    10: { icon: <HiLockClosed size={30} />, bg: '#C6F6D5', color: '#2F855A' }
  };
  return configs[step] || configs[1];
}

const renderSelectField = (label, field, options, formData, updateForm, customValues, updateCustomValue, isCategorized = false) => {
  const isOtherSelected = formData[field] === 'Other';
  return (
    <div className="form-group animate-fade-in">
      <label className="input-label">{label}</label>
      <select className="select-input" value={formData[field]} onChange={(e) => updateForm(field, e.target.value)}>
        <option value="">Select {label}</option>
        {isCategorized ? (
          Object.entries(options).map(([cat, items]) => (
            <optgroup key={cat} label={cat}>
              {items.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </optgroup>
          ))
        ) : (
          options.map(opt => <option key={opt} value={opt}>{opt}</option>)
        )}
        <option value="Other">Other</option>
      </select>
      {isOtherSelected && (
        <input type="text" className="text-input mt-2" placeholder={`Type ${label}`} value={customValues[field]} onChange={(e) => updateCustomValue(field, e.target.value)} />
      )}
    </div>
  );
};

const renderStep1 = (formData, updateForm) => (
  <div className="step-content">
    <h2 className="step-title">Profile for?</h2>
    <div className="chip-grid">
      {["Myself", "My Son", "My Daughter", "My Brother", "My Sister", "My Friend", "My Relative"].map(opt => (
        <button key={opt} className={`chip-btn ${formData.profileFor === opt ? 'selected' : ''}`} onClick={() => updateForm('profileFor', opt)}>{opt}</button>
      ))}
    </div>
    <div className="mt-4">
      <h3 className="input-label">Gender</h3>
      <div className="chip-grid">
        {["Male", "Female"].map(opt => (
          <button key={opt} className={`chip-btn ${formData.gender === opt ? 'selected' : ''}`} onClick={() => updateForm('gender', opt)}>{opt}</button>
        ))}
      </div>
    </div>
  </div>
);

const renderStep2 = (formData, updateForm) => (
  <div className="step-content">
    <h2 className="step-title">What's your name?</h2>
    <div className="form-group">
      <label className="input-label">First Name</label>
      <input type="text" className="text-input" value={formData.firstName} onChange={(e) => updateForm('firstName', e.target.value)} />
    </div>
    <div className="form-group">
      <label className="input-label">Middle Name</label>
      <input type="text" className="text-input" value={formData.middleName} onChange={(e) => updateForm('middleName', e.target.value)} />
    </div>
    <div className="form-group">
      <label className="input-label">Last Name</label>
      <input type="text" className="text-input" value={formData.lastName} onChange={(e) => updateForm('lastName', e.target.value)} />
    </div>
  </div>
);

const renderStep3 = (formData, updateForm, customValues, updateCustomValue) => (
  <div className="step-content">
    <h2 className="step-title">Background</h2>
    {renderSelectField("Religion", "religion", RELIGION_OPTIONS, formData, updateForm, customValues, updateCustomValue)}
    {renderSelectField("Caste", "caste", MAHARASHTRA_CASTES, formData, updateForm, customValues, updateCustomValue)}
  </div>
);

const renderStep4 = (formData, updateForm, errors, setErrors) => {
  const adjust = (field, delta) => {
    let val = parseInt(formData[field]) || 0;
    let newVal = val + delta;
    if (field === 'dobDay' && (newVal < 1 || newVal > 31)) return;
    if (field === 'dobMonth' && (newVal < 1 || newVal > 12)) return;
    if (field === 'dobYear' && newVal < 1950) return;
    updateForm(field, String(newVal));
  };

  return (
    <div className="step-content">
      <h2 className="step-title">Date of Birth</h2>
      <div className="dob-grid">
        {['dobDay', 'dobMonth', 'dobYear'].map((f, i) => (
          <div className="form-group" key={f}>
            <label className="input-label">{i === 0 ? 'Day' : i === 1 ? 'Month' : 'Year'}</label>
            <div className="custom-number-input">
              <input type="number" className="text-input" value={formData[f]} onChange={(e) => updateForm(f, e.target.value)} placeholder={i === 2 ? "YYYY" : i === 1 ? "MM" : "DD"} />
              <div className="number-arrows">
                <button onClick={() => adjust(f, 1)}><ChevronUp size={10} /></button>
                <button onClick={() => adjust(f, -1)}><ChevronDown size={10} /></button>
              </div>
            </div>
            {errors[f] && <span className="error-text">{errors[f]}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

const renderStep5 = (formData, updateForm, customValues, updateCustomValue) => {
  const districts = MAHARASHTRA_DISTRICTS.map(d => d.district);
  const districtValue = formData.district === 'Other' ? customValues.district : formData.district;
  const districtData = MAHARASHTRA_DISTRICTS.find(d => d.district === districtValue);
  const talukas = districtData ? districtData.talukas : [];

  return (
    <div className="step-content">
      <h2 className="step-title">Location</h2>
      {renderSelectField("District", "district", districts, formData, updateForm, customValues, updateCustomValue)}
      {renderSelectField("Taluka", "taluka", talukas, formData, updateForm, customValues, updateCustomValue)}
    </div>
  );
};

const renderStep6 = (formData, updateForm) => (
  <div className="step-content">
    <h2 className="step-title">Traits</h2>
    <div className="form-group">
      <label className="input-label">Marital Status</label>
      <select className="select-input" value={formData.maritalStatus} onChange={(e) => updateForm('maritalStatus', e.target.value)}>
        <option value="">Select</option>
        {MARITAL_STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        <option value="Other">Other</option>
      </select>
      {formData.maritalStatus === 'Other' && (
        <input type="text" className="text-input mt-2" placeholder="Type Marital Status" value={customValues.maritalStatus} onChange={(e) => updateCustomValue('maritalStatus', e.target.value)} />
      )}
    </div>
    <div className="form-group">
      <label className="input-label">Height</label>
      <select className="select-input" value={formData.height} onChange={(e) => updateForm('height', e.target.value)}>
        <option value="">Select</option>
        {HEIGHTS_CM.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
      </select>
    </div>
  </div>
);

const renderStep7 = (formData, updateForm, customValues, updateCustomValue) => (
  <div className="step-content">
    <h2 className="step-title">Education</h2>
    {renderSelectField("Highest Qualification", "highestQualification", COMPREHENSIVE_EDUCATION, formData, updateForm, customValues, updateCustomValue, true)}
    <div className="form-group">
      <label className="input-label">College Name</label>
      <input type="text" className="text-input" value={formData.college} onChange={(e) => updateForm('college', e.target.value)} />
    </div>
  </div>
);

const renderStep8 = (formData, updateForm, customValues, updateCustomValue) => (
  <div className="step-content">
    <h2 className="step-title">Career</h2>
    {renderSelectField("Work With", "workWith", WORK_WITH_OPTIONS, formData, updateForm, customValues, updateCustomValue)}
    {renderSelectField("Profession", "workAs", CATEGORIZED_PROFESSIONS, formData, updateForm, customValues, updateCustomValue, true)}
    {renderSelectField("Annual Income", "income", INCOME_OPTIONS, formData, updateForm, customValues, updateCustomValue)}
  </div>
);

const renderStep9 = (formData, fileInputRef, handlePhotoSelect, removeExisting, removeNew, setPrimary) => (
  <div className="step-content">
    <h2 className="step-title">Photos</h2>
    <p className="step-subtitle">Upload up to 3 photos. Star marks primary.</p>
    <div className="multi-photo-grid">
      {formData.existingPhotos.map((p, i) => (
        <div key={p.id} className="photo-item-card">
          <img src={p.signed_url} alt="Profile" className="photo-item-img" />
          <div className="photo-actions-overlay">
            <button className="photo-action-text-btn" onClick={() => setPrimary(i, true, p.id)}>
              {p.is_primary ? <span className="active-label"><Check size={10} /> Primary</span> : "Set Primary"}
            </button>
          </div>
          <button className="photo-corner-btn" onClick={() => removeExisting(p.id, p.storage_path)}><X size={12} /></button>
          {p.is_primary && <div className="main-photo-indicator" style={{ bottom: 4, right: 4 }}><Star size={10} fill="white" /></div>}
        </div>
      ))}
      {formData.newPhotos.map((p, i) => (
        <div key={i} className="photo-item-card">
          <img src={p.preview} alt="New" className="photo-item-img" />
          <div className="photo-actions-overlay">
            <button className="photo-action-text-btn" onClick={() => setPrimary(i, false)}>
              {formData.profilePhotoIndex === i ? <span className="active-label"><Check size={10} /> Primary</span> : "Set Primary"}
            </button>
          </div>
          <button className="photo-corner-btn" onClick={() => removeNew(i)}><X size={12} /></button>
          {formData.profilePhotoIndex === i && <div className="main-photo-indicator" style={{ bottom: 4, right: 4 }}><Star size={10} fill="white" /></div>}
        </div>
      ))}
      {formData.existingPhotos.length + formData.newPhotos.length < 3 && (
        <div className="photo-add-card" onClick={() => fileInputRef.current?.click()}>
          <HiCamera size={24} />
          <span>Add Photo</span>
        </div>
      )}
    </div>
    <input type="file" ref={fileInputRef} accept="image/*" hidden onChange={handlePhotoSelect} />
  </div>
);

const renderStep10 = (formData, updateForm, loading, handleSave, isValid) => (
  <div className="step-content">
    <h2 className="step-title">Account Details</h2>
    <p className="step-subtitle">Your contact information is verified and locked. To change these, please contact support.</p>
    
    <div className="form-group">
      <label className="input-label">Email ID (Locked)</label>
      <div className="text-input-locked">
        <input type="email" className="text-input" value={formData.email} readOnly disabled />
        <span className="lock-icon">🔒</span>
      </div>
    </div>
    
    <div className="form-group">
      <label className="input-label">Mobile Number (Locked)</label>
      <div className="text-input-locked">
        <div className="phone-input-group" style={{ width: '100%' }}>
          <span className="country-code" style={{ padding: '12px', background: '#f8fafc', borderRight: '1px solid #cbd5e0', borderRadius: '10px 0 0 10px' }}>+91</span>
          <input type="tel" className="text-input" style={{ borderRadius: '0 10px 10px 0' }} value={formData.mobile} readOnly disabled />
        </div>
        <span className="lock-icon">🔒</span>
      </div>
    </div>

    <p className="step-subtitle mt-4">Confirm all other details before saving. Changes will reflect on your dashboard immediately.</p>
    <button className="primary-btn full-width" onClick={handleSave} disabled={loading || !isValid()}>
      {loading ? "Updating Profile..." : "Save All Changes"}
    </button>
  </div>
);
