import React, { useEffect, useState } from 'react';
import { X, Mail, Github, Linkedin, MessageCircle, Phone } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  personalConfig: {
    email: string;
    github: string;
    linkedin: string;
    telegram?: string;
    whatsapp?: string;
    name: string;
  };
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, personalConfig }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal closes
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const contactOptions = [
    {
      icon: Mail,
      label: 'Email',
      value: personalConfig.email,
      href: `mailto:${personalConfig.email}`,
      color: 'from-emerald-500 to-teal-500',
      description: 'Drop me a line'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      value: 'Professional Profile',
      href: personalConfig.linkedin,
      color: 'from-blue-500 to-cyan-500',
      description: 'Connect professionally'
    },
    {
      icon: Github,
      label: 'GitHub',
      value: 'Code Repository',
      href: personalConfig.github,
      color: 'from-gray-500 to-slate-500',
      description: 'Check out my projects'
    },
    ...(personalConfig.telegram ? [{
      icon: MessageCircle,
      label: 'Telegram',
      value: '@' + personalConfig.telegram,
      href: `https://t.me/${personalConfig.telegram}`,
      color: 'from-sky-500 to-blue-500',
      description: 'Quick chat'
    }] : []),
    ...(personalConfig.whatsapp ? [{
      icon: Phone,
      label: 'WhatsApp',
      value: 'Message me',
      href: `https://wa.me/${personalConfig.whatsapp}`,
      color: 'from-green-500 to-emerald-500',
      description: 'Instant messaging'
    }] : [])
  ];

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md transform transition-all duration-300 ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        {/* Glow effect */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 blur-xl opacity-75" />
        
        {/* Modal content */}
        <div className="relative rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-violet-500/30 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative p-6 pb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-cyan-600/10" />
            <div className="relative flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-thin text-white tracking-tight">
                  Get in Touch
                </h3>
                <p className="text-white/60 text-sm mt-1 font-light">
                  Let's start a conversation
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200 group"
              >
                <X className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Contact options */}
          <div className="p-6 pt-2 space-y-3">
            {contactOptions.map((option, index) => (
              <a
                key={option.label}
                href={option.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group block p-4 rounded-2xl bg-gradient-to-r from-gray-800/40 to-gray-700/40 border border-violet-500/20 hover:border-violet-400/40 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 shadow-lg hover:shadow-xl hover:shadow-violet-500/20 transform ${
                  isVisible ? 'animate-slideUpFade' : 'opacity-0'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${option.color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <option.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium group-hover:text-violet-300 transition-colors">
                          {option.label}
                        </p>
                        <p className="text-white/60 text-sm group-hover:text-white/80 transition-colors">
                          {option.description}
                        </p>
                      </div>
                      <p className="text-white/40 text-xs font-light group-hover:text-white/60 transition-colors">
                        {option.value}
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 pt-4 border-t border-violet-500/20">
            <p className="text-center text-white/50 text-sm font-light">
              Looking forward to hearing from you! 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;