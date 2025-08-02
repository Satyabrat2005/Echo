import React from 'react';

const Navigation: React.FC = () => {
  return (
    <nav className="nav">
      <div className="container">
        <div className="nav-container">
          <div className="logo">
            <img 
              src="/src/assets/Echo-logo.png" 
              alt="ECHO Logo" 
              style={{ height: '3.5rem', verticalAlign: 'middle', marginRight: '10px' }} 
              className="logo-img"
            />
            ECHO
          </div>
          <ul className="nav-links">
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#testimonials">Stories</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 