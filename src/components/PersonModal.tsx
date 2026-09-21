import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, UserCheck, Star } from 'lucide-react';
import type { Person, PersonType, PriorityLevel } from '../types';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, type: PersonType, priority: PriorityLevel, phone?: string, notes?: string) => void;
  initialPerson?: Person | null;
}

const PERSON_CATEGORIES: Array<{ type: PersonType; label: string; desc: string; color: string }> = [
  { type: 'Coordenação', label: 'Coordenação', desc: 'Liderança geral', color: '#8B5CF6' },
  { type: 'Integrantes', label: 'Integrantes', desc: 'Membros ativos', color: '#FFC700' },
  { type: 'Tios', label: 'Tios', desc: 'Casais e tios', color: '#06B6D4' },
  { type: 'PJ', label: 'PJ', desc: 'Juventude', color: '#EC4899' },
  { type: 'Veteranos', label: 'Veteranos', desc: 'Experientes', color: '#F59E0B' },
  { type: 'Voluntários', label: 'Voluntários', desc: 'Apoio geral', color: '#10B981' },
];

const PRIORITIES: Array<{ level: PriorityLevel; label: string; desc: string; stars: number; color: string }> = [
  { level: 3, label: 'Prioridade 3 (Alta)', desc: 'Essencial / Alocação urgente', stars: 3, color: '#EF4444' },
  { level: 2, label: 'Prioridade 2 (Média)', desc: 'Participação prioritária', stars: 2, color: '#F59E0B' },
  { level: 1, label: 'Prioridade 1 (Baixa)', desc: 'Disponível conforme vaga', stars: 1, color: '#3B82F6' },
  { level: 0, label: 'Prioridade 0 (Padrão)', desc: 'Sem urgência específica', stars: 0, color: '#6B7280' },
];

export const PersonModal: React.FC<PersonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPerson,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<PersonType>('Integrantes');
  const [priority, setPriority] = useState<PriorityLevel>(0);
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialPerson) {
      setName(initialPerson.name);
      setType(initialPerson.type);
      setPriority(initialPerson.priority !== undefined ? initialPerson.priority : 0);
      setPhone(initialPerson.phone || '');
      setNotes(initialPerson.notes || '');
    } else {
      setName('');
      setType('Integrantes');
      setPriority(0);
      setPhone('');
      setNotes('');
    }
  }, [initialPerson, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), type, priority, phone.trim(), notes.trim());
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-[#141622] border-2 border-[#FFC700] rounded-2xl shadow-[0_0_50px_rgba(255,199,0,0.25)] p-5 sm:p-7 overflow-hidden my-auto max-h-[95vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFC700] via-[#FFE066] to-[#FFC700]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFC700]/15 border border-[#FFC700]/40 text-[#FFC700] shadow-sm">
              {initialPerson ? <UserCheck className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {initialPerson ? 'Editar Pessoa' : 'Adicionar Nova Pessoa'}
              </h2>
              <p className="text-xs text-[#FFC700] font-medium">JUSC • Cadastro de Integrantes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 overflow-y-auto pr-1">
          {/* Nome */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#FFC700] mb-1.5">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Gabriel Santos, Tio João, Mariana Lima..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0b10] border border-gray-700 focus:border-[#FFC700] focus:ring-2 focus:ring-[#FFC700]/30 rounded-xl text-white text-sm outline-none transition-all placeholder:text-gray-500 font-medium"
            />
          </div>

          {/* Categoria / Perfil */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#FFC700] mb-2">
              Categoria / Perfil *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PERSON_CATEGORIES.map(cat => {
                const isSelected = type === cat.type;
                return (
                  <button
                    type="button"
                    key={cat.type}
                    onClick={() => setType(cat.type)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#FFC700] bg-[#FFC700]/15 shadow-md shadow-[#FFC700]/10 ring-1 ring-[#FFC700]'
                        : 'border-gray-800 bg-[#0a0b10] hover:border-gray-700 hover:bg-gray-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: cat.color }} 
                      />
                      {isSelected && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#FFC700] text-black rounded">
                          Ativo
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <div className="text-xs font-bold text-white">{cat.label}</div>
                      <div className="text-[10px] text-gray-400 line-clamp-1">{cat.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prioridade de Trabalho (0 a 3) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#FFC700] mb-2">
              Prioridade de Trabalho (0 a 3) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRIORITIES.map(p => {
                const isSelected = priority === p.level;
                return (
                  <button
                    type="button"
                    key={p.level}
                    onClick={() => setPriority(p.level)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#FFC700] bg-[#FFC700]/15 shadow-md ring-1 ring-[#FFC700]'
                        : 'border-gray-800 bg-[#0a0b10] hover:border-gray-700 hover:bg-gray-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-xs font-black px-1.5 py-0.5 rounded text-white" 
                        style={{ backgroundColor: p.color }}
                      >
                        P{p.level}
                      </span>
                      <div className="flex items-center text-[#FFC700]">
                        {Array.from({ length: p.stars }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-[#FFC700]" />
                        ))}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-bold text-white">{p.label.split(' ')[0]} {p.label.split(' ')[1]}</div>
                      <div className="text-[10px] text-gray-400">{p.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Telefone / WhatsApp (Opcional)
            </label>
            <input
              type="text"
              placeholder="(11) 98765-4321"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0a0b10] border border-gray-700 focus:border-[#FFC700] focus:ring-2 focus:ring-[#FFC700]/30 rounded-xl text-white text-sm outline-none transition-all placeholder:text-gray-500"
            />
          </div>

          {/* Observações / Habilidades */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Observações, Habilidades ou Restrições
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Toca instrumento, sabe cozinhar, tem carro para compras, não pode carregar peso..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0a0b10] border border-gray-700 focus:border-[#FFC700] focus:ring-2 focus:ring-[#FFC700]/30 rounded-xl text-white text-sm outline-none transition-all placeholder:text-gray-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-extrabold text-black bg-[#FFC700] hover:bg-[#FFE066] active:bg-[#E5B200] rounded-xl transition-all shadow-lg shadow-[#FFC700]/25 cursor-pointer flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              {initialPerson ? 'Salvar Alterações' : 'Cadastrar Pessoa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
