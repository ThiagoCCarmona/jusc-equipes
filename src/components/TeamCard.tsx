import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  Info,
  GripVertical
} from 'lucide-react';
import type { Team } from '../types';
import { useTeams } from '../context/TeamContext';
import { RoleDropZone } from './RoleDropZone';
import { RoleModal } from './RoleModal';
import { TeamModal } from './TeamModal';

interface TeamCardProps {
  team: Team;
  teamIndex?: number;
  totalTeams?: number;
  isSingleColumnMode?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDropReorderTeam?: (sourceTeamIndex: number, targetTeamIndex: number) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ 
  team,
  teamIndex = 0,
  totalTeams = 1,
  isSingleColumnMode = false,
  onMoveUp,
  onMoveDown,
  onDropReorderTeam
}) => {
  const { deleteTeam, updateTeam, addRole, moveRole, reorderRoles } = useTeams();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showFullTeamDesc, setShowFullTeamDesc] = useState(false);
  const [isDragOverTeam, setIsDragOverTeam] = useState(false);

  let totalAssigned = 0;
  let totalSpots = 0;
  team.roles.forEach(r => {
    totalAssigned += r.assignedPersonIds.length;
    totalSpots += r.maxSpots || 0;
  });

  const handleSaveRole = (title: string, description: string, maxSpots?: number) => {
    addRole(team.id, title, description, maxSpots);
  };

  const handleSaveTeam = (name: string, description: string, colorAccent?: string) => {
    updateTeam(team.id, { name, description, colorAccent });
  };

  const accentColor = team.colorAccent || '#FFC700';

  // Team Drag & Drop
  const handleTeamDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'team',
        teamId: team.id,
        teamIndex,
      })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTeamDragOver = (e: React.DragEvent) => {
    // Only accept team reordering
    e.preventDefault();
    if (!isDragOverTeam) setIsDragOverTeam(true);
  };

  const handleTeamDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOverTeam(false);
    }
  };

  const handleTeamDrop = (e: React.DragEvent) => {
    setIsDragOverTeam(false);
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      if (data.type === 'team' && onDropReorderTeam && data.teamIndex !== undefined) {
        e.preventDefault();
        onDropReorderTeam(data.teamIndex, teamIndex);
      }
    } catch (err) {
      // not a team reorder
    }
  };

  return (
    <div 
      onDragOver={handleTeamDragOver}
      onDragLeave={handleTeamDragLeave}
      onDrop={handleTeamDrop}
      className={`bg-[#12141e] border-2 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 flex flex-col relative ${
        isDragOverTeam ? 'ring-4 ring-[#FFC700] scale-[1.01]' : ''
      }`}
      style={{ borderColor: `${accentColor}50` }}
    >
      {/* Top thematic accent bar */}
      <div 
        className="h-2 w-full"
        style={{ 
          background: `linear-gradient(90deg, ${accentColor}, #FFE066, ${accentColor})` 
        }} 
      />

      {/* Team Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-b from-[#181b28] to-[#12141e] border-b border-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            {/* Grip handle to reorder team */}
            <div
              draggable
              onDragStart={handleTeamDragStart}
              className="mt-1 text-gray-500 hover:text-[#FFC700] cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-gray-800 transition-colors shrink-0"
              title="Arraste para reordenar esta equipe"
            >
              <GripVertical className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-md ring-2 ring-white/20"
                  style={{ backgroundColor: accentColor }}
                />
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight truncate">
                  {team.name}
                </h3>
                <span 
                  className="text-xs px-2.5 py-0.5 rounded-full font-bold border"
                  style={{ 
                    backgroundColor: `${accentColor}15`, 
                    color: accentColor, 
                    borderColor: `${accentColor}50` 
                  }}
                >
                  {team.roles.length} {team.roles.length === 1 ? 'função' : 'funções'}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1b1f2e] text-gray-200 font-bold border border-gray-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#FFC700]" />
                  {totalAssigned} {totalSpots > 0 ? `/ ${totalSpots} vagas` : 'membros'}
                </span>
              </div>

              {/* Team Description */}
              {team.description && (
                <div className="mt-2.5 text-xs sm:text-sm text-gray-200 bg-[#090b10] p-3 rounded-xl border border-gray-800">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accentColor }} />
                    <div className="flex-1">
                      <p className={`leading-relaxed ${showFullTeamDesc ? '' : 'line-clamp-2'}`}>
                        {team.description}
                      </p>
                      {team.description.length > 110 && (
                        <button
                          onClick={() => setShowFullTeamDesc(!showFullTeamDesc)}
                          className="text-xs hover:underline font-bold mt-1.5 inline-block cursor-pointer"
                          style={{ color: accentColor }}
                        >
                          {showFullTeamDesc ? 'Recolher descrição' : 'Ler descrição completa da equipe'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Team Actions & Reorder Up/Down */}
          <div className="flex items-center gap-1 shrink-0">
            {onMoveUp && teamIndex > 0 && (
              <button
                onClick={onMoveUp}
                className="p-1.5 text-gray-500 hover:text-[#FFC700] rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                title="Mover equipe para cima / esquerda"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {onMoveDown && teamIndex < totalTeams - 1 && (
              <button
                onClick={onMoveDown}
                className="p-1.5 text-gray-500 hover:text-[#FFC700] rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                title="Mover equipe para baixo / direita"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              title="Editar equipe e cor"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteTeam(team.id)}
              className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              title="Excluir equipe"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              title={isExpanded ? 'Recolher funções' : 'Expandir funções'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Add Function Button Bar */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-800">
          <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-[#FFC700]" />
            Funções e Atribuições ({team.roles.length})
          </span>

          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-black bg-[#FFC700] hover:bg-[#FFE066] active:bg-[#E5B200] rounded-xl transition-all shadow-md shadow-[#FFC700]/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Adicionar Função</span>
          </button>
        </div>
      </div>

      {/* Team Content / Roles List: Splits into 2 columns if isSingleColumnMode is true */}
      {isExpanded && (
        <div className="p-4 sm:p-5 flex-1 flex flex-col bg-[#0a0b12]/50">
          {team.roles.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-gray-800 rounded-2xl p-6 bg-[#0e1018] flex flex-col items-center justify-center">
              <Briefcase className="w-10 h-10 text-gray-600 mb-2" />
              <p className="text-sm font-bold text-gray-200">Nenhuma função cadastrada nesta equipe</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Cadastre as funções de trabalho (ex: Coordenador, Auxiliar, Som) para poder alocar integrantes.
              </p>
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="mt-4 flex items-center gap-1.5 px-5 py-2.5 text-xs font-black text-black bg-[#FFC700] hover:bg-[#FFE066] rounded-xl transition-all cursor-pointer shadow-lg shadow-[#FFC700]/20"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Criar Primeira Função</span>
              </button>
            </div>
          ) : (
            <div className={isSingleColumnMode ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'flex flex-col space-y-3'}>
              {team.roles.map((role, rIndex) => (
                <RoleDropZone 
                  key={role.id} 
                  role={role} 
                  team={team}
                  roleIndex={rIndex}
                  totalRoles={team.roles.length}
                  onMoveUp={() => moveRole(team.id, role.id, 'up')}
                  onMoveDown={() => moveRole(team.id, role.id, 'down')}
                  onDropReorder={(sourceIdx, targetIdx) => reorderRoles(team.id, sourceIdx, targetIdx)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSave={handleSaveRole}
        teamName={team.name}
      />

      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onSave={handleSaveTeam}
        initialTeam={team}
      />
    </div>
  );
};
