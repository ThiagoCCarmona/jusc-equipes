export type PersonType = 
  | 'Coordenação'
  | 'Integrantes'
  | 'Tios'
  | 'PJ'
  | 'Veteranos'
  | 'Voluntários';

export type PriorityLevel = 0 | 1 | 2 | 3;

export interface Person {
  id: string;
  name: string;
  type: PersonType;
  priority: PriorityLevel; // 0 = Padrão, 1 = Baixa, 2 = Média, 3 = Alta
  phone?: string;
  notes?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  date?: string;
  location?: string;
  status?: 'active' | 'archived' | 'planning';
  createdAt: string;
}

export interface Role {
  id: string;
  title: string;
  description: string;
  maxSpots?: number; // undefined or 0 means unlimited
  assignedPersonIds: string[];
}

export interface Team {
  id: string;
  eventId?: string;
  name: string;
  description: string;
  colorAccent?: string;
  roles: Role[];
}

export type AllocationFilterType = 'all' | 'available' | 'assigned';
export type TeamFilterStatus = 'all' | 'open_spots' | 'full';

export interface DragItemData {
  personId?: string;
  teamId?: string;
  roleId?: string;
  sourceTeamId?: string;
  sourceRoleId?: string;
  type?: 'person' | 'team' | 'role';
}
