import { auth, currentUser } from "@clerk/nextjs/server";
import { appConfig } from "@/app.config";
import { FeatureCard } from "@/components/FeatureCard";

export default async function DashboardPage() {
  await auth.protect();
  const user = await currentUser();
  const name =
    user?.firstName ??
    user?.emailAddresses[0]?.emailAddress.split("@")[0] ??
    "there";

  const [nextFeature] = appConfig.upcomingFeatures;

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <span className="text-4xl" aria-hidden>
          🚧
        </span>
        <h1 className="text-3xl font-bold">Olá, {name}!</h1>
        <p className="text-lg text-black/70">
          O {appConfig.name} está chegando. Você está na lista de early access —
          veja o que estamos construindo:
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {appConfig.upcomingFeatures.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
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
