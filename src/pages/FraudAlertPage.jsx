import { Link } from 'react-router-dom';
import { ChevronLeft, ShieldAlert, PhoneOff, Lock, UserCheck } from 'lucide-react';

export default function FraudAlertPage() {
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
            <div className="alert-icon-wrapper">
              <ShieldAlert size={48} color="#ffffff" />
            </div>
            <h1>Be Safe, Be Smart</h1>
            <p className="subtitle">Guidelines to ensure a safe matchmaking experience on SakharPuda</p>
          </div>
        </header>
      </div>

      <main className="legal-content">
        <div className="container">
          <div className="alert-grid">
            <div className="alert-card card">
              <div className="icon-box"><PhoneOff size={32} /></div>
              <h3>Financial Safety</h3>
              <p>
                <strong>Never send money</strong> to anyone you meet on SakharPuda. Scammers often create elaborate stories (emergencies, medical bills, travel costs) to ask for financial help. If someone asks for money, report them to us immediately.
              </p>
            </div>

            <div className="alert-card card">
              <div className="icon-box"><Lock size={32} /></div>
              <h3>Protect Personal Data</h3>
              <p>
                Avoid sharing sensitive details like your bank account, credit card numbers, or passwords. SakharPuda will <strong>never</strong> ask for your password or OTP over the phone or email.
              </p>
            </div>

            <div className="alert-card card">
              <div className="icon-box"><UserCheck size={32} /></div>
              <h3>Meeting Safely</h3>
              <p>
                When meeting someone for the first time, choose a <strong>public place</strong> and inform your family or friends about the meeting location and the person's details. Trust your instincts.
              </p>
            </div>
          </div>

          <div className="full-content card">
            <h2>Common Scammer Warning Signs</h2>
            <ul>
              <li>The person wants to move the conversation off SakharPuda immediately to WhatsApp or private email.</li>
              <li>They claim to be living abroad (often as doctors, engineers, or UN officials) but want to move to India soon.</li>
              <li>They profess love very quickly without even meeting you.</li>
              <li>They claim to have sent you an expensive gift which is "stuck in customs" and ask you to pay the clearance fee.</li>
              <li>They ask for money for "urgent medical surgeries" or "sudden business losses."</li>
            </ul>

            <div className="report-action">
              <h3>Seen something suspicious?</h3>
              <p>Don't hesitate. Report suspicious profiles using the "Report Profile" button on their page or email us at <span className="highlight">sakharpuda@zohomail.in</span> or call/WhatsApp at <span className="highlight">+91 91589 98226</span>.</p>
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .legal-page-container {
          background: #f8f9fa;
          min-height: 100vh;
          font-family: 'Figtree', sans-serif;
          color: #2d3748;
          line-height: 1.6;
        }

        .legal-header {
          background: linear-gradient(135deg, #D63447 0%, #c12a3b 100%);
          color: #fff;
          padding: 35px 0;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .legal-header::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4v-2H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 1;
        }

        .legal-header .container {
          position: relative;
          z-index: 2;
        }

        .legal-header h1 {
          font-size: 32px;
          margin: 0 0 8px;
          font-weight: 800;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .alert-icon-wrapper {
          margin-bottom: 20px;
        }


        .subtitle {
          opacity: 0.8;
          font-size: 18px;
        }

        .sticky-wrapper {
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
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

        .legal-content {
          padding: 60px 0;
        }

        .alert-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          margin-bottom: 40px;
        }

        .card {
          background: #fff;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        .alert-card {
          text-align: center;
        }

        .icon-box {
          width: 64px;
          height: 64px;
          background: rgba(229, 45, 86, 0.1);
          color: #E52D56;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .alert-card h3 {
          font-size: 20px;
          margin-bottom: 15px;
          color: #1e1e3a;
        }

        .full-content h2 {
          font-size: 24px;
          margin-bottom: 25px;
          color: #1e1e3a;
        }

        .full-content ul {
          padding-left: 20px;
          margin-bottom: 40px;
        }

        .full-content li {
          margin-bottom: 15px;
          position: relative;
        }

        .report-action {
          background: #fff5f7;
          padding: 30px;
          border-radius: 12px;
          border-left: 4px solid #E52D56;
        }

        .report-action h3 {
          color: #E52D56;
          margin-bottom: 10px;
        }

        .highlight {
          color: #E52D56;
          font-weight: 700;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
        }

        @media (max-width: 768px) {
          .alert-grid {
            grid-template-columns: 1fr;
          }
        }
      `}} />
    </div>
  );
}
