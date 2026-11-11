import Link from "next/link";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/profile";
import { ChatButton } from "@/app/needs/ChatButton";

export default async function InstitutionsPage({
  searchParams,
}: {
  searchParams: Promise<{ cause?: string; city?: string }>;
}) {
  const { role } = await requireProfile();
  const { cause, city } = await searchParams;
  const sql = await db();

  const rows = await sql`
    SELECT i.id, i.name, i.cause, i.city, i.pix_key IS NOT NULL AS accepts_pix,
           i.clerk_user_id IS NOT NULL AND i.accepts_messages AS contactable,
           (i.address IS NOT NULL OR i.hours IS NOT NULL) AS has_dropoff,
           count(n.id)::int AS needs_count
    FROM institutions i
    LEFT JOIN needs n ON n.institution_id = i.id
    GROUP BY i.id
    ORDER BY i.name
  `;

  const causes = [...new Set(rows.map((r) => r.cause))].sort();
  const cities = [...new Set(rows.map((r) => r.city))].sort();
  const filtered = rows.filter(
    (r) => (!cause || r.cause === cause) && (!city || r.city === city),
  );

  function filterHref(next: { cause?: string | null; city?: string | null }) {
    const params = new URLSearchParams();
    const c = next.cause === undefined ? cause : (next.cause ?? undefined);
    const ci = next.city === undefined ? city : (next.city ?? undefined);
    if (c) params.set("cause", c);
    if (ci) params.set("city", ci);
    const q = params.toString();
    return q ? `/institutions?${q}` : "/institutions";
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Instituições</h1>
        <p className="text-lg text-black/70">
          Navegue por causa e cidade para encontrar onde sua doação ajuda mais.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-black/60">Causa:</span>
          <Link href={filterHref({ cause: null })} className={`rounded-full border px-3 py-1 ${!cause ? "border-accent bg-accent/10 text-accent" : "border-black/15"}`}>
            Todas
          </Link>
          {causes.map((c) => (
            <Link key={c} href={filterHref({ cause: c === cause ? null : c })} className={`rounded-full border px-3 py-1 ${cause === c ? "border-accent bg-accent/10 text-accent" : "border-black/15"}`}>
              {c}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-black/60">Cidade:</span>
          <Link href={filterHref({ city: null })} className={`rounded-full border px-3 py-1 ${!city ? "border-accent bg-accent/10 text-accent" : "border-black/15"}`}>
            Todas
          </Link>
          {cities.map((c) => (
            <Link key={c} href={filterHref({ city: c === city ? null : c })} className={`rounded-full border px-3 py-1 ${city === c ? "border-accent bg-accent/10 text-accent" : "border-black/15"}`}>
              {c}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((inst) => (
          <article
            key={inst.id}
            className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-1">
              <Link
                href={`/institutions/${inst.id}`}
                className="text-lg font-semibold hover:text-accent"
              >
                {inst.name}
              </Link>
              <p className="text-sm text-black/60">
                {inst.cause} · {inst.city}
              </p>
              <p className="text-sm text-black/50">
                {inst.needs_count} necessidade{inst.needs_count === 1 ? "" : "s"} publicada{inst.needs_count === 1 ? "" : "s"}
                {inst.accepts_pix ? " · aceita Pix" : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {role === "doador" && inst.accepts_pix && (
                <Link
                  href={`/donate/${inst.id}`}
                  className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Doar em dinheiro
                </Link>
              )}
              {role === "doador" && inst.contactable && (
                <ChatButton institutionId={inst.id} />
              )}
              {inst.has_dropoff && (
                <Link
                  href={`/institutions/${inst.id}#entrega`}
                  className="rounded-full border border-black/15 px-4 py-1.5 text-sm font-medium hover:border-accent/40 hover:text-accent"
                >
                  Levar ao local
                </Link>
              )}
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-black/50">
            Nenhuma instituição encontrada com esses filtros.
          </p>
        )}
      </div>
    </section>
  );
}
