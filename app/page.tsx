import Link from "next/link";
import { appConfig } from "@/app.config";

export default function Home() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-24 text-center">
      <span className="text-6xl" aria-hidden>
        {appConfig.emoji}
      </span>
      <h1 className="text-5xl font-bold tracking-tight">{appConfig.name}</h1>
      <p className="max-w-xl text-lg text-black/70">{appConfig.description}</p>
      <p className="max-w-xl text-base text-black/50">
        Descubra instituições verificadas, veja o que cada uma mais precisa agora
        e encontre pontos de coleta perto de você.
      </p>
      <Link
        href="/dashboard"
        className="rounded-full bg-accent px-6 py-3 font-medium text-white shadow-sm transition hover:opacity-90"
      >
        Quero doar →
      </Link>
      <p className="text-sm text-black/50">
        Entre para acessar a lista de early access e acompanhar as novidades.
      </p>
    </section>
  );
}
