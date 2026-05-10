import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPage() {
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
            <h1>Privacy Policy</h1>
            <p className="last-updated">Last Updated: April 24, 2026</p>
          </div>
        </header>
      </div>

      <main className="legal-content">
        <div className="container card">
          <section className="legal-section">
            <h2>1. Overview</h2>
            <p>
              SakharPuda.com is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our matrimonial services.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when you register for an account, create or modify your profile, and use our communication features. This includes:
            </p>
            <ul>
              <li>Personal identifiers (Name, Gender, Date of Birth).</li>
              <li>Contact information (Email, Mobile Number).</li>
              <li>Demographic information (Religion, Caste, Profession, Education).</li>
              <li>Media (Photos and Videos uploaded to your profile).</li>
              <li>Communication data (Messages and interests sent to other members).</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. How We Use Your Information</h2>
            <p>
              We use the collected information to:
            </p>
            <ul>
              <li>Provide and maintain our matrimonial services.</li>
              <li>Personalize your experience and suggest relevant matches.</li>
              <li>Verify your identity and ensure the safety of our community.</li>
              <li>Communicate with you regarding account updates and promotions.</li>
              <li>Analyze usage patterns to improve our platform.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Privacy Control and Visibility</h2>
            <p>
              SakharPuda provides you with granular controls over your privacy. You can choose:
            </p>
            <ul>
              <li>Who can see your full profile (Everyone, Logged-in users, or specific filter matches).</li>
              <li>Who can view your photos and contact details.</li>
              <li>Whether to hide your profile from search results temporarily.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Third-Party Disclosure</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except to provide our services, comply with the law, or protect our rights.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Cookies</h2>
            <p>
              We use cookies to enhance your browsing experience and analyze site traffic. You can choose to disable cookies through your browser settings, but some features of the site may not function properly.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Contact Us</h2>
            <p>
              If you have any questions or concerns about our Privacy Policy, please contact us at <span className="highlight">sakharpuda@zohomail.in</span> or call us at <span className="highlight">+91 91589 98226</span>.
            </p>
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

        .last-updated {
          opacity: 0.7;
          font-size: 14px;
        }

        .legal-content {
          padding: 40px 0;
        }

        .legal-content .container.card {
          padding: 40px;
          max-width: 900px;
          margin: 0 auto;
        }

        .legal-section {
          margin-bottom: 40px;
        }

        .legal-section h2 {
          font-size: 20px;
          color: #1e1e3a;
          margin-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 10px;
        }

        .legal-section p {
          margin-bottom: 15px;
        }

        .legal-section ul {
          padding-left: 20px;
        }

        .legal-section li {
          margin-bottom: 10px;
        }

        .highlight {
          color: #E52D56;
          font-weight: 600;
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
