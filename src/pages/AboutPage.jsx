import { Link } from 'react-router-dom';
import { ChevronLeft, Heart, Users, Target, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="legal-page-container">
      <header className="legal-header">
        <div className="container">
          <Link to="/" className="back-link">
            <ChevronLeft size={20} /> Back to Home
          </Link>
          <h1>About SakharPuda</h1>
          <p className="subtitle">Crafting modern matches with traditional roots</p>
        </div>
      </header>

      <main className="legal-content">
        <div className="container">
          <section className="about-intro card">
            <div className="intro-text">
              <h2>Our Story</h2>
              <p>
                SakharPuda was founded with a single vision: to simplify the search for a life partner in a world that is moving too fast. We understand that marriage is not just a union of two individuals, but a coming together of families, traditions, and shared values.
              </p>
              <p>
                The name "SakharPuda" (The Sugar Ceremony) represents the first formal step in a Maharashtrian wedding, symbolizing the sweet beginning of a lifelong commitment. We carry this spirit of auspicious beginnings into every profile we verify and every match we suggest.
              </p>
            </div>
            <div className="intro-image">
              <img src="/images/logo.png" alt="SakharPuda Logo" />
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
                Email: sakharpuda@zohomail.com
              </p>
            </div>
            <div className="btn-wrapper">
              <Link to="/register" className="cta-button">Register Now</Link>
            </div>
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

        .card {
          background: #fff;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
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
          background: #f0f2f5;
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

        @media (max-width: 768px) {
          .about-intro {
            flex-direction: column;
            text-align: center;
          }
          .values-grid {
            grid-template-columns: 1fr;
          }
        }
      `}} />
    </div>
  );
}
