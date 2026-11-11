import { db } from "@/lib/db";
import { apiProfile } from "@/lib/profile";

export async function GET() {
  const result = await apiProfile();
  if (result instanceof Response) return result;
  const { userId } = result;
  const sql = await db();

  const [{ count }] = await sql`
    SELECT count(*)::int
    FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    JOIN institutions i ON i.id = c.institution_id
    WHERE m.sender_user_id <> ${userId}
      AND (
        (c.donor_user_id = ${userId} AND m.created_at > c.donor_last_read_at)
        OR (i.clerk_user_id = ${userId} AND m.created_at > c.inst_last_read_at)
      )
  `;
  return Response.json({ count });
}
