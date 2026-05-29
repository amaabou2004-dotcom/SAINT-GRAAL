import React, { useState, useEffect } from 'react';
import { BookItem, Author } from '../../types';
import { Save, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { compressImage } from '../../lib/utils';

interface BookFormProps {
  initialData?: Partial<BookItem> | null;
  authors: Author[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const GENRES = ["SAINT GRAAL IVOIRIEN", "IVOIRE STORY"];
const LITERARY_GENRES = ["Essai", "Roman", "Poésie", "Théâtre", "Littérature enfantine", "Nouvelles", "Récits"];

export const BookForm: React.FC<BookFormProps> = ({
  initialData, authors, onSubmit, onCancel
}) => {
  const [preview, setPreview] = useState<string | null>(initialData?.cover || null);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit for raw file
        alert("L'image est trop volumineuse (max 5MB).");
        return;
      }

      setIsCompressing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          // Target a smaller size for covers to be safe (max 800px width)
          const compressed = await compressImage(base64, 800, 0.6);
          
          if (compressed.length > 800000) { // Still too big? (800KB)
             const moreCompressed = await compressImage(compressed, 600, 0.4);
             setPreview(moreCompressed);
          } else {
             setPreview(compressed);
          }
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
          title: (formData.get('title') as string).trim() || 'Sans titre',
          authorId: (formData.get('authorId') as string) || '',
          genre: (formData.get('genre') as string) || GENRES[0],
          literaryGenre: (formData.get('literaryGenre') as string) || '',
          price: (formData.get('price') as string).trim() || '0',
          isbn: (formData.get('isbn') as string).trim() || 'N/A',
          publicationDate: (formData.get('publicationDate') as string) || new Date().toISOString().split('T')[0],
          summary: (formData.get('summary') as string).trim() || '',
          cover: preview || (initialData?.cover as string) || ''
        };
        onSubmit(data);
      }}
      className="space-y-8 pb-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Titre du Livre</label>
            <input 
              name="title" 
              defaultValue={initialData?.title} 
              placeholder="Ex: Le Crépuscule du Matin"
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-violet outline-none transition-all font-bold dark:text-white" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Auteur</label>
            <select 
              name="authorId" 
              defaultValue={initialData?.authorId} 
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-violet outline-none transition-all font-bold dark:text-white appearance-none"
            >
              <option value="">Sélectionner un auteur</option>
              {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Catégorie *</label>
              <select 
                name="genre" 
                defaultValue={initialData?.genre || GENRES[0]} 
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-violet outline-none transition-all font-bold dark:text-white appearance-none"
              >
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Prix (CFA)</label>
              <input 
                name="price" 
                defaultValue={initialData?.price} 
                placeholder="Ex: 5000"
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-violet outline-none transition-all font-bold dark:text-white" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Genre Littéraire</label>
            <select 
              name="literaryGenre" 
              defaultValue={initialData?.literaryGenre || ""} 
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-violet outline-none transition-all font-bold dark:text-white appearance-none"
            >
              <option value="">Sélectionner un genre littéraire (Optionnel)</option>
              {LITERARY_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">ISBN</label>
              <input 
                name="isbn" 
                defaultValue={initialData?.isbn} 
                placeholder="XXX-X-XXXX-XXXX-X"
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-violet outline-none transition-all font-bold dark:text-white" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Date de Publication</label>
              <input 
                type="date" 
                name="publicationDate" 
                defaultValue={initialData?.publicationDate} 
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-violet outline-none transition-all font-bold dark:text-white" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Couverture</label>
            <div className="relative group aspect-[3/4] bg-gray-50 dark:bg-gray-900 rounded-[2rem] overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center transition-all hover:border-violet/40">
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
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-400">Cliquez pour téléverser la couverture</p>
                  <p className="text-[10px] text-gray-400 uppercase mt-1">PNG, JPG ou WEBP (Max 5MB)</p>
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
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Résumé / Description</label>
            <textarea 
              name="summary" 
              defaultValue={initialData?.summary} 
              rows={6} 
              placeholder="Une courte description du livre..."
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-violet outline-none transition-all font-medium leading-relaxed dark:text-white" 
            />
          </div>
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
          {initialData?.id ? "Enregistrer les modifications" : "Publier le Livre"}
        </button>
      </div>
    </form>
  );
};
