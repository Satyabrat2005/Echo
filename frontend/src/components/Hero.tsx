import React from 'react';

interface HeroProps {
  onAddSpeech: () => void;
}

const Hero: React.FC<HeroProps> = ({ onAddSpeech }) => {
  return (
    <section className="hero" id="main-content">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Reimagining <span className="hero-highlight">Memories</span> with AI</h1>
            <p>ECHO is your voice-powered memory assistant for Alzheimer's care. Empower caregivers. Anchor memories. Respond with empathy.</p>
            <div className="cta-buttons">
              <button className="btn btn-primary" onClick={onAddSpeech}>
                🎤 Add Speech
              </button>
              <button className="btn btn-secondary">
                🔊 Listen to ECHO
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="echo-device"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 