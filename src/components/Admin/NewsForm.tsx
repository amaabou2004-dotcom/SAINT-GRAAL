import React, { useState } from 'react';
import { NewsItem } from '../../types';
import { Save, Image as ImageIcon, X, Calendar, Loader2 } from 'lucide-react';
import { compressImage } from '../../lib/utils';

interface NewsFormProps {
  initialData?: Partial<NewsItem> | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const NewsForm: React.FC<NewsFormProps> = ({
  initialData, onSubmit, onCancel
}) => {
  const [preview, setPreview] = useState<string | null>(initialData?.image || null);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image est trop volumineuse (max 5MB).");
        return;
      }

      setIsCompressing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          // News items can be around 1000px width
          const compressed = await compressImage(base64, 1000, 0.7);
          setPreview(compressed);
        } catch (err) {
          console.error("Compression error:", err);
          setPreview(reader.result as string);
        } finally {
          setIsCompressing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
          title: (formData.get('title') as string || '').trim() || "Nouvelle Actualité",
          date: (formData.get('date') as string) || new Date().toISOString().split('T')[0],
          content: (formData.get('content') as string || '').trim() || "Contenu à venir.",
          image: preview || (initialData?.image as string) || ''
        };
        onSubmit(data);
      }}
      className="space-y-8 pb-4"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Titre de l'Actualité</label>
            <input 
              name="title" 
              defaultValue={initialData?.title} 
              placeholder="Ex: Lancement de la nouvelle collection"
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-violet outline-none transition-all font-bold dark:text-white" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Date de Publication</label>
            <div className="relative">
              <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input 
                type="date" 
                name="date" 
                defaultValue={initialData?.date || new Date().toISOString().split('T')[0]} 
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-violet outline-none transition-all font-bold dark:text-white" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Image de couverture (Optionnel)</label>
          <div className="relative group h-48 bg-gray-50 dark:bg-gray-900 rounded-[2rem] overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center transition-all hover:border-violet/40">
            {isCompressing ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-violet animate-spin" />
                <p className="text-xs font-bold text-violet">Optimisation...</p>
              </div>
            ) : preview ? (
              <>
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                <button 
                  type="button" 
                  onClick={() => setPreview(null)}
                  className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="text-center p-6">
                <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-400">Ajouter une image d'illustration</p>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Contenu de l'article</label>
          <textarea 
            name="content" 
            defaultValue={initialData?.content} 
            rows={10} 
            placeholder="Rédigez votre actualité ici..."
            className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-violet outline-none transition-all font-medium leading-relaxed dark:text-white" 
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        >
          Annuler
        </button>
        <button 
          type="submit" 
          className="flex-1 bg-violet text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-violet/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {initialData?.id ? "Mettre à jour" : "Publier maintenant"}
        </button>
      </div>
    </form>
  );
};
