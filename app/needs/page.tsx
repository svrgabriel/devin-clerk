import Link from "next/link";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/profile";
import { ChatButton } from "./ChatButton";

const priorityOrder: Record<string, number> = {
  urgente: 0,
  alta: 1,
  normal: 2,
};

const priorityStyles: Record<string, string> = {
  urgente: "bg-red-100 text-red-800 border-red-200",
  alta: "bg-amber-100 text-amber-800 border-amber-200",
  normal: "bg-accent/10 text-accent border-accent/20",
};

const priorityLabels: Record<string, string> = {
  urgente: "Urgente",
  alta: "Alta",
  normal: "Normal",
};

export default async function NeedsPage() {
  const { role } = await requireProfile();
  const sql = await db();

  const rows = await sql`
    SELECT i.id AS institution_id, i.name, i.cause, i.city,
           i.clerk_user_id IS NOT NULL AS contactable,
           n.item, n.priority
    FROM institutions i
    LEFT JOIN needs n ON n.institution_id = i.id
    ORDER BY i.name, n.id
  `;

  const institutions = new Map<
    number,
    { name: string; cause: string; city: string; contactable: boolean; needs: { item: string; priority: string }[] }
  >();
  for (const row of rows) {
    if (!institutions.has(row.institution_id)) {
      institutions.set(row.institution_id, {
        name: row.name,
        cause: row.cause,
        city: row.city,
        contactable: row.contactable,
        needs: [],
      });
    }
    if (row.item) {
      institutions.get(row.institution_id)!.needs.push({
        item: row.item,
        priority: row.priority,
      });
    }
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">O que doar agora</h1>
        <p className="text-lg text-black/70">
          Necessidades das instituições, ordenadas por prioridade.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[...institutions.entries()].map(([id, institution]) => {
          const needs = [...institution.needs].sort(
            (a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3),
          );
          return (
            <article
              key={id}
              className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <Link
                    href={`/institutions/${id}`}
                    className="text-lg font-semibold hover:text-accent"
                  >
                    {institution.name}
                  </Link>
                  <p className="text-sm text-black/60">
                    {institution.cause}
                    {institution.city ? ` · ${institution.city}` : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {role === "doador" && institution.contactable && (
                    <ChatButton institutionId={id} />
                  )}
                  <Link
                    href={`/institutions/${id}#entrega`}
                    className="rounded-full border border-black/15 px-3 py-1 text-xs font-medium hover:border-accent/40 hover:text-accent"
                  >
                    Levar ao local
                  </Link>
                </div>
              </div>
              <ul className="flex flex-col gap-2">
                {needs.map((need) => (
                  <li
                    key={need.item}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span>{need.item}</span>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${priorityStyles[need.priority] ?? ""}`}
                    >
                      {priorityLabels[need.priority] ?? need.priority}
                    </span>
                  </li>
                ))}
                {needs.length === 0 && (
                  <li className="text-sm text-black/50">
                    Nenhuma necessidade publicada ainda.
                  </li>
                )}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
