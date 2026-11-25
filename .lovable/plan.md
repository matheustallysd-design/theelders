# Novo visual mangá de THE ELDER, com suas artes e vídeos

## Direção visual
- Estilo de página de mangá: quadros com bordas pretas grossas, cortes inclinados, onomatopeias e balões de narração (como nas suas fichas).
- Mais cor: fundo escuro de tinta, com destaques vibrantes em vermelho sangue, ciano mágico e dourado (círculo mágico do Mago). As artes em preto e branco ganham brilhos coloridos ao redor.
- Imagens o tempo todo: toda página terá arte ou vídeo visível.

## Onde entra cada arquivo
- **Início:** vídeo da Suzue avançando com a espada como fundo em movimento, atrás do título THE ELDER. Abaixo, faixa em quadros de mangá com as cenas "A Queda", "A Toca" e "A Pantera".
- **Leitor do capítulo:** cada cena recebe uma arte no topo (ex.: Prólogo com o Mago Selado; a queda com a Besta do Abismo). Na cena em que Suzue acorda no fundo do labirinto, toca o vídeo dela se levantando.
- **Personagens:** cartões de Suzune Suzue e do Mago Selado com retrato recortado da ficha; ao clicar, abre a página do personagem com a ficha completa em tela cheia e as frases dela.
- **Bestiário (nova página):** Besta do Abismo, Pantera Negra e Criatura Réptil, com tamanho, comportamento e a ficha completa.
- **Arquivo do Mundo:** os cartões ganham artes de fundo das fichas.

## Próximas fichas
As fichas que você ainda vai mandar entram no mesmo formato (personagem ou besta) sem mudar o layout.

## Detalhes técnicos
- Upload das 7 fichas e 2 vídeos via lovable-assets (pointers em src/assets).
- Dados de personagens/bestas em `src/content/characters.ts` e `bestiary.ts`; rotas `/personagens/$slug`, `/bestiario`, `/bestiario/$slug`.
- Vídeos com `autoplay muted loop playsInline` e imagem de pôster.
- Tokens oklch novos em styles.css (tinta, vermelho, ciano, dourado), fonte de títulos estilo mangá (Bangers ou similar) + Cinzel.
