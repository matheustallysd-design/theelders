import { media } from "./media";
import type { Entry } from "./characters";

export const beasts: (Entry & { size: string })[] = [
  {
    slug: "besta-do-abismo", name: "Besta do Abismo", tag: "CHEFE DE ANDAR",
    summary: "Uma criatura gigantesca que habita o fundo da masmorra. Sua carapaça natural a torna quase imparável, e sua força bruta é capaz de destruir estruturas inteiras.",
    quote: "Ele não apenas te enfrenta... Ele te conduz até o fim.",
    status: "GUARDIÃO DESTE ANDAR", portrait: media.besta, pos: "35% 18%", size: "8 – 12 m",
    sheets: [media.besta],
    facts: ["Territorial e agressiva", "Inteligente — age por instinto", "Atrai presas para o abismo", "Não perdoa a fraqueza"],
  },
  {
    slug: "pantera-negra", name: "Pantera Negra", tag: "A SOMBRA QUE OBSERVA",
    summary: "Uma criatura de corpo completamente negro, com olhos luminosos, que aparece nas profundezas da masmorra. Não emite som. Apenas observa.",
    quote: "Ela não veio para caçar. Veio para nos encontrar.",
    status: "PRESSÁGIO DE MORTE", portrait: media.pantera, pos: "22% 15%", size: "2,5 – 3 m",
    sheets: [media.pantera],
    facts: ["Solitária e noturna", "Extremamente territorial", "Ataca por instinto", "Não demonstra sinais de aviso"],
  },
  {
    slug: "criatura-da-toca", name: "Criatura da Toca", tag: "SEMELHANTE A UM RÉPTIL",
    summary: "Uma criatura de grande porte, com corpo escamoso e aparência primitiva. Vive em cavernas e ataca por instinto, protegendo seu território.",
    quote: "Não fala, não pensa. Apenas caça, sobrevive e defende sua toca.",
    status: "ABATIDA POR SUZUE", portrait: media.reptil, pos: "25% 25%", size: "6 – 8 m",
    sheets: [media.reptil],
    facts: ["Escamas que funcionam como armadura", "Garras para escalar e dilacerar", "Cauda longa usada como arma", "Olhos pequenos, mas extremamente perceptivos"],
  },
];
