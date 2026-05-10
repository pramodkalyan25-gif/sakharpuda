import { Link } from 'react-router-dom';
import { ChevronLeft, Mail, MapPin, User, Phone } from 'lucide-react';

export default function GrievancePage() {
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
            <h1>Grievance Redressal</h1>
            <p className="subtitle">Official channel for reporting concerns and disputes</p>
          </div>
        </header>
      </div>

      <main className="legal-content">
        <div className="container">
          <div className="grievance-intro card">
            <p>
              At SakharPuda, we are committed to providing a safe and secure matchmaking experience. If you have any complaints regarding the platform, content posted by members, or any violation of our Terms of Use, please reach out to our designated Grievance Officer.
            </p>
          </div>

          <div className="officer-card card">
            <h2>Grievance Officer Information</h2>
            <p className="description">
              In accordance with the Information Technology Act, 2000 and the Rules made thereunder, the name and contact details of the Grievance Officer are provided below:
            </p>

            <div className="officer-details">
              <div className="detail-item">
                <div className="icon-box"><User size={20} /></div>
                <div>
                  <strong>Name:</strong>
                  <p>Mr. Pramod Gogadare</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="icon-box"><MapPin size={20} /></div>
                <div>
                  <strong>Address:</strong>
                  <p>
                    RH 01, Nirvana Life County,<br />
                    Near D Y Patil University, Lohegaon,<br />
                    Pune, Maharashtra - 411047, India
                  </p>
                </div>
              </div>

              <div className="detail-item">
                <div className="icon-box"><Mail size={20} /></div>
                <div>
                  <strong>Email:</strong>
                  <p>
                    <a href="mailto:sakharpuda@zohomail.in">sakharpuda@zohomail.in</a>
                  </p>
                </div>
              </div>

              <div className="detail-item">
                <div className="icon-box"><Phone size={20} /></div>
                <div>
                  <strong>Phone:</strong>
                  <p><a href="tel:+919158998226">+91 91589 98226</a></p>
                </div>
              </div>
            </div>
          </div>

          <div className="timeline-card card">
            <h2>Redressal Timeline</h2>
            <p>
              We aim to acknowledge your complaint within 24 hours of receipt. A formal investigation will be conducted, and a resolution will be provided within 15 days of receiving the complaint.
            </p>
            <p className="note">
              *Please provide your registered email ID and the link to the profile you are reporting to help us investigate faster.
            </p>
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
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .officer-card h2, .timeline-card h2 {
          font-size: 24px;
          color: #1e1e3a;
          margin-bottom: 20px;
        }

        .description {
          margin-bottom: 30px;
          color: #718096;
        }

        .officer-details {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .detail-item {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        .icon-box {
          width: 40px;
          height: 40px;
          background: rgba(201, 149, 108, 0.1);
          color: #c9956c;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .detail-item strong {
          display: block;
          font-size: 14px;
          text-transform: uppercase;
          color: #a0aec0;
          margin-bottom: 4px;
        }

        .detail-item p {
          font-size: 16px;
          color: #2d3748;
        }

        .detail-item a {
          color: #E52D56;
          text-decoration: none;
          font-weight: 600;
        }

        .note {
          margin-top: 20px;
          font-size: 14px;
          color: #718096;
          font-style: italic;
        }

        .container {
          max-width: 1200px;
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

        @media (max-width: 640px) {
          .footer-links { gap: 15px; flex-direction: column; }
        }
      `}} />
    </div>
  );
}
