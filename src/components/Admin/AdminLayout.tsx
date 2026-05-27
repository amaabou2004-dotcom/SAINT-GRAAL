import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, Book, Users, Newspaper, Image as ImageIcon, 
  FileText, Mail, Settings, LogOut, Menu, X, Bell, 
  Search, Moon, Sun, ChevronLeft, ChevronRight, Activity, 
  Users2, Megaphone, HelpCircle, ArrowUp, Store, MessageSquare,
  Calendar, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onLogout: () => void;
  userName: string;
  userEmail: string;
  notificationsCount: number;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children, activeTab, setActiveTab, sidebarExpanded, 
  setSidebarExpanded, darkMode, setDarkMode, onLogout,
  userName, userEmail, notificationsCount,
  isMobileMenuOpen, setIsMobileMenuOpen
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setShowScrollTop(scrollContainerRef.current.scrollTop > 300);
    }
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'books', label: 'Catalogue Livres', icon: Book },
    { id: 'authors', label: 'Gestion Auteurs', icon: Users },
    { id: 'regAuthors', label: 'Comptes & Rôles', icon: Users2 },
    { id: 'news', label: 'Actualités & Blog', icon: Newspaper },
    { id: 'testimonials', label: 'Témoignages', icon: MessageSquare },
    { id: 'faq', label: 'Foire Aux Questions', icon: HelpCircle },
    { id: 'gallery', label: 'Médiathèque', icon: ImageIcon },
    { id: 'contests', label: 'Espace Concours', icon: Trophy },
    { id: 'agenda', label: 'Agenda & Événements', icon: Calendar },
    { id: 'submissions', label: 'Manuscrits', icon: FileText },
    { id: 'messages', label: 'Messages & Contact', icon: Mail },
    { id: 'newsletter', label: 'Newsletter', icon: Megaphone },
    { id: 'settings', label: 'Paramètres Site', icon: Settings },
  ];

  return (
    <div className={`h-screen flex overflow-hidden ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300 font-sans`}>
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: sidebarExpanded ? 280 : 80,
          x: (typeof window !== 'undefined' && window.innerWidth < 1024) 
              ? (isMobileMenuOpen ? 0 : -280) 
              : 0
        }}
        className={`fixed left-0 top-0 h-full z-[60] flex flex-col border-r ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-xl transition-colors duration-300 lg:translate-x-0`}
      >
        {/* Brand */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-violet rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet/20">
              <Layout className="text-white w-6 h-6" />
            </div>
            {(sidebarExpanded || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
              <span className="font-black text-lg tracking-tight whitespace-nowrap">GRAAL ADMIN</span>
            )}
          </div>
          <button 
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMobileMenuOpen(false);
              } else {
                setSidebarExpanded(!sidebarExpanded);
              }
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            {window.innerWidth < 1024 ? <X className="w-5 h-5" /> : sidebarExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative cursor-pointer ${
                activeTab === item.id 
                  ? 'bg-violet text-white shadow-lg shadow-violet/20' 
                  : 'text-gray-500 hover:bg-violet/5 hover:text-violet dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              {(sidebarExpanded || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
                <span className="font-bold text-sm tracking-wide">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <div className="w-10 h-10 rounded-full bg-violet/20 flex items-center justify-center text-violet font-bold">
              {userName.charAt(0)}
            </div>
            {(sidebarExpanded || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
              </div>
            )}
            {(sidebarExpanded || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
              <button 
                onClick={onLogout}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main 
        className={`flex-1 flex flex-col transition-all duration-300 h-screen overflow-hidden ${sidebarExpanded ? 'lg:pl-[280px]' : 'lg:pl-[80px]'}`}
      >
        {/* Header */}
        <header className={`h-20 flex-shrink-0 border-b flex items-center justify-between px-4 md:px-8 backdrop-blur-md ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 lg:hidden text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher sur la plateforme..."
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl border-2 transparent focus:border-violet outline-none text-sm transition-all ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-50'}`}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="relative">
              <button 
                onClick={() => setActiveTab('settings')}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {notificationsCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
                    {notificationsCount}
                  </span>
                )}
              </button>
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold hidden sm:block">{userName}</span>
              <div className="w-10 h-10 bg-violet/10 dark:bg-violet/20 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                <Users className="w-6 h-6 text-violet/60" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden relative custom-scrollbar scroll-smooth"
        >
          <div className="max-w-[1400px] mx-auto pb-20 lg:pb-0">
            {children}
          </div>

          {/* Scroll to Top Button */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                onClick={scrollToTop}
                className={`fixed right-8 bottom-8 z-[100] p-4 rounded-2xl shadow-2xl transition-all cursor-pointer hover:scale-110 active:scale-95 ${
                  darkMode ? 'bg-violet text-white shadow-violet/40' : 'bg-white text-violet shadow-gray-200 border border-gray-100'
                }`}
                title="Retour en haut"
              >
                <ArrowUp className="w-6 h-6" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
