import React, { useState, useRef } from 'react';
import { ArrowLeft, ShieldCheck, Search, User, Trash2, Star, Check, X, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  MAHARASHTRA_DISTRICTS,
  MAHARASHTRA_CASTES,
  CATEGORIZED_PROFESSIONS,
  COMPREHENSIVE_EDUCATION,
  HEIGHTS_CM
} from '../data/maharashtraData';
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
import LandingPage from './LandingPage';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 10;
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    profileFor: '',
    gender: '',
    firstName: '',
    middleName: '', // Father's Name
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
    photos: [], // Array of { file, preview }
    profilePhotoIndex: 0
  });

  // Track custom "Other" values for all dropdowns
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

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateCustomValue = (field, value) => {
    setCustomValues(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 4 && !validateDOB()) return;
    if (currentStep < totalSteps) setCurrentStep(prev => prev + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
    else navigate(-1);
  };

  const handleSubmit = () => {
    if (!validateEmail(formData.email) || !validateMobile(formData.mobile)) return;

    const finalData = {
      ...formData,
      ...Object.keys(customValues).reduce((acc, key) => {
        if (formData[key] === 'Other') {
          acc[key] = customValues[key];
        }
        return acc;
      }, {})
    };
    console.log("Submitting Profile:", finalData);
    toast.success("Registration Successful!");
    setTimeout(() => navigate('/'), 1500);
  };

  // Validation
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateMobile = (mobile) => {
    return /^[6-9]\d{9}$/.test(mobile);
  };

  const validateDOB = () => {
    const day = parseInt(formData.dobDay);
    const month = parseInt(formData.dobMonth);
    const year = parseInt(formData.dobYear);
    const newErrors = {};

    if (isNaN(day) || day < 1 || day > 31) {
      newErrors.dobDay = "Invalid Day (1-31)";
    }
    if (isNaN(month) || month < 1 || month > 12) {
      newErrors.dobMonth = "Invalid Month (1-12)";
    }
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1950 || year > currentYear - 18) {
      newErrors.dobYear = "Must be 18+ years";
    }
    
    if (Object.keys(newErrors).length === 0) {
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        newErrors.dobDate = "Invalid Date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return !!(formData.profileFor && formData.gender);
      case 2: return !!(formData.firstName && formData.middleName && formData.lastName);
      case 3: return !!(formData.religion && formData.caste);
      case 4: {
        const day = parseInt(formData.dobDay);
        const month = parseInt(formData.dobMonth);
        const year = parseInt(formData.dobYear);
        if (isNaN(day) || day < 1 || day > 31) return false;
        if (isNaN(month) || month < 1 || month > 12) return false;
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1950 || year > currentYear - 18) return false;
        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
      }
      case 5: return !!(formData.district && formData.taluka);
      case 6: return !!(formData.maritalStatus && formData.height);
      case 7: return !!(formData.highestQualification);
      case 8: return !!(formData.workWith && formData.workAs && formData.income);
      case 9: return formData.photos.length > 0;
      case 10: return validateEmail(formData.email) && validateMobile(formData.mobile) && formData.password.length >= 6;
      default: return true;
    }
  };

  // DOB Auto-tabbing logic & Real-time validation
  const handleDOBChange = (field, value, nextFieldId) => {
    if (value.length > 4) return; // Limit to 4 max (for year)
    if (field !== 'dobYear' && value.length > 2) return;
    
    updateForm(field, value);
    
    // Real-time field validation
    setErrors(prev => {
      const newErrors = { ...prev };
      const val = parseInt(value);
      
      if (field === 'dobDay') {
        if (value && (isNaN(val) || val < 1 || val > 31)) {
          newErrors.dobDay = "Invalid Day (1-31)";
        } else {
          delete newErrors.dobDay;
        }
      } else if (field === 'dobMonth') {
        if (value && (isNaN(val) || val < 1 || val > 12)) {
          newErrors.dobMonth = "Invalid Month (1-12)";
        } else {
          delete newErrors.dobMonth;
        }
      } else if (field === 'dobYear') {
        if (value.length === 4) {
          const currentYear = new Date().getFullYear();
          if (isNaN(val) || val < 1950 || val > currentYear - 18) {
            newErrors.dobYear = "Must be 18+ years";
          } else {
            delete newErrors.dobYear;
          }
        } else if (value.length > 0 && value.length < 4) {
          // Don't show error while typing 4 digits unless it's obviously wrong (too short/long)
        }
      }
      return newErrors;
    });

    if ((field === 'dobDay' || field === 'dobMonth') && value.length === 2 && nextFieldId) {
      document.getElementById(nextFieldId)?.focus();
    }
  };

  // Photo Handling
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setFormData(prev => {
      const combined = [...prev.photos, ...newPhotos].slice(0, 3);
      return { ...prev, photos: combined };
    });

    e.target.value = '';
  };

  const removePhoto = (index) => {
    setFormData(prev => {
      const newPhotos = prev.photos.filter((_, i) => i !== index);
      let newProfileIndex = prev.profilePhotoIndex;
      if (newProfileIndex === index) newProfileIndex = 0;
      else if (newProfileIndex > index) newProfileIndex--;
      return { ...prev, photos: newPhotos, profilePhotoIndex: newProfileIndex };
    });
  };

  const setAsProfilePhoto = (index) => {
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

  // --- Reusable Components ---

  const getStepIconConfig = () => {
    switch (currentStep) {
      case 1: return { icon: <HiUser size={40} />, bg: '#BEE3F8', color: '#2B6CB0' };
      case 2: return { icon: <HiIdentification size={40} />, bg: '#C6F6D5', color: '#2F855A' };
      case 3: return { icon: <HiUserGroup size={40} />, bg: '#FED7E2', color: '#B83280' };
      case 4: return { icon: <HiCalendarDays size={40} />, bg: '#FEEBC8', color: '#C05621' };
      case 5: return { icon: <HiMapPin size={40} />, bg: '#E2E8F0', color: '#2D3748' };
      case 6: return { icon: <HiSparkles size={40} />, bg: '#FED7D7', color: '#C53030' };
      case 7: return { icon: <HiAcademicCap size={40} />, bg: '#B2F5EA', color: '#2C7A7B' };
      case 8: return { icon: <HiBriefcase size={40} />, bg: '#E9D8FD', color: '#6B46C1' };
      case 9: return { icon: <HiCamera size={40} />, bg: '#BEE3F8', color: '#2B6CB0' };
      case 10: return { icon: <HiLockClosed size={40} />, bg: '#C6F6D5', color: '#2F855A' };
      default: return { icon: <HiUser size={40} />, bg: '#BEE3F8', color: '#2B6CB0' };
    }
  };

  const iconConfig = getStepIconConfig();

  const renderSelectField = (label, field, options, isCategorized = false) => {
    const isOtherSelected = formData[field] === 'Other';

    return (
      <div className="form-group animate-fade-in">
        <label className="input-label">{label}</label>
        <select
          className="select-input"
          value={formData[field]}
          onChange={(e) => updateForm(field, e.target.value)}
        >
          <option value="">Select {label}</option>
          {isCategorized ? (
            Object.entries(options).map(([category, items]) => (
              <optgroup key={category} label={category}>
                {items.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </optgroup>
            ))
          ) : (
            options.map(opt => <option key={opt} value={opt}>{opt}</option>)
          )}
          <option value="Other">Other (Not in list)</option>
        </select>

        {isOtherSelected && (
          <div className="mt-2 animate-fade-in">
            <input
              type="text"
              className="text-input"
              placeholder={`Type your ${label.toLowerCase()}`}
              value={customValues[field]}
              onChange={(e) => updateCustomValue(field, e.target.value)}
              autoFocus
            />
          </div>
        )}
      </div>
    );
  };

  // --- Step Content Renders ---

  // Step 1: Profile For & Gender
  const renderStep1 = () => {
    const profileOptions = ["Myself", "My Son", "My Daughter", "My Brother", "My Sister", "My Friend", "My Relative"];
    const genderOptions = ["Male", "Female"];

    return (
      <div className="step-content animate-slide-in">
        <h2 className="step-title">Who are you creating this profile for?</h2>
        <div className="chip-grid">
          {profileOptions.map(opt => (
            <button
              key={opt}
              className={`chip-btn ${formData.profileFor === opt ? 'selected' : ''}`}
              onClick={() => updateForm('profileFor', opt)}
            >
              {opt}
            </button>
          ))}
        </div>

        {formData.profileFor && (
          <div className="animate-fade-in mt-4">
            <h3 className="input-label">What is their gender?</h3>
            <div className="chip-grid gender-grid">
              {genderOptions.map(opt => (
                <button
                  key={opt}
                  className={`chip-btn gender-btn ${formData.gender === opt ? 'selected' : ''}`}
                  onClick={() => {
                    updateForm('gender', opt);
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          className="primary-btn full-width mt-10"
          onClick={handleNext}
          disabled={!isStepValid()}
        >
          Continue
        </button>

        <div className="trust-info-box mt-6">
          <div className="info-icon-box">
            <ShieldCheck size={20} className="info-icon" />
          </div>
          <div className="info-text">
            SakharPuda is built for genuine match-seekers. Falsification, commercial use, and marriage bureaus are strictly prohibited and may be reported to law enforcement.
          </div>
        </div>
      </div>
    );
  };

  // Step 2: Name (Updated with Father's Name)
  const renderStep2 = () => (
    <div className="step-content animate-slide-in">
      <h2 className="step-title">What is your name?</h2>
      <div className="form-group">
        <label className="input-label">First Name</label>
        <input
          type="text"
          className="text-input"
          placeholder="Enter First Name"
          value={formData.firstName}
          onChange={(e) => updateForm('firstName', e.target.value)}
        />
      </div>
      {formData.firstName && (
        <div className="form-group animate-reveal delay-1">
          <label className="input-label">Father's Name</label>
          <input
            type="text"
            className="text-input"
            placeholder="Enter Father's Name"
            value={formData.middleName}
            onChange={(e) => updateForm('middleName', e.target.value)}
          />
        </div>
      )}
      {formData.middleName && (
        <div className="form-group animate-reveal delay-2">
          <label className="input-label">Last Name</label>
          <input
            type="text"
            className="text-input"
            placeholder="Enter Last Name"
            value={formData.lastName}
            onChange={(e) => updateForm('lastName', e.target.value)}
          />
        </div>
      )}
      <button
        className="primary-btn full-width mt-4"
        onClick={handleNext}
        disabled={!isStepValid()}
      >
        Continue
      </button>
    </div>
  );

  // Step 3: Background (Religion & Caste)
  const renderStep3 = () => {
    const religionOptions = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Parsi"];
    return (
      <div className="step-content animate-slide-in">
        <h2 className="step-title">Let's start with your background</h2>
        <p className="step-subtitle">This helps us find the best matches in your community.</p>

        {renderSelectField("Religion", "religion", religionOptions)}
        {formData.religion && (
          <div className="animate-reveal delay-1">
            {renderSelectField("Caste", "caste", MAHARASHTRA_CASTES)}
          </div>
        )}

        <button
          className="primary-btn full-width mt-4"
          onClick={handleNext}
          disabled={!isStepValid()}
        >
          Continue
        </button>
      </div>
    );
  };

  // Step 4: DOB (Auto-tabbing)
  const renderStep4 = () => (
    <div className="step-content animate-slide-in">
      <h2 className="step-title">What is your Date of Birth?</h2>
      <div className="dob-grid">
        <div className="form-group">
          <label className="input-label text-center">Day</label>
          <input
            id="dobDay"
            type="number"
            className={`text-input text-center ${errors.dobDay ? 'input-error' : ''}`}
            placeholder="DD"
            value={formData.dobDay}
            onChange={(e) => handleDOBChange('dobDay', e.target.value, 'dobMonth')}
          />
          {errors.dobDay && <span className="error-text">{errors.dobDay}</span>}
        </div>
        <div className="form-group">
          <label className="input-label text-center">Month</label>
          <input
            id="dobMonth"
            type="number"
            className={`text-input text-center ${errors.dobMonth ? 'input-error' : ''}`}
            placeholder="MM"
            value={formData.dobMonth}
            onChange={(e) => handleDOBChange('dobMonth', e.target.value, 'dobYear')}
          />
          {errors.dobMonth && <span className="error-text">{errors.dobMonth}</span>}
        </div>
        <div className="form-group">
          <label className="input-label text-center">Year</label>
          <input
            id="dobYear"
            type="number"
            className={`text-input text-center ${errors.dobYear ? 'input-error' : ''}`}
            placeholder="YYYY"
            value={formData.dobYear}
            onChange={(e) => handleDOBChange('dobYear', e.target.value)}
            onBlur={(e) => {
              // Final year validation on blur
              const val = parseInt(e.target.value);
              const currentYear = new Date().getFullYear();
              if (e.target.value.length > 0 && (isNaN(val) || val < 1950 || val > currentYear - 18)) {
                setErrors(prev => ({ ...prev, dobYear: "Must be 18+ years" }));
              }
            }}
          />
          {errors.dobYear && <span className="error-text">{errors.dobYear}</span>}
        </div>
      </div>
      {errors.dobDate && <p className="error-text text-center mt-2">{errors.dobDate}</p>}
      <button
        className="primary-btn full-width mt-6"
        onClick={handleNext}
        disabled={!isStepValid()}
      >
        Continue
      </button>
    </div>
  );

  // Step 5: Location (District & Taluka)
  const renderStep5 = () => {
    const selectedDistrictData = MAHARASHTRA_DISTRICTS.find(d => d.district === formData.district);
    const talukas = selectedDistrictData ? selectedDistrictData.talukas : [];
    const districtNames = MAHARASHTRA_DISTRICTS.map(d => d.district);

    return (
      <div className="step-content animate-slide-in">
        <h2 className="step-title">Where do you live?</h2>

        {renderSelectField("District", "district", districtNames)}
        {formData.district && (
          <div className="animate-reveal delay-1">
            {renderSelectField("Taluka", "taluka", talukas)}
          </div>
        )}

        <button
          className="primary-btn full-width mt-4"
          onClick={handleNext}
          disabled={!isStepValid()}
        >
          Continue
        </button>
      </div>
    );
  };

  // Step 6: Personal Traits
  const renderStep6 = () => {
    const maritalOptions = ["Never Married", "Divorced", "Widowed", "Awaiting Divorce"];
    return (
      <div className="step-content animate-slide-in">
        <h2 className="step-title">Personal Traits</h2>

        {renderSelectField("Marital Status", "maritalStatus", maritalOptions)}

        {formData.maritalStatus && (
          <div className="form-group animate-reveal delay-1">
            <label className="input-label">Height</label>
            <select
              className="select-input"
              value={formData.height}
              onChange={(e) => updateForm('height', e.target.value)}
            >
              <option value="">Select Height</option>
              {HEIGHTS_CM.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
            </select>
          </div>
        )}

        <button
          className="primary-btn full-width mt-4"
          onClick={handleNext}
          disabled={!isStepValid()}
        >
          Continue
        </button>
      </div>
    );
  };

  // Step 7: Education
  const renderStep7 = () => (
    <div className="step-content animate-slide-in">
      <h2 className="step-title">Education</h2>

      {renderSelectField("Highest Qualification", "highestQualification", COMPREHENSIVE_EDUCATION, true)}

      <div className="form-group">
        <label className="input-label">College Name (Optional)</label>
        <input
          type="text"
          className="text-input"
          placeholder="e.g. Pune University"
          value={formData.college}
          onChange={(e) => updateForm('college', e.target.value)}
        />
      </div>

      <button
        className="primary-btn full-width mt-4"
        onClick={handleNext}
        disabled={!isStepValid()}
      >
        Continue
      </button>
    </div>
  );

  // Step 8: Work & Income
  const renderStep8 = () => {
    const workWithOptions = ["Private Company", "Government / PSU", "Defense", "Business / Self Employed", "Not Working"];
    const incomeOptions = ["Upto 3 Lakhs", "3 - 5 Lakhs", "5 - 10 Lakhs", "10 - 20 Lakhs", "20 - 30 Lakhs", "30 Lakhs+"];

    return (
      <div className="step-content animate-slide-in">
        <h2 className="step-title">Work & Income</h2>

        {renderSelectField("Sector", "workWith", workWithOptions)}
        {formData.workWith && (
          <div className="animate-reveal delay-1">
            {renderSelectField("Profession", "workAs", CATEGORIZED_PROFESSIONS, true)}
          </div>
        )}
        {formData.workAs && (
          <div className="animate-reveal delay-2">
            {renderSelectField("Annual Income", "income", incomeOptions)}
          </div>
        )}

        <button
          className="primary-btn full-width mt-10"
          onClick={handleNext}
          disabled={!isStepValid()}
        >
          Continue
        </button>
      </div>
    );
  };

  // Step 9: Profile Photo (Overhauled UI)
  const renderStep9 = () => (
    <div className="step-content animate-slide-in">
      <h2 className="step-title">Add your Profile Photos</h2>
      <p className="step-subtitle">Upload 1-3 photos. Minimum 1 photo required.</p>

      <div className="photo-container-centered">
        <div className="multi-photo-grid">
          {formData.photos.map((photo, index) => (
            <div key={index} className="photo-item-card">
              <img src={photo.preview} alt={`Upload ${index}`} className="photo-item-img" />

              <div className="photo-actions-overlay">
                <button
                  className="photo-action-text-btn"
                  onClick={() => setAsProfilePhoto(index)}
                >
                  {formData.profilePhotoIndex === index ? (
                    <span className="active-label"><Check size={14} /> Profile Picture</span>
                  ) : (
                    <span>Make it as profile picture</span>
                  )}
                </button>
              </div>

              <button
                className="photo-corner-btn"
                onClick={() => removePhoto(index)}
                title="Remove photo"
              >
                <X size={16} />
              </button>

              {formData.profilePhotoIndex === index && (
                <div className="main-photo-indicator">
                  <Star size={12} fill="white" />
                </div>
              )}
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        multiple
        onChange={handlePhotoSelect}
      />

      <p className="photo-tip text-center mt-4">🔒 Photos are kept private and secure</p>

      <button
        className="primary-btn full-width mt-4"
        onClick={handleNext}
        disabled={!isStepValid()}
      >
        {formData.photos.length > 0 ? "Continue" : "Upload at least 1 photo"}
      </button>
    </div>
  );

  // Step 10: Account Details (Email & Mobile with Validation)
  const renderStep10 = () => {
    const isEmailValid = !formData.email || validateEmail(formData.email);
    const isMobileValid = !formData.mobile || validateMobile(formData.mobile);
    const canSubmit = formData.email && formData.mobile && isEmailValid && isMobileValid;

    return (
      <div className="step-content animate-slide-in">
        <h2 className="step-title">Last step! Contact details</h2>
        <p className="step-subtitle">Verify your account to start matching.</p>

        <div className="form-group">
          <label className="input-label">Email ID</label>
          <input
            type="email"
            className={`text-input ${!isEmailValid ? 'input-error' : ''}`}
            placeholder="Enter Email Address"
            value={formData.email}
            onChange={(e) => updateForm('email', e.target.value)}
          />
          {!isEmailValid && <span className="error-text">Please enter a valid email address</span>}
        </div>
        <div className="form-group">
          <label className="input-label">Mobile Number</label>
          <div className="phone-input-group">
            <span className="country-code">+91</span>
            <input
              type="tel"
              className={`text-input ${!isMobileValid ? 'input-error' : ''}`}
              placeholder="Enter Mobile Number"
              value={formData.mobile}
              onChange={(e) => updateForm('mobile', e.target.value)}
              maxLength={10}
            />
          </div>
          {!isMobileValid && <span className="error-text">Please enter a valid 10-digit mobile number</span>}
        </div>

        <div className="form-group">
          <label className="input-label">Create Password</label>
          <input
            type="password"
            className="text-input"
            placeholder="Min. 6 characters"
            value={formData.password}
            onChange={(e) => updateForm('password', e.target.value)}
          />
        </div>

        <div className="security-badge">
          <ShieldCheck size={16} className="text-green" />
          <span>100% Privacy Guaranteed</span>
        </div>

        <button
          className="primary-btn full-width mt-4"
          onClick={handleSubmit}
          disabled={!isStepValid()}
        >
          Complete Registration
        </button>
      </div>
    );
  };

  return (
    <div className="register-page-wrapper">
      <div className="landing-bg-overlay-wrapper desktop-only">
        <div className="landing-blur-container">
          <LandingPage />
        </div>
        <div className="dark-tint-overlay"></div>
      </div>

      <main className="register-main">
        <div className="register-card">
          <button className="card-back-btn" onClick={handleBack} title="Go Back">
            <ArrowLeft size={20} />
          </button>

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

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStep6()}
          {currentStep === 7 && renderStep7()}
          {currentStep === 8 && renderStep8()}
          {currentStep === 9 && renderStep9()}
          {currentStep === 10 && renderStep10()}
        </div>
      </main>

      <style>{`
        .register-page-wrapper {
          min-height: 100vh;
          width: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          font-family: 'Cabin', sans-serif;
          background-color: transparent;
          overflow-x: hidden;
        }
        .register-header {
          display: none;
        }
        .landing-bg-overlay-wrapper {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: -1;
          overflow: hidden;
        }
        .landing-blur-container {
          width: 100%;
          height: 100%;
          filter: none;
          transform: scale(1);
          pointer-events: none;
        }
        .dark-tint-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.2);
          z-index: 1;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-reveal {
          animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
        .delay-6 { animation-delay: 0.6s; }

        .register-main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; z-index: 10; }
        .register-card {
          background: #fff;
          width: 100%;
          max-width: 480px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          overflow: visible;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .card-back-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          background: #f7fafc;
          border: none;
          color: #4a5568;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 20;
        }
        .card-back-btn:hover {
          background: #edf2f7;
          color: #D9475C;
        }
        .step-icon-container {
          display: flex;
          justify-content: center;
          margin-top: -20px;
          margin-bottom: 20px;
        }
        .step-icon-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(217, 71, 92, 0.1);
        }
        .progress-container { padding: 20px 25px 0; display: flex; flex-direction: column; gap: 8px; }
        .progress-bar-bg { width: 100%; height: 6px; background: #edf2f7; border-radius: 3px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: #D9475C; border-radius: 3px; transition: width 0.3s ease; }
        .progress-text { font-size: 11px; color: #718096; font-weight: 600; text-transform: uppercase; align-self: flex-end; }
        .step-content { padding: 20px 25px 30px; flex: 1; display: flex; flex-direction: column; }
        .step-title { font-size: 22px; font-weight: 700; color: #1a202c; margin: 0 0 12px; line-height: 1.3; }
        .step-subtitle { font-size: 14px; color: #718096; margin: 0 0 25px; }
        .form-group { margin-bottom: 15px; display: flex; flex-direction: column; }
        .input-label { font-size: 13px; font-weight: 600; color: #4a5568; margin-bottom: 8px; }
        
        .select-input {
          width: 100%; padding: 14px 40px 14px 16px; border: 1px solid #cbd5e0; border-radius: 10px;
          font-size: 15px; color: #2d3748; background: #fff; outline: none; box-sizing: border-box;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 15px center;
          background-size: 16px;
        }
        
        .text-input {
          width: 100%; padding: 14px 16px; border: 1px solid #cbd5e0; border-radius: 10px;
          font-size: 15px; color: #2d3748; background: #fff; outline: none; box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .text-input:focus, .select-input:focus { border-color: #D9475C; }
        .input-error { border-color: #e53e3e !important; }
        .error-text { color: #e53e3e; font-size: 11px; margin-top: 4px; font-weight: 500; }

        .phone-input-group { display: flex; gap: 10px; }
        .country-code { padding: 14px 16px; border: 1px solid #cbd5e0; border-radius: 10px; background: #f7fafc; color: #4a5568; display: flex; align-items: center; }
        .dob-grid { display: grid; grid-template-columns: 1fr 1fr 1.5fr; gap: 10px; }
        .chip-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
        .chip-btn {
          padding: 10px 18px; background: #fff; border: 1px solid #cbd5e0; border-radius: 30px;
          font-size: 14px; font-weight: 500; color: #4a5568; cursor: pointer; transition: all 0.2s;
        }
        .chip-btn.selected { background: rgba(217, 71, 92, 0.1); border-color: #D9475C; color: #D9475C; font-weight: 600; }
        .gender-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .gender-btn { padding: 14px; text-align: center; }

        /* Multi-photo styling Round 3 */
        .photo-container-centered {
          display: flex;
          justify-content: center;
          margin: 20px 0;
        }
        .multi-photo-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 15px;
          width: 100%;
        }
        .photo-item-card {
          position: relative;
          width: 130px;
          height: 130px;
          border-radius: 12px;
          overflow: hidden;
          background: #f7fafc;
          border: 1px solid #edf2f7;
        }
        .photo-item-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .photo-actions-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 10;
          cursor: pointer;
        }
        .photo-item-card:hover .photo-actions-overlay {
          opacity: 1;
        }
        .photo-action-text-btn {
          background: none;
          border: none;
          color: white;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          height: 100%;
          padding: 10px;
          text-align: center;
          line-height: 1.4;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .active-label {
          color: #fff;
          display: flex;
          align-items: center;
          gap: 4px;
          justify-content: center;
          background: rgba(217, 71, 92, 0.8);
          padding: 4px 8px;
          border-radius: 4px;
        }
        .photo-corner-btn {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(0,0,0,0.6);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 20;
          transition: background 0.2s;
        }
        .photo-corner-btn:hover {
          background: #e53e3e;
        }
        .main-photo-indicator {
          position: absolute;
          bottom: 5px;
          right: 5px;
          width: 20px;
          height: 20px;
          background: #D9475C;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .photo-add-card {
          width: 130px;
          height: 130px;
          border: 2px dashed #cbd5e0;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #a0aec0;
          gap: 8px;
          font-size: 12px;
          transition: all 0.2s;
        }
        .photo-add-card:hover {
          border-color: #D9475C;
          color: #D9475C;
          background: #fff5f7;
        }

        .security-badge { display: flex; align-items: center; gap: 8px; padding: 10px; background: #f0fff4; border-radius: 8px; }
        .security-badge span { font-size: 12px; color: #2f855a; }
        .primary-btn {
          background: #D9475C; color: white; border: none; padding: 16px; border-radius: 30px;
          font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .primary-btn:disabled {
          background: #e2e8f0 !important;
          color: #a0aec0 !important;
          cursor: not-allowed;
          box-shadow: none !important;
          transform: none !important;
        }
        .input-error {
          border-color: #D63447 !important;
          background-color: #fff5f5 !important;
        }
        .error-text {
          color: #D63447;
          font-size: 11px;
          margin-top: 4px;
          display: block;
          font-weight: 500;
        }
        .full-width { width: 100%; }
        .mt-4 { margin-top: 25px; }
        .mt-6 { margin-top: 30px; }
        .mt-10 { margin-top: 50px; }
        .text-center { text-align: center; }

        .trust-info-box {
          background: #fff9f0;
          border: 1px solid #fee2e2;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          gap: 12px;
          margin-top: 30px;
        }
        .info-icon-box {
          flex-shrink: 0;
        }
        .info-icon {
          color: #f6ad55;
        }
        .info-text {
          font-size: 13px;
          line-height: 1.5;
          color: #4a5568;
        }

        .reg-logo { height: 24px; filter: none; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-reveal {
          animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slide-in { animation: slideIn 0.3s ease forwards; }

        @media (max-width: 768px) {
          .desktop-only { display: none; }
          .register-page-wrapper { background: #fff !important; }
          .register-main { justify-content: flex-start; padding: 0; }
          .register-card { 
            box-shadow: none; 
            border-radius: 0; 
            background: #fff; 
            min-height: 100vh;
            padding: 20px;
          }
          .card-back-btn {
            top: 20px;
            left: 20px;
            background: none;
            color: #333;
          }
          .step-icon-container { margin-top: 40px; }
        }
      `}</style>
    </div>
  );
}
