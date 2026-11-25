# Mais interatividade, texto misturado com imagens e painel de edição

## 1. Leitura mais interativa (estilo mangá)
- **Capítulo:** em vez de uma arte só no topo, cada cena vira uma sequência de quadros. Os parágrafos ficam entre as imagens, que entram na tela conforme você rola (aparecem com um leve zoom ou deslizando).
- **Balões e onomatopeias** surgem nos quadros no momento da leitura ("ZAN!", "GRRRAAH!").
- **Personagens e Bestiário:** a página alterna blocos de texto e recortes da ficha (rosto, arma, detalhes) lado a lado. Ao clicar numa imagem, ela abre ampliada.
- **Início:** os quadros reagem quando o mouse passa por cima (inclinam e mudam de cor), e uma linha do tempo leva aos capítulos.
- **Arquivo do Mundo:** os cartões abrem com uma animação e mostram a arte junto com o texto.

## 2. Contas e acesso de administrador
- Uma página de login com e-mail e senha.
- Só quem for administrador vê e usa as ferramentas de edição. Os visitantes só leem.
- A primeira conta criada vira administradora. Depois, ela pode promover outras contas no painel.

## 3. Painel da obra (só para administradores)
- Uma página "Painel" com as seções Capítulos e cenas, Personagens, Bestiário, Arquivo do Mundo e Mídias.
- Nela dá para criar, editar, reordenar e apagar itens, além de enviar novas imagens e vídeos.
- O texto atual do Capítulo 01 e as fichas entram como conteúdo inicial, sem nenhuma alteração.

## 4. Editar clicando na própria página
- Com o "Modo edição" ligado, cada texto e cada imagem ganha um contorno ao passar o mouse.
- Ao clicar, aparece uma barra de atalhos:
  - **Texto:** editar ali mesmo, negrito ou itálico, tamanho.
  - **Imagem:** trocar (enviar nova ou escolher das mídias), ajustar o enquadramento arrastando, aplicar zoom.
  - **Posição:** subir ou descer o bloco, alinhar à esquerda, ao centro ou à direita.
  - **Bloco:** duplicar, apagar, adicionar texto ou imagem abaixo.
- Botões "Salvar" e "Desfazer". As mudanças valem para todos os visitantes depois de salvas.

## Detalhes técnicos
- Ativar o Lovable Cloud: banco de dados, login e armazenamento de arquivos.
- Tabelas para capítulos, cenas, blocos (texto ou imagem, ordem, alinhamento, enquadramento e zoom), entradas (personagens e bestas) e mídias. Os papéis ficam numa tabela separada (`user_roles` com `has_role`).
- Leitura pública. Só administradores podem escrever, e isso é verificado no próprio servidor.
- Conteúdo inicial do capítulo e das fichas inserido na migração.
- O progresso de leitura continua salvo no navegador.
- Animações feitas com CSS e IntersectionObserver, sem bibliotecas pesadas.
