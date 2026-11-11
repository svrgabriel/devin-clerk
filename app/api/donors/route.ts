import { db } from "@/lib/db";
import { apiProfile } from "@/lib/profile";

export async function POST(request: Request) {
  const profile = await apiProfile();
  if (profile instanceof Response) return profile;
  if (profile.role !== "doador") {
    return Response.json(
      { error: "Apenas doadores podem editar este perfil." },
      { status: 403 },
    );
  }

  const { description, instagram, facebook, website } = await request.json();
  for (const [name, value] of Object.entries({
    description,
    instagram,
    facebook,
    website,
  })) {
    if (value !== undefined && (typeof value !== "string" || value.length > 2000)) {
      return Response.json({ error: `Campo ${name} inválido.` }, { status: 400 });
    }
  }

  const clean = (v?: string) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const sql = await db();
  await sql`
    INSERT INTO donor_profiles (clerk_user_id, description, instagram, facebook, website)
    VALUES (${profile.userId}, ${clean(description)}, ${clean(instagram)}, ${clean(facebook)}, ${clean(website)})
    ON CONFLICT (clerk_user_id) DO UPDATE SET
      description = EXCLUDED.description,
      instagram = EXCLUDED.instagram,
      facebook = EXCLUDED.facebook,
      website = EXCLUDED.website
  `;
  return Response.json({ ok: true });
}
