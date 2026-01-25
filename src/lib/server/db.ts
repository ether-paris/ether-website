import { env } from "$env/dynamic/private";

let db: any;

const DB_PATH = env.DB_PATH || "visitors.sqlite";

async function init() {
  // Use Bun's native SQLite driver
  // @ts-ignore
  if (typeof Bun !== "undefined") {
    try {
      // @ts-ignore
      const { Database } = await import("bun:sqlite");
      db = new Database(DB_PATH, { create: true });
      console.log(`✅ Using bun:sqlite driver at ${DB_PATH}`);
      return;
    } catch (error) {
      console.error(`❌ Failed to initialize bun:sqlite at ${DB_PATH}:`, error);
      throw new Error(`Bun SQLite initialization failed: ${error}`);
    }
  }

  // Fallback for build time only - will be initialized at runtime
  console.log(`⚠️  Build time detected - DB will be initialized at runtime`);
  return;

  if (db) {
    const query = `
                CREATE TABLE IF NOT EXISTS visitors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip TEXT,
                user_agent TEXT,
                path TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

    // Compatibility layer for run vs prepare
    try {
      if (db.run) {
        db.run(query); // bun
      } else if (db.prepare) {
        db.prepare(query).run(); // better-sqlite3
      }
    } catch (e) {
      console.error("Failed to ensure table exists", e);
    }
  }
}

await init();

// Optimized writer
export function logVisitor(ip: string, userAgent: string, path: string) {
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
export function executeQuery(sql: string, params: any[] = []) {
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
