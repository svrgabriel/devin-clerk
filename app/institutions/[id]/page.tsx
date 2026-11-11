import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/profile";
import { ChatButton } from "@/app/needs/ChatButton";

const priorityLabels: Record<string, string> = {
  urgente: "Urgente",
  alta: "Alta",
  normal: "Normal",
};

export default async function InstitutionProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { role } = await requireProfile();
  const { id } = await params;
  const institutionId = Number(id);
  if (!Number.isInteger(institutionId)) notFound();

  const sql = await db();
  const [institution] = await sql`
    SELECT id, name, cause, city, cnpj, pix_key, address, hours, story,
           instagram, facebook, website, photos,
           clerk_user_id IS NOT NULL AS contactable
    FROM institutions WHERE id = ${institutionId}
  `;
  if (!institution) notFound();

  const needs = await sql`
    SELECT item, priority FROM needs
    WHERE institution_id = ${institutionId} ORDER BY id
  `;

  const photos = (institution.photos ?? "")
    .split("\n")
    .map((p: string) => p.trim())
    .filter(Boolean);

  const social = [
    { label: "Instagram", url: institution.instagram },
    { label: "Facebook", url: institution.facebook },
    { label: "Site", url: institution.website },
  ].filter((s) => s.url);

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{institution.name}</h1>
        <p className="text-lg text-black/70">
          {institution.cause}
          {institution.city ? ` · ${institution.city}` : ""}
          {institution.cnpj ? ` · CNPJ ${institution.cnpj}` : ""}
        </p>
        {institution.pix_key && (
          <p className="text-sm text-black/60">
            Chave Pix:{" "}
            <code className="rounded bg-black/5 px-2 py-0.5 font-mono">
              {institution.pix_key}
            </code>
          </p>
        )}
      </div>

      {photos.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {photos.map((src: string) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={`Foto de ${institution.name}`}
              className="h-48 w-full rounded-2xl border border-black/10 object-cover"
            />
          ))}
        </div>
      )}

      {institution.story && (
        <div className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Nossa história</h2>
          <p className="whitespace-pre-line text-sm text-black/80">
            {institution.story}
          </p>
        </div>
      )}

      <div
        id="entrega"
        className="flex flex-col gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-5"
      >
        <h2 className="font-semibold">Entrega no local</h2>
        {institution.address ? (
          <p className="text-sm">
            <span className="font-medium">Endereço:</span> {institution.address}
          </p>
        ) : (
          <p className="text-sm text-black/50">Endereço não informado.</p>
        )}
        {institution.hours ? (
          <p className="text-sm">
            <span className="font-medium">Horário e dias:</span>{" "}
            {institution.hours}
          </p>
        ) : (
          <p className="text-sm text-black/50">
            Horário de funcionamento não informado.
          </p>
        )}
      </div>

      {needs.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Necessidades</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {needs.map((n) => (
              <li key={n.item} className="flex justify-between gap-3">
                <span>{n.item}</span>
                <span className="text-black/50">
                  {priorityLabels[n.priority] ?? n.priority}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {social.length > 0 && (
        <div className="flex flex-wrap gap-3 text-sm">
          {social.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-black/15 px-4 py-1.5 hover:border-accent/40 hover:text-accent"
            >
              {s.label}
            </a>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {role === "doador" && institution.pix_key && (
          <Link
            href={`/donate/${institution.id}`}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Doar em dinheiro
          </Link>
        )}
        {role === "doador" && institution.contactable && (
          <ChatButton institutionId={institution.id} />
        )}
        <Link
          href="/institutions"
          className="rounded-full border border-black/15 px-4 py-2 text-sm hover:border-accent/40"
        >
          Voltar ao catálogo
        </Link>
      </div>
    </section>
  );
}
