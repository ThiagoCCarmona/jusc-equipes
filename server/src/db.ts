import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { INITIAL_PEOPLE, INITIAL_TEAMS } from './sampleData';



dotenv.config();

const dataDir = process.env.DATA_DIR || path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'jusc.db');
export const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDb() {
  // Users table for authentication
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      date TEXT,
      location TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      event_id TEXT DEFAULT 'event-1',
      name TEXT NOT NULL,
      description TEXT,
      color_accent TEXT DEFAULT '#FFC700',
      order_index INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      max_spots INTEGER,
      order_index INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS people (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      priority INTEGER DEFAULT 0,
      phone TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS role_assignments (
      role_id TEXT NOT NULL,
      person_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (role_id, person_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE
    );
  `);

  // Seed default admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@jusc.com.br';
  const adminPassword = process.env.ADMIN_PASSWORD || 'jusc2026';
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);

  if (!existingAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(adminPassword, salt);
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('u-admin', adminEmail, hash, 'Administrador JUSC', 'admin', new Date().toISOString());
    console.log(`[Database] Default admin created: ${adminEmail} (password: ${adminPassword})`);
  }

  // Safe migration: check if teams table has event_id column
  const teamCols = db.prepare("PRAGMA table_info(teams)").all() as Array<{ name: string }>;
  if (!teamCols.some(c => c.name === 'event_id')) {
    try {
      db.exec("ALTER TABLE teams ADD COLUMN event_id TEXT DEFAULT 'event-1'");
      console.log('[Database] Migrated teams table: added event_id column');
    } catch (e) {
      console.warn('[Database] Column event_id already present or error', e);
    }
  }

  // Seed default event if empty
  const eventsCount = (db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number }).count;
  if (eventsCount === 0) {
    db.prepare(`
      INSERT INTO events (id, name, description, date, location, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'event-1',
      'Encontro Geral JUSC 2026',
      'Equipes de trabalho e funções oficiais do encontro',
      'Outubro / 2026',
      'Sede JUSC',
      'active',
      new Date().toISOString()
    );
    console.log('[Database] Default event created: Encontro Geral JUSC 2026');
  }

  // Link any orphan teams to event-1
  db.prepare("UPDATE teams SET event_id = 'event-1' WHERE event_id IS NULL OR event_id = ''").run();

  // Seed default teams and people if empty
  const teamsCount = (db.prepare('SELECT COUNT(*) as count FROM teams').get() as { count: number }).count;
  if (teamsCount === 0) {
    console.log('[Database] Seeding initial JUSC teams and people...');
    
    // Seed people
    const insertPerson = db.prepare(`
      INSERT INTO people (id, name, type, priority, phone, notes, created_at)
      VALUES (@id, @name, @type, @priority, @phone, @notes, @createdAt)
    `);

    for (const p of INITIAL_PEOPLE) {
      insertPerson.run({
        id: p.id,
        name: p.name,
        type: p.type,
        priority: p.priority ?? 0,
        phone: p.phone ?? null,
        notes: p.notes ?? null,
        createdAt: p.createdAt || new Date().toISOString(),
      });
    }

    // Seed teams & roles & assignments
    const insertTeam = db.prepare(`
      INSERT INTO teams (id, event_id, name, description, color_accent, order_index, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertRole = db.prepare(`
      INSERT INTO roles (id, team_id, title, description, max_spots, order_index, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertAssignment = db.prepare(`
      INSERT OR IGNORE INTO role_assignments (role_id, person_id, created_at)
      VALUES (?, ?, ?)
    `);

    INITIAL_TEAMS.forEach((t, tIndex) => {
      insertTeam.run(t.id, 'event-1', t.name, t.description, t.colorAccent || '#FFC700', tIndex, new Date().toISOString());
      
      t.roles.forEach((r, rIndex) => {
        insertRole.run(r.id, t.id, r.title, r.description, r.maxSpots || null, rIndex, new Date().toISOString());
        
        r.assignedPersonIds.forEach(pid => {
          insertAssignment.run(r.id, pid, new Date().toISOString());
        });
      });
    });

    console.log('[Database] Seeding complete.');
  }
}
