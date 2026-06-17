"use client";

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer-section text-white pt-5 pb-4">
      <div className="container">
        {/* Top Section */}
        <div className="row gy-5 mb-5">
          {/* Column 1 - Brand */}
          <div className="col-lg-3 col-md-6">
            <Link href="/" className="text-decoration-none d-flex align-items-center mb-4">
              <span className="brand-text-kalki-footer">ANVAYA360</span>
            </Link>
            <p className="text-white-50 mb-4 pe-lg-3 small">
              Smarter property operations. Connected digital ecosystems. Built for global portfolios.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="social-link"><i className="bi bi-linkedin"></i></a>
              <a href="#" className="social-link"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="social-link"><i className="bi bi-github"></i></a>
            </div>
          </div>

          {/* Column 2 - Product */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold text-white mb-4 text-uppercase small tracking-widest footer-header">Product</h6>
            <ul className="list-unstyled">
              <li className="mb-2.5"><a href="#features" className="text-white-50 footer-link small">Features</a></li>
              <li className="mb-2.5"><a href="#" className="text-white-50 footer-link small">Integrations</a></li>
              <li className="mb-2.5"><a href="#" className="text-white-50 footer-link small">API Access</a></li>
            </ul>
          </div>

          {/* Column 3 - Company */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold text-white mb-4 text-uppercase small tracking-widest footer-header">Company</h6>
            <ul className="list-unstyled">
              <li className="mb-2.5"><a href="#" className="text-white-50 footer-link small">About Us</a></li>
              <li className="mb-2.5"><a href="#" className="text-white-50 footer-link small">Careers</a></li>
              <li className="mb-2.5"><a href="#" className="text-white-50 footer-link small">Blog</a></li>
              <li className="mb-2.5"><a href="#" className="text-white-50 footer-link small">Contact</a></li>
            </ul>
          </div>

          {/* Column 4 - Resources */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold text-white mb-4 text-uppercase small tracking-widest footer-header">Resources</h6>
            <ul className="list-unstyled">
              <li className="mb-2.5"><a href="#" className="text-white-50 footer-link small">Help Center</a></li>
              <li className="mb-2.5"><a href="#" className="text-white-50 footer-link small">Documentation</a></li>
              <li className="mb-2.5"><a href="#" className="text-white-50 footer-link small">Privacy Policy</a></li>
              <li className="mb-2.5"><a href="#" className="text-white-50 footer-link small">Terms of Service</a></li>
            </ul>
          </div>

          {/* Column 5 - Newsletter */}
          <div className="col-lg-3 col-md-12 mt-lg-0 mt-4">
            <h6 className="fw-bold text-white mb-4 text-uppercase small tracking-widest footer-header">Stay Updated</h6>
            <p className="text-white-50 small mb-4">Subscribe for product releases and operation insights.</p>
            <div className="newsletter-box d-flex">
              <input 
                type="email" 
                className="form-control bg-white bg-opacity-5 border-white border-opacity-10 text-white rounded-start-pill px-3" 
                placeholder="Enter email" 
                style={{ height: '44px', fontSize: '0.85rem' }}
              />
              <button className="btn btn-orange-nav rounded-end-pill px-4 fw-bold text-white text-nowrap" style={{ fontSize: '0.75rem' }} type="button">Subscribe</button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 border-top border-white border-opacity-5">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <p className="text-white-50 small mb-0">© 2026 ANVAYA360. All rights reserved.</p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="d-flex justify-content-center justify-content-md-end gap-4">
                <a href="#" className="text-white-50 text-decoration-none small hover-text-orange">Privacy</a>
                <a href="#" className="text-white-50 text-decoration-none small hover-text-orange">Terms</a>
                <a href="#" className="text-white-50 text-decoration-none small hover-text-orange">Security</a>
                <a href="#" className="text-white-50 text-decoration-none small hover-text-orange">Status</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@900&family=Orbitron:wght@900&display=swap');

        .footer-section {
          background-color: #0b0f19;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .brand-text-kalki-footer {
          font-family: 'Cinzel', 'Orbitron', serif;
          font-weight: 900;
          font-size: 1.3rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: linear-gradient(135deg, #ffe066 0%, #ff7a00 40%, #ff5500 75%, #cc2200 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0px 2px 4px rgba(255, 85, 0, 0.15));
        }

        .footer-header {
          font-size: 0.75rem;
          color: #ffffff !important;
          letter-spacing: 0.08em;
        }

        .footer-link {
          text-decoration: none;
          transition: all 0.2s ease-in-out;
        }

        .footer-link:hover, .hover-text-orange:hover {
          color: #ff7a00 !important;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          transition: all 0.2s ease-in-out;
        }

        .social-link:hover {
          background: #ff7a00;
          color: #ffffff;
          border-color: #ff7a00;
          transform: translateY(-2px);
        }

        .newsletter-box input:focus {
          background-color: rgba(255, 255, 255, 0.08) !important;
          border-color: #ff7a00 !important;
          color: #ffffff !important;
          box-shadow: none !important;
        }

        .mb-2.5 {
          margin-bottom: 10px;
        }
      `}</style>
    </footer>
  );
}
