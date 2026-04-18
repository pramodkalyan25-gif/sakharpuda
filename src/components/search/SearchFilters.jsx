import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi', 'Jewish', 'Other'];
const EDUCATION_LEVELS = ['High School', 'Diploma', 'Bachelor\'s', 'Master\'s', 'MBA', 'PhD', 'Other'];
const MARITAL_STATUSES = [
  { value: '', label: 'Any' },
  { value: 'never_married', label: 'Never Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'awaiting_divorce', label: 'Awaiting Divorce' },
];

/**
 * SearchFilters — Collapsible filter panel for profile search.
 */
export default function SearchFilters({ filters, onChange, onSearch, loading }) {
  const [expanded, setExpanded] = useState(true);

  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  const reset = () => onChange({
    age_min: '', age_max: '', gender: '',
    religion: '', caste: '', education: '', city: '', marital_status: '',
  });

  return (
    <aside className="search-filters" aria-label="Search filters">
      <div className="filter-header">
        <h3 className="filter-title">🔍 Filter Profiles</h3>
        <button
          className="filter-toggle"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {expanded && (
        <div className="filter-body">
          {/* Gender */}
          <div className="filter-group">
            <label className="filter-label">Looking For</label>
            <select
              id="filter-gender"
              className="filter-select"
              value={filters.gender || ''}
              onChange={set('gender')}
            >
              <option value="">Any</option>
              <option value="female">Bride</option>
              <option value="male">Groom</option>
            </select>
          </div>

          {/* Age Range */}
          <div className="filter-group">
            <label className="filter-label">Age Range</label>
            <div className="filter-row">
              <Input
                id="age-min"
                type="number"
                placeholder="Min"
                min={18}
                max={70}
                value={filters.age_min || ''}
                onChange={set('age_min')}
                containerClass="filter-input-half"
              />
              <span className="filter-sep">–</span>
              <Input
                id="age-max"
                type="number"
                placeholder="Max"
                min={18}
                max={70}
                value={filters.age_max || ''}
                onChange={set('age_max')}
                containerClass="filter-input-half"
              />
            </div>
          </div>

          {/* Religion */}
          <div className="filter-group">
            <label className="filter-label">Religion</label>
            <select
              id="filter-religion"
              className="filter-select"
              value={filters.religion || ''}
              onChange={set('religion')}
            >
              <option value="">Any</option>
              {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Caste */}
          <div className="filter-group">
            <Input
              id="filter-caste"
              label="Caste"
              placeholder="e.g. Brahmin"
              value={filters.caste || ''}
              onChange={set('caste')}
            />
          </div>

          {/* Education */}
          <div className="filter-group">
            <label className="filter-label">Education</label>
            <select
              id="filter-education"
              className="filter-select"
              value={filters.education || ''}
              onChange={set('education')}
            >
              <option value="">Any</option>
              {EDUCATION_LEVELS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          {/* City */}
          <div className="filter-group">
            <Input
              id="filter-city"
              label="City"
              placeholder="e.g. Mumbai"
              value={filters.city || ''}
              onChange={set('city')}
            />
          </div>

          {/* Marital Status */}
          <div className="filter-group">
            <label className="filter-label">Marital Status</label>
            <select
              id="filter-marital"
              className="filter-select"
              value={filters.marital_status || ''}
              onChange={set('marital_status')}
            >
              {MARITAL_STATUSES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <Button onClick={onSearch} loading={loading} fullWidth>
              Search
            </Button>
            <Button variant="ghost" onClick={reset} fullWidth>
              Reset
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
