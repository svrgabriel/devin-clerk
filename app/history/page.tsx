import { db } from "@/lib/db";
import { requireProfile } from "@/lib/profile";

const fmt = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export default async function HistoryPage() {
  const { userId, role } = await requireProfile();
  const sql = await db();

  const donations =
    role === "doador"
      ? await sql`
          SELECT * FROM (
            SELECT 'money' AS kind, d.id, d.amount_cents, NULL AS item, d.created_at, i.name AS institution
            FROM donations d
            JOIN institutions i ON i.id = d.institution_id
            WHERE d.donor_user_id = ${userId}
            UNION ALL
            SELECT 'in_person' AS kind, p.id, NULL AS amount_cents, p.item, p.created_at, i.name AS institution
            FROM in_person_donations p
            JOIN institutions i ON i.id = p.institution_id
            WHERE p.donor_user_id = ${userId}
          ) t
          ORDER BY created_at DESC
        `
      : await sql`
          SELECT 'money' AS kind, d.id, d.amount_cents, NULL AS item, d.created_at, i.name AS institution
          FROM donations d
          JOIN institutions i ON i.id = d.institution_id
          WHERE i.clerk_user_id = ${userId}
          ORDER BY d.created_at DESC
        `;

  const moneyTotal = donations.reduce(
    (acc, d) => acc + (d.amount_cents ?? 0),
    0,
  );
  const hasMoney = donations.some((d) => d.amount_cents != null);

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">
          {role === "doador" ? "Suas doações" : "Doações registradas"}
        </h1>
        <p className="text-lg text-black/70">
          {donations.length > 0
            ? `${donations.length} doaç${donations.length === 1 ? "ão registrada" : "ões registradas"}${hasMoney ? ` · total ${fmt.format(moneyTotal / 100)}` : ""}`
            : "Nenhuma doação registrada ainda."}
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {donations.map((d) => (
          <li
            key={`${d.kind}-${d.id}`}
            className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white px-5 py-4 shadow-sm"
          >
            <div className="flex flex-col">
              <span className="font-medium">
                {d.institution}
                {d.kind === "in_person" ? ` — ${d.item}` : ""}
              </span>
              <span className="text-sm text-black/50">
                {dateFmt.format(new Date(d.created_at))}
                {d.kind === "in_person" ? " · entrega presencial" : ""}
              </span>
            </div>
            {d.amount_cents != null && (
              <span className="font-semibold text-accent">
                {fmt.format(d.amount_cents / 100)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
