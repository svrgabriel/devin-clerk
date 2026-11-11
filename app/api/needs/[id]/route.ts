import { db } from "@/lib/db";
import { apiProfile } from "@/lib/profile";

async function ownedNeed(req: Request, idParam: string) {
  const result = await apiProfile();
  if (result instanceof Response) return result;
  const { userId, role } = result;
  if (role !== "instituicao") {
    return Response.json(
      { error: "Apenas instituições editam necessidades." },
      { status: 403 },
    );
  }
  const id = Number(idParam);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "ID inválido." }, { status: 400 });
  }
  const sql = await db();
  const [need] = await sql`
    SELECT n.id FROM needs n
    JOIN institutions i ON i.id = n.institution_id
    WHERE n.id = ${id} AND i.clerk_user_id = ${userId}
  `;
  if (!need) {
    return Response.json({ error: "Necessidade não encontrada." }, { status: 404 });
  }
  return { sql, id };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ctx = await ownedNeed(req, id);
  if (ctx instanceof Response) return ctx;

  const { item, priority } = (await req.json()) as {
    item?: string;
    priority?: string;
  };
  if (!item?.trim() || !["urgente", "alta", "normal"].includes(priority ?? "")) {
    return Response.json({ error: "Dados inválidos" }, { status: 400 });
  }
  await ctx.sql`
    UPDATE needs SET item = ${item.trim()}, priority = ${priority!}
    WHERE id = ${ctx.id}
  `;
  return Response.json({ ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ctx = await ownedNeed(req, id);
  if (ctx instanceof Response) return ctx;
  await ctx.sql`DELETE FROM needs WHERE id = ${ctx.id}`;
  return Response.json({ ok: true });
}
