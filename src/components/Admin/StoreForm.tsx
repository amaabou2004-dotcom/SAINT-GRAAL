import React, { useState } from 'react';
import { Store } from '../../types';

interface StoreFormProps {
  initialData?: Store | null;
  onSubmit: (data: Partial<Store>) => void;
  onCancel: () => void;
}

export const StoreForm: React.FC<StoreFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Store>>(initialData || {
    name: '',
    address: '',
    hours: '',
    phone: '',
    order: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Nom de la Librairie</label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            placeholder="Ex: Librairie de France"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Adresse Complète</label>
          <input
            type="text"
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            placeholder="Ex: Plateau, Abidjan"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Horaires</label>
            <input
              type="text"
              name="hours"
              value={formData.hours || ''}
              onChange={handleChange}
              placeholder="Ex: Lun - Sam : 08h30 - 18h30"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Téléphone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="Ex: +225 27 ..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-4 rounded-xl font-bold border-2 border-gray-100 hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-4 rounded-xl font-bold bg-violet text-white shadow-lg shadow-violet/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {initialData ? 'Enregistrer les modifications' : 'Ajouter la librairie'}
        </button>
      </div>
    </form>
  );
};
