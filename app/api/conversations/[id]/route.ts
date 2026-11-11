import { db } from "@/lib/db";
import { apiProfile } from "@/lib/profile";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await apiProfile();
  if (result instanceof Response) return result;
  const { userId, role } = result;
  if (role !== "instituicao") {
    return Response.json(
      { error: "Apenas a instituição pode bloquear." },
      { status: 403 },
    );
  }
  const { id } = await params;
  const { blocked } = (await req.json()) as { blocked?: boolean };
  if (typeof blocked !== "boolean") {
    return Response.json({ error: "blocked inválido" }, { status: 400 });
  }
  const sql = await db();
  const [updated] = await sql`
    UPDATE conversations c SET blocked = ${blocked}
    FROM institutions i
    WHERE c.id = ${Number(id)} AND c.institution_id = i.id
      AND i.clerk_user_id = ${userId}
    RETURNING c.id
  `;
  if (!updated) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}
