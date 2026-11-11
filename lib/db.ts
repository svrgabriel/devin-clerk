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
      cnpj TEXT,
      pix_key TEXT,
      lat DOUBLE PRECISION,
      lng DOUBLE PRECISION
    )
  `;
  await sql`ALTER TABLE institutions ADD COLUMN IF NOT EXISTS pix_key TEXT`;
  await sql`ALTER TABLE institutions ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION`;
  await sql`ALTER TABLE institutions ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION`;
  await sql`ALTER TABLE institutions ADD COLUMN IF NOT EXISTS address TEXT`;
  await sql`ALTER TABLE institutions ADD COLUMN IF NOT EXISTS hours TEXT`;
  await sql`ALTER TABLE institutions ADD COLUMN IF NOT EXISTS story TEXT`;
  await sql`ALTER TABLE institutions ADD COLUMN IF NOT EXISTS instagram TEXT`;
  await sql`ALTER TABLE institutions ADD COLUMN IF NOT EXISTS facebook TEXT`;
  await sql`ALTER TABLE institutions ADD COLUMN IF NOT EXISTS website TEXT`;
  await sql`ALTER TABLE institutions ADD COLUMN IF NOT EXISTS photos TEXT`;
  await sql`
    DELETE FROM institutions a
    USING institutions b
    WHERE a.clerk_user_id = b.clerk_user_id
      AND a.clerk_user_id IS NOT NULL
      AND a.id > b.id
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
  await sql`
    CREATE TABLE IF NOT EXISTS donor_profiles (
      clerk_user_id TEXT PRIMARY KEY,
      description TEXT,
      instagram TEXT,
      facebook TEXT,
      website TEXT,
      photo_url TEXT
    )
  `;
  await sql`ALTER TABLE donor_profiles ADD COLUMN IF NOT EXISTS photo_url TEXT`;
  await sql`ALTER TABLE institutions ADD COLUMN IF NOT EXISTS accepts_messages BOOLEAN NOT NULL DEFAULT true`;
  await sql`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS donor_last_read_at TIMESTAMPTZ NOT NULL DEFAULT now()`;
  await sql`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS inst_last_read_at TIMESTAMPTZ NOT NULL DEFAULT now()`;
  await sql`
    CREATE TABLE IF NOT EXISTS donations (
      id SERIAL PRIMARY KEY,
      donor_user_id TEXT NOT NULL,
      institution_id INT REFERENCES institutions(id) ON DELETE CASCADE,
      amount_cents INT NOT NULL CHECK (amount_cents > 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  // Seed demo institutions once so the feed has content.
  const { appConfig } = await import("@/app.config");
  for (const inst of appConfig.institutions) {
    await sql`
      UPDATE institutions
      SET lat = COALESCE(lat, ${inst.lat ?? null}),
          lng = COALESCE(lng, ${inst.lng ?? null}),
          pix_key = COALESCE(pix_key, ${inst.pixKey ?? null}),
          address = COALESCE(address, ${inst.address ?? null}),
          hours = COALESCE(hours, ${inst.hours ?? null}),
          story = COALESCE(story, ${inst.story ?? null})
      WHERE name = ${inst.name} AND clerk_user_id IS NULL
    `;
  }
  const [{ count }] = await sql`SELECT count(*)::int FROM institutions`;
  if (count === 0) {
    for (const inst of appConfig.institutions) {
      const [row] = await sql`
        INSERT INTO institutions (name, cause, city, pix_key, address, hours, story, lat, lng)
        VALUES (${inst.name}, ${inst.cause}, ${inst.city}, ${inst.pixKey ?? null}, ${inst.address ?? null}, ${inst.hours ?? null}, ${inst.story ?? null}, ${inst.lat ?? null}, ${inst.lng ?? null})
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
