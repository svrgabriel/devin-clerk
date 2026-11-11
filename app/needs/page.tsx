import { auth } from "@clerk/nextjs/server";
import { appConfig, type NeedPriority } from "@/app.config";

const priorityOrder: Record<NeedPriority, number> = {
  urgente: 0,
  alta: 1,
  normal: 2,
};

const priorityStyles: Record<NeedPriority, string> = {
  urgente: "bg-red-100 text-red-800 border-red-200",
  alta: "bg-amber-100 text-amber-800 border-amber-200",
  normal: "bg-accent/10 text-accent border-accent/20",
};

const priorityLabels: Record<NeedPriority, string> = {
  urgente: "Urgente",
  alta: "Alta",
  normal: "Normal",
};

export default async function NeedsPage() {
  await auth.protect();

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">O que doar agora</h1>
        <p className="text-lg text-black/70">
          Necessidades das instituições, ordenadas por prioridade.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {appConfig.institutions.map((institution) => {
          const needs = [...institution.needs].sort(
            (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
          );
          return (
            <article
              key={institution.name}
              className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">{institution.name}</h2>
                <p className="text-sm text-black/60">
                  {institution.cause} · {institution.city}
                </p>
              </div>
              <ul className="flex flex-col gap-2">
                {needs.map((need) => (
                  <li
                    key={need.item}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span>{need.item}</span>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${priorityStyles[need.priority]}`}
                    >
                      {priorityLabels[need.priority]}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
