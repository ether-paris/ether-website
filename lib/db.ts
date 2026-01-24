import "server-only";
import { Database } from "bun:sqlite";

const DB_PATH = process.env.DB_PATH || "/data/visitors.sqlite";

// Singleton connection to prevent multiple opens in hot-reload
let db: Database;

try {
  // bun:sqlite is synchronous and fast
  db = new Database(DB_PATH, { create: true });
  console.log(`✅ Using bun:sqlite driver at ${DB_PATH}`);

  // Auto-migrate on startup
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
} catch (error) {
  console.error(`❌ Failed to initialize database at ${DB_PATH}:`, error);
}

// Optimized writer
export function logVisitor(ip: string, userAgent: string, path: string) {
  if (!db) return;

  try {
    // Prepare statement once? In Bun, prepare is fast.
    const insertStmt = db.prepare(`
      INSERT INTO visitors (ip, user_agent, path, timestamp)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `);

    insertStmt.run(ip, userAgent, path);
  } catch (error) {
    console.error("Failed to log visitor:", error);
  }
}

// Admin Helper: Execute raw SQL (For the Admin Console)
export function executeQuery(sql: string, params: any[] = []) {
  if (!db) throw new Error("Database not initialized");

  // Basic safety: Simple statements only
  const stmt = db.prepare(sql);

  // If it's a SELECT, return all. If it's INSERT/UPDATE, run it.
  if (sql.trim().toUpperCase().startsWith("SELECT")) {
    return stmt.all(...params);
  } else {
    return stmt.run(...params);
  }
}
