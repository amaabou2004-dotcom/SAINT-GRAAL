import React, { useState } from 'react';
import { Author } from '../../types';
import { Save, User, X, Loader2, EyeOff, Star } from 'lucide-react';
import { compressImage } from '../../lib/utils';

interface AuthorFormProps {
  initialData?: Partial<Author> | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const AuthorForm: React.FC<AuthorFormProps> = ({
  initialData, onSubmit, onCancel
}) => {
  const [preview, setPreview] = useState<string | null>(initialData?.photo || null);
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
          // Profiles can be even smaller (400px width)
          const compressed = await compressImage(base64, 400, 0.6);
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
          name: formData.get('name') as string,
          bio: formData.get('bio') as string,
          photo: preview || (initialData?.photo as string) || '',
          isMonthAuthor: formData.get('isMonthAuthor') === 'on',
          isHidden: formData.get('isHidden') === 'on'
        };
        onSubmit(data);
      }}
      className="space-y-8 pb-4"
    >
      <div className="flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-64 space-y-4">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest text-center block">Photo de Profil</label>
          <div className="relative group aspect-square bg-gray-50 dark:bg-gray-900 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center transition-all hover:border-violet/40 mx-auto max-w-[240px]">
            {isCompressing ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 text-violet animate-spin" />
                <p className="text-[10px] font-bold text-violet text-center px-4">Optimisation...</p>
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
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <div className="text-center p-4">
                <User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-gray-400">Cliquez pour téléverser</p>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-vert/5 dark:bg-vert/10 rounded-2xl border-2 border-vert/10 transition-all hover:bg-vert/10">
            <input 
              type="checkbox"
              name="isMonthAuthor" 
              defaultChecked={initialData?.isMonthAuthor} 
              className="w-5 h-5 accent-vert cursor-pointer"
            />
            <div>
              <p className="text-sm font-black text-vert flex items-center gap-2">
                <Star className="w-3 h-3" /> Auteur du mois
              </p>
              <p className="text-[10px] font-bold text-gray-500">Mettre en avant sur l'accueil (remplace l'actuel)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-red-500/5 dark:bg-red-500/10 rounded-2xl border-2 border-red-500/10 transition-all hover:bg-red-500/10">
            <input 
              type="checkbox"
              name="isHidden" 
              defaultChecked={initialData?.isHidden} 
              className="w-5 h-5 accent-red-500 cursor-pointer"
            />
            <div>
              <p className="text-sm font-black text-red-500 flex items-center gap-2">
                <EyeOff className="w-3 h-3" /> Masquer l'auteur
              </p>
              <p className="text-[10px] font-bold text-gray-500 leading-tight">Cacher du site public (inclut ses livres)</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nom de l'Auteur</label>
            <input 
              name="name" 
              defaultValue={initialData?.name} 
              placeholder="Nom complet"
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-violet outline-none transition-all font-bold dark:text-white" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Biographie</label>
            <textarea 
              name="bio" 
              defaultValue={initialData?.bio} 
              rows={8} 
              placeholder="Parlez-nous de l'auteur..."
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
          {initialData?.id ? "Enregistrer les modifications" : "Créer le Profil Auteur"}
        </button>
      </div>
    </form>
  );
};
