# Alterações desta atualização

- Comparada a estrutura local enviada com a árvore `main` de `GabrielPurper/PurperZone`.
- Preservada a versão local mais completa; a versão do GitHub contém um conjunto menor/mais antigo de arquivos em várias áreas, portanto não foi usada para sobrescrever os arquivos locais mais avançados.
- Adicionado `supabase/performance-indexes.sql`, com os 20 índices de chaves estrangeiras aplicados no Supabase.
- Adicionado `SUPABASE-PERFORMANCE-REPORT.md`, com a verificação (154 FKs analisadas, 0 FKs sem índice), benefícios esperados e pendências de segurança/desempenho.
- Não foram removidos arquivos existentes nem alteradas políticas RLS.
- A conexão OAuth de provedores, autenticação Google/GitHub, pagamentos e fluxos de ponta a ponta continuam dependendo de configuração/testes no painel do Supabase e nos provedores; este pacote não declara esses fluxos como validados.
