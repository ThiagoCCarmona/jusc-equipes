import React, { useState } from 'react';
import { 
  Users, 
  X, 
  Trash2, 
  Edit3, 
  Plus, 
  GripVertical, 
  Phone,
  Info,
  ChevronUp,
  ChevronDown,
  Star
} from 'lucide-react';
import type { Role, Team, Person } from '../types';
import { useTeams } from '../context/TeamContext';
import { RoleModal } from './RoleModal';
import { TYPE_STYLES } from '../utils/constants';

interface RoleDropZoneProps {
  role: Role;
  team: Team;
  roleIndex?: number;
  totalRoles?: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDropReorder?: (sourceRoleIndex: number, targetRoleIndex: number) => void;
}

export const RoleDropZone: React.FC<RoleDropZoneProps> = ({ 
  role, 
  team,
  roleIndex = 0,
  totalRoles = 1,
  onMoveUp,
  onMoveDown,
  onDropReorder
}) => {
  const { 
    people, 
    assignPersonToRole, 
    removePersonFromRole, 
    movePersonBetweenRoles,
    updateRole, 
    deleteRole 
  } = useTeams();

  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showQuickSelect, setShowQuickSelect] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const peopleMap = new Map<string, Person>(people.map(p => [p.id, p]));
  const allocatedMembers = role.assignedPersonIds
    .map(id => peopleMap.get(id))
    .filter((p): p is Person => Boolean(p));

  const isFull = Boolean(role.maxSpots && role.assignedPersonIds.length >= role.maxSpots);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;

      const data = JSON.parse(dataStr);

      // Check if this is a role reorder drop
      if (data.type === 'role' && data.teamId === team.id && onDropReorder && data.roleIndex !== undefined) {
        onDropReorder(data.roleIndex, roleIndex);
        return;
      }

      const personId = data.personId;
      if (!personId) return;

      if (data.sourceTeamId && data.sourceRoleId) {
        movePersonBetweenRoles(personId, data.sourceTeamId, data.sourceRoleId, team.id, role.id);
      } else {
        assignPersonToRole(personId, team.id, role.id);
      }
    } catch (err) {
      console.error('Error handling drop', err);
    }
  };

  const handleRoleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'role',
        teamId: team.id,
        roleId: role.id,
        roleIndex,
      })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleMemberDragStart = (e: React.DragEvent, person: Person) => {
    e.stopPropagation();
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'person',
        personId: person.id,
        sourceTeamId: team.id,
        sourceRoleId: role.id,
      })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSaveRole = (title: string, description: string, maxSpots?: number) => {
    updateRole(team.id, role.id, { title, description, maxSpots });
  };

  const unassignedHere = people.filter(p => !role.assignedPersonIds.includes(p.id));

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 transition-all duration-200 overflow-hidden flex flex-col ${
        isDragOver
          ? 'border-[#FFC700] bg-[#FFC700]/15 shadow-xl shadow-[#FFC700]/25 scale-[1.01]'
          : isFull
          ? 'border-gray-800 bg-[#0c0e14]'
          : 'border-gray-800 hover:border-gray-700 bg-[#10121c]'
      }`}
    >
      {/* Visual drop indicator */}
      {isDragOver && (
        <div className="absolute inset-0 border-3 border-dashed border-[#FFC700] rounded-xl pointer-events-none z-20 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <span className="text-xs font-extrabold text-black bg-[#FFC700] px-3.5 py-1.5 rounded-full shadow-xl">
            Soltar aqui para alocar / reordenar
          </span>
        </div>
      )}

      {/* Role Header */}
      <div className="p-3.5 bg-[#141624] border-b border-gray-800">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            {/* Grip handle to reorder role */}
            <div 
              draggable
              onDragStart={handleRoleDragStart}
              className="mt-0.5 text-gray-500 hover:text-[#FFC700] cursor-grab active:cursor-grabbing p-0.5 rounded transition-colors shrink-0"
              title="Arraste para reordenar esta função na equipe"
            >
              <GripVertical className="w-4 h-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-extrabold text-white tracking-wide">
                  {role.title}
                </h4>

                {/* Spots Badge */}
                {role.maxSpots ? (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      isFull
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                        : 'bg-[#FFC700]/15 text-[#FFC700] border-[#FFC700]/40'
                    }`}
                  >
                    {role.assignedPersonIds.length}/{role.maxSpots} vagas
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-800 text-gray-200 border border-gray-700">
                    {role.assignedPersonIds.length} integrantes (livre)
                  </span>
                )}
              </div>

              {/* Role Description */}
              {role.description && (
                <div className="mt-1.5 text-xs text-gray-300 leading-relaxed bg-[#0a0b10] p-2 rounded-lg border border-gray-800/80">
                  <div className="flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#FFC700] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className={showFullDesc ? '' : 'line-clamp-2'}>
                        <span className="text-[#FFC700] font-bold mr-1">Atribuições:</span>
                        {role.description}
                      </p>
                      {role.description.length > 80 && (
                        <button
                          onClick={() => setShowFullDesc(!showFullDesc)}
                          className="text-[10px] text-[#FFC700] hover:underline font-bold mt-0.5 inline-block cursor-pointer"
                        >
                          {showFullDesc ? 'Recolher' : 'Ver tudo'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Role Actions & Reorder Up/Down */}
          <div className="flex items-center gap-0.5 shrink-0">
            {onMoveUp && roleIndex > 0 && (
              <button
                onClick={onMoveUp}
                className="p-1 text-gray-500 hover:text-[#FFC700] rounded hover:bg-gray-800 cursor-pointer"
                title="Mover função para cima"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            )}
            {onMoveDown && roleIndex < totalRoles - 1 && (
              <button
                onClick={onMoveDown}
                className="p-1 text-gray-500 hover:text-[#FFC700] rounded hover:bg-gray-800 cursor-pointer"
                title="Mover função para baixo"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-800 transition-colors cursor-pointer"
              title="Editar função"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => deleteRole(team.id, role.id)}
              className="p-1 text-gray-400 hover:text-red-400 rounded hover:bg-gray-800 transition-colors cursor-pointer"
              title="Excluir função"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Allocated Members List */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {allocatedMembers.length === 0 ? (
            <div className="py-3 border-2 border-dashed border-gray-800 rounded-xl text-center px-3 bg-[#090a10]">
              <Users className="w-4 h-4 mx-auto text-gray-500 mb-1" />
              <p className="text-xs text-gray-300 font-bold">Nenhum integrante alocado</p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Arraste uma pessoa para cá
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {allocatedMembers.map(member => {
                const style = TYPE_STYLES[member.type] || TYPE_STYLES['Integrantes'];
                return (
                  <div
                    key={member.id}
                    draggable
                    onDragStart={e => handleMemberDragStart(e, member)}
                    className="group flex items-center justify-between p-2 rounded-xl bg-[#151824] hover:bg-[#1d2133] border border-gray-800 hover:border-[#FFC700]/70 transition-all cursor-grab active:cursor-grabbing text-xs shadow-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#FFC700] shrink-0" />
                      <span className="font-extrabold text-white truncate group-hover:text-[#FFC700] transition-colors text-xs">
                        {member.name}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${style.bg} ${style.text} ${style.border}`}>
                        {member.type}
                      </span>
                      {member.priority > 0 && (
                        <span className="text-[9px] font-black text-[#FFC700] flex items-center shrink-0">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          P{member.priority}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      {member.phone && (
                        <span className="text-[11px] text-gray-400 hidden sm:inline" title={member.phone}>
                          <Phone className="w-2.5 h-2.5 inline mr-0.5 text-gray-500" />
                        </span>
                      )}
                      <button
                        onClick={() => removePersonFromRole(member.id, team.id, role.id)}
                        className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors cursor-pointer"
                        title="Desalocar desta função"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Direct allocation dropdown */}
        {!isFull && (
          <div className="mt-2.5 relative">
            {showQuickSelect ? (
              <div className="p-2.5 bg-[#171928] border-2 border-[#FFC700] rounded-xl shadow-2xl space-y-1.5 animate-fade-in z-30">
                <div className="flex items-center justify-between text-xs font-bold text-gray-200 pb-1 border-b border-gray-800">
                  <span>Selecionar do Banco de Pessoas:</span>
                  <button
                    onClick={() => setShowQuickSelect(false)}
                    className="text-gray-400 hover:text-white p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                  {unassignedHere.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">
                      Todas as pessoas já estão alocadas aqui
                    </p>
                  ) : (
                    unassignedHere.map(p => {
                      const style = TYPE_STYLES[p.type] || TYPE_STYLES['Integrantes'];
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            assignPersonToRole(p.id, team.id, role.id);
                            setShowQuickSelect(false);
                          }}
                          className="w-full text-left flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-800 text-xs text-white transition-colors cursor-pointer border border-transparent hover:border-gray-700"
                        >
                          <span className="font-bold truncate">{p.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="text-[10px] text-[#FFC700] font-bold">P{p.priority}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${style.bg} ${style.text} ${style.border}`}>
                              {p.type}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowQuickSelect(true)}
                className="w-full py-1.5 px-2 rounded-xl border border-dashed border-gray-700 hover:border-[#FFC700] hover:bg-[#FFC700]/10 text-gray-300 hover:text-[#FFC700] text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Alocar pessoa diretamente</span>
              </button>
            )}
          </div>
        )}
      </div>

      <RoleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveRole}
        initialRole={role}
        teamName={team.name}
      />
    </div>
  );
};
