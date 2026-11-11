import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { appConfig } from "@/app.config";
import { FeatureCard } from "@/components/FeatureCard";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/profile";
import { NeedForm } from "./NeedForm";

export default async function DashboardPage() {
  await auth.protect();
  const { userId, role } = await requireProfile();
  const user = await currentUser();
  const name =
    user?.firstName ??
    user?.emailAddresses[0]?.emailAddress.split("@")[0] ??
    "there";

  const [nextFeature] = appConfig.upcomingFeatures;
  const sql = db();

  const myInstitution =
    role === "instituicao"
      ? (
          await sql`
            SELECT id, name FROM institutions WHERE clerk_user_id = ${userId}
          `
        )[0]
      : null;
  const myNeeds = myInstitution
    ? await sql`
        SELECT item, priority FROM needs
        WHERE institution_id = ${myInstitution.id} ORDER BY id
      `
    : [];

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Olá, {name}!</h1>
        <p className="text-lg text-black/70">
          {role === "doador"
            ? "Bem-vindo ao seu painel de doador."
            : "Painel da sua instituição."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/needs"
          className="flex flex-col gap-1 rounded-2xl border border-black/10 bg-white p-5 transition hover:border-accent/40"
        >
          <span className="font-semibold">
            {role === "doador" ? "O que doar agora" : "Necessidades publicadas"}
          </span>
          <span className="text-sm text-black/60">
            {role === "doador"
              ? "Veja o que as instituições mais precisam."
              : "Gerencie as necessidades da sua instituição."}
          </span>
        </Link>
        <Link
          href="/messages"
          className="flex flex-col gap-1 rounded-2xl border border-black/10 bg-white p-5 transition hover:border-accent/40"
        >
          <span className="font-semibold">Mensagens</span>
          <span className="text-sm text-black/60">
            {role === "doador"
              ? "Converse com as instituições."
              : "Responda os doadores."}
          </span>
        </Link>
      </div>

      {role === "instituicao" && myInstitution && (
        <div className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">
            Publicar necessidade — {myInstitution.name}
          </h2>
          <NeedForm />
          {myNeeds.length > 0 && (
            <ul className="flex flex-col gap-1 text-sm">
              {myNeeds.map((n) => (
                <li key={n.item}>
                  <span className="font-medium">{n.item}</span>{" "}
                  <span className="text-black/50">({n.priority})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">O que vem por aí</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {appConfig.upcomingFeatures.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>

      {nextFeature && (
        <div className="rounded-2xl border border-dashed border-accent/40 bg-accent/5 px-5 py-4 text-sm">
          <strong className="text-accent">Continue construindo:</strong> abra o
          Devin e peça &ldquo;Build &lsquo;{nextFeature.title}&rsquo; da página
          Coming soon.&rdquo;
        </div>
      )}
    </section>
  );
}
