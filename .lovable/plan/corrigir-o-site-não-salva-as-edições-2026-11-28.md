# Corrigir: o site não salva as edições

## Causa (confirmada)
O código colado no GitHub para o editor de blocos (arrastar/áudio) tenta ler e gravar uma coluna "blocks" que não existe no banco. O banco guarda um registro por bloco (texto, imagem, ordem etc.). Resultado: as páginas não carregam o que já foi salvo e todo "Salvar" falha.

## O que será feito
1. Ajustar o carregamento das páginas para ler os blocos já existentes (um por linha, em ordem), assim as 97 edições das cenas reaparecem.
2. Ajustar o "Salvar" para gravar cada bloco no formato do banco, mantendo arrastar com linha "SOLTAR AQUI", subir/descer, áudio/dublagem e todas as opções de estilo.
3. Guardar os campos novos de áudio (trilha/dublagem, volume, nome) dentro do campo de estilo que já existe — sem mudar o banco.
4. Conferir "Original"/"Restaurar" e os textos do início (esses já usam o formato certo).
5. Testar no site: editar, salvar, recarregar e ver que ficou.

## Detalhes técnicos
- src/components/BlockPage.tsx: load = select * where page order by position → map linhas para Block (audioMode/label/volume/caption de style jsonb); save = delete where page + insert linhas com position = índice.
- Sem migração. Teste vitest para o mapeamento bloco ⇄ linha (ida e volta).
