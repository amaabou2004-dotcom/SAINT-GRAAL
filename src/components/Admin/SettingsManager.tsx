import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon, Globe, Shield, Smartphone, Mail, Image as ImageIcon, 
  Save, Eye, Code, Search, CheckCircle, Smartphone as WhatsAppIcon, 
  Bell, AlertCircle, Send, ShieldAlert, CheckCircle2 as BadgeCheck,
  Upload, Trash2, Loader2, RefreshCw
} from 'lucide-react';
import { SiteConfig } from '../../types';
import { getEmailJSConfig, notifySubscribers } from '../../services/notificationService';
import { LogoDownloader } from './LogoDownloader';

interface SettingsManagerProps {
  config: SiteConfig;
  onUpdate: (data: Partial<SiteConfig>) => void;
  darkMode: boolean;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  config, onUpdate, darkMode, onNotify
}) => {
  const [activePanel, setActivePanel] = useState<'general' | 'seo' | 'contact' | 'social' | 'notifications'>('general');
  const [formData, setFormData] = useState<SiteConfig>(config);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingDirPhoto, setIsUploadingDirPhoto] = useState(false);
  const [isUploadingMktPhoto, setIsUploadingMktPhoto] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dirPhotoInputRef = useRef<HTMLInputElement>(null);
  const mktPhotoInputRef = useRef<HTMLInputElement>(null);

  const processImageFile = async (file: File, field: 'dirPhoto' | 'mktPhoto', setUploadingState: (val: boolean) => void) => {
    if (!file.type.startsWith('image/')) {
      onNotify?.("Veuillez sélectionner uniquement une image depuis votre galerie.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onNotify?.("Cette image est trop volumineuse (maximum 5 Mo).", "error");
      return;
    }

    try {
      setUploadingState(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const rawBase64 = reader.result as string;
          const isPng = file.type === 'image/png';
          
          const compressed = await new Promise<string>((resolve, reject) => {
            const img = new Image();
            img.src = rawBase64;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              const maxDim = 800; // Optimal profile detailed resolution

              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = (height * maxDim) / width;
                  width = maxDim;
                } else {
                  width = (width * maxDim) / height;
                  height = maxDim;
                }
              }

              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext('2d');
              if (!ctx) {
                resolve(rawBase64);
                return;
              }

              ctx.drawImage(img, 0, 0, width, height);
              const outputType = isPng ? 'image/png' : 'image/jpeg';
              const quality = isPng ? undefined : 0.85;
              const result = canvas.toDataURL(outputType, quality);
              resolve(result);
            };
            img.onerror = () => reject(new Error("Erreur de chargement du fichier."));
          });

          setFormData(prev => ({ ...prev, [field]: compressed }));
          onNotify?.("Photo chargée avec succès depuis votre galerie !", "success");
        } catch (err) {
          console.error(err);
          onNotify?.("Impossible d'importer la photo sélectionnée.", "error");
        } finally {
          setUploadingState(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      onNotify?.("Une erreur est survenue lors de la lecture du fichier.", "error");
      setUploadingState(false);
    }
  };

  const handleLogoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onNotify?.("Veuillez sélectionner uniquement une image depuis votre galerie.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onNotify?.("Cette image est trop volumineuse (maximum 5 Mo).", "error");
      return;
    }

    try {
      setIsUploadingLogo(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const rawBase64 = reader.result as string;
          const isPng = file.type === 'image/png';
          
          // Custom base64 logo compressor to preserve png transparency and optimize size
          const compressed = await new Promise<string>((resolve, reject) => {
            const img = new Image();
            img.src = rawBase64;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              const maxDim = 800; // Optimal detailed logo resolution

              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = (height * maxDim) / width;
                  width = maxDim;
                } else {
                  width = (width * maxDim) / height;
                  height = maxDim;
                }
              }

              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext('2d');
              if (!ctx) {
                resolve(rawBase64);
                return;
              }

              ctx.drawImage(img, 0, 0, width, height);
              const outputType = isPng ? 'image/png' : 'image/jpeg';
              const quality = isPng ? undefined : 0.85;
              const result = canvas.toDataURL(outputType, quality);
              resolve(result);
            };
            img.onerror = () => reject(new Error("Erreur de chargement du fichier."));
          });

          setFormData(prev => ({ ...prev, logo: compressed }));
          onNotify?.("Logo chargé avec succès depuis votre galerie !", "success");
        } catch (err) {
          console.error(err);
          onNotify?.("Impossible d'importer le logo sélectionné.", "error");
        } finally {
          setIsUploadingLogo(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      onNotify?.("Une erreur est survenue lors de la lecture du fichier.", "error");
      setIsUploadingLogo(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoFile(e.dataTransfer.files[0]);
    }
  };

  const emailConfig = getEmailJSConfig();

  const handleSendTestEmail = async () => {
    if (!emailConfig.isConfigured) {
      onNotify?.("EmailJS n'est pas configuré. Veuillez ajouter les variables d'environnement.", "error");
      return;
    }

    try {
      setIsTestingEmail(true);
      await notifySubscribers([{ email: config.email }], {
        subject: "Test d'automatisation - Saint Graal Ivoirien",
        body: "Ceci est un e-mail de test pour vérifier que votre configuration EmailJS fonctionne correctement."
      });
      onNotify?.("E-mail de test envoyé à " + config.email, "success");
    } catch (err: any) {
      onNotify?.(err.message || "Erreur lors de l'envoi du test", "error");
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdate(formData);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black">Paramètres de la Plateforme</h2>
          <p className="text-sm text-gray-500">Configurez les informations globales et le référencement du site.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-3 bg-violet text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-violet/20 hover:scale-105 transition-all"
        >
          <Save className="w-5 h-5" /> Enregistrer les modifications
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Rail */}
        <aside className="w-full lg:w-64 space-y-2">
          {[
            { id: 'general', label: 'Général', icon: SettingsIcon },
            { id: 'seo', label: 'SEO & Visibilité', icon: Globe },
            { id: 'contact', label: 'Contact & Infos', icon: Mail },
            { id: 'social', label: 'WhatsApp & Réseaux', icon: Smartphone },
            { id: 'notifications', label: 'E-mails & Automates', icon: Bell },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id as any)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
                activePanel === item.id 
                  ? 'bg-violet text-white shadow-lg' 
                  : 'text-gray-500 hover:bg-violet/5 hover:text-violet dark:text-gray-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </aside>

        {/* Form Panel */}
        <div className={`flex-1 rounded-[2.5rem] border p-8 md:p-12 space-y-12 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm`}>
          {activePanel === 'general' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-2">Nom de la Maison</label>
                  <input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange}
                    className={`w-full p-4 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-gray-900 border-gray-700 focus:border-violet' : 'bg-gray-50 border-gray-50 focus:border-violet'}`}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-2">Slogan</label>
                  <input 
                    name="slogan" 
                    value={formData.slogan} 
                    onChange={handleChange}
                    className={`w-full p-4 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-gray-900 border-gray-700 focus:border-violet' : 'bg-gray-50 border-gray-50 focus:border-violet'}`}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-2">Introduction Accueil</label>
                <textarea 
                  name="intro" 
                  value={formData.intro} 
                  onChange={handleChange}
                  rows={4}
                  className={`w-full p-6 bg-gray-50 border-2 border-transparent focus:border-violet outline-none rounded-[2rem] transition-all resize-none ${darkMode ? 'bg-gray-900 text-white' : ''}`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-2">Nom du Directeur Général</label>
                  <input 
                    name="dirName" 
                    value={formData.dirName} 
                    onChange={handleChange}
                    className={`w-full p-4 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-gray-900 border-gray-700 focus:border-violet' : 'bg-gray-50 border-gray-50 focus:border-violet'}`}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-2">Rôle du Directeur Général</label>
                  <input 
                    name="dirRole" 
                    value={formData.dirRole} 
                    onChange={handleChange}
                    className={`w-full p-4 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-gray-900 border-gray-700 focus:border-violet' : 'bg-gray-50 border-gray-50 focus:border-violet'}`}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-2">Biographie / Message du Directeur Général</label>
                <textarea 
                  name="dirBio" 
                  value={formData.dirBio} 
                  onChange={handleChange}
                  rows={4}
                  className={`w-full p-6 bg-gray-50 border-2 border-transparent focus:border-violet outline-none rounded-[2rem] transition-all resize-none ${darkMode ? 'bg-gray-900 text-white' : ''}`}
                />
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-2">Photo de profil du Directeur Général</p>
                <div 
                  onClick={() => dirPhotoInputRef.current?.click()}
                  className={`p-6 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center space-y-4 cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                    darkMode 
                      ? 'border-gray-700 hover:border-violet bg-gray-900/40 hover:bg-gray-900/60' 
                      : 'border-gray-250 hover:border-violet bg-gray-50/50 hover:bg-gray-50'
                  }`}
                >
                  <input 
                    type="file"
                    ref={dirPhotoInputRef}
                    onChange={(e) => { if (e.target.files?.[0]) processImageFile(e.target.files[0], 'dirPhoto', setIsUploadingDirPhoto); }}
                    accept="image/*"
                    className="hidden"
                  />

                  {isUploadingDirPhoto ? (
                    <div className="flex flex-col items-center justify-center space-y-2 py-4">
                      <Loader2 className="w-10 h-10 text-orange' animate-spin" />
                      <p className="text-xs font-bold text-gray-400">Traitement de l'image...</p>
                    </div>
                  ) : formData.dirPhoto ? (
                    <div className="relative flex flex-col items-center space-y-4">
                      <div className="relative group w-28 h-28 bg-white rounded-2xl shadow-md border overflow-hidden p-1 flex items-center justify-center border-gray-150">
                        <img 
                          src={formData.dirPhoto} 
                          alt="Directeur Général" 
                          className="w-full h-full object-cover rounded-xl"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white py-1 text-[9px] text-center rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity">
                          Remplacer
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-xs text-gray-500">Photo du Directeur Général configurée</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 py-2 text-center">
                      <div className="w-10 h-10 bg-violet/10 text-violet rounded-xl flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-xs">Ajouter la photo du Directeur Général (Depuis votre galerie)</p>
                        <p className="text-[10px] text-gray-400 mt-1">Format PNG, JPG ou WEBP. Max 5 Mo.</p>
                      </div>
                    </div>
                  )}
                </div>
                {formData.dirPhoto && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Voulez-vous supprimer la photo de profil du Directeur Général ?")) {
                          setFormData(prev => ({ ...prev, dirPhoto: "" }));
                          onNotify?.("Aperçu de la photo supprimée. Enregistrez pour valider.", "success");
                        }
                      }}
                      className="flex items-center gap-2 text-red-500 hover:text-red-600 text-[10px] font-black uppercase tracking-wider transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer la photo
                    </button>
                  </div>
                )}
              </div>

              {/* Marketing Director Configuration Section */}
              <div className="pt-8 border-t border-gray-200 dark:border-gray-700/50 space-y-8">
                <div>
                  <h3 className="text-lg font-black text-violet">Direction Marketing</h3>
                  <p className="text-xs text-gray-500">Configurez les informations liées à l'engagement marketing de votre équipe.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-2">Nom du Responsable Marketing</label>
                    <input 
                      name="mktName" 
                      value={formData.mktName || ""} 
                      onChange={handleChange}
                      placeholder="Ex: M. Marc Koffi"
                      className={`w-full p-4 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-gray-900 border-gray-700 focus:border-violet' : 'bg-gray-50 border-gray-50 focus:border-violet'}`}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-2">Rôle / Titre Marketing</label>
                    <input 
                      name="mktRole" 
                      value={formData.mktRole || ""} 
                      onChange={handleChange}
                      placeholder="Ex: Directeur Marketing"
                      className={`w-full p-4 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-gray-900 border-gray-700 focus:border-violet' : 'bg-gray-50 border-gray-50 focus:border-violet'}`}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-2">Message d'Engagement Marketing</label>
                  <textarea 
                    name="mktBio" 
                    value={formData.mktBio || ""} 
                    onChange={handleChange}
                    rows={4}
                    placeholder="Message présentant la stratégie ou l'engagement marketing d'édition..."
                    className={`w-full p-6 bg-gray-50 border-2 border-transparent focus:border-violet outline-none rounded-[2rem] transition-all resize-none ${darkMode ? 'bg-gray-900 text-white' : ''}`}
                  />
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-2">Photo de profil Marketing</p>
                  <div 
                    onClick={() => mktPhotoInputRef.current?.click()}
                    className={`p-6 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center space-y-4 cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                      darkMode 
                        ? 'border-gray-700 hover:border-violet bg-gray-900/40 hover:bg-gray-900/60' 
                        : 'border-gray-250 hover:border-violet bg-gray-50/50 hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      type="file"
                      ref={mktPhotoInputRef}
                      onChange={(e) => { if (e.target.files?.[0]) processImageFile(e.target.files[0], 'mktPhoto', setIsUploadingMktPhoto); }}
                      accept="image/*"
                      className="hidden"
                    />

                    {isUploadingMktPhoto ? (
                      <div className="flex flex-col items-center justify-center space-y-2 py-4">
                        <Loader2 className="w-10 h-10 text-orange animate-spin" />
                        <p className="text-xs font-bold text-gray-400">Traitement de l'image...</p>
                      </div>
                    ) : formData.mktPhoto ? (
                      <div className="relative flex flex-col items-center space-y-4">
                        <div className="relative group w-28 h-28 bg-white rounded-2xl shadow-md border overflow-hidden p-1 flex items-center justify-center border-gray-150">
                          <img 
                            src={formData.mktPhoto} 
                            alt="Directeur Marketing" 
                            className="w-full h-full object-cover rounded-xl"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white py-1 text-[9px] text-center rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity">
                            Remplacer
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-xs text-gray-500">Photo du Directeur Marketing configurée</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2 py-2 text-center">
                        <div className="w-10 h-10 bg-[#F28C28]/10 text-[#F28C28] rounded-xl flex items-center justify-center">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-xs">Ajouter la photo de la Direction Marketing (Depuis votre galerie)</p>
                          <p className="text-[10px] text-gray-400 mt-1">Format PNG, JPG ou WEBP. Max 5 Mo.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {formData.mktPhoto && (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("Voulez-vous supprimer la photo de la Direction Marketing ?")) {
                            setFormData(prev => ({ ...prev, mktPhoto: "" }));
                            onNotify?.("Aperçu de la photo marketing supprimée. Enregistrez pour valider.", "success");
                          }
                        }}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600 text-[10px] font-black uppercase tracking-wider transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Supprimer la photo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activePanel === 'seo' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-300">
               <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-2">Titre SEO (Meta Title)</label>
                <input 
                  name="seoTitle" 
                  placeholder="Ex: Saint Graal Ivoirien - L’idéal de l’édition"
                  value={formData.seoTitle || ""} 
                  onChange={handleChange}
                  className={`w-full p-4 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-gray-900 border-gray-700 focus:border-violet' : 'bg-gray-50 border-gray-50 focus:border-violet'}`}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-2">Description SEO (Meta Keywords & Description)</label>
                <textarea 
                  name="seoDescription" 
                  value={formData.seoDescription || ""} 
                  onChange={handleChange}
                  rows={6}
                  placeholder="Décrivez votre maison d'édition pour les moteurs de recherche..."
                  className={`w-full p-6 bg-gray-50 border-2 border-transparent focus:border-violet outline-none rounded-[2rem] transition-all resize-none ${darkMode ? 'bg-gray-900 text-white' : ''}`}
                />
              </div>

              <div className="p-6 rounded-2xl bg-violet/5 border-2 border-violet/10 flex items-start gap-4">
                <Globe className="w-8 h-8 text-violet mt-1" />
                <div>
                  <h4 className="font-black text-sm">Référencement Automatisé</h4>
                  <p className="text-xs text-gray-500 mt-1">Ces paramètres influencent la façon dont votre site apparaît sur Google et les réseaux sociaux.</p>
                </div>
              </div>
            </div>
          )}

          {activePanel === 'contact' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-2">Email de Contact</label>
                  <input 
                    name="email" 
                    type="email"
                    value={formData.email} 
                    onChange={handleChange}
                    className={`w-full p-4 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-gray-900 border-gray-700 focus:border-violet' : 'bg-gray-50 border-gray-50 focus:border-violet'}`}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-2">Numéro WhatsApp</label>
                  <div className="relative">
                    <WhatsAppIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-vert" />
                    <input 
                      name="whatsapp" 
                      value={formData.whatsapp} 
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-4 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-gray-900 border-gray-700 focus:border-violet' : 'bg-gray-50 border-gray-50 focus:border-violet'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-2">ID Formspree (Manuscrits)</label>
                <div className="relative">
                   <Code className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet" />
                    <input 
                      name="formspreeId" 
                      placeholder="Ex: mqkvnqlj (ou votre email)"
                      value={formData.formspreeId || ""} 
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-4 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-gray-900 border-gray-700 focus:border-violet' : 'bg-gray-50 border-gray-50 focus:border-violet'}`}
                    />
                </div>
                <p className="text-[10px] text-gray-400 italic">Laissez votre e-mail si vous n'avez pas d'ID Formspree spécifique. Cela servira pour la réception des manuscrits.</p>
              </div>

               <div className="space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-2">Logo de l'Entreprise</p>
                 <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-8 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center space-y-4 cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                      dragActive 
                        ? 'border-orange bg-orange/5 scale-[1.01]' 
                        : darkMode 
                          ? 'border-gray-700 hover:border-violet bg-gray-900/40 hover:bg-gray-900/60' 
                          : 'border-gray-250 hover:border-violet bg-gray-50/50 hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => { if (e.target.files?.[0]) handleLogoFile(e.target.files[0]); }}
                      accept="image/*"
                      className="hidden"
                    />

                    {isUploadingLogo ? (
                      <div className="flex flex-col items-center justify-center space-y-2 py-4">
                        <Loader2 className="w-10 h-10 text-orange animate-spin" />
                        <p className="text-xs font-bold text-gray-400">Traitement de l'image...</p>
                      </div>
                    ) : formData.logo ? (
                      <div className="relative flex flex-col items-center space-y-4">
                        <div className="relative group w-32 h-32 md:w-36 md:h-36 bg-white rounded-2xl shadow-md border border-gray-100 p-2 flex items-center justify-center transition-transform hover:scale-105 duration-300">
                          <img 
                            src={formData.logo} 
                            alt="Logo Preview" 
                            className="max-w-full max-h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white py-1 text-[10px] text-center rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                            Remplacer
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-sm">Logo sélectionné</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Glissez-déposez ou cliquez pour remplacer</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-3 py-2 text-center">
                        <div className="w-14 h-14 bg-orange/10 text-orange rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-sm">Télécharger un logo depuis votre galerie</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Glissez-déposez l'image ici ou cliquez pour parcourir</p>
                          <p className="text-[10px] text-gray-400 mt-2">Format PNG (transparent), JPG ou WEBP. Max 5 Mo.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {formData.logo && (
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                      >
                        <Upload className="w-4 h-4 text-orange" />
                        Parcourir la galerie
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("Voulez-vous supprimer le logo du site ?")) {
                            setFormData(prev => ({ ...prev, logo: "" }));
                            onNotify?.("Aperçu du logo supprimé. N'oubliez pas d'enregistrer !", "success");
                          }
                        }}
                        className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100/50 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer le logo
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-2">Ou modifier le lien du logo manuellement</label>
                    <input 
                       name="logo" 
                       value={formData.logo} 
                       onChange={handleChange}
                       placeholder="Lien HTTP ou chaîne Base64 du logo"
                       className={`w-full p-4 rounded-xl border-2 outline-none text-xs ${darkMode ? 'bg-gray-900 border-gray-700 focus:border-violet text-gray-300' : 'bg-white border-gray-200 focus:border-violet text-gray-700'}`}
                    />
                  </div>
              </div>

              {/* Unique Logo Exporter & Customizer Widget */}
              <div className="col-span-1 md:col-span-2 pt-6">
                <LogoDownloader 
                  darkMode={darkMode}
                  onNotify={onNotify}
                  onSetSiteLogo={(logoUrl) => {
                    setFormData(prev => ({ ...prev, logo: logoUrl }));
                  }}
                />
              </div>
            </div>
          )}

          {activePanel === 'notifications' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className={`p-3 rounded-2xl ${emailConfig.isConfigured ? 'bg-vert/10 text-vert' : 'bg-red-50 text-red-500'}`}>
                    {emailConfig.isConfigured ? <BadgeCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-black text-lg">Configuration E-mail (EmailJS)</h3>
                    <p className="text-sm text-gray-500">
                      Statut: {emailConfig.isConfigured ? 'Prêt à l\'envoi' : 'Non configuré'}
                    </p>
                  </div>
                </div>

                {!emailConfig.isConfigured && (
                  <div className="p-6 rounded-2xl bg-red-50 border-2 border-red-100 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                    <div className="text-sm text-red-800">
                      <p className="font-bold mb-1">Attention : Automatisations désactivées</p>
                      <p>Les e-mails de bienvenue et les notifications aux abonnés ne fonctionneront pas tant que vous n'aurez pas ajouté vos clés EmailJS dans les <strong>Secrets AI Studio</strong>.</p>
                      <ul className="list-disc ml-4 mt-2 space-y-1">
                        <li>VITE_EMAILJS_SERVICE_ID</li>
                        <li>VITE_EMAILJS_TEMPLATE_ID</li>
                        <li>VITE_EMAILJS_PUBLIC_KEY</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className={`p-8 rounded-[2rem] border-2 ${darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                  <h4 className="font-black mb-4 flex items-center gap-2">
                    <Send className="w-4 h-4 text-violet" />
                    Tester la configuration
                  </h4>
                  <p className="text-sm text-gray-500 mb-6">
                    Envoyer un e-mail de test à l'adresse de contact principale (<strong>{config.email}</strong>).
                  </p>
                  <button 
                    onClick={handleSendTestEmail}
                    disabled={isTestingEmail || !emailConfig.isConfigured}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                      emailConfig.isConfigured 
                        ? 'bg-violet text-white hover:scale-105 shadow-lg shadow-violet/20' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isTestingEmail ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Code className="w-4 h-4" />
                      </motion.div>
                    ) : <Send className="w-4 h-4" />}
                    {isTestingEmail ? "Envoi du test..." : "Envoyer un e-mail de test"}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-black flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet" />
                  Règles d'Automatisation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Bienvenue Newsletter", desc: "Envoyé lors d'une nouvelle inscription" },
                    { label: "Nouveau Livre", desc: "Annonce aux abonnés lors d'un ajout" },
                    { label: "Nouvel Auteur", desc: "Annonce de l'arrivée d'un talent" },
                    { label: "Confirm. Inscription", desc: "Bienvenue sur l'espace auteur" }
                  ].map((rule, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex items-start gap-3`}>
                      <div className="p-2 bg-violet/10 text-violet rounded-lg">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-bold text-xs">{rule.label}</p>
                        <p className="text-[10px] text-gray-500">{rule.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
