import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SearchFilters from '../components/search/SearchFilters';
import SearchResults from '../components/search/SearchResults';
import Button from '../components/ui/Button';
import { searchService } from '../services/searchService';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';

export default function SearchPage() {
  const { user } = useAuth();
  const [filters, setFilters]       = useState({});
  const [profiles, setProfiles]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(0);
  const [hasMore, setHasMore]       = useState(false);
  const [searched, setSearched]     = useState(false);

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

      // Log profile views for results
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
    <div className="search-page">
      {/* Top bar */}
      <div className="search-topbar">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm">← Dashboard</Button>
        </Link>
        <h1 className="search-page-title">💍 Search Profiles</h1>
      </div>

      <div className="search-layout">
        <SearchFilters
          filters={filters}
          onChange={setFilters}
          onSearch={handleSearch}
          loading={loading}
        />
        <div className="search-content">
          {!searched ? (
            <div className="search-start">
              <div className="search-start-icon">🔍</div>
              <h2>Find Your Match</h2>
              <p>Use the filters on the left to search for profiles</p>
              <Button onClick={handleSearch} loading={loading}>
                Show All Profiles
              </Button>
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
    </div>
  );
}
