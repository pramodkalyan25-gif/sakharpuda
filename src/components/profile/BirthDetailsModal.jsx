import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Sparkles, X as CloseIcon } from 'lucide-react';

export default function BirthDetailsModal({ profile, onSave, onClose }) {
  const [timeOfBirth, setTimeOfBirth] = useState(profile?.time_of_birth || '');
  const [placeOfBirth, setPlaceOfBirth] = useState(profile?.place_of_birth || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!timeOfBirth || !placeOfBirth) {
      toast.error('Please fill both Time and Place of Birth');
      return;
    }
    setSaving(true);
    try {
      await onSave({ time_of_birth: timeOfBirth, place_of_birth: placeOfBirth });
      toast.success('Birth details saved!');
    } catch (err) {
      toast.error('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bd-overlay" onClick={onClose}>
      <div className="bd-modal" onClick={e => e.stopPropagation()}>
        <button className="bd-close" onClick={onClose}><CloseIcon size={20} /></button>
        <div className="bd-header">
          <Sparkles size={28} color="#7c3aed" />
          <h3>🪐 Birth Details for Kundali</h3>
          <p>Provide your birth time & place for an accurate Janma Kundali with Lagna (Ascendant) and all 9 planet positions.</p>
        </div>
        <div className="bd-form">
          <div className="bd-field">
            <label>Time of Birth (जन्म वेळ)</label>
            <input
              type="time"
              value={timeOfBirth}
              onChange={e => setTimeOfBirth(e.target.value)}
              placeholder="HH:MM"
            />
            <span className="bd-hint">24-hour format, e.g. 14:30</span>
          </div>
          <div className="bd-field">
            <label>Place of Birth (जन्म स्थान)</label>
            <input
              type="text"
              value={placeOfBirth}
              onChange={e => setPlaceOfBirth(e.target.value)}
              placeholder="e.g. Pune, Nashik, Nagpur..."
            />
            <span className="bd-hint">City/village name in Maharashtra</span>
          </div>
          <button className="bd-save-btn" onClick={handleSave} disabled={saving || !timeOfBirth || !placeOfBirth}>
            {saving ? 'Saving...' : '✨ Save & Generate Patrika'}
          </button>
        </div>
      </div>
    </div>
  );
}
