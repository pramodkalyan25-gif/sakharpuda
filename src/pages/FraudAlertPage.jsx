import { Link } from 'react-router-dom';
import { ChevronLeft, ShieldAlert, PhoneOff, Lock, UserCheck } from 'lucide-react';

export default function FraudAlertPage() {
  return (
    <div className="legal-page-container">
      <header className="legal-header">
        <div className="container">
          <Link to="/" className="back-link">
            <ChevronLeft size={20} /> Back to Home
          </Link>
          <div className="alert-icon-wrapper">
            <ShieldAlert size={48} color="#E52D56" />
          </div>
          <h1>Be Safe, Be Smart</h1>
          <p className="subtitle">Guidelines to ensure a safe matchmaking experience on SakharPuda</p>
        </div>
      </header>

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
              <p>Don't hesitate. Report suspicious profiles using the "Report Profile" button on their page or email us at <span className="highlight">sakharpuda@zohomail.com</span>.</p>
            </div>
          </div>
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

        .alert-icon-wrapper {
          margin-bottom: 20px;
        }

        .legal-header h1 {
          font-size: 36px;
          margin: 0 0 10px;
        }

        .subtitle {
          opacity: 0.8;
          font-size: 18px;
        }

        .back-link {
          color: #c9956c;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-weight: 600;
          transition: color 0.2s;
          margin-bottom: 30px;
        }

        .back-link:hover {
          color: #fff;
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
