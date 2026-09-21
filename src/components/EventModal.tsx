import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, MapPin, FileText, Sparkles, Copy } from 'lucide-react';
import type { Event } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    name: string,
    description?: string,
    date?: string,
    location?: string,
    cloneFromEventId?: string
  ) => void;
  eventToEdit?: Event | null;
  currentEventId?: string;
  currentEventName?: string;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  eventToEdit,
  currentEventId,
  currentEventName,
}) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [cloneTeams, setCloneTeams] = useState(false);

  useEffect(() => {
    if (eventToEdit) {
      setName(eventToEdit.name || '');
      setDate(eventToEdit.date || '');
      setLocation(eventToEdit.location || '');
      setDescription(eventToEdit.description || '');
      setCloneTeams(false);
    } else {
      setName('');
      setDate('');
      setLocation('');
      setDescription('');
      setCloneTeams(false);
    }
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave(
      name.trim(),
      description.trim() || undefined,
      date.trim() || undefined,
      location.trim() || undefined,
      !eventToEdit && cloneTeams ? currentEventId : undefined
    );
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-[#121420] border-2 border-[#FFC700]/40 shadow-[0_0_50px_rgba(255,199,0,0.15)] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Gold Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-[#FFC700] to-yellow-300" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFC700]/10 border border-[#FFC700]/30 text-[#FFC700]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                {eventToEdit ? 'Editar Evento' : 'Criar Novo Evento'}
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                {eventToEdit
                  ? 'Atualize os dados e detalhes do evento'
                  : 'Configure um novo evento com equipes e funções próprias'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome do Evento */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Nome do Evento <span className="text-[#FFC700]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Encontro JUSC 2026 - Primavera"
                className="w-full px-3.5 py-2.5 bg-[#0a0b10] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-[#FFC700] focus:ring-1 focus:ring-[#FFC700] transition-all placeholder-gray-600"
              />
            </div>
          </div>

          {/* Data e Local em 2 colunas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FFC700]" />
                <span>Data / Período</span>
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Ex: 17 a 19 de Outubro / 2026"
                className="w-full px-3.5 py-2.5 bg-[#0a0b10] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-[#FFC700] focus:ring-1 focus:ring-[#FFC700] transition-all placeholder-gray-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FFC700]" />
                <span>Local</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Sede JUSC / Sítio"
                className="w-full px-3.5 py-2.5 bg-[#0a0b10] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-[#FFC700] focus:ring-1 focus:ring-[#FFC700] transition-all placeholder-gray-600"
              />
            </div>
          </div>

          {/* Descrição / Tema espiritual */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#FFC700]" />
              <span>Descrição / Lema / Observações</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Tema do encontro, versículo bíblico ou orientações para a equipe..."
              className="w-full px-3.5 py-2.5 bg-[#0a0b10] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-[#FFC700] focus:ring-1 focus:ring-[#FFC700] transition-all placeholder-gray-600 resize-none"
            />
          </div>

          {/* Opção de clonar equipes (apenas ao criar novo evento) */}
          {!eventToEdit && currentEventId && (
            <div className="p-3.5 rounded-xl bg-[#171928] border border-gray-700/80 hover:border-[#FFC700]/50 transition-colors">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={cloneTeams}
                  onChange={(e) => setCloneTeams(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#FFC700] focus:ring-[#FFC700] bg-gray-900 border-gray-700 accent-[#FFC700] cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                    <Copy className="w-3.5 h-3.5 text-[#FFC700]" />
                    <span>Copiar equipes e funções do evento atual</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                    Copia todas as equipes e funções de <strong className="text-gray-200">{currentEventName || 'evento atual'}</strong> com as vagas limpas, prontas para nova escala.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FFC700] hover:bg-[#FFD54F] text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#FFC700]/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{eventToEdit ? 'Salvar Alterações' : 'Criar Evento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
