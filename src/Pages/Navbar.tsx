import React from 'react';
import { ChevronDown, Menu, X, ArrowLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useNavbar } from '../hooks/useNavbar';

interface NavbarProps {
  isAuthenticated: boolean;
  isDropdownOpen: boolean;
  isMobileMenuOpen: boolean;
  onDropdownToggle: () => void;
  onMobileMenuToggle: () => void;
  onLogout: () => void;
  onManualRefresh?: () => void;
  onDebugCache?: () => void;
  onClearCache?: () => void;
  isDevelopment?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  isAuthenticated,
  isDropdownOpen,
  isMobileMenuOpen,
  onDropdownToggle,
  onMobileMenuToggle,
  onLogout,
  onManualRefresh,
  onDebugCache,
  onClearCache,
  isDevelopment = false
}) => {
  const {
    isNavCollapsed,
    isAnimating,
    toggleNavCollapse,
    getNavPositionClasses,
    getNavContentClasses,
    getLogoClasses,
    getExpandableContentClasses,
    navRef
  } = useNavbar();

  const location = useLocation();
  const isWorksRoute = location.pathname.startsWith('/works');

  const handleBackClick = () => {
    window.location.href = '/';
  };

  return (
    <>
      {/* Floating Header - Posizione dinamica */}
      <header 
        ref={navRef}
        className={getNavPositionClasses()}
      >
        <div className={getNavContentClasses()}>
          
          {/* Contenuto della navbar */}
          <div className="flex items-center h-10 relative">
            
            {/* Logo GP - sempre visibile, cliccabile quando collassato */}
            <div 
              className={getLogoClasses()}
              onClick={isNavCollapsed ? toggleNavCollapse : undefined}
              title={isNavCollapsed ? "Espandi navbar" : undefined}
            >
              GP
            </div>
            
            {/* Contenuto espandibile con animazione fluida */}
            <div className={getExpandableContentClasses()}>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                {isWorksRoute ? (
                  <button
                    onClick={handleBackClick}
                    className="text-white text-opacity-90 hover:text-violet-300 transition-all duration-300 text-sm font-medium tracking-wide hover:scale-110 whitespace-nowrap transform flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                ) : (
                  <>
                    <a 
                      href="#about" 
                      className="text-white text-opacity-90 hover:text-violet-300 transition-all duration-300 text-sm font-medium tracking-wide hover:scale-110 whitespace-nowrap transform"
                    >
                      About
                    </a>
                    <a 
                      href="#skills" 
                      className="text-white text-opacity-90 hover:text-cyan-300 transition-all duration-300 text-sm font-medium tracking-wide hover:scale-110 whitespace-nowrap transform"
                    >
                      Skills
                    </a>
                    <a 
                      href="#why-choose" 
                      className="text-white text-opacity-90 hover:text-emerald-300 transition-all duration-300 text-sm font-medium tracking-wide hover:scale-110 whitespace-nowrap transform"
                    >
                      Values
                    </a>
                    <a 
                      href="#contact" 
                      className="text-white text-opacity-90 hover:text-pink-300 transition-all duration-300 text-sm font-medium tracking-wide hover:scale-110 whitespace-nowrap transform"
                    >
                      Contact
                    </a>
                  </>
                )}

                {/* Account menu */}
                {isAuthenticated && (
                  <div className="relative">
                    <button
                      onClick={onDropdownToggle}
                      className="text-white text-opacity-90 hover:text-violet-300 transition-all duration-300 flex items-center gap-2 text-sm font-medium tracking-wide group whitespace-nowrap"
                    >
                      Account
                      <ChevronDown className={`w-3 h-3 transition-all duration-300 group-hover:scale-110 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-4 w-48 bg-black/95 backdrop-blur-xl border border-violet-500 border-opacity-30 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 z-60">
                        {isDevelopment && (
                          <>
                            {onManualRefresh && (
                              <button 
                                onClick={onManualRefresh} 
                                className="block w-full text-left px-6 py-3 text-sm text-white text-opacity-90 hover:text-violet-300 hover:bg-violet-500 hover:bg-opacity-10 transition-all duration-300 rounded-t-2xl"
                              >
                                Refresh Data
                              </button>
                            )}
                            {onDebugCache && (
                              <button 
                                onClick={onDebugCache} 
                                className="block w-full text-left px-6 py-3 text-sm text-white text-opacity-90 hover:text-cyan-300 hover:bg-cyan-500 hover:bg-opacity-10 transition-all duration-300"
                              >
                                Cache Info
                              </button>
                            )}
                            {onClearCache && (
                              <button 
                                onClick={onClearCache} 
                                className="block w-full text-left px-6 py-3 text-sm text-white text-opacity-90 hover:text-orange-300 hover:bg-orange-500 hover:bg-opacity-10 transition-all duration-300"
                              >
                                Clear Cache
                              </button>
                            )}
                            <div className="border-t border-violet-500 border-opacity-20 my-2"></div>
                          </>
                        )}
                        <button 
                          onClick={onLogout} 
                          className="block w-full text-left px-6 py-3 text-sm text-white text-opacity-90 hover:text-red-300 hover:bg-red-500 hover:bg-opacity-10 transition-all duration-300 rounded-b-2xl"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </nav>

              {/* Mobile menu button */}
              <button 
                className="md:hidden text-white text-opacity-90 hover:text-violet-300 transition-all duration-300 ml-6 flex-shrink-0"
                onClick={onMobileMenuToggle}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Pulsante di controllo collapse/expand - solo quando espanso */}
              <button
                onClick={toggleNavCollapse}
                className="text-white text-opacity-60 hover:text-violet-300 transition-all duration-300 hover:scale-110 flex-shrink-0 ml-6 group"
                title="Comprimi navbar"
                disabled={isAnimating}
              >
                <div className="w-4 h-4 rounded-full border border-current group-hover:bg-current group-hover:bg-opacity-20 transition-all duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay - solo se navbar non è collassata */}
      {isMobileMenuOpen && !isNavCollapsed && (
        <div className="md:hidden fixed inset-0 bg-black/95 backdrop-blur-xl z-40 flex items-center justify-center animate-in fade-in-0 duration-300">
          <nav className="text-center space-y-8">
            {isWorksRoute ? (
              <button
                onClick={handleBackClick}
                className="flex items-center justify-center gap-3 text-2xl text-white text-opacity-90 hover:text-violet-300 transition-all duration-300 font-medium tracking-wider hover:scale-110 transform"
              >
                <ArrowLeft className="w-6 h-6" />
                Back
              </button>
            ) : (
              <>
                <a 
                  href="#about" 
                  onClick={onMobileMenuToggle} 
                  className="block text-2xl text-white text-opacity-90 hover:text-violet-300 transition-all duration-300 font-medium tracking-wider hover:scale-110 transform"
                >
                  About
                </a>
                <a 
                  href="#skills" 
                  onClick={onMobileMenuToggle} 
                  className="block text-2xl text-white text-opacity-90 hover:text-cyan-300 transition-all duration-300 font-medium tracking-wider hover:scale-110 transform"
                >
                  Skills
                </a>
                <a 
                  href="#why-choose" 
                  onClick={onMobileMenuToggle} 
                  className="block text-2xl text-white text-opacity-90 hover:text-emerald-300 transition-all duration-300 font-medium tracking-wider hover:scale-110 transform"
                >
                  Values
                </a>
                <a 
                  href="#contact" 
                  onClick={onMobileMenuToggle} 
                  className="block text-2xl text-white text-opacity-90 hover:text-pink-300 transition-all duration-300 font-medium tracking-wider hover:scale-110 transform"
                >
                  Contact
                </a>
              </>
            )}
            {isAuthenticated && (
              <button 
                onClick={onLogout} 
                className="block text-2xl text-white text-opacity-90 hover:text-red-300 transition-all duration-300 font-medium tracking-wider hover:scale-110 transform"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;