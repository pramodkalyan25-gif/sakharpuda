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
          a: "Yes, registration, profile creation, and basic matchmaking (sending interests) are free. Some advanced features like viewing direct contact details are reserved for verified premium members."
        },
        {
          id: 'premium-benefits',
          q: 'What is the "Admin Verified" badge?',
          a: "The 'Admin Verified' badge is awarded to profiles that have been manually checked by our team for authenticity. Verified members often get more trust and higher response rates."
        },
        {
          id: 'contact-details',
          q: 'How can I see a member\'s phone number?',
          a: "For privacy, phone numbers are not shown publicly. You can request to view a member's contact details once you are 'Connected' (mutual interest). This request may require admin approval to ensure safety."
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
          a: "We use mobile OTP verification for all users and offer a manual 'Admin Verification' process. Additionally, you can report any suspicious profile directly to our support team at care@sakharpuda.com."
        },
        {
          id: 'privacy-controls-deep',
          q: 'Can I hide my profile or photos?',
          a: "Yes. In your Settings, you can set your Profile Visibility to 'Hidden' to take a break. You can also control your Photo Visibility so only members you have connected with can see your pictures."
        },
        {
          id: 'reporting',
          q: 'What should I do if I find a fake profile?',
          a: "Safety is our priority. Please report any fake or offensive profiles by emailing care@sakharpuda.com with the Profile ID. Our team will investigate and take action within 24 hours."
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
      {isAuthenticated ? <TopNav /> : (
        <header className="js-simple-header">
          <div className="container">
            <Link to="/" className="js-back-home">
              <ChevronLeft size={20} /> Back to Home
            </Link>
          </div>
        </header>
      )}
      
      <main className={`js-help-container ${!isAuthenticated ? 'full-width' : ''}`}>
        <section className="js-help-hero">
          <div className="container">
            <h1>Help Center</h1>
            <p>Your guide to finding the perfect match on SakharPuda.com</p>
            
            <div className="js-search-bar">
              <Search size={20} />
              <input 
                type="text" 
                placeholder="Search for questions (e.g. 'delete', 'photos', 'contact')..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="js-faq-section container">
          <div className="js-faq-grid">
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

            <aside className="js-help-sidebar">
              <div className="js-contact-card">
                <h3>Still need help?</h3>
                <p>Our SakharPuda Care team is available to assist you.</p>
                
                <div className="js-contact-links">
                  <a href="mailto:care@sakharpuda.com" className="js-contact-link">
                    <Mail size={18} />
                    <div className="js-link-text">
                      <strong>Email Us</strong>
                      <span>care@sakharpuda.com</span>
                    </div>
                  </a>
                  <a href="tel:+911234567890" className="js-contact-link">
                    <Smartphone size={18} />
                    <div className="js-link-text">
                      <strong>Call Us</strong>
                      <span>+91 123 456 7890</span>
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
                <button className="js-btn-link" onClick={() => navigate('/fraud-alert')}>Read Safety Tips</button>
              </div>
            </aside>
          </div>
        </section>
      </main>

      {!isAuthenticated && (
        <footer className="js-help-footer">
          <div className="container">
            <p>&copy; 2024 SakharPuda.com. All rights reserved.</p>
          </div>
        </footer>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .js-help-wrapper { min-height: 100vh; background: #f8fafc; }
        .js-help-container { padding-bottom: 80px; }
        .js-help-container.full-width { padding-top: 0; }

        .js-simple-header { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 15px 0; }
        .js-back-home { display: flex; align-items: center; gap: 8px; color: #64748b; text-decoration: none; font-weight: 600; font-size: 14px; }
        .js-back-home:hover { color: #D63447; }

        .js-help-hero {
          background: #D63447;
          color: #fff;
          padding: 80px 0;
          text-align: center;
          margin-bottom: 40px;
        }
        .js-help-hero h1 { font-size: 36px; font-weight: 800; margin-bottom: 15px; }
        .js-help-hero p { font-size: 18px; opacity: 0.9; margin-bottom: 40px; }

        .js-search-bar {
          max-width: 600px;
          margin: 0 auto;
          background: #fff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          padding: 0 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
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
          background: #fff;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
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
          background: #fdf2ff;
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

        .js-help-footer { background: #fff; border-top: 1px solid #e2e8f0; padding: 30px 0; text-align: center; }
        .js-help-footer p { font-size: 14px; color: #94a3b8; }

        @media (max-width: 968px) {
          .js-faq-grid { grid-template-columns: 1fr; }
          .js-help-sidebar { position: static; }
        }
      `}} />
    </div>
  );
}
