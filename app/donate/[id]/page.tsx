import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/profile";
import { DonateForm } from "./DonateForm";

export default async function DonatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { role } = await requireProfile();
  if (role !== "doador") redirect("/dashboard");

  const { id } = await params;
  const institutionId = Number(id);
  if (!Number.isInteger(institutionId)) notFound();

  const sql = await db();
  const [institution] = await sql`
    SELECT id, name, cause, city, pix_key
    FROM institutions WHERE id = ${institutionId}
  `;
  if (!institution) notFound();

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Doar em dinheiro</h1>
        <p className="text-lg text-black/70">
          {institution.name} · {institution.cause} · {institution.city}
        </p>
      </div>

      {institution.pix_key ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-5">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-black/60">
              Chave Pix da instituição
            </span>
            <code className="rounded-lg bg-black/5 px-3 py-2 font-mono text-sm">
              {institution.pix_key}
            </code>
          </div>
          <p className="text-sm text-black/60">
            Faça a transferência no app do seu banco e registre o valor abaixo
            para acompanhar seu histórico.
          </p>
          <DonateForm institutionId={institution.id} />
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-black/20 p-5 text-sm text-black/60">
          Esta instituição ainda não cadastrou uma chave Pix. Tente conversar
          com ela pela página de necessidades.
        </p>
      )}
    </section>
  );
}
