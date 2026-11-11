import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/profile";
import { MessageForm } from "./MessageForm";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId, role } = await requireProfile();
  const { id } = await params;
  const sql = db();

  const [conv] = await sql`
    SELECT c.id, c.donor_user_id, i.name AS institution_name,
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
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-black/60">Nenhuma mensagem ainda. Diga olá!</p>
        )}
        {messages.map((msg) => {
          const mine = msg.sender_user_id === userId;
          return (
            <div
              key={msg.id}
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                mine
                  ? "self-end bg-accent text-white"
                  : "self-start border border-black/10 bg-white"
              }`}
            >
              {msg.body}
            </div>
          );
        })}
      </div>
      <MessageForm conversationId={conv.id} />
    </section>
  );
}
