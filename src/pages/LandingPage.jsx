import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Search,
  Globe,
  User,
  UserCheck,
  Settings,
  ArrowRight,
  MessageCircle,
  Eye
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const observerRef = useRef(null);
  const stepsContainerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isStepsScrollable, setIsStepsScrollable] = useState(false);

  const handleStepsScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    if (scrollWidth <= clientWidth) return;
    
    const scrollPercentage = scrollLeft / (scrollWidth - clientWidth);
    
    let newIndex = 0;
    if (scrollPercentage < 0.33) newIndex = 0;
    else if (scrollPercentage < 0.66) newIndex = 1;
    else newIndex = 2;
    
    if (newIndex !== activeStep) {
      setActiveStep(newIndex);
    }
  };

  useEffect(() => {
    const checkScrollable = () => {
      if (stepsContainerRef.current) {
        setIsStepsScrollable(stepsContainerRef.current.scrollWidth > stepsContainerRef.current.clientWidth + 10);
      }
    };
    checkScrollable();
    window.addEventListener('resize', checkScrollable);

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const handleIntersect = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersect, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observerRef.current.observe(el));

    // Handle anchor scroll on load
    if (window.location.hash) {
      setTimeout(() => {
        const id = window.location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }

    return () => {
      window.removeEventListener('resize', checkScrollable);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="landing-wrapper">
      {/* PROFESSIONAL HEADER */}
      <header className="main-header">
        <div className="container header-content">
          <Link to="/" className="brand">
            <img src="/images/logo.png" alt="SakharPuda" className="logo-img" />
          </Link>
          <div className="header-actions">
            <span className="member-text">Already a member?</span>
            <Link to="/login" className="login-link">Login</Link>
            <div className="help-dropdown-container">
              <button className="help-trigger">
                Help <ChevronDown size={14} />
              </button>
              <div className="help-dropdown-menu">
                <div className="help-item header">Customer Support</div>
                <a href="mailto:sakharpuda@zohomail.com" className="help-item">
                  sakharpuda@zohomail.com
                </a>
                <Link to="/about" className="help-item">About Us</Link>
                <Link to="/contact" className="help-item">Contact Us</Link>
                <Link to="/fraud-alert" className="help-item">Safety Tips</Link>
                <Link to="/help" className="help-item">Help Center / FAQ</Link>
                <Link to="/grievances" className="help-item">Grievances</Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="container hero-content-rel">
          {/* Desktop: Full registration card */}
          <div className="registration-bar-right-wrapper desktop-only">
            <div className="search-bar-card registration-card vertical-reg-card">
              <div className="registration-form vertical-reg-form">
                <div className="reg-group">
                  <label className="reg-label">Religion *</label>
                  <select className="reg-input" required>
                    <option value="">Select Religion</option>
                    <option value="hindu">Hindu</option>
                    <option value="muslim">Muslim</option>
                    <option value="christian">Christian</option>
                    <option value="sikh">Sikh</option>
                    <option value="jain">Jain</option>
                    <option value="buddhist">Buddhist</option>
                  </select>
                </div>

                <div className="reg-group">
                  <label className="reg-label">Caste *</label>
                  <select className="reg-input" required>
                    <option value="">Select Caste</option>
                    <option value="maratha">Maratha</option>
                    <option value="brahmin">Brahmin</option>
                    <option value="kunbi">Kunbi</option>
                    <option value="teli">Teli</option>
                    <option value="mali">Mali</option>
                  </select>
                </div>

                <button className="register-free-btn-hero full-width-btn">Register for Free</button>

                <p className="reg-terms-tiny">
                  By clicking on 'Register Free', you confirm that you accept the
                  <span className="pink-text"> Terms of Use</span> and <span className="pink-text"> Privacy Policy</span>
                </p>
              </div>
            </div>
          </div>

          {/* Mobile: Simple CTA with tagline + button (Jeevansathi style) */}
          <div className="hero-mobile-cta mobile-only">
            <h2 className="hero-mobile-tagline">Built by a Maharashtrian, For Maharashtrians</h2>
            <p className="hero-mobile-subtitle">Because we truly understand our community, culture & values</p>
            <button className="hero-mobile-register-btn" onClick={() => navigate('/register')}>Register Free</button>
          </div>
        </div>
      </section>

      {/* TRUST SECTION - Overlapping with Hero */}
      <section className="trust-section-overlap">
        <div className="container">
          <div className="trust-tagline-container">
            <h2 className="tagline-main">Built by a Maharashtrian, For Maharashtrians</h2>
            <p className="tagline-sub">Because we truly understand our community, culture & values</p>
          </div>
          <div className="trust-card-main">
            {/* TRUST SECTION */}
            <div className="trust-header-section">
              <span className="banner-label">Smarter Matchmaking for</span>
              <h2 className="banner-title">Bringing People <span className="pink">Together</span></h2>
            </div>

            <div className="trust-features-section">
              <div className="trust-features-grid">
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg viewBox="0 0 64 64" width="60" height="60">
                      <path d="M20 40c-5.5 0-10 4.5-10 10v4h20v-4c0-5.5-4.5-10-10-10z" fill="none" stroke="#666" strokeWidth="2" />
                      <circle cx="20" cy="30" r="6" fill="none" stroke="#666" strokeWidth="2" />
                      <path d="M44 40c-5.5 0-10 4.5-10 10v4h20v-4c0-5.5-4.5-10-10-10z" fill="none" stroke="#666" strokeWidth="2" />
                      <circle cx="44" cy="30" r="6" fill="none" stroke="#666" strokeWidth="2" />
                      <circle cx="32" cy="20" r="8" fill="none" stroke="#666" strokeWidth="2" />
                      <path d="M32 32c-6.6 0-12 5.4-12 12v4h24v-4c0-6.6-5.4-12-12-12z" fill="none" stroke="#666" strokeWidth="2" />
                      <circle cx="52" cy="48" r="8" fill="#D9475C" />
                      <path d="M48 48l3 3 5-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3>100% Screened Profiles</h3>
                  <div className="pink-accent"></div>
                  <p>Search by location, community, profession & more from lakhs of active profiles</p>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">
                    <svg viewBox="0 0 64 64" width="60" height="60">
                      <path d="M32 4l20 8v16c0 12-8 23-20 28-12-5-20-16-20-28V12l20-8z" fill="none" stroke="#666" strokeWidth="2" />
                      <circle cx="32" cy="28" r="7" fill="none" stroke="#666" strokeWidth="2" />
                      <path d="M32 38c-5 0-9 4-9 8v2h18v-2c0-4-4-8-9-8z" fill="none" stroke="#666" strokeWidth="2" />
                    </svg>
                  </div>
                  <h3>Verifications by Personal Visit</h3>
                  <div className="pink-accent"></div>
                  <p>Special listing for profiles verified by our agents through personal visits</p>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">
                    <svg viewBox="0 0 64 64" width="60" height="60">
                      <circle cx="32" cy="24" r="8" fill="none" stroke="#666" strokeWidth="2" />
                      <path d="M32 36c-8 0-14 6-14 14v2h28v-2c0-8-6-14-14-14z" fill="none" stroke="#666" strokeWidth="2" />
                      <circle cx="50" cy="20" r="8" fill="#D9475C" />
                      <path d="M47 22v-2c0-1.7 1.3-3 3-3s3 1.3 3 3v2h1v4h-8v-4h1zm1 0h4v-2c0-1.1-.9-2-2-2s-2 .9-2 2v2z" fill="#fff" />
                    </svg>
                  </div>
                  <h3>Control over Privacy</h3>
                  <div className="pink-accent"></div>
                  <p>Restrict unwanted access to contact details & photos/videos</p>
                </div>
              </div>
            </div>



            {/* COMMUNITY USP SECTION */}
            <div className="community-usp-section">
              <div className="usp-content-wrapper">
                <div className="usp-text-side">
                  <div className="usp-point-block active">
                    <h2 className="section-title">Your <span className="pink">Community</span>, Your App</h2>
                    <p className="section-desc">
                      Experience a revolutionary way to find your life partner. SakharPuda adapts to your identity, creating a dedicated space for your specific religion and caste.
                    </p>
                    <div className="active-bar"></div>
                  </div>

                  <div className="usp-points-list">
                    <div className="usp-point-item">
                      <div className="usp-point-number">01</div>
                      <div className="usp-point-text">
                        <h4>Identity-Driven Transformation</h4>
                        <p>Once you login, the entire app transforms. Your dashboard and search results are filtered to match your community automatically.</p>
                      </div>
                    </div>

                    <div className="usp-point-item">
                      <div className="usp-point-number">02</div>
                      <div className="usp-point-text">
                        <h4>100% Relevant Matches</h4>
                        <p>Eliminate the clutter of irrelevant profiles. See only those who share your heritage, traditions, and core values.</p>
                      </div>
                    </div>

                    <div className="usp-point-item">
                      <div className="usp-point-number">03</div>
                      <div className="usp-point-text">
                        <h4>Privacy within a Walled Garden</h4>
                        <p>Enjoy the security of a niche community app with the power of a global platform. Total privacy for your community members.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="usp-image-side">
                  <div className="mobile-mockup-frame">
                    <div className="mockup-screen scrollable-side">
                      <div className="usp-mockup-slide" id="usp-slide-1">
                        <img src="/images/exclusive/Gemini_Generated_Image_e9s2bwe9s2bwe9s2.png" alt="Identity-Driven Transformation" />
                        <div className="floating-badge top-right animate-pop">
                          <span className="badge-icon red"><User size={14} /></span>
                          <span>Same Community Member</span>
                        </div>
                      </div>

                      <div className="usp-mockup-slide" id="usp-slide-2">
                        <img src="/images/exclusive/Gemini_Generated_Image_vs0bnvs0bnvs0bnv.png" alt="Relevant Matches" />
                        <div className="floating-badge top-left animate-pop">
                          <span className="badge-icon pink"><Settings size={14} /></span>
                          <span>Hyper-Relevant</span>
                        </div>
                      </div>

                      <div className="usp-mockup-slide" id="usp-slide-3">
                        <img src="/images/exclusive/Gemini_Generated_Image_yyl2ylyyl2ylyyl2.png" alt="Total Privacy" />
                        <div className="floating-badge top-right animate-pop">
                          <span className="badge-icon red"><ArrowRight size={14} /></span>
                          <span>Complete Privacy</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>



            {/* STEPS SECTION */}
            <div className="steps-inner-section">
              <span className="banner-label" style={{ textAlign: 'center', display: 'block' }}>THREE SIMPLE STEPS TO</span>
              <h2 className="section-title">Find the <span className="pink">One for You</span></h2>
              <div className="steps-grid" ref={stepsContainerRef} onScroll={handleStepsScroll}>
                <div className="step-item">
                  <div className="step-illustration">
                    <svg viewBox="0 0 200 120" width="180" height="100">
                      <rect x="20" y="20" width="160" height="80" rx="10" fill="#f0f0f0" />
                      <rect x="40" y="40" width="120" height="8" rx="4" fill="#e0e0e0" />
                      <rect x="40" y="60" width="120" height="8" rx="4" fill="#e0e0e0" />
                      <circle cx="100" cy="50" r="15" fill="#D9475C" fillOpacity="0.2" />
                      <path d="M90 50l7 7 15-15" stroke="#D9475C" strokeWidth="3" fill="none" />
                    </svg>
                  </div>
                  <p><span className="pink">01</span> Define Your Partner Preferences</p>
                </div>
                <div className="step-item">
                  <div className="step-illustration">
                    <svg viewBox="0 0 200 120" width="180" height="100">
                      <circle cx="100" cy="50" r="30" fill="#f0f0f0" />
                      <circle cx="100" cy="50" r="20" fill="none" stroke="#D9475C" strokeWidth="2" />
                      <line x1="115" y1="65" x2="135" y2="85" stroke="#D9475C" strokeWidth="4" strokeLinecap="round" />
                      <rect x="40" y="90" width="120" height="6" rx="3" fill="#e0e0e0" />
                    </svg>
                  </div>
                  <p><span className="pink">02</span> Browse Profiles</p>
                </div>
                <div className="step-item">
                  <div className="step-illustration">
                    <svg viewBox="0 0 200 120" width="180" height="100">
                      <rect x="40" y="30" width="120" height="60" rx="8" fill="#f0f0f0" />
                      <circle cx="70" cy="60" r="10" fill="#D9475C" />
                      <circle cx="130" cy="60" r="10" fill="#D9475C" fillOpacity="0.3" />
                      <path d="M100 60h20" stroke="#D9475C" strokeWidth="2" strokeDasharray="4 2" />
                      <path d="M100 50l10 10-10 10" stroke="#D9475C" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                  <p><span className="pink">03</span> Send Interests & Connect</p>
                </div>
              </div>
              <div className="btn-center" style={{ flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <button className="get-started-btn">Get Started by Registering Free</button>
                {isStepsScrollable && (
                  <div className="carousel-dots mobile-only" style={{ display: 'flex', gap: '8px' }}>
                    {[0, 1, 2].map((idx) => (
                      <span 
                        key={idx}
                        style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: activeStep === idx ? '#D9475C' : '#f0b4bd',
                          transition: 'background 0.3s ease'
                        }}
                      ></span>
                    ))}
                  </div>
                )}
              </div>
            </div>



            {/* MEMBERSHIP SECTION */}
            <div className="membership-inner-section" id="membership-section">
              <span className="banner-label" style={{ textAlign: 'center', display: 'block', marginBottom: '8px' }}>UPGRADE YOUR ACCOUNT</span>
              <h2 className="section-title"><span className="pink">Membership</span> Plans</h2>

              <div className="pricing-wrapper">
                <div className="price-card free-card">
                  <h3>Free</h3>
                  <ul className="benefits-list">
                    <li className="included">Browse Profiles</li>
                    <li className="included">Shortlist & Send Interest</li>
                    <li className="included">Message & chat with unlimited users</li>
                    <li className="excluded">Get up to 3x more matches daily</li>
                    <li className="excluded">Unlock access to advanced search</li>
                    <li className="excluded">View contact details</li>
                    <li className="excluded">Make unlimited voice and video calls</li>
                    <li className="excluded">Get 3 free Spotlights</li>
                  </ul>
                  <button className="register-free-btn">Register Free</button>
                </div>

                <div className="price-card paid-card">
                  <h3>Paid</h3>
                  <ul className="benefits-list">
                    <li className="included">Browse Profiles</li>
                    <li className="included">Shortlist & Send Interest</li>
                    <li className="included">Message & chat with unlimited users</li>
                    <li className="included">Get up to 3x more matches daily</li>
                    <li className="included">Unlock access to advanced search</li>
                    <li className="included">View contact details</li>
                    <li className="included">Make unlimited voice and video calls</li>
                    <li className="included">Get 3 free Spotlights</li>
                  </ul>
                  <button className="browse-plans-btn">Browse Membership Plans</button>
                </div>
              </div>
            </div>



            {/* EXCLUSIVE SECTION */}
            <div className="exclusive-inner-section" id="exclusive-section">
              <div className="exclusive-header">
                <span className="exclusive-label">PERSONALISED MATCH-MAKING SERVICE</span>
                <h2 className="section-title">Introducing <span className="pink">Exclusive</span></h2>
                <div className="exclusive-badge">EXCLUSIVE</div>
              </div>

              <div className="exclusive-image-container">
                <img src="/images/exclusive-banner-new.png" alt="Exclusive Service" className="exclusive-img" />
              </div>

              <div className="exclusive-features-grid">
                <div className="ex-feature">
                  <div className="ex-feature-top">
                    <div className="ex-icon-circle">
                      <User size={16} />
                    </div>
                    <h4>Meet Your Relationship Manager</h4>
                  </div>
                  <p>Connect with our highly experienced advisor who manages your profile.</p>
                </div>
                <div className="ex-feature">
                  <div className="ex-feature-top">
                    <div className="ex-icon-circle">
                      <Settings size={16} />
                    </div>
                    <h4>Communicate your preferences</h4>
                  </div>
                  <p>Consultation to understand your expectations in a prospective partner.</p>
                </div>
                <div className="ex-feature">
                  <div className="ex-feature-top">
                    <div className="ex-icon-circle">
                      <UserCheck size={16} />
                    </div>
                    <h4>Choose from handpicked profiles</h4>
                  </div>
                  <p>We shortlist profiles matching your criteria for offline interactions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER SECTION */}
      <footer className="main-footer">
        <div className="container">
          <div className="footer-intro">
            <img src="/images/logo.png" alt="SakharPuda" className="footer-logo" />
            <p>
              SakharPuda.com is one of the leading and most trusted community-driven matrimony platforms in India.
              We understand that finding the right partner involves deep cultural and community alignment.
              SakharPuda adapts to your identity, creating a dedicated space for your specific religion and caste.
              We ensure a secure and convenient matchmaking experience with 100% screening, exclusive privacy options,
              and identity-driven search filters. Whether you are looking for a deeper connection within your community
              or a professional match-making service, SakharPuda is here to make your journey easier.
            </p>
            <p className="footer-note">
              Please note: SakharPuda is only meant for users with a bonafide intent to enter into a matrimonial alliance
              and is not meant for users interested in dating only. SakharPuda platform should not be used to post any obscene material.
            </p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>Services</h4>
              <a href="#membership-section">Membership Options</a>
              <a href="#exclusive-section">SakharPuda Exclusive</a>
            </div>
            <div className="footer-col">
              <h4>Help</h4>
              <Link to="/contact">Contact us</Link>
              <Link to="/fraud-alert">Safety Tips</Link>
              <Link to="/help">Help Center</Link>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <Link to="/about">About Us</Link>
              <Link to="/fraud-alert">Fraud Alert</Link>
              <Link to="/terms">Terms of use</Link>
              <Link to="/privacy">Privacy policy</Link>
              <Link to="/privacy">Cookie policy</Link>
              <Link to="/grievances">Grievances</Link>
            </div>
            <div className="footer-col">
              <div className="footer-widget">
                <p className="widget-title">Browse profiles on the go, using the app</p>
                <div className="app-download-btns">
                  <div className="app-badge">
                    <span className="badge-icon">▶</span>
                    <div className="badge-text">
                      <span className="tiny">GET IT ON</span>
                      <span className="bold">Google Play</span>
                    </div>
                  </div>
                  <div className="app-badge">
                    <span className="badge-icon"></span>
                    <div className="badge-text">
                      <span className="tiny">Download on the</span>
                      <span className="bold">App Store</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="footer-widget">
                <p className="widget-title">Connect with us</p>
                <div className="social-links">
                  <a href="#" className="social-link instagram"><MessageCircle size={18} /></a>
                  <a href="#" className="social-link youtube"><MessageCircle size={18} /></a>
                  <a href="#" className="social-link twitter"><MessageCircle size={18} /></a>
                  <a href="#" className="social-link linkedin"><MessageCircle size={18} /></a>
                  <a href="#" className="social-link facebook"><MessageCircle size={18} /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cabin:wght@400;500;600;700&display=swap');

        .landing-wrapper {
          font-family: 'Cabin', sans-serif;
          background: #f8f9fa;
          color: #4A5568; /* Slate-600 for general body text */
          line-height: 1.4;
        }

        .landing-wrapper input, 
        .landing-wrapper select, 
        .landing-wrapper button, 
        .landing-wrapper textarea {
          font-family: 'Cabin', sans-serif;
        }

        .main-header .container, .hero-section .container {
          max-width: 1400px;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .pink { color: #D9475C; } /* Precise Jeevansathi Red */

        .main-header {
          background: #f0f2f5;
          padding: 8px 0;
          border-bottom: 1px solid #ddd;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px; /* Wider for full spread */
          margin: 0 auto;
          padding: 0 60px; /* Space from left/right */
        }

        .logo-img {
          height: 32px;
          display: block;
        }

        .header-actions {
          display: flex;
          align-items: center;
        }

        .member-text {
          font-size: 14px;
          color: #718096;
          margin-right: 15px;
          font-weight: 500;
        }

        .login-link {
          background: #D9475C;
          color: #fff;
          padding: 6px 16px; /* Reduced from 10px 30px */
          border: none;
          border-radius: 4px; /* Standardized with other buttons */
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          display: inline-block;
        }

        .login-link:hover {
          background: #D4284D;
          color: #fff;
          transform: translateY(-1px);
        }

        .help-dropdown-container {
          position: relative;
          margin-left: 20px;
          display: inline-block;
        }

        .help-trigger {
          background: none;
          border: none;
          color: #4A5568;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 0;
          transition: color 0.2s;
        }

        .help-trigger:hover {
          color: #D9475C;
        }

        .help-dropdown-menu {
          display: none;
          position: absolute;
          top: 100%;
          right: 0;
          background: #fff;
          min-width: 220px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border-radius: 8px;
          padding: 8px 0;
          z-index: 1001;
          border: 1px solid #eee;
          margin-top: 5px; /* Reduced gap */
        }

        /* Bridge the hover gap */
        .help-dropdown-menu::before {
          content: '';
          position: absolute;
          top: -15px;
          left: 0;
          width: 100%;
          height: 15px;
          background: transparent;
        }

        .help-dropdown-container:hover .help-dropdown-menu {
          display: block;
        }

        .help-item {
          display: block;
          padding: 10px 20px;
          color: #4A5568;
          text-decoration: none;
          font-size: 13px;
          transition: background 0.2s;
          cursor: pointer;
        }

        .help-item:hover {
          background: #f7f8f9;
          color: #D9475C;
        }

        .help-item.header {
          font-weight: 700;
          color: #1A202C;
          border-bottom: 1px solid #eee;
          margin-bottom: 5px;
          cursor: default;
        }

        .help-item.header:hover {
          background: none;
          color: #1A202C;
        }

        .hero-section {
          min-height: 580px;
          background: 
            linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), 
            url('/images/hero-bg-final.png') left center / cover no-repeat;
          position: relative;
          display: flex;
          align-items: center;
          color: #fff;
          overflow: hidden;
        }

        .hero-content-rel {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          z-index: 2;
        }

        /* Visibility helpers */
        .desktop-only { display: flex; }
        .mobile-only { display: none; }

        /* Mobile Hero CTA (Jeevansathi style) */
        .hero-mobile-cta {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          text-align: center;
          padding: 0 20px 40px;
          background: linear-gradient(transparent, rgba(0,0,0,0.7));
          flex-direction: column;
          align-items: center;
        }

        .hero-mobile-tagline {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
          line-height: 1.2;
        }

        .hero-mobile-subtitle {
          font-size: 15px;
          color: rgba(255,255,255,0.9);
          margin: 0 0 20px;
          text-shadow: 0 1px 5px rgba(0,0,0,0.4);
        }

        .hero-mobile-register-btn {
          background: #D9475C;
          color: #fff;
          border: none;
          padding: 14px 50px;
          font-size: 16px;
          font-weight: 700;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
          box-shadow: 0 4px 15px rgba(217,71,92,0.4);
        }

        .hero-mobile-register-btn:hover {
          background: #c53a4d;
          transform: translateY(-2px);
        }

        .registration-bar-right-wrapper {
          flex: 0 1 auto;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-top: -130px;
        }

        .vertical-reg-card {
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(5px);
          padding: 25px 30px;
          border-radius: 12px;
          width: 285px !important; /* Force reduction to 3/4th */
          color: #fff;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .vertical-reg-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .reg-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .reg-label {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
        }

        .reg-terms-tiny {
          font-size: 11px;
          opacity: 0.8;
          margin-top: 10px;
          line-height: 1.4;
        }

        .reg-input {
          height: 44px;
          padding: 0 12px;
          border-radius: 4px;
          border: 1px solid #ddd;
          background: #fff;
          color: #333;
          width: 100%;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
        }

        .reg-input option {
          background: #fff;
          color: #333;
        }

        .hero-tagline {
          font-size: 30px;
          font-weight: 700;
          color: #000000ff; /* Brand pink color */
          line-height: 1.2;
          margin: 0;
          max-width: 600px;
        }

        .registration-card {
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(5px);
          padding: 25px;
          border-radius: 8px;
          width: 100%;
          color: #fff;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .registration-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }



        .mobile-input-wrapper {
          display: flex;
          background: #fff;
          border-radius: 4px;
          overflow: hidden;
        }

        .country-code {
          padding: 8px 10px;
          background: #f8f9fa;
          color: #333;
          font-size: 14px;
          border-right: 1px solid #ddd;
          display: flex;
          align-items: center;
        }

        .tel-input {
          border: none;
        }

        .password-input-wrapper {
          position: relative;
        }

        .eye-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #718096;
          cursor: pointer;
        }

        .register-free-btn-hero {
          background: #D9475C;
          color: #fff;
          padding: 12px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
          box-sizing: border-box;
          display: block;
        }

        .reg-terms {
          font-size: 10px;
          color: #fff;
          opacity: 0.8;
          text-align: left;
          line-height: 1.4;
        }

        .pink-text {
          color: #D9475C;
          cursor: pointer;
        }

        .trust-tagline-container {
          text-align: left;
          margin-bottom: 20px; /* Reduced from 40px */
          color: #fff;
          padding-left: 31px;
        }

        .tagline-main {
          font-size: 42px;
          font-weight: 500; /* Reduced from 800 */
          margin-bottom: 12px;
          letter-spacing: -1px;
          color: #fff;
          text-shadow: 0 4px 15px rgba(0,0,0,0.7);
        }

        .tagline-sub {
          font-size: 20px;
          font-weight: 400; /* Reduced from 600 */
          opacity: 0.95;
          max-width: 800px;
          color: #fff;
          text-shadow: 0 2px 10px rgba(0,0,0,0.6);
        }

        /* TRUST SECTION OVERLAP */
        .trust-section-overlap {
          position: relative;
          margin-top: -280px; /* Adjusted for increased hero height */
          z-index: 10;
          padding-bottom: 60px;
        }

        .trust-card-main {
          background: #fff;
          border-radius: 12px;
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          box-sizing: border-box;
          overflow: hidden; /* To ensure backgrounds don't bleed out of corners */
        }

        .card-inner-section, .steps-inner-section, .membership-inner-section, .exclusive-inner-section {
          padding: 60px 40px;
          background: #fff; /* Default to white */
        }

        .trust-header-section {
          padding: 40px 80px 20px; /* Reduced top padding for visibility */
          background: #fff;
        }

        .trust-features-section {
          padding: 0 80px 60px; /* Aligned to 80px standard */
          background: #fff;
        }

        .community-usp-section {
          padding: 0;
          background: #f5f7f9; /* Distinguishable dark background */
        }

        .steps-inner-section {
          padding: 80px 80px; /* Aligned to 80px standard */
          background: #fff;
        }

        .membership-inner-section {
          background: linear-gradient(to bottom, #f5f7f9 75%, #2c3e50 75%);
          padding: 80px 40px;
        }

        .exclusive-inner-section {
          background: #fff;
          padding: 40px 40px 80px;
          text-align: left;
        }

        .usp-content-wrapper {
          display: flex;
          align-items: stretch;
          width: 100%;
          margin: 0;
          background: transparent;
          overflow: hidden;
          min-height: 600px;
        }

        .usp-text-side {
          flex: 1.2;
          text-align: left;
          padding: 60px 80px; /* Aligned to 80px standard */
          overflow: hidden;
        }

        .usp-image-side {
          flex: 1;
          position: relative;
          height: 100%;
          background: #f5f7f9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-mockup-frame {
          width: 300px;
          height: 580px;
          background: #fff;
          border-radius: 40px;
          border: 8px solid #fff;
          box-shadow: 0 30px 60px rgba(0,0,0,0.12);
          position: relative;
          overflow: hidden;
          z-index: 5;
        }

        .mockup-screen.scrollable-side {
          width: 100%;
          height: 100%;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
        }

        .mockup-screen.scrollable-side::-webkit-scrollbar {
          display: none;
        }

        .usp-mockup-slide {
          position: relative;
          width: 100%;
          height: 580px; /* Match mockup height */
          flex-shrink: 0;
        }

        .usp-mockup-slide img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 30px;
        }

        .usp-point-block {
          position: relative;
          padding-bottom: 20px;
        }

        .usp-point-block.active .section-title {
          color: #333;
        }

        .active-bar {
          width: 60px;
          height: 4px;
          background: #D9475C;
          margin-top: 10px;
        }

        .usp-points-list {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .usp-point-item {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          min-height: auto;
          padding: 0;
        }

        .usp-point-number {
          font-size: 24px;
          font-weight: 800;
          color: rgba(214, 52, 71, 0.15);
          line-height: 1;
          margin-top: 4px;
        }

        .usp-point-text h4 {
          font-size: 16px; /* Reduced from 18px */
          color: #333;
          margin: 0 0 8px 0;
          font-weight: 500; 
        }

        .usp-point-text p {
          font-size: 13px; /* Reduced from 14px */
          color: #666;
          line-height: 1.6;
          margin: 0;
        }

        /* FLOATING ELEMENTS WITH ANIMATIONS */

        /* FLOATING ELEMENTS WITH ANIMATIONS */
        .floating-badge, .floating-message {
          position: absolute;
          background: #fff;
          padding: 10px 15px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          z-index: 10;
          font-size: 11px;
          font-weight: 500; /* Reduced from 600 */
          color: #333;
          white-space: nowrap;
          pointer-events: none;
        }

        .animate-pop {
          animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }

        .animate-slide {
          animation: slideIn 0.8s ease-out both;
        }

        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes slideIn {
          0% { transform: translateX(-30px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }

        .badge-icon, .message-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .badge-icon.red { background: #D9475C; }
        .badge-icon.pink { background: #D9475C; }
        .message-icon { background: rgba(214, 52, 71, 0.1); color: #D9475C; }

        .floating-badge.top-right { top: 20px; right: 15px; }
        .floating-badge.top-left { top: 20px; left: 15px; }
        .floating-badge.bottom-right { bottom: 40px; right: 15px; }
        .floating-message.left-center { top: 40%; left: -80px; width: 220px; padding: 12px 18px; border-radius: 30px; font-size: 12px; }

        @media (max-width: 992px) {
          .usp-content-wrapper { flex-direction: column; }
          .usp-image-side { order: -1; }
          .floating-message.left-center { left: 0; width: 180px; }
        }

        .exclusive-inner-section {
          background: #fff;
          padding: 80px 40px;
          text-align: left;
        }

        .exclusive-inner-section .section-title {
          color: #333;
        }



        /* EXCLUSIVE SECTION STYLES */
        .exclusive-header {
          margin-bottom: 15px; /* Reduced from 30px */
          text-align: center;
        }

        .exclusive-label {
          font-size: 14px; /* Reverted to professional label size */
          font-weight: 600;
          color: #7a8a99;
          letter-spacing: 1px;
          display: block;
          margin: 0 auto 5px;
          text-transform: uppercase;
        }

        .exclusive-badge {
          display: inline-block;
          background: #D9475C;
          color: #fff;
          font-size: 11px; /* Reduced from 12px */
          font-weight: 700;
          padding: 4px 15px;
          border-radius: 4px;
          margin: 0 auto;
          text-transform: uppercase;
        }

        .exclusive-image-container {
          max-width: 900px;
          height: auto;
          max-height: 530px;
          margin: 0 auto 40px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }

        .exclusive-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center; /* Anchored to top to crop bottom */
          display: block;
        }

        .exclusive-features-grid {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 40px; /* Reduced from 80px */
          gap: 0;
        }

        .ex-feature {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 0 20px 0 0; /* Reduced from 40px */
          text-align: left;
          position: relative;
        }

        .ex-feature:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 1px;
          background: #eee;
        }

        .ex-feature-top {
          display: flex;
          align-items: center; /* Changed from flex-start for single-line alignment */
          gap: 12px;
          margin-bottom: 10px;
        }

        .ex-icon-circle {
          width: 24px; /* Reduced from 28px */
          height: 24px; /* Reduced from 28px */
          background: #D9475C;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ex-icon-circle svg {
          width: 13px; /* Reduced from 16px */
          height: 13px; /* Reduced from 16px */
          color: #fff;
        }

        .ex-feature h4 {
          font-size: 15px; /* Reduced to fit in one line */
          font-weight: 500;
          color: #1A202C;
          margin: 0;
        }

        .ex-feature p {
          font-size: 13px;
          color: #4A5568;
          line-height: 1.5;
          margin: 0;
          font-weight: 400;
          padding-left: 36px; /* 24px icon + 12px gap to align under heading */
        }

        .banner-label {
          font-size: 12px;
          font-weight: 700;
          color: #718096;
          letter-spacing: 1.2px;
          display: block;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .banner-title {
          font-family: 'Cabin', sans-serif;
          font-size: 28px; /* Reduced from 36px */
          font-weight: 400; /* Lightest weight supported by Cabin */
          color: #1a202c;
          line-height: 1.2;
          margin: 0;
        }

        .banner-title .pink {
          font-weight: 400; /* Matching title weight */
          color: #D9475C;
        }

        .trust-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .feature-item {
          text-align: left; /* Restored to left alignment */
          padding: 20px 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start; /* Restored to left alignment */
        }

        .feature-icon {
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: flex-start; /* Restored to left alignment */
        }

        .feature-item h3 {
          font-size: 16px; /* Reduced from 18px */
          font-weight: 500;
          color: #1A202C;
          margin-bottom: 8px;
        }

        .pink-accent {
          width: 40px;
          height: 3px;
          background: #D9475C;
          margin: 0 0 10px 0; /* Restored to left alignment */
        }

        .feature-item p {
          font-size: 13px; /* Reduced from 14px */
          color: #4A5568;
          line-height: 1.4;
          font-weight: 400;
        }

        /* SECTION TITLES */
        .section-title {
          font-size: 28px; /* Matched to Banner Title refined size */
          font-weight: 400; /* Matched to Banner Title refined weight */
          color: #2D3748;
          text-align: left;
          margin-bottom: 30px;
          line-height: 1.2; /* Matched to banner-title */
        }

        .section-title .pink {
          font-weight: 400;
          color: #D9475C;
        }

        .section-desc {
          text-align: left;
          max-width: 800px;
          margin: 0 0 40px;
          color: #4A5568;
          font-size: 13px; /* Matched to Card body text */
          line-height: 1.6;
          font-weight: 400;
        }

        .membership-inner-section .section-title {
          text-align: center;
          margin-bottom: 10px; /* Reduced from 30px */
        }

        .membership-inner-section .section-desc {
          text-align: center;
          margin-left: auto;
          margin-right: auto;
        }

        .exclusive-inner-section .section-title {
          text-align: center;
          margin: 0 auto 10px;
        }

        /* CARD INNER SECTIONS */
        .card-inner-section {
          padding: 60px 0;
        }



        .btn-center {
          display: flex;
          justify-content: center;
          margin-top: 40px;
        }

        /* STEPS GRID (INSIDE CARD) */
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          text-align: left;
        }

        .step-item p {
          font-size: 13px; /* Matched to Trust Card description size */
          font-weight: 400; /* Matched to Trust Card weight */
          color: #333;
          margin-top: 15px;
        }

        .step-item p span {
          color: #D9475C;
          margin-right: 5px;
        }

        .step-illustration {
          display: flex;
          justify-content: flex-start;
          height: 100px;
          align-items: center;
        }
        
        .get-started-btn {
          background: #D9475C;
          color: #fff;
          padding: 12px 40px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }

        .get-started-btn:hover {
          background: #b52a3a;
        }

        /* MEMBERSHIP (INSIDE CARD) */
        .pricing-wrapper {
          display: flex;
          justify-content: center;
          align-items: stretch;
          gap: 0;
          margin-top: 20px;
        }
        
        .price-card {
          background: #fff;
          padding: 40px 80px;
          width: 100%;
          max-width: 500px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          position: relative;
          z-index: 1;
          border: 1px solid #f0f0f0;
          text-align: left;
        }

        .free-card {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          margin-right: -10px;
          padding-right: 40px;
        }

        .paid-card {
          background: #D9475C;
          color: #fff;
          z-index: 2;
          box-shadow: 0 20px 50px rgba(214,52,71,0.2);
          transform: translateY(-10px);
          border: none;
        }

        .price-card h3 {
          font-size: 20px; /* Reduced from 24px */
          margin-bottom: 25px;
          position: relative;
          font-weight: 500;
        }

        .price-card h3::before {
          content: '';
          display: block;
          width: 30px;
          height: 3px;
          background: currentColor;
          margin-bottom: 10px;
          opacity: 0.5;
        }

        .benefits-list {
          list-style: none;
          padding: 0;
          margin-bottom: 30px;
        }

        .benefits-list li {
          font-size: 13px;
          margin-bottom: 12px;
          padding-left: 25px;
          position: relative;
          text-align: left;
        }

        .benefits-list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 2px;
          width: 16px;
          height: 16px;
          background-size: contain;
          background-repeat: no-repeat;
        }

        .free-card .included::before {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23D9475C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23D9475C'/%3E%3Cpolyline points='8 12 11 15 16 9' stroke='white'/%3E%3C/svg%3E");
        }

        .free-card .excluded::before {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23A0AEC0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='15' y1='9' x2='9' y2='15'/%3E%3Cline x1='9' y1='9' x2='15' y2='15'/%3E%3C/svg%3E");
        }
        
        .free-card .excluded {
          color: #718096;
        }

        .paid-card .included::before {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolyline points='8 12 11 15 16 9'/%3E%3C/svg%3E");
        }

        .register-free-btn {
          width: 100%;
          background: #D9475C;
          color: #fff;
          padding: 10px;
          border: none;
          border-radius: 4px;
          font-weight: 700;
          cursor: pointer;
        }

        .browse-plans-btn {
          width: 100%;
          background: #fff;
          color: #D9475C;
          padding: 10px;
          border: none;
          border-radius: 4px;
          font-weight: 700;
          cursor: pointer;
        }
        /* FOOTER */
        .main-footer {
          background: #f1f3f6;
          padding: 60px 0;
          color: #4A5568;
          border-top: 1px solid #e2e8f0;
        }

        .footer-intro {
          margin-bottom: 50px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 30px;
        }

        .footer-logo {
          height: 30px;
          margin-bottom: 20px;
          opacity: 0.8;
        }

        .footer-intro p {
          font-size: 13px;
          line-height: 1.6;
          max-width: 100%;
          margin-bottom: 15px;
          color: #718096;
        }

        .footer-intro .footer-note {
          font-size: 12px;
          color: #a0aec0;
        }

        .footer-links-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .footer-col h4 {
          font-size: 14px;
          font-weight: 500;
          color: #2D3748;
          margin-bottom: 20px;
          text-transform: uppercase;
        }

        .footer-col a {
          display: block;
          font-size: 13px;
          color: #718096;
          text-decoration: none;
          margin-bottom: 12px;
          transition: color 0.2s;
        }

        .footer-col a:hover {
          color: #D9475C;
          text-decoration: underline;
        }

        .footer-widget {
          margin-bottom: 30px;
        }

        .widget-title {
          font-size: 11px;
          font-weight: 600;
          color: #718096;
          margin-bottom: 15px;
        }

        .app-download-btns {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .app-badge {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
          width: fit-content;
        }

        .app-badge:hover {
          background: #f7fafc;
          border-color: #cbd5e0;
          transform: translateY(-2px);
        }

        .badge-text {
          display: flex;
          flex-direction: column;
        }

        .badge-text .tiny {
          font-size: 9px;
          color: #a0aec0;
        }

        .badge-text .bold {
          font-size: 13px;
          font-weight: 700;
          color: #2D3748;
        }

        .social-links {
          display: flex;
          gap: 15px;
        }

        .social-link {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          transition: transform 0.2s;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .social-link:hover {
          transform: scale(1.1);
        }

        .social-link.instagram { background: #e1306c; }
        .social-link.youtube { background: #ff0000; }
        .social-link.twitter { background: #1da1f2; }
        .social-link.linkedin { background: #0077b5; }
        .social-link.facebook { background: #4267b2; }

        /* =============================================================
           RESPONSIVE DESIGN — COMPLETE COVERAGE
           Breakpoints: 1400 → 1200 → 992 → 768 → 480
           ============================================================= */

        /* ---------- LARGE DESKTOP (≤ 1400px) ---------- */
        @media (max-width: 1400px) {
          .header-content { padding: 0 40px; }
        }

        /* ---------- SMALL DESKTOP / LARGE TABLET (≤ 1200px) ---------- */
        @media (max-width: 1200px) {
          .header-content { padding: 0 30px; }
          .trust-header-section { padding: 40px 40px 20px; }
          .trust-features-section { padding: 0 40px 40px; }
          .usp-text-side { padding: 40px; }
          .steps-inner-section { padding: 60px 40px; }
          .price-card { padding: 30px 40px; }
        }

        /* ---------- TABLET (≤ 992px) ---------- */
        @media (max-width: 992px) {
          /* --- Header --- */
          .header-content { padding: 0 20px; }
          .member-text { display: none; }

          /* --- Hero --- */
          .hero-section {
            height: auto;
            min-height: 480px;
            padding: 50px 0;
          }
          .hero-content-rel {
            flex-direction: column;
            text-align: center;
            justify-content: center;
          }
          .registration-bar-right-wrapper {
            margin-top: 0;
            justify-content: center;
            width: 100%;
          }
          .vertical-reg-card {
            width: 100% !important;
            max-width: 340px;
            margin: 0 auto;
          }

          /* --- Tagline & Trust overlap --- */
          .trust-section-overlap { margin-top: -80px; }
          .trust-tagline-container {
            text-align: center;
            padding-left: 0;
            padding: 0 20px;
          }
          .tagline-main { font-size: 30px; }
          .tagline-sub { font-size: 16px; }

          /* --- Trust card sections --- */
          .trust-card-main { margin: 0 15px; }
          .trust-header-section { padding: 30px 25px 15px; text-align: center; }
          .trust-features-section { padding: 0 25px 40px; }
          .trust-features-grid { grid-template-columns: 1fr; gap: 20px; }
          .feature-item { align-items: center; text-align: center; }
          .feature-icon { justify-content: center; }
          .pink-accent { margin: 0 auto 10px; }

          /* --- USP / Community section --- */
          .usp-content-wrapper {
            flex-direction: column;
            height: auto;
          }
          .usp-text-side {
            text-align: center;
            padding: 40px 25px;
          }
          .section-title { text-align: center; }
          .section-desc { text-align: center; margin-left: auto; margin-right: auto; }
          .active-bar { margin: 10px auto 0; }
          .usp-points-list { align-items: center; }
          .usp-point-item {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .usp-image-side {
            width: 100%;
            height: auto;
            min-height: 500px;
          }

          /* --- Steps --- */
          .steps-inner-section { padding: 50px 25px; }
          .steps-grid { grid-template-columns: 1fr; gap: 30px; }
          .step-item { text-align: center; }
          .step-illustration { justify-content: center; }

          /* --- Membership --- */
          .membership-inner-section { padding: 50px 25px; }
          .pricing-wrapper {
            flex-direction: column;
            align-items: center;
            gap: 25px;
          }
          .free-card, .paid-card {
            border-radius: 12px !important;
            margin: 0 !important;
            width: 100%;
            max-width: 420px;
            transform: none !important;
            padding: 30px;
          }
          .free-card { padding-right: 30px; }

          /* --- Exclusive --- */
          .exclusive-inner-section { padding: 50px 25px; }
          .exclusive-image-container {
            height: auto;
            max-height: 350px;
          }
          .exclusive-features-grid {
            flex-direction: column;
            gap: 25px;
            padding: 0;
          }
          .ex-feature {
            padding: 0 0 25px;
            align-items: flex-start;
            text-align: left;
            border-bottom: 1px solid #eee;
          }
          .ex-feature:last-child { border-bottom: none; padding-bottom: 0; }
          .ex-feature::after { display: none !important; }
          .ex-feature p { padding-left: 36px; }
          .ex-feature-top { justify-content: flex-start; }

          /* --- Footer --- */
          .main-footer { padding: 40px 0; }
          .footer-links-grid { grid-template-columns: repeat(2, 1fr); gap: 30px; }
        }

        /* ---------- SMALL TABLET / LARGE PHONE (≤ 768px) ---------- */
        @media (max-width: 768px) {
          /* --- Swap desktop form for mobile CTA --- */
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }

          /* --- Typography scale-down --- */
          .section-title, .banner-title { font-size: 22px; }
          .section-desc { font-size: 13px; }

          /* --- Hero: Full image with CTA at bottom --- */
          .hero-section {
            min-height: 450px;
            padding: 0;
            background-position: 35% center;
            align-items: flex-end;
          }
          .hero-content-rel {
            position: static;
            justify-content: center;
          }

          /* --- Hide the trust tagline (it's now inside the hero) --- */
          .trust-tagline-container { display: none; }
          .trust-section-overlap {
            margin-top: 0;
            padding-bottom: 30px;
          }
          .trust-section-overlap .container {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .trust-card-main {
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
            border: none !important;
          }

          /* --- Trust / features (Left aligned flex row) --- */
          .trust-features-grid { display: flex; flex-direction: column; gap: 20px; }
          .feature-item { 
            display: flex; 
            flex-direction: row; 
            align-items: flex-start; 
            text-align: left; 
            gap: 20px; 
            padding: 10px 0; 
          }
          .feature-icon { margin-bottom: 0; flex-shrink: 0; }
          .feature-item h3 { margin-bottom: 5px; font-size: 16px; }
          .feature-item p { font-size: 13px; margin-bottom: 0; }
          .pink-accent { display: none; }

          /* --- Steps Grid (Horizontal scroll) --- */
          .steps-grid {
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
            gap: 15px;
            padding-bottom: 20px;
            justify-content: flex-start;
          }
          .steps-grid::-webkit-scrollbar { display: none; }
          .step-item {
            min-width: 80%;
            scroll-snap-align: start;
            background: #fff;
            padding: 25px;
            border-radius: 12px;
            border: 1px solid #eee;
            box-shadow: 0 4px 15px rgba(0,0,0,0.03);
            text-align: center;
          }
          .step-illustration {
            justify-content: center;
            margin-bottom: 15px;
          }
          
          /* --- Membership Pricing Wrapper (Horizontal scroll) --- */
          .pricing-wrapper {
            display: flex;
            flex-direction: row;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
            padding-bottom: 20px;
            gap: 15px;
            align-items: flex-start;
            justify-content: flex-start;
          }
          .pricing-wrapper::-webkit-scrollbar { display: none; }
          .price-card {
            min-width: 85%;
            max-width: 85%;
            scroll-snap-align: start;
            border-radius: 12px;
            transform: none !important;
            margin: 0 !important;
            padding: 30px;
          }

          /* --- USP mockup --- */
          .mobile-mockup-frame { width: 260px; height: 460px; }
          .usp-mockup-slide { height: 460px; }
          .usp-image-side { min-height: 420px; }

          /* --- Exclusive image & grid --- */
          .exclusive-image-container { max-height: 280px; }
          .exclusive-features-grid {
            flex-direction: column;
            gap: 30px;
            padding: 0;
          }
          .ex-feature {
            padding: 0;
            width: 100%;
          }
          .ex-feature:not(:last-child)::after {
            display: none;
          }

          /* --- Footer --- */
          .footer-intro p { font-size: 12px; }
          .footer-links-grid {
            grid-template-columns: auto auto auto;
            justify-content: space-between;
            gap: 15px;
            text-align: left;
          }
          .footer-col h4 { font-size: 14px; margin-bottom: 12px; }
          .footer-col a { font-size: 12px; margin-bottom: 8px; }
          .footer-col:nth-child(4) {
            grid-column: span 3;
            margin-top: 15px;
            text-align: center;
          }
        }

        /* ---------- MOBILE (≤ 480px) ---------- */
        @media (max-width: 480px) {
          /* --- Header --- */
          .header-content { padding: 0 12px; }
          .logo-img { height: 26px; }
          .login-link { padding: 5px 10px; font-size: 12px; }
          .help-trigger { font-size: 12px; }
          .help-dropdown-container { margin-left: 12px; }

          /* --- Hero --- */
          .hero-section { min-height: 350px; padding: 0; background-position: 30% center; }
          .hero-mobile-tagline { font-size: 22px; }
          .hero-mobile-subtitle { font-size: 13px; }
          .hero-mobile-register-btn { padding: 12px 40px; font-size: 15px; }
          .hero-mobile-cta { padding: 0 15px 30px; }

          /* --- Typography --- */
          .section-title, .banner-title { font-size: 20px; }
          .section-desc { font-size: 12px; }
          .banner-label { font-size: 10px; }

          /* --- Trust / features --- */
          .trust-header-section { padding: 25px 15px 10px; }
          .trust-features-section { padding: 0 15px 30px; }
          .feature-icon svg { width: 48px; height: 48px; }
          .feature-item h3 { font-size: 15px; }
          .feature-item p { font-size: 12px; }

          /* --- USP --- */
          .usp-text-side { padding: 30px 15px; }
          .usp-point-text h4 { font-size: 14px; }
          .usp-point-text p { font-size: 12px; }
          .usp-point-number { font-size: 20px; }
          .mobile-mockup-frame { width: 230px; height: 385px; }
          .usp-mockup-slide { height: 385px; }
          .usp-image-side { min-height: 350px; }

          /* --- Steps --- */
          .steps-inner-section { padding: 30px 15px; }
          .step-illustration svg { width: 140px; height: 80px; }

          /* --- Membership --- */
          .membership-inner-section { padding: 30px 15px; }
          .price-card { padding: 25px 20px; }
          .price-card h3 { font-size: 18px; }
          .benefits-list li { font-size: 12px; margin-bottom: 10px; }

          /* --- Exclusive --- */
          .exclusive-inner-section { padding: 30px 15px; }
          .exclusive-label { font-size: 11px; }
          .exclusive-image-container { max-height: 200px; margin-bottom: 25px; }
          .ex-feature h4 { font-size: 14px; }
          .ex-feature p { font-size: 12px; }

          /* --- Footer --- */
          .main-footer { padding: 30px 0; }
          .footer-intro { margin-bottom: 30px; padding-bottom: 20px; }
          .footer-logo { height: 22px; }
          .footer-links-grid {
            grid-template-columns: auto auto auto;
            justify-content: space-between;
            gap: 10px;
            text-align: left;
          }
          .footer-col h4 { font-size: 13px; margin-bottom: 10px; }
          .footer-col a { font-size: 11px; margin-bottom: 6px; }
          .footer-col:nth-child(4) {
            grid-column: span 3;
            margin-top: 15px;
            text-align: center;
          }
          .app-download-btns { align-items: center; justify-content: center; }
          .social-links { justify-content: center; }
        }
      `}} />
    </div>
  );
}
