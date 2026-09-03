# Pixel Jogos — autenticação e incorporação

A aplicação usa o OAuth já integrado ao projeto full-stack. O botão de entrada inicia o fluxo seguro pelo servidor, e a sessão é mantida por cookie protegido. O usuário autenticado é carregado pelo endpoint de identidade e suas informações de plano são lidas do banco de dados.

O fluxo da aplicação é: autenticação, tela de planos, carrinho demonstrativo, escolha entre Pix, Cartão e Boleto, confirmação fictícia, ativação persistente do plano e catálogo protegido. A confirmação chama o procedimento protegido de ativação; a interface só muda para o catálogo quando a operação de banco retorna sucesso.

Para incorporar no Google Sites, publique a aplicação pelo painel do projeto e copie a URL pública. No Google Sites, use **Inserir → Incorporar → Por URL**. Recomenda-se abrir a aplicação em uma página própria ou em um iframe com altura ampla. O Google Sites não deve ser usado para armazenar sessões, planos ou senhas; essas responsabilidades permanecem no servidor da aplicação.

Os controles interativos usam elementos semânticos, botões com `type`, estado `aria-pressed` na seleção de pagamento e rótulos `aria-label` nos links dos jogos. A ordem de tabulação segue a ordem visual da tela, e os controles podem ser acionados por Enter ou Espaço conforme o comportamento nativo de botões e links. O catálogo inclui exemplos HTML5 e um link para uma biblioteca de conteúdo Flash preservado. Para substituir os exemplos pelos jogos originais do Pixel Jogos, altere a lista `games` em `client/src/pages/Home.tsx` e informe a URL de cada jogo ou player compatível.

O pagamento desta versão é demonstrativo e não processa valores. Para cobrança real, seria necessária uma integração específica de pagamentos e uma nova revisão de segurança.

## Catálogo original integrado

A primeira tela exibe os 51 jogos recuperados do catálogo anterior. O jogo HTML5 original abre dentro de um iframe no modal; os jogos Flash usam os arquivos SWF originais via Ruffle dentro do modal, sem navegação para uma página de catálogo externa. As fontes dos jogos continuam hospedadas nas URLs originais, incluindo GitHub Pages e Raw GitHub, portanto a disponibilidade depende desses serviços externos.

## Google Sites e autenticação fora do iframe

No Google Sites, remova blocos antigos que apontem para `login.microsoftonline.com` ou outros logins institucionais e mantenha somente a incorporação da URL pública `https://pixelshop-wguusktr.manus.space`. Quando o botão **Entrar** for acionado dentro de um iframe, a plataforma solicita, quando disponível, acesso ao armazenamento de primeira parte durante o gesto do usuário e abre uma segunda aba com `/?login=1&returnTo=google-sites` para iniciar o OAuth fora do iframe. Se o navegador não oferecer ou negar essa permissão, o fluxo em nova aba continua funcionando: após o callback, a aba top-level solicita um token de handoff curto em `/api/oauth/embed-token`, envia-o apenas por `postMessage`/`BroadcastChannel` same-origin e o iframe o mantém somente em `sessionStorage` para as chamadas Bearer; em ambientes que bloquearem a comunicação, o iframe pode precisar ser recarregado para reconhecer a sessão. A página incorporada original permanece aberta; ao concluir, o callback retorna automaticamente ao Google Sites na aba de autenticação. O site publicado do Google Sites deve estar acessível para os visitantes pretendidos; políticas da conta institucional podem continuar impedindo o acesso, mesmo quando a plataforma funciona diretamente.
 Após o login iniciado com `returnTo=google-sites`, o callback redireciona automaticamente para `https://sites.google.com/view/playpixeljogos/home`. O destino é validado por comparação exata para impedir redirecionamentos arbitrários; o login direto fora do Google Sites continua retornando à própria plataforma.


## Vercel API fix
This version bundles the Express/tRPC API with esbuild during the Vercel build so server/*.ts files are included in the serverless function. The build creates api/index.js and removes the source api/index.ts before Vercel function detection.
