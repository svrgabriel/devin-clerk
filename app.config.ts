export type Feature = {
  title: string;
  description: string;
};

export const appConfig = {
  name: "DoeUVV",
  description:
    "Conecta doadores a instituições beneficentes: onde doar, o que doar e quais doações são prioritárias.",
  emoji: "❤️",
  accent: "#16a34a",
  upcomingFeatures: [
    {
      title: "Priority needs feed",
      description:
        "Institutions post what they need most right now so donors see urgent requests first.",
    },
    {
      title: "Institution directory",
      description:
        "Browse verified charities by cause and city to find where your donation helps most.",
    },
    {
      title: "Interactive drop-off map",
      description:
        "See collection points and active campaigns near you on an interactive map.",
    },
    {
      title: "Money donations",
      description:
        "Donate directly to institutions with secure online payments.",
    },
    {
      title: "Donation matching",
      description:
        "Tell us what you want to donate and we suggest the institutions that need it.",
    },
    {
      title: "Donation history",
      description:
        "Track your past donations and the impact they made for each institution.",
    },
  ] satisfies Feature[],
};
