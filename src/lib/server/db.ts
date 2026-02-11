import { env } from "$env/dynamic/private";
import { Database } from "bun:sqlite";

interface SessionWithUser {
  // Session fields
  id: number;
  user_id: number;
  session_token: string;
  expires_at: string;
  created_at: string;

  // User fields (from join)
  github_id: string;
  github_username: string;
  github_email: string | null;
  github_access_token: string;
  github_refresh_token: string | null;
  avatar_url: string | null;
  last_login_at: string | null;
}

export interface UserRecord {
  id: number;
  github_id: string;
  github_username: string;
  github_email: string | null;
  github_access_token: string;
  github_refresh_token: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface TenantRecord {
  id: number;
  user_id: number;
  domain: string;
  email: string;
  brand_name: string | null;
  github_repo: string | null;
  aws_ses_verified: boolean;
  aws_ses_token: string | null;
  stalwart_user_created: boolean;
  stalwart_username: string | null;
  stalwart_password: string | null;
  k8s_ingress_created: boolean;
  cloudflare_dns_records: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

const DB_PATH = env.DB_PATH || "visitors.sqlite";
let db: Database;

try {
  db = new Database(DB_PATH, { create: true });
  console.log(`✅ Using bun:sqlite driver at ${DB_PATH}`);

  const query = `
    CREATE TABLE IF NOT EXISTS visitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT,
      user_agent TEXT,
      path TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.run(query);

  // Tenants table for multi-tenant onboarding
  const tenantsQuery = `
    CREATE TABLE IF NOT EXISTS tenants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      domain TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      brand_name TEXT,
      github_repo TEXT,
      aws_ses_verified BOOLEAN DEFAULT FALSE,
      aws_ses_token TEXT,
      stalwart_user_created BOOLEAN DEFAULT FALSE,
      stalwart_username TEXT,
      stalwart_password TEXT,
      k8s_ingress_created BOOLEAN DEFAULT FALSE,
      cloudflare_dns_records TEXT,
      status TEXT DEFAULT 'pending',
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `;
  db.run(tenantsQuery);

  // Users table for GitHub OAuth
  const usersQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      github_id TEXT UNIQUE NOT NULL,
      github_username TEXT NOT NULL,
      github_email TEXT,
      github_access_token TEXT NOT NULL,
      github_refresh_token TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login_at DATETIME
    )
  `;
  db.run(usersQuery);

  // Sessions table for managing user sessions
  const sessionsQuery = `
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
  db.run(sessionsQuery);
} catch (error) {
  console.error(`❌ Failed to initialize bun:sqlite at ${DB_PATH}:`, error);
}

// Optimized writer
export async function logVisitor(ip: string, userAgent: string, path: string) {
  if (!db) return;

  try {
    const insertStmt = db.prepare(`
      INSERT INTO visitors (ip, user_agent, path, timestamp)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `);

    insertStmt.run(ip, userAgent, path);
  } catch (error) {
    console.error("Failed to log visitor:", error);
  }
}

// Admin Helper
export async function executeQuery(sql: string, params: any[] = []) {
  if (!db) {
    console.warn("executeQuery called but DB is not initialized");
    return [];
  }

  const stmt = db.prepare(sql);

  if (sql.trim().toUpperCase().startsWith("SELECT")) {
    return stmt.all(...params);
  } else {
    return stmt.run(...params);
  }
}

// Tenant Helpers
export async function createTenant(
  userId: number,
  domain: string,
  email: string,
  brandName: string,
): Promise<TenantRecord | null> {
  if (!db) return null;

  try {
    const stmt = db.prepare(`
      INSERT INTO tenants (user_id, domain, email, brand_name, status)
      VALUES (?, ?, ?, ?, 'pending')
      ON CONFLICT(domain) DO UPDATE SET
        email = excluded.email,
        brand_name = excluded.brand_name,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `);

    const result = stmt.get(userId, domain, email, brandName);
    return result as TenantRecord | null;
  } catch (error) {
    console.error("Failed to create tenant:", error);
    return null;
  }
}

export async function getTenantByDomain(
  domain: string,
): Promise<TenantRecord | null> {
  if (!db) return null;

  try {
    const stmt = db.prepare(`SELECT * FROM tenants WHERE domain = ?`);
    const result = stmt.get(domain);
    return result as TenantRecord | null;
  } catch (error) {
    console.error("Failed to get tenant:", error);
    return null;
  }
}

export async function updateTenantStatus(
  domain: string,
  status: string,
  updates: Record<string, any> = {},
): Promise<TenantRecord | null> {
  if (!db) return null;

  try {
    const setClause = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");

    const stmt = db.prepare(`
      UPDATE tenants
      SET status = ?, ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE domain = ?
      RETURNING *
    `);

    const result = stmt.get(status, ...Object.values(updates), domain);
    return result as TenantRecord | null;
  } catch (error) {
    console.error("Failed to update tenant:", error);
    return null;
  }
}

export async function getAllTenants() {
  if (!db) return [];

  try {
    const stmt = db.prepare(`SELECT * FROM tenants ORDER BY created_at DESC`);
    return stmt.all();
  } catch (error) {
    console.error("Failed to get tenants:", error);
    return [];
  }
}

export async function getTenantsByUserId(userId: number) {
  if (!db) return [];

  try {
    const stmt = db.prepare(
      `SELECT * FROM tenants WHERE user_id = ? ORDER BY created_at DESC`,
    );
    return stmt.all(userId);
  } catch (error) {
    console.error("Failed to get tenants by user:", error);
    return [];
  }
}

// User Helpers
export async function createOrUpdateUser(
  githubId: string,
  githubUsername: string,
  githubEmail: string | null,
  githubAccessToken: string,
  githubRefreshToken: string | null,
  avatarUrl: string | null,
): Promise<UserRecord | null> {
  if (!db) return null;

  try {
    const stmt = db.prepare(`
      INSERT INTO users (github_id, github_username, github_email, github_access_token, github_refresh_token, avatar_url, last_login_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(github_id) DO UPDATE SET
        github_username = excluded.github_username,
        github_email = excluded.github_email,
        github_access_token = excluded.github_access_token,
        github_refresh_token = excluded.github_refresh_token,
        avatar_url = excluded.avatar_url,
        last_login_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `);

    const result = stmt.get(
      githubId,
      githubUsername,
      githubEmail,
      githubAccessToken,
      githubRefreshToken,
      avatarUrl,
    );
    return result as UserRecord | null;
  } catch (error) {
    console.error("Failed to create/update user:", error);
    return null;
  }
}

export async function getUserById(id: number): Promise<UserRecord | null> {
  if (!db) return null;

  try {
    const stmt = db.prepare(`SELECT * FROM users WHERE id = ?`);
    const result = stmt.get(id);
    return result as UserRecord | null;
  } catch (error) {
    console.error("Failed to get user:", error);
    return null;
  }
}

export async function getUserByGithubId(githubId: string) {
  if (!db) return null;

  try {
    const stmt = db.prepare(`SELECT * FROM users WHERE github_id = ?`);
    return stmt.get(githubId);
  } catch (error) {
    console.error("Failed to get user by GitHub ID:", error);
    return null;
  }
}

// Session Helpers
export async function createSession(
  userId: number,
  sessionToken: string,
  expiresAt: Date,
) {
  if (!db) return null;

  try {
    const stmt = db.prepare(`
      INSERT INTO sessions (user_id, session_token, expires_at)
      VALUES (?, ?, ?)
      RETURNING *
    `);

    return stmt.get(userId, sessionToken, expiresAt.toISOString());
  } catch (error) {
    console.error("Failed to create session:", error);
    return null;
  }
}

export async function getSessionByToken(
  sessionToken: string,
): Promise<SessionWithUser | null> {
  if (!db) return null;

  try {
    const stmt = db.prepare(`
      SELECT s.*, u.* 
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = ? AND s.expires_at > datetime('now')
    `);
    const result = stmt.get(sessionToken);
    return result as SessionWithUser | null;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}

export async function deleteSession(sessionToken: string) {
  if (!db) return false;

  try {
    const stmt = db.prepare(`DELETE FROM sessions WHERE session_token = ?`);
    stmt.run(sessionToken);
    return true;
  } catch (error) {
    console.error("Failed to delete session:", error);
    return false;
  }
}

export async function cleanupExpiredSessions() {
  if (!db) return;

  try {
    const stmt = db.prepare(
      `DELETE FROM sessions WHERE expires_at < datetime('now')`,
    );
    stmt.run();
  } catch (error) {
    console.error("Failed to cleanup sessions:", error);
  }
}
