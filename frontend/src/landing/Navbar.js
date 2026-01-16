import React, { useState, useEffect } from 'react';

const Navbar = ({ onGetStartedClick, onTeamClick, currentPage = 'landing' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);
  return (
    <nav className={`fixed top-2 sm:top-3 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${mobileMenuOpen ? 'w-11/12' : 'w-full sm:w-auto'}`} style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: mobileMenuOpen ? '24px' : '50px',
      padding: isMobile ? '0 12px' : '0 32px',
      maxWidth: mobileMenuOpen ? 'calc(100vw - 16px)' : 'auto'
    }}>
      <div className="flex justify-between items-center h-12 sm:h-14 md:h-16 px-1 sm:px-2 md:px-4 gap-2 sm:gap-4 md:gap-8">
        <div className="flex items-center flex-shrink-0">
          <img
            src="/Echo-logo.png"
            alt="ECHO Logo"
            className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 mr-1 sm:mr-2 md:mr-4 object-contain rounded-full"
            onError={(e) => { e.target.onerror = null; e.target.src = `${process.env.PUBLIC_URL}/logo192.png`; }}
          />
        </div>
        
        <div className="hidden md:flex space-x-3 lg:space-x-8 items-center">
          {currentPage === 'dashboard' ? (
            <>
              <span className="text-xs lg:text-base font-medium text-white whitespace-nowrap">Dashboard</span>
              <button
                onClick={onGetStartedClick}
                className="px-3 lg:px-5 py-1.5 md:py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 text-xs text-white whitespace-nowrap"
                style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
              >
                Home
              </button>
            </>
          ) : (
            <>
              <a href="#home" className="text-white hover:text-gray-300 transition-colors duration-300 text-xs lg:text-sm font-medium whitespace-nowrap">Home</a>
              <a href="#how-it-works" className="text-white hover:text-gray-300 transition-colors duration-300 text-xs lg:text-sm font-medium whitespace-nowrap">How It Works</a>
              <a href="#features" className="text-white hover:text-gray-300 transition-colors duration-300 text-xs lg:text-sm font-medium whitespace-nowrap">Features</a>
              <a href="#stories" className="text-white hover:text-gray-300 transition-colors duration-300 text-xs lg:text-sm font-medium whitespace-nowrap">Stories</a>
              <a href="#resources" className="text-white hover:text-gray-300 transition-colors duration-300 text-xs lg:text-sm font-medium whitespace-nowrap">Resources</a>
              <a href="#team" onClick={(e) => { e.preventDefault(); onTeamClick && onTeamClick(); }} className="text-white hover:text-gray-300 transition-colors duration-300 text-xs lg:text-sm font-medium whitespace-nowrap">Team</a>
              <button
                onClick={onGetStartedClick}
                className="px-3 lg:px-5 py-1.5 md:py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 text-xs text-white whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.4), rgba(118, 75, 162, 0.4))', border: '1px solid rgba(102, 126, 234, 0.6)' }}
              >
                Get Started
              </button>
            </>
          )}
        </div>
        
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="focus:outline-none text-white p-1.5 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-black bg-opacity-95 backdrop-blur-md rounded-2xl border border-white border-opacity-10 overflow-hidden">
          <div className="flex flex-col py-3 sm:py-4 px-3 sm:px-4 space-y-2 sm:space-y-3">
            {currentPage === 'dashboard' ? (
              <>
                <span className="text-xs sm:text-sm font-medium text-white px-3 sm:px-4 py-2">Dashboard</span>
                <button
                  onClick={() => { onGetStartedClick(); setMobileMenuOpen(false); }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-all duration-300 text-xs text-white text-left hover:bg-white hover:bg-opacity-10"
                  style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                >
                  Home
                </button>
              </>
            ) : (
              <>
                <a href="#home" onClick={() => setMobileMenuOpen(false)} className="text-white hover:bg-white hover:bg-opacity-10 transition-colors duration-300 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg block">Home</a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-white hover:bg-white hover:bg-opacity-10 transition-colors duration-300 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg block">How It Works</a>
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-white hover:bg-white hover:bg-opacity-10 transition-colors duration-300 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg block">Features</a>
                <a href="#stories" onClick={() => setMobileMenuOpen(false)} className="text-white hover:bg-white hover:bg-opacity-10 transition-colors duration-300 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg block">Stories</a>
                <a href="#resources" onClick={() => setMobileMenuOpen(false)} className="text-white hover:bg-white hover:bg-opacity-10 transition-colors duration-300 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg block">Resources</a>
                <a href="#team" onClick={(e) => { e.preventDefault(); onTeamClick && onTeamClick(); setMobileMenuOpen(false); }} className="text-white hover:bg-white hover:bg-opacity-10 transition-colors duration-300 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg block">Team</a>
                <button
                  onClick={() => { onGetStartedClick(); setMobileMenuOpen(false); }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-all duration-300 text-xs text-white mt-1 sm:mt-2 w-full"
                  style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.6), rgba(118, 75, 162, 0.6))', border: '1px solid rgba(102, 126, 234, 0.6)' }}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;


