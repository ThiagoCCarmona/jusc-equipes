import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Upload, RotateCcw, AlertTriangle, FileJson } from 'lucide-react';
import { useTeams } from '../context/TeamContext';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { exportBackupJson, importBackupJson, resetToDefaults } = useTeams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupJson(content);
        if (success) {
          onClose();
        }
      }
    };
    reader.readAsText(file);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-[#141622] border-2 border-[#FFC700] rounded-2xl shadow-[0_0_50px_rgba(255,199,0,0.25)] p-5 sm:p-7 overflow-hidden my-auto max-h-[95vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFC700] via-[#FFE066] to-[#FFC700]" />

        <div className="flex items-center justify-between pb-4 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFC700]/15 border border-[#FFC700]/40 text-[#FFC700] shadow-sm">
              <FileJson className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Backup e Ajustes</h2>
              <p className="text-xs text-[#FFC700] font-medium">JUSC • Gerenciamento de Dados</p>
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

        <div className="mt-5 space-y-4 overflow-y-auto pr-1">
          <div className="p-4 rounded-xl bg-[#0a0b10] border border-gray-800 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Exportar Backup JSON</h3>
              <p className="text-xs text-gray-400">Baixe uma cópia completa de equipes e pessoas</p>
            </div>
            <button
              onClick={exportBackupJson}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold text-black bg-[#FFC700] hover:bg-[#FFE066] rounded-xl transition-all shadow-md cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" /> Baixar
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#0a0b10] border border-gray-800 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Importar Backup JSON</h3>
              <p className="text-xs text-gray-400">Restaure dados de um arquivo salvo</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-all border border-gray-700 cursor-pointer shrink-0"
            >
              <Upload className="w-4 h-4 text-[#FFC700]" /> Carregar
            </button>
          </div>

          <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wide">
                <AlertTriangle className="w-3.5 h-3.5" /> Restaurar Padrões
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Recarrega o exemplo demonstrativo original JUSC</p>
            </div>
            <button
              onClick={() => {
                resetToDefaults();
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-red-300 hover:text-white bg-red-900/40 hover:bg-red-900/80 rounded-xl transition-all border border-red-800/50 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restaurar
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white bg-gray-800 rounded-xl transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
