// ============================================
// ODOLO - Memory Store
// PostgreSQL for persistent history
// Redis for fast recent-message cache
// Falls back to in-memory if neither configured
// ============================================

interface MemoryMessage {
  role:    "user" | "assistant";
  content: string;
  sender:  string;
  ts?:     number;
}

// Simple in-memory fallback (works without a DB for testing)
const memoryCache = new Map<string, MemoryMessage[]>();

let pgClient:    any = null;
let redisClient: any = null;

export async function initMemory() {
  // Try PostgreSQL
  if (process.env.DATABASE_URL) {
    try {
      const { Client } = await import("pg");
      pgClient = new Client({ connectionString: process.env.DATABASE_URL });
      await pgClient.connect();
      await pgClient.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id         SERIAL PRIMARY KEY,
          chat_id    TEXT NOT NULL,
          role       TEXT NOT NULL,
          content    TEXT NOT NULL,
          sender     TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      console.log("[Memory] PostgreSQL connected");
    } catch (e) {
      console.warn("[Memory] PostgreSQL unavailable, using in-memory fallback");
      pgClient = null;
    }
  }

  // Try Redis
  if (process.env.REDIS_URL) {
    try {
      const { createClient } = await import("redis");
      redisClient = createClient({ url: process.env.REDIS_URL });
      await redisClient.connect();
      console.log("[Memory] Redis connected");
    } catch (e) {
      console.warn("[Memory] Redis unavailable");
      redisClient = null;
    }
  }

  if (!pgClient && !redisClient) {
    console.log("[Memory] Running with in-memory store (messages lost on restart)");
  }
}

export async function saveMessage(chatId: string, msg: MemoryMessage) {
  msg.ts = Date.now();

  // In-memory
  if (!memoryCache.has(chatId)) memoryCache.set(chatId, []);
  const history = memoryCache.get(chatId)!;
  history.push(msg);
  if (history.length > 50) history.shift();

  // PostgreSQL
  if (pgClient) {
    await pgClient.query(
      "INSERT INTO messages (chat_id, role, content, sender) VALUES ($1, $2, $3, $4)",
      [chatId, msg.role, msg.content, msg.sender]
    ).catch(console.error);
  }

  // Redis cache (last 20 messages per chat)
  if (redisClient) {
    const key = `odolo:chat:${chatId}`;
    await redisClient.lPush(key, JSON.stringify(msg));
    await redisClient.lTrim(key, 0, 19);
    await redisClient.expire(key, 60 * 60 * 24 * 7); // 7 days
  }
}

export async function getHistory(chatId: string, limit = 10): Promise<MemoryMessage[]> {
  // Try Redis first (fastest)
  if (redisClient) {
    try {
      const key  = `odolo:chat:${chatId}`;
      const raw  = await redisClient.lRange(key, 0, limit - 1);
      const msgs = raw.map((r: string) => JSON.parse(r)).reverse();
      if (msgs.length) return msgs;
    } catch {}
  }

  // Try PostgreSQL
  if (pgClient) {
    try {
      const res = await pgClient.query(
        "SELECT role, content, sender FROM messages WHERE chat_id=$1 ORDER BY created_at DESC LIMIT $2",
        [chatId, limit]
      );
      return res.rows.reverse();
    } catch {}
  }

  // In-memory fallback
  const history = memoryCache.get(chatId) || [];
  return history.slice(-limit);
}
