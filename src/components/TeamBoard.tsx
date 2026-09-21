import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  X,
  LayoutGrid,
  Columns2,
  Columns3
} from 'lucide-react';
import { useTeams } from '../context/TeamContext';
import { TeamCard } from './TeamCard';
import { TeamModal } from './TeamModal';

export const TeamBoard: React.FC = () => {
  const { 
    teams, 
    teamSearch, 
    setTeamSearch, 
    teamStatusFilter, 
    setTeamStatusFilter,
    addTeam,
    moveTeam,
    reorderTeams
  } = useTeams();

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [columnsMode, setColumnsMode] = useState<'1' | '2' | '3' | 'auto'>('auto');

  // Filter teams logic
  const filteredTeams = teams.filter(team => {
    const query = teamSearch.toLowerCase().trim();
    if (query) {
      const matchName = team.name.toLowerCase().includes(query);
      const matchDesc = team.description.toLowerCase().includes(query);
      const matchRole = team.roles.some(
        r => r.title.toLowerCase().includes(query) || r.description.toLowerCase().includes(query)
      );
      if (!matchName && !matchDesc && !matchRole) return false;
    }

    if (teamStatusFilter === 'open_spots') {
      const hasOpenSpots = team.roles.some(
        r => !r.maxSpots || r.assignedPersonIds.length < r.maxSpots
      );
      if (!hasOpenSpots) return false;
    }

    if (teamStatusFilter === 'full') {
      const isCompletelyFull = team.roles.length > 0 && team.roles.every(
        r => r.maxSpots && r.assignedPersonIds.length >= r.maxSpots
      );
      if (!isCompletelyFull) return false;
    }

    return true;
  });

  const getGridClasses = () => {
    switch (columnsMode) {
      case '1':
        return 'grid grid-cols-1 w-full max-w-6xl mx-auto gap-6';
      case '2':
        return 'grid grid-cols-1 lg:grid-cols-2 gap-6';
      case '3':
        return 'grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6';
      case 'auto':
      default:
        return 'grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6';
    }
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-[#08090d] p-4 sm:p-6 lg:p-8 overflow-y-auto">
      
      {/* Search & Filter Toolbar */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#121420] border-2 border-gray-800 shadow-xl backdrop-blur-md">
        <div className="flex flex-col xl:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full xl:w-96">
            <Search className="w-4 h-4 text-[#FFC700] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar por nome de equipe, função ou atribuição..."
              value={teamSearch}
              onChange={e => setTeamSearch(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-[#0a0b10] border border-gray-700 focus:border-[#FFC700] focus:ring-2 focus:ring-[#FFC700]/30 rounded-xl text-white outline-none transition-all placeholder:text-gray-500 font-medium"
            />
            {teamSearch && (
              <button
                onClick={() => setTeamSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters & View layout options */}
          <div className="flex items-center justify-between xl:justify-end gap-3 w-full xl:w-auto flex-wrap">
            
            {/* Status filters */}
            <div className="flex items-center gap-1.5 p-1 bg-[#0a0b10] rounded-xl border border-gray-800 text-xs">
              <button
                onClick={() => setTeamStatusFilter('all')}
                className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                  teamStatusFilter === 'all'
                    ? 'bg-[#FFC700] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Todas ({teams.length})
              </button>
              <button
                onClick={() => setTeamStatusFilter('open_spots')}
                className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                  teamStatusFilter === 'open_spots'
                    ? 'bg-[#FFC700] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Com Vagas Abertas
              </button>
              <button
                onClick={() => setTeamStatusFilter('full')}
                className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                  teamStatusFilter === 'full'
                    ? 'bg-[#FFC700] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Completas
              </button>
            </div>

            {/* Column Layout Switcher (Resize view) */}
            <div className="hidden sm:flex items-center gap-1 p-1 bg-[#0a0b10] rounded-xl border border-gray-800 text-xs">
              <span className="text-[11px] font-bold text-gray-400 px-2">Colunas:</span>
              <button
                onClick={() => setColumnsMode('1')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-xs font-bold ${
                  columnsMode === '1' ? 'bg-[#FFC700] text-black shadow-xs' : 'text-gray-400 hover:text-white'
                }`}
                title="1 Coluna ampla (divide funções em 2 colunas)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>1 Coluna</span>
              </button>
              <button
                onClick={() => setColumnsMode('2')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-xs font-bold ${
                  columnsMode === '2' ? 'bg-[#FFC700] text-black shadow-xs' : 'text-gray-400 hover:text-white'
                }`}
                title="2 Colunas"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>2 Colunas</span>
              </button>
              <button
                onClick={() => setColumnsMode('3')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-xs font-bold ${
                  columnsMode === '3' ? 'bg-[#FFC700] text-black shadow-xs' : 'text-gray-400 hover:text-white'
                }`}
                title="3 Colunas"
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span>3 Colunas</span>
              </button>
            </div>

            {/* Mobile team button */}
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="xl:hidden flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-black bg-[#FFC700] rounded-xl shrink-0 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Equipe</span>
            </button>
          </div>
        </div>

        {/* Filter Summary */}
        {(teamSearch || teamStatusFilter !== 'all') && (
          <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-300 font-medium">
            <span>
              Exibindo <b className="text-[#FFC700] font-bold">{filteredTeams.length}</b> de {teams.length} equipes
              {teamSearch && ` com o termo "${teamSearch}"`}
            </span>
            <button
              onClick={() => {
                setTeamSearch('');
                setTeamStatusFilter('all');
              }}
              className="text-[#FFC700] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#121420]/60 border-2 border-dashed border-gray-800 rounded-3xl my-6">
          <img
            src="/assets/mascote-jusc.png"
            alt="Mascote JUSC"
            className="w-28 h-28 object-contain mb-4 drop-shadow-[0_4px_16px_rgba(255,199,0,0.3)]"
          />
          <h3 className="text-xl font-extrabold text-white mb-1.5">
            Nenhuma equipe encontrada
          </h3>
          <p className="text-sm text-gray-300 max-w-md mb-6 leading-relaxed">
            {teamSearch || teamStatusFilter !== 'all'
              ? 'Nenhuma equipe corresponde aos filtros selecionados. Tente limpar os termos de busca.'
              : 'Comece criando a primeira equipe de trabalho para o seu evento ou retiro JUSC!'}
          </p>

          {teamSearch || teamStatusFilter !== 'all' ? (
            <button
              onClick={() => {
                setTeamSearch('');
                setTeamStatusFilter('all');
              }}
              className="px-5 py-2.5 text-xs font-bold text-black bg-[#FFC700] hover:bg-[#FFE066] rounded-xl transition-all shadow-md cursor-pointer"
            >
              Limpar Filtros
            </button>
          ) : (
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 text-sm font-black text-black bg-[#FFC700] hover:bg-[#FFE066] active:bg-[#E5B200] rounded-xl transition-all shadow-xl shadow-[#FFC700]/30 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Criar Primeira Equipe</span>
            </button>
          )}
        </div>
      ) : (
        <div className={getGridClasses()}>
          {filteredTeams.map((team, tIndex) => (
            <TeamCard 
              key={team.id} 
              team={team} 
              teamIndex={tIndex}
              totalTeams={filteredTeams.length}
              isSingleColumnMode={columnsMode === '1'}
              onMoveUp={() => moveTeam(team.id, 'up')}
              onMoveDown={() => moveTeam(team.id, 'down')}
              onDropReorderTeam={(srcIdx, targetIdx) => reorderTeams(srcIdx, targetIdx)}
            />
          ))}
        </div>
      )}

      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onSave={addTeam}
      />
    </main>
  );
};
