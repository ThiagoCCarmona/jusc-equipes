import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  GripVertical, 
  Phone, 
  Trash2, 
  Edit3, 
  X,
  Users,
  Star
} from 'lucide-react';
import { useTeams } from '../context/TeamContext';
import type { Person, PersonType, PriorityLevel } from '../types';
import { PersonModal } from './PersonModal';
import { TYPE_STYLES } from '../utils/constants';

const CATEGORIES_LIST: Array<PersonType | 'Todos'> = [
  'Todos',
  'Coordenação',
  'Integrantes',
  'Tios',
  'PJ',
  'Veteranos',
  'Voluntários',
];

const PRIORITIES_FILTER: Array<{ value: PriorityLevel | 'all'; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 3, label: 'P3' },
  { value: 2, label: 'P2' },
  { value: 1, label: 'P1' },
  { value: 0, label: 'P0' },
];

export const PeopleSidebar: React.FC<{ width?: number }> = () => {
  const {
    people,
    peopleSearch,
    setPeopleSearch,
    personTypeFilter,
    setPersonTypeFilter,
    personAllocationFilter,
    setPersonAllocationFilter,
    personPriorityFilter,
    setPersonPriorityFilter,
    addPerson,
    updatePerson,
    deletePerson,
    getPersonAllocations,
    removePersonFromRole,
  } = useTeams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  // Filtering
  const filteredPeople = people.filter(p => {
    const query = peopleSearch.toLowerCase().trim();
    if (query) {
      const matchName = p.name.toLowerCase().includes(query);
      const matchPhone = p.phone ? p.phone.toLowerCase().includes(query) : false;
      const matchNotes = p.notes ? p.notes.toLowerCase().includes(query) : false;
      if (!matchName && !matchPhone && !matchNotes) return false;
    }

    if (personTypeFilter !== 'Todos' && p.type !== personTypeFilter) {
      return false;
    }

    if (personPriorityFilter !== 'all' && p.priority !== personPriorityFilter) {
      return false;
    }

    const allocs = getPersonAllocations(p.id);
    const isAllocated = allocs.length > 0;

    if (personAllocationFilter === 'available' && isAllocated) return false;
    if (personAllocationFilter === 'assigned' && !isAllocated) return false;

    return true;
  });

  const availableCount = people.filter(p => getPersonAllocations(p.id).length === 0).length;
  const assignedCount = people.length - availableCount;

  const handleDragStart = (e: React.DragEvent, person: Person) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        personId: person.id,
        type: 'person',
      })
    );
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const openAddModal = () => {
    setEditingPerson(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Person) => {
    setEditingPerson(p);
    setIsModalOpen(true);
  };

  const handleSavePerson = (
    name: string, 
    type: PersonType, 
    priority: PriorityLevel, 
    phone?: string, 
    notes?: string
  ) => {
    if (editingPerson) {
      updatePerson(editingPerson.id, { name, type, priority, phone, notes });
    } else {
      addPerson(name, type, priority, phone, notes);
    }
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 3:
        return { bg: 'bg-red-950/80', text: 'text-red-300', border: 'border-red-500/60', label: 'P3' };
      case 2:
        return { bg: 'bg-amber-950/80', text: 'text-amber-300', border: 'border-amber-500/60', label: 'P2' };
      case 1:
        return { bg: 'bg-blue-950/80', text: 'text-blue-300', border: 'border-blue-500/60', label: 'P1' };
      case 0:
      default:
        return { bg: 'bg-gray-900/90', text: 'text-gray-400', border: 'border-gray-700', label: 'P0' };
    }
  };

  return (
    <aside className="w-full h-full bg-[#0d0f18] border-r-2 border-gray-800 flex flex-col select-none overflow-hidden">
      
      {/* Sidebar Top Compact Header */}
      <div className="p-3 border-b border-gray-800 bg-[#131622] shrink-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <img 
              src="/assets/mascote-jusc.png" 
              alt="Mascote JUSC" 
              className="w-8 h-8 object-contain drop-shadow-[0_2px_8px_rgba(255,199,0,0.4)] shrink-0" 
            />
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5 truncate">
                <span>Banco de Pessoas</span>
                <span className="text-[11px] px-2 py-0.2 rounded-full bg-black text-[#FFC700] font-mono font-bold border border-[#FFC700]/40 shrink-0">
                  {people.length}
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-black text-black bg-[#FFC700] hover:bg-[#FFE066] active:bg-[#E5B200] rounded-xl transition-all shadow-md shadow-[#FFC700]/25 cursor-pointer shrink-0"
            title="Cadastrar nova pessoa"
          >
            <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Adicionar</span>
          </button>
        </div>

        {/* Compact Search & Priority Bar */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, fone..."
              value={peopleSearch}
              onChange={e => setPeopleSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#08090d] border border-gray-700 focus:border-[#FFC700] focus:ring-1 focus:ring-[#FFC700] rounded-xl text-white outline-none transition-all placeholder:text-gray-500"
            />
            {peopleSearch && (
              <button
                onClick={() => setPeopleSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Inline Priority selector */}
          <div className="flex items-center gap-0.5 p-0.5 bg-[#08090d] border border-gray-800 rounded-xl shrink-0">
            {PRIORITIES_FILTER.map(item => {
              const isSelected = personPriorityFilter === item.value;
              return (
                <button
                  key={String(item.value)}
                  onClick={() => setPersonPriorityFilter(item.value)}
                  className={`px-1.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFC700] text-black shadow-xs'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  title={item.value === 'all' ? 'Todas prioridades' : `Filtrar Prioridade ${item.label}`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Status Filters: Todos | Livres | Alocados */}
        <div className="flex items-center gap-1 p-0.5 bg-[#08090d] border border-gray-800 rounded-xl text-[11px]">
          <button
            onClick={() => setPersonAllocationFilter('all')}
            className={`flex-1 py-1 px-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
              personAllocationFilter === 'all'
                ? 'bg-[#FFC700] text-black shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Todos ({people.length})
          </button>
          <button
            onClick={() => setPersonAllocationFilter('available')}
            className={`flex-1 py-1 px-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
              personAllocationFilter === 'available'
                ? 'bg-[#FFC700] text-black shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Livres ({availableCount})
          </button>
          <button
            onClick={() => setPersonAllocationFilter('assigned')}
            className={`flex-1 py-1 px-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
              personAllocationFilter === 'assigned'
                ? 'bg-[#FFC700] text-black shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Alocados ({assignedCount})
          </button>
        </div>

        {/* Category Pills Filter - Wraps cleanly */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {CATEGORIES_LIST.map(t => {
            const count = t === 'Todos' ? people.length : people.filter(p => p.type === t).length;
            const isSelected = personTypeFilter === t;
            return (
              <button
                key={t}
                onClick={() => setPersonTypeFilter(t)}
                className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#FFC700] text-black border-[#FFC700] shadow-xs'
                    : 'bg-[#181a26] text-gray-300 hover:bg-gray-800 border-gray-700/70 hover:text-white'
                }`}
              >
                {t} <span className="opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* People Draggable Cards List - Extended full height with no unnecessary scrolling for few people */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 min-h-0">
        {filteredPeople.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Users className="w-10 h-10 text-gray-600 mb-2" />
            <p className="text-xs font-bold text-gray-300">Nenhuma pessoa encontrada</p>
            <button
              onClick={openAddModal}
              className="mt-3 px-3 py-1.5 text-xs font-bold text-black bg-[#FFC700] hover:bg-[#FFE066] rounded-xl transition-all shadow-md cursor-pointer"
            >
              Adicionar Pessoa
            </button>
          </div>
        ) : (
          filteredPeople.map(person => {
            const allocs = getPersonAllocations(person.id);
            const isAllocated = allocs.length > 0;
            const style = TYPE_STYLES[person.type] || TYPE_STYLES['Integrantes'];
            const priorityBadge = getPriorityBadge(person.priority);

            return (
              <div
                key={person.id}
                draggable
                onDragStart={e => handleDragStart(e, person)}
                className="group relative bg-[#141622] hover:bg-[#1c1f2e] border border-gray-800 hover:border-[#FFC700] rounded-xl p-2.5 transition-all cursor-grab active:cursor-grabbing hover:shadow-lg text-xs"
              >
                {/* Header row: Grip, Name, Priority, Category, Actions */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <GripVertical className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#FFC700] shrink-0" />
                    <span className="font-extrabold text-white truncate text-xs sm:text-sm group-hover:text-[#FFC700] transition-colors">
                      {person.name}
                    </span>

                    {/* Priority Badge */}
                    <span 
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${priorityBadge.bg} ${priorityBadge.text} ${priorityBadge.border} flex items-center gap-0.5 shrink-0`}
                      title={`Prioridade ${person.priority}`}
                    >
                      <Star className="w-2.5 h-2.5 fill-current" />
                      {priorityBadge.label}
                    </span>

                    {/* Category */}
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${style.bg} ${style.text} ${style.border} flex items-center gap-1`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.dot }} />
                      {person.type}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(person);
                      }}
                      className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-800 transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePerson(person.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-400 rounded hover:bg-gray-800 transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Sub row: Allocation badge or free status + phone/notes */}
                <div className="mt-1.5 flex items-center justify-between gap-1 text-[11px] flex-wrap">
                  {isAllocated ? (
                    <div className="flex flex-wrap gap-1 flex-1">
                      {allocs.map(({ team, role }) => (
                        <span 
                          key={`${team.id}-${role.id}`}
                          className="inline-flex items-center gap-1 bg-[#08090d] px-2 py-0.5 rounded-md border border-[#FFC700]/30 text-gray-200 text-[10px]"
                        >
                          <span className="text-[#FFC700] font-bold truncate max-w-[110px]">{team.name}</span>
                          <span className="text-gray-500">›</span>
                          <span className="text-white truncate max-w-[120px]">{role.title}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removePersonFromRole(person.id, team.id, role.id);
                            }}
                            className="text-gray-400 hover:text-red-400 p-0.5 rounded transition-colors ml-0.5 cursor-pointer"
                            title="Remover"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Livre
                    </span>
                  )}

                  {person.phone && (
                    <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-0.5 shrink-0" title={person.phone}>
                      <Phone className="w-2.5 h-2.5 text-gray-500" />
                      {person.phone}
                    </span>
                  )}
                </div>

                {/* Subtle notes if present */}
                {person.notes && (
                  <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 italic">
                    "{person.notes}"
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      <PersonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePerson}
        initialPerson={editingPerson}
      />
    </aside>
  );
};
