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


## Atualização de interface — Painel Principal e descoberta

- O Feed passou a se chamar **Painel Principal** e mistura publicações, projetos e jogos da comunidade.
- A busca possui sugestões enquanto a pessoa digita e filtros por contas, publicações, Reels, games, projetos e códigos.
- Games consulta ofertas em fontes públicas da Steam e jogos promocionais/gratuitos da Epic Games quando as APIs públicas respondem; sempre oferece links oficiais de fallback.
- Projetos & Dev consulta a API pública do GitHub e o registry público do npm, além dos projetos e discussões disponíveis no Supabase.
- Reels usa proporção vertical 9:16 e ações com rótulos e estados acessíveis.
- O logotipo das páginas internas retorna ao Painel Principal. Na página inicial, o link da marca e os CTAs mudam para o painel quando já existe uma sessão.

**Limites de integrações externas:** APIs públicas podem impor CORS, limites de requisições, alterar formatos ou ficar indisponíveis. O site mostra links de fallback. A integração direta com Medal, notificações persistentes de promoções e um feed externo de notícias completo exigem integração/API própria e não são simulados como se estivessem ativos.

## Atualização de produto — 22/10/2026

- **Segurança de perfis:** `public_profiles` usa `public_profile_cards` com `security_invoker`; a leitura pública respeita a regra de visibilidade.
- **Marketplace freelance:** a base Supabase para profissionais, serviços, vagas, propostas, contratos, etapas, pagamentos, avaliações, disputas e organizações empresariais foi criada.
- **Jogos pagos e testes:** o Supabase agora suporta ofertas por jogo e um teste configurável (5 dias por padrão), com um único teste por usuário/jogo e direitos de acesso separados do catálogo.
- **Pendente:** interface de marketplace, Edge Functions de contratação/checkout, Stripe Connect, liberação real de jogos no servidor e testes integrados.
- **Ação manual de segurança:** ativar a proteção contra senhas vazadas em Authentication → Settings / Password Security se disponível no plano. Consulte `PURPERZONE-MARKETPLACE-ROADMAP.md`.
