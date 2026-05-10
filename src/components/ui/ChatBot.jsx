import React, { useState, useEffect, useRef } from 'react';
import { MessagesSquare, X, Send, ChevronRight, RefreshCw, User, Bot, Phone, Mail } from 'lucide-react';
import { RiCustomerService2Fill } from 'react-icons/ri';
import './ChatBot.css';

const chatFlow = {
  start: {
    message: "Hello! I'm your SakharPuda Assistant. Please select a category to help me guide you:",
    options: [
      { label: "Profile & Photos", value: "cat_profile" },
      { label: "Search & Matches", value: "cat_search" },
      { label: "Communication", value: "cat_comm" },
      { label: "Free Membership", value: "cat_membership" },
      { label: "Safety & Privacy", value: "cat_safety" },
      { label: "Contact Support", value: "contact_human" }
    ]
  },

  // PROFILE & PHOTOS
  cat_profile: {
    message: "What would you like to know about Profile & Photos?",
    options: [
      { label: "How to delete profile?", value: "q_delete_profile" },
      { label: "Is photo necessary?", value: "q_photo_importance" },
      { label: "How to edit details?", value: "q_edit_details" },
      { label: "Photo not visible?", value: "q_photo_visibility" },
      { label: "Main Menu", value: "start" }
    ]
  },
  q_delete_profile: {
    message: "To remove your profile, go to Settings > Account Settings. You'll find 'Delete Profile' at the bottom. Note: This is permanent!",
    options: [{ label: "Back to Profile Help", value: "cat_profile" }, { label: "Main Menu", value: "start" }]
  },
  q_photo_importance: {
    message: "Not mandatory, but profiles with photos get 10x more interest! You can upload up to 20 photos via your Sidebar.",
    options: [{ label: "Back to Profile Help", value: "cat_profile" }, { label: "Main Menu", value: "start" }]
  },
  q_edit_details: {
    message: "Click 'Edit Profile' in your Sidebar to update your education, profession, location, and other details.",
    options: [{ label: "Back to Profile Help", value: "cat_profile" }, { label: "Main Menu", value: "start" }]
  },
  q_photo_visibility: {
    message: "All photos are screened for safety. This usually takes a few hours. You'll be notified once approved!",
    options: [{ label: "Back to Profile Help", value: "cat_profile" }, { label: "Main Menu", value: "start" }]
  },

  // SEARCH & MATCHES
  cat_search: {
    message: "How can I help you with Search & Matches?",
    options: [
      { label: "How to search?", value: "q_how_to_search" },
      { label: "Not enough matches?", value: "q_poor_matches" },
      { label: "Accept/Decline info", value: "q_accept_decline" },
      { label: "Main Menu", value: "start" }
    ]
  },
  q_how_to_search: {
    message: "Use the 'Search' tab to filter by Age, Religion, Caste, and Location. We show community-relevant results first.",
    options: [{ label: "Back to Search Help", value: "cat_search" }, { label: "Main Menu", value: "start" }]
  },
  q_poor_matches: {
    message: "Try widening your 'Partner Preferences' (e.g., increase age range or add more locations) in the profile edit section.",
    options: [{ label: "Back to Search Help", value: "cat_search" }, { label: "Main Menu", value: "start" }]
  },
  q_accept_decline: {
    message: "Accepting shows you're open to connect. Declining politely removes the request. Both parties are notified of 'Accept'.",
    options: [{ label: "Back to Search Help", value: "cat_search" }, { label: "Main Menu", value: "start" }]
  },

  // COMMUNICATION
  cat_comm: {
    message: "Need help with Communication?",
    options: [
      { label: "How to contact match?", value: "q_how_to_contact" },
      { label: "Where are my interests?", value: "q_view_interests" },
      { label: "Interest limits?", value: "q_daily_limit" },
      { label: "Main Menu", value: "start" }
    ]
  },
  q_how_to_contact: {
    message: "Click 'Send Interest'. Once they accept, you'll be 'Connected' and can start messaging safely.",
    options: [{ label: "Back to Comm Help", value: "cat_comm" }, { label: "Main Menu", value: "start" }]
  },
  q_view_interests: {
    message: "All interests (Pending, Accepted, Declined) are in your 'Messenger' or 'Inbox' tab.",
    options: [{ label: "Back to Comm Help", value: "cat_comm" }, { label: "Main Menu", value: "start" }]
  },
  q_daily_limit: {
    message: "Currently, you can send up to 10 Interests daily. This resets every 24 hours to maintain quality.",
    options: [{ label: "Back to Comm Help", value: "cat_comm" }, { label: "Main Menu", value: "start" }]
  },

  // MEMBERSHIP
  cat_membership: {
    message: "SakharPuda.com is currently 100% free! We don't have any paid plans.",
    options: [
      { label: "Is it really free?", value: "q_free_reg" },
      { label: "What is Verified badge?", value: "q_verified_badge" },
      { label: "View phone number?", value: "q_phone_view" },
      { label: "Main Menu", value: "start" }
    ]
  },
  q_free_reg: {
    message: "Yes! Registration, profile creation, and basic matchmaking are all free for now.",
    options: [{ label: "Back to Membership Help", value: "cat_membership" }, { label: "Main Menu", value: "start" }]
  },
  q_verified_badge: {
    message: "The 'Admin Verified' badge is also free! It means our team manually checked the profile to increase trust.",
    options: [{ label: "Back to Membership Help", value: "cat_membership" }, { label: "Main Menu", value: "start" }]
  },
  q_phone_view: {
    message: "Phone numbers are private. You can view contact details once you are mutually 'Connected' at no cost.",
    options: [{ label: "Back to Membership Help", value: "cat_membership" }, { label: "Main Menu", value: "start" }]
  },

  // SAFETY
  cat_safety: {
    message: "Your Safety is our top priority:",
    options: [
      { label: "How am I safe?", value: "q_site_safety" },
      { label: "Hide profile/photos?", value: "q_privacy_controls" },
      { label: "Report fake profile", value: "q_reporting" },
      { label: "Main Menu", value: "start" }
    ]
  },
  q_site_safety: {
    message: "We use Mobile OTP and Admin Verification. We also have a 24/7 moderation team screening profiles.",
    options: [{ label: "Back to Safety Help", value: "cat_safety" }, { label: "Main Menu", value: "start" }]
  },
  q_privacy_controls: {
    message: "In Settings, you can set profile to 'Hidden' or Photo Visibility to 'Connected Only'.",
    options: [{ label: "Back to Safety Help", value: "cat_safety" }, { label: "Main Menu", value: "start" }]
  },
  q_reporting: {
    message: "Report any suspicious profile via the profile menu or email sakharpuda@zohomail.in. We act within 24 hours.",
    options: [{ label: "Back to Safety Help", value: "cat_safety" }, { label: "Main Menu", value: "start" }]
  },

  // CONTACT
  contact_human: {
    message: "Still have questions? Our Care team is here to help!",
    options: [
      { label: "Email Support", value: "contact_email" },
      { label: "Call Support", value: "contact_phone" },
      { label: "Main Menu", value: "start" }
    ]
  },
  contact_email: {
    message: "Email us at sakharpuda@zohomail.in. We typically respond within 2-4 hours.",
    options: [{ label: "Main Menu", value: "start" }]
  },
  contact_phone: {
    message: "Call us at +91 91589 98226 (10 AM - 7 PM, Mon-Sat).",
    options: [{ label: "Main Menu", value: "start" }]
  }
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: chatFlow.start.message, options: chatFlow.start.options }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleOptionClick = (option) => {
    const userMsg = { type: 'user', text: option.label };
    setMessages(prev => [...prev, userMsg]);

    setIsTyping(true);

    setTimeout(() => {
      const nextNode = chatFlow[option.value];
      if (nextNode) {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: nextNode.message,
          options: nextNode.options
        }]);
      }
      setIsTyping(false);
    }, 600);
  };

  const resetChat = () => {
    setMessages([
      { type: 'bot', text: chatFlow.start.message, options: chatFlow.start.options }
    ]);
  };

  return (
    <div className="chatbot-container">
      <button
        className={`chatbot-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Chat"
      >
        {!isOpen && (
          <div className="chatbot-bubble">
            <MessagesSquare size={16} style={{ marginRight: '6px' }} />
            Need Help?
          </div>
        )}
        {isOpen ? <X size={24} /> : <MessagesSquare size={26} />}
        {!isOpen && <span className="notification-dot"></span>}
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="bot-info">
              <div className="bot-avatar">
                <MessagesSquare size={20} color="white" />
              </div>
              <div>
                <h3>SakharPuda Care</h3>
                <p>Online | Smart Assistant</p>
              </div>
            </div>
            <div className="header-actions">
              <button onClick={resetChat} title="Reset Chat">
                <RefreshCw size={18} />
              </button>
              <button onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.type}`}>
                <div className="message-content">
                  {msg.type === 'bot' && (
                    <div className="msg-avatar">
                      <MessagesSquare size={14} />
                    </div>
                  )}
                  <div className="msg-bubble">
                    {msg.text}
                  </div>
                  {msg.type === 'user' && (
                    <div className="msg-avatar user">
                      <User size={14} />
                    </div>
                  )}
                </div>

                {msg.type === 'bot' && msg.options && index === messages.length - 1 && !isTyping && (
                  <div className="options-container">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        className="chat-option"
                        onClick={() => handleOptionClick(opt)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="message-wrapper bot">
                <div className="message-content">
                  <div className="msg-avatar">
                    <MessagesSquare size={14} />
                  </div>
                  <div className="msg-bubble typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-footer">
            <p>Typically replies instantly • SakharPuda Care</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
