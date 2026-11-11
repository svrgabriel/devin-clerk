import Link from "next/link";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/profile";

export default async function MessagesPage() {
  const { userId, role } = await requireProfile();
  const sql = db();

  const conversations =
    role === "doador"
      ? await sql`
          SELECT c.id, i.name AS other_name, i.city AS other_city,
                 (SELECT body FROM messages m WHERE m.conversation_id = c.id
                  ORDER BY m.created_at DESC LIMIT 1) AS last_message
          FROM conversations c
          JOIN institutions i ON i.id = c.institution_id
          WHERE c.donor_user_id = ${userId}
          ORDER BY c.created_at DESC
        `
      : await sql`
          SELECT c.id, c.donor_user_id AS other_name, '' AS other_city,
                 (SELECT body FROM messages m WHERE m.conversation_id = c.id
                  ORDER BY m.created_at DESC LIMIT 1) AS last_message
          FROM conversations c
          JOIN institutions i ON i.id = c.institution_id
          WHERE i.clerk_user_id = ${userId}
          ORDER BY c.created_at DESC
        `;

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Mensagens</h1>
        <p className="text-lg text-black/70">
          {role === "doador"
            ? "Suas conversas com instituições."
            : "Conversas dos doadores com sua instituição."}
        </p>
      </div>
      {conversations.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center text-black/60">
          {role === "doador" ? (
            <>
              Nenhuma conversa ainda.{" "}
              <Link href="/needs" className="text-accent hover:underline">
                Veja o que as instituições precisam
              </Link>{" "}
              e comece a conversar.
            </>
          ) : (
            "Nenhuma conversa ainda. Quando um doador escrever, aparece aqui."
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {conversations.map((conv) => (
            <li key={conv.id}>
              <Link
                href={`/messages/${conv.id}`}
                className="flex flex-col gap-1 rounded-2xl border border-black/10 bg-white p-4 transition hover:border-accent/40"
              >
                <span className="font-semibold">
                  {role === "doador"
                    ? conv.other_name
                    : `Doador ${String(conv.other_name).slice(-6)}`}
                </span>
                {conv.other_city && (
                  <span className="text-sm text-black/50">{conv.other_city}</span>
                )}
                {conv.last_message && (
                  <span className="truncate text-sm text-black/60">
                    {conv.last_message}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
