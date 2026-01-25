import { env } from "$env/dynamic/private";
import { Database } from "bun:sqlite";

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
