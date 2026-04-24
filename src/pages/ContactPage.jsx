import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Thank you! Your message has been sent. We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="legal-page-container">
      <header className="legal-header">
        <div className="container">
          <Link to="/" className="back-link">
            <ChevronLeft size={20} /> Back to Home
          </Link>
          <h1>Contact Us</h1>
          <p className="subtitle">We are here to help you find your perfect match</p>
        </div>
      </header>

      <main className="legal-content">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info-side">
              <div className="info-card card">
                <h2>Get in Touch</h2>
                <div className="info-item">
                  <div className="icon-box"><MapPin size={24} /></div>
                  <div className="text-box">
                    <strong>Our Address</strong>
                    <p>RH 01, Nirvana Life County, Near D Y Patil University, Lohegaon, Pune, 411047</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="icon-box"><Mail size={24} /></div>
                  <div className="text-box">
                    <strong>Email Support</strong>
                    <p>
                      <a href="mailto:sakharpuda@zohomail.com">sakharpuda@zohomail.com</a><br />
                      <a href="mailto:pramodkalyan25@gmail.com">pramodkalyan25@gmail.com</a>
                    </p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="icon-box"><Phone size={24} /></div>
                  <div className="text-box">
                    <strong>Customer Support</strong>
                    <p>Available Mon-Sat: 10:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-side">
              <form className="contact-form card" onSubmit={handleSubmit}>
                <h2>Send us a Message</h2>
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input 
                    type="text" 
                    placeholder="How can we help?" 
                    required 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea 
                    rows="5" 
                    placeholder="Write your message here..." 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>
                <button type="submit" className="submit-btn">
                  <Send size={18} /> Send Message
                </button>
              </form>
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

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 40px;
        }

        .card {
          background: #fff;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        .contact-info-side h2, .contact-form-side h2 {
          font-size: 24px;
          color: #1e1e3a;
          margin-bottom: 30px;
        }

        .info-item {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }

        .icon-box {
          width: 50px;
          height: 50px;
          background: rgba(229, 45, 86, 0.1);
          color: #E52D56;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .text-box strong {
          display: block;
          font-size: 16px;
          margin-bottom: 5px;
        }

        .text-box p, .text-box a {
          color: #718096;
          text-decoration: none;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #4a5568;
        }

        .form-group input, .form-group textarea {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        .form-group input:focus, .form-group textarea:focus {
          outline: none;
          border-color: #E52D56;
        }

        .submit-btn {
          background: #E52D56;
          color: #fff;
          padding: 14px 30px;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: transform 0.2s;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
        }

        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }
      `}} />
    </div>
  );
}
