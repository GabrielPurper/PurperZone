# Aplicativos internos e instalação móvel

## O conceito desejado
- **Apps PurperZone** são miniaplicativos executados dentro da plataforma (mini ferramentas, jogos, extensões de produtividade), em sandbox e com permissões declaradas.
- **Aplicativo móvel** é um invólucro/cliente para Android e iOS. O PWA pode ser instalado pelo navegador; para publicação em lojas, considerar Capacitor ou um cliente React Native.

## PWA (primeiro passo)
O projeto já contém `manifest.webmanifest`, `sw.js` e `pwa.js`. Sirva por HTTPS, valide ícones e `start_url`, teste instalação no Chrome Android e comportamento offline. GitHub Pages pode servir o PWA estático; recursos de login e dados continuam dependentes do Supabase e da rede.

## APK / lojas
1. Consolidar as rotas e garantir layout responsivo.
2. Corrigir callback OAuth para o domínio real e deep links do app.
3. Testar login Google/GitHub em navegador externo e retorno ao app.
4. Empacotar o frontend com Capacitor; gerar APK/AAB no Android Studio e testar permissões, armazenamento e notificações.
5. Revisar políticas de privacidade, exclusão de conta e regras das lojas antes de publicar.

## Segurança de miniaplicativos
Não executar HTML/JS arbitrário enviado por usuários no mesmo contexto da sessão. Cada app precisa de sandbox isolado (idealmente iframe com `sandbox`), CSP, lista de permissões, revisão/moderação, limites de recursos e API intermediária. Nunca entregar a chave `service_role` do Supabase ao navegador.

## Persistência
Conteúdo de usuário deve ser gravado no Supabase (Postgres/Storage) com RLS; localStorage é adequado apenas para rascunhos e preferências. Antes de fechar a aba, sincronizar rascunhos e informar quando uma gravação falhar.
