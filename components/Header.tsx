"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { appConfig } from "@/app.config";
import { LANGS, useLang, useT } from "@/lib/i18n";

const clerkAppearance = {
  variables: {
    colorPrimary: appConfig.accent,
  },
};

function NavMenu({
  label,
  items,
}: {
  label: string;
  items: { href: string; label: string; badge?: number }[];
}) {
  return (
    <div
      className="group relative"
      onMouseEnter={() => {
        const el = document.activeElement as HTMLElement | null;
        if (el && el.tagName === "A") el.blur();
      }}
    >
      <button className="flex items-center gap-1 hover:text-accent">
        {label}
        <svg
          className="h-3 w-3 transition-transform group-hover:rotate-180"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="invisible absolute left-0 top-full z-50 min-w-44 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="rounded-xl border border-black/10 bg-white py-2 shadow-lg">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => e.currentTarget.blur()}
              className="flex items-center justify-between gap-2 px-4 py-2 hover:bg-accent/10 hover:text-accent"
            >
              {item.label}
              {item.badge ? (
                <span className="min-w-5 rounded-full bg-accent px-1.5 py-0.5 text-center text-xs font-semibold text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const [unread, setUnread] = useState(0);
  const [dark, setDark] = useState(false);
  const { lang, setLang } = useLang();
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    fetch("/api/messages/unread")
      .then((r) => (r.ok ? r.json() : { count: 0 }))
      .then((d) => setUnread(d.count ?? 0))
      .catch(() => {});
  }, []);
  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }
  return (
    <header className="border-b border-black/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          {pathname !== "/" && (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-sm hover:text-accent"
              aria-label="Voltar"
            >
              ← Voltar
            </button>
          )}
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <span aria-hidden>{appConfig.emoji}</span>
            {appConfig.name}
          </Link>
        </div>
        <nav className="flex items-center gap-5 text-sm">
          <NavMenu
            label={t("nav.explorar")}
            items={[
              { href: "/institutions", label: t("nav.instituicoes") },
              { href: "/needs", label: t("nav.necessidades") },
              { href: "/map", label: t("nav.mapa") },
            ]}
          />
          <NavMenu
            label={t("nav.doar")}
            items={[
              { href: "/match", label: t("nav.combinar") },
              { href: "/history", label: t("nav.minhasDoacoes") },
            ]}
          />
          <NavMenu
            label={t("nav.conta")}
            items={[
              { href: "/dashboard", label: t("nav.painel") },
              { href: "/messages", label: t("nav.mensagens"), badge: unread },
            ]}
          />
          <div
            className="group relative"
            onMouseEnter={() => {
              const el = document.activeElement as HTMLElement | null;
              if (el && el.tagName === "A") el.blur();
            }}
          >
            <button className="flex items-center gap-1 hover:text-accent" aria-label="Idioma">
              {LANGS.find((l) => l.code === lang)?.flag}
            </button>
            <div className="invisible absolute right-0 top-full z-50 min-w-36 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="rounded-xl border border-black/10 bg-white py-2 shadow-lg">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-accent/10 ${lang === l.code ? "font-semibold text-accent" : ""}`}
                  >
                    <span aria-hidden>{l.flag}</span>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={toggleDark}
            className="hover:text-accent"
            aria-label={dark ? "Modo claro" : "Modo escuro"}
            title={dark ? "Modo claro" : "Modo escuro"}
          >
            {dark ? "☀" : "☾"}
          </button>
          <Suspense>
            <Show when="signed-out">
              <div className="flex items-center gap-3">
                <SignInButton>
                  <button className="font-medium hover:text-accent">
                    {t("nav.entrar")}
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="rounded-full bg-accent px-4 py-2 font-medium text-white transition hover:opacity-90">
                    {t("nav.cadastrar")}
                  </button>
                </SignUpButton>
              </div>
            </Show>
            <Show when="signed-in">
              <UserButton appearance={clerkAppearance} />
            </Show>
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
