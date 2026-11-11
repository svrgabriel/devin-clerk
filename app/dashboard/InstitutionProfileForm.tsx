"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Fields = {
  cause: string;
  city: string;
  cep: string;
  address: string;
  hours: string;
  story: string;
  pixKey: string;
  instagram: string;
  facebook: string;
  website: string;
  photos: string;
  acceptsMessages: boolean;
};

const INPUT =
  "w-full rounded-lg border border-black/15 px-3 py-2 text-sm";

const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function parseHours(hours: string) {
  const m = hours.match(/(\d{2}:\d{2})\D+(\d{2}:\d{2})/);
  const days = WEEK_DAYS.filter((d) => hours.includes(d));
  return {
    days: days.length ? days : ["Seg", "Ter", "Qua", "Qui", "Sex"],
    open: m?.[1] ?? "08:00",
    close: m?.[2] ?? "17:00",
  };
}

function formatHours(days: string[], open: string, close: string) {
  const idx = days.map((d) => WEEK_DAYS.indexOf(d)).sort((a, b) => a - b);
  const contiguous =
    idx.length > 1 && idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  const label =
    contiguous && idx.length > 2
      ? `${WEEK_DAYS[idx[0]]}–${WEEK_DAYS[idx[idx.length - 1]]}`
      : days.join(", ");
  return `${label}, ${open}–${close}`;
}

export function InstitutionProfileForm({ initial }: { initial: Fields }) {
  const router = useRouter();
  const [fields, setFields] = useState<Fields>(initial);
  const [dayPick, setDayPick] = useState(() => parseHours(initial.hours));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/institutions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...fields,
        hours: formatHours(dayPick.days, dayPick.open, dayPick.close),
      }),
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
        placeholder="CEP (ex.: 29010-000)"
        value={fields.cep}
        onChange={(e) => set("cep", e.target.value)}
      />
      <input
        className={INPUT}
        placeholder="Endereço completo"
        value={fields.address}
        onChange={(e) => set("address", e.target.value)}
      />
      <div className="flex flex-col gap-2 rounded-lg border border-black/15 px-3 py-2 text-sm sm:col-span-2">
        <span className="text-black/60">Dias e horário de funcionamento</span>
        <div className="flex flex-wrap gap-2">
          {WEEK_DAYS.map((d) => (
            <label key={d} className="flex items-center gap-1">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 accent-accent"
                checked={dayPick.days.includes(d)}
                onChange={(e) =>
                  setDayPick((p) => ({
                    ...p,
                    days: e.target.checked
                      ? [...p.days, d]
                      : p.days.filter((x) => x !== d),
                  }))
                }
              />
              {d}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-black/60">Abre</span>
          <input
            type="time"
            className={INPUT.replace("w-full", "w-auto")}
            value={dayPick.open}
            onChange={(e) => setDayPick((p) => ({ ...p, open: e.target.value }))}
          />
          <span className="text-black/60">Fecha</span>
          <input
            type="time"
            className={INPUT.replace("w-full", "w-auto")}
            value={dayPick.close}
            onChange={(e) => setDayPick((p) => ({ ...p, close: e.target.value }))}
          />
        </div>
      </div>
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
        className={INPUT}
        rows={3}
        placeholder={"Fotos — uma URL por linha"}
        value={fields.photos}
        onChange={(e) => set("photos", e.target.value)}
      />
      <textarea
        className={`${INPUT} sm:col-span-2`}
        rows={4}
        placeholder="Conte a história da instituição"
        value={fields.story}
        onChange={(e) => set("story", e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input
          type="checkbox"
          checked={fields.acceptsMessages}
          onChange={(e) => set("acceptsMessages", e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        Aceitar mensagens de doadores
      </label>
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
