import Link from "next/link";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/profile";
import { ChatButton } from "@/app/needs/ChatButton";

const priorityOrder: Record<string, number> = {
  urgente: 0,
  alta: 1,
  normal: 2,
};

export default async function MatchPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string }>;
}) {
  const { role } = await requireProfile();
  const { item } = await searchParams;
  const term = (item ?? "").trim();

  const sql = await db();
  const rows = term
    ? await sql`
        SELECT i.id, i.name, i.cause, i.city, i.pix_key IS NOT NULL AS accepts_pix,
               i.clerk_user_id IS NOT NULL AS contactable,
               n.item, n.priority
        FROM needs n
        JOIN institutions i ON i.id = n.institution_id
        WHERE n.item ILIKE ${"%" + term + "%"}
        ORDER BY i.name
      `
    : [];

  const matches = new Map<
    number,
    {
      name: string;
      cause: string;
      city: string;
      acceptsPix: boolean;
      contactable: boolean;
      needs: { item: string; priority: string }[];
    }
  >();
  for (const row of rows) {
    if (!matches.has(row.id)) {
      matches.set(row.id, {
        name: row.name,
        cause: row.cause,
        city: row.city,
        acceptsPix: row.accepts_pix,
        contactable: row.contactable,
        needs: [],
      });
    }
    matches.get(row.id)!.needs.push({ item: row.item, priority: row.priority });
  }
  const sorted = [...matches.entries()].sort(
    (a, b) =>
      Math.min(...a[1].needs.map((n) => priorityOrder[n.priority] ?? 3)) -
      Math.min(...b[1].needs.map((n) => priorityOrder[n.priority] ?? 3)),
  );

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Combinar doação</h1>
        <p className="text-lg text-black/70">
          Diga o que você quer doar e sugerimos as instituições que mais
          precisam.
        </p>
      </div>

      <form className="flex flex-wrap gap-3" action="/match" method="get">
        <input
          name="item"
          defaultValue={term}
          placeholder="Ex.: fraldas, arroz, ração"
          className="min-w-48 flex-1 rounded-lg border border-black/15 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-full bg-accent px-4 py-2 font-medium text-white transition hover:opacity-90"
        >
          Buscar
        </button>
      </form>

      {term && (
        <div className="grid gap-4 sm:grid-cols-2">
          {sorted.map(([id, inst]) => (
            <article
              key={id}
              className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">{inst.name}</h2>
                <p className="text-sm text-black/60">
                  {inst.cause} · {inst.city}
                </p>
                <ul className="text-sm">
                  {inst.needs.map((n) => (
                    <li key={n.item}>
                      {n.item}{" "}
                      <span className="text-black/50">({n.priority})</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-2">
                {role === "doador" && inst.acceptsPix && (
                  <Link
                    href={`/donate/${id}`}
                    className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Doar em dinheiro
                  </Link>
                )}
                {role === "doador" && inst.contactable && (
                  <ChatButton institutionId={id} />
                )}
              </div>
            </article>
          ))}
          {sorted.length === 0 && (
            <p className="text-sm text-black/50">
              Nenhuma instituição precisa de &ldquo;{term}&rdquo; no momento.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
