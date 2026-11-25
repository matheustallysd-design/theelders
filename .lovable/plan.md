# Editar arrastando + tudo editável

## O que muda para você
1. **Arrastar para posicionar (imagens e textos)**: cada bloco selecionado ganha uma alça de arrastar. Arraste para cima/baixo para trocar a ordem na página, ou para os lados para encostar à esquerda, centro ou direita. Funciona com mouse e no celular (toque).
2. **Mover a imagem dentro do quadro**: ao selecionar uma imagem, clique e arraste dentro dela para escolher a parte que aparece — agora funciona em qualquer zoom (hoje só funcionava com zoom acima de 100).
3. **Redimensionar**: alça no canto do bloco para deixá-lo mais largo ou mais estreito.
4. **Caixas de texto**: clicar uma vez seleciona, clicar de novo escreve; o arrastar fica só na alça, para não brigar com a digitação.
5. **Partes que hoje não dá para editar** passam a ser editáveis:
   - Página inicial (título, frases, quadros, imagens e vídeos).
   - Topo das fichas de personagens e bestas (imagem grande, nome, citação).
   - Títulos das cenas do capítulo e topo do Arquivo do Mundo.
   - Cartões das listas de Personagens e Bestiário (imagem e resumo).
6. **Correções**: barra de ferramentas que some atrás de outros elementos, seleção que não desmarca ao clicar fora, e "Salvar" perdendo a posição do recorte.

## Detalhes técnicos
- BlockView: pointer events com `setPointerCapture` numa alça dedicada; reordenação por cálculo de posição do ponteiro entre blocos; arrasto horizontal converte em `align`.
- Pan da imagem: trocar `<img>` para `object-fit`/`object-position` também em zoom 100, mantendo `pos` salvo.
- Nova coluna `width` (porcentagem) em `content_blocks` via migração; incluída no save/fetch.
- Novo componente `EditableSlot` (texto/imagem únicos, guardados como blocos com page `slot-<nome>`) usado na home, heroes das fichas, títulos e cartões.
- Clique fora deseleciona; z-index alto na barra de ferramentas.
- Teste no navegador com conta de administrador de teste: arrastar, salvar, recarregar e conferir.
