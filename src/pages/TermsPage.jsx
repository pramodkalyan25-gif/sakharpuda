import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function TermsPage() {
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
            <h1>Terms of Use</h1>
            <p className="last-updated">Last Updated: April 24, 2026</p>
          </div>
        </header>
      </div>

      <main className="legal-content">
        <div className="container card">
          <section className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              Welcome to SakharPuda.com. By accessing or using our website, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree with any part of these terms, you must not use our services.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Eligibility</h2>
            <p>
              To register as a member of SakharPuda or use this website, you must be of legal marriageable age as per the laws of India (currently 18 years for women and 21 years for men). Our services are only for individuals who are legally competent to enter into a matrimonial alliance.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Registration and Account Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your login credentials. You agree to provide accurate, current, and complete information during the registration process. SakharPuda reserves the right to terminate accounts that provide false or misleading information.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Intent of Use</h2>
            <p>
              SakharPuda is strictly for matrimonial purposes only. It is not a dating site. Any user found using the platform for casual dating, social networking, or any purpose other than seeking a life partner will have their account terminated immediately without refund.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Content and Conduct</h2>
            <p>
              You are solely responsible for the content you post on SakharPuda. You agree not to post any content that:
            </p>
            <ul>
              <li>Is offensive, abusive, or promotes discrimination or violence.</li>
              <li>Is obscene, pornographic, or contains sexually explicit material.</li>
              <li>Infringes on the intellectual property rights of others.</li>
              <li>Contains viruses, malware, or any other harmful code.</li>
              <li>Is used for commercial purposes, including advertising or solicitation.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Zero Tolerance for Misuse</h2>
            <p>
              We have a zero-tolerance policy for harassment, cyberstalking, or any form of abuse. Any report of such behavior will be investigated, and if found true, will lead to immediate account suspension and potential legal action.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Privacy and Data Protection</h2>
            <p>
              Your use of SakharPuda is subject to our Privacy Policy. By using our services, you consent to the collection and use of your information as described therein.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Termination</h2>
            <p>
              SakharPuda reserves the right to suspend or terminate your account at any time, with or without cause, and without prior notice. If your account is terminated for violation of these terms, you will not be entitled to any refund.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Indemnification</h2>
            <p>
              You agree to indemnify and hold SakharPuda and its affiliates harmless from any claims, losses, or damages, including legal fees, resulting from your violation of these terms or your use of our services.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us:<br />
              <strong>Pramod Gogadare</strong><br />
              RH 01, Nirvana Life County, Near D Y Patil University, Lohegaon, Pune - 411047<br />
              Email: sakharpuda@zohomail.in<br />
              Mobile: +91 91589 98226
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
