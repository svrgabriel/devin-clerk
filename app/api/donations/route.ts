import { db } from "@/lib/db";
import { apiProfile } from "@/lib/profile";

export async function POST(request: Request) {
  const profile = await apiProfile();
  if (profile instanceof Response) return profile;
  if (profile.role !== "doador") {
    return Response.json(
      { error: "Apenas doadores registram doações." },
      { status: 403 },
    );
  }

  const { institutionId, amount } = await request.json();
  const amountCents = Math.round(Number(amount) * 100);
  if (!Number.isInteger(institutionId) || !Number.isFinite(amountCents) || amountCents <= 0) {
    return Response.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const sql = await db();
  const [institution] = await sql`
    SELECT id FROM institutions WHERE id = ${institutionId}
  `;
  if (!institution) {
    return Response.json({ error: "Instituição não encontrada." }, { status: 404 });
  }

  await sql`
    INSERT INTO donations (donor_user_id, institution_id, amount_cents)
    VALUES (${profile.userId}, ${institutionId}, ${amountCents})
  `;
  return Response.json({ ok: true });
}
