import { db } from "@/lib/db";
import { apiProfile } from "@/lib/profile";

export async function POST(req: Request) {
  const result = await apiProfile();
  if (result instanceof Response) return result;
  const { userId, role } = result;
  if (role !== "instituicao") {
    return Response.json(
      { error: "Apenas instituições publicam necessidades." },
      { status: 403 },
    );
  }

  const { item, priority } = (await req.json()) as {
    item?: string;
    priority?: string;
  };
  if (!item?.trim() || !["urgente", "alta", "normal"].includes(priority ?? "")) {
    return Response.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const sql = await db();
  const [institution] = await sql`
    SELECT id FROM institutions WHERE clerk_user_id = ${userId}
  `;
  if (!institution) {
    return Response.json(
      { error: "Instituição não encontrada." },
      { status: 404 },
    );
  }

  const [need] = await sql`
    INSERT INTO needs (institution_id, item, priority)
    VALUES (${institution.id}, ${item!.trim()}, ${priority!})
    RETURNING id
  `;
  return Response.json({ id: need.id }, { status: 201 });
}
