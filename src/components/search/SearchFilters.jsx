import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { 
  MAHARASHTRA_DISTRICTS, 
  MAHARASHTRA_CASTES, 
  CATEGORIZED_PROFESSIONS, 
  COMPREHENSIVE_EDUCATION, 
  HEIGHTS_CM 
} from '../../data/maharashtraData';

const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi', 'Other'];
const MARITAL_STATUSES = [
  { value: 'never_married', label: 'Single / Never Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'awaiting_divorce', label: 'Awaiting Divorce' },
  { value: '', label: 'Any Status' },
];

export default function SearchFilters({ filters, onChange, onSearch, loading }) {
  const [expanded, setExpanded] = useState(true);

  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  const reset = () => {
    const defaultFilters = {
      age_min: '', age_max: '', gender: '',
      religion: '', caste: '', education: '', city: '', 
      marital_status: 'never_married', height_min: '', profession: '', income: ''
    };
    onChange(defaultFilters);
    onSearch(defaultFilters);
  };

  return (
    <aside className="search-filters" aria-label="Search filters">
      <div className="filter-header">
        <h3 className="filter-title">🔍 Quick Filters</h3>
        <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
      </div>

      <div className="filter-body vertical-stack">
        {/* MAJOR FILTERS - HIGHLIGHTED */}
        <div className="filter-section highlighted">
          <div className="filter-group">
            <label className="filter-label">Looking For (Bride/Groom)</label>
            <select className="filter-select" value={filters.gender || ''} onChange={set('gender')}>
              <option value="">Any</option>
              <option value="female">Bride</option>
              <option value="male">Groom</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Religion</label>
            <select className="filter-select" value={filters.religion || ''} onChange={set('religion')}>
              <option value="">Any Religion</option>
              {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Caste</label>
            <select className="filter-select" value={filters.caste || ''} onChange={set('caste')}>
              <option value="">Any Caste</option>
              {MAHARASHTRA_CASTES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Location (District)</label>
            <select className="filter-select" value={filters.city || ''} onChange={set('city')}>
              <option value="">Any Location</option>
              {MAHARASHTRA_DISTRICTS.map(d => <option key={d.district} value={d.district}>{d.district}</option>)}
            </select>
          </div>
        </div>

        {/* SECONDARY FILTERS */}
        <div className="filter-section secondary">
          <h4 className="section-divider"><span>More Filters</span></h4>

          <div className="filter-group">
            <label className="filter-label">Marital Status</label>
            <select className="filter-select" value={filters.marital_status || ''} onChange={set('marital_status')}>
              {MARITAL_STATUSES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div className="filter-row-grid">
            <div className="filter-group">
              <label className="filter-label">Min Age</label>
              <input type="number" className="filter-input" placeholder="18" value={filters.age_min || ''} onChange={set('age_min')} />
            </div>
            <div className="filter-group">
              <label className="filter-label">Max Age</label>
              <input type="number" className="filter-input" placeholder="70" value={filters.age_max || ''} onChange={set('age_max')} />
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Profession</label>
            <select className="filter-select" value={filters.profession || ''} onChange={set('profession')}>
              <option value="">Any Profession</option>
              {Object.entries(CATEGORIZED_PROFESSIONS).map(([cat, items]) => (
                <optgroup key={cat} label={cat}>
                  {items.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Qualification</label>
            <select className="filter-select" value={filters.education || ''} onChange={set('education')}>
              <option value="">Any Qualification</option>
              {Object.entries(COMPREHENSIVE_EDUCATION).map(([cat, items]) => (
                <optgroup key={cat} label={cat}>
                  {items.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Income (Annual)</label>
            <select className="filter-select" value={filters.income || ''} onChange={set('income')}>
              <option value="">Any Income</option>
              {["Upto 3L", "3-5L", "5-10L", "10-20L", "20-30L", "30L+"].map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Min Height</label>
            <select className="filter-select" value={filters.height_min || ''} onChange={set('height_min')}>
              <option value="">Any Height</option>
              {HEIGHTS_CM.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
            </select>
          </div>
        </div>

        <div className="filter-actions sticky-bottom">
          <Button onClick={onSearch} loading={loading} fullWidth>
            Apply Filters
          </Button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .search-filters {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #fff;
        }
        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 20px;
        }
        .filter-title { font-size: 16px; font-weight: 800; color: #1e293b; }
        
        .filter-body.vertical-stack {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }
        
        .filter-section.highlighted {
          background: #fff5f7;
          border-radius: 12px;
          padding: 15px;
          border: 1px solid #fed7e2;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .filter-section.secondary {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .section-divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 10px 0;
        }
        .section-divider::before, .section-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #e2e8f0;
        }
        .section-divider span { padding: 0 10px; }

        .filter-group { display: flex; flex-direction: column; gap: 6px; }
        .filter-label { font-size: 12px; font-weight: 700; color: #475569; }
        .filter-select, .filter-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          color: #1e293b;
          outline: none;
          background: #fff;
          transition: border-color 0.2s;
        }
        .filter-select:focus, .filter-input:focus { border-color: #D63447; }
        
        .filter-row-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        
        .filter-actions.sticky-bottom {
          position: sticky;
          bottom: 0;
          padding: 15px 0;
          background: #fff;
          border-top: 1px solid #f1f5f9;
          margin-top: 10px;
        }
      `}} />
    </aside>
  );
}
