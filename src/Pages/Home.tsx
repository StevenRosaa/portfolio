import '../App.tsx'
import '../styles/home.css';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import { usePortfolioCache } from '../hooks/usePortfolioCache.ts';
import { ChevronDown, Github, Linkedin, Mail, Code, Brain, Gamepad2, Zap, Target, Users, Trophy, Clock, Lightbulb } from 'lucide-react';
import Navbar from './Navbar.tsx';
import AnimatedBackground from '../backgrounds/AnimatedBackground.tsx';
import ContactModal from './Contact';

// Mappa delle icone
const iconMap = {
  Brain,
  Code,
  Gamepad2
};

// Icone per la sezione Why Choose Me
const whyChooseMeIcons = {
  Zap,
  Target,
  Users,
  Trophy,
  Clock,
  Lightbulb
};

const defaultGradients = {
  Zap: 'from-yellow-500 to-orange-500',
  Target: 'from-red-500 to-pink-500', 
  Users: 'from-blue-500 to-cyan-500',
  Trophy: 'from-amber-500 to-yellow-500',
  Clock: 'from-green-500 to-emerald-500',
  Lightbulb: 'from-purple-500 to-violet-500'
};

// Componente per il typing effect
type TypingTextProps = {
  text?: string;
  speed?: number;
  delay?: number;
  className?: string;
  showCursor?: boolean;
  onComplete?: () => void;
};

const TypingText = ({ 
  text, 
  speed = 50, 
  delay = 0, 
  className = "", 
  showCursor = false,
  onComplete = () => {} 
}: TypingTextProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;
    
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      } else if (!isComplete) {
        setIsComplete(true);
        onComplete();
      }
    }, currentIndex === 0 ? delay : speed);

    return () => clearTimeout(timer);
  }, [text, currentIndex, speed, delay, isComplete, onComplete]);

  useEffect(() => {
    if (!text) return;
    setDisplayText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  if (!text) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="h-6 bg-gradient-to-r from-violet-600/30 to-cyan-600/30 rounded animate-shimmer"></div>
      </div>
    );
  }

  return (
    <span className={className}>
      {displayText}
      {showCursor && !isComplete && (
        <span className="animate-blink text-violet-400">|</span>
      )}
    </span>
  );
};

// Componente per le animazioni staggered
type StaggeredContentProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  animationType?: "slideUp" | "slideLeft" | "scale" | "glow" | "fadeIn" | "matrix" | "hologram" | "cyberpunk" | "neon" | "quantum";
};

const StaggeredContent = ({ 
  children, 
  delay = 0, 
  className = "",
  animationType = "slideUp" 
}: StaggeredContentProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getAnimationClass = () => {
    switch (animationType) {
      case "slideUp":
        return isVisible ? "animate-slideUpFade" : "opacity-0 translate-y-8";
      case "slideLeft":
        return isVisible ? "animate-slideLeftFade" : "opacity-0 translate-x-8";
      case "scale":
        return isVisible ? "animate-scaleIn" : "opacity-0 scale-95";
      case "glow":
        return isVisible ? "animate-glowIn" : "opacity-0";
      default:
        return isVisible ? "animate-fadeIn" : "opacity-0";
    }
  };

  return (
    <div className={`${className} ${getAnimationClass()}`}>
      {children}
    </div>
  );
};

function Home() {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    
    // Hooks per autenticazione e dati
    const { isAuthenticated, logout } = useAuth();
    
    const handleContactClick = () => {
      setIsContactModalOpen(true);
    };

    const handleScheduleCall = () => {
      // Sostituisci con il tuo link pubblico di Google Calendar
      const calendarLink = 'https://calendar.google.com/calendar/appointments/schedules/YOUR_CALENDAR_ID';
      window.open(calendarLink, '_blank', 'noopener,noreferrer');
    };

    // Hook per i dati del portfolio
    const { 
      data, 
      error, 
      refreshData, 
      clearCache    } = usePortfolioCache();
    
    // Genera posizioni fisse per le stelle usando useMemo
    const starsData = useMemo(() => {
      return [...Array(20)].map((_, i) => ({
        id: i,
        initialLeft: Math.random() * 100,
        initialTop: Math.random() * 100,
        animationDelay: Math.random() * 3,
        animationDuration: 2 + Math.random() * 3,
        left: Math.random() * 100,
        top: Math.random() * 100
      }));
    }, []);

    // State per controllare la posizione delle stelle
    const [, setStars] = useState(starsData);

    // Effetto per cambiare posizione delle stelle ogni 8-12 secondi
    useEffect(() => {
      const changeStarsPosition = () => {
        setStars(prevStars => 
          prevStars.map(star => ({
            ...star,
            left: Math.random() * 100,
            top: Math.random() * 100
          }))
        );
      };

      // Cambia posizione dopo un intervallo casuale tra 8 e 12 secondi
      const randomInterval = 8000 + Math.random() * 4000;
      
      const interval = setInterval(() => {
        changeStarsPosition();
        // Imposta il prossimo intervallo casuale
        clearInterval(interval);
        setTimeout(() => {
          const newInterval = setInterval(changeStarsPosition, 8000 + Math.random() * 4000);
          return () => clearInterval(newInterval);
        }, 8000 + Math.random() * 4000);
      }, randomInterval);

      return () => clearInterval(interval);
    }, []);
    
    // Destrutturazione dei dati dal hook
    const {
      personal: personalConfig,
      about: aboutConfig,
      skills,
      contact: contactConfig,
      whyChooseMe: whyChooseMeConfig
    } = data;
    
    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
    };

    const handleManualRefresh = () => {
      //console.log('🔄 Manual refresh triggered');
      refreshData();
    };

    const handleDebugCache = () => {
      //console.log('📊 Cache Info:', cacheInfo);
    };

    const handleDropdownToggle = () => {
      setDropdownOpen(!isDropdownOpen);
    };

    const handleMobileMenuToggle = () => {
      setMobileMenuOpen(!isMobileMenuOpen);
    };

    
    // Gestione errori
    if (error) {
      //console.warn('Portfolio data error:', error);
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-x-hidden relative">

         {/* Background Animato Modulare */}
        <AnimatedBackground 
          showStars={true}
          showOrbs={true}
          showGrid={true}
          starsCount={20}
        />

        {/* Navbar Component */}
        <Navbar 
          isAuthenticated={isAuthenticated}
          isDropdownOpen={isDropdownOpen}
          isMobileMenuOpen={isMobileMenuOpen}
          onDropdownToggle={handleDropdownToggle}
          onMobileMenuToggle={handleMobileMenuToggle}
          onLogout={handleLogout}
          onManualRefresh={handleManualRefresh}
          onDebugCache={handleDebugCache}
          onClearCache={clearCache}
          isDevelopment={process.env.NODE_ENV === 'development'}
        />
      
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center relative px-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-96 h-96 bg-gradient-to-r from-violet-600/30 via-purple-600/20 to-cyan-600/30 rounded-full blur-3xl animate-pulse glow-effect"></div>
          </div>
          
          <div className="text-center relative z-10 max-w-4xl">
            <div className="mb-12 group">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-thin tracking-tight mb-2 transition-all duration-1000 group-hover:tracking-wider">
                <TypingText 
                  text={personalConfig?.name?.split(' ')[0]} 
                  speed={150}
                  delay={500}
                  className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent hover:from-violet-400 hover:to-cyan-400 transition-all duration-1000 cursor-default drop-shadow-2xl animate-neon stagger-1"
                  showCursor={false}
                />
              </h1>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-thin tracking-tight transition-all duration-1000 group-hover:tracking-wider">
                <TypingText 
                  text={personalConfig?.name?.split(' ')[1]} 
                  speed={150}
                  delay={1000}
                  className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent hover:from-cyan-400 hover:to-violet-400 transition-all duration-1000 cursor-default drop-shadow-2xl animate-cyberpunk stagger-2"
                  showCursor={false}
                />
              </h1>
            </div>
            
            <StaggeredContent delay={2500} animationType="hologram">
              <p className="text-xl md:text-2xl font-light text-white/70 mb-16 leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
                <TypingText 
                  text={personalConfig?.title} 
                  speed={80}
                  delay={0}
                  className=""
                  showCursor={false}
                />
                <span className="animate-matrix stagger-3"> crafting digital experiences through</span>
                <span className="text-violet-400 mx-2 hover:text-violet-300 transition-colors cursor-default drop-shadow-lg animate-quantum stagger-4">AI</span>
                <span className="text-white/40 animate-glowIn stagger-4">×</span>
                <span className="text-cyan-400 mx-2 hover:text-cyan-300 transition-colors cursor-default drop-shadow-lg animate-quantum stagger-5">Code</span>
                <span className="text-white/40 animate-glowIn stagger-5">×</span>
                <span className="text-emerald-400 mx-2 hover:text-emerald-300 transition-colors cursor-default drop-shadow-lg animate-quantum stagger-6">Games</span>
              </p>
            </StaggeredContent>
            
            <StaggeredContent delay={4000} animationType="scale">
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
                <a href="/works" className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-full blur-lg opacity-70 group-hover:opacity-100 group-hover:blur-xl transition-all duration-500"></div>
                  <button className="relative px-8 py-4 bg-white text-black rounded-full font-light tracking-wide hover:bg-white/90 transition-all duration-500 transform hover:scale-105 shadow-2xl">
                    View Work
                  </button>
                </a>
                <button className="px-8 py-4 border border-white/20 text-white rounded-full font-light tracking-wide hover:border-white/40 hover:bg-white/5 hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-500 transform hover:scale-105 backdrop-blur-sm">
                  Download CV
                </button>
              </div>
            </StaggeredContent>
            
            <StaggeredContent delay={4500} animationType="glow">
              <div className="animate-bounce">
                <ChevronDown className="w-6 h-6 mx-auto text-white/40 hover:text-white/60 transition-colors cursor-pointer drop-shadow-lg" />
              </div>
            </StaggeredContent>
          </div>
        </section>
      
        {/* About Section */}
        <section id="about" className="py-32 relative">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <StaggeredContent delay={200} animationType="cyberpunk">
                  <h2 className="text-4xl lg:text-5xl font-thin text-white mb-8 tracking-tight drop-shadow-lg">
                    <TypingText 
                      text={aboutConfig?.title} 
                      speed={100}
                      delay={0}
                      className="animate-neon"
                      showCursor={false}
                    />
                  </h2>
                </StaggeredContent>

                <div className="space-y-6">
                  {aboutConfig?.paragraphs.map((paragraph, index) => (
                    <StaggeredContent 
                      key={index} 
                      delay={800 + (index * 400)} 
                      animationType="matrix"
                    >
                      <p className="text-lg text-white/70 leading-relaxed font-light drop-shadow-sm">
                        <TypingText 
                          text={paragraph} 
                          speed={30}
                          delay={0}
                          className=""
                          showCursor={false}
                        />
                      </p>
                    </StaggeredContent>
                  ))}
                </div>
                
                <StaggeredContent delay={2000} animationType="quantum">
                  <div className="flex space-x-8 pt-8">
                    <a href={personalConfig?.github} target="_blank" rel="noopener noreferrer" className="group">
                      <Github className="w-6 h-6 text-white/50 group-hover:text-white group-hover:scale-110 group-hover:drop-shadow-lg group-hover:shadow-violet-500/50 transition-all duration-500" />
                    </a>
                    <a href={personalConfig?.linkedin} target="_blank" rel="noopener noreferrer" className="group">
                      <Linkedin className="w-6 h-6 text-white/50 group-hover:text-white group-hover:scale-110 group-hover:drop-shadow-lg group-hover:shadow-cyan-500/50 transition-all duration-500" />
                    </a>
                    <a href={`mailto:${personalConfig?.email}`} className="group">
                      <Mail className="w-6 h-6 text-white/50 group-hover:text-white group-hover:scale-110 group-hover:drop-shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-500" />
                    </a>
                  </div>
                </StaggeredContent>
              </div>
              
              <StaggeredContent delay={1200} animationType="hologram">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-cyan-600/30 rounded-3xl blur-2xl animate-pulse"></div>
                  <div className="relative w-full h-96 rounded-3xl bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-md border border-violet-500/30 overflow-hidden group shadow-2xl hover:shadow-violet-500/20 transition-all duration-700">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    {aboutConfig?.imageUrl ? (
                      <img 
                        src={aboutConfig.imageUrl} 
                        alt={personalConfig?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-violet-500/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm border border-violet-500/30">
                            <span className="text-4xl">👨‍💻</span>
                          </div>
                          <p className="text-white/60 text-sm font-light">Your photo here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </StaggeredContent>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-32 relative">
          <div className="max-w-6xl mx-auto px-6">
            <StaggeredContent delay={200} animationType="cyberpunk">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-5xl font-thin text-white mb-6 tracking-tight drop-shadow-lg">
                <TypingText 
                  text="Expertise" 
                  speed={150}
                  delay={0}
                  className="animate-neon"
                  showCursor={false}
                />
              </h2>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent mx-auto"></div>
            </div>
          </StaggeredContent>
            
            <div className="grid gap-8 max-w-4xl mx-auto">
              {skills.map((skill, index) => {
                const IconComponent = iconMap[skill.icon as keyof typeof iconMap] || Code;
                return (
                  <StaggeredContent 
                    key={skill.id} 
                    delay={600 + (index * 300)} 
                    animationType="quantum"
                  >
                    <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-gray-800/40 backdrop-blur-md border border-violet-500/20 hover:border-violet-400/40 transition-all duration-700 hover:scale-[1.02] hover:-translate-y-2 shadow-xl hover:shadow-2xl hover:shadow-violet-500/20">
                      {/* Glow effect sottostante */}
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/5 via-purple-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
                      
                      <div className="relative flex items-start space-x-6">
                        <div className={`p-4 rounded-2xl bg-gradient-to-r ${skill.color_gradient} group-hover:scale-110 group-hover:shadow-2xl transition-all duration-500 shadow-lg`}>
                          <IconComponent className="w-8 h-8 text-white drop-shadow-lg" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-2xl font-medium text-white/95 mb-3 group-hover:text-violet-300 transition-colors duration-500 drop-shadow-sm">
                            <TypingText 
                              text={skill.name} 
                              speed={80}
                              delay={0}
                              className=""
                              showCursor={false}
                            />
                          </h3>
                          <p className="text-white/75 leading-relaxed font-light group-hover:text-white/90 transition-colors duration-500">
                            <TypingText 
                              text={skill.description} 
                              speed={40}
                              delay={500}
                              className=""
                              showCursor={false}
                            />
                          </p>
                        </div>
                      </div>
                    </div>
                  </StaggeredContent>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Choose Me Section */}
        <section id="why-choose" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <StaggeredContent delay={200} animationType="cyberpunk">
              <div className="text-center mb-20">
                <h2 className="text-4xl lg:text-5xl font-thin text-white mb-6 tracking-tight drop-shadow-lg">
                  <TypingText 
                    text={whyChooseMeConfig?.title} 
                    speed={120}
                    delay={0}
                    className="animate-neon"
                    showCursor={false}
                  />
                </h2>
                <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed font-light">
                  <TypingText 
                    text={whyChooseMeConfig?.subtitle} 
                    speed={50}
                    delay={800}
                    className=""
                    showCursor={false}
                  />
                </p>
              </div>
            </StaggeredContent>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {whyChooseMeConfig?.items
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((item, index) => {
                  const IconComponent = whyChooseMeIcons[item.icon as keyof typeof whyChooseMeIcons] || Lightbulb;
                  
                  // Fixed gradient logic - use item.gradient if available, otherwise use default
                  const iconGradient = item.gradient || 
                                      defaultGradients[item.icon as keyof typeof defaultGradients] || 
                                      'from-violet-500 to-purple-500';
                  
                  return (
                    <StaggeredContent 
                      key={item.id} 
                      delay={1000 + (index * 200)} 
                      animationType="hologram"
                    >
                      <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-gray-800/40 backdrop-blur-md border border-violet-500/20 hover:border-violet-400/40 transition-all duration-700 hover:scale-105 hover:-translate-y-3 shadow-xl hover:shadow-2xl hover:shadow-violet-500/25">
                        {/* Effetto glow multiplo */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/5 via-purple-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
                        <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-violet-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700"></div>
                        
                        <div className="relative">
                          {/* Fixed icon container with proper gradient */}
                          <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${iconGradient} mb-6 group-hover:scale-110 group-hover:shadow-2xl transition-all duration-500 shadow-lg`}>
                            <IconComponent className="w-6 h-6 text-white drop-shadow-lg" />
                          </div>
                          
                          <h3 className="text-xl font-medium text-white/95 mb-4 group-hover:text-violet-300 transition-colors duration-500 drop-shadow-sm">
                            <TypingText 
                              text={item.title} 
                              speed={80}
                              delay={0}
                              className=""
                              showCursor={false}
                            />
                          </h3>
                          
                          <p className="text-white/75 leading-relaxed font-light group-hover:text-white/90 transition-colors duration-500">
                            <TypingText 
                              text={item.description} 
                              speed={35}
                              delay={400}
                              className=""
                              showCursor={false}
                            />
                          </p>
                        </div>
                      </div>
                    </StaggeredContent>
                  );
                })}
            </div>
          </div>
</section>

        {/* Contact Section */}
<section id="contact" className="py-32 relative">
  <div className="absolute inset-0 bg-gradient-to-t from-violet-900/20 via-purple-900/10 to-transparent"></div>
  
  <div className="max-w-4xl mx-auto px-6 text-center relative">
    <StaggeredContent delay={200} animationType="neon">
      <h2 className="leading-normal text-5xl lg:text-6xl font-thin bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-8 tracking-tight drop-shadow-2xl">
        <TypingText 
          text={contactConfig?.title} 
          speed={150}
          delay={0}
          className=""
          showCursor={false}
        />
      </h2>
    </StaggeredContent>

    <StaggeredContent delay={800} animationType="matrix">
      <p className="text-xl text-white/70 mb-16 leading-relaxed font-light max-w-2xl mx-auto">
        <TypingText 
          text={contactConfig?.subtitle} 
          speed={60}
          delay={0}
          className=""
          showCursor={false}
        />
      </p>
    </StaggeredContent>
    
    <StaggeredContent delay={1500} animationType="quantum">
      <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
        <button 
          onClick={handleContactClick}
          className="group relative px-8 py-4 rounded-full overflow-hidden shadow-2xl hover:shadow-violet-500/50 transition-all duration-500"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
          <span className="relative text-white font-light tracking-wide drop-shadow-lg">
            <TypingText 
              text={contactConfig?.primaryButton} 
              speed={100}
              delay={0}
              className=""
              showCursor={false}
            />
          </span>
        </button>
        <button 
          onClick={handleScheduleCall}
          className="px-8 py-4 border border-violet-500/30 text-white rounded-full font-light tracking-wide hover:border-violet-400/50 hover:bg-violet-500/10 hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-500 backdrop-blur-sm"
        >
          <TypingText 
            text={contactConfig?.secondaryButton} 
            speed={100}
            delay={200}
            className=""
            showCursor={false}
          />
        </button>
      </div>
    </StaggeredContent>

    <StaggeredContent delay={2200} animationType="hologram">
      <div className="inline-flex items-center space-x-3 text-white/70 hover:text-white/90 transition-colors duration-500 group cursor-pointer">
        <Mail className="w-5 h-5 group-hover:scale-110 group-hover:drop-shadow-lg transition-transform duration-300" />
        <span className="font-light tracking-wide">
          <TypingText 
            text={personalConfig?.email} 
            speed={80}
            delay={0}
            className=""
            showCursor={false}
          />
        </span>
      </div>
    </StaggeredContent>
  </div>
</section>

{/* Contact Modal */}
{personalConfig && (
  <ContactModal 
    isOpen={isContactModalOpen}
    onClose={() => setIsContactModalOpen(false)}
    personalConfig={{
      email: personalConfig.email,
      github: personalConfig.github,
      linkedin: personalConfig.linkedin,
      telegram: personalConfig.telegram, // Aggiungi questo al tuo config se non presente
      whatsapp: personalConfig.whatsapp, // Aggiungi questo al tuo config se non presente
      name: personalConfig.name
    }}
  />
)}
        
        {/* Footer */}
        <footer className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-violet-500/20">
          <div className="absolute inset-0 bg-gradient-to-t from-violet-900/10 to-transparent"></div>
          <div className="max-w-6xl mx-auto px-6 py-12 text-center relative">
            <StaggeredContent delay={300} animationType="cyberpunk">
              <p className="text-white/60 font-light tracking-wide drop-shadow-sm">
                <TypingText 
                  text="© 2025 · Crafted with precision and passion" 
                  speed={80}
                  delay={0}
                  className=""
                  showCursor={false}
                />
              </p>
            </StaggeredContent>
          </div>
        </footer>
      </div>
    );
}

export default Home;