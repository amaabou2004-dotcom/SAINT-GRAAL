import React, { useState } from 'react';
import { 
  Calendar, Plus, Trash2, Edit3, MapPin, Clock, 
  FileText, Activity, Users, AlertCircle, ChevronLeft, 
  ChevronRight, Sparkles, Filter, X, Image as ImageIcon, Loader2
} from 'lucide-react';
import { AgendaEvent, EventType, Author } from '../../types';
import { compressImage } from '../../lib/utils';

interface AgendaManagerProps {
  events: AgendaEvent[];
  authors: Author[];
  onAdd: (data: Omit<AgendaEvent, 'id' | 'createdAt'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<AgendaEvent>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  darkMode: boolean;
}

export const AgendaManager: React.FC<AgendaManagerProps> = ({
  events, authors, onAdd, onUpdate, onDelete, darkMode
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '14:00',
    location: '',
    description: '',
    type: 'signing' as EventType,
    authorId: ''
  });

  const [typeFilter, setTypeFilter] = useState<string>('all');

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleOpenAddModal = (dayString?: string) => {
    setEditingEvent(null);
    setPreview(null);
    setFormData({
      title: '',
      date: dayString || new Date().toISOString().split('T')[0],
      time: '14:00',
      location: '',
      description: '',
      type: 'signing',
      authorId: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: AgendaEvent) => {
    setEditingEvent(event);
    setPreview(event.image || null);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time || '14:00',
      location: event.location,
      description: event.description,
      type: event.type,
      authorId: event.authorId || ''
    });
    setIsModalOpen(true);
  };

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
          const compressed = await compressImage(base64, 800, 0.6);
          setPreview(compressed);
        } catch (err) {
          console.error("Image compression error:", err);
          setPreview(reader.result as string);
        } finally {
          setIsCompressing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        title: formData.title.trim() || "Événement sans titre",
        date: formData.date || new Date().toISOString().split('T')[0],
        location: formData.location.trim() || "Lieu non spécifié",
        image: preview || ''
      };
      if (editingEvent) {
        await onUpdate(editingEvent.id, payload);
      } else {
        await onAdd(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm("Voulez-vous supprimer définitivement cet événement de l'agenda ?")) {
      await onDelete(id);
      if (selectedEventId === id) setSelectedEventId(null);
    }
  };

  const typeLabels: Record<EventType, string> = {
    signing: "Dédicace",
    meeting: "Rencontre d'auteur",
    convention: "Salon littéraire",
    workshop: "Atelier d'écriture",
    other: "Événement"
  };

  const typeColors: Record<EventType, { bg: string, text: string, border: string }> = {
    signing: { bg: 'bg-violet/10', text: 'text-violet', border: 'border-violet/20' },
    meeting: { bg: 'bg-[#F28C28]/10', text: 'text-[#F28C28]', border: 'border-[#F28C28]/20' },
    convention: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
    workshop: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
    other: { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' }
  };

  // Filter events
  const filteredEvents = events.filter(e => {
    const matchesFilter = typeFilter === 'all' || e.type === typeFilter;
    return matchesFilter;
  });

  const getDayEvents = (day: number) => {
    const formattedMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const compDate = `${currentDate.getFullYear()}-${formattedMonth}-${formattedDay}`;
    return filteredEvents.filter(e => e.date === compDate);
  };

  const renderCalendarDays = () => {
    const totalDays = daysInMonth(currentDate);
    const startDay = firstDayOfMonth(currentDate);
    const calendarDays = [];

    // Push empty placeholder boxes for previous month's wrapping days
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1; // Align to Monday
    for (let i = 0; i < adjustedStartDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="bg-gray-100/30 dark:bg-gray-900/10 h-32 border-b border-r border-gray-150 dark:border-gray-800" />);
    }

    // Push actual days des months
    for (let day = 1; day <= totalDays; day++) {
      const dayEvents = getDayEvents(day);
      const isToday = 
        day === new Date().getDate() && 
        currentDate.getMonth() === new Date().getMonth() && 
        currentDate.getFullYear() === new Date().getFullYear();

      const formatDayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      calendarDays.push(
        <div 
          key={`day-${day}`}
          onClick={() => handleOpenAddModal(formatDayStr)}
          className={`h-32 p-3 border-b border-r border-gray-150 dark:border-gray-800 transition-all hover:bg-violet/[0.02] cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            isToday ? (darkMode ? 'bg-violet/5' : 'bg-violet/5') : ''
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className={`w-7 h-7 flex items-center justify-center text-xs font-black rounded-lg ${
              isToday 
                ? 'bg-violet text-white shadow-lg shadow-violet/20' 
                : 'text-gray-900 dark:text-gray-300'
            }`}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-violet" />
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-0.5 mt-1">
            {dayEvents.map(evt => (
              <div
                key={evt.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEventId(evt.id);
                }}
                className={`py-1 px-2 rounded-lg text-[9px] font-black truncate border cursor-pointer hover:scale-102 hover:shadow-sm transition-all text-left ${
                  typeColors[evt.type]?.bg || 'bg-gray-100'
                } ${typeColors[evt.type]?.text || 'text-gray-700'} ${typeColors[evt.type]?.border || 'border-transparent'}`}
                title={evt.title}
              >
                {evt.time && <span className="mr-1">{evt.time}</span>}
                {evt.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return calendarDays;
  };

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const selectedEventDetails = events.find(e => e.id === selectedEventId);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase flex items-center gap-3">
            <Calendar className="text-violet w-8 h-8" /> Agenda & Événements Littéraires
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Affichez, planifiez et organisez les séances de dédicaces, salons, ateliers et rencontres d'auteurs.
          </p>
        </div>
        <div>
          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-2 px-5 py-3 bg-violet text-white rounded-xl font-black uppercase text-xs tracking-wider shadow-lg shadow-violet/20 hover:scale-105 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Programmer un Événement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left 3 Cols: The Monthly Calendar Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Year / Month navigation controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevMonth}
                className="p-2.5 rounded-xl bg-gray-150 dark:bg-gray-800 hover:bg-gray-200 cursor-pointer text-gray-600 dark:text-gray-300 transition-colors"
                title="Mois précédent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-black uppercase tracking-wide min-w-[170px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-2.5 rounded-xl bg-gray-150 dark:bg-gray-800 hover:bg-gray-200 cursor-pointer text-gray-600 dark:text-gray-300 transition-colors"
                title="Mois suivant"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Event Category Filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider outline-none border-0 ${
                  darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 shadow-sm'
                }`}
              >
                <option value="all">Tous les types</option>
                <option value="signing">Dédicaces</option>
                <option value="meeting">Rencontres d'auteurs</option>
                <option value="convention">Salons & Conventions</option>
                <option value="workshop">Ateliers</option>
                <option value="other">Autres</option>
              </select>
            </div>
          </div>

          {/* Calendar Grid Container */}
          <div className={`rounded-[2rem] border overflow-hidden ${darkMode ? 'bg-gray-950/40 border-gray-800' : 'bg-white border-gray-150 shadow-sm'}`}>
            {/* Days of week header */}
            <div className={`grid grid-cols-7 text-center py-4 border-b font-black uppercase text-[10px] tracking-widest ${
              darkMode ? 'bg-gray-900/50 border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-150 text-gray-500'
            }`}>
              <div>Lun</div>
              <div>Mar</div>
              <div>Mer</div>
              <div>Jeu</div>
              <div>Ven</div>
              <div>Sam</div>
              <div>Dim</div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7">
              {renderCalendarDays()}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-start p-1.5">
            {Object.entries(typeLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
                <span className={`w-3.5 h-3.5 rounded-md border ${typeColors[key as EventType].bg} ${typeColors[key as EventType].border}`} />
                <span className="text-gray-500 dark:text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Event Timeline/Specs Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`p-6 rounded-[2rem] border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-lg shadow-gray-200/50'}`}>
            <h3 className="text-lg font-black uppercase tracking-wide mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet" /> Événement Sélectionné
            </h3>

            {selectedEventDetails ? (
              <div className="space-y-6">
                {selectedEventDetails.image && (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-gray-150 dark:border-gray-700">
                    <img 
                      src={selectedEventDetails.image} 
                      alt={selectedEventDetails.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    typeColors[selectedEventDetails.type]?.bg
                  } ${typeColors[selectedEventDetails.type]?.text} ${typeColors[selectedEventDetails.type]?.border}`}>
                    {typeLabels[selectedEventDetails.type] || 'Événement'}
                  </span>
                  <h4 className="text-xl font-extrabold text-gray-900 dark:text-white mt-3 leading-tight">
                    {selectedEventDetails.title}
                  </h4>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-sm font-medium">
                    <Clock className="w-5 h-5 text-violet flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-900 dark:text-gray-300">
                        {new Date(selectedEventDetails.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      {selectedEventDetails.time && (
                        <p className="text-xs text-violet font-bold mt-0.5">À / de {selectedEventDetails.time}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm font-medium">
                    <MapPin className="w-5 h-5 text-violet flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-wider text-gray-400">Lieu de l'événement</p>
                      <p className="text-gray-900 dark:text-gray-300 font-bold">{selectedEventDetails.location}</p>
                    </div>
                  </div>

                  {selectedEventDetails.authorId && (
                    <div className="flex items-start gap-3 text-sm font-medium">
                      <Users className="w-5 h-5 text-violet flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-wider text-gray-400">Auteur Associé</p>
                        <p className="text-gray-900 dark:text-gray-300 font-bold">
                          {authors.find(a => a.id === selectedEventDetails.authorId)?.name || "Auteur du catalogue"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-[10px] uppercase font-black tracking-wider text-gray-400 mb-2">Description / Sommaire</p>
                  <div className={`p-4 rounded-xl text-xs font-semibold leading-relaxed leading-6 border whitespace-pre-wrap ${
                    darkMode ? 'bg-gray-900/60 border-gray-700' : 'bg-gray-50 border-gray-100'
                  }`}>
                    {selectedEventDetails.description || "Aucune description de l'événement."}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-150 dark:border-gray-700">
                  <button
                    onClick={() => handleOpenEditModal(selectedEventDetails)}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-950 rounded-xl font-bold uppercase text-[10px] tracking-wider cursor-pointer transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Modifier
                  </button>
                  <button
                    onClick={(e) => handleDelete(selectedEventDetails.id, e)}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-wider cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Supprimer
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 flex flex-col items-center justify-center space-y-2">
                <AlertCircle className="w-10 h-10 text-gray-300" />
                <p className="text-xs font-bold">Sélectionnez un événement programmé sur le calendrier pour visualiser ses détails et l'éditer.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Write / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-lg rounded-[2.5rem] overflow-hidden border shadow-2xl relative max-h-[92vh] flex flex-col ${
            darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100'
          }`}>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-gray-950 transition-colors z-[110]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 flex flex-col max-h-[92vh] overflow-hidden">
              <h3 className="text-2xl font-black mb-1 flex items-center gap-2">
                <Calendar className="text-violet" /> {editingEvent ? "Modifier l'événement" : "Planifier un événement"}
              </h3>
              <p className="text-xs text-gray-500 mb-6 font-semibold">Ajoutez les détails pratiques ci-dessous pour actualiser l'agenda.</p>

              <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Titre de l'événement</label>
                  <input
                    type="text"
                    placeholder="Ex : Séance de dédicaces"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full p-4 rounded-xl border outline-none text-sm transition-all focus:border-violet ${
                      darkMode ? 'bg-gray-900 border-gray-750' : 'bg-gray-50 border-transparent'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={`w-full p-4 rounded-xl border outline-none text-sm transition-all focus:border-violet ${
                        darkMode ? 'bg-gray-900 border-gray-750' : 'bg-gray-50 border-transparent'
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Heure (Optionnel)</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className={`w-full p-4 rounded-xl border outline-none text-sm transition-all focus:border-violet ${
                        darkMode ? 'bg-gray-900 border-gray-750' : 'bg-gray-50 border-transparent'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Type d'événement</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                      className={`w-full p-4 rounded-xl border outline-none text-sm transition-all focus:border-violet ${
                        darkMode ? 'bg-gray-900 border-gray-750' : 'bg-gray-50 border-transparent'
                      }`}
                    >
                      <option value="signing">Séance de dédicace</option>
                      <option value="meeting">Rencontre d'auteur</option>
                      <option value="convention">Salon / Convention</option>
                      <option value="workshop">Atelier d'écriture</option>
                      <option value="other">Autre manifestation</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Lier un auteur</label>
                    <select
                      value={formData.authorId}
                      onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                      className={`w-full p-4 rounded-xl border outline-none text-sm transition-all focus:border-violet ${
                        darkMode ? 'bg-gray-900 border-gray-750' : 'bg-gray-50 border-transparent'
                      }`}
                    >
                      <option value="">-- Aucun --</option>
                      {authors.map(aut => (
                        <option key={aut.id} value={aut.id}>{aut.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Lieu de l'événement</label>
                  <input
                    type="text"
                    placeholder="Ex : Librairie Carrefour, Cocody Abidjan"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`w-full p-4 rounded-xl border outline-none text-sm transition-all focus:border-violet ${
                      darkMode ? 'bg-gray-900 border-gray-750' : 'bg-gray-50 border-transparent'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Description de l'événement</label>
                  <textarea
                    rows={2}
                    placeholder="Préciser les détails indispensables aux lecteurs (Auteurs présents, offres, tombolas, etc.)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full p-4 rounded-xl border outline-none text-sm transition-all focus:border-violet h-16 resize-none ${
                      darkMode ? 'bg-gray-900 border-gray-750' : 'bg-gray-50 border-transparent'
                    }`}
                  />
                </div>

                {/* Photo de l'événement */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block font-sans">Affiche / Photo de l'événement</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col justify-center">
                      <input 
                        type="file" 
                        accept="image/*"
                        id="event-banner"
                        onChange={handleImageChange}
                        className="hidden" 
                      />
                      <label 
                        htmlFor="event-banner"
                        className={`flex flex-col items-center justify-center p-3 border-2 border-dashed hover:border-violet/40 rounded-xl cursor-pointer transition-colors hover:bg-violet/[0.01] ${
                          darkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}
                      >
                        {isCompressing ? (
                          <div className="flex flex-col items-center gap-1.5 text-violet">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-[9px] font-extrabold uppercase">Traitement...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 text-gray-400">
                            <ImageIcon className="w-5 h-5" />
                            <span className="text-[9px] font-extrabold uppercase text-center">Ajouter une affiche / photo</span>
                          </div>
                        )}
                      </label>
                    </div>

                    {preview ? (
                      <div className="relative rounded-xl overflow-hidden shadow-md h-20 border border-gray-150">
                        <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setPreview(null)}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white hover:bg-black rounded-lg transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className={`border border-dashed rounded-xl h-20 flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-wider ${
                        darkMode ? 'border-gray-800 bg-gray-900/40' : 'border-gray-150 bg-gray-50/50'
                      }`}>
                        Aucune photo
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-750">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 rounded-xl font-bold uppercase text-xs tracking-wider bg-gray-150 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-violet hover:bg-violet-dark text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-all"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
