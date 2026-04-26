import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, ChevronRight, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 10;

  const [formData, setFormData] = useState({
    religion: '',
    caste: '',
    profileFor: '',
    gender: '',
    firstName: '',
    lastName: '',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
    email: '',
    mobile: '',
    city: '',
    liveWithFamily: '',
    subCommunity: '',
    maritalStatus: '',
    height: '',
    diet: '',
    highestQualification: '',
    college: '',
    workWith: '',
    workAs: '',
    income: ''
  });

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(prev => prev + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
    else navigate('/');
  };

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log("Submitting Profile:", formData);
    // In a real app, API call goes here
    alert("Profile Created Successfully!");
    navigate('/');
  };

  // --- Step Content Renders ---
  const renderStep1 = () => (
    <div className="step-content animate-slide-in">
      <h2 className="step-title">Let's start with your background</h2>
      <p className="step-subtitle">This helps us find the best matches in your community.</p>
      
      <div className="form-group">
        <label className="input-label">Religion</label>
        <select 
          className="select-input"
          value={formData.religion}
          onChange={(e) => updateForm('religion', e.target.value)}
        >
          <option value="">Select Religion</option>
          <option value="Hindu">Hindu</option>
          <option value="Muslim">Muslim</option>
          <option value="Christian">Christian</option>
          <option value="Sikh">Sikh</option>
          <option value="Jain">Jain</option>
          <option value="Buddhist">Buddhist</option>
        </select>
      </div>

      <div className="form-group">
        <label className="input-label">Caste</label>
        <select 
          className="select-input"
          value={formData.caste}
          onChange={(e) => updateForm('caste', e.target.value)}
        >
          <option value="">Select Caste</option>
          <option value="Maratha">Maratha</option>
          <option value="Brahmin">Brahmin</option>
          <option value="Kunbi">Kunbi</option>
          <option value="Teli">Teli</option>
          <option value="Mali">Mali</option>
        </select>
      </div>
      
      <button 
        className="primary-btn full-width mt-4" 
        onClick={handleNext}
        disabled={!formData.religion || !formData.caste}
      >
        Continue
      </button>
    </div>
  );

  const renderStep2 = () => {
    const options = ["Myself", "My Son", "My Daughter", "My Brother", "My Sister", "My Friend", "My Relative"];
    return (
      <div className="step-content animate-slide-in">
        <h2 className="step-title">Who are you creating this profile for?</h2>
        <div className="chip-grid">
          {options.map(opt => (
            <button
              key={opt}
              className={`chip-btn ${formData.profileFor === opt ? 'selected' : ''}`}
              onClick={() => {
                updateForm('profileFor', opt);
                // Auto advance on chip click for speed
                setTimeout(handleNext, 300);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    const options = ["Male", "Female"];
    return (
      <div className="step-content animate-slide-in">
        <h2 className="step-title">What is your gender?</h2>
        <div className="chip-grid gender-grid">
          {options.map(opt => (
            <button
              key={opt}
              className={`chip-btn gender-btn ${formData.gender === opt ? 'selected' : ''}`}
              onClick={() => {
                updateForm('gender', opt);
                setTimeout(handleNext, 300);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
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
      <div className="form-group">
        <label className="input-label">Last Name</label>
        <input 
          type="text" 
          className="text-input" 
          placeholder="Enter Last Name"
          value={formData.lastName}
          onChange={(e) => updateForm('lastName', e.target.value)}
        />
      </div>
      <button 
        className="primary-btn full-width mt-4" 
        onClick={handleNext}
        disabled={!formData.firstName || !formData.lastName}
      >
        Continue
      </button>
    </div>
  );

  const renderStep5 = () => (
    <div className="step-content animate-slide-in">
      <h2 className="step-title">What is your Date of Birth?</h2>
      <div className="dob-grid">
        <input 
          type="number" 
          className="text-input text-center" 
          placeholder="DD" 
          min="1" max="31"
          value={formData.dobDay}
          onChange={(e) => updateForm('dobDay', e.target.value)}
        />
        <input 
          type="number" 
          className="text-input text-center" 
          placeholder="MM" 
          min="1" max="12"
          value={formData.dobMonth}
          onChange={(e) => updateForm('dobMonth', e.target.value)}
        />
        <input 
          type="number" 
          className="text-input text-center" 
          placeholder="YYYY" 
          min="1950" max="2005"
          value={formData.dobYear}
          onChange={(e) => updateForm('dobYear', e.target.value)}
        />
      </div>
      <button 
        className="primary-btn full-width mt-4" 
        onClick={handleNext}
        disabled={!formData.dobDay || !formData.dobMonth || !formData.dobYear}
      >
        Continue
      </button>
    </div>
  );

  const renderStep6 = () => (
    <div className="step-content animate-slide-in">
      <h2 className="step-title">Account Details</h2>
      <p className="step-subtitle">Your contact details are safe with us.</p>
      
      <div className="form-group">
        <label className="input-label">Email ID</label>
        <input 
          type="email" 
          className="text-input" 
          placeholder="Enter Email Address"
          value={formData.email}
          onChange={(e) => updateForm('email', e.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="input-label">Mobile Number</label>
        <div className="phone-input-group">
          <span className="country-code">+91</span>
          <input 
            type="tel" 
            className="text-input" 
            placeholder="Enter Mobile Number"
            value={formData.mobile}
            onChange={(e) => updateForm('mobile', e.target.value)}
          />
        </div>
      </div>
      
      <div className="security-badge">
        <ShieldCheck size={16} className="text-green" />
        <span>100% Privacy Guaranteed</span>
      </div>

      <button 
        className="primary-btn full-width mt-4" 
        onClick={handleNext}
        disabled={!formData.email || !formData.mobile}
      >
        Continue
      </button>
    </div>
  );

  const renderStep7 = () => (
    <div className="step-content animate-slide-in">
      <h2 className="step-title">Where do you live?</h2>
      
      <div className="form-group">
        <label className="input-label">City</label>
        <input 
          type="text" 
          className="text-input" 
          placeholder="e.g. Pune, Mumbai"
          value={formData.city}
          onChange={(e) => updateForm('city', e.target.value)}
        />
      </div>

      <div className="form-group mt-3">
        <label className="input-label mb-2">Do you live with your family?</label>
        <div className="chip-grid dual-grid">
          {["Yes", "No"].map(opt => (
            <button
              key={opt}
              className={`chip-btn ${formData.liveWithFamily === opt ? 'selected' : ''}`}
              onClick={() => updateForm('liveWithFamily', opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group mt-3">
        <label className="input-label">Sub-community</label>
        <select 
          className="select-input"
          value={formData.subCommunity}
          onChange={(e) => updateForm('subCommunity', e.target.value)}
        >
          <option value="">Select Sub-community</option>
          <option value="96 Kuli">96 Kuli</option>
          <option value="Deshmukh">Deshmukh</option>
          <option value="Patil">Patil</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <button 
        className="primary-btn full-width mt-4" 
        onClick={handleNext}
        disabled={!formData.city || !formData.liveWithFamily}
      >
        Continue
      </button>
    </div>
  );

  const renderStep8 = () => {
    const diets = ["Veg", "Non-Veg", "Occasionally Non-Veg", "Eggetarian", "Jain", "Vegan"];
    return (
      <div className="step-content animate-slide-in">
        <h2 className="step-title">Personal Traits</h2>
        
        <div className="form-group">
          <label className="input-label">Marital Status</label>
          <select 
            className="select-input"
            value={formData.maritalStatus}
            onChange={(e) => updateForm('maritalStatus', e.target.value)}
          >
            <option value="">Select Marital Status</option>
            <option value="Never Married">Never Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
            <option value="Awaiting Divorce">Awaiting Divorce</option>
          </select>
        </div>

        <div className="form-group">
          <label className="input-label">Height</label>
          <select 
            className="select-input"
            value={formData.height}
            onChange={(e) => updateForm('height', e.target.value)}
          >
            <option value="">Select Height</option>
            <option value="5'0&quot;">5'0"</option>
            <option value="5'2&quot;">5'2"</option>
            <option value="5'4&quot;">5'4"</option>
            <option value="5'6&quot;">5'6"</option>
            <option value="5'8&quot;">5'8"</option>
            <option value="5'10&quot;">5'10"</option>
            <option value="6'0&quot;">6'0"</option>
          </select>
        </div>

        <div className="form-group mt-3">
          <label className="input-label mb-2">Diet</label>
          <div className="chip-grid">
            {diets.map(opt => (
              <button
                key={opt}
                className={`chip-btn ${formData.diet === opt ? 'selected' : ''}`}
                onClick={() => updateForm('diet', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <button 
          className="primary-btn full-width mt-4" 
          onClick={handleNext}
          disabled={!formData.maritalStatus || !formData.height || !formData.diet}
        >
          Continue
        </button>
      </div>
    );
  };

  const renderStep9 = () => (
    <div className="step-content animate-slide-in">
      <h2 className="step-title">Education</h2>
      
      <div className="form-group">
        <label className="input-label">Highest Qualification</label>
        <select 
          className="select-input"
          value={formData.highestQualification}
          onChange={(e) => updateForm('highestQualification', e.target.value)}
        >
          <option value="">Select Qualification</option>
          <option value="B.E / B.Tech">B.E / B.Tech</option>
          <option value="M.E / M.Tech">M.E / M.Tech</option>
          <option value="B.Sc">B.Sc</option>
          <option value="M.Sc">M.Sc</option>
          <option value="MBA">MBA</option>
          <option value="MBBS">MBBS</option>
          <option value="B.Com">B.Com</option>
          <option value="M.Com">M.Com</option>
        </select>
      </div>

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
        disabled={!formData.highestQualification}
      >
        Continue
      </button>
    </div>
  );

  const renderStep10 = () => (
    <div className="step-content animate-slide-in">
      <h2 className="step-title">Work & Income</h2>
      
      <div className="form-group">
        <label className="input-label">You work with</label>
        <select 
          className="select-input"
          value={formData.workWith}
          onChange={(e) => updateForm('workWith', e.target.value)}
        >
          <option value="">Select Sector</option>
          <option value="Private Company">Private Company</option>
          <option value="Government / PSU">Government / PSU</option>
          <option value="Defense">Defense</option>
          <option value="Business / Self Employed">Business / Self Employed</option>
          <option value="Not Working">Not Working</option>
        </select>
      </div>

      <div className="form-group">
        <label className="input-label">You work as</label>
        <select 
          className="select-input"
          value={formData.workAs}
          onChange={(e) => updateForm('workAs', e.target.value)}
        >
          <option value="">Select Profession</option>
          <option value="Software Engineer">Software Engineer</option>
          <option value="Manager">Manager</option>
          <option value="Doctor">Doctor</option>
          <option value="Teacher">Teacher</option>
          <option value="Engineer (Non-IT)">Engineer (Non-IT)</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label className="input-label">Annual Income</label>
        <select 
          className="select-input"
          value={formData.income}
          onChange={(e) => updateForm('income', e.target.value)}
        >
          <option value="">Select Income Range</option>
          <option value="Upto 3 Lakhs">Upto 3 Lakhs</option>
          <option value="3 - 5 Lakhs">3 - 5 Lakhs</option>
          <option value="5 - 10 Lakhs">5 - 10 Lakhs</option>
          <option value="10 - 20 Lakhs">10 - 20 Lakhs</option>
          <option value="20 - 30 Lakhs">20 - 30 Lakhs</option>
          <option value="30 Lakhs+">30 Lakhs+</option>
        </select>
      </div>

      <button 
        className="primary-btn full-width mt-4" 
        onClick={handleSubmit}
        disabled={!formData.workWith || !formData.workAs || !formData.income}
      >
        Create Profile
      </button>
    </div>
  );

  return (
    <div className="registration-container">
      {/* Background Image Container */}
      <div className="reg-bg-image" style={{ backgroundImage: "url('/images/hero-bg-final.png')" }}></div>
      <div className="reg-bg-overlay"></div>

      {/* Header */}
      <header className="reg-header">
        <button className="back-btn" onClick={handleBack}>
          <ArrowLeft size={24} />
        </button>
        <img src="/images/logo.png" alt="SakharPuda" className="reg-logo" />
        <div style={{ width: 24 }}></div> {/* Spacer for flex centering */}
      </header>

      {/* Main Content Modal */}
      <main className="reg-main">
        <div className="reg-card">
          
          {/* Progress Indicator */}
          <div className="progress-container">
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
            <span className="progress-text">Step {currentStep} of {totalSteps}</span>
          </div>

          {/* Dynamic Step Rendering */}
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
        .registration-container {
          min-height: 100vh;
          width: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }

        /* Background */
        .reg-bg-image {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-size: cover;
          background-position: center;
          z-index: -2;
        }
        .reg-bg-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: -1;
        }

        /* Header */
        .reg-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 20px;
          position: relative;
          z-index: 10;
        }
        .back-btn {
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          padding: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .reg-logo {
          height: 28px;
          object-fit: contain;
          filter: brightness(0) invert(1); /* Make logo white for dark bg */
        }

        /* Main Area */
        .reg-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 10;
        }

        /* The White Modal Card */
        .reg-card {
          background: #fff;
          width: 100%;
          max-width: 480px; /* Tablet/Desktop sizing */
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Progress Bar */
        .progress-container {
          padding: 20px 25px 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .progress-bar-bg {
          width: 100%;
          height: 6px;
          background: #edf2f7;
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: #D9475C;
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        .progress-text {
          font-size: 11px;
          color: #718096;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          align-self: flex-end;
        }

        /* Step Content Area */
        .step-content {
          padding: 20px 25px 30px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        /* Typography */
        .step-title {
          font-size: 24px;
          font-weight: 700;
          color: #1a202c;
          margin: 0 0 8px;
          line-height: 1.3;
        }
        .step-subtitle {
          font-size: 14px;
          color: #718096;
          margin: 0 0 25px;
        }

        /* Form Controls */
        .form-group {
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
        }
        .input-label {
          font-size: 13px;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 8px;
        }
        .text-input, .select-input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid #cbd5e0;
          border-radius: 10px;
          font-size: 15px;
          color: #2d3748;
          background: #fff;
          transition: border-color 0.2s;
          outline: none;
          box-sizing: border-box;
        }
        .text-input:focus, .select-input:focus {
          border-color: #D9475C;
        }

        /* Phone Input specific */
        .phone-input-group {
          display: flex;
          gap: 10px;
        }
        .country-code {
          padding: 14px 16px;
          border: 1px solid #cbd5e0;
          border-radius: 10px;
          background: #f7fafc;
          color: #4a5568;
          font-weight: 500;
        }

        /* DOB Grid */
        .dob-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
        }

        /* Chips Grid */
        .chip-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 10px;
        }
        .chip-grid.dual-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .chip-btn {
          padding: 12px 20px;
          background: #fff;
          border: 1px solid #cbd5e0;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 500;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .chip-btn:hover {
          border-color: #a0aec0;
          background: #f7fafc;
        }
        .chip-btn.selected {
          background: rgba(217, 71, 92, 0.1);
          border-color: #D9475C;
          color: #D9475C;
          font-weight: 600;
        }

        /* Gender Specific Chips */
        .gender-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .gender-btn { padding: 16px; text-align: center; }

        /* Security Badge */
        .security-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
          padding: 10px;
          background: #f0fff4;
          border-radius: 8px;
        }
        .security-badge span {
          font-size: 12px;
          color: #2f855a;
          font-weight: 500;
        }
        .text-green { color: #38a169; }

        /* Primary Button */
        .primary-btn {
          background: #D9475C;
          color: white;
          border: none;
          padding: 16px;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .primary-btn:hover { background: #c03a4f; }
        .primary-btn:active { transform: scale(0.98); }
        .primary-btn:disabled {
          background: #e2e8f0;
          color: #a0aec0;
          cursor: not-allowed;
          transform: none;
        }
        .full-width { width: 100%; box-sizing: border-box; }
        .mt-3 { margin-top: 15px; }
        .mt-4 { margin-top: 25px; }
        .mb-2 { margin-bottom: 8px; }
        .text-center { text-align: center; }

        /* Animations */
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease forwards;
        }

        /* --- MOBILE RESPONSIVE --- */
        @media (max-width: 480px) {
          .reg-main {
            padding: 0;
            align-items: flex-end; /* Snap to bottom on mobile */
          }
          .reg-card {
            border-radius: 20px 20px 0 0; /* Only round top corners */
            max-height: 90vh; /* Don't cover entire screen, show hero above */
            overflow-y: auto;
          }
          .step-content {
            padding: 25px 20px 40px;
          }
          .reg-header {
            padding: 10px 15px;
          }
        }
      `}</style>
    </div>
  );
}
