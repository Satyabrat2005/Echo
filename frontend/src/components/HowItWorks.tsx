import React from 'react';

const HowItWorks: React.FC = () => {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <h2 className="section-title">How ECHO Works</h2>
        <p className="section-subtitle">Simple steps to create lasting memory connections</p>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon">၊၊||၊</div>
            <h3 className="step-title">Speak or Upload</h3>
            <p className="step-description">Record a voice memory or upload an existing audio note. Share names, faces, places, and special moments.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon">⎚-⎚</div>
            <h3 className="step-title">ECHO Processes</h3>
            <p className="step-description">Our AI analyzes and anchors the memory with context, emotions, and relationships for future recall.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon">ᯓ➤</div>
            <h3 className="step-title">Gentle Reminders</h3>
            <p className="step-description">Caregivers receive alerts and reminders, while patients get warm, empathetic responses when they need them.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 