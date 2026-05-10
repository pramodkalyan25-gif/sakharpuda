import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Copy, Share2, Check, Bell } from 'lucide-react';
import { SUB_COMMUNITIES } from '../../pages/wizardData';

export default function RightSidebar({ profile }) {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://sakharpuda.com/join?ref=${profile?.profile_id || 'B266010'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = `Hi, find your life partner on SakharPuda Matrimony. Register using my link to get 1 month of premium access for free! ${referralLink}`;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const baseUrl = isMobile ? 'https://api.whatsapp.com/send' : 'https://web.whatsapp.com/send';
    const url = `${baseUrl}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleWhatsAppVerify = () => {
    const text = `Hi, I want to verify a referral.\nNew User ID: \nNew User Mobile: `;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.open(`https://wa.me/919158998226?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      window.open(`https://web.whatsapp.com/send?phone=919158998226&text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <aside className="js-right-sidebar">
      {/* INVITE & EARN REFERRAL WIDGET */}
      <div className="js-referral-widget">
        <div className="js-referral-banner">
          <span>SPECIAL OFFER</span>
          <h3>Invite & Earn Premium</h3>
        </div>
        
        <div className="js-referral-content">
          <p className="js-referral-intro">Share SakharPuda with your community and unlock 1 month of free premium access for both of you!</p>

          <div className="js-referral-link-box">
            <span className="js-link-text">{referralLink}</span>
            <button className="js-copy-btn" onClick={handleCopyLink} title="Copy Link">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>

          <button className="js-wa-share-btn" onClick={handleWhatsAppShare}>
            <Share2 size={18} /> Share on WhatsApp
          </button>

          <div className="js-referral-flow">
            <div className="js-flow-step">
              <div className="js-step-num">1</div>
              <p>Copy your unique link</p>
            </div>
            <div className="js-flow-step">
              <div className="js-step-num">2</div>
              <p>Share with friends</p>
            </div>
            <div className="js-flow-step">
              <div className="js-step-num">3</div>
              <p>They complete profile</p>
            </div>
            <div className="js-flow-step">
              <div className="js-step-num">4</div>
              <p>Get 1 month Free Premium for both of you</p>
            </div>
          </div>

          <div className="js-referral-footer">
            <p>To verify, send new user's ID and mobile no of new user on this <span className="js-verify-link" onClick={handleWhatsAppVerify}>WhatsApp No</span></p>
            <p className="js-disclaimer">One reward per verified referral. Both users must have complete profiles to be eligible.</p>
          </div>
        </div>
      </div>
      
      <div className="js-tip-card">
        <Bell size={20} color="#d97706" />
        <p><strong>Pro Tip:</strong> Profiles with at least 3 photos receive 5x more responses!</p>
      </div>

      <div className="js-community-widget">
        <h3>Browse by Community</h3>
        <div className="js-comm-tags">
          {profile?.religion && SUB_COMMUNITIES[profile.religion]?.slice(0, 8).map(c => (
            <Link 
              key={c} 
              to={`/search?caste=${c}`} 
              className="js-comm-tag"
            >
              {c}
            </Link>
          ))}
          <Link to="/search" className="js-comm-tag more">View All Communities</Link>
        </div>
      </div>
    </aside>
  );
}
