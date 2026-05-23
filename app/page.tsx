"use client";

export default function Home() {
  return (
    <div className="page">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          {/* شعار الموقع */}
          <div className="logo-mark"></div>
          <span className="logo-text">NovaClip</span>
        </div>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#testimonials">Testimonials</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <button className="cta-btn">Get Started</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <h1>Build Websites with AI</h1>
        <p>From idea to full product in seconds.</p>
        <div className="hero-actions">
          <button className="primary-btn">Start Free</button>
          <button className="secondary-btn">Watch Demo</button>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features">
        <h2>Features</h2>
        <div className="grid">
          <div className="card">
            <h3>⚡ Instant Generation</h3>
            <p>Turn ideas into websites instantly.</p>
          </div>
          <div className="card">
            <h3>🎨 Modern Design</h3>
            <p>Responsive, clean, and futuristic UI.</p>
          </div>
          <div className="card">
            <h3>🔧 Customizable</h3>
            <p>Edit and refine your site easily.</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="pricing">
        <h2>Pricing</h2>
        <div className="plans">
          <div className="plan">
            <h3>Starter</h3>
            <p>$0 / month</p>
            <ul>
              <li>Basic AI generation</li>
              <li>Community support</li>
            </ul>
            <button>Choose</button>
          </div>
          <div className="plan highlight">
            <h3>Pro</h3>
            <p>$19 / month</p>
            <ul>
              <li>Advanced AI builder</li>
              <li>Premium templates</li>
              <li>Priority support</li>
            </ul>
            <button>Choose</button>
          </div>
          <div className="plan">
            <h3>Enterprise</h3>
            <p>Custom</p>
            <ul>
              <li>Unlimited projects</li>
              <li>Dedicated support</li>
            </ul>
            <button>Contact Us</button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="testimonials">
        <h2>What People Say</h2>
        <div className="quotes">
          <blockquote>
            "NovaClip built my startup site in minutes!"
            <footer>- Sarah, Founder</footer>
          </blockquote>
          <blockquote>
            "The design quality is stunning."
            <footer>- Ahmed, Designer</footer>
          </blockquote>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq">
        <h2>FAQ</h2>
        <details>
          <summary>How does it work?</summary>
          <p>Just describe your idea, and AI generates a full site.</p>
        </details>
        <details>
          <summary>Can I edit the site?</summary>
          <p>Yes, you can customize everything.</p>
        </details>
        <details>
          <summary>Is there a free plan?</summary>
          <p>Yes, start free with basic features.</p>
        </details>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2026 NovaClip. All rights reserved.</p>
      </footer>

      {/* STYLE */}
      <style jsx>{`
        .page {
          font-family: Inter, sans-serif;
          background: #0b0b0f;
          color: white;
        }
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          background: rgba(255,255,255,0.05);
          position: sticky;
          top: 0;
          backdrop-filter: blur(10px);
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-mark {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          box-shadow: 0 0 10px rgba(59,130,246,0.7);
        }
        .logo-text {
          font-weight: 800;
          font-size: 18px;
          letter-spacing: 1px;
        }
        .nav-links {
          display: flex;
          gap: 20px;
          list-style: none;
        }
        .nav-links a {
          color: #9ca3af;
          text-decoration: none;
        }
        .cta-btn {
          background: linear-gradient(135deg,#3b82f6,#8b5cf6);
          border: none;
          padding: 10px 20px;
          border-radius: 999px;
          color: white;
          cursor: pointer;
        }
        .hero {
          text-align: center;
          padding: 100px 20px;
        }
        .hero h1 {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .hero-actions {
          display: flex;
          gap: 20px;
          justify-content: center;
        }
        .primary-btn {
          background: #3b82f6;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          color: white;
          cursor: pointer;
        }
        .secondary-btn {
          background: transparent;
          border: 1px solid #3b82f6;
          padding: 12px 24px;
          border-radius: 8px;
          color: #3b82f6;
          cursor: pointer;
        }
        .features, .pricing, .testimonials, .faq {
          padding: 80px 20px;
          text-align: center;
        }
        .grid {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-top: 30px;
        }
        .card {
          background: #14141b;
          padding: 20px;
          border-radius: 12px;
          width: 250px;
        }
        .plans {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-top: 30px;
        }
        .plan {
          background: #14141b;
          padding: 20px;
          border-radius: 12px;
          width: 250px;
        }
        .highlight {
          border: 2px solid #3b82f6;
        }
        .quotes {
          display: flex;
          gap: 40px;
          justify-content: center;
          margin-top: 30px;
        }
        blockquote {
          background: #14141b;
          padding: 20px;
          border-radius: 12px;
          max-width: 300px;
        }
        .faq details {
          background: #14141b;
          margin: 10px auto;
          padding: 10px;
          border-radius: 8px;
          max-width: 600px;
          text-align: left;
        }
        .footer {
          text-align: center;
          padding: 20px;
          background: rgba(255,255,255,0.05);
        }
        @media(max-width:900px){
          .grid, .plans, .quotes {
            flex-direction: column;
            align-items: center;
          }
          .hero h1 {
            font-size: 40px;
          }
        }
      `}</style>
    </div>
  );
}
