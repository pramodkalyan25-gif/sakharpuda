import { Link } from 'react-router-dom';
import { ChevronLeft, Heart, Users, Target, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="legal-page-container">
      <div className="sticky-wrapper">
        <header className="sticky-legal-header">
          <div className="container">
            <div className="legal-nav-content">
              <Link to="/"><img src="/images/sakharpuda-logo.png" alt="SakharPuda" className="legal-logo-small" /></Link>
              <Link to="/" className="back-link-nav">
                <ChevronLeft size={18} /> Back to Home
              </Link>
            </div>
          </div>
        </header>

        <header className="legal-header">
          <div className="container">
            <h1>About SakharPuda</h1>
            <p className="subtitle">Crafting modern matches with traditional roots</p>
          </div>
        </header>
      </div>

      <main className="legal-content">
        <div className="container">
          <section className="about-intro card">
            <div className="intro-text">
              <h2>Our Story</h2>
              <p>
                SakharPuda was founded with a single vision: to simplify the search for a life partner in a world that is moving too fast. We understand that marriage is not just a union of two individuals, but a coming together of families, traditions, and shared values.
              </p>
              <p>
                The name "SakharPuda" (The Sugar Ceremony) represents a traditional and formal step in the journey of a union, symbolizing the sweet beginning of a lifelong commitment. We carry this spirit of auspicious beginnings into every profile we verify and every match we suggest.
              </p>
            </div>
            <div className="intro-image">
              <img src="/images/sakharpuda-logo.png" alt="SakharPuda Logo" />
            </div>
          </section>

          <div className="values-grid">
            <div className="value-item card">
              <div className="icon-box"><Heart size={32} /></div>
              <h3>Trust First</h3>
              <p>We prioritize the authenticity of our community through rigorous profile screening and visit-based verifications.</p>
            </div>

            <div className="value-item card">
              <div className="icon-box"><Users size={32} /></div>
              <h3>Community Driven</h3>
              <p>Our platform is built to respect and celebrate the nuances of your specific religion, caste, and cultural heritage.</p>
            </div>

            <div className="value-item card">
              <div className="icon-box"><Target size={32} /></div>
              <h3>Precision Matching</h3>
              <p>We combine advanced AI technology with human insight to bring you matches that truly align with your lifestyle.</p>
            </div>

            <div className="value-item card">
              <div className="icon-box"><Award size={32} /></div>
              <h3>User Safety</h3>
              <p>From granular privacy controls to active fraud monitoring, your safety is our top priority at every step.</p>
            </div>
          </div>

          <section className="milestones card">
            <h2>Join Our Journey</h2>
            <p>
              Whether you are looking for a soulmate within your community or seeking professional assistance through our <strong>Exclusive</strong> service, SakharPuda is here to make your journey towards marriage sweet, secure, and successful.
            </p>
            <div className="contact-info-brief" style={{ marginTop: '20px', fontSize: '14px', color: '#718096' }}>
              <p>
                <strong>Pramod Gogadare</strong><br />
                RH 01, Nirvana Life County, Near D Y Patil University, Lohegaon, Pune - 411047<br />
                Email: sakharpuda@zohomail.in<br />
                Mobile: +91 91589 98226
              </p>
            </div>
            <div className="btn-wrapper">
              <Link to="/register" className="cta-button">Register Now</Link>
            </div>
          </section>
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
        .legal-page-container {
          background: #fff;
          min-height: 100vh;
          font-family: 'Figtree', sans-serif;
          color: #2d3748;
          line-height: 1.6;
        }

        .legal-header {
          background: #fff;
          color: #1e293b;
          padding: 25px 0;
          text-align: center;
          position: relative;
          border-bottom: 1px solid #e2e8f0;
        }

        .legal-header .container {
          position: relative;
          z-index: 2;
        }

        .legal-header h1 {
          font-size: 28px;
          margin: 0;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #1e293b;
        }

        .sticky-wrapper {
          position: relative;
          z-index: 10;
        }

        .sticky-legal-header {
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          padding: 10px 0;
        }

        .sticky-legal-header .container {
          max-width: 100% !important;
          padding: 0 40px;
        }

        .legal-nav-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .legal-logo-small {
          height: 22px;
          display: block;
        }

        .back-link-nav {
          color: #718096;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-weight: 600;
          font-size: 14px;
          transition: color 0.2s;
        }

        .back-link-nav:hover {
          color: #D63447;
        }

        .subtitle {
          opacity: 0.8;
          font-size: 18px;
        }

        .legal-content {
          padding: 60px 0;
        }

        .card {
          padding: 40px;
          margin-bottom: 30px;
        }

        .about-intro {
          display: flex;
          align-items: center;
          gap: 40px;
        }

        .intro-text {
          flex: 2;
        }

        .intro-image {
          flex: 1;
          display: flex;
          justify-content: center;
          padding: 20px;
          border-radius: 12px;
        }

        .intro-image img {
          max-width: 150px;
          height: auto;
        }

        .about-intro h2 {
          font-size: 28px;
          color: #1e1e3a;
          margin-bottom: 20px;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
          margin-bottom: 30px;
        }

        .value-item {
          text-align: center;
        }

        .icon-box {
          width: 64px;
          height: 64px;
          background: rgba(201, 149, 108, 0.1);
          color: #c9956c;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .value-item h3 {
          font-size: 20px;
          color: #1e1e3a;
          margin-bottom: 15px;
        }

        .milestones {
          text-align: center;
        }

        .milestones h2 {
          font-size: 24px;
          color: #1e1e3a;
          margin-bottom: 20px;
        }

        .btn-wrapper {
          margin-top: 30px;
        }

        .cta-button {
          background: #E52D56;
          color: #fff;
          padding: 12px 40px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          transition: transform 0.2s;
          display: inline-block;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(229, 45, 86, 0.3);
        }

        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 20px;
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

        @media (max-width: 768px) {
          .about-intro {
            flex-direction: column;
            text-align: center;
          }
          .values-grid {
            grid-template-columns: 1fr;
          }
          .footer-links { gap: 15px; flex-direction: column; }
        }
      `}} />
    </div>
  );
}
