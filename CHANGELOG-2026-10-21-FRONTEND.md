# PurperZone — atualização do front-end (21/10/2026)

## Alterações
- Renomeada a navegação visível de Feed para Painel Principal.
- Painel Principal agora mistura publicações, projetos públicos e jogos públicos da comunidade.
- Busca por digitação com sugestões e filtros por contas, publicações, Reels, games, projetos e códigos.
- Games deixa de ser um formulário de cadastro e passa a mostrar ofertas Steam, promoções/jogos grátis Epic quando as APIs respondem, e publicações/clipes gamer do Supabase.
- Projetos deixa de ser um formulário de cadastro e passa a mostrar repositórios atualizados do GitHub, pacotes npm, projetos públicos e discussões de código da comunidade.
- Reels refinado para proporção 9:16 com ações de curtir, comentar e compartilhar mais claras.
- Logotipo e links de perfil revisados para facilitar o retorno ao Painel Principal e ao perfil autenticado.
- Perfil exibe identidade básica da sessão mesmo quando a linha de perfil ainda não foi sincronizada.
- O build estático `dist/` foi regenerado para refletir os arquivos da raiz.

## Validação
- Verificada a sintaxe JavaScript dos módulos da raiz e de `dist/`.
- Páginas HTML verificadas com parser.
- Não foi possível validar sessões reais, políticas RLS, APIs externas ou o upload de vídeo sem uma execução autenticada no navegador. APIs externas podem ficar indisponíveis ou impor limites.
- Medal não foi integrado como API de terceiros; a área Games mostra clipes/publicações da comunidade PurperZone quando existem e oferece link para o site do Medal.
