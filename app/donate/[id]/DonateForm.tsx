"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DonateForm({ institutionId }: { institutionId: number }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("pix");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        institutionId,
        amount: Number(amount.replace(",", ".")),
        method,
      }),
    });
    if (res.ok) {
      router.push("/history");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível registrar a doação.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-black/60">R$</span>
        <input
          required
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="50,00"
          className="w-32 rounded-lg border border-black/15 px-3 py-2"
        />
      </div>
      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        className="rounded-lg border border-black/15 px-3 py-2 text-sm"
      >
        <option value="pix">Pix</option>
        <option value="cartao">Cartão</option>
        <option value="dinheiro">Dinheiro</option>
        <option value="outro">Outro</option>
      </select>
      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-accent px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        Registrar doação
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </form>
  );
}
