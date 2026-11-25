import besta from "@/assets/besta_abismo_sheet.jpg.asset.json";
import capa from "@/assets/capa_the_elder.jpg.asset.json";
import elderPreso from "@/assets/elder_aprisionado.png.asset.json";
import elderSheet from "@/assets/elder_unmasked_sheet.jpg.asset.json";
import mago from "@/assets/mago_selado_sheet.jpg.asset.json";
import pantera from "@/assets/pantera_negra_sheet.jpg.asset.json";
import reptil from "@/assets/reptil_toca_sheet.jpg.asset.json";
import suzune from "@/assets/suzune_sheet.jpg.asset.json";
import duo from "@/assets/suzune_mago_sheet.jpg.asset.json";
import levantando from "@/assets/suzue_levantando.mp4.asset.json";
import avancando from "@/assets/suzue_avancando.mp4.asset.json";

export const media = {
  besta: besta.url, capa: capa.url, elderPreso: elderPreso.url, elderSheet: elderSheet.url,
  mago: mago.url, pantera: pantera.url, reptil: reptil.url, suzune: suzune.url, duo: duo.url,
  videoLevantando: levantando.url, videoAvancando: avancando.url,
};

/** Arte (ou vídeo) mostrada no topo de cada cena do capítulo, na ordem das cenas. */
export const sceneArt: { src: string; video?: boolean; pos?: string; zoom?: string; caption: string }[] = [
  { src: media.elderPreso, pos: "50% 30%", caption: "Um ancião aprisionado nas profundezas." },
  { src: media.capa, pos: "50% 20%", caption: "Deuses, Demônios e os humanos." },
  { src: media.suzune, zoom: "260%", pos: "15% 30%", caption: "Suzune Suzue chega ao labirinto." },
  { src: media.besta, zoom: "260%", pos: "75% 92%", caption: "A traição." },
  { src: media.besta, zoom: "260%", pos: "20% 20%", caption: "A Besta do Abismo." },
  { src: media.videoLevantando, video: true, caption: "No fundo do labirinto, Suzue se levanta." },
  { src: media.reptil, zoom: "260%", pos: "50% 90%", caption: "A toca." },
  { src: media.videoAvancando, video: true, caption: "Ela avança pelo andar desconhecido." },
  { src: media.pantera, zoom: "260%", pos: "70% 90%", caption: "Algo observa na escuridão." },
];
