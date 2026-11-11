import { db } from "@/lib/db";
import { apiProfile } from "@/lib/profile";

export async function POST(req: Request) {
  const result = await apiProfile();
  if (result instanceof Response) return result;
  const { userId, role } = result;
  if (role !== "instituicao") {
    return Response.json(
      { error: "Apenas instituições registram entregas presenciais." },
      { status: 403 },
    );
  }

  const { donorName, donorId, item } = (await req.json()) as {
    donorName?: string;
    donorId?: string;
    item?: string;
  };
  if (!donorName?.trim() || !donorId?.trim() || !item?.trim()) {
    return Response.json({ error: "Dados incompletos." }, { status: 400 });
  }

  const sql = await db();
  const [institution] = await sql`
    SELECT id FROM institutions WHERE clerk_user_id = ${userId}
  `;
  if (!institution) {
    return Response.json({ error: "Instituição não encontrada." }, { status: 404 });
  }
  await sql`
    INSERT INTO in_person_donations (institution_id, donor_name, donor_user_id, item)
    VALUES (${institution.id}, ${donorName.trim()}, ${donorId.trim()}, ${item.trim()})
  `;
  return Response.json({ ok: true });
}
