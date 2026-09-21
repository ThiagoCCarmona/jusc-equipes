import type { Team, Person, PersonType, PriorityLevel } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('jusc_auth_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('jusc_auth_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('jusc_auth_token');
  localStorage.removeItem('jusc_auth_user');
}

export function getSavedUser() {
  try {
    const u = localStorage.getItem('jusc_auth_user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

export function setSavedUser(user: any) {
  localStorage.setItem('jusc_auth_user', JSON.stringify(user));
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized, clear token
    removeAuthToken();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Erro de comunicação com o servidor' }));
    throw new Error(errorData.error || `Erro ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const data = await request<{ token: string; user: { id: string; email: string; name: string; role: string } }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    setAuthToken(data.token);
    setSavedUser(data.user);
    return data;
  },

  async getMe() {
    return request<{ user: { id: string; email: string; name: string; role: string } }>('/auth/me');
  },

  logout() {
    removeAuthToken();
  },

  // Teams
  async getTeams(): Promise<Team[]> {
    return request<Team[]>('/teams');
  },

  async createTeam(name: string, description: string, colorAccent: string): Promise<Team> {
    return request<Team>('/teams', {
      method: 'POST',
      body: JSON.stringify({ name, description, colorAccent }),
    });
  },

  async updateTeam(id: string, data: Partial<Team>): Promise<void> {
    return request<void>(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTeam(id: string): Promise<void> {
    return request<void>(`/teams/${id}`, {
      method: 'DELETE',
    });
  },

  async reorderTeams(teamIds: string[]): Promise<void> {
    return request<void>('/teams/reorder', {
      method: 'POST',
      body: JSON.stringify({ teamIds }),
    });
  },

  // Roles
  async createRole(teamId: string, title: string, description: string, maxSpots?: number): Promise<any> {
    return request<any>(`/teams/${teamId}/roles`, {
      method: 'POST',
      body: JSON.stringify({ title, description, maxSpots }),
    });
  },

  async updateRole(teamId: string, roleId: string, data: any): Promise<void> {
    return request<void>(`/teams/${teamId}/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteRole(teamId: string, roleId: string): Promise<void> {
    return request<void>(`/teams/${teamId}/roles/${roleId}`, {
      method: 'DELETE',
    });
  },

  async reorderRoles(teamId: string, roleIds: string[]): Promise<void> {
    return request<void>(`/teams/${teamId}/roles/reorder`, {
      method: 'POST',
      body: JSON.stringify({ roleIds }),
    });
  },

  // People
  async getPeople(): Promise<Person[]> {
    return request<Person[]>('/people');
  },

  async createPerson(name: string, type: PersonType, priority: PriorityLevel, phone?: string, notes?: string): Promise<Person> {
    return request<Person>('/people', {
      method: 'POST',
      body: JSON.stringify({ name, type, priority, phone, notes }),
    });
  },

  async updatePerson(id: string, data: Partial<Person>): Promise<void> {
    return request<void>(`/people/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletePerson(id: string): Promise<void> {
    return request<void>(`/people/${id}`, {
      method: 'DELETE',
    });
  },

  // Allocations
  async assignPerson(personId: string, roleId: string): Promise<void> {
    return request<void>('/allocations/assign', {
      method: 'POST',
      body: JSON.stringify({ personId, roleId }),
    });
  },

  async removePerson(personId: string, roleId: string): Promise<void> {
    return request<void>('/allocations/remove', {
      method: 'POST',
      body: JSON.stringify({ personId, roleId }),
    });
  },

  async movePerson(personId: string, sourceRoleId: string, targetRoleId: string): Promise<void> {
    return request<void>('/allocations/move', {
      method: 'POST',
      body: JSON.stringify({ personId, sourceRoleId, targetRoleId }),
    });
  },

  // Backup & Reset
  async resetToDefaults(): Promise<void> {
    return request<void>('/backup/reset', {
      method: 'POST',
    });
  },
};
