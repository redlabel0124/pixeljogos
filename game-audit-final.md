# Auditoria final dos jogos

A auditoria das 51 fontes do catálogo foi executada após a expansão. O único erro encontrado foi `Portal: Flash Version`, que apontava para `portal-the-flash-version.swf` inexistente no repositório. A fonte foi corrigida para `portal-flash.swf`, com resposta HTTP 200.

Os demais registros retornaram HTTP 200, incluindo as fontes DIRECT_FLASH dos novos jogos e a página HTML5 de Third World Farmer. O player foi atualizado para resolver `FLASH::` pela base do repositório e `DIRECT_FLASH::` pela URL direta.

Também foi adicionado um controle de tela cheia no modal do player, aplicável ao contêiner do Flash e ao iframe HTML5, com entrada, saída e atualização por `fullscreenchange`. A cobertura automatizada confirma Portal com plano ativo, Third World Farmer com iframe e o botão de tela cheia. TypeScript e 21 testes Vitest passaram. A prévia foi revisada em 375x812 e 1280x720.
