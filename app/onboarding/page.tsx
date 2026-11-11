"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<"doador" | "instituicao">("doador");
  const [document, setDocument] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, document, orgName }),
    });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Algo deu errado. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold">Complete seu cadastro</h1>
        <p className="text-black/70">Como você quer usar o DoeUVV?</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "doador", label: "Sou doador", hint: "Quero doar" },
              {
                value: "instituicao",
                label: "Instituição",
                hint: "Recebo doações",
              },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setRole(option.value);
                setDocument("");
              }}
              className={`rounded-2xl border p-4 text-left transition ${
                role === option.value
                  ? "border-accent bg-accent/5"
                  : "border-black/10 bg-white hover:border-accent/40"
              }`}
            >
              <div className="font-semibold">{option.label}</div>
              <div className="text-sm text-black/60">{option.hint}</div>
            </button>
          ))}
        </div>

        {role === "instituicao" && (
          <label className="flex flex-col gap-1 text-sm font-medium">
            Nome da instituição
            <input
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="rounded-lg border border-black/15 px-3 py-2 font-normal"
              placeholder="Ex.: Casa do Caminho"
            />
          </label>
        )}

        <label className="flex flex-col gap-1 text-sm font-medium">
          {role === "doador" ? "CPF" : "CNPJ"}
          <input
            required
            inputMode="numeric"
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            className="rounded-lg border border-black/15 px-3 py-2 font-normal"
            placeholder={
              role === "doador" ? "000.000.000-00" : "00.000.000/0000-00"
            }
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-accent px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Salvando…" : "Continuar"}
        </button>
      </form>
    </section>
  );
}
