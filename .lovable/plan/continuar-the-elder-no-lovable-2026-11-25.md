# Continuar THE ELDER no Lovable

O projeto enviado (v0.1) é um site de leitura da história THE ELDER: página inicial, leitor do Capítulo 01 "O Abismo" (com progresso e navegação por cenas), Arquivo do Mundo e Personagens. Visual escuro com dourado, fonte Cinzel. Não tem banco de dados nem login.

## O que será feito agora
1. Trazer todo o conteúdo e visual para este projeto, mantendo o texto do capítulo exatamente como está.
2. Transformar cada área em uma página própria com endereço (Início, Capítulos/leitor, Arquivo do Mundo, Personagens), para poder compartilhar links.
3. Manter o leitor: cenas, barra de progresso, anterior/próximo e botão "Salvar".
4. Guardar no navegador em que cena o leitor parou, para retomar depois.
5. Títulos e descrições próprios em cada página (para aparecer bem ao compartilhar).

## Depois (próximas etapas sugeridas, não nesta)
- Substituir as imagens temporárias por artes próprias.
- Completar a transcrição do capítulo.
- Personagens, raças, regiões e criaturas como dados editáveis.
- Painel administrativo com login e banco de dados (Lovable Cloud).

## Detalhes técnicos
- Migrar de React 18 + Vite SPA para TanStack Start: rotas `index`, `capitulos`, `mundo`, `personagens`; header/footer no layout raiz.
- `story.ts` copiado para `src/content/story.ts` sem alterações.
- CSS original adaptado para `src/styles.css` (fontes via `<link>` no head, cores como tokens).
- `lucide-react` mantido. Progresso salvo em localStorage lido após hidratação.
