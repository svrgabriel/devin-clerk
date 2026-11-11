import { db } from "@/lib/db";
import { apiProfile } from "@/lib/profile";

const FIELDS = [
  "pixKey",
  "address",
  "hours",
  "story",
  "instagram",
  "facebook",
  "website",
  "photos",
  "cause",
  "city",
] as const;

const COLUMN: Record<(typeof FIELDS)[number], string> = {
  pixKey: "pix_key",
  address: "address",
  hours: "hours",
  story: "story",
  instagram: "instagram",
  facebook: "facebook",
  website: "website",
  photos: "photos",
  cause: "cause",
  city: "city",
};

export async function POST(request: Request) {
  const profile = await apiProfile();
  if (profile instanceof Response) return profile;
  if (profile.role !== "instituicao") {
    return Response.json(
      { error: "Apenas instituições podem editar estes dados." },
      { status: 403 },
    );
  }

  const body = await request.json();
  const updates: Record<string, string | null> = {};
  for (const field of FIELDS) {
    const value = body[field];
    if (value !== undefined) {
      if (typeof value !== "string" || value.length > 2000) {
        return Response.json(
          { error: `Campo ${field} inválido.` },
          { status: 400 },
        );
      }
      updates[COLUMN[field]] = value.trim() || null;
    }
  }
  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  const sql = await db();
  await sql`
    UPDATE institutions SET ${sql(updates)}
    WHERE clerk_user_id = ${profile.userId}
  `;
  return Response.json({ ok: true });
}
