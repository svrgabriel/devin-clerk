import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { apiProfile } from "@/lib/profile";

const METHODS = new Set(["pix", "cartao", "dinheiro", "outro"]);

export async function POST(request: Request) {
  const profile = await apiProfile();
  if (profile instanceof Response) return profile;
  if (profile.role !== "doador") {
    return Response.json(
      { error: "Apenas doadores registram doações." },
      { status: 403 },
    );
  }

  const { institutionId, amount, method } = await request.json();
  const amountCents = Math.round(Number(amount) * 100);
  if (!Number.isInteger(institutionId) || !Number.isFinite(amountCents) || amountCents <= 0) {
    return Response.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const payMethod = METHODS.has(method) ? method : "pix";

  const sql = await db();
  const [institution] = await sql`
    SELECT id FROM institutions WHERE id = ${institutionId}
  `;
  if (!institution) {
    return Response.json({ error: "Instituição não encontrada." }, { status: 404 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(profile.userId);
  const donorName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.emailAddresses[0]?.emailAddress?.split("@")[0] ||
    "Doador";

  await sql`
    INSERT INTO donations (donor_user_id, donor_name, institution_id, amount_cents, method)
    VALUES (${profile.userId}, ${donorName}, ${institutionId}, ${amountCents}, ${payMethod})
  `;
  return Response.json({ ok: true });
}
