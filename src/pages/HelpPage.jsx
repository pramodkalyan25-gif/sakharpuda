import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronDown, ChevronUp, Search, ShieldCheck, UserPlus, CreditCard, MessageCircle } from 'lucide-react';

const faqData = [
  {
    category: "Getting Started",
    icon: <UserPlus size={24} />,
    questions: [
      {
        q: "How do I create a profile on SakharPuda?",
        a: "Registration is simple. Click on the 'Register Free' button on our landing page, provide your basic details, and follow our 3-step profile wizard to set up your matrimonial identity."
      },
      {
        q: "Is it free to join?",
        a: "Yes, basic registration and profile creation are completely free. You can browse matches and express interest without any cost."
      }
    ]
  },
  {
    category: "Safety & Privacy",
    icon: <ShieldCheck size={24} />,
    questions: [
      {
        q: "How secure is my data on SakharPuda?",
        a: "We use enterprise-grade encryption and strict privacy controls. You can choose who sees your photos, contact details, and full profile through your privacy settings."
      },
      {
        q: "How do I report a suspicious profile?",
        a: "Every profile has a 'Report' button. Additionally, you can email our safety team at sakharpuda@zohomail.com with the profile details."
      }
    ]
  },
  {
    category: "Membership",
    icon: <CreditCard size={24} />,
    questions: [
      {
        q: "What are the benefits of a Paid Membership?",
        a: "Paid members can view direct contact details, initiate unlimited chats, and get higher visibility in search results. Check our Membership section for detailed plans."
      }
    ]
  }
];

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="legal-page-container">
      <header className="legal-header">
        <div className="container">
          <Link to="/" className="back-link">
            <ChevronLeft size={20} /> Back to Home
          </Link>
          <h1>Help Center</h1>
          <p className="subtitle">Frequently Asked Questions & Support</p>
          
          <div className="help-search-box">
            <Search size={20} />
            <input type="text" placeholder="Search for answers..." />
          </div>
        </div>
      </header>

      <main className="legal-content">
        <div className="container">
          <div className="help-layout">
            <aside className="help-sidebar">
              {faqData.map((cat, idx) => (
                <button 
                  key={idx}
                  className={`cat-btn ${activeCategory === idx ? 'active' : ''}`}
                  onClick={() => {setActiveCategory(idx); setOpenIndex(null);}}
                >
                  {cat.icon} {cat.category}
                </button>
              ))}
              <div className="support-cta card">
                <MessageCircle size={32} />
                <h3>Need more help?</h3>
                <p>Our support team is available to assist you.</p>
                <Link to="/contact" className="contact-link">Contact Support</Link>
              </div>
            </aside>

            <section className="faq-section card">
              <h2>{faqData[activeCategory].category}</h2>
              <div className="faq-list">
                {faqData[activeCategory].questions.map((faq, idx) => (
                  <div key={idx} className={`faq-item ${openIndex === idx ? 'open' : ''}`}>
                    <button className="faq-question" onClick={() => toggleFAQ(idx)}>
                      {faq.q}
                      {openIndex === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {openIndex === idx && <div className="faq-answer">{faq.a}</div>}
                  </div>
                ))}
              </div>
            </section>
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
          padding: 60px 0 100px;
          text-align: center;
          position: relative;
        }

        .legal-header h1 {
          font-size: 36px;
          margin: 0 0 10px;
        }

        .subtitle {
          opacity: 0.8;
          font-size: 18px;
          margin-bottom: 40px;
        }

        .help-search-box {
          max-width: 600px;
          margin: 0 auto;
          background: #fff;
          border-radius: 50px;
          padding: 15px 30px;
          display: flex;
          align-items: center;
          gap: 15px;
          color: #718096;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: -25px;
          width: 90%;
        }

        .help-search-box input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 16px;
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
          padding: 80px 0 60px;
        }

        .help-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 40px;
        }

        .help-sidebar {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .cat-btn {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 15px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 15px;
          font-weight: 600;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .cat-btn:hover, .cat-btn.active {
          border-color: #E52D56;
          color: #E52D56;
          background: #fff5f7;
        }

        .support-cta {
          margin-top: 20px;
          text-align: center;
          padding: 30px 20px;
        }

        .support-cta h3 {
          font-size: 18px;
          margin: 15px 0 10px;
        }

        .support-cta p {
          font-size: 14px;
          color: #718096;
          margin-bottom: 20px;
        }

        .contact-link {
          display: block;
          background: #1e1e3a;
          color: #fff;
          padding: 10px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
        }

        .card {
          background: #fff;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        .faq-section h2 {
          font-size: 24px;
          margin-bottom: 30px;
          color: #1e1e3a;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .faq-item {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .faq-question {
          width: 100%;
          padding: 20px;
          background: #fff;
          border: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          color: #2d3748;
          cursor: pointer;
          text-align: left;
        }

        .faq-item.open .faq-question {
          background: #f8fafc;
          color: #E52D56;
        }

        .faq-answer {
          padding: 0 20px 20px;
          background: #f8fafc;
          color: #718096;
          font-size: 15px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        @media (max-width: 992px) {
          .help-layout {
            grid-template-columns: 1fr;
          }
          .help-sidebar {
            order: 2;
          }
          .faq-section {
            order: 1;
          }
        }
      `}} />
    </div>
  );
}
