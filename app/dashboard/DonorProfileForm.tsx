"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Fields = {
  description: string;
  instagram: string;
  facebook: string;
  website: string;
  photoUrl: string;
};

const INPUT = "w-full rounded-lg border border-black/15 px-3 py-2 text-sm";

export function DonorProfileForm({ initial }: { initial: Fields }) {
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
    const res = await fetch("/api/donors", {
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
      <textarea
        className={`${INPUT} sm:col-span-2`}
        rows={3}
        placeholder="Fale um pouco sobre você"
        value={fields.description}
        onChange={(e) => set("description", e.target.value)}
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
      <input
        className={INPUT}
        placeholder="Foto de perfil (URL da imagem)"
        value={fields.photoUrl}
        onChange={(e) => set("photoUrl", e.target.value)}
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
