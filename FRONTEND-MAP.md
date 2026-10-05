# Mapa do frontend

| Interface | Supabase principal | Operações |
|---|---|---|
| Login | Auth | signUp, signIn, OAuth, reset |
| Feed | posts, profiles, reactions, reports | leitura, publicação, reação, denúncia |
| Projetos | projects, profiles | leitura/criação |
| Jogos | games | leitura/criação |
| Biblioteca | library_items | CRUD do usuário |
| Perfil | profiles, follows, posts, projects | leitura/edição/seguir |
| Mensagens | conversations, members, messages | leitura/envio |
| Notificações | notifications | leitura/marcar como lida |
| Busca | search_purperzone RPC | busca/filtros |
| Loja | products | catálogo |
| Planos | subscription_plans | catálogo |
| Moderação | content_reports | denúncia/histórico do usuário |
| Jarvis | jarvis_* | leitura da infraestrutura web |

## Fora do escopo desta versão

O banco de áudio/PWA já existe, mas o player do lobby não foi conectado aqui porque os arquivos de música ainda serão adicionados ao GitHub. Quando eles estiverem no repositório, a camada `audioPlayer.js` pode ser incorporada sem redesenhar o restante do frontend.
