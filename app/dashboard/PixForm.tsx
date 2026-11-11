"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PixForm({ initial }: { initial: string | null }) {
  const router = useRouter();
  const [pixKey, setPixKey] = useState(initial ?? "");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/institutions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pixKey }),
    });
    if (res.ok) router.refresh();
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="flex flex-wrap gap-3">
      <input
        value={pixKey}
        onChange={(e) => setPixKey(e.target.value)}
        placeholder="Chave Pix (email, CNPJ, telefone ou aleatória)"
        className="min-w-48 flex-1 rounded-lg border border-black/15 px-3 py-2"
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-accent px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        Salvar chave
      </button>
    </form>
  );
}
