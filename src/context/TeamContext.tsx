import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { 
  Person, 
  Team, 
  Role, 
  PersonType, 
  PriorityLevel, 
  AllocationFilterType, 
  TeamFilterStatus,
  Event
} from '../types';
import { INITIAL_PEOPLE, INITIAL_TEAMS } from '../utils/sampleData';
import { 
  exportTeamsToPDF, 
  exportTeamsToExcel, 
  exportPeopleToPDF, 
  exportPeopleToExcel 
} from '../services/exportService';
import { api, getAuthToken, getSavedUser } from '../services/api';
import { LoginModal } from '../components/LoginModal';

interface TeamContextType {
  // Events
  events: Event[];
  currentEvent: Event | null;
  selectEvent: (eventId: string) => void;
  addEvent: (name: string, description?: string, date?: string, location?: string, cloneFromEventId?: string) => Promise<void>;
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;

  teams: Team[];
  people: Person[];
  currentUser: any;
  isAuthenticated: boolean;
  logout: () => void;
  openLoginModal: () => void;
  
  // Filters for People
  peopleSearch: string;
  setPeopleSearch: (search: string) => void;
  personTypeFilter: PersonType | 'Todos';
  setPersonTypeFilter: (type: PersonType | 'Todos') => void;
  personAllocationFilter: AllocationFilterType;
  setPersonAllocationFilter: (filter: AllocationFilterType) => void;
  personPriorityFilter: PriorityLevel | 'all';
  setPersonPriorityFilter: (priority: PriorityLevel | 'all') => void;

  // Filters for Teams
  teamSearch: string;
  setTeamSearch: (search: string) => void;
  teamStatusFilter: TeamFilterStatus;
  setTeamStatusFilter: (status: TeamFilterStatus) => void;

  // Teams CRUD & Reorder
  addTeam: (name: string, description: string, colorAccent?: string) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  deleteTeam: (teamId: string) => void;
  moveTeam: (teamId: string, direction: 'up' | 'down') => void;
  reorderTeams: (sourceIndex: number, destIndex: number) => void;

  // Roles CRUD & Reorder
  addRole: (teamId: string, title: string, description: string, maxSpots?: number) => void;
  updateRole: (teamId: string, roleId: string, updates: Partial<Role>) => void;
  deleteRole: (teamId: string, roleId: string) => void;
  moveRole: (teamId: string, roleId: string, direction: 'up' | 'down') => void;
  reorderRoles: (teamId: string, sourceIndex: number, destIndex: number) => void;

  // People CRUD
  addPerson: (name: string, type: PersonType, priority: PriorityLevel, phone?: string, notes?: string) => void;
  updatePerson: (personId: string, updates: Partial<Person>) => void;
  deletePerson: (personId: string) => void;

  // Allocations
  assignPersonToRole: (personId: string, teamId: string, roleId: string) => void;
  removePersonFromRole: (personId: string, teamId: string, roleId: string) => void;
  movePersonBetweenRoles: (
    personId: string,
    sourceTeamId: string,
    sourceRoleId: string,
    targetTeamId: string,
    targetRoleId: string
  ) => void;

  // Helpers
  getPersonAllocations: (personId: string) => Array<{ team: Team; role: Role }>;
  isPersonAllocated: (personId: string) => boolean;
  resetToDefaults: () => void;
  exportBackupJson: () => void;
  importBackupJson: (jsonData: string) => boolean;
  exportPDF: () => void;
  exportExcel: () => void;
  exportPeoplePDF: () => void;
  exportPeopleExcel: () => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

const DEFAULT_EVENT: Event = {
  id: 'event-1',
  name: 'Encontro Geral JUSC 2026',
  description: 'Equipes de trabalho e funções oficiais do encontro',
  date: 'Outubro / 2026',
  location: 'Sede JUSC',
  status: 'active',
  createdAt: '2026-09-01T00:00:00.000Z',
};

const LOCAL_STORAGE_EVENTS = 'jusc_events_v4';
const LOCAL_STORAGE_CURRENT_EVENT = 'jusc_current_event_v4';
const LOCAL_STORAGE_TEAMS = 'jusc_teams_v3';
const LOCAL_STORAGE_PEOPLE = 'jusc_people_v3';

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(() => getSavedUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(!getAuthToken());

  // Events State
  const [events, setEvents] = useState<Event[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_EVENTS);
      return saved ? JSON.parse(saved) : [DEFAULT_EVENT];
    } catch {
      return [DEFAULT_EVENT];
    }
  });

  const [currentEvent, setCurrentEvent] = useState<Event | null>(() => {
    try {
      const savedId = localStorage.getItem(LOCAL_STORAGE_CURRENT_EVENT);
      if (savedId) {
        const found = events.find(e => e.id === savedId);
        if (found) return found;
      }
      return events[0] || DEFAULT_EVENT;
    } catch {
      return events[0] || DEFAULT_EVENT;
    }
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TEAMS);
      return saved ? JSON.parse(saved) : INITIAL_TEAMS;
    } catch {
      return INITIAL_TEAMS;
    }
  });

  const [people, setPeople] = useState<Person[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PEOPLE);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((p: Person) => ({
          ...p,
          priority: p.priority !== undefined ? p.priority : 0,
        }));
      }
      return INITIAL_PEOPLE;
    } catch {
      return INITIAL_PEOPLE;
    }
  });

  // Save events and current event to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_EVENTS, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save events to localStorage', e);
    }
  }, [events]);

  useEffect(() => {
    if (currentEvent) {
      try {
        localStorage.setItem(LOCAL_STORAGE_CURRENT_EVENT, currentEvent.id);
      } catch (e) {
        console.error('Failed to save currentEvent to localStorage', e);
      }
    }
  }, [currentEvent]);

  // Load events and people from API on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [apiEvents, apiPeople] = await Promise.all([
          api.getEvents(),
          api.getPeople(),
        ]);
        if (apiEvents && apiEvents.length > 0) {
          setEvents(apiEvents);
          setCurrentEvent(prev => {
            if (prev) {
              const matched = apiEvents.find(e => e.id === prev.id);
              if (matched) return matched;
            }
            return apiEvents[0];
          });
        }
        if (apiPeople && apiPeople.length > 0) setPeople(apiPeople);
      } catch (err) {
        console.warn('Backend offline or not reachable, using local storage cache.');
      }
    }

    loadInitialData();
  }, [currentUser]);

  // Load teams whenever currentEvent changes
  useEffect(() => {
    if (!currentEvent) return;
    const activeEventId = currentEvent.id;

    async function loadTeams() {
      try {
        const apiTeams = await api.getTeams(activeEventId);
        if (apiTeams) setTeams(apiTeams);
      } catch (err) {
        console.warn('Backend offline, using localStorage for event teams.');
        try {
          const savedEventTeams = localStorage.getItem(`jusc_teams_event_${activeEventId}`);
          if (savedEventTeams) {
            setTeams(JSON.parse(savedEventTeams));
          } else if (activeEventId === 'event-1') {
            const savedLegacy = localStorage.getItem(LOCAL_STORAGE_TEAMS);
            setTeams(savedLegacy ? JSON.parse(savedLegacy) : INITIAL_TEAMS);
          } else {
            setTeams([]);
          }
        } catch {
          setTeams([]);
        }
      }
    }

    loadTeams();
  }, [currentEvent?.id]);

  // Persist teams for current event
  useEffect(() => {
    if (currentEvent) {
      try {
        localStorage.setItem(`jusc_teams_event_${currentEvent.id}`, JSON.stringify(teams));
        if (currentEvent.id === 'event-1') {
          localStorage.setItem(LOCAL_STORAGE_TEAMS, JSON.stringify(teams));
        }
      } catch (e) {
        console.error('Failed to save teams to localStorage', e);
      }
    }
  }, [teams, currentEvent?.id]);

  // Filter States
  const [peopleSearch, setPeopleSearch] = useState('');
  const [personTypeFilter, setPersonTypeFilter] = useState<PersonType | 'Todos'>('Todos');
  const [personAllocationFilter, setPersonAllocationFilter] = useState<AllocationFilterType>('all');
  const [personPriorityFilter, setPersonPriorityFilter] = useState<PriorityLevel | 'all'>('all');

  const [teamSearch, setTeamSearch] = useState('');
  const [teamStatusFilter, setTeamStatusFilter] = useState<TeamFilterStatus>('all');

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PEOPLE, JSON.stringify(people));
    } catch (e) {
      console.error('Failed to save people to localStorage', e);
    }
  }, [people]);

  const logout = () => {
    api.logout();
    setCurrentUser(null);
    setIsLoginModalOpen(true);
  };

  // Event Actions
  const selectEvent = (eventId: string) => {
    const target = events.find(e => e.id === eventId);
    if (target) {
      setCurrentEvent(target);
    }
  };

  const addEvent = async (
    name: string,
    description?: string,
    date?: string,
    location?: string,
    cloneFromEventId?: string
  ) => {
    const tempId = `event-${Date.now()}`;
    const now = new Date().toISOString();
    let newEvt: Event = {
      id: tempId,
      name,
      description,
      date,
      location,
      status: 'active',
      createdAt: now,
    };

    try {
      const apiEvt = await api.createEvent(name, description, date, location, cloneFromEventId, tempId);
      if (apiEvt) {
        newEvt = apiEvt;
      }
    } catch (err) {
      console.warn('API createEvent error', err);
    }

    setEvents(prev => [...prev, newEvt]);
    setCurrentEvent(newEvt);

    if (cloneFromEventId) {
      try {
        const clonedTeams = await api.getTeams(newEvt.id);
        setTeams(clonedTeams || []);
      } catch {
        // offline clone of current teams with clean vacancies
        setTeams(prev => prev.map((t, idx) => ({
          ...t,
          id: `t-${Date.now()}-${idx}`,
          eventId: newEvt.id,
          roles: t.roles.map((r, rIdx) => ({
            ...r,
            id: `r-${Date.now()}-${idx}-${rIdx}`,
            assignedPersonIds: [],
          }))
        })));
      }
    } else {
      setTeams([]);
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...updates } : e));
    if (currentEvent?.id === eventId) {
      setCurrentEvent(prev => prev ? { ...prev, ...updates } : null);
    }
    try {
      await api.updateEvent(eventId, updates);
    } catch (err) {
      console.warn('API updateEvent error', err);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (events.length <= 1) {
      alert('Você não pode excluir o único evento existente.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja excluir este evento e todas as suas equipes? O banco de pessoas NÃO será afetado.')) {
      return;
    }

    const remaining = events.filter(e => e.id !== eventId);
    setEvents(remaining);
    if (currentEvent?.id === eventId) {
      const next = remaining[0];
      setCurrentEvent(next);
    }

    try {
      await api.deleteEvent(eventId);
    } catch (err) {
      console.warn('API deleteEvent error', err);
    }
  };

  // Team Actions
  const addTeam = async (name: string, description: string, colorAccent = '#FFC700') => {
    const tempId = `t-${Date.now()}`;
    const targetEventId = currentEvent?.id || 'event-1';
    const newTeam: Team = {
      id: tempId,
      eventId: targetEventId,
      name: name.trim(),
      description: description.trim(),
      colorAccent,
      roles: [],
    };
    setTeams(prev => [newTeam, ...prev]);

    try {
      await api.createTeam(name, description, colorAccent, targetEventId, tempId);
    } catch (err) {
      console.warn('API createTeam sync error', err);
    }
  };

  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    setTeams(prev => prev.map(t => (t.id === teamId ? { ...t, ...updates } : t)));
    try {
      await api.updateTeam(teamId, updates);
    } catch (err) {
      console.warn('API updateTeam sync error', err);
    }
  };

  const deleteTeam = async (teamId: string) => {
    if (window.confirm('Tem certeza que deseja remover esta equipe e todas as suas funções?')) {
      setTeams(prev => prev.filter(t => t.id !== teamId));
      try {
        await api.deleteTeam(teamId);
      } catch (err) {
        console.warn('API deleteTeam sync error', err);
      }
    }
  };

  const moveTeam = (teamId: string, direction: 'up' | 'down') => {
    setTeams(prev => {
      const index = prev.findIndex(t => t.id === teamId);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const newTeams = [...prev];
      const [moved] = newTeams.splice(index, 1);
      newTeams.splice(targetIndex, 0, moved);

      api.reorderTeams(newTeams.map(t => t.id)).catch(() => {});
      return newTeams;
    });
  };

  const reorderTeams = (sourceIndex: number, destIndex: number) => {
    if (sourceIndex === destIndex) return;
    setTeams(prev => {
      const newTeams = [...prev];
      const [moved] = newTeams.splice(sourceIndex, 1);
      newTeams.splice(destIndex, 0, moved);
      api.reorderTeams(newTeams.map(t => t.id)).catch(() => {});
      return newTeams;
    });
  };

  // Role Actions
  const addRole = async (teamId: string, title: string, description: string, maxSpots?: number) => {
    const tempId = `r-${Date.now()}`;
    const newRole: Role = {
      id: tempId,
      title: title.trim(),
      description: description.trim(),
      maxSpots: maxSpots && maxSpots > 0 ? maxSpots : undefined,
      assignedPersonIds: [],
    };

    setTeams(prev =>
      prev.map(t => (t.id === teamId ? { ...t, roles: [...t.roles, newRole] } : t))
    );

    try {
      await api.createRole(teamId, title, description, maxSpots, tempId);
    } catch (err) {
      console.warn('API createRole sync error', err);
    }
  };

  const updateRole = async (teamId: string, roleId: string, updates: Partial<Role>) => {
    setTeams(prev =>
      prev.map(t => {
        if (t.id !== teamId) return t;
        return {
          ...t,
          roles: t.roles.map(r => (r.id === roleId ? { ...r, ...updates } : r)),
        };
      })
    );
    try {
      await api.updateRole(teamId, roleId, updates);
    } catch (err) {
      console.warn('API updateRole sync error', err);
    }
  };

  const deleteRole = async (teamId: string, roleId: string) => {
    if (window.confirm('Deseja excluir esta função? As pessoas alocadas serão liberadas.')) {
      setTeams(prev =>
        prev.map(t => {
          if (t.id !== teamId) return t;
          return {
            ...t,
            roles: t.roles.filter(r => r.id !== roleId),
          };
        })
      );
      try {
        await api.deleteRole(teamId, roleId);
      } catch (err) {
        console.warn('API deleteRole sync error', err);
      }
    }
  };

  const moveRole = (teamId: string, roleId: string, direction: 'up' | 'down') => {
    setTeams(prev =>
      prev.map(t => {
        if (t.id !== teamId) return t;
        const index = t.roles.findIndex(r => r.id === roleId);
        if (index === -1) return t;
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= t.roles.length) return t;

        const newRoles = [...t.roles];
        const [moved] = newRoles.splice(index, 1);
        newRoles.splice(targetIndex, 0, moved);
        api.reorderRoles(teamId, newRoles.map(r => r.id)).catch(() => {});
        return { ...t, roles: newRoles };
      })
    );
  };

  const reorderRoles = (teamId: string, sourceIndex: number, destIndex: number) => {
    if (sourceIndex === destIndex) return;
    setTeams(prev =>
      prev.map(t => {
        if (t.id !== teamId) return t;
        const newRoles = [...t.roles];
        const [moved] = newRoles.splice(sourceIndex, 1);
        newRoles.splice(destIndex, 0, moved);
        api.reorderRoles(teamId, newRoles.map(r => r.id)).catch(() => {});
        return { ...t, roles: newRoles };
      })
    );
  };

  // Person Actions
  const addPerson = async (
    name: string, 
    type: PersonType, 
    priority: PriorityLevel = 0, 
    phone?: string, 
    notes?: string
  ) => {
    const tempId = `p-${Date.now()}`;
    const newPerson: Person = {
      id: tempId,
      name: name.trim(),
      type,
      priority,
      phone: phone?.trim(),
      notes: notes?.trim(),
      createdAt: new Date().toISOString(),
    };
    setPeople(prev => [newPerson, ...prev]);

    try {
      await api.createPerson(name, type, priority, phone, notes, tempId);
    } catch (err) {
      console.warn('API createPerson sync error', err);
    }
  };

  const updatePerson = async (personId: string, updates: Partial<Person>) => {
    setPeople(prev => prev.map(p => (p.id === personId ? { ...p, ...updates } : p)));
    try {
      await api.updatePerson(personId, updates);
    } catch (err) {
      console.warn('API updatePerson sync error', err);
    }
  };

  const deletePerson = async (personId: string) => {
    if (window.confirm('Tem certeza que deseja remover esta pessoa do cadastro?')) {
      setTeams(prev =>
        prev.map(t => ({
          ...t,
          roles: t.roles.map(r => ({
            ...r,
            assignedPersonIds: r.assignedPersonIds.filter(id => id !== personId),
          })),
        }))
      );
      setPeople(prev => prev.filter(p => p.id !== personId));
      try {
        await api.deletePerson(personId);
      } catch (err) {
        console.warn('API deletePerson sync error', err);
      }
    }
  };

  // Allocation Actions
  const assignPersonToRole = async (personId: string, targetTeamId: string, targetRoleId: string) => {
    setTeams(prev =>
      prev.map(team => {
        if (team.id !== targetTeamId) return team;
        return {
          ...team,
          roles: team.roles.map(role => {
            if (role.id !== targetRoleId) return role;
            if (role.assignedPersonIds.includes(personId)) return role;
            if (role.maxSpots && role.assignedPersonIds.length >= role.maxSpots) {
              alert(`Esta função já atingiu o limite de ${role.maxSpots} vaga(s)!`);
              return role;
            }
            return {
              ...role,
              assignedPersonIds: [...role.assignedPersonIds, personId],
            };
          }),
        };
      })
    );

    try {
      await api.assignPerson(personId, targetRoleId);
    } catch (err) {
      console.warn('API assignPerson sync error', err);
    }
  };

  const removePersonFromRole = async (personId: string, teamId: string, roleId: string) => {
    setTeams(prev =>
      prev.map(team => {
        if (team.id !== teamId) return team;
        return {
          ...team,
          roles: team.roles.map(role => {
            if (role.id !== roleId) return role;
            return {
              ...role,
              assignedPersonIds: role.assignedPersonIds.filter(id => id !== personId),
            };
          }),
        };
      })
    );

    try {
      await api.removePerson(personId, roleId);
    } catch (err) {
      console.warn('API removePerson sync error', err);
    }
  };

  const movePersonBetweenRoles = async (
    personId: string,
    sourceTeamId: string,
    sourceRoleId: string,
    targetTeamId: string,
    targetRoleId: string
  ) => {
    if (sourceTeamId === targetTeamId && sourceRoleId === targetRoleId) return;

    setTeams(prev => {
      let tempTeams = prev.map(team => {
        if (team.id !== sourceTeamId) return team;
        return {
          ...team,
          roles: team.roles.map(role => {
            if (role.id !== sourceRoleId) return role;
            return {
              ...role,
              assignedPersonIds: role.assignedPersonIds.filter(id => id !== personId),
            };
          }),
        };
      });

      tempTeams = tempTeams.map(team => {
        if (team.id !== targetTeamId) return team;
        return {
          ...team,
          roles: team.roles.map(role => {
            if (role.id !== targetRoleId) return role;
            if (role.assignedPersonIds.includes(personId)) return role;
            if (role.maxSpots && role.assignedPersonIds.length >= role.maxSpots) {
              alert(`A função de destino já atingiu o limite de ${role.maxSpots} vaga(s)!`);
              return role;
            }
            return {
              ...role,
              assignedPersonIds: [...role.assignedPersonIds, personId],
            };
          }),
        };
      });

      return tempTeams;
    });

    try {
      await api.movePerson(personId, sourceRoleId, targetRoleId);
    } catch (err) {
      console.warn('API movePerson sync error', err);
    }
  };

  // Helper lookups
  const allocationsMap = useMemo(() => {
    const map = new Map<string, Array<{ team: Team; role: Role }>>();
    teams.forEach(t => {
      t.roles.forEach(r => {
        r.assignedPersonIds.forEach(pid => {
          const list = map.get(pid) || [];
          list.push({ team: t, role: r });
          map.set(pid, list);
        });
      });
    });
    return map;
  }, [teams]);

  const getPersonAllocations = (personId: string) => {
    return allocationsMap.get(personId) || [];
  };

  const isPersonAllocated = (personId: string) => {
    return (allocationsMap.get(personId)?.length || 0) > 0;
  };

  const resetToDefaults = async () => {
    if (window.confirm('Atenção: Isso redefinirá todos os dados para o modelo demonstrativo inicial do JUSC. Deseja continuar?')) {
      setTeams(INITIAL_TEAMS);
      setPeople(INITIAL_PEOPLE);
      try {
        await api.resetToDefaults();
      } catch (err) {
        console.warn('API reset sync error', err);
      }
    }
  };

  const exportBackupJson = () => {
    const backupData = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      teams,
      people,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jusc-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackupJson = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.teams && Array.isArray(parsed.teams) && parsed.people && Array.isArray(parsed.people)) {
        setTeams(parsed.teams);
        setPeople(parsed.people);
        if (parsed.events && Array.isArray(parsed.events)) {
          setEvents(parsed.events);
          if (parsed.events.length > 0) setCurrentEvent(parsed.events[0]);
        }
        api.restoreBackup(parsed).catch(err => console.warn('API restoreBackup sync error', err));
        alert('Backup importado com sucesso!');
        return true;
      } else {
        alert('Formato de arquivo inválido. Verifique o arquivo JSON.');
        return false;
      }
    } catch {
      alert('Erro ao processar arquivo JSON.');
      return false;
    }
  };

  const exportPDF = () => exportTeamsToPDF(teams, people, currentEvent);
  const exportExcel = () => exportTeamsToExcel(teams, people, currentEvent);
  const exportPeoplePDF = () => exportPeopleToPDF(people, teams, currentEvent);
  const exportPeopleExcel = () => exportPeopleToExcel(people, teams, currentEvent);

  return (
    <TeamContext.Provider
      value={{
        events,
        currentEvent,
        selectEvent,
        addEvent,
        updateEvent,
        deleteEvent,
        teams,
        people,
        currentUser,
        isAuthenticated: !!currentUser,
        logout,
        openLoginModal: () => setIsLoginModalOpen(true),
        peopleSearch,
        setPeopleSearch,
        personTypeFilter,
        setPersonTypeFilter,
        personAllocationFilter,
        setPersonAllocationFilter,
        personPriorityFilter,
        setPersonPriorityFilter,
        teamSearch,
        setTeamSearch,
        teamStatusFilter,
        setTeamStatusFilter,
        addTeam,
        updateTeam,
        deleteTeam,
        moveTeam,
        reorderTeams,
        addRole,
        updateRole,
        deleteRole,
        moveRole,
        reorderRoles,
        addPerson,
        updatePerson,
        deletePerson,
        assignPersonToRole,
        removePersonFromRole,
        movePersonBetweenRoles,
        getPersonAllocations,
        isPersonAllocated,
        resetToDefaults,
        exportBackupJson,
        importBackupJson,
        exportPDF,
        exportExcel,
        exportPeoplePDF,
        exportPeopleExcel,
      }}
    >
      {children}
      <LoginModal
        isOpen={isLoginModalOpen}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsLoginModalOpen(false);
        }}
      />
    </TeamContext.Provider>
  );
};

export const useTeams = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeams deve ser usado dentro de um TeamProvider');
  }
  return context;
};
