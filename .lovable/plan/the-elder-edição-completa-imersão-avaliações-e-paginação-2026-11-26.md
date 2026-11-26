# THE ELDER — edição completa, imersão, avaliações e paginação

## 1. Terminar a edição direta (o que ficou pela metade)
- Arrastar blocos (texto e imagem) para mudar a ordem na página, com alça visível.
- Alça no canto para mudar a largura do bloco (25% a 100%).
- Arrastar o foco da imagem dentro do quadro em qualquer zoom.
- Texto: 1º clique seleciona, 2º clique abre a escrita; clicar fora desmarca.
- Barra de atalhos sempre visível (fixa ao rolar).
- Ligar edição nas partes que faltam: títulos e frases do Início, topo das fichas, cartões de Personagens e Bestiário.

## 2. Novas opções de edição
- Cor do texto (vermelho, ciano, dourado, branco) e fonte (mangá / título / normal).
- Novos blocos: balão de fala, citação, divisor, dois quadros lado a lado.
- Borda/inclinação do quadro (reto, inclinado, sem borda) e sombra.
- Atalhos de teclado: Ctrl+Z desfazer, Ctrl+S salvar, Delete apagar.

## 3. Painel da obra — novas opções
- Criar novos capítulos e cenas (título, status "Em breve"/"Publicado", sinopse).
- Criar novos personagens e bestas sem mexer em código.
- Moderar avaliações (ocultar/apagar).
- Apagar mídias enviadas.

## 4. Imersão do leitor
- Botão de áudio ambiente (música opcional, desligada por padrão; você envia a faixa).
- Dois modos de leitura no capítulo: Cena a Cena e Rolo Contínuo (webtoon).
- Glossário clicável: nomes como "Mago Selado" ou "Besta do Abismo" no texto abrem uma janelinha com a ficha.
- Mapa do Abismo: andares clicáveis mostrando as bestas de cada um.
- Efeitos sutis: névoa no fundo e brilho ciano nas runas.

## 5. Aba de Avaliações
- Nova página "Avaliações": nota de 1 a 5 estrelas + comentário.
- Precisa entrar na conta para avaliar; uma avaliação por pessoa (pode editar).
- Média de estrelas no topo e lista das opiniões; reações rápidas no fim do capítulo (arrepiante, épico, misterioso).

## 6. Rodapé numerado (paginação)
- No capítulo: barra com números 01…09 para pular direto para uma cena, com anterior/próxima.
- Nas listas (Avaliações, Personagens, Bestiário quando crescerem): números de página.

## Ordem de entrega
1 e 2 → 6 → 5 → 3 → 4.

## Detalhes técnicos
- Tabelas novas: `reviews` (user_id, rating 1–5, comment, hidden), `reactions`, `chapters`, `entries` (personagens/bestas criados pelo painel), com RLS: leitura pública, escrita do próprio autor, moderação via `has_role(admin)`; GRANTs em cada tabela.
- Novas colunas em `content_blocks`: color, font, frame (padrão definido, aditivas).
- Arrastar com pointer events nativos; reordenação salva `position`.
- Glossário: lista de termos derivada de characters/bestiary, aplicada no render do texto sem alterar o texto original.
- Testes para regra de nota 1–5 e uma avaliação por pessoa.
