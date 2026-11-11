import type { Feature } from "@/app.config";

export function FeatureCard({
  feature,
  index,
}: {
  feature: Feature;
  index: number;
}) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <span className="w-fit rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
        Em breve · #{index + 1}
      </span>
      <h3 className="text-lg font-semibold">{feature.title}</h3>
      <p className="text-sm text-black/70">{feature.description}</p>
    </article>
  );
}
