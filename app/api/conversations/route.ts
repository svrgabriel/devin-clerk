import { db } from "@/lib/db";
import { apiProfile } from "@/lib/profile";

export async function POST(req: Request) {
  const result = await apiProfile();
  if (result instanceof Response) return result;
  const { userId, role } = result;

  if (role !== "doador") {
    return Response.json(
      { error: "Apenas doadores iniciam conversas." },
      { status: 403 },
    );
  }

  const { institution_id } = (await req.json()) as {
    institution_id?: number;
  };
  if (!institution_id) {
    return Response.json(
      { error: "institution_id obrigatório" },
      { status: 400 },
    );
  }

  const sql = await db();
  const [institution] = await sql`
    SELECT id FROM institutions
    WHERE id = ${institution_id} AND clerk_user_id IS NOT NULL
      AND accepts_messages
  `;
  if (!institution) {
    return Response.json(
      { error: "Instituição não encontrada ou não aceita mensagens" },
      { status: 404 },
    );
  }

  const [conversation] = await sql`
    INSERT INTO conversations (donor_user_id, institution_id)
    VALUES (${userId}, ${institution_id})
    ON CONFLICT (donor_user_id, institution_id) DO UPDATE
      SET donor_user_id = EXCLUDED.donor_user_id
    RETURNING id
  `;

  return Response.json({ id: conversation.id });
}
