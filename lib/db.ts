import { Database } from "bun:sqlite";
import "server-only";

// Use environment variable or default to the PVC mount path
// For local development, you might want to use './visitors.sqlite'
const DB_PATH = process.env.DB_PATH || "/data/visitors.sqlite";

let db: Database;

try {
  db = new Database(DB_PATH, { create: true });

  // Create table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS visitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT,
      user_agent TEXT,
      path TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
} catch (error) {
  console.error(`Failed to initialize database at ${DB_PATH}:`, error);
  // In development, we might not have the /data folder, so we handle it gracefully
  // or let it crash if it's critical.
  // For now, we'll allow the app to start but logging will fail.
}

export function logVisitor(ip: string, userAgent: string, path: string) {
  if (!db) return;

  try {
    const insertStmt = db.prepare(`
      INSERT INTO visitors (ip, user_agent, path, timestamp)
      VALUES ($ip, $user_agent, $path, CURRENT_TIMESTAMP)
    `);

    insertStmt.run({
      $ip: ip,
      $user_agent: userAgent,
      $path: path,
    });
  } catch (error) {
    console.error("Failed to log visitor:", error);
  }
}
