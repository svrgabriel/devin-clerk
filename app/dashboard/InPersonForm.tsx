"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const INPUT = "w-full rounded-lg border border-black/15 px-3 py-2 text-sm";

export function InPersonForm() {
  const router = useRouter();
  const [donorName, setDonorName] = useState("");
  const [donorId, setDonorId] = useState("");
  const [item, setItem] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/donations/in-person", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ donorName, donorId, item }),
    });
    if (res.ok) {
      setDonorName("");
      setDonorId("");
      setItem("");
      setSaved(true);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-3">
      <input
        required
        className={INPUT}
        placeholder="Nome do doador"
        value={donorName}
        onChange={(e) => setDonorName(e.target.value)}
      />
      <input
        required
        className={INPUT}
        placeholder="ID do doador (ex.: DOA-XXXX-XXXX)"
        value={donorId}
        onChange={(e) => setDonorId(e.target.value)}
      />
      <input
        required
        className={INPUT}
        placeholder="Item doado (ex.: 5kg de arroz)"
        value={item}
        onChange={(e) => setItem(e.target.value)}
      />
      <div className="flex items-center gap-3 sm:col-span-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          Registrar entrega
        </button>
        {saved && <span className="text-sm text-accent">Registrado!</span>}
      </div>
    </form>
  );
}

export function CopyId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(id).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1 rounded-full border border-black/15 px-3 py-1 font-mono text-xs hover:border-accent/40 hover:text-accent"
      title="Copiar ID"
    >
      {id}
      <span aria-hidden>{copied ? "✓" : "⧉"}</span>
    </button>
  );
}
