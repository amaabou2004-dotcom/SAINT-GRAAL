export enum OperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LIST = 'LIST',
  GET = 'GET',
  WRITE = 'WRITE',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export interface Author {
  id: string;
  name: string;
  photo: string;
  bio: string;
  isMonthAuthor?: boolean;
  isHidden?: boolean;
}

export interface BookItem {
  id: string;
  title: string;
  authorId: string;
  isbn: string;
  publicationDate: string;
  price: string;
  summary: string;
  cover: string;
  genre: string;
  literaryGenre?: string;
  order?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  photo?: string;
  rating: number;
  date: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  image?: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  date: string;
}

export interface RegisteredAuthor {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  photo: string;
  bio: string;
  phone?: string;
  status: 'active' | 'blocked';
  isOnline: boolean;
  createdAt: string;
  role?: UserRole;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

export type UserRole = 'admin' | 'editor' | 'moderator';

export type SubmissionStatus = 'pending' | 'accepted' | 'refused';

export interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  fileUrl: string;
  fileName: string;
  status: SubmissionStatus;
  internalComment?: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  replied: boolean;
  createdAt: string;
}

export interface AdminLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  order?: number;
}

export interface SiteConfig {
  name: string;
  slogan: string;
  intro: string;
  whatsapp: string;
  whatsapp2?: string;
  dirName: string;
  dirRole: string;
  dirBio: string;
  dirPhoto: string;
  logo: string;
  email: string;
  formspreeId?: string;
  seoTitle?: string;
  seoDescription?: string;
  primaryColor?: string;
  secondaryColor?: string;
  lastAuthorRotation?: string;
  mktName?: string;
  mktRole?: string;
  mktBio?: string;
  mktPhoto?: string;
}

export interface SellerRequest {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  message: string;
  status: 'pending' | 'accepted' | 'refused';
  createdAt: string;
}

export type EventType = 'signing' | 'meeting' | 'convention' | 'workshop' | 'other';

export interface AgendaEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  location: string;
  description: string;
  type: EventType;
  authorId?: string;
  image?: string;
  createdAt: string;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  rules?: string;
  prize: string;
  deadline: string; // YYYY-MM-DD
  status: 'active' | 'completed' | 'draft';
  participantsCount?: number;
  image?: string;
  createdAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order?: number;
  createdAt: string;
  isPending?: boolean;
  authorName?: string;
}

export interface ContestSubmission {
  id: string;
  contestId: string;
  contestTitle: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  synopsis?: string;
  content: string;
  fileName?: string;
  fileUrl?: string;
  status: 'pending' | 'accepted' | 'refused';
  internalComment?: string;
  createdAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  name: string;
  email: string;
  phone: string;
  isNewsletterConsent: boolean;
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  bookId: string;
  bookTitle: string;
  eventType: 'view' | 'order_click' | 'order_submit';
  timestamp: string;
}


