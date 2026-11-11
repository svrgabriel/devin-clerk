import { db } from "@/lib/db";
import { apiProfile } from "@/lib/profile";

export async function POST(request: Request) {
  const profile = await apiProfile();
  if (profile instanceof Response) return profile;
  if (profile.role !== "instituicao") {
    return Response.json(
      { error: "Apenas instituições podem editar estes dados." },
      { status: 403 },
    );
  }

  const { pixKey } = await request.json();
  if (typeof pixKey !== "string" || pixKey.length > 140) {
    return Response.json({ error: "Chave Pix inválida." }, { status: 400 });
  }

  const sql = await db();
  await sql`
    UPDATE institutions SET pix_key = ${pixKey.trim() || null}
    WHERE clerk_user_id = ${profile.userId}
  `;
  return Response.json({ ok: true });
}
