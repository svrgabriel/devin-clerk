import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

let schemaReady: Promise<void> | null = null;

async function init() {
  await sql`
    CREATE TABLE IF NOT EXISTS institutions (
      id SERIAL PRIMARY KEY,
      clerk_user_id TEXT,
      name TEXT NOT NULL,
      cause TEXT NOT NULL,
      city TEXT NOT NULL,
      cnpj TEXT
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS institutions_owner_key
    ON institutions (clerk_user_id) WHERE clerk_user_id IS NOT NULL
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS needs (
      id SERIAL PRIMARY KEY,
      institution_id INT REFERENCES institutions(id) ON DELETE CASCADE,
      item TEXT NOT NULL,
      priority TEXT NOT NULL CHECK (priority IN ('urgente','alta','normal'))
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      donor_user_id TEXT NOT NULL,
      institution_id INT REFERENCES institutions(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (donor_user_id, institution_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
      sender_user_id TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  // Seed demo institutions once so the feed has content.
  const [{ count }] = await sql`SELECT count(*)::int FROM institutions`;
  if (count === 0) {
    const { appConfig } = await import("@/app.config");
    for (const inst of appConfig.institutions) {
      const [row] = await sql`
        INSERT INTO institutions (name, cause, city)
        VALUES (${inst.name}, ${inst.cause}, ${inst.city})
        RETURNING id
      `;
      for (const need of inst.needs) {
        await sql`
          INSERT INTO needs (institution_id, item, priority)
          VALUES (${row.id}, ${need.item}, ${need.priority})
        `;
      }
    }
  }
}

/** Returns the client only after schema setup has finished. */
export async function db() {
  if (!schemaReady) {
    schemaReady = init().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
  return sql;
}
