import React, { useState } from 'react';
import { 
  Plus, Search, Edit2, Trash2, GripVertical, 
  MapPin, Store as StoreIcon, Clock, Phone
} from 'lucide-react';
import { motion, Reorder } from 'motion/react';
import { Store } from '../../types';

import { Modal } from '../ui/Modal';
import { StoreForm } from './StoreForm';

interface StoreManagerProps {
  stores: Store[];
  onAdd: (data: any) => Promise<void>;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (newStores: Store[]) => void;
  darkMode: boolean;
}

export const StoreManager: React.FC<StoreManagerProps> = ({
  stores, onAdd, onUpdate, onDelete, onReorder, darkMode
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  const filteredStores = stores.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingStore(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black">Gestion des Librairies</h2>
          <p className="text-sm text-gray-500">Gérez vos points de vente physiques et partenaires.</p>
        </div>
        <button 
          type="button"
          onClick={handleAdd} 
          className="flex items-center gap-2 bg-vert text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-vert/20 hover:scale-105 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" /> Ajouter une Librairie
        </button>
      </div>

      {/* Search */}
      <div className={`p-4 rounded-[2rem] border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} flex flex-col md:flex-row gap-4 items-center`}>
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher une librairie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-2xl border-2 outline-none transition-all ${
              darkMode ? 'bg-gray-900 border-gray-700 focus:border-violet' : 'bg-gray-50 border-gray-50 focus:border-violet'
            }`}
          />
        </div>
      </div>

      {/* Stores List */}
      <div className={`rounded-[2.5rem] border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm`}>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-50'}`}>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 w-16">Ordre</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Librairie</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Détails</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <Reorder.Group axis="y" values={filteredStores} onReorder={onReorder} as="tbody">
              {filteredStores.map((store) => (
                <Reorder.Item 
                  key={store.id} 
                  value={store} 
                  as="tr"
                  className={`group border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${darkMode ? 'border-gray-700' : 'border-gray-50'} cursor-pointer`}
                >
                  <td className="p-6">
                    <div className="p-2 border-2 border-transparent group-hover:border-violet/20 rounded-lg inline-flex text-gray-300">
                      <GripVertical className="w-4 h-4" />
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-violet/10 text-violet rounded-xl flex items-center justify-center shrink-0">
                        <StoreIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-sm">{store.name}</p>
                        <div className="flex items-center gap-1 text-gray-400">
                          <MapPin className="w-3 h-3" />
                          <p className="text-[10px] uppercase tracking-tighter truncate max-w-[200px]">{store.address}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{store.hours}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        <span>{store.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        type="button"
                        onClick={() => handleEdit(store)}
                        className="p-2 rounded-xl bg-violet/5 text-violet hover:bg-violet hover:text-white transition-all shadow-sm active:scale-90 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => onDelete(store.id)}
                        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </table>
        </div>
        
        {filteredStores.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200 dark:border-gray-700">
              <StoreIcon className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-bold">Aucune librairie enregistrée</p>
            <button onClick={() => setSearchTerm("")} className="mt-2 text-violet font-bold text-sm hover:underline">Effacer la recherche</button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStore ? "Modifier la Librairie" : "Nouvelle Librairie"}
        subtitle={editingStore ? "Mettez à jour les coordonnées du point de vente" : "Remplissez les détails pour ajouter un nouveau partenaire"}
        icon={<StoreIcon className="w-6 h-6 text-violet" />}
      >
        <StoreForm 
          initialData={editingStore}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={async (data) => {
            try {
              if (editingStore) {
                await onUpdate(editingStore.id, data);
              } else {
                await onAdd(data);
              }
              setIsModalOpen(false);
            } catch (error) {
              console.error("Operation failed:", error);
            }
          }}
        />
      </Modal>
    </div>
  );
};
