import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      onUpdate?.();
    } catch (err) {
      toast.error(err.message || 'Action failed. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  if (interests.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '40px 20px', color: '#888',
        background: '#fafafa', borderRadius: '10px', border: '1px dashed #ddd',
      }}>
        <p style={{ fontSize: '32px', marginBottom: '8px' }}>
          {type === 'received' ? '💌' : '📤'}
        </p>
        <p>{type === 'received'
          ? 'No interests received yet. Complete your profile to attract more matches!'
          : "You haven't sent any interests yet. Browse profiles and send your first one!"
        }</p>
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
            padding: '16px 20px', background: '#fff', borderRadius: '10px',
            border: '1px solid #eee', transition: 'box-shadow 0.2s',
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/profile/${profileId}`)}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            {/* Avatar */}
            <Avatar name={person?.name} size="md" />

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <strong style={{ fontSize: '15px', color: '#333' }}>{person?.name || 'Unknown'}</strong>
                {person?.mobile_verified && (
                  <span style={{ fontSize: '12px', color: '#4caf50' }}>✓ Verified</span>
                )}
              </div>
              <p style={{ fontSize: '13px', color: '#777', margin: 0 }}>
                {age && `${age} yrs`}
                {person?.city && ` • ${person.city}`}
                {person?.religion && ` • ${person.religion}`}
                {person?.education && ` • ${person.education}`}
              </p>
              <p style={{ fontSize: '11px', color: '#aaa', margin: '4px 0 0' }}>{timeAgo}</p>
            </div>

            {/* Status badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
              onClick={e => e.stopPropagation()}>

              <span style={{
                padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                background: `${statusColor}15`, color: statusColor, textTransform: 'capitalize',
              }}>
                {interest.status}
              </span>

              {/* Action buttons for pending received interests */}
              {type === 'received' && interest.status === 'pending' && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    disabled={isLoading}
                    onClick={() => handleAction(interest, 'accept')}
                    style={{
                      padding: '6px 16px', background: '#4caf50', color: 'white',
                      border: 'none', borderRadius: '20px', fontSize: '13px',
                      fontWeight: '500', cursor: 'pointer',
                    }}>
                    {isLoading ? '...' : '✓ Accept'}
                  </button>
                  <button
                    disabled={isLoading}
                    onClick={() => handleAction(interest, 'reject')}
                    style={{
                      padding: '6px 16px', background: '#f5f5f5', color: '#666',
                      border: '1px solid #ddd', borderRadius: '20px', fontSize: '13px',
                      cursor: 'pointer',
                    }}>
                    Decline
                  </button>
                  <button
                    disabled={isLoading}
                    onClick={() => handleAction(interest, 'block')}
                    title="Block this user"
                    style={{
                      padding: '6px 10px', background: '#fff', color: '#e53935',
                      border: '1px solid #ffcdd2', borderRadius: '20px', fontSize: '13px',
                      cursor: 'pointer',
                    }}>
                    🚫
                  </button>
                </div>
              )}

              {/* Accepted: show "View Profile" hint */}
              {interest.status === 'accepted' && (
                <span style={{ fontSize: '12px', color: '#4caf50' }}>
                  📞 Contact available
                </span>
              )}

              {/* Report option for any received interest */}
              {type === 'received' && interest.status !== 'pending' && (
                <button
                  onClick={() => handleAction(interest, 'report')}
                  title="Report this profile"
                  style={{
                    padding: '4px 8px', background: 'none', border: 'none',
                    color: '#bbb', cursor: 'pointer', fontSize: '14px',
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
