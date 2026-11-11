import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { appConfig } from "@/app.config";
import { FeatureCard } from "@/components/FeatureCard";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/profile";
import { NeedForm } from "./NeedForm";
import { InstitutionProfileForm } from "./InstitutionProfileForm";
import { DonorProfileForm } from "./DonorProfileForm";

export default async function DashboardPage() {
  await auth.protect();
  const { userId, role } = await requireProfile();
  const user = await currentUser();
  const name =
    user?.firstName ??
    user?.emailAddresses[0]?.emailAddress.split("@")[0] ??
    "there";

  const [nextFeature] = appConfig.upcomingFeatures;
  const sql = await db();

  const myInstitution =
    role === "instituicao"
      ? (
          await sql`
            SELECT id, name, cause, city, pix_key, address, hours, story,
                   instagram, facebook, website, photos
            FROM institutions WHERE clerk_user_id = ${userId}
          `
        )[0]
      : null;
  const myNeeds = myInstitution
    ? await sql`
        SELECT item, priority FROM needs
        WHERE institution_id = ${myInstitution.id} ORDER BY id
      `
    : [];
  const donorProfile =
    role === "doador"
      ? (
          await sql`
            SELECT description, instagram, facebook, website, photo_url
            FROM donor_profiles WHERE clerk_user_id = ${userId}
          `
        )[0]
      : null;

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {donorProfile?.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={donorProfile.photo_url}
              alt="Foto de perfil"
              className="h-12 w-12 rounded-full border border-black/10 object-cover"
            />
          )}
          <h1 className="text-3xl font-bold">Olá, {name}!</h1>
        </div>
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
        <Link
          href="/institutions"
          className="flex flex-col gap-1 rounded-2xl border border-black/10 bg-white p-5 transition hover:border-accent/40"
        >
          <span className="font-semibold">Instituições</span>
          <span className="text-sm text-black/60">
            Catálogo por causa e cidade.
          </span>
        </Link>
        <Link
          href="/map"
          className="flex flex-col gap-1 rounded-2xl border border-black/10 bg-white p-5 transition hover:border-accent/40"
        >
          <span className="font-semibold">Mapa de coleta</span>
          <span className="text-sm text-black/60">
            Pontos de coleta no mapa.
          </span>
        </Link>
        {role === "doador" && (
          <>
            <Link
              href="/match"
              className="flex flex-col gap-1 rounded-2xl border border-black/10 bg-white p-5 transition hover:border-accent/40"
            >
              <span className="font-semibold">Combinar doação</span>
              <span className="text-sm text-black/60">
                Diga o que doar e ache quem precisa.
              </span>
            </Link>
            <Link
              href="/history"
              className="flex flex-col gap-1 rounded-2xl border border-black/10 bg-white p-5 transition hover:border-accent/40"
            >
              <span className="font-semibold">Suas doações</span>
              <span className="text-sm text-black/60">
                Histórico e impacto.
              </span>
            </Link>
          </>
        )}
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

      <div className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="font-semibold">Configurações do perfil</h2>
        {role === "instituicao" && myInstitution ? (
          <InstitutionProfileForm
            initial={{
              cause: myInstitution.cause ?? "",
              city: myInstitution.city ?? "",
              address: myInstitution.address ?? "",
              hours: myInstitution.hours ?? "",
              story: myInstitution.story ?? "",
              pixKey: myInstitution.pix_key ?? "",
              instagram: myInstitution.instagram ?? "",
              facebook: myInstitution.facebook ?? "",
              website: myInstitution.website ?? "",
              photos: myInstitution.photos ?? "",
            }}
          />
        ) : (
          <DonorProfileForm
            initial={{
              description: donorProfile?.description ?? "",
              instagram: donorProfile?.instagram ?? "",
              facebook: donorProfile?.facebook ?? "",
              website: donorProfile?.website ?? "",
              photoUrl: donorProfile?.photo_url ?? "",
            }}
          />
        )}
      </div>

      {appConfig.upcomingFeatures.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">O que vem por aí</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {appConfig.upcomingFeatures.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      )}

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
