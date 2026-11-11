import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/profile";
import { MessageForm } from "./MessageForm";
import { BlockToggle, MessageList } from "./MessageList";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId, role } = await requireProfile();
  const { id } = await params;
  const sql = await db();

  const [conv] = await sql`
    SELECT c.id, c.donor_user_id, c.blocked, i.name AS institution_name,
           i.clerk_user_id AS institution_owner
    FROM conversations c
    JOIN institutions i ON i.id = c.institution_id
    WHERE c.id = ${Number(id)}
  `;
  const isParticipant =
    conv &&
    (conv.donor_user_id === userId ||
      (role === "instituicao" && conv.institution_owner === userId));
  if (!isParticipant) notFound();

  const messages = await sql`
    SELECT id, sender_user_id, body, created_at
    FROM messages
    WHERE conversation_id = ${conv.id}
    ORDER BY created_at ASC
  `;

  const title =
    role === "doador"
      ? conv.institution_name
      : `Doador ${String(conv.donor_user_id).slice(-6)}`;

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        {role === "instituicao" && (
          <BlockToggle conversationId={conv.id} blocked={conv.blocked} />
        )}
      </div>
      {conv.blocked && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Esta conversa está bloqueada pela instituição.
        </p>
      )}
      <MessageList
        messages={messages.map((m) => ({
          id: m.id,
          sender_user_id: m.sender_user_id,
          body: m.body,
        }))}
        userId={userId}
      />
      {!conv.blocked && <MessageForm conversationId={conv.id} />}
    </section>
  );
}
