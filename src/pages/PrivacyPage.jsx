import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="legal-page-container">
      <header className="legal-header">
        <div className="container">
          <Link to="/" className="back-link">
            <ChevronLeft size={20} /> Back to Home
          </Link>
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: April 24, 2026</p>
        </div>
      </header>

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
              If you have any questions or concerns about our Privacy Policy, please contact us at <span className="highlight">sakharpuda@zohomail.com</span> or <span className="highlight">pramodkalyan25@gmail.com</span>.
            </p>
          </section>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .legal-page-container {
          background: #f8f9fa;
          min-height: 100vh;
          font-family: 'Figtree', sans-serif;
          color: #2d3748;
          line-height: 1.6;
        }

        .legal-header {
          background: #1e1e3a;
          color: #fff;
          padding: 60px 0;
          text-align: center;
        }

        .legal-header h1 {
          font-size: 36px;
          margin: 20px 0 10px;
        }

        .back-link {
          color: #c9956c;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-weight: 600;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #fff;
        }

        .last-updated {
          opacity: 0.7;
          font-size: 14px;
        }

        .legal-content {
          padding: 40px 0;
        }

        .legal-content .container.card {
          background: #fff;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
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
      `}} />
    </div>
  );
}
