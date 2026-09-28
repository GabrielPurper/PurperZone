# PurperZone

O PurperZone é uma plataforma online pensada para reunir três experiências em um só lugar:

- **GitHub:** projetos, código e desenvolvimento.
- **Instagram:** posts, perfis e comunidade.
- **Steam:** jogos e biblioteca pessoal.

A interface não é um portfólio pessoal. O usuário participa do PurperZone como membro/criador, enquanto a plataforma é o produto principal.

## Arquitetura atual

- HTML + CSS + JavaScript puro.
- Supabase Auth para contas.
- Supabase Postgres para dados.
- RLS como camada de autorização no banco.
- Supabase Realtime para alterações instantâneas quando as tabelas estiverem habilitadas na publicação Realtime.
- Polling de 30 segundos e atualização ao retornar à aba como fallback.
- Escape básico de conteúdo renderizado para reduzir risco de XSS no frontend.

## Módulos

- Início: visão geral e explicação do PurperZone.
- Sobre: integrado à home, explicando o conceito GitHub + Instagram + Steam.
- Feed: publicações da comunidade.
- Projetos: projetos e repositórios.
- Biblioteca: jogos e progresso.
- Perfil: identidade e publicações do usuário.
- Aplicativos: módulo planejado para uma futura expansão.

## Supabase

O arquivo `supabaseClient.js` usa somente a chave pública/publishable do projeto. **Nunca coloque uma `service_role` no frontend.**

As tabelas usadas pela versão atual são `profiles`, `projects`, `posts`, `library_items` e `follows`.

Para Realtime funcionar como atualização instantânea, habilite as tabelas necessárias na publicação Realtime do projeto Supabase. O frontend continua fazendo polling como fallback.

## Importante

O projeto foi preparado para crescer. Recursos como comentários, curtidas com tabela própria, mensagens, notificações, mídia e o módulo Aplicativos podem ser adicionados posteriormente sem mudar o conceito central.
