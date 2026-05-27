import React, { useState, useEffect } from 'react';
import { Home, Book, Users, Newspaper, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const BottomNav: React.FC = () => {
  const [activeHash, setActiveHash] = useState(window.location.hash || '#');

  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash || '#');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navItems = [
    { name: "Accueil", href: "#", icon: Home },
    { name: "Catalogue", href: "#catalogue", icon: Book },
    { name: "Auteurs", href: "#auteurs", icon: Users },
    { name: "Actualités", href: "#actualites", icon: Newspaper },
    { name: "Soumissions", href: "#soumissions", icon: BookOpen },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 h-20 bg-white/80 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]" aria-label="Menu mobile">
      <div className="flex justify-between items-center max-w-md mx-auto h-full px-2">
        {navItems.map((item) => {
          const isActive = activeHash === item.href || (item.href === '#' && activeHash === '');
          
          return (
            <a
              key={item.name}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.name}
              className={`relative flex flex-col items-center justify-center gap-1.5 transition-all duration-300 focus:outline-none ${
                isActive ? 'text-violet' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-violet ${
                isActive ? 'bg-violet/10 scale-110' : 'hover:bg-gray-50'
              }`}>
                <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} aria-hidden="true" />
              </div>
              
              <span className={`text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                isActive ? 'opacity-100 transform translate-y-0' : 'opacity-60'
              }`}>
                {item.name}
              </span>

              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-active"
                  className="absolute -top-2 w-1 h-1 bg-violet rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
};
