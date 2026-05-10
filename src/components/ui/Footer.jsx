import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="main-footer" aria-label="Main Footer">
      <div className="container">
        <div className="footer-intro">
          <img src="/images/sakharpuda-logo.png" alt="SakharPuda Matrimony" className="footer-logo" />
          <h2 className="footer-about-title">India's Premium Matrimony Platform</h2>
          <p>
            SakharPuda.com is a premium matrimony platform designed for modern match-seekers. 
            We understand that finding the right partner involves deep alignment of values, lifestyle, and 
            expectations. SakharPuda adapts to your preferences, creating a dedicated space for your search. 
            Whether you are looking for a soulmate or a professional match-making service, 
            SakharPuda is here to make your journey easier.
          </p>
          <p className="footer-note">
            Please note: SakharPuda is only meant for users with a bonafide intent to enter into a matrimonial alliance
            and is not meant for users interested in dating only. SakharPuda platform should not be used to post any obscene material.
          </p>
        </div>

        <div className="footer-links-grid">
          <div className="footer-col">
            <h4>Direct Access</h4>
            <nav aria-label="Direct access links">
              <Link to="/login" target="_blank">Member Login</Link>
              <Link to="/register" target="_blank">Register Here</Link>
              <Link to="/search" target="_blank">Partner Search</Link>
            </nav>
          </div>
          
          <div className="footer-col">
            <h4>Support</h4>
            <nav aria-label="Support links">
              <Link to="/contact" target="_blank">Contact us</Link>
              <Link to="/help" target="_blank">Help Center / FAQ</Link>
              <Link to="/safety-center" target="_blank">Safety Center</Link>
              <Link to="/grievances" target="_blank">Grievances</Link>
            </nav>
          </div>

          <div className="footer-col">
            <h4>Legal</h4>
            <nav aria-label="Legal links">
              <Link to="/about" target="_blank">About Us</Link>
              <Link to="/terms" target="_blank">Terms of Use</Link>
              <Link to="/privacy" target="_blank">Privacy Policy</Link>
              <Link to="/safety-center" target="_blank">Safety Center</Link>
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 SakharPuda.com - Premium Matrimony Services.</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .main-footer {
          background: #f1f3f6;
          padding: 60px 0;
          color: #4A5568;
          border-top: 1px solid #e2e8f0;
          font-family: 'Cabin', sans-serif;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .footer-intro {
          margin-bottom: 50px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 30px;
          max-width: 100%;
        }

        .footer-logo {
          height: 28px;
          margin-bottom: 20px;
          opacity: 0.8;
        }

        .footer-about-title {
          font-size: 20px;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 15px;
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
          font-style: normal;
          opacity: 1;
        }

        .footer-links-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }

        .footer-col h4 {
          font-size: 14px;
          font-weight: 500;
          color: #2D3748;
          margin-bottom: 20px;
          text-transform: uppercase;
        }

        .footer-col nav {
          display: flex;
          flex-direction: column;
          gap: 0;
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

        .footer-bottom {
          padding-top: 30px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
        }

        .footer-bottom p {
          font-size: 13px;
          color: #718096;
        }

        @media (max-width: 768px) {
          .footer-links-grid {
            grid-template-columns: auto auto auto;
            justify-content: space-between;
            gap: 15px;
            text-align: left;
          }
          
          .footer-intro {
            text-align: left;
          }
          
          .footer-logo {
            margin: 0 0 20px;
          }
        }
      `}} />
    </footer>
  );
}
