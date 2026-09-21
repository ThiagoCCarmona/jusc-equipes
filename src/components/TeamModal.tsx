import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, Palette } from 'lucide-react';
import type { Team } from '../types';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, colorAccent?: string) => void;
  initialTeam?: Team | null;
}

const COLOR_PALETTES = [
  { name: 'Dourado JUSC', color: '#FFC700' },
  { name: 'Âmbar Sol', color: '#FF9500' },
  { name: 'Laranja Quente', color: '#F97316' },
  { name: 'Vermelho Fogo', color: '#EF4444' },
  { name: 'Rosa Vibrante', color: '#EC4899' },
  { name: 'Púrpura / Roxo', color: '#8B5CF6' },
  { name: 'Azul Real', color: '#3B82F6' },
  { name: 'Ciano Acolhida', color: '#06B6D4' },
  { name: 'Verde Esmeralda', color: '#10B981' },
  { name: 'Verde Limão', color: '#84CC16' },
  { name: 'Bronze / Ouro', color: '#D97706' },
  { name: 'Grafite Metálico', color: '#64748B' },
];

export const TeamModal: React.FC<TeamModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTeam,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorAccent, setColorAccent] = useState('#FFC700');

  useEffect(() => {
    if (initialTeam) {
      setName(initialTeam.name);
      setDescription(initialTeam.description || '');
      setColorAccent(initialTeam.colorAccent || '#FFC700');
    } else {
      setName('');
      setDescription('');
      setColorAccent('#FFC700');
    }
  }, [initialTeam, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), description.trim(), colorAccent);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-[#141622] border-2 border-[#FFC700] rounded-2xl shadow-[0_0_50px_rgba(255,199,0,0.25)] p-5 sm:p-7 overflow-hidden my-auto max-h-[95vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top dynamic color bar */}
        <div 
          className="absolute top-0 left-0 right-0 h-2 transition-all duration-300"
          style={{ background: `linear-gradient(90deg, ${colorAccent}, #FFE066, ${colorAccent})` }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-xl border transition-colors shadow-sm"
              style={{ 
                backgroundColor: `${colorAccent}20`, 
                borderColor: `${colorAccent}60`,
                color: colorAccent 
              }}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {initialTeam ? 'Editar Equipe de Trabalho' : 'Criar Nova Equipe de Trabalho'}
              </h2>
              <p className="text-xs text-gray-400">JUSC • Estruturação de Equipes</p>
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
          {/* Nome da Equipe */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#FFC700] mb-1.5">
              Nome da Equipe *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Equipe de Cozinha, Acolhida, Animação e Louvor, Liturgia..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0b10] border border-gray-700 focus:border-[#FFC700] focus:ring-2 focus:ring-[#FFC700]/30 rounded-xl text-white text-sm outline-none transition-all placeholder:text-gray-500 font-medium"
            />
          </div>

          {/* Descrição Detalhada da Equipe */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#FFC700] mb-1.5">
              Descrição Detalhada da Equipe *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Descreva detalhadamente o objetivo, missão, contexto de atuação e responsabilidades gerais desta equipe..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0a0b10] border border-gray-700 focus:border-[#FFC700] focus:ring-2 focus:ring-[#FFC700]/30 rounded-xl text-white text-sm outline-none transition-all placeholder:text-gray-500 resize-none leading-relaxed"
            />
          </div>

          {/* Cor Temática da Equipe */}
          <div className="bg-[#0a0b10] p-4 rounded-xl border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#FFC700]" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-200">
                  Cor de Identificação da Equipe
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-mono text-[#FFC700] uppercase font-bold">
                  {colorAccent}
                </label>
                {/* Native Color Picker */}
                <div className="relative flex items-center justify-center">
                  <input
                    type="color"
                    value={colorAccent}
                    onChange={e => setColorAccent(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-2 border-white/40 bg-transparent"
                    title="Escolher cor personalizada"
                  />
                </div>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
              {COLOR_PALETTES.map(palette => {
                const isSelected = colorAccent.toLowerCase() === palette.color.toLowerCase();
                return (
                  <button
                    type="button"
                    key={palette.color}
                    onClick={() => setColorAccent(palette.color)}
                    style={{ backgroundColor: palette.color }}
                    className={`h-9 rounded-xl transition-all cursor-pointer flex items-center justify-center relative ${
                      isSelected 
                        ? 'scale-110 ring-2 ring-white shadow-lg' 
                        : 'opacity-85 hover:opacity-100 hover:scale-105'
                    }`}
                    title={palette.name}
                  >
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-black/60 shadow-xs" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Live Preview Card Header */}
            <div className="mt-2 pt-3 border-t border-gray-800">
              <div className="text-[11px] text-gray-400 mb-1 font-medium">Pré-visualização do Cartão:</div>
              <div 
                className="p-2.5 rounded-xl border bg-[#141620] flex items-center justify-between"
                style={{ borderColor: `${colorAccent}60` }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorAccent }} />
                  <span className="text-xs font-bold text-white">
                    {name || 'Nome da Equipe'}
                  </span>
                </div>
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${colorAccent}20`, color: colorAccent }}
                >
                  Cor Selecionada
                </span>
              </div>
            </div>
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
              <ShieldCheck className="w-4 h-4" />
              {initialTeam ? 'Salvar Alterações' : 'Criar Equipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
