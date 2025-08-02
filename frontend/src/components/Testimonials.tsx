import React from 'react';

const Testimonials: React.FC = () => {
  return (
    <section className="testimonials" id="testimonials">
      <div className="container">
        <h2 className="section-title">Stories of Connection</h2>
        <p className="section-subtitle">Real experiences from families using ECHO</p>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p className="testimonial-quote">"ECHO helped my mother remember my name when I visited. For the first time in months, she smiled and said 'Hello, Ananya.' It felt like having her back."</p>
            <div className="testimonial-author">
              <div className="author-avatar">A</div>
              <div className="author-info">
                <h4>Ananya Sharma</h4>
                <p>Daughter & Primary Caregiver</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-quote">"The gentle voice reminders help Dad stay calm when he's confused. ECHO doesn't just provide information—it provides comfort."</p>
            <div className="testimonial-author">
              <div className="author-avatar">R</div>
              <div className="author-info">
                <h4>Raj Patel</h4>
                <p>Son & Technology Advocate</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-quote">"As someone with early-stage Alzheimer's, ECHO gives me confidence. I know I can ask about anyone or anywhere, and get a kind, helpful answer."</p>
            <div className="testimonial-author">
              <div className="author-avatar">M</div>
              <div className="author-info">
                <h4>Meena K.</h4>
                <p>ECHO User</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 