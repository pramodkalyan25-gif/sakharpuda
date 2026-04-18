import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { interestService } from '../../services/interestService';
import { useAuth } from '../../hooks/useAuth';

/**
 * InterestList — Shows received or sent interests with action buttons.
 */
export default function InterestList({ interests = [], type = 'received', onUpdate }) {
  const { user } = useAuth();

  const handleAccept = async (interest) => {
    try {
      await interestService.acceptInterest(interest.id);
      toast.success('Interest accepted!');
      onUpdate?.();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReject = async (interest) => {
    try {
      await interestService.rejectInterest(interest.id);
      toast.success('Interest declined.');
      onUpdate?.();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBlock = async (interest) => {
    if (!window.confirm('Block this user from viewing your profile?')) return;
    try {
      await interestService.blockUser(interest.id);
      toast.success('User blocked.');
      onUpdate?.();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (interests.length === 0) {
    return (
      <div className="interest-empty">
        <p>{type === 'received' ? 'No interests received yet.' : 'You haven\'t sent any interests yet.'}</p>
      </div>
    );
  }

  return (
    <div className="interest-list">
      {interests.map((interest) => {
        const person = type === 'received'
          ? interest.profiles
          : interest.profiles;

        return (
          <div key={interest.id} className="interest-item">
            <div className="interest-info">
              <strong>{person?.name || 'Unknown'}</strong>
              <span className="interest-meta">
                {person?.city} • {person?.religion}
              </span>
            </div>
            <div className="interest-badges">
              <Badge
                variant={
                  interest.status === 'accepted' ? 'success' :
                  interest.status === 'rejected' ? 'danger' : 'warning'
                }
              >
                {interest.status.charAt(0).toUpperCase() + interest.status.slice(1)}
              </Badge>
            </div>
            {type === 'received' && interest.status === 'pending' && (
              <div className="interest-actions">
                <Button size="sm" variant="primary" onClick={() => handleAccept(interest)}>
                  Accept
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleReject(interest)}>
                  Decline
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleBlock(interest)}>
                  Block
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
