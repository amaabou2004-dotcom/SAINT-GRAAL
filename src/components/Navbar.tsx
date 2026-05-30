import React from 'react';
import { Menu, X, LogOut, User, Settings, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteConfig, RegisteredAuthor, ChatMessage } from '../types';

interface NavbarProps {
  config: SiteConfig;
  currentUser: RegisteredAuthor | null;
  messages: ChatMessage[];
  isAdmin: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  setShowAuthModal: (show: boolean) => void;
  setShowAuthorSpace: (show: boolean) => void;
  setShowAdminLogin: (show: boolean) => void;
  handleLogout: () => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  currentUser,
  messages,
  isAdmin,
  isMenuOpen,
  setIsMenuOpen,
  setShowAuthModal,
  setShowAuthorSpace,
  setShowAdminLogin,
  handleLogout,
  onOpenAdmin
}) => {
  const navLinks = [
    { name: "Accueil", href: "#" },
    { name: "À propos", href: "#apropos" },
    { name: "Catalogue", href: "#catalogue" },
    { name: "Auteurs", href: "#auteurs" },
    { name: "Actualités", href: "#actualites" },
    { name: "Concours", href: "#concours-public" },
    { name: "Agenda", href: "#agenda-public" },
    { name: "Galerie", href: "#galerie" },
    { name: "Soumissions", href: "#soumissions" },
  ];

  const unreadCount = currentUser ? messages.filter(m => m.receiverId === currentUser.id && !m.isRead).length : 0;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="bg-white p-1 md:p-1.5 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center transition-all hover:scale-105 hover:shadow-md hover:border-violet/15 duration-300">
            {config.logo && (
              <img 
                src={config.logo} 
                alt={`Logo ${config.name}`} 
                className="h-11 md:h-14 lg:h-15 w-auto object-contain" 
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="async"
              />
            )}
          </div>
          <div className="hidden sm:block">
            <h1 className="font-black text-xl text-violet tracking-tight leading-none">{config.name.toLowerCase()}</h1>
            <p className="text-[10px] font-bold text-vert tracking-widest mt-1 lowercase">{config.slogan.toLowerCase()}</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-sm font-bold text-gray-600 hover:text-violet transition-colors"
            >
              {link.name}
            </a>
          ))}
          
          <div className="h-6 w-px bg-gray-100" />
          
          <motion.a 
            href="#soumissions"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="hidden lg:flex items-center gap-2 bg-vert text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-colors"
          >
            <BookOpen className="w-4 h-4" /> Soumettre
          </motion.a>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <button 
                onClick={() => setShowAuthorSpace(true)}
                className="flex items-center gap-2 bg-violet/5 text-violet px-4 py-2 rounded-xl font-bold hover:bg-violet/10 transition-colors relative"
              >
                <User className="w-4 h-4" /> Espace Auteur
                {unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-vert text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white font-black"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </button>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="bg-violet text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-violet/20 hover:scale-105 transition-all"
              >
                Connexion Auteur
              </button>
            )}

            {isAdmin && (
              <button 
                onClick={() => onOpenAdmin ? onOpenAdmin() : setShowAdminLogin(true)}
                className="flex items-center gap-2 bg-violet text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-violet/20 hover:scale-105 transition-all"
              >
                <Settings className="w-4 h-4" /> Admin
              </button>
            )}

            {currentUser && (
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 text-violet hover:bg-violet/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet transition-all"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-gray-100 max-h-[calc(100vh-5rem)] overflow-y-auto overflow-x-hidden"
          >
            <div className="px-4 py-8 space-y-6">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-lg font-bold text-gray-600 hover:text-violet"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-6 border-t border-gray-50 space-y-3">
                <a 
                  href="#soumissions"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-vert text-white py-4 rounded-xl font-bold shadow-lg shadow-vert/20"
                >
                  <BookOpen className="w-5 h-5" /> Soumettre un Manuscrit
                </a>
                
                {currentUser ? (
                  <div className="space-y-4">
                    <button 
                      onClick={() => { setShowAuthorSpace(true); setIsMenuOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 bg-violet text-white py-4 rounded-xl font-bold"
                    >
                      <User className="w-5 h-5" /> Mon Espace Auteur
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setShowAuthModal(true); setIsMenuOpen(false); }}
                    className="w-full bg-violet text-white py-4 rounded-xl font-bold"
                  >
                    Connexion Auteur
                  </button>
                )}

                {isAdmin && (
                  <button 
                    onClick={() => { onOpenAdmin ? onOpenAdmin() : setShowAdminLogin(true); setIsMenuOpen(false); }}
                    className="w-full bg-violet text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-4"
                  >
                    <Settings className="w-5 h-5" /> Tableau de Bord Admin
                  </button>
                )}

                {currentUser && (
                  <button onClick={handleLogout} className="w-full text-red-500 font-bold py-2 mt-4">Déconnexion</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
