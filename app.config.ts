export type Feature = {
  title: string;
  description: string;
};

export type NeedPriority = "urgente" | "alta" | "normal";

export type Institution = {
  name: string;
  cause: string;
  city: string;
  pixKey?: string;
  address?: string;
  hours?: string;
  lat?: number;
  lng?: number;
  needs: { item: string; priority: NeedPriority }[];
};

export const appConfig = {
  name: "DoeUVV",
  description:
    "Conecta doadores a instituições beneficentes: onde doar, o que doar e quais doações são prioritárias.",
  emoji: "❤️",
  accent: "#16a34a",
  institutions: [
    {
      name: "Casa do Caminho",
      cause: "Abrigo infantil",
      city: "Vila Velha",
      pixKey: "doacoes@casadocaminho.org",
      address: "R. das Acácias, 120 — Praia de Itaparica, Vila Velha/ES",
      hours: "Seg–Sex, 8h–17h; Sáb, 8h–12h",
      lat: -20.3417,
      lng: -40.2913,
      needs: [
        { item: "Fraldas geriátricas e infantis", priority: "urgente" },
        { item: "Leite em pó", priority: "alta" },
        { item: "Material escolar", priority: "normal" },
      ],
    },
    {
      name: "Banco de Alimentos ES",
      cause: "Segurança alimentar",
      city: "Vitória",
      pixKey: "pix@bancodealimentoses.org",
      address: "Av. Leitão da Silva, 500 — Centro, Vitória/ES",
      hours: "Seg–Sex, 9h–18h",
      lat: -20.3155,
      lng: -40.3128,
      needs: [
        { item: "Arroz e feijão", priority: "urgente" },
        { item: "Óleo de cozinha", priority: "alta" },
        { item: "Produtos de higiene", priority: "normal" },
      ],
    },
    {
      name: "Amigos dos Animais UVV",
      cause: "Proteção animal",
      city: "Vila Velha",
      pixKey: "pix@amigosdosanimais.org",
      address: "R. Prof. Vamoré, 45 — Glória, Vila Velha/ES",
      hours: "Todos os dias, 8h–20h",
      lat: -20.3539,
      lng: -40.2967,
      needs: [
        { item: "Ração para cães e gatos", priority: "urgente" },
        { item: "Medicamentos veterinários", priority: "alta" },
        { item: "Cobertores", priority: "normal" },
      ],
    },
    {
      name: "Lar São Vicente",
      cause: "Acolhimento de idosos",
      city: "Cariacica",
      pixKey: "pix@larsaovicente.org",
      address: "R. Expedito Garcia, 210 — Campo Grande, Cariacica/ES",
      hours: "Seg–Sáb, 9h–17h",
      lat: -20.2632,
      lng: -40.4198,
      needs: [
        { item: "Fraldas geriátricas", priority: "alta" },
        { item: "Suplementos nutricionais", priority: "alta" },
        { item: "Roupas de cama", priority: "normal" },
      ],
    },
  ] satisfies Institution[],
  upcomingFeatures: [] as Feature[],
};
