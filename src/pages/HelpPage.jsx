import { useState } from 'react';
import { 
  Search, 
  User, 
  Camera, 
  ShieldCheck, 
  CreditCard, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Mail,
  Smartphone,
  Info,
  ChevronLeft,
  Users,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import TopNav from '../components/ui/TopNav';
import { useAuth } from '../hooks/useAuth';

export default function HelpPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const faqData = [
    {
      category: 'Profile & Photos',
      icon: <Camera size={20} className="red" />,
      questions: [
        {
          id: 'delete-profile',
          q: 'How can I delete my Profile?',
          a: "If you wish to remove your profile, login and go to Settings > Account Settings. You will find the option to delete your profile permanently at the bottom under 'Danger Zone'. Please note that this action is permanent and all matches/interests will be lost."
        },
        {
          id: 'photo-importance',
          q: 'Is it necessary to add a photo? How can I add one?',
          a: "While not mandatory, profiles with photos get significantly higher visibility. You can upload up to 20 photos. Simply click the Camera Icon overlay on your profile picture in the Sidebar to go directly to the photo upload section."
        },
        {
          id: 'edit-details',
          q: 'How can I edit my profile details?',
          a: "You can update your information by clicking the 'Edit Profile' link in your Sidebar. This allows you to update your education, profession, location, and other personal details."
        },
        {
          id: 'photo-visibility-wait',
          q: 'Why is my photo not visible yet?',
          a: "All photos undergo a standard screening process for community safety, which usually takes a few hours. You will see your photo live once it has been approved by our team."
        }
      ]
    },
    {
      category: 'Search & Matches',
      icon: <Users size={20} className="blue" />,
      questions: [
        {
          id: 'how-to-search',
          q: 'How can I search for matches?',
          a: "Use the Search tab in the sidebar to filter profiles by Age, Religion, Caste, and Location. SakharPuda is community-focused, so you will see the most relevant results for your background first."
        },
        {
          id: 'poor-matches',
          q: 'Why am I not seeing enough matches?',
          a: "Matches are shown based on your Partner Preferences. If you aren't seeing enough results, try widening your preferences (e.g., increasing the age range or including more locations) in the profile edit section."
        },
        {
          id: 'accept-decline',
          q: 'What happens when I Accept or Decline an Interest?',
          a: "Accepting an Interest means you are open to connecting. Both you and the other member will be notified. Declining will politely inform the member you aren't interested, and the request will be removed from your pending list."
        }
      ]
    },
    {
      category: 'Communication',
      icon: <MessageCircle size={20} className="green" />,
      questions: [
        {
          id: 'how-to-contact',
          q: 'How do I contact a match?',
          a: "You can initiate contact by clicking 'Send Interest' on a member's profile. Once they accept your interest, you both are 'Connected'. For security, direct messaging is available once a mutual interest is established."
        },
        {
          id: 'view-interests',
          q: 'Where can I see my interests?',
          a: "All interests you receive are listed in your 'Messenger' (Inbox) tab. You can filter them by Pending, Accepted, and Declined."
        },
        {
          id: 'daily-limit',
          q: 'Is there a limit on how many Interests I can send?',
          a: "To ensure quality interactions, free members have a daily limit of 10 Interests. This limit resets every 24 hours."
        }
      ]
    },
    {
      category: 'Membership & Verification',
      icon: <CreditCard size={20} className="orange" />,
      questions: [
        {
          id: 'free-registration',
          q: 'Is SakharPuda.com free?',
          a: "Yes, SakharPuda.com is completely free for all users! You can create your profile, upload photos, search for matches, and send interests without any charges. We currently do not have any paid membership plans."
        },
        {
          id: 'premium-benefits',
          q: 'What is the "Admin Verified" badge?',
          a: "The 'Admin Verified' badge is awarded to profiles that have been manually checked by our team for authenticity. This service is also provided for free to help build trust within our community."
        },
        {
          id: 'contact-details',
          q: 'How can I see a member\'s phone number?',
          a: "For privacy, phone numbers are not shown publicly. You can request to view a member's contact details once you have a mutual interest (Connected). This ensures that contact information is only shared with those you are interested in."
        }
      ]
    },
    {
      category: 'Safety & Privacy',
      icon: <ShieldCheck size={20} className="purple" />,
      questions: [
        {
          id: 'site-safety',
          q: 'How does SakharPuda ensure my safety?',
          a: "We use mobile OTP verification for all users and offer a manual 'Admin Verification' process. Additionally, you can report any suspicious profile directly to our support team at sakharpuda@zohomail.in."
        },
        {
          id: 'privacy-controls-deep',
          q: 'Can I hide my profile or photos?',
          a: "Yes. In your Settings, you can set your Profile Visibility to 'Hidden' to take a break. You can also control your Photo Visibility so only members you have connected with can see your pictures."
        },
        {
          id: 'reporting',
          q: 'What should I do if I find a fake profile?',
          a: "Safety is our priority. Please report any fake or offensive profiles by emailing sakharpuda@zohomail.in with the Profile ID. Our team will investigate and take action within 24 hours."
        }
      ]
    }
  ];

  const filteredFaqs = searchQuery 
    ? faqData.map(cat => ({
        ...cat,
        questions: cat.questions.filter(q => 
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.questions.length > 0)
    : faqData;

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="js-help-wrapper">
      <div className="js-sticky-header-group">
        {isAuthenticated ? <TopNav /> : (
          <header className="js-simple-header">
            <div className="container">
              <div className="js-legal-nav">
                <Link to="/"><img src="/images/sakharpuda-logo.png" alt="SakharPuda" className="js-legal-logo" /></Link>
                <Link to="/" className="js-back-home">
                  <ChevronLeft size={16} /> Back to Home
                </Link>
              </div>
            </div>
          </header>
        )}
        
        {!isAuthenticated && (
          <section className="js-help-hero">
            <div className="container">
              <h2>Help Center</h2>
              <p>Your guide to finding the perfect match on SakharPuda.com</p>
              
              <div className="js-search-wrapper">
                <Search size={20} className="js-search-icon" />
                <input 
                  type="text" 
                  placeholder="Search for questions (e.g. 'delete', 'photos', 'contact')..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </section>
        )}
      </div>
      
      <main className={`js-help-container ${!isAuthenticated ? 'full-width' : ''}`}>
        <div className="container">
          <div className="js-help-content-grid">
            <section className="js-faq-section">
              <div className="js-faq-list">
                {filteredFaqs.map((cat, idx) => (
                  <div key={idx} className="js-faq-category">
                    <div className="js-cat-header">
                      {cat.icon}
                      <h2>{cat.category}</h2>
                    </div>
                    <div className="js-cat-questions">
                      {cat.questions.map(q => (
                        <div key={q.id} className={`js-faq-item ${openFaq === q.id ? 'active' : ''}`}>
                        <button className="js-faq-question" onClick={() => toggleFaq(q.id)}>
                          <span>{q.q}</span>
                          {openFaq === q.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {openFaq === q.id && (
                          <div className="js-faq-answer">
                            <p>{q.a}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {filteredFaqs.length === 0 && (
                <div className="js-no-results">
                  <AlertCircle size={40} />
                  <h3>No matching questions found</h3>
                  <p>Try searching with different keywords or contact our care team below.</p>
                </div>
              )}
              </div>
            </section>

            <aside className="js-help-sidebar">
              <div className="js-contact-card">
                <h3>Still need help?</h3>
                <p>Our SakharPuda Care team is available to assist you.</p>
                
                <div className="js-contact-links">
                  <a href="mailto:sakharpuda@zohomail.in" className="js-contact-link">
                    <Mail size={18} />
                    <div className="js-link-text">
                      <strong>Email Us</strong>
                      <span>sakharpuda@zohomail.in</span>
                    </div>
                  </a>
                  <a href="tel:+919158998226" className="js-contact-link">
                    <Smartphone size={18} />
                    <div className="js-link-text">
                      <strong>Call Us</strong>
                      <span>+91 91589 98226</span>
                    </div>
                  </a>
                </div>

                <div className="js-support-hours">
                  <strong>Support Hours:</strong>
                  <p>Monday - Sunday, 9 AM to 9 PM IST</p>
                </div>
              </div>

              <div className="js-safety-card">
                <HelpCircle size={24} className="purple" />
                <h4>Safety & Trust</h4>
                <p>Learn how we verify profiles and keep our community safe.</p>
                <button className="js-btn-link" onClick={() => navigate('/safety-center')}>Visit Safety Center</button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <footer className="simple-footer">
        <div className="container">
          <nav className="footer-links">
            <Link to="/login">Member Login</Link>
            <Link to="/register">Register Here</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/help">Help Center/FAQ</Link>
          </nav>
          <div className="footer-copyright">
            &copy; 2024 SakharPuda.com. All rights reserved.
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .js-help-wrapper { min-height: 100vh; background: #fff; }
        .js-help-container { padding-bottom: 80px; }
        .js-help-container.full-width { padding-top: 0; }

        .js-sticky-header-group {
          position: relative;
          z-index: 10;
        }

        .js-simple-header { 
          background: #fff; 
          border-bottom: 1px solid #e2e8f0; 
          padding: 10px 0;
        }
        .js-simple-header .container {
          max-width: 100% !important;
          padding: 0 40px;
        }
        .js-legal-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .js-legal-logo {
          height: 22px;
          display: block;
        }
        .js-back-home { display: flex; align-items: center; gap: 8px; color: #64748b; text-decoration: none; font-weight: 600; font-size: 14px; }
        .js-back-home:hover { color: #D63447; }

        .js-help-hero {
          background: #fff;
          color: #1e293b;
          padding: 25px 0;
          text-align: center;
          position: relative;
          border-bottom: 1px solid #e2e8f0;
        }

        .js-help-hero .container {
          position: relative;
          z-index: 2;
        }

        .js-help-hero h2 {
          font-size: 28px;
          margin-bottom: 8px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #1e293b;
        }

        .js-help-hero p {
          font-size: 15px;
          opacity: 0.7;
          margin-bottom: 20px;
          color: #64748b;
        }

        .js-search-wrapper {
          max-width: 600px;
          margin: 0 auto;
          background: #f1f5f9;
          border-radius: 12px;
          display: flex;
          align-items: center;
          padding: 0 20px;
          border: 1px solid #e2e8f0;
          color: #64748b;
        }
        .js-search-bar input {
          flex: 1;
          border: none;
          padding: 20px 15px;
          font-size: 16px;
          outline: none;
          color: #1e293b;
        }

        .js-faq-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 40px;
          align-items: flex-start;
        }

        .js-faq-category { margin-bottom: 50px; }
        .js-cat-header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
        .js-cat-header h2 { font-size: 20px; font-weight: 800; color: #1e293b; }
        
        .js-cat-header .blue { color: #3b82f6; }
        .js-cat-header .red { color: #ef4444; }
        .js-cat-header .orange { color: #f59e0b; }
        .js-cat-header .green { color: #10b981; }
        .js-cat-header .purple { color: #a855f7; }

        .js-faq-item {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-bottom: 12px;
          overflow: hidden;
          transition: all 0.2s;
        }
        .js-faq-item.active { border-color: #D63447; box-shadow: 0 4px 12px rgba(214,52,71,0.05); }
        
        .js-faq-question {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 25px;
          background: none;
          border: none;
          text-align: left;
          font-size: 16px;
          font-weight: 700;
          color: #334155;
          cursor: pointer;
        }
        .js-faq-item.active .js-faq-question { color: #D63447; }

        .js-faq-answer {
          padding: 0 25px 25px;
          color: #64748b;
          font-size: 15px;
          line-height: 1.6;
          white-space: pre-line;
        }

        .js-no-results { text-align: center; padding: 60px 0; color: #94a3b8; }
        .js-no-results h3 { color: #475569; margin-top: 15px; }

        .js-help-sidebar { display: flex; flex-direction: column; gap: 25px; position: sticky; top: 100px; }
        .js-contact-card {
          padding: 30px;
        }
        .js-contact-card h3 { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 10px; }
        .js-contact-card p { font-size: 14px; color: #64748b; margin-bottom: 25px; }

        .js-contact-links { display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px; }
        .js-contact-link {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: #f8fafc;
          border-radius: 12px;
          text-decoration: none;
          color: #475569;
          transition: all 0.2s;
        }
        .js-contact-link:hover { background: #eff6ff; color: #2563eb; }
        .js-link-text { display: flex; flex-direction: column; }
        .js-link-text strong { font-size: 14px; margin-bottom: 2px; }
        .js-link-text span { font-size: 12px; opacity: 0.8; }

        .js-support-hours { border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 12px; color: #94a3b8; }
        .js-support-hours strong { color: #475569; display: block; margin-bottom: 4px; }

        .js-safety-card {
          border: 1px solid #f5d0fe;
          border-radius: 16px;
          padding: 25px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .js-safety-card h4 { font-size: 16px; font-weight: 800; color: #701a75; }
        .js-safety-card p { font-size: 13px; color: #a21caf; }
        .js-btn-link { 
          background: none; border: none; padding: 0; color: #D63447; 
          font-weight: 700; font-size: 13px; cursor: pointer; width: fit-content;
        }

        .simple-footer {
          padding: 60px 0 40px;
          border-top: 1px solid #f1f5f9;
          margin-top: 40px;
          text-align: center;
          background: #fff;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-bottom: 25px;
          flex-wrap: wrap;
        }

        .footer-links a {
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: color 0.2s;
        }

        .footer-links a:hover {
          color: #D63447;
        }

        .footer-copyright {
          font-size: 13px;
          color: #94a3b8;
        }

        @media (max-width: 968px) {
          .js-faq-grid { grid-template-columns: 1fr; }
          .js-help-sidebar { position: static; }
          .footer-links { gap: 15px; flex-direction: column; }
        }
      `}} />
    </div>
  );
}
