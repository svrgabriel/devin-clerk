"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const LANGS = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
] as const;
export type Lang = (typeof LANGS)[number]["code"];

const DICT: Record<string, Record<Lang, string>> = {
  "nav.explorar": { pt: "Explorar", en: "Explore", es: "Explorar" },
  "nav.instituicoes": { pt: "Instituições", en: "Institutions", es: "Instituciones" },
  "nav.necessidades": { pt: "Necessidades", en: "Needs", es: "Necesidades" },
  "nav.mapa": { pt: "Mapa", en: "Map", es: "Mapa" },
  "nav.doar": { pt: "Doar", en: "Donate", es: "Donar" },
  "nav.combinar": { pt: "Combinar", en: "Match", es: "Combinar" },
  "nav.minhasDoacoes": { pt: "Minhas doações", en: "My donations", es: "Mis donaciones" },
  "nav.conta": { pt: "Conta", en: "Account", es: "Cuenta" },
  "nav.painel": { pt: "Painel", en: "Dashboard", es: "Panel" },
  "nav.mensagens": { pt: "Mensagens", en: "Messages", es: "Mensajes" },
  "nav.entrar": { pt: "Entrar", en: "Sign in", es: "Entrar" },
  "nav.cadastrar": { pt: "Cadastrar", en: "Sign up", es: "Registrarse" },
};

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "pt",
  setLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("pt");
  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && LANGS.some((l) => l.code === saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLang(saved);
    }
  }, []);
  function change(l: Lang) {
    setLang(l);
    localStorage.setItem("lang", l);
    document.documentElement.lang = l === "pt" ? "pt-BR" : l;
  }
  return (
    <LangContext.Provider value={{ lang, setLang: change }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

export function useT() {
  const { lang } = useLang();
  return (key: keyof typeof DICT | string) => DICT[key]?.[lang] ?? DICT[key]?.pt ?? key;
}
