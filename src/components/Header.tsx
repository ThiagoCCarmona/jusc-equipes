import React, { useState } from 'react';
import { 
  Plus, 
  FileText, 
  FileSpreadsheet, 
  Settings2, 
  Users, 
  Layers, 
  CheckCircle2, 
  Menu,
  ChevronDown,
  UserCheck,
  AlertCircle,
  ShieldCheck,
  LogOut,
  LogIn,
  Calendar,
  Edit3,
  PlusCircle,
  Trash2
} from 'lucide-react';
import { useTeams } from '../context/TeamContext';
import { TeamModal } from './TeamModal';
import { BackupModal } from './BackupModal';
import { EventModal } from './EventModal';
import confetti from 'canvas-confetti';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { 
    events,
    currentEvent,
    selectEvent,
    addEvent,
    updateEvent,
    deleteEvent,
    teams, 
    people, 
    addTeam, 
    exportPDF, 
    exportExcel,
    exportPeoplePDF,
    exportPeopleExcel,
    currentUser,
    isAuthenticated,
    logout,
    openLoginModal
  } = useTeams();

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any>(null);
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);

  // Compute metrics
  const totalPeople = people.length;
  let totalRoles = 0;
  let totalSpots = 0;
  let filledSpots = 0;
  let openSpots = 0;

  const allocatedPeopleIds = new Set<string>();

  teams.forEach(team => {
    team.roles.forEach(role => {
      totalRoles++;
      if (role.maxSpots && role.maxSpots > 0) {
        totalSpots += role.maxSpots;
        filledSpots += Math.min(role.assignedPersonIds.length, role.maxSpots);
        openSpots += Math.max(0, role.maxSpots - role.assignedPersonIds.length);
      } else {
        filledSpots += role.assignedPersonIds.length;
      }
      role.assignedPersonIds.forEach(id => allocatedPeopleIds.add(id));
    });
  });

  const allocatedCount = allocatedPeopleIds.size;

  const triggerConfetti = (colors: string[]) => {
    confetti({
      particleCount: 55,
      spread: 65,
      origin: { y: 0.2 },
      colors,
    });
  };

  const handleExport = (type: 'team-pdf' | 'team-excel' | 'people-pdf' | 'people-excel') => {
    setIsExportMenuOpen(false);
    if (type === 'team-pdf') {
      triggerConfetti(['#FFC700', '#FFFFFF', '#FFA500']);
      exportPDF();
    } else if (type === 'team-excel') {
      triggerConfetti(['#FFC700', '#10B981', '#FFFFFF']);
      exportExcel();
    } else if (type === 'people-pdf') {
      triggerConfetti(['#06B6D4', '#FFC700', '#FFFFFF']);
      exportPeoplePDF();
    } else if (type === 'people-excel') {
      triggerConfetti(['#10B981', '#3B82F6', '#FFC700']);
      exportPeopleExcel();
    }
  };

  return (
    <header className="relative w-full border-b-2 border-gray-800 bg-[#0d0e16]/95 backdrop-blur-md sticky top-0 z-40 select-none">
      {/* Top ambient gold glow accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFC700] to-transparent" />

      {/* Main Bar */}
      <div className="max-w-[2100px] mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Brand, Logo & Event Selector */}
          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="relative group cursor-pointer" title="JUSC - Jovens Unidos Seguindo Cristo">
                <img
                  src="/assets/logo-jusc.jpg"
                  alt="Logo JUSC"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border-2 border-[#FFC700] shadow-[0_0_15px_rgba(255,199,0,0.3)]"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-1 sm:gap-1.5">
                    <span className="text-[#FFC700]">JUSC</span>
                    <span className="text-gray-400 font-bold text-xs sm:text-base">|</span>
                    <span className="text-gray-100 font-extrabold text-xs sm:text-base">Equipes</span>
                  </h1>
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium hidden sm:block">
                  Jovens Unidos Seguindo Cristo
                </p>
              </div>
            </div>

            {/* Event Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#141624] hover:bg-[#1a1d2e] border border-[#FFC700]/50 hover:border-[#FFC700] text-left transition-all cursor-pointer shadow-sm group"
                title="Clique para alternar ou gerenciar eventos"
              >
                <div className="p-1.5 rounded-lg bg-[#FFC700]/15 text-[#FFC700] group-hover:scale-105 transition-transform">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div className="max-w-[110px] sm:max-w-[160px] xl:max-w-[200px] truncate">
                  <div className="text-[9px] font-bold text-[#FFC700] uppercase tracking-wider">
                    Evento Ativo
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-white truncate">
                    {currentEvent?.name || 'Selecione um evento'}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isEventDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isEventDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-[#121420] border-2 border-[#FFC700]/50 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                  <div className="px-3 py-1.5 flex items-center justify-between border-b border-gray-800">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Eventos ({events.length})
                    </span>
                    <button
                      onClick={() => {
                        setIsEventDropdownOpen(false);
                        setEventToEdit(null);
                        setIsEventModalOpen(true);
                      }}
                      className="text-[11px] font-bold text-[#FFC700] hover:text-yellow-300 flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Novo</span>
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 py-1 scrollbar-thin">
                    {events.map((evt) => {
                      const isSelected = currentEvent?.id === evt.id;
                      return (
                        <div
                          key={evt.id}
                          className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                            isSelected ? 'bg-[#FFC700]/15 border border-[#FFC700]/40' : 'hover:bg-gray-800/80'
                          }`}
                        >
                          <button
                            onClick={() => {
                              selectEvent(evt.id);
                              setIsEventDropdownOpen(false);
                            }}
                            className="flex-1 text-left cursor-pointer min-w-0 pr-2"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#FFC700]' : 'text-white'}`}>
                                {evt.name}
                              </span>
                              {isSelected && (
                                <span className="px-1.5 py-0.5 text-[8px] font-black bg-[#FFC700] text-black rounded-md shrink-0">
                                  ATIVO
                                </span>
                              )}
                            </div>
                            {(evt.date || evt.location) && (
                              <div className="text-[10px] text-gray-400 truncate mt-0.5">
                                {[evt.date, evt.location].filter(Boolean).join(' • ')}
                              </div>
                            )}
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEventToEdit(evt);
                                setIsEventDropdownOpen(false);
                                setIsEventModalOpen(true);
                              }}
                              className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-700/60 transition-colors cursor-pointer"
                              title="Editar evento"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {events.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteEvent(evt.id);
                                }}
                                className="p-1 text-gray-400 hover:text-red-400 rounded-md hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="Excluir evento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-1.5 border-t border-gray-800">
                    <button
                      onClick={() => {
                        setIsEventDropdownOpen(false);
                        setEventToEdit(null);
                        setIsEventModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-[#FFC700]/10 hover:bg-[#FFC700]/20 border border-[#FFC700]/30 text-xs font-extrabold text-[#FFC700] transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Criar Novo Evento</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button for sidebar */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151824] text-[#FFC700] border border-gray-700 hover:bg-gray-800 text-xs font-bold"
                title="Abrir Banco de Pessoas"
              >
                <Menu className="w-4 h-4" />
                <span>Pessoas ({totalPeople})</span>
              </button>
            )}
          </div>

          {/* Quick Stats Badges: Includes VAGAS ABERTAS and VAGAS PREENCHIDAS */}
          <div className="flex items-center gap-2 text-xs overflow-x-auto w-full lg:w-auto justify-start lg:justify-center py-1 scrollbar-none">
            {/* Vagas Preenchidas */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#091812] border border-emerald-500/50 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-gray-300 font-medium">Preenchidas:</span>
              <span className="font-extrabold text-emerald-400 text-sm">{filledSpots}</span>
              {totalSpots > 0 && (
                <span className="text-gray-400 text-[10px]">/ {totalSpots}</span>
              )}
            </div>

            {/* Vagas Abertas Restantes */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#20180a] border border-[#FFC700]/50 shrink-0">
              <AlertCircle className="w-4 h-4 text-[#FFC700]" />
              <span className="text-gray-300 font-medium">Vagas Abertas:</span>
              <span className="font-extrabold text-[#FFC700] text-sm">{openSpots}</span>
            </div>

            {/* Equipes */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#141624] border border-gray-800 shrink-0">
              <Layers className="w-3.5 h-3.5 text-[#FFC700]" />
              <span className="text-gray-400">Equipes:</span>
              <span className="font-bold text-white">{teams.length}</span>
            </div>

            {/* Funções */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#141624] border border-gray-800 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#FFC700]" />
              <span className="text-gray-400">Funções:</span>
              <span className="font-bold text-white">{totalRoles}</span>
            </div>

            {/* Pessoas */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#141624] border border-gray-800 shrink-0">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-gray-400">Alocados:</span>
              <span className="font-bold text-[#FFC700]">{allocatedCount}</span>
              <span className="text-gray-500">/ {totalPeople}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 w-full lg:w-auto justify-end flex-wrap relative">
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-black text-black bg-[#FFC700] hover:bg-[#FFE066] active:bg-[#E5B200] rounded-xl transition-all shadow-lg shadow-[#FFC700]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nova Equipe</span>
            </button>

            {/* Unified Export Menu Button */}
            <div className="relative">
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-gray-100 bg-[#141624] hover:bg-[#1a1d2e] hover:text-[#FFC700] border border-gray-700 hover:border-[#FFC700]/60 rounded-xl transition-all cursor-pointer shadow-md"
              >
                <FileText className="w-4 h-4 text-[#FFC700]" />
                <span>Exportar Relatórios</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Export Dropdown Menu */}
              {isExportMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#141624] border-2 border-[#FFC700]/50 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800">
                    Escala de Equipes e Funções
                  </div>
                  <button
                    onClick={() => handleExport('team-pdf')}
                    className="w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-800/80 transition-colors cursor-pointer text-xs text-white"
                  >
                    <FileText className="w-4 h-4 text-red-400 shrink-0" />
                    <div>
                      <div className="font-bold">Equipes em PDF</div>
                      <div className="text-[10px] text-gray-400">Relatório com descrição e funções</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExport('team-excel')}
                    className="w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-800/80 transition-colors cursor-pointer text-xs text-white"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold">Equipes em Planilha (.xlsx)</div>
                      <div className="text-[10px] text-gray-400">Tabela completa de funções e vagas</div>
                    </div>
                  </button>

                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-t border-gray-800 mt-1">
                    Relatório do Banco de Pessoas
                  </div>

                  <button
                    onClick={() => handleExport('people-pdf')}
                    className="w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-800/80 transition-colors cursor-pointer text-xs text-white"
                  >
                    <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="font-bold">Pessoas em PDF</div>
                      <div className="text-[10px] text-gray-400">Relação de voluntários e prioridades</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExport('people-excel')}
                    className="w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-800/80 transition-colors cursor-pointer text-xs text-white"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <div className="font-bold">Pessoas em Planilha (.xlsx)</div>
                      <div className="text-[10px] text-gray-400">Dados, contatos, alocação e prioridades</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Backup & Settings */}
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="p-2 text-gray-400 hover:text-white bg-[#141624] hover:bg-gray-800 border border-gray-700/80 rounded-xl transition-all cursor-pointer shadow-sm"
              title="Backup, restauração e configurações"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            {/* Auth status & logout / login */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-1 border-l border-gray-800">
                <div 
                  className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#141624] border border-gray-800 text-xs text-gray-300"
                  title={`Conectado como ${currentUser?.name || currentUser?.email}`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFC700]" />
                  <span className="font-semibold text-gray-200 max-w-[120px] truncate">{currentUser?.name || currentUser?.email?.split('@')[0]}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-400 bg-[#141624] hover:bg-red-500/10 border border-gray-700/80 hover:border-red-500/30 rounded-xl transition-all cursor-pointer shadow-sm"
                  title="Sair (Logout)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-black bg-[#FFC700] hover:bg-[#FFD54F] rounded-xl transition-all cursor-pointer shadow-md shadow-[#FFC700]/20"
                title="Entrar com conta JUSC"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onSave={addTeam}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEventToEdit(null);
        }}
        onSave={(name, description, date, location, cloneFromEventId) => {
          if (eventToEdit) {
            updateEvent(eventToEdit.id, { name, description, date, location });
          } else {
            addEvent(name, description, date, location, cloneFromEventId);
          }
        }}
        eventToEdit={eventToEdit}
        currentEventId={currentEvent?.id}
        currentEventName={currentEvent?.name}
      />
    </header>
  );
};
