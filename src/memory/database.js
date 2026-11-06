const Database = require("better-sqlite3");
const path = require("node:path");
const fs = require("node:fs");

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, "capri.sqlite"));

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      first_seen TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_seen TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (guild_id, user_id)
    );
  `);
}

function rememberMember(guildId, userId, displayName) {
  db.prepare(`
    INSERT INTO members (guild_id, user_id, display_name, last_seen)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(guild_id, user_id)
    DO UPDATE SET display_name = excluded.display_name,
                  last_seen = CURRENT_TIMESTAMP
  `).run(guildId, userId, displayName);
}

module.exports = { initDatabase, rememberMember };
