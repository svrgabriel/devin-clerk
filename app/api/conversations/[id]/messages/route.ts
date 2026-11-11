import { db } from "@/lib/db";
import { requireProfile } from "@/lib/profile";

async function participant(sql: ReturnType<typeof db>, conversationId: number, userId: string, role: string) {
  const [conv] = await sql`
    SELECT c.id
    FROM conversations c
    JOIN institutions i ON i.id = c.institution_id
    WHERE c.id = ${conversationId}
      AND (
        c.donor_user_id = ${userId}
        OR (${role} = 'instituicao' AND i.clerk_user_id = ${userId})
      )
  `;
  return conv;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, role } = await requireProfile();
  const { id } = await params;
  const sql = db();

  if (!(await participant(sql, Number(id), userId, role))) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await sql`
    SELECT id, sender_user_id, body, created_at
    FROM messages
    WHERE conversation_id = ${Number(id)}
    ORDER BY created_at ASC
  `;
  return Response.json({ messages });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, role } = await requireProfile();
  const { id } = await params;
  const sql = db();

  if (!(await participant(sql, Number(id), userId, role))) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const { body } = (await req.json()) as { body?: string };
  if (!body?.trim()) {
    return Response.json({ error: "Mensagem vazia" }, { status: 400 });
  }

  const [message] = await sql`
    INSERT INTO messages (conversation_id, sender_user_id, body)
    VALUES (${Number(id)}, ${userId}, ${body.trim()})
    RETURNING id, sender_user_id, body, created_at
  `;
  return Response.json({ message }, { status: 201 });
}
