import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  Heart, 
  UserX, 
  EyeOff, 
  MessageSquare, 
  Mail, 
  Smartphone,
  ExternalLink,
  Info
} from 'lucide-react';

export default function SafetyCenterPage() {
  const safetyTips = [
    {
      icon: <Smartphone size={24} />,
      title: "Keep it on SakharPuda",
      description: "Avoid sharing your phone number or email early. Use our secure chat and call features until you're truly comfortable."
    },
    {
      icon: <Lock size={24} />,
      title: "Protect Your Finances",
      description: "Never share bank details, OTPs, or send money to anyone you meet online, regardless of their 'emergency'."
    },
    {
      icon: <Info size={24} />,
      title: "Meeting Safely",
      description: "Always meet in public places, tell a friend or family member where you're going, and arrange your own transport."
    }
  ];

  const reportingSteps = [
    { number: "01", text: "Go to the suspicious member's profile" },
    { number: "02", text: "Click the 'More Options' (three dots) icon" },
    { number: "03", text: "Select 'Report Profile' from the menu" },
    { number: "04", text: "Choose the relevant reason for reporting" },
    { number: "05", text: "Submit your report for immediate review" }
  ];

  return (
    <div className="safety-page-wrapper">
      <div className="sticky-wrapper">
        <header className="sticky-nav-bar">
          <div className="container">
            <div className="nav-content">
              <Link to="/"><img src="/images/sakharpuda-logo.png" alt="SakharPuda" className="nav-logo" /></Link>
              <Link to="/" className="nav-back">
                <ChevronLeft size={18} /> Back to Home
              </Link>
            </div>
          </div>
        </header>

        <section className="safety-hero">
          <div className="container">
            <div className="hero-badge">
              <ShieldCheck size={20} />
              <span>Verified & Secure</span>
            </div>
            <h1>Safety Center</h1>
            <p>Your security is our priority. Learn how to protect yourself and use SakharPuda safely.</p>
          </div>
        </section>
      </div>

      <main className="safety-main">
        <div className="container">
          {/* Main Pillars */}
          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon blue"><ShieldCheck size={32} /></div>
              <h3>Safety Tips</h3>
              <p>Essential guidelines for online and offline matchmaking success.</p>
              <button className="pillar-btn">View Tips</button>
            </div>
            <div className="pillar-card">
              <div className="pillar-icon red"><AlertTriangle size={32} /></div>
              <h3>Report a Profile</h3>
              <p>Spotted something suspicious? Help us keep the community safe.</p>
              <button className="pillar-btn">How to Report</button>
            </div>
            <div className="pillar-card">
              <div className="pillar-icon purple"><Lock size={32} /></div>
              <h3>Privacy Controls</h3>
              <p>Manage who sees your profile and how your data is handled.</p>
              <button className="pillar-btn">Privacy Info</button>
            </div>
            <div className="pillar-card">
              <div className="pillar-icon green"><Heart size={32} /></div>
              <h3>Wellbeing</h3>
              <p>Resources for maintaining a healthy mindset during your search.</p>
              <button className="pillar-btn">Wellbeing Guide</button>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="section-block">
            <div className="section-header">
              <h2>Quick Safety Tips</h2>
              <div className="section-line"></div>
            </div>
            <div className="tips-grid">
              {safetyTips.map((tip, idx) => (
                <div key={idx} className="tip-item">
                  <div className="tip-icon-box">{tip.icon}</div>
                  <div className="tip-text">
                    <h4>{tip.title}</h4>
                    <p>{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-block reporting-flow">
            <div className="reporting-container">
              <div className="reporting-info">
                <h2>How to Report a Member</h2>
                <p>If you encounter inappropriate behavior, harassment, or suspected fraud, please report the profile immediately. Our team reviews every report within 24 hours.</p>
                <div className="reporting-list">
                  {reportingSteps.map((step, idx) => (
                    <div key={idx} className="reporting-step">
                      <span className="step-num">{step.number}</span>
                      <p>{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="reporting-visual">
                <div className="visual-card">
                  <div className="visual-top">
                    <UserX size={48} />
                    <div className="visual-dots">...</div>
                  </div>
                  <div className="visual-menu">
                    <div className="menu-item active">Report Profile</div>
                    <div className="menu-item">Block Profile</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="support-banner">
            <div className="support-content">
              <h3>We're Here For You!</h3>
              <p>If you have any safety concerns or need immediate assistance, contact our SakharPuda Care team.</p>
              <div className="support-actions">
                <a href="mailto:sakharpuda@zohomail.in" className="support-btn">
                  <Mail size={18} /> sakharpuda@zohomail.in
                </a>
                <a href="tel:+919158998226" className="support-btn">
                  <Smartphone size={18} /> +91 91589 98226
                </a>
              </div>
            </div>
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
        .safety-page-wrapper {
          background: #fff;
          min-height: 100vh;
          font-family: 'Figtree', sans-serif;
          color: #1e293b;
        }

        .sticky-wrapper {
          position: relative;
          z-index: 10;
        }

        .sticky-nav-bar {
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          padding: 10px 0;
        }

        .sticky-nav-bar .container {
          max-width: 100% !important;
          padding: 0 40px;
        }

        .nav-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-logo { height: 22px; }

        .nav-back {
          color: #64748b;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-weight: 600;
          font-size: 14px;
          transition: color 0.2s;
        }

        .nav-back:hover { color: #D63447; }

        .safety-hero {
          background: #fff;
          color: #1e293b;
          padding: 25px 0;
          text-align: center;
          position: relative;
          border-bottom: 1px solid #e2e8f0;
        }

        .safety-hero .container { position: relative; z-index: 2; }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #f1f5f9;
          color: #D63447;
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 15px;
          border: 1px solid #e2e8f0;
        }

        .safety-hero h1 {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
          color: #1e293b;
        }

        .safety-hero p {
          font-size: 15px;
          opacity: 0.7;
          max-width: 600px;
          margin: 0 auto;
          color: #64748b;
        }

        .safety-main { padding: 60px 0; }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
          margin-bottom: 80px;
        }

        .pillar-card {
          padding: 30px;
          border-radius: 20px;
          text-align: center;
          transition: transform 0.3s ease;
          border: 1px solid #f1f5f9;
        }

        .pillar-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .pillar-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .pillar-icon.blue { background: transparent; color: #2563eb; border: 1px solid #eff6ff; }
        .pillar-icon.red { background: transparent; color: #dc2626; border: 1px solid #fef2f2; }
        .pillar-icon.purple { background: transparent; color: #7c3aed; border: 1px solid #faf5ff; }
        .pillar-icon.green { background: transparent; color: #16a34a; border: 1px solid #f0fdf4; }

        .pillar-card h3 { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
        .pillar-card p { font-size: 14px; color: #64748b; margin-bottom: 20px; }

        .pillar-btn {
          color: #D63447;
          font-weight: 700;
          font-size: 14px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: opacity 0.2s;
        }

        .pillar-btn:hover { opacity: 0.7; }

        .section-block { margin-bottom: 80px; }

        .section-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 40px;
        }

        .section-header h2 { font-size: 28px; font-weight: 800; white-space: nowrap; }
        .section-line { height: 2px; background: #e2e8f0; width: 100%; border-radius: 2px; }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }

        .tip-item {
          display: flex;
          gap: 20px;
          background: #fff;
          padding: 24px;
          border-radius: 16px;
          border-left: 4px solid #D63447;
        }

        .tip-icon-box {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          background: #fff;
          color: #D63447;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #f1f5f9;
        }

        .tip-text h4 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .tip-text p { font-size: 14px; color: #64748b; line-height: 1.5; }

        .reporting-container {
          background: #fff;
          border-radius: 24px;
          padding: 60px 0;
          color: #1e293b;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          border-top: 1px solid #f1f5f9;
        }

        .reporting-info h2 { font-size: 32px; font-weight: 800; margin-bottom: 16px; color: #1e293b; }
        .reporting-info > p { color: #64748b; font-size: 16px; margin-bottom: 40px; }

        .reporting-list { display: flex; flex-direction: column; gap: 20px; }
        .reporting-step { display: flex; align-items: center; gap: 20px; }
        .step-num {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border: 2px solid #D63447;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          color: #D63447;
        }

        .reporting-step p { font-size: 15px; color: #64748b; }

        .reporting-visual {
          display: flex;
          justify-content: center;
        }

        .visual-card {
          background: #fff;
          width: 280px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .visual-top {
          padding: 40px;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #64748b;
          position: relative;
        }

        .visual-dots {
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 24px;
          color: #D63447;
          font-weight: bold;
        }

        .visual-menu {
          padding: 10px;
          background: #fff;
        }

        .menu-item {
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          color: #475569;
          border-radius: 8px;
        }

        .menu-item.active {
          background: #fef2f2;
          color: #D63447;
        }

        .support-banner {
          border-radius: 24px;
          padding: 50px;
          text-align: center;
          border: 1px solid #e2e8f0;
        }

        .support-banner h3 { font-size: 24px; font-weight: 800; margin-bottom: 12px; }
        .support-banner p { color: #64748b; margin-bottom: 30px; }

        .support-actions {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .support-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          background: #fff;
          color: #1e293b;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          transition: all 0.2s;
          border: 1px solid #e2e8f0;
        }

        .support-btn:hover { background: #e2e8f0; transform: translateY(-2px); }

        @media (max-width: 968px) {
          .reporting-container { grid-template-columns: 1fr; padding: 40px; gap: 40px; }
          .reporting-visual { order: -1; }
        }

        .simple-footer {
          padding: 60px 0 40px;
          border-top: 1px solid #f1f5f9;
          margin-top: 40px;
          text-align: center;
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

        @media (max-width: 640px) {
          .sticky-nav-bar .container { padding: 0 20px; }
          .safety-hero h1 { font-size: 28px; }
          .support-actions { flex-direction: column; }
          .footer-links { gap: 15px; flex-direction: column; }
        }
      `}} />
    </div>
  );
}
