# Mais opções de edição + tudo editável (inclusive o Início)

## O que muda para você
1. **Tudo editável no Modo edição**
   - Início: frases e títulos (já parcialmente), vídeo do topo, capa, os 3 quadros (imagem, onomatopeia, título e frase), imagem do Elder, rótulos "01 / CENAS", "02 / O ANCIÃO" e textos dos botões.
   - Topo de Capítulos, Arquivo do Mundo, Personagens e Bestiário (rótulo, título, frase de abertura e arte de fundo).
   - Cartões das listas de Personagens e Bestiário (imagem, nome, resumo).
   - Topo das fichas (imagem grande, nome, citação) e títulos das cenas.
   - Rodapé do site (frase e marca).
2. **Novas opções na barra de atalhos de cada texto**: negrito/itálico, tamanho (P, M, G, GG), alinhamento, cor (incluindo seletor livre), fonte, espaçamento entre linhas, sombra/brilho no texto.
3. **Novas opções para imagens e vídeos**: trocar, mover o foco arrastando, zoom, girar levemente, borda (reta, inclinada, sem), cantos arredondados, filtros (preto e branco, sépia, escurecer, contraste), altura do quadro, legenda.
4. **Novos tipos de bloco**: balão de fala, onomatopeia, citação, divisor, dois quadros lado a lado, espaço em branco e botão com link.
5. **Na página inicial dá para adicionar blocos novos** entre as seções, igual às outras páginas.
6. **Painel**: botão "Restaurar" também para as partes da página inicial e dos topos.

## Detalhes técnicos
- Expandir `Editable.tsx`: `EText` ganha toolbar compacta (tamanho, cor, fonte, alinhamento, peso) salva em colunas existentes (color/font) + novo campo `style` jsonb; `EImg` como componente com filtros/rotação/raio/altura.
- Migração: coluna `style jsonb default '{}'` em `content_blocks` para as opções novas (tamanho, peso, filtros, rotação, raio, altura, link).
- BlockPage: novos kinds (`spacer`, `button`, `sfx`), aplica `style` no render; toolbar com seções.
- Início: envolver todos os elementos fixos com EText/EImg e inserir `BlockPage page="home"` entre seções.
- Teste no navegador com conta admin de teste: editar, salvar, recarregar e conferir; testes vitest das regras de estilo.
