import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Briefcase, Plus } from 'lucide-react';
import type { Role } from '../types';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, maxSpots?: number) => void;
  initialRole?: Role | null;
  teamName?: string;
}

export const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRole,
  teamName,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hasLimit, setHasLimit] = useState(true);
  const [maxSpots, setMaxSpots] = useState<number>(2);

  useEffect(() => {
    if (initialRole) {
      setTitle(initialRole.title);
      setDescription(initialRole.description || '');
      if (initialRole.maxSpots && initialRole.maxSpots > 0) {
        setHasLimit(true);
        setMaxSpots(initialRole.maxSpots);
      } else {
        setHasLimit(false);
        setMaxSpots(2);
      }
    } else {
      setTitle('');
      setDescription('');
      setHasLimit(true);
      setMaxSpots(2);
    }
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), description.trim(), hasLimit ? maxSpots : undefined);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-[#141622] border-2 border-[#FFC700] rounded-2xl shadow-[0_0_50px_rgba(255,199,0,0.25)] p-5 sm:p-7 overflow-hidden my-auto max-h-[95vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top gold bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFC700] via-[#FFE066] to-[#FFC700]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFC700]/15 border border-[#FFC700]/40 text-[#FFC700] shadow-sm">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {initialRole ? 'Editar Função de Trabalho' : 'Nova Função de Trabalho'}
              </h2>
              <p className="text-xs text-[#FFC700] font-medium">
                {teamName ? `Equipe: ${teamName}` : 'JUSC • Estruturação de Funções'}
              </p>
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
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#FFC700] mb-1.5">
              Título / Nome da Função *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Coordenador de Turno, Chefe de Prato, Operador de Som..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0b10] border border-gray-700 focus:border-[#FFC700] focus:ring-2 focus:ring-[#FFC700]/30 rounded-xl text-white text-sm outline-none transition-all placeholder:text-gray-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#FFC700] mb-1.5">
              Descrição da Função / Atribuições *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Explique detalhadamente as tarefas, responsabilidades, horários ou orientações para quem assumir a vaga..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0a0b10] border border-gray-700 focus:border-[#FFC700] focus:ring-2 focus:ring-[#FFC700]/30 rounded-xl text-white text-sm outline-none transition-all placeholder:text-gray-500 resize-none leading-relaxed"
            />
          </div>

          <div className="bg-[#0a0b10] p-4 rounded-xl border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-gray-200">Definir limite de vagas</span>
                <p className="text-xs text-gray-400">Restringir quantas pessoas podem ser alocadas nesta função</p>
              </div>
              <input
                type="checkbox"
                checked={hasLimit}
                onChange={e => setHasLimit(e.target.checked)}
                className="w-5 h-5 accent-[#FFC700] cursor-pointer rounded"
              />
            </div>

            {hasLimit && (
              <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">Quantidade de vagas:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMaxSpots(prev => Math.max(1, prev - 1))}
                    className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold flex items-center justify-center transition-colors text-base cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-extrabold text-[#FFC700] text-lg">{maxSpots}</span>
                  <button
                    type="button"
                    onClick={() => setMaxSpots(prev => prev + 1)}
                    className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold flex items-center justify-center transition-colors text-base cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

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
              <Plus className="w-4 h-4 stroke-[2.5]" />
              {initialRole ? 'Salvar Alterações' : 'Adicionar Função'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
