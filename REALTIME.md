# PurperZone — atualização em tempo real

O frontend usa `supabase.channel(...).on('postgres_changes', ...)` para receber alterações do banco.

## Habilitar no Supabase

Na publicação Realtime do projeto, habilite:

- `profiles`
- `posts`
- `projects`
- `library_items`
- `follows`

Depois de habilitar, alterações inseridas/atualizadas/removidas nessas tabelas podem atualizar a interface sem reload.

## Fallback

Mesmo com Realtime, o frontend também:

1. carrega os dados ao abrir;
2. atualiza a cada 30 segundos enquanto a aba está visível;
3. atualiza quando o usuário volta para a aba.

Isso evita que uma configuração temporariamente indisponível deixe a interface desatualizada.
