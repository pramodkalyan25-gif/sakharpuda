import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchFilters from '../components/search/SearchFilters';
import SearchResults from '../components/search/SearchResults';
import Button from '../components/ui/Button';
import TopNav from '../components/ui/TopNav';
import { searchService } from '../services/searchService';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import { Search, SlidersHorizontal, Users } from 'lucide-react';

export default function SearchPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({});
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searched, setSearched] = useState(false);

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
    <div className="search-page-container">
      <TopNav />
      
      <div className="search-hero">
        <div className="container">
          <div className="search-hero-content">
            <div className="title-area">
              <Search className="hero-icon" />
              <h1>Find Your Soulmate</h1>
              <p>Filter through thousands of profiles to find the one who matches your heart.</p>
            </div>
            {searched && (
              <div className="search-stats">
                <Users size={20} />
                <span>Found <strong>{total}</strong> potential matches</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="container search-main">
        <div className="search-layout">
          <aside className="search-sidebar">
            <div className="filters-card">
              <div className="filters-header">
                <SlidersHorizontal size={18} />
                <h3>Search Filters</h3>
              </div>
              <SearchFilters
                filters={filters}
                onChange={setFilters}
                onSearch={handleSearch}
                loading={loading}
              />
            </div>
          </aside>

          <div className="search-results-area">
            {!searched ? (
              <div className="search-welcome">
                <div className="welcome-illustration">🔍</div>
                <h2>Ready to start your search?</h2>
                <p>Adjust the filters on the left and discover people who match your lifestyle and values.</p>
                <button className="btn-search-primary" onClick={handleSearch} disabled={loading}>
                  {loading ? 'Searching...' : 'Show All Profiles'}
                </button>
              </div>
            ) : (
              <SearchResults
                profiles={profiles}
                loading={loading}
                total={total}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                loadingMore={loadingMore}
              />
            )}
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .search-page-container { min-height: 100vh; background: #f8fafc; }
        
        .search-hero {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: #fff;
          padding: 60px 0;
          margin-bottom: 40px;
        }
        .search-hero-content { display: flex; justify-content: space-between; align-items: flex-end; }
        .title-area h1 { font-size: 36px; font-weight: 800; margin: 10px 0; }
        .title-area p { font-size: 16px; opacity: 0.8; max-width: 500px; }
        .hero-icon { color: #D63447; width: 40px; height: 40px; }
        
        .search-stats {
          background: rgba(255,255,255,0.1);
          padding: 12px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
        }

        .search-main { padding-bottom: 60px; }
        .search-layout { display: grid; grid-template-columns: 320px 1fr; gap: 30px; align-items: start; }
        
        .filters-card {
          background: #fff; border-radius: 20px; padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #edf2f7;
        }
        .filters-header { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; color: #1e293b; }
        .filters-header h3 { font-size: 18px; font-weight: 800; }

        .search-welcome {
          background: #fff; border-radius: 24px; padding: 80px 40px;
          text-align: center; border: 1px dashed #cbd5e0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }
        .welcome-illustration { font-size: 64px; margin-bottom: 20px; }
        .search-welcome h2 { font-size: 24px; font-weight: 800; color: #1e293b; margin-bottom: 12px; }
        .search-welcome p { font-size: 16px; color: #64748b; margin-bottom: 30px; max-width: 450px; margin-left: auto; margin-right: auto; }
        
        .btn-search-primary {
          background: #D63447; color: #fff; border: none;
          padding: 14px 40px; border-radius: 30px; font-weight: 800;
          font-size: 16px; cursor: pointer; transition: 0.2s;
        }
        .btn-search-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(214, 52, 71, 0.3); }

        @media (max-width: 900px) {
          .search-layout { grid-template-columns: 1fr; }
          .search-hero-content { flex-direction: column; align-items: flex-start; gap: 20px; }
        }
      `}} />
    </div>
  );
}
