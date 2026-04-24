import { Link } from 'react-router-dom';
import { ChevronLeft, Mail, MapPin, User } from 'lucide-react';

export default function GrievancePage() {
  return (
    <div className="legal-page-container">
      <header className="legal-header">
        <div className="container">
          <Link to="/" className="back-link">
            <ChevronLeft size={20} /> Back to Home
          </Link>
          <h1>Grievance Redressal</h1>
          <p className="subtitle">Official channel for reporting concerns and disputes</p>
        </div>
      </header>

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
                    <a href="mailto:sakharpuda@zohomail.com">sakharpuda@zohomail.com</a><br />
                    <a href="mailto:pramodkalyan25@gmail.com">pramodkalyan25@gmail.com</a>
                  </p>
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
        }

        .back-link:hover {
          color: #fff;
        }

        .legal-content {
          padding: 60px 0;
        }

        .card {
          background: #fff;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
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
      `}} />
    </div>
  );
}
