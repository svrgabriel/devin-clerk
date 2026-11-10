export type Feature = {
  title: string;
  description: string;
};

export type NeedPriority = "urgente" | "alta" | "normal";

export type Institution = {
  name: string;
  cause: string;
  city: string;
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
      needs: [
        { item: "Fraldas geriátricas", priority: "alta" },
        { item: "Suplementos nutricionais", priority: "alta" },
        { item: "Roupas de cama", priority: "normal" },
      ],
    },
  ] satisfies Institution[],
  upcomingFeatures: [
    {
      title: "Institution directory",
      description:
        "Navegue por instituições verificadas por causa e cidade para encontrar onde sua doação ajuda mais.",
    },
    {
      title: "Interactive drop-off map",
      description:
        "Veja pontos de coleta e campanhas ativas perto de você em um mapa interativo.",
    },
    {
      title: "Money donations",
      description:
        "Doe diretamente para as instituições com pagamentos online seguros.",
    },
    {
      title: "Donation matching",
      description:
        "Diga o que você quer doar e sugerimos as instituições que mais precisam.",
    },
    {
      title: "Donation history",
      description:
        "Acompanhe suas doações anteriores e o impacto que elas geraram.",
    },
  ] satisfies Feature[],
};
