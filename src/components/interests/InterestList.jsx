import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { interestService } from '../../services/interestService';
import { useAuth } from '../../hooks/useAuth';
import { differenceInYears, parseISO, formatDistanceToNow } from 'date-fns';

/**
 * InterestList — Shows received or sent interests with full action buttons.
 * Received: Accept / Decline / Block + navigate to profile
 * Sent: View status + navigate to profile
 */
export default function InterestList({ interests = [], type = 'received', onUpdate }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);

  const handleAction = async (interest, action) => {
    setLoadingId(interest.id);
    try {
      if (action === 'accept') {
        await interestService.acceptInterest(interest.id);
        toast.success(`You accepted ${interest.profiles?.name}'s interest! You can now view each other's photos.`);
      } else if (action === 'reject') {
        await interestService.rejectInterest(interest.id);
        toast('Interest declined.', { icon: '👋' });
      } else if (action === 'block') {
        if (!window.confirm(`Block ${interest.profiles?.name || 'this user'}? They won't be able to see your profile anymore.`)) {
          setLoadingId(null);
          return;
        }
        await interestService.blockUser(interest.id);
        toast.success('User blocked successfully.');
      } else if (action === 'report') {
        if (!window.confirm('Report this profile as spam or inappropriate?')) {
          setLoadingId(null);
          return;
        }
        await interestService.reportUser(interest.id);
        toast.success('Report submitted. Our team will review it.');
      }
      } else if (action === 'withdraw') {
        if (!window.confirm('Withdraw this interest request?')) {
          setLoadingId(null);
          return;
        }
        await interestService.withdrawInterest(interest.id);
        toast.success('Interest withdrawn.');
      }
      onUpdate?.();
    } catch (err) {
      toast.error(err.message || 'Action failed. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  if (interests.length === 0) {
    return (
      <div className="dash-empty-state" style={{ padding: '40px 20px' }}>
        <p style={{ fontSize: '48px', marginBottom: '8px' }}>
          {type === 'received' ? '💌' : '📤'}
        </p>
        <h3>{type === 'received' ? 'No interests yet' : 'Nothing sent yet'}</h3>
        <p style={{ marginBottom: '15px' }}>
          {type === 'received'
            ? 'Complete your profile with a photo to attract more matches!'
            : "Browse profiles and find someone you like!"
          }
        </p>
        <Link to="/search"><Button variant="outline">Browse Profiles</Button></Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {interests.map((interest) => {
        const person = interest.profiles;
        const age = person?.dob ? differenceInYears(new Date(), parseISO(person.dob)) : null;
        const timeAgo = interest.created_at
          ? formatDistanceToNow(parseISO(interest.created_at), { addSuffix: true })
          : '';
        const isLoading = loadingId === interest.id;
        const profileId = type === 'received' ? interest.sender_id : interest.receiver_id;

        const statusColor = {
          pending: '#ff9800', accepted: '#4caf50', rejected: '#f44336',
        }[interest.status] || '#999';

        return (
          <div key={interest.id} style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            padding: '16px 20px', background: 'var(--clr-card)', borderRadius: 'var(--radius)',
            border: '1px solid var(--clr-border)', transition: 'var(--transition)',
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/profile/${profileId}`)}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--clr-gold)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--clr-border)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            {/* Avatar */}
            <Avatar name={person?.name} size="md" />

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <strong style={{ fontSize: '15px', color: 'var(--clr-text)' }}>{person?.name || 'Unknown'}</strong>
                {person?.mobile_verified && (
                  <Badge variant="success">✓ Verified</Badge>
                )}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--clr-text-muted)', margin: 0 }}>
                {age && `${age} yrs`}
                {person?.city && ` • ${person.city}`}
                {person?.religion && ` • ${person.religion}`}
                {person?.education && ` • ${person.education}`}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--clr-gold)', margin: '4px 0 0', opacity: 0.8 }}>{timeAgo}</p>
            </div>

            {/* Status badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
              onClick={e => e.stopPropagation()}>

              <span style={{
                padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700',
                background: interest.status === 'accepted' ? 'var(--clr-gold)' : `${statusColor}15`, 
                color: interest.status === 'accepted' ? '#000' : statusColor, 
                textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                {interest.status === 'accepted' ? 'Matched!' : interest.status}
              </span>

              {/* Action buttons for pending received interests */}
              {type === 'received' && interest.status === 'pending' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    size="sm"
                    variant="success"
                    disabled={isLoading}
                    onClick={() => handleAction(interest, 'accept')}
                  >
                    {isLoading ? '...' : 'Accept'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isLoading}
                    onClick={() => handleAction(interest, 'reject')}
                  >
                    Decline
                  </Button>
                </div>
              )}

              {/* Withdraw button for pending sent interests */}
              {type === 'sent' && interest.status === 'pending' && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isLoading}
                  onClick={() => handleAction(interest, 'withdraw')}
                  style={{ color: 'var(--clr-danger)', borderColor: 'rgba(248,113,113,0.3)' }}
                >
                  {isLoading ? '...' : 'Withdraw'}
                </Button>
              )}

              {/* Accepted: show "View Profile" hint */}
              {interest.status === 'accepted' && (
                <span style={{ fontSize: '12px', color: 'var(--clr-gold)', fontWeight: '600' }}>
                  📞 Contact Ready
                </span>
              )}

              {/* Report option for any received interest */}
              {type === 'received' && (
                <button
                  onClick={() => handleAction(interest, 'report')}
                  title="Report this profile"
                  style={{
                    padding: '4px 8px', background: 'none', border: 'none',
                    color: 'var(--clr-text-muted)', cursor: 'pointer', fontSize: '16px',
                  }}>
                  ⚑
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
