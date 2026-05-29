/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Menu, X, Phone, Book, Users, Newspaper, Send, User, 
  Settings, Plus, Trash2, Edit2, Save, LogOut, Download, Upload,
  ChevronRight, ChevronLeft, MessageSquare, Mail, MapPin, GripVertical, Lock,
  Search, Bell, Eye, EyeOff, Shield, BookOpen, Layout, Globe, Megaphone, HelpCircle, Share2, Star, Quote,
  Facebook, Instagram, MessageCircle, Store as StoreIcon,
  BarChart3, PieChart, Activity, UserPlus, FileText, CheckCircle, AlertCircle, Clock, Moon, Sun, MoreVertical, ExternalLink
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { db, auth } from './firebase';
import { 
  OperationType, Author, BookItem, NewsItem, GalleryItem,
  RegisteredAuthor, ChatMessage, SiteConfig, Submission,
  ContactMessage, AdminLog, NewsletterSubscriber, Store, Testimonial,
  AgendaEvent, SellerRequest, Contest, FAQItem
} from './types';
import { handleFirestoreError } from './lib/utils';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { PublicContests } from './components/PublicContests';
import { APropos } from './components/APropos';
import { FAQManager } from './components/Admin/FAQManager';
import { 
  collection, doc, setDoc, getDoc, onSnapshot, query, 
  orderBy, addDoc, updateDoc, deleteDoc, getDocFromServer,
  where, or, writeBatch, limit
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup
} from 'firebase/auth';
import { generateNotificationContent, generateWelcomeContent, notifySubscribers, generateSubmissionAdminContent, notifyAdmin } from './services/notificationService';

// Admin Components
import { AdminLayout } from './components/Admin/AdminLayout';
import { DashboardHome } from './components/Admin/DashboardHome';
import { BookManager } from './components/Admin/BookManager';
import { SubmissionManager } from './components/Admin/SubmissionManager';
import { SettingsManager } from './components/Admin/SettingsManager';
import { NewsletterManager } from './components/Admin/NewsletterManager';
import { AuthorsManager } from './components/Admin/AuthorsManager';
import { NewsManager } from './components/Admin/NewsManager';
import { GalleryManager } from './components/Admin/GalleryManager';
import { RegisteredAuthorsManager } from './components/Admin/RegisteredAuthorsManager';
import { MessageManager } from './components/Admin/MessageManager';
import { TestimonialsManager } from './components/Admin/TestimonialsManager';
import { AgendaManager } from './components/Admin/AgendaManager';
import { ContestManager } from './components/Admin/ContestManager';

// --- Initial Data ---
const PLACEHOLDER_IMAGE = "https://picsum.photos/seed/book/400/600";
const AUTHOR_PLACEHOLDER = "https://picsum.photos/seed/author/400/400";
const BOOK_GENRES = [
  "SAINT GRAAL IVOIRIEN",
  "IVOIRE STORY"
];

const INITIAL_CONFIG: SiteConfig = {
  name: "Saint Graal Ivoirien",
  slogan: "Saint Graal Ivoirien, l'idéal de l'édition",
  intro: "Une maison d'édition engagée pour la promotion de la culture et des talents littéraires en Côte d'Ivoire et au-delà.",
  whatsapp: "+225 07 47 83 53 28",
  dirName: "M. Pierre Fauste",
  dirRole: "Directeur Général, écrivain engagé",
  dirBio: "Passionné par les lettres et le développement culturel, M. Pierre Fauste dirige Saint Graal Ivoirien avec une vision d'excellence et d'ouverture sur le monde.",
  dirPhoto: "",
  logo: "",
  email: "pierrettefauste@gmail.com",
  formspreeId: "pierrettefauste@gmail.com",
  mktName: "M. Marc Koffi",
  mktRole: "Directeur Marketing",
  mktBio: "Dédié à faire rayonner les auteurs et les ouvrages de Saint Graal Ivoirien auprès des lecteurs d'Afrique et du monde entier, pour donner au livre toute la place qu'il mérite.",
  mktPhoto: ""
};

// --- Components ---

export default function App() {
  const [config, setConfig] = useState<SiteConfig>(INITIAL_CONFIG);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [books, setBooks] = useState<BookItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [newsletter, setNewsletter] = useState<{id: string, email: string, createdAt: string}[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState<{id: string, message: string, type: 'info' | 'success' | 'warning', date: string}[]>([]);
  const [registeredAuthors, setRegisteredAuthors] = useState<RegisteredAuthor[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentUser, setCurrentUser] = useState<RegisteredAuthor | null>(null);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [agendaEvents, setAgendaEvents] = useState<AgendaEvent[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [sellerRequests, setSellerRequests] = useState<SellerRequest[]>([]);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  
  const visibleAuthors = authors.filter(a => !a.isHidden);
  const hiddenAuthorIds = authors.filter(a => a.isHidden).map(a => a.id);
  const visibleBooks = books.filter(b => !hiddenAuthorIds.includes(b.authorId));

  // Determine Author of the Month (Manual selection takes priority, then deterministic rotation)
  const authorOfMonth = useMemo(() => {
    if (visibleAuthors.length === 0) return null;
    const manual = visibleAuthors.find(a => a.isMonthAuthor);
    if (manual) return manual;
    
    // Automatic deterministic rotation
    const now = new Date();
    const monthKey = now.getFullYear() * 12 + now.getMonth();
    // Sort by ID to ensure stable rotation if list order changes in snapshot
    const sortedForRotation = [...visibleAuthors].sort((a, b) => a.id.localeCompare(b.id));
    return sortedForRotation[monthKey % sortedForRotation.length];
  }, [visibleAuthors]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isActuallyAdmin, setIsActuallyAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [autoOpenAddBook, setAutoOpenAddBook] = useState(false);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [checkoutBook, setCheckoutBook] = useState<BookItem | null>(null);
  const [checkoutForm, setCheckoutForm] = useState({
    lastName: '',
    firstName: '',
    deliveryAddress: ''
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [showAuthorSpace, setShowAuthorSpace] = useState(false);
  const [activeChatPartnerId, setActiveChatPartnerId] = useState<string | null>(null);
  const [chatSearch, setChatSearch] = useState("");
  const [adminRegAuthorSearch, setAdminRegAuthorSearch] = useState("");
  const [adminAuthorSearch, setAdminAuthorSearch] = useState("");
  const [adminBookSearch, setAdminBookSearch] = useState("");
  const [catalogueSearch, setCatalogueSearch] = useState("");
  const [catalogueGenre, setCatalogueGenre] = useState("Tous");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<{ id: string; title: string; type: 'book' | 'author' }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const [dbStatus, setDbStatus] = useState<'connected' | 'error' | 'checking'>('checking');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);

  useEffect(() => {
    if (adminClickCount > 0) {
      const timer = setTimeout(() => setAdminClickCount(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [adminClickCount]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutBook) return;

    const nom = checkoutForm.lastName.trim();
    const prenom = checkoutForm.firstName.trim();
    const adresse = checkoutForm.deliveryAddress.trim();

    // Construct WhatsApp message elegantly
    let message = `Bonjour, je souhaite commander le livre : *${checkoutBook.title}*\n\n`;
    message += `📋 *Détails de la commande :*\n`;
    if (prenom || nom) {
      message += `• *Nom & Prénom :* ${prenom} ${nom}\n`;
    }
    if (adresse) {
      message += `• *Adresse de livraison :* ${adresse}\n`;
    } else {
      message += `• *Adresse de livraison :* Non spécifiée / Retrait\n`;
    }

    const whatsappUrl = `https://wa.me/${config.whatsapp.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Close checkout modal & reset form
    setCheckoutBook(null);
    setCheckoutForm({ lastName: '', firstName: '', deliveryAddress: '' });
  };

  // --- SEO Optimization ---
  const currentTitle = useMemo(() => {
    if (selectedBook) {
      const authorName = authors.find(a => a.id === selectedBook.authorId)?.name || 'Saint Graal Ivoirien';
      return `${selectedBook.title} par ${authorName} | Livre - ${config.name}`;
    }
    if (selectedAuthor) {
      return `${selectedAuthor.name} - Biographie de l'Auteur | ${config.name}`;
    }
    return `${config.name} | ${config.slogan || "Maison d'Édition en Côte d'Ivoire"}`;
  }, [selectedBook, selectedAuthor, config, authors]);

  const currentDesc = useMemo(() => {
    if (selectedBook) {
      return `Découvrez "${selectedBook.title}", un superbe livre de genre ${selectedBook.genre} par ${authors.find(a => a.id === selectedBook.authorId)?.name || 'notre auteur'}. Commandez maintenant sur ${config.name}.`;
    }
    if (selectedAuthor) {
      return `Découvrez la biographie littéraire, le parcours et les œuvres de ${selectedAuthor.name}, auteur édité par la prestigieuse maison d'édition ${config.name}.`;
    }
    return config.intro || "Découvrez notre maison d'édition de livres d'excellence en Côte d'Ivoire. Romans, poésie, essais ivoiriens.";
  }, [selectedBook, selectedAuthor, config, authors]);

  const currentImage = useMemo(() => {
    if (selectedBook) return selectedBook.cover;
    if (selectedAuthor) return selectedAuthor.photo;
    return config.logo || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=1200';
  }, [selectedBook, selectedAuthor, config]);

  const keywordsString = useMemo(() => {
    const authorNames = visibleAuthors.map(a => a.name).slice(0, 15).join(', ');
    const bookTitles = visibleBooks.map(b => b.title).slice(0, 15).join(', ');
    return `${config.name}, maison d'édition Côte d'Ivoire, maison d'édition Abidjan, éditer un livre en côte d'ivoire, imprimer son livre Abidjan, envoyer manuscrit, éditeur ivoirien, littérature ivoirienne, publier un roman, ${authorNames}, ${bookTitles}`;
  }, [visibleAuthors, visibleBooks, config]);

  const structuredData = useMemo(() => {
    if (!config.name) return null;
    
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": ["Organization", "LocalBusiness"],
      "@id": `${window.location.origin}/#organization`,
      "name": config.name,
      "slogan": config.slogan,
      "url": window.location.origin,
      "logo": config.logo,
      "image": config.logo || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=1200',
      "description": config.intro,
      "email": config.email,
      "telephone": config.whatsapp,
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Abidjan, Cocody",
        "addressLocality": "Abidjan",
        "addressRegion": "Abidjan",
        "addressCountry": "CI"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "5.3600",
        "longitude": "-4.0083"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        "opens": "08:00",
        "closes": "18:00"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": config.whatsapp,
        "contactType": "customer service",
        "areaServed": "CI",
        "availableLanguage": "French"
      }
    };

    const graph: any[] = [organizationSchema];

    // Add primary WebSite Schema to support direct Sitelinks Search Box
    graph.push({
      "@type": "WebSite",
      "@id": `${window.location.origin}/#website`,
      "url": window.location.origin,
      "name": config.name,
      "description": config.intro,
      "publisher": { "@id": `${window.location.origin}/#organization` },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${window.location.origin}/?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    });

    // Add authors
    visibleAuthors.forEach(author => {
      graph.push({
        "@type": "Person",
        "@id": `${window.location.origin}/#author-${author.id}`,
        "name": author.name,
        "description": author.bio,
        "image": author.photo,
        "worksFor": { "@id": `${window.location.origin}/#organization` }
      });
    });

    // Add books
    visibleBooks.forEach(book => {
      const authorVal = authors.find(a => a.id === book.authorId);
      graph.push({
        "@type": "Book",
        "@id": `${window.location.origin}/#book-${book.id}`,
        "name": book.title,
        "author": authorVal ? {
          "@type": "Person",
          "@id": `${window.location.origin}/#author-${authorVal.id}`,
          "name": authorVal.name
        } : {
          "@type": "Person",
          "name": "Auteur Inconnu"
        },
        "description": book.summary || book.description,
        "image": book.cover,
        "genre": book.genre,
        "bookFormat": "https://schema.org/Hardcover",
        "publisher": { "@id": `${window.location.origin}/#organization` },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "XOF",
          "availability": "https://schema.org/InStock",
          "url": `${window.location.origin}/?book=${book.id}`,
          "price": book.price || "5000",
          "seller": { "@id": `${window.location.origin}/#organization` }
        }
      });
    });

    return {
      "@context": "https://schema.org",
      "@graph": graph
    };
  }, [visibleAuthors, visibleBooks, config, authors]);

  // --- Firebase Sync ---

  useEffect(() => {
    // One-time migration for order field
    const migrateOrders = async () => {
      if (books.length > 0 && books.some(b => b.order === undefined)) {
        try {
          const batch = writeBatch(db);
          books.forEach((book, index) => {
            if (book.order === undefined) {
              batch.update(doc(db, 'books', book.id), { order: index });
            }
          });
          await batch.commit();
          console.log("Migration: Orders updated");
        } catch (err) {
          console.error("Migration failed", err);
        }
      }
    };
    migrateOrders();
  }, [books]);

  useEffect(() => {
    // 1. Monitor Connection Status & Public Config
    const unsubConfig = onSnapshot(doc(db, 'config', 'main'), { includeMetadataChanges: true }, (snap) => {
      if (snap.exists()) setConfig(snap.data() as SiteConfig);
      if (!snap.metadata.fromCache) {
        setDbStatus('connected');
      }
    }, (err) => {
      setDbStatus('error');
      // Only log if it's not a temporary offline error
      if (!err.message.includes("offline")) {
        handleFirestoreError(err, OperationType.GET, 'config/main');
      }
    });

    // 2. Public Listeners

    const unsubAuthors = onSnapshot(collection(db, 'authors'), (snap) => {
      setAuthors(snap.docs.map(d => ({ id: d.id, ...d.data() } as Author)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'authors'));

    const unsubBooks = onSnapshot(collection(db, 'books'), (snap) => {
      const booksData = snap.docs.map(d => ({ id: d.id, ...d.data() } as BookItem));
      // Sort client-side if order field exists, otherwise use default order
      const sortedBooks = [...booksData].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setBooks(sortedBooks);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'books'));

    const unsubNews = onSnapshot(query(collection(db, 'news'), orderBy('date', 'desc')), (snap) => {
      setNews(snap.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'news'));

    const unsubGallery = onSnapshot(query(collection(db, 'gallery'), orderBy('date', 'desc')), (snap) => {
      setGallery(snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'gallery'));

    const unsubStores = onSnapshot(query(collection(db, 'stores'), orderBy('order', 'asc')), (snap) => {
      setStores(snap.docs.map(d => ({ id: d.id, ...d.data() } as Store)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'stores'));

    const unsubTestimonials = onSnapshot(query(collection(db, 'testimonials'), orderBy('date', 'desc')), (snap) => {
      setTestimonials(snap.docs.map(d => ({ id: d.id, ...d.data() } as Testimonial)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'testimonials'));

    const unsubFaq = onSnapshot(collection(db, 'faqs'), (snap) => {
      setFaqs(snap.docs.map(d => ({ id: d.id, ...d.data() } as FAQItem)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'faqs'));

    const unsubAgenda = onSnapshot(query(collection(db, 'agendaEvents'), orderBy('date', 'asc')), (snap) => {
      setAgendaEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as AgendaEvent)));
    }, (err) => console.error("Agenda listener error:", err));

    const unsubContests = onSnapshot(query(collection(db, 'contests'), orderBy('createdAt', 'desc')), (snap) => {
      setContests(snap.docs.map(d => ({ id: d.id, ...d.data() } as Contest)));
    }, (err) => console.error("Contests listener error:", err));

    // 3. Auth State & Sensitive Listeners
    let unsubRegAuthors: (() => void) | null = null;
    let unsubMessages: (() => void) | null = null;
    let unsubNewsletter: (() => void) | null = null;
    let unsubSubmissions: (() => void) | null = null;
    let unsubContactMessages: (() => void) | null = null;
    let unsubAdminLogs: (() => void) | null = null;
    let unsubSellerRequests: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setIsAuthReady(true);
      setIsLoading(false);

      // Clean up previous sensitive listeners
      if (unsubRegAuthors) unsubRegAuthors();
      if (unsubMessages) unsubMessages();
      if (unsubNewsletter) unsubNewsletter();
      if (unsubSubmissions) unsubSubmissions();
      if (unsubContactMessages) unsubContactMessages();
      if (unsubAdminLogs) unsubAdminLogs();
      if (unsubSellerRequests) unsubSellerRequests();

      if (user) {
        // Listen to registered authors (only when authenticated)
        unsubRegAuthors = onSnapshot(collection(db, 'registeredAuthors'), (snap) => {
          const authorsData = snap.docs.map(d => ({ id: d.id, ...d.data() } as RegisteredAuthor));
          setRegisteredAuthors(authorsData);

          const self = authorsData.find(a => a.id === user.uid);
          const isOfficialAdmin = user.email ? ["emma52673460@gmail.com", "stgraalivoirien@gmail.com"].includes(user.email.toLowerCase()) : false;
          const isAdminRole = self?.role === 'admin';
          
          if (isOfficialAdmin || isAdminRole) {
            setIsActuallyAdmin(true);
          } else {
            setIsActuallyAdmin(false);
          }

          // After we have roles, decide if we can listen to other collections
          const isModeratorPlus = isOfficialAdmin || ['admin', 'editor', 'moderator'].includes(self?.role || '');

          if (isModeratorPlus) {
            if (!unsubNewsletter) {
              unsubNewsletter = onSnapshot(query(collection(db, 'newsletter'), orderBy('createdAt', 'desc')), (snap) => {
                setNewsletter(snap.docs.map(d => ({ id: d.id, ...d.data() } as NewsletterSubscriber)));
              }, (err) => {
                console.error("Newsletter listener error:", err);
                if (err.message.includes("permissions")) {
                   // Ignore silently during transition, or could notify once
                }
              });
            }
            if (!unsubSubmissions) {
              unsubSubmissions = onSnapshot(query(collection(db, 'submissions'), orderBy('createdAt', 'desc')), (snap) => {
                setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission)));
              }, (err) => console.error("Submissions listener error:", err));
            }
            if (!unsubContactMessages) {
              unsubContactMessages = onSnapshot(query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc')), (snap) => {
                setContactMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ContactMessage)));
              }, (err) => console.error("ContactMessages listener error:", err));
            }
            if (!unsubAdminLogs && (isOfficialAdmin || self?.role === 'admin')) {
              unsubAdminLogs = onSnapshot(query(collection(db, 'adminLogs'), orderBy('timestamp', 'desc'), limit(50)), (snap) => {
                setAdminLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminLog)));
              }, (err) => console.error("AdminLogs listener error:", err));
            }
            if (!unsubSellerRequests) {
              unsubSellerRequests = onSnapshot(query(collection(db, 'sellerRequests'), orderBy('createdAt', 'desc')), (snap) => {
                setSellerRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as SellerRequest)));
              }, (err) => console.error("SellerRequests listener error:", err));
            }
          }
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'registeredAuthors'));

        // Listen to messages involving the current user
        const q = query(
          collection(db, 'messages'), 
          or(where('senderId', '==', user.uid), where('receiverId', '==', user.uid)),
          orderBy('timestamp', 'asc')
        );
        unsubMessages = onSnapshot(q, (snap) => {
          setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'messages'));
      } else {
        setRegisteredAuthors([]);
        setMessages([]);
      }
    });

    return () => {
      unsubConfig();
      unsubAuthors();
      unsubBooks();
      unsubNews();
      unsubGallery();
      unsubStores();
      unsubTestimonials();
      unsubFaq();
      unsubAgenda();
      unsubContests();
      unsubAuth();
      if (unsubNewsletter) unsubNewsletter();
      if (unsubSubmissions) unsubSubmissions();
      if (unsubContactMessages) unsubContactMessages();
      if (unsubAdminLogs) unsubAdminLogs();
      if (unsubSellerRequests) unsubSellerRequests();
      if (unsubRegAuthors) unsubRegAuthors();
      if (unsubMessages) unsubMessages();
    };
  }, []); // Removed registeredAuthors.length dependency to avoid infinite loops

  useEffect(() => {
    if (isAuthReady) {
      const user = auth.currentUser;
      if (user) {
        const regAuthor = registeredAuthors.find(a => a.id === user.uid);
        if (regAuthor) setCurrentUser(regAuthor);
      } else {
        setCurrentUser(null);
      }
    }
  }, [isAuthReady, registeredAuthors]);

  const hashPassword = async (password: string) => {
    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const logAction = async (action: string, entity: string, entityId: string) => {
    if (!auth.currentUser) return;
    try {
      const log: Omit<AdminLog, 'id'> = {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || auth.currentUser.email || "Admin",
        action,
        entity,
        entityId,
        timestamp: new Date().toISOString()
      };
      await addDoc(collection(db, 'adminLogs'), log);
    } catch (err) {
      console.error("Failed to log action:", err);
    }
  };

  // --- Admin Logic ---

  const handleAdminGoogleLogin = async () => {
    if (isAuthProcessing) return;
    setIsAuthProcessing(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const loggedUser = result.user;
      const adminEmails = ["emma52673460@gmail.com", "stgraalivoirien@gmail.com"];

      if (loggedUser.email && adminEmails.includes(loggedUser.email.toLowerCase())) {
        setIsAdmin(true);
        setIsActuallyAdmin(true);
        setShowAdminLogin(false);
        setAdminPassword("");
        notify("Bienvenue, Administrateur");
      } else {
        await signOut(auth);
        notify("Accès refusé : cet email n'est pas l'administrateur", "error");
      }
    } catch (error: any) {
      console.error("Admin Google Auth Error:", error);
      setIsAuthProcessing(false);
      
      const cancelledCodes = [
        'auth/popup-closed-by-user',
        'auth/cancelled-popup-request',
        'auth/user-cancelled'
      ];

      if (error.code === 'auth/popup-blocked') {
        notify("La fenêtre de connexion a été bloquée par votre navigateur. Veuillez autoriser les popups pour ce site.", "error");
      } else if (cancelledCodes.includes(error.code)) {
        // Ignore gracefully
        console.log("Authentication cancelled by user");
      } else if (error.code === 'auth/unauthorized-domain') {
        notify("Ce domaine n'est pas autorisé dans la console Firebase. Veuillez ajouter votre URL Netlify aux domaines autorisés.", "error");
      } else if (error.code === 'auth/internal-error' || error.message?.includes('internal-error')) {
        notify("L'authentification Google est bloquée par l'iframe du navigateur. Veuillez vous connecter simplement avec le mot de passe principal d'administration ci-dessous (GRAAL225).", "error");
      } else {
        notify(`Erreur d'authentification : ${error.message}. Astuce : Utilisez le mot de passe d'administration direct (GRAAL225) ci-dessous.`, "error");
      }
    } finally {
      setIsAuthProcessing(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Check local password for UI access
    const normalizedPassword = adminPassword.trim();
    const authorizedPasswords = ["Graal2026", "graal2026", "GRAAL225", "graal225"];
    if (!authorizedPasswords.includes(normalizedPassword)) {
      notify("Mot de passe incorrect", "error");
      return;
    }

    // Unlocked successfully! Let's elevate privileges.
    setIsAdmin(true);
    setIsActuallyAdmin(true);
    setShowAdminLogin(false);
    setAdminPassword("");
    notify("Tableau de bord déverrouillé avec succès !");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      setCurrentUser(null);
      setShowAuthorSpace(false);
      notify("Déconnexion réussie");
    } catch (error) {
      notify("Erreur lors de la déconnexion", "error");
    }
  };

  // --- Author Space Logic ---

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const phone = formData.get('phone') as string;
    const photo = formData.get('photo_base64') as string || "";

    if (password.length < 6) {
      notify("Le mot de passe doit faire au moins 6 caractères", "error");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const passwordHash = await hashPassword(password);
      
      const newUser: RegisteredAuthor = {
        id: user.uid,
        name,
        email,
        passwordHash,
        photo,
        bio,
        phone,
        status: 'active',
        isOnline: true,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'registeredAuthors', user.uid), newUser);
      setShowAuthModal(false);
      setShowAuthorSpace(true);
      notify("Inscription réussie ! Bienvenue.");

      // Send welcome email
      try {
        const content = await generateWelcomeContent(name, 'author', config.name);
        await notifySubscribers([{ email }], content);
      } catch (error) {
        console.error("Failed to send welcome email:", error);
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        notify("Cet email est déjà utilisé", "error");
      } else if (error.message && error.message.includes('{')) {
        throw error;
      } else {
        notify("Erreur lors de l'inscription", "error");
      }
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check status in Firestore
      const userDoc = await getDoc(doc(db, 'registeredAuthors', user.uid));
      if (userDoc.exists() && userDoc.data().status === 'blocked') {
        await signOut(auth);
        notify("Votre compte a été bloqué par l'administrateur", "error");
        return;
      }

      await updateDoc(doc(db, 'registeredAuthors', user.uid), { isOnline: true });
      setShowAuthModal(false);
      setShowAuthorSpace(true);
      notify(`Ravi de vous revoir !`);
    } catch (error: any) {
      if (error.message && error.message.includes('{')) throw error;
      notify("Identifiants incorrects", "error");
    }
  };

  const updateProfile = async (updates: Partial<RegisteredAuthor>, newPassword?: string) => {
    if (!currentUser) return;
    
    try {
      let passwordHash = currentUser.passwordHash;
      if (newPassword) {
        passwordHash = await hashPassword(newPassword);
      }

      await updateDoc(doc(db, 'registeredAuthors', currentUser.id), { ...updates, passwordHash });
      notify("Profil mis à jour");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `registeredAuthors/${currentUser.id}`);
    }
  };

  const sendMessage = async (text: string) => {
    if (!currentUser || !activeChatPartnerId || !text.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: activeChatPartnerId,
      text,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    try {
      await addDoc(collection(db, 'messages'), newMessage);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    }
  };

  // --- CRUD Handlers ---

  const addBook = async (data: Omit<BookItem, 'id'>) => {
    const id = Date.now().toString();
    const newBook: BookItem = { id, ...data, order: books.length };
    try {
      await setDoc(doc(db, 'books', id), newBook);
      notify("Livre ajouté au catalogue");
      
      // Notify subscribers
      if (newsletter.length > 0) {
        try {
          const content = await generateNotificationContent(newBook, 'book', config.name);
          await notifySubscribers(newsletter, content);
          notify("Abonnés notifiés du nouveau livre");
        } catch (error) {
          console.error("Failed to notify subscribers:", error);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'books');
    }
  };

  const addAuthor = async (data: Omit<Author, 'id'>) => {
    const id = Date.now().toString();
    const newAuthor: Author = { id, ...data };
    try {
      if (newAuthor.isMonthAuthor) {
        const batch = writeBatch(db);
        authors.filter(a => a.isMonthAuthor).forEach(a => {
          batch.update(doc(db, 'authors', a.id), { isMonthAuthor: false });
        });
        batch.set(doc(db, 'authors', id), newAuthor);
        await batch.commit();
      } else {
        await setDoc(doc(db, 'authors', id), newAuthor);
      }
      notify("Auteur ajouté");
      logAction(`Ajouté auteur`, 'author', id);

      // Notify subscribers
      if (newsletter.length > 0) {
        try {
          const content = await generateNotificationContent(newAuthor, 'author', config.name);
          await notifySubscribers(newsletter, content);
          notify("Abonnés notifiés du nouvel auteur");
        } catch (error) {
          console.error("Failed to notify subscribers:", error);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'authors');
    }
  };

  const updateAuthor = async (id: string, updates: Partial<Author>) => {
    try {
      if (updates.isMonthAuthor) {
        const batch = writeBatch(db);
        authors.filter(a => a.isMonthAuthor && a.id !== id).forEach(a => {
          batch.update(doc(db, 'authors', a.id), { isMonthAuthor: false });
        });
        batch.update(doc(db, 'authors', id), updates);
        await batch.commit();
      } else {
        await updateDoc(doc(db, 'authors', id), updates);
      }
      notify("Auteur mis à jour");
      logAction(`Mis à jour auteur`, 'author', id);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `authors/${id}`);
    }
  };

  const deleteAuthor = async (id: string, noConfirm = false) => {
    const authorBooks = books.filter(b => b.authorId === id);
    const author = authors.find(a => a.id === id);
    const authorName = author?.name || "cet auteur";

    const message = authorBooks.length > 0 
      ? `L'auteur \"${authorName}\" a ${authorBooks.length} livre(s) associé(s). Supprimer cet auteur rendra ces livres "sans auteur". Confirmer la suppression ?`
      : `Supprimer l'auteur \"${authorName}\" ?`;
      
    if (noConfirm || window.confirm(message)) {
      try {
        await deleteDoc(doc(db, 'authors', id));
        if (!noConfirm) notify("Auteur supprimé");
        logAction(`Suppprimé auteur`, 'author', id);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `authors/${id}`);
      }
    }
  };

  const updateBook = async (id: string, updates: Partial<BookItem>) => {
    try {
      await updateDoc(doc(db, 'books', id), updates);
      notify("Livre mis à jour");
      logAction(`Mis à jour livre`, 'book', id);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `books/${id}`);
    }
  };

  const updateNews = async (id: string, updates: Partial<NewsItem>) => {
    try {
      await updateDoc(doc(db, 'news', id), updates);
      notify("Actualité mise à jour");
      logAction(`Mis à jour news`, 'news', id);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `news/${id}`);
    }
  };

  const handleDeleteNews = async (id: string) => {
    const item = news.find(n => n.id === id);
    if (!item) return;

    if (window.confirm(`Supprimer l'actualité \"${item.title}\" ?`)) {
      try {
        await deleteDoc(doc(db, 'news', id));
        notify("Actualité supprimée");
        logAction(`Supprimé news`, 'news', id);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `news/${id}`);
      }
    }
  };

  const handleDeleteBook = async (id: string, title: string) => {
    if (window.confirm(`Supprimer le livre \"${title}\" ?`)) {
      try {
        await deleteDoc(doc(db, 'books', id));
        logAction(`Supprimé livre`, 'book', id);
        notify("Livre supprimé");
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `books/${id}`);
      }
    }
  };

  const reorderBooks = async (newOrder: BookItem[]) => {
    try {
      const batch = writeBatch(db);
      newOrder.forEach((book, index) => {
        batch.update(doc(db, 'books', book.id), { order: index });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'books');
    }
  };

  const addGalleryItem = async (url: string, caption: string) => {
    const newItem: GalleryItem = { 
      id: Date.now().toString(), 
      url, 
      caption, 
      date: new Date().toISOString() 
    };
    try {
      await setDoc(doc(db, 'gallery', newItem.id), newItem);
      notify("Photo ajoutée à la galerie");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gallery');
    }
  };

  const deleteGalleryItem = async (id: string) => {
    if (window.confirm("Supprimer cette photo de la galerie ?")) {
      try {
        await deleteDoc(doc(db, 'gallery', id));
        notify("Photo supprimée");
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `gallery/${id}`);
      }
    }
  };

  const addStore = async (data: Omit<Store, 'id'>) => {
    const id = Date.now().toString();
    const newStore: Store = { id, ...data };
    try {
      await setDoc(doc(db, 'stores', id), newStore);
      notify("Librairie ajoutée");
      logAction(`Ajouté librairie`, 'store', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'stores');
    }
  };

  const updateStore = async (id: string, data: Partial<Store>) => {
    try {
      await updateDoc(doc(db, 'stores', id), data);
      notify("Librairie mise à jour");
      logAction(`Modifiée librairie`, 'store', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `stores/${id}`);
    }
  };

  const deleteStore = async (id: string) => {
    if (window.confirm("Supprimer cette librairie ?")) {
      try {
        await deleteDoc(doc(db, 'stores', id));
        notify("Librairie supprimée");
        logAction(`Supprimée librairie`, 'store', id);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `stores/${id}`);
      }
    }
  };

  // --- Agenda & Événements Event handlers ---
  const addAgendaEvent = async (data: Omit<AgendaEvent, 'id' | 'createdAt'>) => {
    const id = Date.now().toString();
    const newEvent: AgendaEvent = {
      id,
      ...data,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'agendaEvents', id), newEvent);
      notify("Événement programmé avec succès !");
      logAction(`Programmé événement`, 'agendaEvent', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'agendaEvents');
    }
  };

  const updateAgendaEvent = async (id: string, data: Partial<AgendaEvent>) => {
    try {
      await updateDoc(doc(db, 'agendaEvents', id), data);
      notify("Événement mis à jour");
      logAction(`Modifié événement`, 'agendaEvent', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `agendaEvents/${id}`);
    }
  };

  const deleteAgendaEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'agendaEvents', id));
      notify("Événement supprimé");
      logAction(`Supprimé événement`, 'agendaEvent', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `agendaEvents/${id}`);
    }
  };

  // --- Contests / Concours Event handlers ---
  const addContest = async (data: Omit<Contest, 'id' | 'createdAt'>) => {
    const id = Date.now().toString();
    const newContest: Contest = {
      id,
      ...data,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'contests', id), newContest);
      notify("Concours créé avec succès !");
      logAction(`Créé concours: ${data.title}`, 'contests', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'contests');
    }
  };

  const updateContest = async (id: string, data: Partial<Contest>) => {
    try {
      await updateDoc(doc(db, 'contests', id), data);
      notify("Concours mis à jour");
      logAction(`Modifié concours id: ${id}`, 'contests', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `contests/${id}`);
    }
  };

  const deleteContest = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'contests', id));
      notify("Concours supprimé");
      logAction(`Supprimé concours id: ${id}`, 'contests', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `contests/${id}`);
    }
  };

  // --- Seller Partner Requests event handlers ---
  const submitSellerRequest = async (data: Omit<SellerRequest, 'id' | 'createdAt' | 'status'>) => {
    setIsSubmitting(true);
    const id = Date.now().toString();
    const newRequest: SellerRequest = {
      id,
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'sellerRequests', id), newRequest);
      notify("Votre demande de partenariat a été soumise avec succès !", "success");
    } catch (err) {
      notify("Une erreur est survenue lors de la soumission. Veuillez réessayer.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSellerRequest = async (id: string, data: Partial<SellerRequest>) => {
    try {
      await updateDoc(doc(db, 'sellerRequests', id), data);
      notify("Statut de la demande mis à jour");
      logAction(`Modifié statut demande vendeur`, 'sellerRequest', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `sellerRequests/${id}`);
    }
  };

  const deleteSellerRequest = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'sellerRequests', id));
      notify("Demande de partenariat supprimée");
      logAction(`Supprimé demande vendeur`, 'sellerRequest', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `sellerRequests/${id}`);
    }
  };

  const addTestimonial = async (data: Omit<Testimonial, 'id'>) => {
    const id = Date.now().toString();
    const newItem: Testimonial = { id, ...data };
    try {
      await setDoc(doc(db, 'testimonials', id), newItem);
      notify("Témoignage ajouté");
      logAction(`Ajouté témoignage`, 'testimonial', id);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'testimonials');
    }
  };

  const updateTestimonial = async (id: string, updates: Partial<Testimonial>) => {
    try {
      await updateDoc(doc(db, 'testimonials', id), updates);
      notify("Témoignage mis à jour");
      logAction(`Mis à jour témoignage`, 'testimonial', id);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `testimonials/${id}`);
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (window.confirm("Supprimer ce témoignage ?")) {
      try {
        await deleteDoc(doc(db, 'testimonials', id));
        notify("Témoignage supprimé");
        logAction(`Supprimé témoignage`, 'testimonial', id);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `testimonials/${id}`);
      }
    }
  };

  const addFAQ = async (data: Omit<FAQItem, 'id' | 'createdAt'>) => {
    const id = Date.now().toString();
    const newItem: FAQItem = { 
      id, 
      ...data, 
      createdAt: new Date().toISOString() 
    };
    try {
      await setDoc(doc(db, 'faqs', id), newItem);
      notify("FAQ ajoutée");
      logAction(`Ajouté FAQ`, 'faq', id);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'faqs');
    }
  };

  const updateFAQ = async (id: string, updates: Partial<FAQItem>) => {
    try {
      await updateDoc(doc(db, 'faqs', id), updates);
      notify("FAQ mise à jour");
      logAction(`Mise à jour FAQ`, 'faq', id);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `faqs/${id}`);
    }
  };

  const deleteFAQ = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'faqs', id));
      notify("FAQ supprimée");
      logAction(`Supprimé FAQ`, 'faq', id);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `faqs/${id}`);
    }
  };

  const reorderStores = async (newOrder: Store[]) => {
    try {
      const batch = writeBatch(db);
      newOrder.forEach((store, index) => {
        batch.update(doc(db, 'stores', store.id), { order: index });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'stores');
    }
  };

  const handleExport = () => {
    const data = { 
      config, 
      authors, 
      books, 
      news, 
      registeredAuthors, 
      messages, 
      gallery, 
      newsletter, 
      submissions, 
      contactMessages, 
      adminLogs 
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saint_graal_ivoirien_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!window.confirm("Attention : l'importation va écraser ou ajouter des données dans votre base Firestore. Voulez-vous continuer ?")) return;

        setIsLoading(true);
        const batch = writeBatch(db);

        if (parsed.config) {
          await setDoc(doc(db, 'config', 'main'), parsed.config);
          setConfig(parsed.config);
        }

        if (parsed.authors) {
          for (const item of parsed.authors) {
            batch.set(doc(db, 'authors', item.id), item);
          }
        }

        if (parsed.books) {
          for (const item of parsed.books) {
            batch.set(doc(db, 'books', item.id), item);
          }
        }

        if (parsed.news) {
          for (const item of parsed.news) {
            batch.set(doc(db, 'news', item.id), item);
          }
        }

        if (parsed.gallery) {
          for (const item of parsed.gallery) {
            batch.set(doc(db, 'gallery', item.id), item);
          }
        }

        if (parsed.registeredAuthors) {
          for (const item of parsed.registeredAuthors) {
            batch.set(doc(db, 'registeredAuthors', item.id), item);
          }
        }

        if (parsed.submissions) {
          for (const item of parsed.submissions) {
            batch.set(doc(db, 'submissions', item.id), item);
          }
        }

        if (parsed.newsletter) {
          for (const item of parsed.newsletter) {
            batch.set(doc(db, 'newsletter', item.id), item);
          }
        }

        if (parsed.contactMessages) {
          for (const item of parsed.contactMessages) {
            batch.set(doc(db, 'contactMessages', item.id), item);
          }
        }
        
        await batch.commit();
        logAction("Importation globale de données", "system", "all");
        notify("Données importées et sauvegardées avec succès");
      } catch (err) {
        console.error("Import failed:", err);
        notify("Fichier invalide ou erreur d'écriture", "error");
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const updateRegisteredAuthor = async (id: string, updates: Partial<RegisteredAuthor>) => {
    try {
      await updateDoc(doc(db, 'registeredAuthors', id), updates);
      notify("Auteur mis à jour");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `registeredAuthors/${id}`);
    }
  };

  const deleteRegisteredAuthor = async (id: string, noConfirm = false) => {
    if (noConfirm || window.confirm("Supprimer définitivement ce compte auteur ?")) {
      try {
        await deleteDoc(doc(db, 'registeredAuthors', id));
        if (!noConfirm) notify("Compte supprimé");
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `registeredAuthors/${id}`);
      }
    }
  };

  const handleSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Validation
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const message = formData.get('message') as string;
    const file = formData.get('manuscript') as File;

    if (!name || !email || !phone || !message || !file || file.size === 0) {
      notify("Veuillez remplir tous les champs et sélectionner un fichier.", "error");
      return;
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      notify("Format de fichier non supporté. Utilisez PDF ou Word.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Save to Firestore for Admin Dashboard
      const submissionId = Date.now().toString();
      const newSubmission: Submission = {
        id: submissionId,
        name,
        email,
        phone,
        message,
        fileName: file.name,
        fileUrl: "#", // In a real production app with Storage, we would upload here.
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'submissions', submissionId), newSubmission);
      logAction(`Soumission de manuscrit`, 'submission', submissionId);

      // Notification Email Automatique
      try {
        const adminContent = await generateSubmissionAdminContent({ 
          name, 
          email, 
          phone, 
          message, 
          fileName: file.name 
        }, config.name);
        await notifyAdmin(config.email, adminContent);
      } catch (err) {
        console.error("Failed to send admin notification:", err);
      }

      // 2. Try sending via Formspree (as backup or for email notifications)
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      notify("Manuscrit reçu ! Nous vous recontacterons bientôt.");
      form.reset();
      setSubmissionMessage('');
    } catch (error) {
      console.error("Submission error:", error);
      notify("Une erreur est survenue, mais votre soumission a été tentée.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewsletterSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get('email') as string;

    if (!email) return;

    try {
      setIsSubmitting(true);
      await addDoc(collection(db, 'newsletter'), {
        email,
        createdAt: new Date().toISOString()
      });
      notify("Inscription à la newsletter réussie !");
      form.reset();

      // Notify Admin
      try {
        await notifyAdmin(config.email, {
          subject: `Nouvel abonné Newsletter: ${email}`,
          body: `Une nouvelle personne s'est inscrite à la newsletter: ${email}`
        });
      } catch (err) {
        console.error("Failed to notify admin of newsletter subscription:", err);
      }

      // Send welcome email
      try {
        const content = await generateWelcomeContent(null, 'newsletter', config.name);
        await notifySubscribers([{ email }], content);
      } catch (error) {
        console.error("Failed to send welcome email:", error);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'newsletter');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addNews = async (data: Omit<NewsItem, 'id'>) => {
    const id = Date.now().toString();
    const newItem: NewsItem = { id, ...data };
    try {
      await setDoc(doc(db, 'news', id), newItem);
      notify("Actualité publiée");
      logAction(`Publié news`, 'news', id);
      
      // Notify subscribers
      if (newsletter.length > 0) {
        try {
          const content = await generateNotificationContent(newItem, 'news', config.name);
          await notifySubscribers(newsletter, content);
          notify("Abonnés notifiés");
        } catch (err) {
          console.error("Failed to notify subscribers:", err);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'news');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        notify("L'image est trop lourde (max 1Mo)", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteNewsletterSubscription = async (id: string) => {
    if (window.confirm("Supprimer cet abonné ?")) {
      try {
        await deleteDoc(doc(db, 'newsletter', id));
        notify("Abonné supprimé");
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `newsletter/${id}`);
      }
    }
  };

  useEffect(() => {
    if (selectedAuthor && selectedAuthor.isHidden) {
      setSelectedAuthor(null);
    }
  }, [selectedAuthor, authors]);

  useEffect(() => {
    if (selectedBook) {
      const author = authors.find(a => a.id === selectedBook.authorId);
      if (author?.isHidden) {
        setSelectedBook(null);
      }
    }
  }, [selectedBook, authors]);

  // --- Render Helpers ---

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-violet border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white text-gray-900 selection:bg-violet/20">
          <div className="fixed top-4 left-4 z-[100] pointer-events-none">
            <a 
              href="#main-content" 
              className="pointer-events-auto bg-violet text-white px-6 py-3 rounded-xl font-bold shadow-2xl opacity-0 focus:opacity-100 transition-opacity -translate-y-20 focus:translate-y-0 inline-block focus:outline-none focus:ring-4 focus:ring-vert"
            >
              Aller au contenu principal
            </a>
          </div>
        <Helmet>
          <title>{currentTitle}</title>
          <meta name="description" content={currentDesc} />
          <meta name="keywords" content={keywordsString} />
          
          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:title" content={currentTitle} />
          <meta property="og:description" content={currentDesc} />
          <meta property="og:image" content={currentImage} />
          <meta property="og:site_name" content={config.name || "Saint Graal Ivoirien"} />
          <meta property="og:locale" content="fr_CI" />
          <meta property="og:url" content={window.location.origin} />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={currentTitle} />
          <meta name="twitter:description" content={currentDesc} />
          <meta name="twitter:image" content={currentImage} />

          {/* JSON-LD Structured Data */}
          {structuredData && (
            <script type="application/ld+json">
              {JSON.stringify(structuredData)}
            </script>
          )}
        </Helmet>
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 right-8 z-[100] px-6 py-3 rounded-xl shadow-2xl text-white font-medium ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <Navbar 
        config={config}
        currentUser={currentUser}
        messages={messages}
        isAdmin={isActuallyAdmin}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        setShowAuthModal={setShowAuthModal}
        setShowAuthorSpace={setShowAuthorSpace}
        setShowAdminLogin={setShowAdminLogin}
        handleLogout={handleLogout}
        onOpenAdmin={() => setIsAdmin(true)}
      />

      <main id="main-content">
        {/* Hero Section */}
        <section id="accueil" className="pt-20 min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden" aria-label="Accueil">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-vert/5 rounded-full blur-3xl" />
        </div>

        {config.logo && (
          <motion.img 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            src={config.logo} 
            alt={`Logo ${config.name} - Maison d'édition en Côte d'Ivoire`} 
            className="h-48 mb-8"
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        )}
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black text-violet mb-4 max-w-4xl"
        >
          Maison d'Édition {config.name} | Excellence Littéraire
        </motion.h1>

        {/* Hidden SEO Text for crawlers */}
        <div className="sr-only">
          <h2>Maison d'édition en Côte d'Ivoire - Abidjan</h2>
          <p>{config.name} est votre partenaire pour la publication de livres, romans, poésies et essais en Afrique. Nous offrons des services d'édition à compte d'auteur et à compte d'éditeur, la promotion d'auteurs ivoiriens et la vente d'ouvrages littéraires d'excellence.</p>
          <p>Mots-clés : édition Afrique, publishing Ivory Coast, de nouveaux talents littéraires, manuscrits, dédicaces livres, salon du livre Abidjan.</p>
        </div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl font-medium text-vert mb-8"
        >
          {config.slogan}
        </motion.p>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 max-w-2xl mb-12 leading-relaxed"
        >
          {config.intro}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.a 
            href="#soumissions"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(139, 92, 246, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 bg-violet text-white px-10 py-5 rounded-full font-black text-lg transition-colors group"
          >
            <BookOpen className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            Soumettre un Manuscrit
          </motion.a>

          <a 
            href={`https://wa.me/${config.whatsapp.replace(/\s+/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white border-2 border-gray-100 text-gray-700 px-8 py-4 rounded-full font-bold shadow-xl hover:bg-gray-50 transition-all"
          >
            <Phone className="w-6 h-6 text-[#25D366]" />
            Nous contacter
          </a>
        </motion.div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 md:py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`grid grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-8`}>
            {[
              { label: "Livres Publiés", value: visibleBooks.length, icon: Book },
              { label: "Auteurs Accompagnés", value: visibleAuthors.length, icon: Users },
              { label: "Actualités", value: news.length, icon: Newspaper },
              ...(isAdmin ? [{ label: "Abonnés", value: newsletter.length, icon: Send }] : [])
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center p-6 bg-gray-50 rounded-3xl"
              >
                <div className="w-12 h-12 bg-violet/10 rounded-2xl flex items-center justify-center mb-4">
                  <stat.icon className="w-6 h-6 text-violet" />
                </div>
                <span className="text-3xl font-black text-violet mb-1">{stat.value}+</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Author Section */}
      {visibleAuthors.length > 0 && (
        <section className="py-24 md:py-32 bg-violet text-white relative overflow-hidden" aria-label="Auteur à la une">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/2" />
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {authorOfMonth && (
                <>
                  <div className="lg:w-1/3">
                    <motion.div 
                       initial={{ opacity: 0, scale: 0.8 }}
                       whileInView={{ opacity: 1, scale: 1 }}
                       className="relative group cursor-pointer focus-within:ring-4 focus-within:ring-white/50 rounded-3xl"
                       onClick={() => setSelectedAuthor(authorOfMonth)}
                       role="button"
                       aria-label={`Voir le profil de ${authorOfMonth.name}`}
                       tabIndex={0}
                       onKeyDown={(e) => e.key === 'Enter' && setSelectedAuthor(authorOfMonth)}
                    >
                      <div className="absolute inset-0 bg-vert rounded-3xl rotate-6 group-hover:rotate-0 transition-transform" />
                      <img 
                        src={authorOfMonth.photo || AUTHOR_PLACEHOLDER} 
                        alt={`Photo de ${authorOfMonth.name}`} 
                        className="relative z-10 w-full aspect-[4/5] object-contain bg-white rounded-3xl shadow-2xl p-2.5" 
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"
                      />
                    </motion.div>
                  </div>
                  <div className="lg:w-2/3">
                    <span className="text-vert font-black uppercase tracking-[0.3em] mb-4 block" id="author-month-title">Auteur du mois</span>
                    <h2 className="text-4xl md:text-6xl font-black mb-6" aria-labelledby="author-month-title">{authorOfMonth.name}</h2>
                    <p className="text-xl text-violet-100 leading-relaxed italic mb-8 line-clamp-4">
                      "{authorOfMonth.bio}"
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button 
                        onClick={() => setSelectedAuthor(authorOfMonth)}
                        className="bg-white text-violet px-8 py-4 rounded-xl font-bold hover:bg-vert hover:text-white transition-all shadow-xl focus:outline-none focus:ring-4 focus:ring-vert"
                      >
                        Découvrir son univers
                      </button>
                      <button 
                        onClick={() => {
                          setCatalogueSearch(authorOfMonth.name);
                          setCurrentPage(1);
                          document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-violet-900/50 text-white border-2 border-violet-400/30 px-8 py-4 rounded-xl font-bold hover:bg-violet-800 transition-all focus:outline-none focus:ring-4 focus:ring-white/30"
                      >
                        Voir ses ouvrages
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section id="services" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-violet mb-4">Nos Services</h2>
            <div className="w-20 h-1.5 bg-vert mx-auto rounded-full" />
            <p className="mt-6 text-gray-500 max-w-2xl mx-auto">Nous accompagnons nos auteurs à chaque étape de la vie de leur œuvre.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Édition & Correction", desc: "Un travail minutieux sur le texte pour en extraire toute la quintessence.", icon: BookOpen },
              { title: "Mise en Page", desc: "Un design intérieur élégant et professionnel adapté à chaque genre.", icon: Layout },
              { title: "Distribution", desc: "Une présence dans les meilleures librairies et sur les plateformes numériques.", icon: Globe },
              { title: "Promotion", desc: "Campagnes marketing et relations presse pour faire rayonner vos écrits.", icon: Megaphone }
            ].map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2rem] bg-gray-50 hover:bg-violet hover:text-white transition-all group"
              >
                <div className="w-14 h-14 bg-violet/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20">
                  <service.icon className="w-8 h-8 text-violet group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                <p className="text-sm opacity-70 leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* À Propos Section */}
      <APropos />

      {/* Catalogue Section */}
      <section id="catalogue" className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-violet mb-4">Notre Catalogue</h2>
            <div className="w-20 h-1.5 bg-vert mx-auto rounded-full mb-8" />
            
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="relative" role="combobox" aria-expanded={showSuggestions} aria-haspopup="listbox" aria-owns="catalogue-suggestions">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
                <input 
                  type="text" 
                  placeholder="Rechercher un livre ou un auteur..." 
                  value={catalogueSearch}
                  aria-label="Rechercher dans le catalogue"
                  aria-autocomplete="list"
                  aria-controls="catalogue-suggestions"
                  onChange={(e) => {
                    const val = e.target.value;
                    setCatalogueSearch(val);
                    setCurrentPage(1);
                    
                    if (val.trim().length > 1) {
                      const lowerVal = val.toLowerCase();
                      const bookSugs = visibleBooks
                        .filter(b => b.title.toLowerCase().includes(lowerVal))
                        .slice(0, 3)
                        .map(b => ({ id: b.id, title: b.title, type: 'book' as const }));
                      
                      const authorSugs = visibleAuthors
                        .filter(a => a.name.toLowerCase().includes(lowerVal))
                        .slice(0, 2)
                        .map(a => ({ id: a.id, title: a.name, type: 'author' as const }));
                      
                      setSuggestions([...bookSugs, ...authorSugs]);
                      setShowSuggestions(true);
                    } else {
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => {
                    if (catalogueSearch.trim().length > 1) setShowSuggestions(true);
                  }}
                  onBlur={() => {
                    // Delay to allow clicking suggestions
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white shadow-sm border-2 border-transparent focus:border-violet outline-none transition-all focus:ring-2 focus:ring-violet/20"
                />

                {/* Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      id="catalogue-suggestions"
                      role="listbox"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                    >
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={`${suggestion.type}-${suggestion.id}-${idx}`}
                          role="option"
                          aria-selected="false"
                          onClick={() => {
                            setCatalogueSearch(suggestion.title);
                            setShowSuggestions(false);
                          }}
                          className="w-full px-6 py-4 flex items-center gap-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors text-left border-b border-gray-50 last:border-0"
                        >
                          {suggestion.type === 'book' ? <Book className="w-4 h-4 text-violet" aria-hidden="true" /> : <User className="w-4 h-4 text-vert" aria-hidden="true" />}
                          <div>
                            <p className="text-sm font-bold text-gray-900">{suggestion.title}</p>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                              {suggestion.type === 'book' ? 'Livre' : 'Auteur'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filtrer par catégorie">
                {["Tous", ...BOOK_GENRES].map(genre => (
                  <button
                    key={genre}
                    aria-pressed={catalogueGenre === genre}
                    onClick={() => {
                      setCatalogueGenre(genre);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      catalogueGenre === genre 
                        ? 'bg-violet text-white shadow-lg shadow-violet/20' 
                        : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="min-h-[600px] flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 flex-1" role="region" aria-label="Liste des livres">
              {(() => {
                const searchLower = catalogueSearch.toLowerCase();
                const filteredBooks = visibleBooks.filter(book => {
                  const matchesSearch = 
                    book.title.toLowerCase().includes(searchLower) ||
                    book.summary.toLowerCase().includes(searchLower) ||
                    visibleAuthors.find(a => a.id === book.authorId)?.name.toLowerCase().includes(searchLower);
                  const matchesGenre = catalogueGenre === "Tous" || book.genre === catalogueGenre;
                  return matchesSearch && matchesGenre;
                });
                const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
                const paginatedBooks = filteredBooks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

                return (
                  <>
                    {paginatedBooks.map((book) => (
                      <motion.div 
                        key={book.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_25px_60px_-15px_rgba(139,92,246,0.22)] hover:-translate-y-1.5 transition-all duration-500 ease-out group flex flex-col h-full border border-gray-100 focus-within:ring-2 focus-within:ring-violet"
                      >
                        <div className="aspect-[3/4] overflow-hidden cursor-pointer relative" 
                             onClick={() => setSelectedBook(book)}
                             role="button"
                             aria-label={`Voir les détails de ${book.title}`}
                             tabIndex={0}
                             onKeyDown={(e) => e.key === 'Enter' && setSelectedBook(book)}
                        >
                          <img 
                            src={book.cover || PLACEHOLDER_IMAGE} 
                            alt={`Couverture de ${book.title}`} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex-1">
                            <h3 className="text-lg font-black text-violet mb-1 line-clamp-2 cursor-pointer hover:text-vert transition-colors" 
                                onClick={() => setSelectedBook(book)}
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && setSelectedBook(book)}
                            >
                              {book.title}
                            </h3>
                            <p className="text-xs text-gray-400 mb-3 font-bold uppercase tracking-wider">
                              Par {visibleAuthors.find(a => a.id === book.authorId)?.name || "Auteur inconnu"}
                            </p>
                            <p className="text-gray-600 text-sm line-clamp-3 mb-6 leading-relaxed">{book.summary}</p>
                          </div>
                          
                          <div className="mt-auto space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-black text-vert">{book.price.toLocaleString()} CFA</span>
                              <span className="px-2 py-1 bg-gray-100 text-[9px] font-black uppercase text-gray-500 rounded tracking-widest">{book.genre}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setCheckoutBook(book)}
                                className="flex-1 bg-violet text-white py-3 rounded-xl font-bold hover:bg-violet/90 transition-all shadow-md active:scale-95 text-sm"
                                aria-label={`Commander ${book.title}`}
                              >
                                Commander
                              </button>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/#catalogue`);
                                  setNotification({ message: "Lien copié !", type: 'success' });
                                  setTimeout(() => setNotification(null), 3000);
                                }}
                                className="p-3 bg-gray-50 text-gray-400 hover:text-violet hover:bg-violet/5 rounded-xl transition-all"
                                title="Partager"
                                aria-label={`Copier le lien pour partager ${book.title}`}
                              >
                                <Share2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <nav className="col-span-full flex justify-center items-center gap-3 mt-12 py-8" aria-label="Pagination du catalogue">
                        <button 
                          onClick={() => {
                            setCurrentPage(prev => Math.max(1, prev - 1));
                            document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          disabled={currentPage === 1}
                          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-violet/20 transition-all active:scale-90"
                          aria-label="Page précédente"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-2">
                          {[...Array(totalPages)].map((_, i) => (
                            <button
                              key={i}
                              aria-current={currentPage === i + 1 ? "page" : undefined}
                              onClick={() => {
                                setCurrentPage(i + 1);
                                document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className={`w-12 h-12 rounded-2xl font-black transition-all ${
                                currentPage === i + 1 
                                  ? 'bg-violet text-white shadow-xl shadow-violet/20 scale-105' 
                                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                              }`}
                              aria-label={`Page ${i + 1}`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>

                        <button 
                          onClick={() => {
                            setCurrentPage(prev => Math.min(totalPages, prev + 1));
                            document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          disabled={currentPage === totalPages}
                          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-violet/20 transition-all active:scale-90"
                          aria-label="Page suivante"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </nav>
                    )}

                    {filteredBooks.length === 0 && (
                      <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-24 h-24 bg-violet/5 rounded-full flex items-center justify-center mb-6">
                          <Search className="w-10 h-10 text-violet/40" />
                        </div>
                        <h3 className="text-2xl font-black text-violet mb-2">Aucun ouvrage trouvé</h3>
                        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                          Nous n'avons trouvé aucun livre correspondant à "<strong>{catalogueSearch}</strong>" dans la catégorie <strong>{catalogueGenre}</strong>.
                        </p>
                        <button 
                          onClick={() => { 
                            setCatalogueSearch(""); 
                            setCatalogueGenre("Tous"); 
                            setCurrentPage(1);
                          }}
                          className="mt-8 bg-violet text-white px-8 py-3 rounded-xl font-bold hover:bg-vert transition-all shadow-lg"
                        >
                          Voir tout le catalogue
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* Authors Section */}
      <section id="auteurs" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-violet mb-4">Nos Auteurs</h2>
            <div className="w-20 h-1.5 bg-vert mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" role="list">
            {visibleAuthors.map((author) => (
              <motion.div 
                key={author.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="text-center group cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet rounded-3xl p-4"
                onClick={() => setSelectedAuthor(author)}
                role="listitem"
              >
                <div 
                  role="button"
                  aria-label={`Voir le profil de l'auteur ${author.name}`}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedAuthor(author)}
                  className="focus:outline-none"
                >
                  <div className="w-48 h-56 mx-auto mb-6 rounded-3xl overflow-hidden border-4 border-violet/10 p-2.5 group-hover:border-vert transition-colors relative bg-white flex items-center justify-center shadow-sm">
                    {author.id === authorOfMonth?.id && (
                      <div className="absolute top-2 right-2 bg-vert text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full z-20 shadow-lg border border-white/20">
                        Vedette
                      </div>
                    )}
                    <img 
                      src={author.photo || AUTHOR_PLACEHOLDER} 
                      alt={`Portrait de ${author.name}`} 
                      className="w-full h-full object-contain rounded-2xl" 
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-violet mb-2 group-hover:text-vert transition-colors">{author.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3 px-4">{author.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {visibleAuthors.length === 0 && (
            <p className="text-center text-gray-400 py-12">Nos auteurs seront bientôt affichés ici.</p>
          )}
        </div>
      </section>

      {/* News Section */}
      <section id="actualites" className="py-24 md:py-32 bg-violet/5">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-violet mb-4">Actualités</h2>
            <div className="w-20 h-1.5 bg-vert mx-auto rounded-full" />
          </div>

          <div className="space-y-8">
            {news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item) => (
              <motion.article 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="bg-white p-8 rounded-3xl shadow-sm border-l-8 border-violet"
              >
                <time className="text-sm font-bold text-vert mb-2 block">{new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
                <div className="flex flex-col md:flex-row gap-8">
                  {item.image && (
                    <div className="md:w-1/3 h-48 md:h-auto rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <h3 className="text-2xl font-bold text-violet">{item.title}</h3>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/#actualites`);
                          setNotification({ message: "Lien de l'actualité copié !", type: 'success' });
                          setTimeout(() => setNotification(null), 3000);
                        }}
                        className="p-2 text-gray-400 hover:text-violet transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-violet rounded-lg"
                        aria-label={`Partager l'actualité : ${item.title}`}
                      >
                        <Share2 className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {news.length === 0 && (
            <p className="text-center text-gray-400 py-12">Aucune actualité pour le moment.</p>
          )}
        </div>
      </section>

      {/* Submissions Section */}
      <section id="soumissions" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-violet rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-12 lg:p-20 text-white flex flex-col justify-center">
              <h2 className="text-4xl md:text-5xl font-black mb-6">Soumettre un Manuscrit</h2>
              <p className="text-violet-100 text-lg mb-8 leading-relaxed">
                Vous avez une plume talentueuse ? {config.name} est toujours à la recherche de nouvelles voix. 
                Envoyez-nous votre manuscrit (format PDF ou Word) via le formulaire ci-contre.
              </p>
              <ul className="space-y-4">
                {[
                  "Formats acceptés : PDF, DOC, DOCX",
                  "Réponse sous 4 à 8 semaines",
                  "Tous genres littéraires bienvenus"
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-vert rounded-full flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:w-1/2 bg-white p-8 lg:p-20">
              <form 
                action={`https://formspree.io/f/${config.formspreeId || config.email}`} 
                onSubmit={handleSubmission}
                className="space-y-6"
                encType="multipart/form-data"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="sub-name" className="text-sm font-bold text-gray-700 uppercase">Nom Complet</label>
                    <input type="text" id="sub-name" name="name" required className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="sub-email" className="text-sm font-bold text-gray-700 uppercase">Email</label>
                    <input type="email" id="sub-email" name="email" required className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet outline-none transition-colors" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="sub-phone" className="text-sm font-bold text-gray-700 uppercase">Téléphone</label>
                  <input type="tel" id="sub-phone" name="phone" required className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="sub-message" className="text-sm font-bold text-gray-700 uppercase">Message / Présentation</label>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" aria-live="polite">
                      {submissionMessage.length} caractères
                    </span>
                  </div>
                  <textarea 
                    id="sub-message"
                    name="message" 
                    rows={4} 
                    required 
                    value={submissionMessage}
                    onChange={(e) => setSubmissionMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet outline-none transition-colors" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="sub-manuscript" className="text-sm font-bold text-gray-700 uppercase">Manuscrit (Fichier)</label>
                  <input type="file" id="sub-manuscript" name="manuscript" accept=".pdf,.doc,.docx" required className="w-full focus:outline-none focus:ring-2 focus:ring-violet p-2 rounded-lg" />
                </div>
                <motion.button 
                  type="submit" 
                  disabled={isSubmitting}
                  animate={!isSubmitting ? {
                    scale: [1, 1.01, 1],
                  } : {}}
                  whileHover={{ scale: 1.03, boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ 
                    scale: { repeat: Infinity, duration: 2 },
                    boxShadow: { duration: 0.2 }
                  }}
                  className="w-full bg-vert text-white py-4 rounded-xl font-black text-lg hover:bg-vert/90 transition-colors shadow-lg shadow-vert/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Envoyer ma soumission
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Director Section */}
      <section id="directrice" className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-vert font-black uppercase tracking-widest mb-2 block">L'équipe dirigeante</span>
            <h2 className="text-3xl md:text-5xl font-black text-[#111111] mb-4">La Direction</h2>
            <div className="w-20 h-1.5 bg-vert mx-auto rounded-full" />
          </div>

          <div className="space-y-24">
            {/* Directeur Général */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="w-full md:w-1/2 relative"
              >
                <div className="absolute -top-6 -left-6 w-full h-full border-8 border-vert rounded-3xl -z-10" />
                <img 
                  src={config.dirPhoto || AUTHOR_PLACEHOLDER} 
                  alt={config.dirName || "Directeur Général"} 
                  className="w-full aspect-[4/5] object-cover rounded-3xl shadow-2xl bg-gray-100" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="w-full md:w-1/2"
              >
                <span className="text-vert font-black uppercase tracking-widest mb-4 block">Le mot du Directeur Général</span>
                <h2 className="text-4xl md:text-5xl font-black text-[#111111] mb-6">{config.dirName}</h2>
                <p className="text-xl font-bold text-gray-500 mb-8">{config.dirRole}</p>
                <div className="space-y-6 text-gray-600 text-lg leading-relaxed italic">
                  <p>"{config.dirBio}"</p>
                </div>
              </motion.div>
            </div>

            {/* Directeur Marketing */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24 pt-12 border-t border-gray-200/50">
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="w-full md:w-1/2 relative"
              >
                <div className="absolute -top-6 -right-6 w-full h-full border-8 border-[#F28C28] rounded-3xl -z-10" />
                <img 
                  src={config.mktPhoto || AUTHOR_PLACEHOLDER} 
                  alt={config.mktName || "Directeur Marketing"} 
                  className="w-full aspect-[4/5] object-cover rounded-3xl shadow-2xl bg-gray-100" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="w-full md:w-1/2"
              >
                <span className="text-[#F28C28] font-black uppercase tracking-widest mb-4 block">Notre engagement marketing</span>
                <h2 className="text-4xl md:text-5xl font-black text-[#111111] mb-6">{config.mktName || "M. Marc Koffi"}</h2>
                <p className="text-xl font-bold text-gray-500 mb-8">{config.mktRole || "Directeur Marketing"}</p>
                <div className="space-y-6 text-gray-600 text-lg leading-relaxed italic">
                  <p>"{config.mktBio || "Dédié à faire rayonner les auteurs et les ouvrages de Saint Graal Ivoirien."}"</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <section id="galerie" className="py-24 md:py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-violet mb-4">Galerie Photos</h2>
              <div className="w-20 h-1.5 bg-vert mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {gallery.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative aspect-square rounded-[2rem] overflow-hidden shadow-xl"
                >
                  {item.url && (
                    <img 
                      src={item.url} 
                      alt={item.caption} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <p className="text-white font-bold text-sm">{item.caption}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contests (Concours) Section */}
      <PublicContests contests={contests} darkMode={darkMode} />

      {/* FAQ Section */}
      <section id="faq" className="py-24 md:py-32 bg-white flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-violet mb-4">Foire Aux Questions</h2>
            <div className="w-20 h-1.5 bg-vert mx-auto rounded-full" />
          </div>

          <div className="space-y-4">
            {(faqs && faqs.length > 0 ? [...faqs].sort((a,b) => (a.order ?? 0) - (b.order ?? 0)).map(f => ({ q: f.question, a: f.answer, id: f.id })) : [
              { q: "Comment soumettre mon manuscrit ?", a: "Vous pouvez utiliser notre formulaire de soumission en ligne. Nous acceptons les formats PDF, DOC et DOCX.", id: "def1" },
              { q: "Quels sont vos délais de réponse ?", a: "Notre comité de lecture examine chaque manuscrit avec attention. Le délai moyen est de 4 à 8 semaines.", id: "def2" },
              { q: "Quels sont vos modes de publication ?", a: "Nous publions à compte d'auteur et à compte d'éditeur. Tout dépend de la qualité du manuscrit et du choix de l'auteur.", id: "def3" },
              { q: "Comment sont calculés les droits d'auteur ?", a: "Les modalités sont définies dans le contrat d'édition, basées sur un pourcentage du prix de vente public hors taxes.", id: "def4" }
            ]).map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="border-2 border-gray-50 rounded-2xl p-6 hover:border-violet/20 transition-colors"
              >
                <h4 className="font-bold text-violet mb-2 flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-vert" />
                  {item.q}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed ml-8">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section id="avis" className="py-24 md:py-32 bg-violet text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mt-48 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-vert/10 rounded-full -mr-48 -mb-48 blur-3xl animate-pulse" />
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <span className="text-vert font-black uppercase tracking-[0.3em] mb-4 block">Confiance</span>
              <h2 className="text-3xl md:text-5xl font-black mb-6">Avis de nos Lecteurs</h2>
              <p className="text-violet-100 max-w-2xl mx-auto text-lg opacity-80">
                Ceux qui nous lisent sont nos plus beaux ambassadeurs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[2.5rem] relative group hover:bg-white/20 transition-all"
                >
                  <Quote className="absolute top-6 right-8 w-12 h-12 text-white/10 group-hover:text-vert/20 transition-colors" />
                  
                  <div className="flex gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= item.rating ? 'text-yellow-400 fill-current' : 'text-white/20'}`} />
                    ))}
                  </div>

                  <p className="text-lg italic leading-relaxed mb-8 relative z-10">
                    "{item.content}"
                  </p>

                  <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border-2 border-white/20 bg-violet/20 flex-shrink-0">
                      {item.photo ? (
                        <img src={item.photo} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/40 italic font-black">
                          {item.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-white">{item.name}</h4>
                      <p className="text-xs font-bold text-vert uppercase tracking-widest">{item.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-24 md:py-32 bg-gray-50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-vert/5 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl"
          >
            <div className="w-16 h-16 bg-violet/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-violet" />
            </div>
            <h2 className="text-3xl font-black text-violet mb-4">Restez à l'écoute de nos plumes</h2>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto leading-relaxed">
              Inscrivez-vous pour être informé de nos prochaines sorties littéraires et événements culturels.
            </p>
            
            <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" aria-label="S'abonner à la newsletter">
              <input 
                type="email" 
                name="email"
                required 
                placeholder="Votre adresse e-mail" 
                aria-label="Adresse e-mail pour la newsletter"
                className="flex-1 px-6 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-violet outline-none transition-all focus:ring-2 focus:ring-violet/20"
              />
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-vert text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-vert/20 hover:scale-105 transition-transform disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-vert"
              >
                S'inscrire
              </button>
            </form>
            <p className="text-[10px] text-gray-400 mt-6 uppercase tracking-widest font-bold">
              Zéro spam, juste de la littérature d'excellence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Notre Agenda Littéraire Public Timeline */}
      <section id="agenda-public" className="py-24 md:py-32 bg-white relative overflow-hidden border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-vert font-black uppercase tracking-[0.3em] mb-4 block">Agenda</span>
            <h2 className="text-3xl md:text-5xl font-black text-violet mb-6">Événements & Rencontres</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Venez à notre rencontre ! Dédicaces, conférences et salons littéraires près de chez vous.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Upcoming events lists (Left) */}
            <div className="lg:col-span-8 space-y-6">
              {agendaEvents.filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0))).length === 0 ? (
                <div className="p-12 text-center rounded-[2.5rem] bg-gray-50 border border-gray-100 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 bg-violet/10 text-violet rounded-full flex items-center justify-center">
                    <Book className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-700">Aucun événement à venir</h4>
                    <p className="text-xs text-gray-500 mt-1 font-semibold">Notre équipe prépare de merveilleuses rencontres littéraires pour bientôt !</p>
                  </div>
                </div>
              ) : (
                agendaEvents
                  .filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)))
                  .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 5)
                  .map((evt, i) => {
                    const evtLabels = {
                      signing: "Séance de Dédicace",
                      meeting: "Rencontre Littéraire",
                      convention: "Salon / Foire du Livre",
                      workshop: "Atelier d'écriture",
                      other: "Événement spécial"
                    };
                    const evtColors = {
                      signing: "bg-violet/10 text-violet border-violet/20",
                      meeting: "bg-[#F28C28]/10 text-[#F28C28] border-[#F28C28]/25",
                      convention: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                      workshop: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                      other: "bg-gray-500/10 text-gray-500 border-gray-500/20"
                    };
                    
                    const eventDate = new Date(evt.date);
                    const day = eventDate.getDate();
                    const month = eventDate.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
                    const weekday = eventDate.toLocaleDateString('fr-FR', { weekday: 'long' });

                    return (
                      <motion.div
                        key={evt.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 md:p-8 rounded-[2.5rem] bg-gray-50 border border-transparent hover:border-violet/15 hover:bg-violet/[0.01] transition-all flex flex-col md:flex-row gap-6 md:items-center justify-between group"
                      >
                        <div className="flex items-center gap-4 md:gap-6 min-w-0">
                          <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
                            {/* Calendar Box */}
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-violet text-white rounded-[1.5rem] shadow-xl shadow-violet/15 flex flex-col items-center justify-center flex-shrink-0">
                              <span className="text-2xl md:text-3xl font-black leading-none">{day}</span>
                              <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">{month}</span>
                            </div>

                            {/* Event image/photo */}
                            {evt.image && (
                              <img 
                                src={evt.image} 
                                alt={evt.title} 
                                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-[1.5rem] shadow-md border border-gray-100 flex-shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border mb-2 ${evtColors[evt.type as keyof typeof evtColors] || "bg-gray-100 text-gray-500"}`}>
                              {evtLabels[evt.type as keyof typeof evtLabels] || "Événement"}
                            </span>
                            <h4 className="text-lg md:text-xl font-extrabold text-gray-900 group-hover:text-violet transition-colors truncate">
                              {evt.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-gray-500 font-bold">
                              <span className="flex items-center gap-1.5 capitalize">
                                <Clock className="w-3.5 h-3.5 text-violet" /> {weekday} {evt.time ? `à ${evt.time}` : ''}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-violet" /> {evt.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Description excerpt */}
                        <div className="md:max-w-xs text-xs text-gray-500 border-l border-gray-200 pl-4 md:border-l-2 py-0.5 whitespace-pre-line leading-relaxed font-semibold">
                          {evt.description || "Rejoignez-nous pour fêter les lettres !"}
                        </div>
                      </motion.div>
                    );
                  })
              )}
            </div>

            {/* Quick schedule details (Right) */}
            <div className="lg:col-span-4 p-8 bg-violet/5 rounded-[2.5rem] border border-violet/10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet/15 text-violet rounded-xl flex items-center justify-center flex-shrink-0">
                  <Plus className="text-violet w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-violet uppercase tracking-wider">Pourquoi nous rencontrer ?</h3>
              </div>
              
              <ul className="space-y-4 text-xs font-semibold leading-relaxed text-gray-600 font-sans">
                <li className="flex gap-2 items-start">
                  <span className="w-2 h-2 rounded-full bg-vert mt-1.5 flex-shrink-0" />
                  <span>Dédicaces exclusives et rencontres privilégiées avec de célèbres auteurs ivoiriens et africains.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="w-2 h-2 rounded-full bg-vert mt-1.5 flex-shrink-0" />
                  <span>Tombola de l'excellence permettant de remporter notre catalogue en version papier de luxe.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="w-2 h-2 rounded-full bg-vert mt-1.5 flex-shrink-0" />
                  <span>Ateliers et formations d'écriture animés par nos meilleurs correcteurs et éditeurs.</span>
                </li>
              </ul>

              <div className="pt-4 border-t border-violet/10">
                <p className="text-[9px] font-black uppercase tracking-widest text-violet/60">Secteur Événementiel</p>
                <p className="text-xs text-gray-500 mt-1 font-semibold">Pour toute question ou proposition d'événement culturel dans votre région, envoyez un message via notre formulaire de contact.</p>
              </div>
            </div>
          </div>
        </div>
      </section>





      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-8">
              {config.logo && (
                <div className="bg-white p-2 rounded-2xl shadow-xl">
                  <motion.img 
                    whileHover={{ scale: 1.1 }}
                    src={config.logo} 
                    alt={`Logo ${config.name}`} 
                    className="h-12 md:h-16 w-auto" 
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
              <span className="font-bold text-xl tracking-tight">{config.name}</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              L'excellence au service de la plume. Nous accompagnons les auteurs dans la réalisation de leurs projets littéraires.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-8 uppercase tracking-widest text-vert">Contact</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-violet" />
                <span>{config.whatsapp}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-violet" />
                <span>{config.email}</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-violet" />
                <span>Abidjan, Côte d'Ivoire</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-8 uppercase tracking-widest text-vert">Suivez-nous</h4>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/saintgraalivoirien" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1877F2] transition-colors focus:ring-2 focus:ring-[#1877F2] outline-none" aria-label="Suivre sur Facebook">
                <Facebook className="w-5 h-5" aria-hidden="true" />
              </a>
              <a href="https://www.instagram.com/saintgraalivoirien" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gradient-to-tr from-[#f9ce67] via-[#f02aa2] to-[#002ae8] transition-colors focus:ring-2 focus:ring-[#f02aa2] outline-none" aria-label="Suivre sur Instagram">
                <Instagram className="w-5 h-5" aria-hidden="true" />
              </a>
              <a href={`https://wa.me/${config.whatsapp.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#25D366] transition-colors focus:ring-2 focus:ring-[#25D366] outline-none" aria-label="Nous contacter sur WhatsApp">
                <MessageCircle className="w-6 h-6" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg shadow-sm">
              {config.logo && (
                <img 
                  src={config.logo} 
                  alt="Logo" 
                  className="h-6 w-auto" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
            <p 
              className="cursor-pointer select-none group text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => {
                setAdminClickCount(prev => {
                  const next = prev + 1;
                  if (next >= 3) {
                    setShowAdminLogin(true);
                    return 0;
                  }
                  return next;
                });
              }}
            >
              &copy; {new Date().getFullYear()} {config.name}. Tous droits réservés.
            </p>
          </div>
          
          <button 
            onClick={() => setShowAdminLogin(true)}
            className="text-gray-300 hover:text-violet transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          >
            <Lock className="w-3 h-3" />
            Administration
          </button>
        </div>
      </footer>

      {/* Author Space Dashboard */}
      <AnimatePresence>
        {showAuthorSpace && currentUser && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 bg-white z-[90] flex flex-col"
          >
            {/* Header */}
            <header className="h-20 border-b border-gray-100 px-4 md:px-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                {config.logo && (
                  <img 
                    src={config.logo} 
                    alt="Logo" 
                    className="h-10 w-auto" 
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <h2 className="text-xl font-black text-violet hidden sm:block">Espace Auteurs</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full">
                  <img 
                    src={currentUser.photo || AUTHOR_PLACEHOLDER} 
                    alt="" 
                    className="w-8 h-8 rounded-full object-cover" 
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="text-sm font-bold text-gray-700 hidden md:block">{currentUser.name}</span>
                </div>
                <button 
                  onClick={() => setShowAuthorSpace(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
              {/* Sidebar - Contacts */}
              <aside className={`w-full md:w-80 border-r border-gray-100 flex flex-col bg-gray-50/50 ${activeChatPartnerId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Rechercher un auteur..." 
                      value={chatSearch}
                      onChange={(e) => setChatSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-gray-100 focus:border-violet outline-none text-sm"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveChatPartnerId(null)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${!activeChatPartnerId ? 'bg-violet text-white' : 'bg-white text-gray-500 border border-gray-100'}`}
                    >
                      Mon Profil
                    </button>
                    <button 
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${activeChatPartnerId ? 'bg-violet text-white' : 'bg-white text-gray-500 border border-gray-100'}`}
                    >
                      Messages
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="px-2 space-y-1">
                    {registeredAuthors
                      .filter(u => u.id !== currentUser.id)
                      .filter(u => u.name.toLowerCase().includes(chatSearch.toLowerCase()))
                      .map(author => {
                        const lastMsg = messages
                          .filter(m => (m.senderId === currentUser.id && m.receiverId === author.id) || (m.senderId === author.id && m.receiverId === currentUser.id))
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                        
                        const unreadCount = messages.filter(m => m.senderId === author.id && m.receiverId === currentUser.id && !m.isRead).length;

                        return (
                          <button
                            key={author.id}
                            onClick={async () => {
                              setActiveChatPartnerId(author.id);
                              // Mark as read in Firestore
                              const unreadMsgs = messages.filter(m => m.senderId === author.id && m.receiverId === currentUser.id && !m.isRead);
                              for (const msg of unreadMsgs) {
                                try {
                                  await updateDoc(doc(db, 'messages', msg.id), { isRead: true });
                                } catch (err) {
                                  console.error("Failed to mark message as read", err);
                                }
                              }
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${activeChatPartnerId === author.id ? 'bg-white shadow-sm ring-1 ring-violet/10' : 'hover:bg-white/50'}`}
                          >
                            <div className="relative">
                              <img 
                                src={author.photo || AUTHOR_PLACEHOLDER} 
                                alt="" 
                                className="w-12 h-12 rounded-full object-cover" 
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                decoding="async"
                              />
                              {author.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
                            </div>
                            <div className="flex-1 text-left overflow-hidden">
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="font-bold text-sm text-gray-900 truncate">{author.name}</span>
                                {lastMsg && <span className="text-[10px] text-gray-400">{new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                              </div>
                              <p className="text-xs text-gray-500 truncate">
                                {lastMsg ? lastMsg.text : 'Démarrer une discussion'}
                              </p>
                            </div>
                            {unreadCount > 0 && (
                              <div className="w-5 h-5 bg-violet text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {unreadCount}
                              </div>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Déconnexion
                  </button>
                </div>
              </aside>

              {/* Main Content Area */}
              <section className="flex-1 flex flex-col bg-white">
                {!activeChatPartnerId ? (
                  /* Profile View */
                  <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                    <div className="max-w-2xl mx-auto space-y-12">
                      <div className="text-center">
                        <div className="relative inline-block group">
                          <img 
                            src={currentUser.photo || AUTHOR_PLACEHOLDER} 
                            alt="" 
                            className="w-32 h-32 rounded-full object-cover border-4 border-violet/10 p-1 shadow-xl" 
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            decoding="async"
                          />
                          <label className="absolute bottom-0 right-0 w-10 h-10 bg-violet text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                            <Upload className="w-5 h-5" />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => updateProfile({ photo: reader.result as string });
                                reader.readAsDataURL(file);
                              }
                            }} />
                          </label>
                        </div>
                        <h3 className="text-2xl font-black text-violet mt-6">{currentUser.name}</h3>
                        <p className="text-gray-500">{currentUser.email}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest border-b pb-2">Informations</h4>
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-500">Nom complet</label>
                              <input 
                                type="text" 
                                defaultValue={currentUser.name} 
                                onBlur={(e) => updateProfile({ name: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-transparent focus:border-violet outline-none text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-500">Téléphone</label>
                              <input 
                                type="tel" 
                                defaultValue={currentUser.phone} 
                                onBlur={(e) => updateProfile({ phone: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-transparent focus:border-violet outline-none text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest border-b pb-2">Sécurité</h4>
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-500">Changer le mot de passe</label>
                              <input 
                                type="password" 
                                placeholder="Nouveau mot de passe"
                                onBlur={(e) => e.target.value.length >= 6 && updateProfile({}, e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-transparent focus:border-violet outline-none text-sm"
                              />
                              <p className="text-[10px] text-gray-400 italic">Min. 6 caractères pour valider</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest border-b pb-2">Ma Biographie</h4>
                        <textarea 
                          rows={6}
                          defaultValue={currentUser.bio}
                          onBlur={(e) => updateProfile({ bio: e.target.value })}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-violet outline-none text-sm leading-relaxed italic"
                        />
                      </div>

                      <div className="bg-violet/5 p-8 rounded-[2rem] text-center">
                        <Shield className="w-10 h-10 text-violet mx-auto mb-4" />
                        <h4 className="font-bold text-violet mb-2">Compte Sécurisé</h4>
                        <p className="text-sm text-gray-500">Vos données sont stockées localement sur cet appareil. Pensez à exporter vos données régulièrement depuis l'espace admin.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Chat View */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Chat Header */}
                    <div className="h-16 border-b border-gray-100 px-6 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setActiveChatPartnerId(null)} className="md:hidden p-2 -ml-2"><ChevronRight className="rotate-180" /></button>
                        <div className="relative">
                          <img 
                            src={registeredAuthors.find(u => u.id === activeChatPartnerId)?.photo || AUTHOR_PLACEHOLDER} 
                            alt="" 
                            className="w-10 h-10 rounded-full object-cover" 
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            decoding="async"
                          />
                          {registeredAuthors.find(u => u.id === activeChatPartnerId)?.isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{registeredAuthors.find(u => u.id === activeChatPartnerId)?.name}</h4>
                          <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">
                            {registeredAuthors.find(u => u.id === activeChatPartnerId)?.isOnline ? 'En ligne' : 'Hors ligne'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 custom-scrollbar">
                      {messages
                        .filter(m => (m.senderId === currentUser.id && m.receiverId === activeChatPartnerId) || (m.senderId === activeChatPartnerId && m.receiverId === currentUser.id))
                        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                        .map(msg => {
                          const isMine = msg.senderId === currentUser.id;
                          return (
                            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl shadow-sm ${isMine ? 'bg-violet text-white rounded-tr-none' : 'bg-white text-gray-700 rounded-tl-none'}`}>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                <span className={`text-[9px] mt-2 block text-right ${isMine ? 'text-violet-200' : 'text-gray-400'}`}>
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      {messages.filter(m => (m.senderId === currentUser.id && m.receiverId === activeChatPartnerId) || (m.senderId === activeChatPartnerId && m.receiverId === currentUser.id)).length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                          <MessageSquare className="w-12 h-12" />
                          <p className="text-sm">Aucun message. Dites bonjour !</p>
                        </div>
                      )}
                      <div id="chat-end" />
                    </div>

                    {/* Chat Input */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
                        if (input.value.trim()) {
                          sendMessage(input.value);
                          input.value = '';
                          setTimeout(() => document.getElementById('chat-end')?.scrollIntoView({ behavior: 'smooth' }), 100);
                        }
                      }}
                      className="p-4 border-t border-gray-100 bg-white"
                    >
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          name="message"
                          placeholder="Écrivez votre message..." 
                          autoComplete="off"
                          className="flex-1 px-6 py-3 rounded-xl bg-gray-50 border border-transparent focus:border-violet outline-none text-sm"
                        />
                        <button type="submit" className="bg-violet text-white p-3 rounded-xl shadow-lg shadow-violet/20 hover:scale-110 transition-transform">
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </section>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"><X /></button>
              
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-violet mb-2">
                  {authMode === 'login' ? 'Connexion Auteur' : authMode === 'register' ? 'Rejoindre la Plume' : 'Mot de passe oublié'}
                </h2>
                <p className="text-gray-500">
                  {authMode === 'login' ? 'Accédez à votre espace privé' : authMode === 'register' ? 'Créez votre profil et échangez avec les autres' : 'Nous allons vous aider à revenir'}
                </p>
              </div>

              {authMode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase">Email</label>
                    <input type="email" name="email" required className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet outline-none" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-xs font-black text-gray-400 uppercase">Mot de passe</label>
                      <button type="button" onClick={() => setAuthMode('forgot')} className="text-xs font-bold text-violet hover:underline">Oublié ?</button>
                    </div>
                    <input type="password" name="password" required className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet outline-none" />
                  </div>
                  <button type="submit" className="w-full bg-violet text-white py-4 rounded-xl font-bold shadow-lg shadow-violet/20 hover:scale-[1.02] transition-transform">
                    Se connecter
                  </button>
                  <p className="text-center text-sm text-gray-500">
                    Pas encore de compte ? <button type="button" onClick={() => setAuthMode('register')} className="text-violet font-bold hover:underline">S'inscrire</button>
                  </p>
                  
                  <div className="pt-6 border-t border-gray-50 flex flex-col items-center gap-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Section Réservée</p>
                    <button 
                      type="button" 
                      onClick={() => { setShowAuthModal(false); setShowAdminLogin(true); }}
                      className="text-xs font-bold text-gray-400 hover:text-violet flex items-center gap-2 transition-colors group"
                    >
                      <Shield className="w-3 h-3 transition-transform group-hover:scale-110" />
                      Accès Administrateur
                    </button>
                  </div>
                </form>
              )}

              {authMode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase">Nom Complet</label>
                    <input type="text" name="name" required className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase">Email</label>
                    <input type="email" name="email" required className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase">Mot de passe (min 6 car.)</label>
                    <input type="password" name="password" required minLength={6} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase">Téléphone (Optionnel)</label>
                    <input type="tel" name="phone" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase">Biographie</label>
                    <textarea name="bio" required rows={3} className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase">Photo de profil</label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 flex items-center justify-center gap-2 bg-gray-50 border-2 border-dashed border-gray-200 p-4 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-500">Choisir une photo</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const input = document.createElement('input');
                              input.type = 'hidden';
                              input.name = 'photo_base64';
                              input.value = reader.result as string;
                              e.target.form?.appendChild(input);
                              notify("Photo sélectionnée");
                            };
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </label>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-vert text-white py-4 rounded-xl font-bold shadow-lg shadow-vert/20 hover:scale-[1.02] transition-transform mt-4">
                    Créer mon compte
                  </button>
                  <p className="text-center text-sm text-gray-500">
                    Déjà inscrit ? <button type="button" onClick={() => setAuthMode('login')} className="text-violet font-bold hover:underline">Se connecter</button>
                  </p>
                </form>
              )}

              {authMode === 'forgot' && (
                <div className="space-y-6 text-center">
                  <div className="w-20 h-20 bg-violet/10 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="w-10 h-10 text-violet" />
                  </div>
                  <p className="text-gray-600">
                    Pour réinitialiser votre mot de passe, veuillez contacter l'administration de {config.name} via WhatsApp.
                  </p>
                  <a 
                    href={`https://wa.me/${config.whatsapp.replace(/\s+/g, '')}?text=Bonjour, j'ai oublié mon mot de passe pour l'espace auteur.`}
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-3 rounded-xl font-bold"
                  >
                    Contacter l'Admin
                  </a>
                  <button onClick={() => setAuthMode('login')} className="block w-full text-sm text-gray-500 hover:underline">Retour à la connexion</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedBook && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedBook(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-book-title"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] overflow-hidden w-full max-w-4xl shadow-2xl flex flex-col md:flex-row my-auto focus:outline-none"
              onClick={(e) => e.stopPropagation()}
              tabIndex={-1}
            >
              <div className="md:w-2/5 aspect-[3/4] md:aspect-auto">
                <img 
                  src={selectedBook.cover || PLACEHOLDER_IMAGE} 
                  alt={`Couverture de ${selectedBook.title}`} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="md:w-3/5 p-8 md:p-12 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 id="modal-book-title" className="text-3xl font-black text-violet mb-1">{selectedBook.title}</h2>
                    <p className="text-[10px] font-black text-vert uppercase tracking-[0.2em] mb-2">{selectedBook.genre}</p>
                    <p className="text-lg font-bold text-gray-500 italic">
                      Par {authors.find(a => a.id === selectedBook.authorId)?.name || "Auteur inconnu"}
                    </p>
                    <div className="flex gap-4 mt-1">
                      <p className="text-xs font-bold text-gray-400">ISBN: {selectedBook.isbn}</p>
                      <p className="text-xs font-bold text-gray-400">Publié le: {selectedBook.publicationDate}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedBook(null)} 
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet"
                    aria-label="Fermer les détails du livre"
                  >
                    <X aria-hidden="true" />
                  </button>
                </div>
                <div className="mb-8 overflow-y-auto pr-4 custom-scrollbar max-h-[40vh] md:max-h-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedBook.summary}</p>
                </div>
                <div className="mt-auto flex flex-col gap-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-violet">{selectedBook.price} CFA</span>
                    <button 
                      onClick={() => setCheckoutBook(selectedBook)}
                      className="bg-vert text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-vert/20 hover:scale-105 transition-transform"
                    >
                      Commander sur WhatsApp
                    </button>
                  </div>
                  <button 
                    onClick={() => setSelectedBook(null)}
                    className="text-gray-400 font-bold hover:text-violet transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <X className="w-4 h-4" /> Fermer les détails
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {checkoutBook && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => {
              setCheckoutBook(null);
              setCheckoutForm({ lastName: '', firstName: '', deliveryAddress: '' });
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-checkout-title"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] overflow-hidden w-full max-w-md shadow-2xl p-8 my-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => {
                  setCheckoutBook(null);
                  setCheckoutForm({ lastName: '', firstName: '', deliveryAddress: '' });
                }} 
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Fermer le formulaire de commande"
              >
                <X aria-hidden="true" className="w-5 h-5 text-gray-400" />
              </button>

              <h2 id="modal-checkout-title" className="text-2xl font-black text-violet mb-2">Finaliser la commande</h2>
              <p className="text-gray-500 text-sm mb-6">
                Pour commander <strong className="text-violet">"{checkoutBook.title}"</strong> ({checkoutBook.price.toLocaleString()} CFA), veuillez renseigner vos coordonnées. Vous serez mis(e) en relation directe via WhatsApp pour valider la livraison.
              </p>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Prénom</label>
                  <input
                    type="text"
                    value={checkoutForm.firstName}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, firstName: e.target.value })}
                    placeholder="Ex: Kouame"
                    className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-violet focus:bg-white transition-all font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Nom de famille</label>
                  <input
                    type="text"
                    value={checkoutForm.lastName}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, lastName: e.target.value })}
                    placeholder="Ex: Yao"
                    className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-violet focus:bg-white transition-all font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Adresse de livraison <span className="text-gray-400 text-[9px] font-normal lowercase">(si besoin)</span></label>
                  <textarea
                    rows={3}
                    value={checkoutForm.deliveryAddress}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, deliveryAddress: e.target.value })}
                    placeholder="Ex: Abidjan, Cocody Riviera 3, Cité des arts (laissez vide si retrait en librairie)"
                    className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-violet focus:bg-white transition-all font-medium resize-none shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-4 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm flex items-center justify-center gap-2 mt-4 hover:shadow-lg hover:shadow-green-200"
                >
                  <span>Confirmer &amp; Envoyer sur WhatsApp</span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {selectedAuthor && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedAuthor(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-author-name"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 w-full max-w-2xl shadow-2xl text-center relative my-auto scroll-mt-20 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
              tabIndex={-1}
            >
              <button 
                onClick={() => setSelectedAuthor(null)} 
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-violet"
                aria-label="Fermer le profil de l'auteur"
              >
                <X aria-hidden="true" />
              </button>
              
              <div className="w-56 h-72 mx-auto mb-8 rounded-[2rem] overflow-hidden border-8 border-violet/5 p-2.5 bg-white flex items-center justify-center shadow-xl">
                <img 
                  src={selectedAuthor.photo || AUTHOR_PLACEHOLDER} 
                  alt={`Photo de ${selectedAuthor.name}`} 
                  className="w-full h-full object-contain rounded-2xl" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              
              <h2 id="modal-author-name" className="text-3xl font-black text-violet mb-4">{selectedAuthor.name}</h2>
              <div className="w-16 h-1.5 bg-vert mx-auto rounded-full mb-8" />
              
              <div className="mb-10">
                <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap italic">"{selectedAuthor.bio}"</p>
              </div>
              
              <div className="mt-12">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Bibliographie</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {visibleBooks.filter(b => b.authorId === selectedAuthor.id).map(book => (
                    <div 
                      key={book.id} 
                      className="group/book cursor-pointer"
                      onClick={() => {
                        setSelectedAuthor(null);
                        setSelectedBook(book);
                      }}
                    >
                      <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-md mb-2 group-hover/book:shadow-xl transition-all">
                        <img 
                          src={book.cover || PLACEHOLDER_IMAGE} 
                          alt={book.title} 
                          className="w-full h-full object-cover group-hover/book:scale-110 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <h5 className="text-xs font-bold text-violet line-clamp-1 group-hover/book:text-vert transition-colors">{book.title}</h5>
                      <p className="text-[10px] font-black text-vert">{book.price} CFA</p>
                    </div>
                  ))}
                </div>
                {visibleBooks.filter(b => b.authorId === selectedAuthor.id).length === 0 && (
                  <p className="text-sm text-gray-400 italic">Aucun livre répertorié pour le moment.</p>
                )}
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
                <button 
                  onClick={() => setSelectedAuthor(null)}
                  className="text-gray-400 font-bold hover:text-violet transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Fermer l'univers
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdminLogin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-violet">Accès Admin</h2>
                <button onClick={() => setShowAdminLogin(false)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
              </div>
              <div className="space-y-6">
                {isActuallyAdmin ? (
                  <div className="space-y-6 text-center">
                    <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Identité Confirmée</h3>
                      <p className="text-sm text-gray-500 font-medium">Vous êtes reconnu comme l'administrateur ({auth.currentUser?.email}).</p>
                    </div>
                    <button 
                      onClick={() => { setIsAdmin(true); setShowAdminLogin(false); }}
                      className="w-full bg-violet text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-violet/20 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                    >
                      <Layout className="w-6 h-6" />
                      Accéder au Tableau de Bord
                    </button>
                    <button 
                      onClick={() => handleLogout()}
                      className="text-xs text-red-500 font-bold uppercase tracking-widest hover:underline"
                    >
                      Changer de compte
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-violet/5 p-4 rounded-xl">
                      <p className="text-xs text-violet font-medium leading-relaxed">
                        <strong>Accès Rapide :</strong> Connectez-vous directement avec votre compte Google admin.
                      </p>
                    </div>

                    <button 
                      onClick={handleAdminGoogleLogin}
                      className="w-full bg-white border-2 border-gray-100 text-gray-700 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm"
                    >
                      <img 
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                        alt="" 
                        className="w-5 h-5" 
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                      Continuer avec Google
                    </button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Ou avec mot de passe</span></div>
                    </div>

                    <form onSubmit={handleAdminLogin} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase">Mot de passe</label>
                        <div className="relative">
                          <input 
                            type={showAdminPassword ? "text" : "password"} 
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet outline-none pr-12" 
                          />
                          <button 
                            type="button"
                            onClick={() => setShowAdminPassword(!showAdminPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet transition-colors"
                          >
                            {showAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-violet text-white py-4 rounded-xl font-bold shadow-lg shadow-violet/20 flex items-center justify-center gap-2">
                        <Shield className="w-5 h-5" />
                        Déverrouiller
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Professional Admin Dashboard */}
      <AnimatePresence>
        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-white overflow-hidden"
          >
            <AdminLayout
              activeTab={adminTab}
              setActiveTab={(tab: any) => setAdminTab(tab)}
              sidebarExpanded={sidebarExpanded}
              setSidebarExpanded={setSidebarExpanded}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onLogout={() => {
                handleLogout();
                setIsAdmin(false);
              }}
              userName={auth.currentUser?.displayName || "Admin Principal"}
              userEmail={auth.currentUser?.email || "admin@saintgraalivoirien.com"}
              notificationsCount={submissions.filter(s => s.status === 'pending').length + contactMessages.filter(m => !m.isRead).length}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            >
              {adminTab === 'dashboard' && (
                <DashboardHome 
                  books={books}
                  authors={authors}
                  submissions={submissions}
                  messages={contactMessages}
                  logs={adminLogs}
                  news={news}
                  darkMode={darkMode}
                  onTabChange={(tab, action) => {
                    setAdminTab(tab as any);
                    if (action === 'addBook') setAutoOpenAddBook(true);
                  }}
                />
              )}

              {adminTab === 'books' && (
                <BookManager 
                  books={books}
                  authors={authors}
                  onAdd={addBook}
                  onUpdate={updateBook}
                  onDelete={async (id) => {
                    const book = books.find(b => b.id === id);
                    if (book) await handleDeleteBook(id, book.title);
                  }}
                  onReorder={reorderBooks}
                  darkMode={darkMode}
                  autoOpenAdd={autoOpenAddBook}
                  onModalClose={() => setAutoOpenAddBook(false)}
                />
              )}

              {adminTab === 'submissions' && (
                <SubmissionManager 
                  submissions={submissions}
                  onUpdate={async (id, updates) => {
                    try {
                      await updateDoc(doc(db, 'submissions', id), updates);
                      logAction(`Mis à jour status soumission`, 'submission', id);
                      notify("Soumission mise à jour");
                    } catch (err) {
                      handleFirestoreError(err, OperationType.UPDATE, `submissions/${id}`);
                    }
                  }}
                  onDelete={async (id) => {
                    try {
                      await deleteDoc(doc(db, 'submissions', id));
                      logAction(`Supprimé soumission`, 'submission', id);
                      notify("Soumission supprimée");
                    } catch (err) {
                      handleFirestoreError(err, OperationType.DELETE, `submissions/${id}`);
                    }
                  }}
                  darkMode={darkMode}
                />
              )}

              {adminTab === 'settings' && (
                <SettingsManager 
                  config={config}
                  onUpdate={async (data) => {
                    try {
                      const newConfig = { ...config, ...data };
                      await setDoc(doc(db, 'config', 'main'), newConfig);
                      setConfig(newConfig);
                      logAction(`Mis à jour configuration`, 'config', 'main');
                      notify("Configuration enregistrée");
                    } catch (err) {
                      handleFirestoreError(err, OperationType.UPDATE, 'config/main');
                    }
                  }}
                  darkMode={darkMode}
                  onNotify={notify}
                />
              )}

              {adminTab === 'newsletter' && (
                <NewsletterManager 
                  subscribers={newsletter}
                  onDelete={async (id) => {
                    try {
                      await deleteDoc(doc(db, 'newsletter', id));
                      logAction(`Supprimé abonné newsletter`, 'newsletter', id);
                      notify("Abonné supprimé");
                    } catch (err) {
                      handleFirestoreError(err, OperationType.DELETE, `newsletter/${id}`);
                    }
                  }}
                  onSendCampaign={async () => {
                    if (newsletter.length === 0) return notify("Aucun abonné pour le moment", "error");
                    if (!window.confirm(`Vous allez envoyer une notification AI à ${newsletter.length} abonnés. Continuer ?`)) return;
                    
                    setIsLoading(true);
                    try {
                      const book = books[0];
                      if (!book) throw new Error("Aucun livre pour la campagne");
                      const content = await generateNotificationContent(book, 'book', config.name);
                      await notifySubscribers(newsletter, content);
                      logAction(`Envoyé campagne newsletter`, 'newsletter', 'all');
                      notify("Campagne envoyée avec succès");
                    } catch (err) {
                      notify("Erreur lors de l'envoi", "error");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  darkMode={darkMode}
                />
              )}

              {adminTab === 'messages' && (
                <MessageManager 
                  messages={contactMessages}
                  onUpdate={async (id, updates) => {
                    try {
                      await updateDoc(doc(db, 'contactMessages', id), updates);
                      notify("Message mis à jour");
                    } catch (err) {
                      handleFirestoreError(err, OperationType.UPDATE, `contactMessages/${id}`);
                    }
                  }}
                  onDelete={async (id) => {
                    if (window.confirm("Supprimer ce message ?")) {
                      try {
                        await deleteDoc(doc(db, 'contactMessages', id));
                        logAction(`Supprimé message contact`, 'contact', id);
                        notify("Message supprimé");
                      } catch (err) {
                        handleFirestoreError(err, OperationType.DELETE, `contactMessages/${id}`);
                      }
                    }
                  }}
                  darkMode={darkMode}
                />
              )}

              {adminTab === 'authors' && (
                <AuthorsManager 
                  authors={authors}
                  onAdd={addAuthor}
                  onUpdate={updateAuthor}
                  onDelete={deleteAuthor}
                  darkMode={darkMode}
                />
              )}

              {adminTab === 'news' && (
                <NewsManager 
                   news={news}
                   onAdd={addNews}
                   onUpdate={updateNews}
                   onDelete={handleDeleteNews}
                   onNotify={async (item) => {
                     if (!window.confirm("Envoyer cette actualité à tous les abonnés ?")) return;
                     try {
                        setIsLoading(true);
                        const content = await generateNotificationContent(item, 'news', config.name);
                        await notifySubscribers(newsletter, content);
                        logAction(`Envoyé notification news`, 'news', item.id);
                        notify("Abonnés notifiés");
                     } catch (err) {
                        notify("Erreur lors de la notification", "error");
                     } finally {
                        setIsLoading(false);
                     }
                   }}
                   darkMode={darkMode}
                />
              )}

              {adminTab === 'contests' && (
                <ContestManager 
                  contests={contests}
                  onAdd={addContest}
                  onUpdate={updateContest}
                  onDelete={deleteContest}
                  darkMode={darkMode}
                />
              )}

              {adminTab === 'testimonials' && (
                <TestimonialsManager 
                  testimonials={testimonials}
                  onAdd={addTestimonial}
                  onUpdate={updateTestimonial}
                  onDelete={deleteTestimonial}
                  darkMode={darkMode}
                />
              )}

              {adminTab === 'faq' && (
                <FAQManager 
                  faqs={faqs}
                  onAdd={addFAQ}
                  onUpdate={updateFAQ}
                  onDelete={deleteFAQ}
                  darkMode={darkMode}
                />
              )}

              {adminTab === 'agenda' && (
                <AgendaManager 
                  events={agendaEvents}
                  authors={authors}
                  onAdd={addAgendaEvent}
                  onUpdate={updateAgendaEvent}
                  onDelete={deleteAgendaEvent}
                  darkMode={darkMode}
                />
              )}

              {adminTab === 'gallery' && (
                <GalleryManager 
                   gallery={gallery}
                   onAdd={async (data) => {
                     try {
                        const id = Date.now().toString();
                        await setDoc(doc(db, 'gallery', id), {
                          id,
                          ...data
                        });
                        logAction(`Ajouté photo galerie`, 'gallery', id);
                        notify("Photo ajoutée");
                     } catch (err) {
                        handleFirestoreError(err, OperationType.CREATE, 'gallery');
                     }
                   }}
                   onDelete={async (id) => {
                     if (window.confirm("Supprimer cette photo ?")) {
                        try {
                          await deleteDoc(doc(db, 'gallery', id));
                          logAction(`Supprimé photo galerie`, 'gallery', id);
                          notify("Photo supprimée");
                        } catch (err) {
                          handleFirestoreError(err, OperationType.DELETE, `gallery/${id}`);
                        }
                     }
                   }}
                   onUpdate={async (id, data) => {
                      try {
                        await updateDoc(doc(db, 'gallery', id), data);
                      } catch (err) {
                        handleFirestoreError(err, OperationType.UPDATE, `gallery/${id}`);
                      }
                   }}
                   handleImageUpload={handleImageUpload}
                   darkMode={darkMode}
                />
              )}

              {adminTab === 'regAuthors' && (
                <RegisteredAuthorsManager 
                  authors={registeredAuthors}
                  onUpdate={updateRegisteredAuthor}
                  onDelete={deleteRegisteredAuthor}
                  darkMode={darkMode}
                />
              )}
            </AdminLayout>

            {/* Close button for safety */}
            <button 
              onClick={() => setIsAdmin(false)}
              className="fixed bottom-8 right-8 w-14 h-14 bg-violet text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform md:hidden z-[80]"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-24 lg:bottom-8 left-8 z-50 bg-violet text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
          >
            <ChevronRight className="-rotate-90 w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {!isAdmin && <BottomNav />}
    </div>
    </ErrorBoundary>
  );
}
