import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const features = [
  { icon: '🔒', title: 'Privacy First', desc: 'Photos hidden by default. Phone revealed only after mutual interest + admin approval.' },
  { icon: '✅', title: 'Verified Profiles', desc: 'Mobile-verified members only. Admin-vetted profiles earn the gold badge.' },
  { icon: '💌', title: 'Genuine Connections', desc: 'Smart interest matching. No spam — max 10 interests per day enforced.' },
  { icon: '🛡️', title: 'Secure & Safe', desc: 'Row-level security on every query. Signed photo URLs with 1-hour expiry.' },
];

const stats = [
  { value: '50K+', label: 'Verified Profiles' },
  { value: '12K+', label: 'Successful Matches' },
  { value: '98%', label: 'Privacy Score' },
  { value: '4.9★', label: 'User Rating' },
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="brand-icon">💍</span>
          <span className="brand-name">ManglaSutra</span>
        </div>
        
        <div className="nav-actions">
          <Link to="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>

        <button className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
          <Link to="/register" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
          <Link to="/search" onClick={() => setIsMenuOpen(false)}>Browse Profiles</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" aria-label="Hero section">
        <div className="hero-content">
          <div className="hero-badge">🌸 India's Privacy-First Matrimony Platform</div>
          <h1 className="hero-title">
            Find Your Perfect<br />
            <span className="hero-gradient">Life Partner</span>
          </h1>
          <p className="hero-subtitle">
            Secure. Verified. Private. Connect with genuine profiles where your safety and
            dignity are protected by technology, not just promises.
          </p>
          <div className="hero-cta">
            <Link to="/register">
              <Button variant="primary" size="lg">Create Free Profile</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">Browse Profiles</Button>
            </Link>
          </div>
          <div className="hero-trust">
            <span>🔒 100% secure</span>
            <span>•</span>
            <span>📱 OTP verified</span>
            <span>•</span>
            <span>🛡️ RLS protected</span>
          </div>
        </div>

        {/* Decorative floating cards */}
        <div className="hero-visual" aria-hidden="true">
          <div className="float-card float-card-1">
            <div className="fc-avatar">A</div>
            <div className="fc-info">
              <div className="fc-name">Anika S.</div>
              <div className="fc-meta">28 • Mumbai • Verified ✓</div>
            </div>
          </div>
          <div className="float-card float-card-2">
            <div className="fc-avatar fc-male">R</div>
            <div className="fc-info">
              <div className="fc-name">Rahul M.</div>
              <div className="fc-meta">32 • Bangalore • Verified ✓</div>
            </div>
          </div>
          <div className="float-card float-card-3">
            <span className="fc-match">💍 New Match!</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section" aria-label="Platform statistics">
        <div className="stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-item">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section" aria-label="Features">
        <div className="section-header">
          <h2 className="section-title">Why Choose ManglaSutra?</h2>
          <p className="section-subtitle">Built with privacy and safety as first-class features</p>
        </div>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="how-section" aria-label="How it works">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
        </div>
        <div className="steps-grid">
          {[
            { n: '01', title: 'Create Profile', desc: 'Sign up with email OTP. Build your detailed profile.' },
            { n: '02', title: 'Verify Mobile', desc: 'Verify your phone number to unlock interest sending.' },
            { n: '03', title: 'Browse & Connect', desc: 'Search profiles with smart filters. Send up to 10 interests/day.' },
            { n: '04', title: 'Mutual Match', desc: 'When both accept, contact details become available after admin approval.' },
          ].map((step) => (
            <div key={step.n} className="step-card">
              <div className="step-number">{step.n}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" aria-label="Call to action">
        <h2>Start Your Journey Today</h2>
        <p>Join thousands of verified profiles finding their life partners</p>
        <Link to="/register">
          <Button variant="primary" size="lg">Create Free Profile →</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-brand">💍 ManglaSutra</div>
        <p className="footer-copy">© 2024 ManglaSutra. Privacy-first matrimony platform.</p>
      </footer>
    </div>
  );
}
