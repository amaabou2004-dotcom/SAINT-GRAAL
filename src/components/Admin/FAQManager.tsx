import React, { useState } from 'react';
import { 
  HelpCircle, Plus, Search, Trash2, Edit2, 
  Layers, ArrowUpDown, ChevronUp, ChevronDown, Check, Inbox, MessageSquare
} from 'lucide-react';
import { FAQItem } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '../ui/Modal';

interface FAQManagerProps {
  faqs: FAQItem[];
  onAdd: (data: Omit<FAQItem, 'id' | 'createdAt'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<FAQItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  darkMode?: boolean;
}

export function FAQManager({ faqs, onAdd, onUpdate, onDelete, darkMode }: FAQManagerProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'standard' | 'pending'>('standard');

  // Form state
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    order: 0,
    authorName: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Split FAQs
  const standardFaqs = faqs.filter(f => !f.isPending);
  const pendingFaqs = faqs.filter(f => f.isPending);

  // Filter & sort based on active tab
  const filtered = (activeSubTab === 'standard' ? standardFaqs : pendingFaqs)
    .filter(f => 
      f.question.toLowerCase().includes(search.toLowerCase()) || 
      (f.answer && f.answer.toLowerCase().includes(search.toLowerCase())) ||
      (f.authorName && f.authorName.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleEdit = (item: FAQItem) => {
    setEditingFaq(item);
    setFormData({
      question: item.question,
      answer: item.answer || "",
      order: item.order ?? 0,
      authorName: item.authorName || ""
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingFaq(null);
    setFormData({
      question: "",
      answer: "",
      order: faqs.length > 0 ? Math.max(...faqs.map(f => f.order ?? 0)) + 10 : 10,
      authorName: ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    const finalQuestion = formData.question.trim() || "Question sans titre";
    const finalAnswer = formData.answer.trim();
    const finalAuthor = formData.authorName.trim();

    try {
      if (editingFaq) {
        // If it was pending, replying to it automatically approves/publishes it
        await onUpdate(editingFaq.id, {
          question: finalQuestion,
          answer: finalAnswer || "Réponse en attente.",
          order: Number(formData.order),
          authorName: finalAuthor || undefined,
          isPending: false // Sets pending to false to publish it
        });
      } else {
        await onAdd({
          question: finalQuestion,
          answer: finalAnswer || "Réponse en attente.",
          order: Number(formData.order),
          authorName: finalAuthor || undefined,
          isPending: false
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de l'enregistrement de la FAQ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickOrder = async (id: string, newOrder: number) => {
    try {
      await onUpdate(id, { order: newOrder });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Foire Aux Questions (FAQ)
          </h2>
          <p className="text-sm text-slate-500">
            Gérez les questions fréquemment posées ou répondez aux questions soumises par vos lecteurs.
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher une question..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none transition-all ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700 text-white' 
                  : 'bg-white border border-slate-200 focus:border-violet'
              }`}
            />
          </div>
          <button 
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 bg-violet text-white px-4 py-2 rounded-xl font-bold hover:scale-[1.02] transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Ajouter FAQ
          </button>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 gap-6 pb-2">
        <button
          onClick={() => setActiveSubTab('standard')}
          className={`pb-2.5 font-black text-sm transition-all relative ${
            activeSubTab === 'standard' 
              ? 'text-violet border-b-2 border-violet' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          FAQ Publiées ({standardFaqs.length})
        </button>
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`pb-2.5 font-black text-sm transition-all relative flex items-center gap-2 ${
            activeSubTab === 'pending' 
              ? 'text-violet border-b-2 border-violet' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>Questions des lecteurs ({pendingFaqs.length})</span>
          {pendingFaqs.length > 0 && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {filtered.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`p-6 rounded-2xl border transition-all ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 items-start flex-1">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${
                    darkMode ? 'bg-slate-700 text-vert' : 'bg-vert/10 text-vert'
                  }`}>
                    {item.isPending ? <MessageSquare className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        darkMode ? 'bg-slate-700 text-violet' : 'bg-violet/15 text-violet'
                      }`}>
                        Ordre : {item.order ?? 0}
                      </span>
                      {item.authorName && (
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          darkMode ? 'bg-slate-750 text-slate-300' : 'bg-slate-100 text-slate-600'
                        }`}>
                          Par : {item.authorName}
                        </span>
                      )}
                      {item.isPending && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full animate-pulse">
                          En attente de réponse
                        </span>
                      )}
                    </div>
                    <h3 className={`font-black text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {item.question}
                    </h3>
                    <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'} ${!item.answer ? 'italic text-slate-400' : ''}`}>
                      {item.answer || "Aucune réponse saisie pour le moment."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleQuickOrder(item.id, (item.order ?? 0) - 1)}
                      title="Monter d'un cran"
                      className={`p-1.5 rounded-lg transition-colors border ${
                        darkMode ? 'hover:bg-slate-700 border-slate-700 text-slate-400' : 'hover:bg-slate-50 border-slate-100 text-slate-400'
                      }`}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleQuickOrder(item.id, (item.order ?? 0) + 1)}
                      title="Descendre d'un cran"
                      className={`p-1.5 rounded-lg transition-colors border ${
                        darkMode ? 'hover:bg-slate-700 border-slate-700 text-slate-400' : 'hover:bg-slate-50 border-slate-100 text-slate-400'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-1">
                    {item.isPending ? (
                      <button 
                        onClick={() => handleEdit(item)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          darkMode ? 'bg-vert/20 hover:bg-vert/30 text-vert' : 'bg-vert/10 hover:bg-vert/20 text-vert'
                        }`}
                        title="Répondre et valider la question"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Répondre
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleEdit(item)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode ? 'hover:bg-violet/20 text-violet' : 'hover:bg-violet/10 text-violet'
                        }`}
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        if (confirm("Voulez-vous vraiment supprimer cette question ?")) {
                          onDelete(item.id);
                        }
                      }}
                      className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-slate-400"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <Inbox className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-bold italic">Aucune question trouvée</h3>
          <p className="text-sm">
            {activeSubTab === 'standard' 
              ? "Cliquez sur « Ajouter FAQ » pour publier la première question générale."
              : "Aucune question de lecteur n'est en attente pour le moment."}
          </p>
        </div>
      )}

      {/* Write / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaq ? (editingFaq.isPending ? "Répondre et Publier la Question" : "Modifier la FAQ") : "Ajouter une FAQ"}
        subtitle={editingFaq?.isPending ? "Saisissez la réponse à la question soumise par le lecteur pour la valider et la publier publiquement." : "Renseignez une question d'actualité ou d'usage général, ainsi que sa réponse."}
        icon={<HelpCircle className="w-6 h-6 text-violet" />}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Question
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Quels sont vos délais de réponse ?"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className={`w-full p-4 rounded-xl border outline-none text-sm transition-all focus:border-violet ${
                darkMode ? 'bg-slate-900 border-slate-755 text-white' : 'bg-slate-50 border-transparent text-slate-900'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Nom / Pseudo du Lecteur
            </label>
            <input
              type="text"
              placeholder="Ex: LecteurAnonyme"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              className={`w-full p-4 rounded-xl border outline-none text-sm transition-all focus:border-violet ${
                darkMode ? 'bg-slate-900 border-slate-755 text-white' : 'bg-slate-50 border-transparent text-slate-900'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Réponse *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Saisissez la réponse explicative ici..."
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              className={`w-full p-4 rounded-xl border outline-none text-sm transition-all focus:border-violet resize-none ${
                darkMode ? 'bg-slate-900 border-slate-755 text-white' : 'bg-slate-50 border-transparent text-slate-900'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Ordre d'affichage
            </label>
            <input
              type="number"
              placeholder="0"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className={`w-full p-4 rounded-xl border outline-none text-sm transition-all focus:border-violet ${
                darkMode ? 'bg-slate-900 border-slate-755 text-white' : 'bg-slate-50 border-transparent text-slate-900'
              }`}
            />
            <p className="text-[10px] text-slate-400">
              Les éléments avec les numéros d'ordre les plus bas seront affichés en premier.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                darkMode ? 'bg-slate-800 hover:bg-slate-750 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-violet text-white font-bold text-sm hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Enregistrement..." : (editingFaq?.isPending ? "Valider & Publier" : "Enregistrer")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
