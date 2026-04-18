import Spinner from '../ui/Spinner';
import ProfileCard from '../profile/ProfileCard';
import Button from '../ui/Button';

/**
 * SearchResults — Grid of profile cards with pagination.
 */
export default function SearchResults({
  profiles,
  loading,
  total,
  hasMore,
  onLoadMore,
  loadingMore,
}) {
  if (loading) {
    return (
      <div className="results-loading">
        <Spinner size="lg" />
        <p>Searching profiles...</p>
      </div>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="results-empty">
        <div className="empty-icon">🔍</div>
        <h3>No profiles found</h3>
        <p>Try adjusting your search filters</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      <p className="results-count">
        Showing <strong>{profiles.length}</strong> of <strong>{total}</strong> profiles
      </p>
      <div className="results-grid">
        {profiles.map((profile) => (
          <ProfileCard key={profile.user_id} profile={profile} />
        ))}
      </div>
      {hasMore && (
        <div className="results-load-more">
          <Button
            variant="outline"
            onClick={onLoadMore}
            loading={loadingMore}
          >
            Load More Profiles
          </Button>
        </div>
      )}
    </div>
  );
}
