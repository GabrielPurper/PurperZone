# PurperZone

[![Status](https://img.shields.io/badge/Status-Em%20desenvolvimento-yellow?style=flat-square)](https://github.com/GabrielPurper/PurperZone)

**PurperZone** reúne comunidade, projetos, jogos, aplicativos, loja e a futura integração web do Jarvis em uma única plataforma.

> 🚧 Projeto em desenvolvimento.

## Frontend atual

- Feed e Reels
- Perfis e seguidores
- Projetos
- Games
- Biblioteca
- Apps
- Loja e planos
- Mensagens
- Notificações
- Busca
- Moderação
- Jarvis Web
- PWA
- Supabase Auth/Postgres/Storage/Realtime/RLS

## Autenticação

O frontend suporta:

- Cadastro com nome, data de nascimento, username, e-mail, senha e confirmação.
- Login por e-mail e senha.
- Recuperação de senha.
- Login/cadastro via Google.
- Login/cadastro via GitHub.
- OAuth com PKCE.
- Sincronização de perfil após OAuth.
- Tratamento de erros visível.
- Logout local seguro.

Google e GitHub precisam estar habilitados no Supabase Auth com suas credenciais OAuth. Veja `OAUTH-SETUP.md`.

## Segurança

Nunca coloque `service_role`, segredos OAuth ou segredos do Stripe no frontend. O navegador usa somente a chave pública do Supabase e as operações privilegiadas ficam em Edge Functions.

## Estrutura

Os arquivos de interface permanecem na raiz para funcionar diretamente no GitHub Pages. Os arquivos `.ejs` são templates de referência; o GitHub Pages não executa EJS no servidor.

## Desempenho do Supabase

O registro das melhorias de índices e das verificações realizadas em 18/10/2026 está em [`SUPABASE-PERFORMANCE-REPORT.md`](SUPABASE-PERFORMANCE-REPORT.md). O SQL idempotente de referência fica em [`supabase/performance-indexes.sql`](supabase/performance-indexes.sql). Os índices já foram aplicados no projeto conectado; consulte o relatório antes de executar em outro ambiente.
