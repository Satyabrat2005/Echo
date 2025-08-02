import React, { useState } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import VoiceModal from './components/VoiceModal';
import { SparkleParticles } from './components/SparkleParticles';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="App">
      <a href="#main-content" className="accessibility-skip">Skip to main content</a>
      
      <Navigation />
      
      <SparkleParticles 
        className="particles-background"
        maxParticleSize={2}
        baseDensity={50}
        maxSpeed={0.8}
        maxOpacity={0.6}
        particleColor="#646cff"
        enableHoverGrab={true}
        hoverMode="grab"
        zIndexLevel={0}
        clickEffect={false}
      />
      
      <Hero onAddSpeech={openModal} />
      
      <HowItWorks />
      
      <Testimonials />
      
      <Footer />
      
      <VoiceModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </div>
  );
}

export default App;
