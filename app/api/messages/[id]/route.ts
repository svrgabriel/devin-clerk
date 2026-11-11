import { db } from "@/lib/db";
import { apiProfile } from "@/lib/profile";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await apiProfile();
  if (result instanceof Response) return result;
  const { userId } = result;
  const { id } = await params;
  const sql = await db();
  const [deleted] = await sql`
    DELETE FROM messages m
    USING conversations c
    LEFT JOIN institutions i ON i.id = c.institution_id
    WHERE m.id = ${Number(id)}
      AND m.conversation_id = c.id
      AND m.sender_user_id = ${userId}
      AND (c.donor_user_id = ${userId} OR i.clerk_user_id = ${userId})
    RETURNING m.id
  `;
  if (!deleted) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}
