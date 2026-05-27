import React, { useState } from 'react';
import { 
  Plus, Search, Edit2, Trash2, GripVertical, 
  ExternalLink, Eye, MoreHorizontal, Filter, Download, Book
} from 'lucide-react';
import { motion, Reorder } from 'motion/react';
import { BookItem, Author } from '../../types';

import { Modal } from '../ui/Modal';
import { BookForm } from './BookForm';

interface BookManagerProps {
  books: BookItem[];
  authors: Author[];
  onAdd: (data: any) => Promise<void>;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (newBooks: BookItem[]) => void;
  darkMode: boolean;
  autoOpenAdd?: boolean;
  onModalClose?: () => void;
}

export const BookManager: React.FC<BookManagerProps> = ({
  books, authors, onAdd, onUpdate, onDelete, onReorder, darkMode,
  autoOpenAdd, onModalClose
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isModalOpen, setIsModalOpen] = useState(autoOpenAdd || false);
  const [editingBook, setEditingBook] = useState<BookItem | null>(null);

  React.useEffect(() => {
    if (autoOpenAdd) {
      setEditingBook(null);
      setIsModalOpen(true);
    }
  }, [autoOpenAdd]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onModalClose) onModalClose();
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    authors.find(a => a.id === b.authorId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (book: BookItem) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingBook(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black">Catalogue des Livres</h2>
          <p className="text-sm text-gray-500">Gérez vos publications et l'ordre d'affichage.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleAdd} 
            className="flex items-center gap-2 bg-vert text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-vert/20 hover:scale-105 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" /> Ajouter un Livre
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className={`p-4 rounded-[2rem] border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} flex flex-col md:flex-row gap-4 items-center`}>
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher par titre, auteur, ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-2xl border-2 outline-none transition-all ${
              darkMode ? 'bg-gray-900 border-gray-700 focus:border-violet' : 'bg-gray-50 border-gray-50 focus:border-violet'
            }`}
          />
        </div>
        <div className="flex items-center gap-2">
          <button className={`p-3 rounded-xl border-2 ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-50 bg-gray-50'}`}>
            <Filter className="w-5 h-5 text-gray-500" />
          </button>
          <div className={`flex p-1 rounded-xl border-2 ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-50 bg-gray-50'}`}>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-400'}`}
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-400'}`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Book List / Table */}
      <div className={`rounded-[2.5rem] border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm`}>
        {/* Table View (Desktop) */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-50'}`}>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 w-16">Ordre</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Livre</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Auteur</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 hidden lg:table-cell">Catégorie</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Prix</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <Reorder.Group axis="y" values={filteredBooks} onReorder={onReorder} as="tbody">
              {filteredBooks.map((book) => (
                <Reorder.Item 
                  key={book.id} 
                  value={book} 
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
                      {book.cover ? (
                        <img 
                          src={book.cover} 
                          alt="" 
                          className="w-12 h-16 object-cover rounded-lg shadow-sm group-hover:scale-110 transition-transform" 
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Book className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                      <div>
                        <p className="font-black text-sm">{book.title}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">ISBN: {book.isbn}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                      {authors.find(a => a.id === book.authorId)?.name || 'Inconnu'}
                    </span>
                  </td>
                  <td className="p-6 hidden lg:table-cell">
                    <span className="px-3 py-1 bg-violet/10 text-violet text-[10px] font-black uppercase tracking-widest rounded-full">
                      {book.genre}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="font-mono text-sm whitespace-nowrap">{book.price} CFA</span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        type="button"
                        onClick={() => handleEdit(book)}
                        className="p-2 rounded-xl bg-violet/5 text-violet hover:bg-violet hover:text-white transition-all shadow-sm active:scale-90 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => onDelete(book.id)}
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

        {/* Card View (Mobile) */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
          {filteredBooks.map((book) => (
            <div key={book.id} className="p-4 flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              {book.cover ? (
                <img 
                  src={book.cover} 
                  alt="" 
                  className="w-16 h-24 object-cover rounded-xl shadow-md flex-shrink-0"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-16 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Book className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-black text-sm truncate">{book.title}</h3>
                  <div className="flex gap-1 flex-shrink-0">
                    <button type="button" onClick={() => handleEdit(book)} className="p-2 bg-violet/5 text-violet rounded-lg"><Edit2 className="w-3 h-3" /></button>
                    <button type="button" onClick={() => onDelete(book.id)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
                <p className="text-xs font-bold text-gray-500 mb-2">
                  {authors.find(a => a.id === book.authorId)?.name || 'Inconnu'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase bg-violet/10 text-violet px-2 py-0.5 rounded-full">{book.genre}</span>
                  <span className="font-mono text-sm font-bold text-vert">{book.price} CFA</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredBooks.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200 dark:border-gray-700">
              <Book className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-bold">Aucun livre trouvé</p>
            <button onClick={() => setSearchTerm("")} className="mt-2 text-violet font-bold text-sm hover:underline">Effacer la recherche</button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBook ? "Modifier le Livre" : "Nouvelle Publication"}
        subtitle={editingBook ? "Mettez à jour les informations du catalogue" : "Remplissez les détails pour ajouter un nouveau livre au catalogue"}
        icon={<Book className="w-6 h-6 text-violet" />}
      >
        <BookForm 
          initialData={editingBook}
          authors={authors}
          onCancel={handleCloseModal}
          onSubmit={async (data) => {
            try {
              if (editingBook) {
                await onUpdate(editingBook.id, data);
              } else {
                await onAdd(data);
              }
              handleCloseModal();
            } catch (error) {
              console.error("Operation failed:", error);
            }
          }}
        />
      </Modal>
    </div>
  );
};
