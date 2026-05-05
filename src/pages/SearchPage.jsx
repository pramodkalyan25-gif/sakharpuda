import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Filter, 
  Search, 
  SlidersHorizontal, 
  Users, 
  TrendingUp, 
  CheckCircle,
  Video,
  Phone,
  Fingerprint,
  User as UserIcon,
  Search as SearchIcon
} from 'lucide-react';
import Sidebar from '../components/ui/Sidebar';
import SearchFilters from '../components/search/SearchFilters';
import SearchResults from '../components/search/SearchResults';
import TopNav from '../components/ui/TopNav';
import Footer from '../components/ui/Footer';
import Avatar from '../components/ui/Avatar';
import { searchService } from '../services/searchService';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';

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
          profileService.logProfileView(user.id, p.user_id).catch(() => {});
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
    <div className="js-dashboard-wrapper">
      <TopNav />
      
      <main className="js-main-grid container">
        {/* LEFT SIDEBAR */}
        <Sidebar profile={profile} avatarUrl={null} />

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
            <div className="js-search-welcome">
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
        <aside className="js-right-sidebar">
          <div className="js-premium-nudge">
            <h3>You are <span className="red">missing</span> out on the premium benefits!</h3>
            
            <div className="js-benefit-list">
              <div className="js-benefit-item">
                <div className="js-benefit-icon purple"><Users size={16} /></div>
                <p>Get upto 3x more profile views</p>
              </div>
              <div className="js-benefit-item">
                <div className="js-benefit-icon orange">
                  <div className="js-icon-stack">
                    <Phone size={10} />
                    <Video size={10} />
                  </div>
                </div>
                <p>Unlimited voice & video calls</p>
              </div>
              <div className="js-benefit-item">
                <div className="js-benefit-icon green"><CheckCircle size={16} /></div>
                <p>Get access to contact details</p>
              </div>
              <div className="js-benefit-item">
                <div className="js-benefit-icon blue"><SearchIcon size={16} /></div>
                <p>Perform unlimited searches</p>
              </div>
            </div>

            <div className="js-promo-footer">
              <p>Flat 54% OFF till 07 May</p>
              <button className="js-upgrade-btn" onClick={() => navigate('/upgrade')}>
                Upgrade now <span>→</span>
              </button>
            </div>
          </div>
        </aside>
      </main>

      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        .js-dashboard-wrapper {
          min-height: 100vh;
          background: #f1f2f5;
          padding-bottom: 50px;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .js-main-grid {
          display: grid;
          grid-template-columns: 280px 1fr 280px;
          gap: 20px;
          margin-top: 20px;
          align-items: flex-start;
        }

        /* Sidebar styles inherited from MyMatches/Dashboard */
        .js-left-sidebar { display: flex; flex-direction: column; gap: 20px; }
        .js-profile-brief {
          background: #fff; border-radius: 8px; padding: 20px;
          display: flex; flex-direction: column; align-items: center; text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .js-brief-avatar { margin-bottom: 12px; }
        .js-brief-info h3 { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
        .js-brief-info p { font-size: 12px; color: #64748b; }
        .js-edit-link { color: #D63447; font-weight: 700; text-decoration: none; margin-left: 4px; }

        .js-side-nav {
          background: #fff; border-radius: 8px; overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .js-nav-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 20px; text-decoration: none; color: #475569;
          font-weight: 600; font-size: 14px; border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s;
        }
        .js-nav-item:hover { background: #f8fafc; }
        .js-nav-item.active { color: #D63447; border-left: 3px solid #D63447; background: #fff1f2; }

        /* Middle Content */
        .js-content-area { display: flex; flex-direction: column; gap: 15px; position: relative; }
        
        .js-search-options-wrapper { display: flex; flex-direction: column; gap: 10px; }
        
        .js-filter-bar.search-options {
          background: #fff; border-radius: 12px; padding: 10px 15px;
          display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .js-options-left { display: flex; gap: 10px; }
        .js-options-right { display: flex; }
        
        .js-filter-btn {
          background: #fff; border: 1px solid #e2e8f0; padding: 8px 18px;
          border-radius: 8px; font-size: 13px; font-weight: 600; color: #475569;
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          transition: all 0.2s;
        }
        .js-filter-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
        .js-filter-btn.active { background: #fff1f2; border-color: #D63447; color: #D63447; }
        .js-filter-btn.main { font-weight: 700; }
        
        .js-filter-btn.toggle.active {
          background: #D63447; color: #fff; border-color: #D63447;
        }

        .js-search-input-box {
          background: #fff; border-radius: 12px; padding: 15px;
          display: flex; gap: 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }
        .js-search-input-box input {
          flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 15px;
          font-size: 14px; outline: none;
        }
        .js-search-input-box input:focus { border-color: #D63447; }
        .js-search-input-box button {
          background: #D63447; color: #fff; border: none; padding: 0 20px;
          border-radius: 8px; font-weight: 700; cursor: pointer;
        }

        .js-filter-overlay {
          background: #fff; border-radius: 12px; padding: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1); margin-top: 10px;
          border: 1px solid #e2e8f0;
        }

        .js-search-welcome {
          background: #fff; border-radius: 12px; padding: 60px;
          text-align: center; display: flex; flex-direction: column; align-items: center; gap: 15px;
        }
        .js-welcome-icon { color: #D63447; margin-bottom: 10px; opacity: 0.5; }
        .js-search-welcome h2 { font-size: 24px; font-weight: 800; color: #1e293b; }
        .js-search-welcome p { color: #64748b; font-size: 14px; max-width: 400px; }
        .js-search-start-btn {
          background: #D63447; color: #fff; border: none; padding: 12px 30px;
          border-radius: 30px; font-weight: 800; cursor: pointer; margin-top: 10px;
        }

        .js-results-summary { font-size: 14px; color: #64748b; margin: 10px 0; }

        /* Right Sidebar nudge */
        .js-right-sidebar { display: flex; flex-direction: column; gap: 20px; }
        .js-premium-nudge {
          background: #fff; border-radius: 12px; padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .js-premium-nudge h3 { font-size: 15px; font-weight: 700; color: #1e293b; line-height: 1.4; margin-bottom: 20px; text-align: center; }
        .js-premium-nudge .red { color: #D63447; }
        .js-benefit-item { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; }
        .js-benefit-icon {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .js-benefit-icon.purple { background: #f3e8ff; color: #9333ea; }
        .js-benefit-icon.orange { background: #fff7ed; color: #ea580c; }
        .js-benefit-icon.green { background: #f0fdf4; color: #16a34a; }
        .js-benefit-icon.blue { background: #eff6ff; color: #2563eb; }
        .js-benefit-item p { font-size: 13px; color: #475569; font-weight: 500; }
        .js-icon-stack { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .js-promo-footer { text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; }
        .js-promo-footer p { font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 12px; }
        .js-upgrade-btn {
          width: 100%; background: #D63447; color: #fff; border: none;
          padding: 12px; border-radius: 8px; font-weight: 800; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }

        @media (max-width: 1024px) {
          .js-main-grid { grid-template-columns: 200px 1fr; }
          .js-right-sidebar { display: none; }
        }
        @media (max-width: 768px) {
          .js-main-grid { grid-template-columns: 1fr; }
          .js-left-sidebar { display: none; }
        }
      `}} />
    </div>
  );
}
