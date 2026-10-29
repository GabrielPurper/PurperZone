# PurperZone — integração Supabase desta versão

Esta versão do frontend foi alinhada ao projeto Supabase ativo do PurperZone.

## Autenticação

- Supabase Auth com sessão persistente.
- Login por e-mail e senha com mensagens de erro visíveis.
- Cadastro com nome, username, e-mail, senha e confirmação.
- Confirmação de e-mail tratada pela tela de login.
- O banco já possui trigger de criação/atualização de perfil.
- Google/GitHub continuam preparados no frontend, mas os provedores precisam ser habilitados/configurados no Supabase para funcionar.

## Conteúdo social

- `posts` para publicações.
- `post_comments` para comentários.
- `post_reactions` para curtidas.
- `follows` para o feed "Seguindo".
- `post_media` + Storage `post-media` para mídia.
- Reels com vídeo vertical, autoplay por visibilidade e upload MP4/WebM.

## Perfis públicos

O frontend não expõe os campos privados de `profiles` para usuários públicos.

Foi criada a tabela `public_profile_cards`, com apenas:

- id
- username
- display_name
- avatar_url
- bio
- country/state/city

Ela é sincronizada automaticamente a partir de `profiles` por trigger e possui RLS de leitura pública sem escrita pelo cliente.

## Plataforma

- `projects` com `owner_id`.
- `games` com `owner_id`.
- `library_items` para biblioteca pessoal.
- `apps` para aplicativos públicos.
- `subscription_plans` para planos.
- `products`, `carts` e `cart_items` para loja/carrinho.
- `notifications` para notificações pessoais.
- `content_reports` para moderação.

## Stripe

O checkout usa a Edge Function `stripe-create-checkout` existente no Supabase. O navegador não recebe a chave secreta do Stripe.

## Segurança

Após as alterações, o Security Advisor do Supabase não apresentou lints de segurança.

## Atualização 2026-10-22 — segurança e marketplace

O banco conectado agora inclui `freelancer_profiles`, `freelance_services`, `freelance_jobs`, `freelance_proposals`, `freelance_contracts`, `freelance_milestones`, `freelance_payments`, `freelance_reviews`, `freelance_disputes`, `business_organizations`, `business_organization_members`, `game_access_offers` e `game_access_entitlements`. Veja `PURPERZONE-MARKETPLACE-ROADMAP.md` para os limites atuais e próximos passos.

A migração também corrigiu a view `public_profiles` para usar `public_profile_cards` com RLS de visibilidade e criou as tabelas `stories` e `account_contact_emails`, que o frontend já esperava encontrar.

A estrutura de dados não significa que o marketplace já está pronto para vender: o frontend, os endpoints confiáveis de contrato/checkout, Stripe Connect e os testes reais ainda precisam ser implementados. O teste de jogo de 5 dias está preparado no banco; o conteúdo do jogo só deve ser liberado por um servidor/endpoint que valide o direito de acesso.

A revisão P0 também corrigiu a visibilidade por campo: a view `public_profiles` não deve revelar país, estado ou cidade se o usuário configurou esses campos como privados. A função interna de leitura aplica `profile_visibility_rules` antes de devolver os dados.
