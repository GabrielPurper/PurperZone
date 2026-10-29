# Guia de manutenção do código — PurperZone

Este guia acompanha os comentários adicionados aos arquivos-fonte. Os comentários explicam o propósito dos módulos e os pontos de alteração mais comuns sem mudar o comportamento do site.

## Como trabalhar sem perder alterações

1. **Edite os arquivos na raiz do projeto** (`feed.js`, `feed.html`, `style.css` etc.).
2. Execute `node build.mjs` para copiar as fontes atualizadas para `dist/`. Não faça uma correção apenas em `dist/`, porque a próxima compilação a substituirá.
3. Teste a página no navegador e confira o Console/Network. As consultas ao Supabase dependem do esquema real, das políticas RLS e da sessão do usuário.
4. Antes de publicar, rode `node --check` nos arquivos JavaScript e confira se os IDs e atributos `data-*` do HTML continuam iguais aos seletores usados no JavaScript.

## Arquivos principais da interface

| Arquivo | Onde alterar |
|---|---|
| `feed.html` / `feed.js` | Painel Principal, publicações, curtidas, compartilhamento e busca rápida. |
| `search.html` / `search.js` | Campo de pesquisa global, filtros e apresentação dos resultados. |
| `games.html` / `games.js` | Vitrines Steam/Epic e conteúdo gamer da comunidade. |
| `projects.html` / `projects.js` | Repositórios GitHub, pacotes npm e conteúdo de programação. |
| `reels.html` / `reels.js` | Formato vertical dos vídeos, curtidas, comentários e compartilhamento. |
| `profile.html` / `profile.js` | Dados e conteúdo do perfil. |
| `style.css`, `main.css`, `reset.css`, `variables.css` | Estilos globais, componentes e variáveis visuais. |
| `app.js` | Utilitários compartilhados; alterações aqui podem afetar várias páginas. |
| `supabaseClient.js` / `supabase.js` | Inicialização do cliente público do Supabase. Nunca inserir `service_role` ou segredos. |
| `nav.ejs`, `header.ejs`, `footer.ejs` e outros `.ejs` | Fragmentos para uma hospedagem que execute EJS no servidor. GitHub Pages serve arquivos estáticos e não processa EJS. |
| `supabase/*.sql` e `public_profile_cards.sql` | SQL, índices e políticas. Revisar RLS e impacto antes de aplicar em produção. |
| `build.mjs` | Gera a cópia de publicação em `dist/`. |

## Convenções de segurança e manutenção

- Texto digitado ou recebido de usuários deve ser escapado com `escapeHtml` antes de entrar em HTML criado por template string.
- Não exponha tokens OAuth, chaves privadas, `service_role` nem credenciais em JavaScript entregue ao navegador.
- As APIs públicas da Steam, Epic, GitHub e npm podem mudar, aplicar limites ou falhar; mantenha estados vazios e mensagens de erro.
- URLs assinadas do Supabase Storage expiram. Não as trate como links permanentes.
- Ao mudar nome de tabela ou coluna, confirme o esquema real do Supabase e as políticas RLS antes de alterar as consultas.
- Comentários explicam intenção, mas não substituem testes de autenticação, permissões ou integração em navegador.

## Por que há comentários em arquivos HTML, CSS, JavaScript, EJS e SQL?

Os comentários estruturados foram inseridos dentro dos próprios arquivos para que apareçam ao abrir o código no repositório. Arquivos JSON e `manifest.webmanifest` permanecem sem comentários porque comentários não são válidos nesses formatos e podem quebrar a leitura.

## Stories, publicação e segurança da conta (21/10/2026)

- `feed.html` contém o bloco visual de Stories, o formulário temporário e os filtros do painel. Preserve os IDs `stories-list`, `story-form`, `story-create`, `story-cancel`, `story-content` e `story-media-url`, pois são usados em `feed.js`.
- `feed.js` consulta `public.stories`, mostra somente itens cuja expiração ainda está no futuro e grava o fim de validade em 24 horas. O seletor de publicação envia `metadata.content_type` com `post`, `code`, `project` ou `game`; para alterar categorias, ajuste `applyCategory()` e os atributos `data-feed-item` dos cartões.
- `settings.html` adiciona a interface de MFA/TOTP e e-mail secundário. `settings.js` usa `supabaseClient.auth.mfa` para cadastrar/verificar/remover o fator TOTP e usa `account_contact_emails` para o contato privado.
- `supabase/stories-and-account-security.sql` cria as tabelas e políticas RLS. Execute a migration no SQL Editor antes de testar Stories e e-mail secundário. Não copie segredos de MFA para o banco da aplicação.
- O e-mail secundário ainda precisa de um fluxo de verificação por OTP/link antes de ser considerado comprovado ou usado para recuperação. Não exponha essa tabela em views públicas.
- Os arquivos equivalentes de produção também foram atualizados em `dist/`; se seu deploy gerar `dist/` novamente, verifique se o processo de build não sobrescreve mudanças manuais.
