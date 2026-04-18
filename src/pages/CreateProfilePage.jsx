import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { profileService } from '../services/profileService';
import { useAuth } from '../hooks/useAuth';

const STEPS = ['Basic Info', 'Background', 'About You', 'Partner Preferences'];

const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi', 'Other'];
const EDUCATIONS = ['High School', 'Diploma', "Bachelor's", "Master's", 'MBA', 'PhD', 'Other'];
const PROFESSIONS = ['IT / Software', 'Doctor', 'Engineer', 'Teacher', 'Business', 'Lawyer', 'Government', 'Other'];
const MARITAL_STATUSES = ['never_married', 'divorced', 'widowed', 'awaiting_divorce'];

export default function CreateProfilePage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({});

  const { register, handleSubmit, formState: { errors }, getValues } = useForm();

  const mergeAndNext = () => {
    const vals = getValues();
    setProfileData((prev) => ({ ...prev, ...vals }));
    setStep((s) => s + 1);
  };

  const handleFinalSubmit = async () => {
    const vals = getValues();
    const finalData = { ...profileData, ...vals };
    setSaving(true);
    try {
      // Create profile
      await profileService.createProfile(user.id, {
        name:           finalData.name,
        gender:         finalData.gender,
        dob:            finalData.dob,
        height:         finalData.height ? parseInt(finalData.height) : null,
        religion:       finalData.religion,
        caste:          finalData.caste,
        education:      finalData.education,
        profession:     finalData.profession,
        salary:         finalData.salary,
        city:           finalData.city,
        state:          finalData.state,
        country:        finalData.country || 'India',
        bio:            finalData.bio,
        marital_status: finalData.marital_status,
      });

      // Save preferences
      await profileService.savePreferences(user.id, {
        preferred_age_min:    parseInt(finalData.pref_age_min) || 18,
        preferred_age_max:    parseInt(finalData.pref_age_max) || 40,
        preferred_religion:   finalData.pref_religion,
        preferred_caste:      finalData.pref_caste,
        preferred_city:       finalData.pref_city,
      });

      await refreshProfile();
      toast.success('Profile created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to create profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-profile-page">
      <div className="create-profile-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-icon">💍</span>
          <span className="auth-logo-text">ManglaSutra</span>
        </div>

        {/* Progress */}
        <div className="step-progress">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}
              title={label}
            />
          ))}
        </div>
        <p className="step-label">{STEPS[step]}</p>

        <form className="profile-form" noValidate>

          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="form-step">
              <Input id="name" label="Full Name" placeholder="Your name" {...register('name', { required: 'Name is required' })} error={errors.name?.message} />
              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">Gender</label>
                  <select className="filter-select" {...register('gender', { required: true })}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="input-label">Date of Birth</label>
                  <input className="input-field" type="date" max={new Date(Date.now() - 18*365*24*60*60*1000).toISOString().split('T')[0]} {...register('dob', { required: true })} />
                </div>
              </div>
              <div className="form-row">
                <Input id="city" label="City" placeholder="Mumbai" {...register('city')} containerClass="flex-1" />
                <Input id="state" label="State" placeholder="Maharashtra" {...register('state')} containerClass="flex-1" />
              </div>
              <Button type="button" fullWidth onClick={mergeAndNext}>Continue →</Button>
            </div>
          )}

          {/* Step 1: Background */}
          {step === 1 && (
            <div className="form-step">
              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="input-label">Religion</label>
                  <select className="filter-select" {...register('religion')}>
                    <option value="">Select Religion</option>
                    {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <Input id="caste" label="Caste / Community" placeholder="Optional" {...register('caste')} containerClass="flex-1" />
              </div>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="input-label">Education</label>
                  <select className="filter-select" {...register('education')}>
                    <option value="">Select</option>
                    {EDUCATIONS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label className="input-label">Profession</label>
                  <select className="filter-select" {...register('profession')}>
                    <option value="">Select</option>
                    {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <Input id="height" label="Height (cm)" type="number" placeholder="165" {...register('height')} containerClass="flex-1" />
                <Input id="salary" label="Annual Income" placeholder="e.g. 8-12 LPA" {...register('salary')} containerClass="flex-1" />
              </div>
              <div className="form-group">
                <label className="input-label">Marital Status</label>
                <select className="filter-select" {...register('marital_status')}>
                  <option value="">Select</option>
                  {MARITAL_STATUSES.map((m) => (
                    <option key={m} value={m}>{m.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div className="form-nav">
                <Button type="button" variant="ghost" onClick={() => setStep(0)}>← Back</Button>
                <Button type="button" onClick={mergeAndNext}>Continue →</Button>
              </div>
            </div>
          )}

          {/* Step 2: About */}
          {step === 2 && (
            <div className="form-step">
              <div className="form-group">
                <label className="input-label" htmlFor="bio">About Yourself</label>
                <textarea
                  id="bio"
                  className="input-field textarea"
                  placeholder="Tell potential partners about yourself, your interests, family, and what you're looking for..."
                  rows={5}
                  {...register('bio')}
                />
              </div>
              <div className="form-nav">
                <Button type="button" variant="ghost" onClick={() => setStep(1)}>← Back</Button>
                <Button type="button" onClick={mergeAndNext}>Continue →</Button>
              </div>
            </div>
          )}

          {/* Step 3: Partner Preferences */}
          {step === 3 && (
            <div className="form-step">
              <p className="form-section-hint">Help us find the right matches for you</p>
              <div className="form-row">
                <Input id="pref_age_min" label="Min Age" type="number" defaultValue={22} {...register('pref_age_min')} containerClass="flex-1" />
                <Input id="pref_age_max" label="Max Age" type="number" defaultValue={35} {...register('pref_age_max')} containerClass="flex-1" />
              </div>
              <div className="form-group">
                <label className="input-label">Preferred Religion</label>
                <select className="filter-select" {...register('pref_religion')}>
                  <option value="">Any</option>
                  {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <Input id="pref_caste" label="Preferred Caste" placeholder="Any" {...register('pref_caste')} />
              <Input id="pref_city" label="Preferred City" placeholder="Any city" {...register('pref_city')} />
              <div className="form-nav">
                <Button type="button" variant="ghost" onClick={() => setStep(2)}>← Back</Button>
                <Button type="button" loading={saving} onClick={handleFinalSubmit}>
                  Create My Profile 🎉
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
