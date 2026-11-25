import { media } from "./media";

export type Entry = {
  slug: string; name: string; tag: string; summary: string; quote: string;
  status: string; zoom?: string; portrait: string; pos: string; sheets: string[]; facts: string[];
};

export const characters: Entry[] = [
  {
    slug: "suzune-suzue", name: "Suzune Suzue", tag: "AVENTUREIRA",
    summary: "Uma jovem determinada a alcançar o Rank S. Após ser traída por seu grupo, precisa sobreviver nas profundezas de uma masmorra desconhecida.",
    quote: "Eu não estou aqui para ser salva. Estou aqui para ficar mais forte.",
    status: "VIVA — LOCALIZAÇÃO DESCONHECIDA", portrait: media.suzune, pos: "86% 4%",
    sheets: [media.suzune, media.duo],
    facts: ["Jovem adulta, parda", "Cabelos longos e escuros", "Armadura leve e espada nas costas", "Olhar determinado — mesmo cansada, ela continua"],
  },
  {
    slug: "o-mago-selado", name: "O Mago Selado", tag: "O ANCIÃO",
    summary: "Um ser de poder incomensurável, que carrega em si o peso de um passado que o mundo prefere esquecer. Ele não é apenas um mago. Ele é uma prisão vestida de homem.",
    quote: "O mundo é apenas um ciclo... e eu sou o que o mantém girando.",
    status: "SELADO — NÃO POR ESCOLHA, MAS POR NECESSIDADE", portrait: media.elderPreso, zoom: "cover", pos: "50% 25%",
    sheets: [media.mago, media.elderSheet, media.duo],
    facts: ["Olho direito com um círculo mágico embutido", "Máscara de abotoar que cobre nariz e boca", "Correntes de selamento com glifos de restrição", "Tatuagens em ambos os braços, estilo yakuza"],
  },
];
