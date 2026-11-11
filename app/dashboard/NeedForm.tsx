"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NeedForm() {
  const router = useRouter();
  const [item, setItem] = useState("");
  const [priority, setPriority] = useState("normal");
  const [saving, setSaving] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/needs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item, priority }),
    });
    if (res.ok) {
      setItem("");
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={add} className="flex flex-wrap gap-3">
      <input
        required
        value={item}
        onChange={(e) => setItem(e.target.value)}
        placeholder="Ex.: Leite em pó"
        className="min-w-48 flex-1 rounded-lg border border-black/15 px-3 py-2"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="rounded-lg border border-black/15 px-3 py-2"
      >
        <option value="urgente">Urgente</option>
        <option value="alta">Alta</option>
        <option value="normal">Normal</option>
      </select>
      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-accent px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        Publicar
      </button>
    </form>
  );
}
