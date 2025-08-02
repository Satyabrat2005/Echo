import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3><img 
              src="/src/assets/Echo-logo.png" 
              alt="ECHO Logo" 
              style={{ height: '3rem', verticalAlign: 'middle', marginRight: '10px' }} 
              className="logo-img"
            /> ECHO</h3>
            <p>Empowering families affected by Alzheimer's through compassionate AI technology. Creating connections that matter, one memory at a time.</p>
            <div className="social-icons">
              <a href="#" className="social-icon" aria-label="Facebook">
                📘
              </a>
              <a href="#" className="social-icon" aria-label="Twitter">
                🐦
              </a>
              <a href="#" className="social-icon" aria-label="LinkedIn">
                💼
              </a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <ul className="footer-links">
              <li><a href="#">Blog</a></li>
              <li><a href="#">Support</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Partnerships</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Get In Touch</h4>
            <ul className="footer-links">
              <li><a href="#">info@echoai.com</a></li>
              <li><a href="#">+91 98765 43210</a></li>
              <li><a href="#">123 Memory Lane, New Delhi, India</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2025 ECHO. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer; 