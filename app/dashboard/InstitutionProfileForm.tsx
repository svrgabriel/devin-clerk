"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Fields = {
  cause: string;
  city: string;
  address: string;
  hours: string;
  story: string;
  pixKey: string;
  instagram: string;
  facebook: string;
  website: string;
};

const INPUT =
  "w-full rounded-lg border border-black/15 px-3 py-2 text-sm";

export function InstitutionProfileForm({ initial }: { initial: Fields }) {
  const router = useRouter();
  const [fields, setFields] = useState<Fields>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof Fields>(key: K, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/institutions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
      <input
        className={INPUT}
        placeholder="Causa (ex.: Proteção animal)"
        value={fields.cause}
        onChange={(e) => set("cause", e.target.value)}
      />
      <input
        className={INPUT}
        placeholder="Cidade"
        value={fields.city}
        onChange={(e) => set("city", e.target.value)}
      />
      <input
        className={INPUT}
        placeholder="Endereço completo"
        value={fields.address}
        onChange={(e) => set("address", e.target.value)}
      />
      <input
        className={INPUT}
        placeholder="Horário e dias (ex.: Seg–Sex, 9h–17h)"
        value={fields.hours}
        onChange={(e) => set("hours", e.target.value)}
      />
      <input
        className={INPUT}
        placeholder="Chave Pix"
        value={fields.pixKey}
        onChange={(e) => set("pixKey", e.target.value)}
      />
      <input
        className={INPUT}
        placeholder="Instagram (URL)"
        value={fields.instagram}
        onChange={(e) => set("instagram", e.target.value)}
      />
      <input
        className={INPUT}
        placeholder="Facebook (URL)"
        value={fields.facebook}
        onChange={(e) => set("facebook", e.target.value)}
      />
      <input
        className={INPUT}
        placeholder="Site próprio (URL)"
        value={fields.website}
        onChange={(e) => set("website", e.target.value)}
      />
      <textarea
        className={`${INPUT} sm:col-span-2`}
        rows={4}
        placeholder="Conte a história da instituição"
        value={fields.story}
        onChange={(e) => set("story", e.target.value)}
      />
      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-accent px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          Salvar perfil
        </button>
        {saved && <span className="text-sm text-accent">Salvo!</span>}
      </div>
    </form>
  );
}
