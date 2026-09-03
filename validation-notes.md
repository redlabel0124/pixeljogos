# Validação manual — 22/08/2026

- O plano Mensal demonstrativo foi confirmado com sucesso na prévia autenticada; o cabeçalho mudou para Mensal e a biblioteca ficou liberada.
- O catálogo aparece com 51 jogos e miniaturas individuais; a prévia mostrou Subway Surfers, Age of War, Henry Stickmin, Super Mario 63, Super Smash Flash, Sonic Flash, Portal e demais cards.
- Player Flash: Portal: Flash Version abriu no modal; o botão exibiu "Tela cheia" e, após o clique, mudou para "Sair da tela cheia", confirmando o modo expandido. O Ruffle carregou o jogo e mostrou apenas o aviso de aceleração de hardware do navegador de teste.
- Player HTML5: Subway Surfers abriu no modal; o botão exibiu "Tela cheia" e, após o clique, mudou para "Sair da tela cheia". O conteúdo HTML5 carregou a tela inicial do jogo e o botão "Play Now" iniciou o conteúdo.
- Próxima verificação: abrir o Google Sites público e confirmar o comportamento da incorporação sob iframe.

## Google Sites

- A URL pública https://sites.google.com/view/playpixeljogos/home carregou a incorporação após a espera; o catálogo aparece dentro de um iframe com header Pixel Jogos, botões Planos/Entrar, cards e miniaturas.
- O Google Sites, nesta sessão pública, mostra o catálogo como visitante não autenticado; o botão do primeiro card Subway Surfers aparece como "Jogar agora" desabilitado/acinzentado até iniciar sessão.
- A área incorporada tem rolagem própria, o que confirma que o conteúdo está isolado no iframe. Ainda falta testar login e a abertura de um player dentro dessa incorporação.

## Retorno após login no navegador

- Após o usuário informar que concluiu o login, a sessão de navegador retornou inicialmente a `about:blank`; ao reabrir a URL pública do Google Sites, a incorporação começou a carregar novamente e exibiu o indicador visual de carregamento.
- É necessário aguardar mais uma atualização para confirmar se o cabeçalho passa a exibir a conta autenticada e se os botões de jogar são liberados dentro do iframe.

## Estado autenticado no Google Sites

- Depois do login informado pelo usuário, a página pública reaberta continuou mostrando o botão `Entrar` e a mensagem de visitante, portanto a sessão autenticada não apareceu no iframe nesta sessão de teste.
- Um clique coordenado sobre o botão visível `Entrar` não alterou a página nem abriu uma nova guia. Como os elementos internos do iframe não aparecem na lista de interação do navegador, a próxima etapa é inspecionar os frames e o console para determinar se o clique foi interceptado pelo editor/preview ou se o iframe bloqueou a navegação.

## Estrutura do iframe no Google Sites

- O Google Sites usa um iframe com sandbox permitindo scripts, popups, formulários, same-origin e escape de sandbox; o frame ocupa aproximadamente `x=62.7..1208.3`, `y=80..1310` em uma janela lógica de `1280x1100`.
- A lista de elementos do navegador não enumera os controles internos do iframe, pois eles pertencem ao documento incorporado. O teste coordenado anterior usou a escala visual reduzida e não é conclusivo; será necessário usar as dimensões lógicas do navegador ou validar diretamente na página incorporada.

## Comparação direta versus incorporação

- No domínio direto `https://pixelshop-wguusktr.manus.space/`, o login informado foi reconhecido: o cabeçalho mostrou `JK`, `Perfil` e `Planos`. Entretanto, o plano exibido era `Sem plano`, o que indica que a autenticação foi concluída, mas a ativação demonstrativa anterior não ficou associada a esta sessão/conta.
- Ao voltar ao Google Sites, a incorporação iniciou novo carregamento; ainda é necessário aguardar a atualização para comparar o cabeçalho do iframe. O fato de o domínio direto reconhecer a conta confirma que o login foi concluído no domínio da loja, enquanto o iframe pode estar usando um contexto de cookies diferente.

## Console do Google Sites

- O iframe permanece como visitante após a atualização: o cabeçalho continua com `Entrar`, a mensagem pede início de sessão e os cards não liberam o player.
- O console da página externa não registrou erros. Isso aponta mais para isolamento de sessão/cookies entre o domínio do Google Sites e o domínio Manus do que para uma falha JavaScript visível.

## Correção adicional do retorno OAuth

- O teste coordenado no Google Sites abriu corretamente `https://pixelshop-wguusktr.manus.space/?login=1&returnTo=google-sites`; a rota reconheceu a sessão `JK` e exibiu o catálogo, mas permanecia nessa URL em vez de retornar ao Google Sites.
- Foi corrigido o fluxo em `Home.tsx`: quando essa URL especial já possui sessão válida, a página agora redireciona automaticamente para `https://sites.google.com/view/playpixeljogos/home`. A chamada de `requestStorageAccess()` permanece opcional antes da abertura da nova aba.
- O retorno do iframe ainda depende da política de cookies/Storage Access do navegador; a validação seguinte deve confirmar se, após o redirecionamento, o iframe reconhece a sessão ou se é necessário recarregar a página incorporada.

## Resultado da correção

- Na prévia, abrir `/?login=1&returnTo=google-sites` com a sessão `JK` autenticada redirecionou automaticamente para `https://sites.google.com/view/playpixeljogos/home`, confirmando a correção do retorno que antes deixava a aba parada na loja.
- A cobertura automatizada ficou em 23 testes Vitest aprovados, distribuídos em 7 arquivos, e `tsc --noEmit` também concluiu sem erros. Os avisos de `window.scrollTo()` pertencem ao ambiente jsdom dos testes e não falharam a suíte.
- A documentação foi atualizada de 41 para 51 jogos e passou a explicar a solicitação opcional de Storage Access no iframe.

## Auditoria das miniaturas

- A auditoria determinística encontrou exatamente 51 jogos e 51 URLs de miniaturas, sem mapeamentos ausentes, extras ou URLs duplicadas.
- A distribuição dos assets é de 22 JPG, 3 PNG, 2 WEBP e 24 SVG individuais. O card renderiza a miniatura correspondente ao nome do jogo e não utiliza os campos de emoji do catálogo.
- Os assets específicos dos dez jogos adicionados também estão presentes: Fireboy and Watergirl, Vex, Swords and Sandals, Raft Wars, Red Ball, Action Turnip, Strike Force Heroes, The Fancy Pants Adventures 2, Third World Farmer e Electricman 2.

## Validação publicada após checkpoint

- Na versão publicada, o clique em `Entrar` dentro do Google Sites abriu `https://pixelshop-wguusktr.manus.space/?login=1&returnTo=google-sites` em nível superior.
- A sessão `JK` foi reconhecida nessa rota e o catálogo apareceu com `Sem plano`; o estado de plano é separado da autenticação, portanto ainda exige ativação demonstrativa se for necessário abrir um jogo.
- O próximo passo é aguardar a execução do efeito de retorno automático e verificar se a aba volta ao Google Sites; somente depois será possível determinar se o iframe passa a receber a sessão.

## Revalidação do domínio publicado

- Após o checkpoint, o Google Sites continuou exibindo o botão Entrar. O clique abriu a rota publicada `/?login=1&returnTo=google-sites` e o domínio reconheceu a sessão `JK`, mas permaneceu nessa rota após o carregamento.
- Isso indica que a abertura em nova aba e a sessão direta funcionam, porém o redirecionamento automático não foi comprovado no domínio publicado; é necessário revisar a condição do efeito de autenticação antes de marcar a integração como concluída.

## Revalidação após sincronização do bundle

- O domínio público passou a servir o bundle esperado: `requestStorageAccess`, quatro marcadores de `google-sites` e o redirecionamento `window.location.replace` foram encontrados no JavaScript publicado.
- O clique em Entrar no Google Sites abriu novamente a rota `https://pixelshop-wguusktr.manus.space/?login=1&returnTo=google-sites`; a tela estava em carregamento no instante do clique. É necessário aguardar a hidratação para confirmar a volta automática.
