import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter,
  Search,
  Users,
  CheckCircle,
  Fingerprint,
  User as UserIcon,
  Lock
} from 'lucide-react';
import Sidebar from '../components/ui/Sidebar';
import SearchFilters from '../components/search/SearchFilters';
import SearchResults from '../components/search/SearchResults';
import TopNav from '../components/ui/TopNav';
import { searchService } from '../services/searchService';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import RightSidebar from '../components/ui/RightSidebar';
import Footer from '../components/ui/Footer';

export default function SearchPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [filters, setFilters] = useState({ marital_status: 'never_married' });
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState('filters'); // 'filters', 'id', 'name'
  const [casteToggle, setCasteToggle] = useState(false);
  const [idQuery, setIdQuery] = useState('');
  const [nameQuery, setNameQuery] = useState('');

  const doSearch = useCallback(async (currentPage = 0, append = false, overrideFilters = null) => {
    const isFirstPage = currentPage === 0;
    if (isFirstPage) setLoading(true);
    else setLoadingMore(true);

    try {
      const currentFilters = overrideFilters || filters;
      const result = await searchService.searchProfiles({ ...currentFilters, page: currentPage, limit: 12 }, user?.id);
      if (append) {
        setProfiles((prev) => [...prev, ...result.profiles]);
      } else {
        setProfiles(result.profiles);
      }
      setTotal(result.total);
      setHasMore(result.hasMore);
      setPage(currentPage);
      setSearched(true);
      setShowFilters(false);

      if (user?.id) {
        result.profiles.forEach((p) => {
          profileService.logProfileView(user.id, p.user_id).catch(() => { });
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, user?.id]);

  const handleSearch = (overrideFilters) => doSearch(0, false, overrideFilters?.age_min !== undefined ? overrideFilters : null);
  const handleLoadMore = () => doSearch(page + 1, true);

  return (
    <div className="js-dashboard-wrapper search-page">
      <TopNav />

      <main className="js-main-grid js-layout-container">
        {/* LEFT SIDEBAR */}
        <Sidebar profile={profile} avatarUrl={null}>
          <div className="js-community-trust-wrapper">
            <span className="js-trust-label">COMMUNITY & TRUST</span>
            <div className="js-trust-cards-stack">
              <div className="js-trust-card">
                <div className="js-trust-icon green">
                  <CheckCircle size={22} />
                </div>
                <h5>Verified profiles</h5>
                <p>We verify phone & email of every member</p>
              </div>

              <div className="js-trust-card">
                <div className="js-trust-icon purple">
                  <Users size={22} />
                </div>
                <h5>Community first</h5>
                <p>Premium matchmaking for serious match-seekers</p>
              </div>

              <div className="js-trust-card">
                <div className="js-trust-icon orange">
                  <Lock size={22} />
                </div>
                <h5>Privacy protected</h5>
                <p>Contact details hidden until you connect</p>
              </div>
            </div>
          </div>
        </Sidebar>

        {/* MIDDLE CONTENT */}
        <div className="js-content-area">
          <div className="js-search-options-wrapper">
            <div className="js-filter-bar search-options">
              <div className="js-options-left">
                <button
                  className={`js-filter-btn ${searchMode === 'filters' ? 'active main' : ''}`}
                  onClick={() => { setSearchMode('filters'); setShowFilters(!showFilters); }}
                >
                  <Filter size={14} /> <span>Filters</span>
                </button>
                <button
                  className={`js-filter-btn ${searchMode === 'id' ? 'active' : ''}`}
                  onClick={() => { setSearchMode('id'); setShowFilters(false); }}
                >
                  <Fingerprint size={14} /> <span>Search by ID</span>
                </button>
                <button
                  className={`js-filter-btn ${searchMode === 'name' ? 'active' : ''}`}
                  onClick={() => { setSearchMode('name'); setShowFilters(false); }}
                >
                  <UserIcon size={14} /> <span>Search by Name</span>
                </button>
              </div>

              <div className="js-options-right">
                <button
                  className={`js-filter-btn toggle ${casteToggle ? 'active' : ''}`}
                  onClick={() => {
                    const newVal = !casteToggle;
                    setCasteToggle(newVal);
                    if (newVal && profile?.caste) {
                      handleSearch({ ...filters, caste: profile.caste });
                    } else if (!newVal) {
                      handleSearch({ ...filters, caste: '' });
                    }
                  }}
                >
                  <Users size={14} /> <span>Search by Caste</span>
                </button>
              </div>
            </div>

            {/* Specific Search Inputs */}
            {searchMode === 'id' && (
              <div className="js-search-input-box">
                <input
                  type="text"
                  placeholder="Enter Profile ID (e.g. user_...)"
                  value={idQuery}
                  onChange={(e) => setIdQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch({ profile_id: idQuery })}
                />
                <button onClick={() => handleSearch({ profile_id: idQuery })}>Search</button>
              </div>
            )}

            {searchMode === 'name' && (
              <div className="js-search-input-box">
                <input
                  type="text"
                  placeholder="Enter Name..."
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch({ name: nameQuery })}
                />
                <button onClick={() => handleSearch({ name: nameQuery })}>Search</button>
              </div>
            )}
          </div>

          {showFilters && (
            <div className="js-filter-overlay">
              <div className="js-filter-card-full">
                <SearchFilters
                  filters={filters}
                  onChange={setFilters}
                  onSearch={handleSearch}
                  loading={loading}
                />
              </div>
            </div>
          )}

          {!searched ? (
            <div className="js-search-welcome js-dashboard-section">
              <div className="js-welcome-icon"><Search size={48} /></div>
              <h2>Search Profiles</h2>
              <p>Adjust the filters above to discover people who match your lifestyle and values.</p>
              <button className="js-search-start-btn" onClick={() => handleSearch(filters)}>
                Start Searching
              </button>
            </div>
          ) : (
            <div className="js-search-results">
              <div className="js-results-summary">
                <span>Found <strong>{total}</strong> potential matches</span>
              </div>
              <SearchResults
                profiles={profiles}
                loading={loading}
                total={total}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                loadingMore={loadingMore}
              />
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <RightSidebar profile={profile} />
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .js-search-options-wrapper { display: flex; flex-direction: column; gap: 10px; }
        
        .js-filter-bar.search-options {
          background: #fff; border-radius: 12px; padding: 10px 12px;
          display: flex; flex-wrap: wrap; justify-content: space-between;
          align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); gap: 8px;
        }
        .js-options-left { display: flex; gap: 6px; flex-wrap: wrap; }
        .js-options-right { display: flex; }
        
        .js-filter-btn {
          background: #fff; border: 1px solid #e2e8f0; padding: 8px 14px;
          border-radius: 8px; font-size: 12px; font-weight: 600; color: #475569;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: all 0.2s; font-family: inherit;
        }

        @media (min-width: 480px) {
          .js-filter-btn { font-size: 13px; padding: 8px 18px; gap: 8px; }
          .js-filter-bar.search-options { padding: 10px 15px; }
        }

        .js-filter-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
        .js-filter-btn.active { background: #fff1f2; border-color: #D63447; color: #D63447; }
        .js-filter-btn.main { font-weight: 700; }
        
        .js-filter-btn.toggle.active {
          background: #D63447; color: #fff; border-color: #D63447;
        }

        .js-search-input-box {
          background: #fff; border-radius: 12px; padding: 12px;
          display: flex; gap: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }
        .js-search-input-box input {
          flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;
          font-size: 14px; outline: none; font-family: inherit; min-width: 0;
        }
        .js-search-input-box input:focus { border-color: #D63447; }
        .js-search-input-box button {
          background: #D63447; color: #fff; border: none; padding: 0 16px;
          border-radius: 8px; font-weight: 700; cursor: pointer; font-family: inherit;
          white-space: nowrap; flex-shrink: 0;
        }

        .js-filter-overlay {
          background: #fff; border-radius: 12px; padding: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1); margin-top: 10px;
          border: 1px solid #e2e8f0;
        }

        .js-search-welcome {
          background: #fff; border-radius: 12px; padding: 40px 20px;
          text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px;
        }

        @media (min-width: 768px) {
          .js-search-welcome { padding: 60px 40px; gap: 15px; }
        }

        .js-welcome-icon { color: #D63447; margin-bottom: 6px; opacity: 0.5; }
        .js-search-welcome h2 { font-size: 20px; font-weight: 800; color: #1e293b; }
        .js-search-welcome p { color: #64748b; font-size: 14px; max-width: 340px; }

        @media (min-width: 768px) {
          .js-search-welcome h2 { font-size: 24px; }
          .js-search-welcome p { max-width: 400px; }
        }

        .js-search-start-btn {
          background: #D63447; color: #fff; border: none; padding: 12px 28px;
          border-radius: 30px; font-weight: 800; cursor: pointer; margin-top: 8px;
          font-family: inherit;
        }

        .js-results-summary { font-size: 13px; color: #64748b; margin: 8px 0; }
        
        .red { color: #D63447; }
      `}} />
      <Footer />
    </div>
  );
}
