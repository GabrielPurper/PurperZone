# Alterações desta atualização

- Comparada a estrutura local enviada com a árvore `main` de `GabrielPurper/PurperZone`.
- Preservada a versão local mais completa; a versão do GitHub contém um conjunto menor/mais antigo de arquivos em várias áreas, portanto não foi usada para sobrescrever os arquivos locais mais avançados.
- Adicionado `supabase/performance-indexes.sql`, com os 20 índices de chaves estrangeiras aplicados no Supabase.
- Adicionado `SUPABASE-PERFORMANCE-REPORT.md`, com a verificação (154 FKs analisadas, 0 FKs sem índice), benefícios esperados e pendências de segurança/desempenho.
- Não foram removidos arquivos existentes nem alteradas políticas RLS.
- A conexão OAuth de provedores, autenticação Google/GitHub, pagamentos e fluxos de ponta a ponta continuam dependendo de configuração/testes no painel do Supabase e nos provedores; este pacote não declara esses fluxos como validados.


## 2026-10-21 — Proteção dissuasória de mídia
- Removidas ações simples de download em controles de vídeo dos Reels e clipes gamer.
- Bloqueados menu de contexto e arrastar/soltar diretamente sobre mídia.
- Stories deixam de oferecer link direto para abrir formatos de mídia não suportados.
- Documentadas limitações: isso não impede capturas de tela nem substitui políticas privadas do Supabase Storage.

## 2026-10-21 — Biblioteca unificada em formato de galeria
- A Biblioteca agora apresenta uma grade visual inspirada em galerias sociais, com filtros para Tudo, Social, Fotos, Reels, Código, Projetos e Games.
- A galeria combina posts públicos, anexos ativos de `post_media`, projetos públicos e jogos públicos, ordenados por data.
- Mídias privadas são exibidas por URL assinada temporária quando as políticas do Storage permitem. Isso não impede captura de tela ou cópia por quem consegue visualizar o conteúdo.
- A coleção pessoal baseada em `library_items` foi preservada separadamente em uma seção expansível.
- Para validar a galeria real, confira as políticas RLS de `posts`, `post_media`, `projects`, `games` e o acesso ao bucket `post-media`.

## 2026-10-22 — Segurança P0 e base de marketplace
- A view `public_profiles` passou a ler os cartões de perfil públicos com `security_invoker = true`; removida a política permissiva `USING (true)` que anulava o filtro de visibilidade.
- Criadas no Supabase as tabelas ausentes `stories` e `account_contact_emails`, com RLS.
- Adicionadas estruturas para freelancers, serviços, vagas, propostas, contratos, marcos, pagamentos, avaliações, disputas e organizações empresariais.
- Adicionadas ofertas e direitos de acesso a jogos, com teste configurável (5 dias por padrão) e função `start_game_trial` limitada por RLS.
- Adicionadas proteções para impedir que usuários se autodeclarem verificados ou marquem o e-mail alternativo como verificado.
- A proteção contra senhas vazadas permanece pendente de ativação no painel do Supabase Auth; a opção depende do plano do projeto.
- O marketplace ainda precisa de frontend, Edge Functions de contratação/pagamento, Stripe Connect e testes ponta a ponta antes de ser considerado pronto para produção.
- Revisão adicional de privacidade: a view `public_profiles` agora mascara também campos individuais segundo `profile_visibility_rules`; validação de consulta confirmou que país, estado e cidade marcados como privados não aparecem na view pública.
