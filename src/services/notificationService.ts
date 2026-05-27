import { GoogleGenAI } from "@google/genai";
import emailjs from "@emailjs/browser";
import { BookItem, Author, NewsItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface EmailContent {
  subject: string;
  body: string;
  to_email?: string;
}

export const generateSubmissionAdminContent = async (
  submission: { name: string; email: string; phone: string; message: string; fileName: string },
  siteName: string = "Saint Graal Ivoirien"
): Promise<EmailContent> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Génère une notification d'e-mail destinée à la direction de la maison d'édition ${siteName} pour l'informer qu'un nouveau manuscrit a été soumis.
Auteur: ${submission.name}
Email: ${submission.email}
Téléphone: ${submission.phone}
Fichier: ${submission.fileName}
Message de l'auteur: ${submission.message}

Le sujet doit être clair (ex: Nouveau Manuscrit Reçu - [Titre ou Nom]).
Le corps du message doit être formel et récapituler les informations.
Réponds en format JSON avec les clés "subject" and "body". En français.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);
    return {
      subject: result.subject || `Nouveau Manuscrit: ${submission.name}`,
      body: result.body || `Un nouveau manuscrit a été reçu de la part de ${submission.name}. Contact: ${submission.email} / ${submission.phone}. Fichier: ${submission.fileName}.`
    };
  } catch (error) {
    console.error("Gemini Submission Admin Notification Error:", error);
    return {
      subject: `Nouveau Manuscrit Reçu: ${submission.name}`,
      body: `Un nouveau manuscrit a été reçu de la part de ${submission.name}.\nEmail: ${submission.email}\nTéléphone: ${submission.phone}\nFichier: ${submission.fileName}\nMessage: ${submission.message}`
    };
  }
};

export const generateNotificationContent = async (
  item: BookItem | Author | NewsItem,
  type: 'book' | 'author' | 'news',
  siteName: string = "Saint Graal Ivoirien"
): Promise<EmailContent> => {
  const model = "gemini-3-flash-preview";
  
  let prompt = "";
  if (type === 'book') {
    const book = item as BookItem;
    prompt = `Génère un sujet d'e-mail et un corps de message court et enthousiaste pour annoncer la sortie d'un nouveau livre intitulé "${book.title}". Résumé: ${book.summary}. Le ton doit être professionnel mais chaleureux pour une maison d'édition nommée ${siteName}. Réponds en format JSON avec les clés "subject" et "body". En français.`;
  } else if (type === 'author') {
    const author = item as Author;
    prompt = `Génère un sujet d'e-mail et un corps de message court pour annoncer l'arrivée d'un nouvel auteur, ${author.name}, dans notre maison d'édition ${siteName}. Bio: ${author.bio}. Réponds en format JSON avec les clés "subject" et "body". En français.`;
  } else if (type === 'news') {
    const news = item as NewsItem;
    prompt = `Génère un sujet d'e-mail et un corps de message court pour partager une nouvelle actualité intitulée "${news.title}". Contenu: ${news.content}. Réponds en format JSON avec les clés "subject" et "body". En français.`;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);
    return {
      subject: result.subject || "Nouvelle annonce de Saint Graal Ivoirien",
      body: result.body || "Découvrez nos dernières nouveautés sur notre site !"
    };
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    const fallbackTitle = 'title' in item ? item.title : 'name' in item ? item.name : 'Actualité';
    return {
      subject: `Annonce: ${fallbackTitle}`,
      body: `Une nouvelle mise à jour est disponible chez ${siteName} : ${fallbackTitle}. Consultez notre site pour plus de détails.`
    };
  }
};

export const generateWelcomeContent = async (
  name: string | null,
  type: 'newsletter' | 'author',
  siteName: string = "Saint Graal Ivoirien"
): Promise<EmailContent> => {
  const model = "gemini-3-flash-preview";
  
  let prompt = "";
  if (type === 'newsletter') {
    prompt = `Génère un sujet d'e-mail de bienvenue et un court message de remerciement chaleureux pour une inscription à la newsletter de la maison d'édition ${siteName}. Le ton doit être élégant et littéraire. Réponds en format JSON avec les clés "subject" and "body". En français.`;
  } else {
    prompt = `Génère un sujet d'e-mail de bienvenue et un court message pour un nouvel auteur nommé ${name} qui vient de créer son compte sur l'espace privé de la maison d'édition ${siteName}. Souhaite-lui la bienvenue dans l'aventure éditoriale. Réponds en format JSON avec les clés "subject" and "body". En français.`;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);
    return {
      subject: result.subject || `Bienvenue chez ${siteName}`,
      body: result.body || "Nous sommes ravis de vous compter parmi nous !"
    };
  } catch (error) {
    console.error("Gemini Welcome Error:", error);
    return {
      subject: `Bienvenue chez ${siteName}`,
      body: `Bonjour${name ? ' ' + name : ''}, votre inscription sur ${siteName} a bien été prise en compte. Bienvenue dans notre communauté !`
    };
  }
};

export const getEmailJSConfig = () => {
  return {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    isConfigured: !!(import.meta.env.VITE_EMAILJS_SERVICE_ID && 
                    import.meta.env.VITE_EMAILJS_TEMPLATE_ID && 
                    import.meta.env.VITE_EMAILJS_PUBLIC_KEY)
  };
};

export const notifyAdmin = async (
  adminEmail: string,
  content: EmailContent
) => {
  const { serviceId, publicKey, isConfigured } = getEmailJSConfig();
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_ADMIN || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

  if (!isConfigured) {
    console.warn("EmailJS non configuré pour les notifications admin.");
    return;
  }

  try {
    await emailjs.send(serviceId, templateId, {
      to_email: adminEmail,
      subject: content.subject,
      message: content.body
    }, publicKey);
    console.log("Admin notified successfully.");
  } catch (error) {
    console.error("Failed to notify admin:", error);
  }
};

export const notifySubscribers = async (
  subscribers: { email: string }[],
  content: EmailContent
) => {
  const { serviceId, templateId, publicKey, isConfigured } = getEmailJSConfig();

  if (!isConfigured) {
    const errorMsg = "EmailJS non configuré. Veuillez remplir VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID et VITE_EMAILJS_PUBLIC_KEY dans les paramètres.";
    console.warn(errorMsg);
    console.log("Planned Content:", content);
    throw new Error(errorMsg);
  }

  const promises = subscribers.map(sub => 
    emailjs.send(serviceId, templateId, {
      to_email: sub.email,
      subject: content.subject,
      message: content.body
    }, publicKey)
  );

  try {
    await Promise.all(promises);
    console.log(`Successfully notified ${subscribers.length} subscribers.`);
  } catch (error) {
    console.error("EmailJS Error:", error);
    throw error;
  }
};
