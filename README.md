# PurperZone — Frontend

Frontend modular do PurperZone, preparado para GitHub Pages e integrado ao Supabase.

## O que já está conectado

- Supabase Auth: cadastro, login, logout, recuperação de senha e OAuth quando configurado.
- Profiles, follows, posts, comentários, reações e compartilhamentos.
- Projects e biblioteca.
- Games e busca global.
- Apps.
- Mensagens, leituras e denúncias.
- Notificações e preferências.
- Loja, carrinho, pedidos e planos.
- Relatórios, moderação e apelações do próprio usuário.
- Analytics e descoberta.
- Configurações de conta e privacidade.
- Estruturas Jarvis já existentes no Supabase.
- Página de manutenção e fallback 404.

## GitHub Pages + EJS

O GitHub Pages não executa EJS no servidor. Por isso, este pacote possui duas camadas:

- `*.html`: versão publicada diretamente no GitHub Pages.
- `ejs/`: templates reutilizáveis para quem quiser gerar HTML com Node/EJS no futuro.

Para gerar as páginas EJS localmente:

```bash
npm install
npm run build
```

O build copia os arquivos públicos e renderiza os templates para `dist/`.

## Configuração Supabase

A conexão pública está em `js/api/supabase.js`. Ela usa a URL e a publishable key do projeto PurperZone. Nunca coloque `service_role` ou qualquer segredo no frontend.

O frontend usa `@supabase/supabase-js` via CDN, então o GitHub Pages não precisa de bundler para funcionar.

## Estrutura

```text
PurperZone/
├── index.html
├── login.html
├── feed.html
├── projects.html
├── games.html
├── library.html
├── apps.html
├── search.html
├── messages.html
├── notifications.html
├── profile.html
├── settings.html
├── store.html
├── plans.html
├── moderation.html
├── jarvis.html
├── maintenance.html
├── 404.html
├── css/
├── js/
├── pages/
├── ejs/
└── build/
```

## Importante

A autorização real continua sendo responsabilidade do Supabase RLS. O frontend apenas apresenta a interface e chama o Data API com a chave pública.

A integração visual da música do lobby não foi incluída nesta versão: o banco já está preparado, mas o player será conectado quando os arquivos de música estiverem no GitHub.
