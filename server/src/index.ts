import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db, initDb } from './db';
import { authMiddleware, generateToken, AuthRequest } from './auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '15mb' }));

// Initialize DB schema & seed admin/data
initDb();

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    domain: process.env.DOMAIN || 'jusctrabalho.tccodes.com.br'
  });
});

// -----------------------------------------------------------------------------
// AUTH ROUTES
// -----------------------------------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase()) as {
    id: string;
    email: string;
    password_hash: string;
    name: string;
    role: string;
  } | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Credenciais inválidas. Verifique o e-mail e a senha.' });
  }

  const authUser = { id: user.id, email: user.email, name: user.name, role: user.role };
  const token = generateToken(authUser);

  return res.json({ token, user: authUser });
});

app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res) => {
  return res.json({ user: req.user });
});

app.post('/api/auth/change-password', authMiddleware, (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user?.id) as {
    password_hash: string;
  } | undefined;

  if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: 'Senha atual incorreta.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const newHash = bcrypt.hashSync(newPassword, salt);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user?.id);

  return res.json({ success: true, message: 'Senha alterada com sucesso!' });
});

// -----------------------------------------------------------------------------
// TEAMS & ROLES ROUTES
// -----------------------------------------------------------------------------

app.get('/api/teams', (req, res) => {
  const teamsRows = db.prepare('SELECT * FROM teams ORDER BY order_index ASC, created_at ASC').all() as Array<{
    id: string;
    name: string;
    description: string;
    color_accent: string;
    order_index: number;
  }>;

  const rolesRows = db.prepare('SELECT * FROM roles ORDER BY order_index ASC, created_at ASC').all() as Array<{
    id: string;
    team_id: string;
    title: string;
    description: string;
    max_spots: number | null;
    order_index: number;
  }>;

  const assignments = db.prepare('SELECT role_id, person_id FROM role_assignments').all() as Array<{
    role_id: string;
    person_id: string;
  }>;

  const assignmentsMap = new Map<string, string[]>();
  assignments.forEach(a => {
    const list = assignmentsMap.get(a.role_id) || [];
    list.push(a.person_id);
    assignmentsMap.set(a.role_id, list);
  });

  const rolesByTeam = new Map<string, any[]>();
  rolesRows.forEach(r => {
    const list = rolesByTeam.get(r.team_id) || [];
    list.push({
      id: r.id,
      title: r.title,
      description: r.description,
      maxSpots: r.max_spots || undefined,
      assignedPersonIds: assignmentsMap.get(r.id) || [],
    });
    rolesByTeam.set(r.team_id, list);
  });

  const teams = teamsRows.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    colorAccent: t.color_accent,
    roles: rolesByTeam.get(t.id) || [],
  }));

  return res.json(teams);
});

app.post('/api/teams', authMiddleware, (req, res) => {
  const { name, description, colorAccent } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'O nome da equipe é obrigatório.' });
  }

  const id = `t-${Date.now()}`;
  const maxOrder = (db.prepare('SELECT MAX(order_index) as max_order FROM teams').get() as any)?.max_order ?? -1;
  const orderIndex = maxOrder + 1;

  db.prepare(`
    INSERT INTO teams (id, name, description, color_accent, order_index, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, name.trim(), description?.trim() || '', colorAccent || '#FFC700', orderIndex, new Date().toISOString());

  return res.status(201).json({ id, name, description, colorAccent, roles: [] });
});

app.put('/api/teams/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, description, colorAccent } = req.body;

  db.prepare(`
    UPDATE teams SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      color_accent = COALESCE(?, color_accent)
    WHERE id = ?
  `).run(name?.trim(), description?.trim(), colorAccent, id);

  return res.json({ success: true });
});

app.delete('/api/teams/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM teams WHERE id = ?').run(id);
  return res.json({ success: true });
});

app.post('/api/teams/reorder', authMiddleware, (req, res) => {
  const { teamIds } = req.body;
  if (!Array.isArray(teamIds)) return res.status(400).json({ error: 'teamIds deve ser um array' });

  const stmt = db.prepare('UPDATE teams SET order_index = ? WHERE id = ?');
  const updateMany = db.transaction((ids: string[]) => {
    ids.forEach((id, index) => stmt.run(index, id));
  });

  updateMany(teamIds);
  return res.json({ success: true });
});

// Roles
app.post('/api/teams/:teamId/roles', authMiddleware, (req, res) => {
  const { teamId } = req.params;
  const { title, description, maxSpots } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'O título da função é obrigatório.' });

  const id = `r-${Date.now()}`;
  const maxOrder = (db.prepare('SELECT MAX(order_index) as max_order FROM roles WHERE team_id = ?').get(teamId) as any)?.max_order ?? -1;

  db.prepare(`
    INSERT INTO roles (id, team_id, title, description, max_spots, order_index, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, teamId, title.trim(), description?.trim() || '', maxSpots || null, maxOrder + 1, new Date().toISOString());

  return res.status(201).json({ id, title, description, maxSpots, assignedPersonIds: [] });
});

app.put('/api/teams/:teamId/roles/:roleId', authMiddleware, (req, res) => {
  const { roleId } = req.params;
  const { title, description, maxSpots } = req.body;

  db.prepare(`
    UPDATE roles SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      max_spots = ?
    WHERE id = ?
  `).run(title?.trim(), description?.trim(), maxSpots || null, roleId);

  return res.json({ success: true });
});

app.delete('/api/teams/:teamId/roles/:roleId', authMiddleware, (req, res) => {
  const { roleId } = req.params;
  db.prepare('DELETE FROM roles WHERE id = ?').run(roleId);
  return res.json({ success: true });
});

app.post('/api/teams/:teamId/roles/reorder', authMiddleware, (req, res) => {
  const { roleIds } = req.body;
  if (!Array.isArray(roleIds)) return res.status(400).json({ error: 'roleIds deve ser um array' });

  const stmt = db.prepare('UPDATE roles SET order_index = ? WHERE id = ?');
  const updateMany = db.transaction((ids: string[]) => {
    ids.forEach((id, index) => stmt.run(index, id));
  });

  updateMany(roleIds);
  return res.json({ success: true });
});

// -----------------------------------------------------------------------------
// PEOPLE ROUTES
// -----------------------------------------------------------------------------

app.get('/api/people', (req, res) => {
  const people = db.prepare('SELECT * FROM people ORDER BY priority DESC, name ASC').all().map((p: any) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    priority: p.priority ?? 0,
    phone: p.phone || undefined,
    notes: p.notes || undefined,
    createdAt: p.created_at,
  }));

  return res.json(people);
});

app.post('/api/people', authMiddleware, (req, res) => {
  const { name, type, priority, phone, notes } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'O nome é obrigatório.' });

  const id = `p-${Date.now()}`;
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO people (id, name, type, priority, phone, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name.trim(), type || 'Integrantes', priority ?? 0, phone?.trim() || null, notes?.trim() || null, createdAt);

  return res.status(201).json({ id, name, type, priority, phone, notes, createdAt });
});

app.put('/api/people/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, type, priority, phone, notes } = req.body;

  db.prepare(`
    UPDATE people SET
      name = COALESCE(?, name),
      type = COALESCE(?, type),
      priority = COALESCE(?, priority),
      phone = ?,
      notes = ?
    WHERE id = ?
  `).run(name?.trim(), type, priority, phone?.trim() || null, notes?.trim() || null, id);

  return res.json({ success: true });
});

app.delete('/api/people/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM people WHERE id = ?').run(id);
  return res.json({ success: true });
});

// -----------------------------------------------------------------------------
// ALLOCATION ROUTES
// -----------------------------------------------------------------------------

app.post('/api/allocations/assign', authMiddleware, (req, res) => {
  const { personId, roleId } = req.body;
  if (!personId || !roleId) return res.status(400).json({ error: 'personId e roleId são obrigatórios.' });

  // Check role limits
  const role = db.prepare('SELECT max_spots FROM roles WHERE id = ?').get(roleId) as any;
  if (role && role.max_spots) {
    const currentCount = (db.prepare('SELECT COUNT(*) as count FROM role_assignments WHERE role_id = ?').get(roleId) as any).count;
    if (currentCount >= role.max_spots) {
      return res.status(400).json({ error: `Esta função já atingiu o limite de ${role.max_spots} vaga(s).` });
    }
  }

  db.prepare(`
    INSERT OR IGNORE INTO role_assignments (role_id, person_id, created_at)
    VALUES (?, ?, ?)
  `).run(roleId, personId, new Date().toISOString());

  return res.json({ success: true });
});

app.post('/api/allocations/remove', authMiddleware, (req, res) => {
  const { personId, roleId } = req.body;
  db.prepare('DELETE FROM role_assignments WHERE role_id = ? AND person_id = ?').run(roleId, personId);
  return res.json({ success: true });
});

app.post('/api/allocations/move', authMiddleware, (req, res) => {
  const { personId, sourceRoleId, targetRoleId } = req.body;
  if (!personId || !sourceRoleId || !targetRoleId) {
    return res.status(400).json({ error: 'Dados incompletos para mover.' });
  }

  const targetRole = db.prepare('SELECT max_spots FROM roles WHERE id = ?').get(targetRoleId) as any;
  if (targetRole && targetRole.max_spots) {
    const currentCount = (db.prepare('SELECT COUNT(*) as count FROM role_assignments WHERE role_id = ?').get(targetRoleId) as any).count;
    if (currentCount >= targetRole.max_spots) {
      return res.status(400).json({ error: `A função de destino já atingiu o limite de ${targetRole.max_spots} vaga(s).` });
    }
  }

  const moveTx = db.transaction(() => {
    db.prepare('DELETE FROM role_assignments WHERE role_id = ? AND person_id = ?').run(sourceRoleId, personId);
    db.prepare('INSERT OR IGNORE INTO role_assignments (role_id, person_id, created_at) VALUES (?, ?, ?)').run(targetRoleId, personId, new Date().toISOString());
  });

  moveTx();
  return res.json({ success: true });
});

// -----------------------------------------------------------------------------
// BACKUP & RESET ROUTES
// -----------------------------------------------------------------------------

app.get('/api/backup', authMiddleware, (req, res) => {
  const teams = db.prepare('SELECT * FROM teams').all();
  const roles = db.prepare('SELECT * FROM roles').all();
  const people = db.prepare('SELECT * FROM people').all();
  const assignments = db.prepare('SELECT * FROM role_assignments').all();

  return res.json({
    version: '3.0-sql',
    exportedAt: new Date().toISOString(),
    teams,
    roles,
    people,
    assignments,
  });
});

app.post('/api/backup/reset', authMiddleware, (req, res) => {
  const resetTx = db.transaction(() => {
    db.prepare('DELETE FROM role_assignments').run();
    db.prepare('DELETE FROM roles').run();
    db.prepare('DELETE FROM teams').run();
    db.prepare('DELETE FROM people').run();
  });
  resetTx();

  initDb();
  return res.json({ success: true, message: 'Dados restaurados para o padrão JUSC!' });
});

// -----------------------------------------------------------------------------
// STATIC FRONTEND SERVING (For production container)
// -----------------------------------------------------------------------------
const candidateDistPaths = [
  process.env.STATIC_PATH,
  path.join(__dirname, '../../dist'),
  path.join(__dirname, '../public'),
  path.join(__dirname, 'public'),
].filter(Boolean) as string[];

const distPath = candidateDistPaths.find(p => fs.existsSync(p));

if (distPath) {
  console.log(`[JUSC API] Serving static frontend from: ${distPath}`);
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}


// Start Server
app.listen(PORT, () => {
  console.log(`[JUSC API] Server running on http://127.0.0.1:${PORT}`);
  console.log(`[JUSC API] Domain: ${process.env.DOMAIN || 'jusctrabalho.tccodes.com.br'}`);
});
