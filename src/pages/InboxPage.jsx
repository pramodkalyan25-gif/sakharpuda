import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import TopNav from '../components/ui/TopNav';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { chatService } from '../services/chatService';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import Sidebar from '../components/ui/Sidebar';
import RightSidebar from '../components/ui/RightSidebar';
import Footer from '../components/ui/Footer';

export default function InboxPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      chatService.getConversations(user.id)
        .then(setConversations)
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  return (
    <div className="js-dashboard-wrapper inbox-page">
      <TopNav />

      <main className="js-main-grid js-layout-container">
        <Sidebar />

        <div className="js-content-area">
          <section className="js-dashboard-section">
            <header className="inbox-header">
              <div className="header-title">
                <MessageSquare className="header-icon" />
                <h1>Messages</h1>
              </div>
              <p className="subtitle">View and manage your active conversations.</p>
            </header>

            {loading ? (
              <div className="loading-center"><Spinner size="lg" /></div>
            ) : conversations.length > 0 ? (
              <div className="conv-list">
                {conversations.map((conv) => (
                  <div 
                    key={conv.otherId} 
                    className="conv-item-card"
                    onClick={() => navigate(`/chat/${conv.otherId}`)}
                  >
                    <div className="conv-user-info">
                      <div style={{ position: 'relative' }}>
                        <Avatar src={null} name={conv.profile.name} size="lg" />
                        {conv.unreadCount > 0 && <span className="unread-dot"></span>}
                      </div>
                      <div className="conv-meta">
                        <div className="name-time">
                          <h3>{conv.profile.name}</h3>
                          <span className="last-time">
                            {formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="last-msg-row">
                          <p className={`last-msg ${conv.unreadCount > 0 ? 'unread' : ''}`}>
                            {conv.lastMessage.sender_id === user.id ? 'You: ' : ''}
                            {conv.lastMessage.content}
                          </p>
                          {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-card">
                <div className="empty-icon-box">
                  <MessageSquare size={40} />
                </div>
                <h2>No active conversations yet</h2>
                <p>Accepted interests will appear here. Start a conversation with your matches!</p>
                <button className="js-discover-btn" onClick={() => navigate('/interests')}>View Interests</button>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT SIDEBAR */}
        <RightSidebar profile={profile} />
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .inbox-page { min-height: 100vh; background: #f8fafc; }
        .inbox-header { margin-bottom: 25px; }
        .header-title { display: flex !important; align-items: center !important; gap: 12px !important; margin-bottom: 6px; }
        .header-title h1 { font-size: 18px !important; font-weight: 800; color: #1e293b; margin: 0; }
        .header-icon { color: #D63447; width: 24px !important; height: 24px !important; flex-shrink: 0; }
        .subtitle { color: #64748b; font-size: 13px; margin: 0; padding-left: 36px; }

        .loading-center { padding: 80px 0; text-align: center; }

        .conv-list { display: flex; flex-direction: column; gap: 12px; }
        .conv-item-card {
          background: #fff; border-radius: 16px; padding: 18px;
          cursor: pointer; transition: all 0.2s;
          border: 1px solid #edf2f7; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .conv-item-card:hover { transform: translateY(-2px); border-color: #D63447; box-shadow: 0 4px 12px rgba(214, 52, 71, 0.08); }

        .conv-user-info { display: flex !important; align-items: center !important; gap: 16px !important; }
        .unread-dot {
          position: absolute; top: 0; right: 0; width: 12px; height: 12px;
          background: #ef4444; border: 2px solid #fff; border-radius: 50%;
        }
        
        .conv-meta { flex: 1; min-width: 0; }
        .name-time { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .name-time h3 { font-size: 16px; font-weight: 800; color: #1e293b; margin: 0; }
        .last-time { font-size: 11px; color: #94a3b8; }

        .last-msg-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
        .last-msg {
          font-size: 13px; color: #64748b; margin: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .last-msg.unread { color: #1e293b; font-weight: 700; }
        
        .unread-badge {
          background: #D63447; color: #fff; font-size: 10px; font-weight: 800;
          padding: 2px 8px; border-radius: 10px; min-width: 20px; text-align: center;
        }

        .empty-state-card {
          padding: 60px 20px; text-align: center; background: #fff;
          border-radius: 20px; border: 1px dashed #cbd5e0; margin-top: 20px;
        }
        .empty-icon-box {
          width: 70px; height: 70px; background: #fff1f2; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
          color: #D63447;
        }
        .empty-state-card h2 { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
        .empty-state-card p { font-size: 14px; color: #64748b; margin-bottom: 20px; }

        .js-discover-btn {
          background: #D63447; color: #fff; border: none; padding: 10px 24px;
          border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .js-discover-btn:hover { background: #b92a3b; }
      `}} />
      <Footer />
    </div>
  );
}

