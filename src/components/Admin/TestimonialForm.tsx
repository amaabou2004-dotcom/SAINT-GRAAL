import React, { useState } from 'react';
import { Testimonial } from '../../types';
import { Save, User, X, Loader2, Star, Quote } from 'lucide-react';
import { compressImage } from '../../lib/utils';

interface TestimonialFormProps {
  initialData?: Testimonial | null;
  onSubmit: (data: Omit<Testimonial, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function TestimonialForm({ initialData, onSubmit, onCancel }: TestimonialFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(initialData?.photo || "");
  const [rating, setRating] = useState(initialData?.rating || 5);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: (formData.get('name') as string || '').trim() || "Lecteur Anonyme",
      role: (formData.get('role') as string || '').trim() || "Lecteur",
      content: (formData.get('content') as string || '').trim() || "Excellent ouvrage.",
      photo: photoPreview,
      rating: rating,
      date: initialData?.date || new Date().toISOString()
    };

    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setPhotoPreview(compressed);
      } catch (err) {
        console.error("Compression component error:", err);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Photo Upload */}
        <div className="w-full md:w-48 flex-shrink-0 flex flex-col items-center gap-4">
          <div className="relative group w-32 h-32 md:w-40 md:h-40 rounded-[2rem] overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200">
            {photoPreview ? (
              <img 
                src={photoPreview} 
                alt="Aperçu" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <User className="w-10 h-10 mb-2" />
                <span className="text-[10px] font-bold uppercase">Portrait</span>
              </div>
            )}
            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <Star className="text-white w-6 h-6" />
            </label>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase text-center">Optimisez pour un carré</p>
        </div>

        {/* Info Fields */}
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Nom du Lecteur</label>
              <input 
                name="name" 
                defaultValue={initialData?.name}
                className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-violet outline-none transition-all"
                placeholder="Ex: Jean Dupont"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Rôle / Ville</label>
              <input 
                name="role" 
                defaultValue={initialData?.role}
                className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-violet outline-none transition-all"
                placeholder="Ex: Lecteur passionné, Abidjan"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Note</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 transition-all ${star <= rating ? 'text-yellow-400 scale-110' : 'text-gray-200'}`}
                >
                  <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Témoignage</label>
            <div className="relative">
              <Quote className="absolute top-4 left-4 w-4 h-4 text-violet/20" />
              <textarea 
                name="content" 
                defaultValue={initialData?.content}
                rows={4}
                className="w-full p-4 pl-10 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-violet outline-none transition-all resize-none"
                placeholder="Partagez l'avis de ce lecteur..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 py-4 px-6 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors uppercase tracking-widest text-xs"
        >
          Annuler
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-[2] py-4 px-6 rounded-2xl bg-violet text-white font-black shadow-lg shadow-violet/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer le témoignage
        </button>
      </div>
    </form>
  );
}
