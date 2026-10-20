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
