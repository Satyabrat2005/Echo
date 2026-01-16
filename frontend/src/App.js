import React, { useState } from 'react';
import Navbar from './landing/Navbar';
import TeamPage from './landing/TeamPage';
import './App.css';


import ListenToEchoModal from './modals/ListenToEchoModal';
import AddMomentModal from './modals/AddMomentModal';
import RecordMemoryModal from './modals/RecordMemoryModal';
import MemoryJournalModal from './modals/MemoryJournalModal';
import RemindersModal from './modals/RemindersModal';
import AddWriteUpModal from './modals/AddWriteUpModal';
import DashboardModal from './modals/DashboardModal';
import ViewportLazyPixelBlast from './components/ViewportLazyPixelBlast';

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [activeModal, setActiveModal] = useState(null);
  const [userProfile, setUserProfile] = useState({ name: 'User', dob: '', gender: '' });

  const handleGetStarted = () => {
    setCurrentPage('dashboard');
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleLogout = () => {
    setCurrentPage('landing');
    setActiveModal(null);
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
  };

  const renderModal = () => {
    switch (activeModal) {
      case 'listen-echo':
        return (
          <ListenToEchoModal
            onClose={handleCloseModal}
          />
        );
      case 'add-moment':
        return (
          <AddMomentModal
            onClose={handleCloseModal}
            onSaveMoment={(title, type) => {
              console.log('Moment saved:', { title, type });
              handleCloseModal();
            }}
          />
        );
      case 'record-memory':
        return (
          <RecordMemoryModal
            onClose={handleCloseModal}
            onSaveMemory={(title, audioBlob) => {
              console.log('Memory saved:', { title, audioBlob });
              handleCloseModal();
            }}
          />
        );
      case 'memory-journal':
        return (
          <MemoryJournalModal
            onClose={handleCloseModal}
          />
        );
      case 'reminders':
        return (
          <RemindersModal
            onClose={handleCloseModal}
          />
        );
      case 'add-writeup':
        return (
          <AddWriteUpModal
            onClose={handleCloseModal}
            onSaveWriteUp={(title, content) => {
              console.log('Write-up saved:', { title, content });
              handleCloseModal();
            }}
          />
        );
      default:
        return null;
    }
  };

  if (currentPage === 'team') {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Navbar onGetStartedClick={handleGetStarted} onTeamClick={() => setCurrentPage('team')} currentPage={currentPage} />
          <TeamPage onBack={() => setCurrentPage('landing')} />
        </div>
      </div>
    );
  }

  if (currentPage === 'dashboard') {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <div style={{ position: 'relative', zIndex: -1 }}>
          <Navbar onGetStartedClick={handleGetStarted} onTeamClick={() => setCurrentPage('team')} currentPage={currentPage} />
          <DashboardModal
            onClose={handleBackToLanding}
            onLogout={() => setCurrentPage('landing')}
            userProfile={userProfile}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', backgroundColor: '#000000' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar onGetStartedClick={handleGetStarted} onTeamClick={() => setCurrentPage('team')} currentPage={currentPage} />
        <main className="pt-16 sm:pt-20">
          <section id="home" className="relative flex flex-col items-center justify-center" style={{ backgroundColor: '#000000', minHeight: '100vh', willChange: 'transform' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <iframe 
                src='https://my.spline.design/claritystream-ffDXp5GK0BOraYABqFxbqISp/' 
                frameBorder='0' 
                width='100%' 
                height='100%'
                title="3D Visualization"
                loading="lazy"
                style={{ display: 'block' }}
              />
              {/* Cover Spline watermark */}
              <div
                className="absolute bottom-0 left-0 right-0 sm:bottom-0 sm:right-0 sm:left-auto pointer-events-none"
                style={{
                  width: '100%',
                  height: '60px',
                  background: '#000000',
                  zIndex: 5
                }}
              />
            </div>
            <div className="relative z-10 text-center px-4 sm:px-6 py-16 sm:py-24">
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight text-white">
                Reimagining <br /> Memories with AI
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 text-white leading-relaxed">
                ECHO helps you capture, organize, and revisit life's precious moments through speech. Stay connected to your memories, effortlessly.
              </p>
            </div>
          </section>

          <section id="how-it-works" className="py-12 sm:py-16 md:py-24 lg:py-32 px-4 sm:px-6 relative" style={{ backgroundColor: '#000000' }}>
            <ViewportLazyPixelBlast
              className="absolute inset-0 pointer-events-none hidden sm:block"
              style={{ zIndex: 0 }}
              variant="circle"
              pixelSize={6}
              color="#B19EEF"
              patternScale={3}
              patternDensity={1.2}
              pixelSizeJitter={0.5}
              enableRipples
              rippleSpeed={0.4}
              rippleThickness={0.12}
              rippleIntensityScale={1.5}
              liquid
              liquidStrength={0.12}
              liquidRadius={1.2}
              liquidWobbleSpeed={5}
              speed={0.6}
              edgeFade={0.25}
              transparent
            />
            <div className="max-w-6xl mx-auto relative" style={{ zIndex: 2 }}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-8 sm:mb-10 md:mb-12 text-center text-white">How It Works</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                  {[{title: 'Capture', desc: 'Record memories by speaking naturally to ECHO.'}, {title: 'Organize', desc: 'Your memories are categorized and searchable.'}, {title: 'Revisit', desc: 'Listen back and relive stories anytime.'}].map((step, idx) => (
                    <div key={step.title} className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl text-center transition-all duration-300 hover:scale-105 cursor-pointer group" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center text-base sm:text-lg font-bold text-white" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>{idx + 1}</div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-white">{step.title}</h3>
                      <p className="text-gray-400 text-xs sm:text-sm">{step.desc}</p>
                    </div>
                  ))}
                </div>
            </div>
          </section>

          <section id="features" className="py-12 sm:py-16 md:py-24 lg:py-32 px-4 sm:px-6 relative" style={{ backgroundColor: '#000000' }}>
            <ViewportLazyPixelBlast
              className="absolute inset-0 pointer-events-none hidden sm:block"
              style={{ zIndex: 0 }}
              variant="circle"
              pixelSize={6}
              color="#B19EEF"
              patternScale={3}
              patternDensity={1.2}
              pixelSizeJitter={0.5}
              enableRipples
              rippleSpeed={0.4}
              rippleThickness={0.12}
              rippleIntensityScale={1.5}
              liquid
              liquidStrength={0.12}
              liquidRadius={1.2}
              liquidWobbleSpeed={5}
              speed={0.6}
              edgeFade={0.25}
              transparent
            />
            <div className="max-w-6xl mx-auto relative" style={{ zIndex: 2 }}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-8 sm:mb-10 md:mb-12 text-center text-white">Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {["Secure On-Chain Memory & Logic", "Smart Memory Recall & Caregiver Anchoring", "Emotion & Behavior Detection", "Adaptive AI Reasoning & Empathetic Responses", "Real-Time Caregiver Alerts & Monitoring", "Modular, Extensible Architecture"].map((title) => (
                  <div key={title} className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 cursor-pointer group" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg mb-3 sm:mb-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />
                    <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 text-white">{title}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Short description of a core capability. Fully responsive with Tailwind utility classes.</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="stories" className="py-12 sm:py-16 md:py-24 lg:py-32 px-4 sm:px-6 relative" style={{ backgroundColor: '#000000' }}>
            <ViewportLazyPixelBlast
              className="absolute inset-0 pointer-events-none hidden sm:block"
              style={{ zIndex: 0 }}
              variant="circle"
              pixelSize={6}
              color="#B19EEF"
              patternScale={3}
              patternDensity={1.2}
              pixelSizeJitter={0.5}
              enableRipples
              rippleSpeed={0.4}
              rippleThickness={0.12}
              rippleIntensityScale={1.5}
              liquid
              liquidStrength={0.12}
              liquidRadius={1.2}
              liquidWobbleSpeed={5}
              speed={0.6}
              edgeFade={0.25}
              transparent
            />
            <div className="max-w-6xl mx-auto relative" style={{ zIndex: 2 }}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-8 sm:mb-10 md:mb-12 text-center text-white">Stories</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {["ECHO helped me remember my grandfather's stories.", "We revisit our travel memories together.", "Recording daily moments has been life-changing."].map((quote, i) => (
                  <div key={i} className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 cursor-pointer" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                    <p className="text-xs sm:text-sm leading-relaxed text-gray-300">
                      "{quote}"
                    </p>
                    <div className="mt-3 sm:mt-4 h-1 w-10 sm:w-12 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="resources" className="py-12 sm:py-16 md:py-24 lg:py-32 px-4 sm:px-6 relative" style={{ backgroundColor: '#000000' }}>
            <ViewportLazyPixelBlast
              className="absolute inset-0 pointer-events-none hidden sm:block"
              style={{ zIndex: 0 }}
              variant="circle"
              pixelSize={6}
              color="#B19EEF"
              patternScale={3}
              patternDensity={1.2}
              pixelSizeJitter={0.5}
              enableRipples
              rippleSpeed={0.4}
              rippleThickness={0.12}
              rippleIntensityScale={1.5}
              liquid
              liquidStrength={0.12}
              liquidRadius={1.2}
              liquidWobbleSpeed={5}
              speed={0.6}
              edgeFade={0.25}
              transparent
            />
            <div className="max-w-6xl mx-auto relative" style={{ zIndex: 2 }}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-8 sm:mb-10 md:mb-12 text-center text-white" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>Resources</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {[{title: 'Getting Started', desc: 'Learn the basics of ECHO.'}, {title: 'Tips & Tricks', desc: 'Make the most of your memory journal.'}, {title: 'Support', desc: 'Need help? Start here.'}].map((res) => (
                  <a key={res.title} href="#" className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl block transition-all duration-300 hover:scale-105" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 text-white">{res.title}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">{res.desc}</p>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Modal Overlay */}
      {activeModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div onClick={(e) => e.stopPropagation()}>
            {renderModal()}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
