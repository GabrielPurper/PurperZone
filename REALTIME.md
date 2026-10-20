# PurperZone — atualização em tempo real

O frontend pode usar `supabase.channel(...).on('postgres_changes', ...)` para receber alterações do banco.

Tabelas prioritárias:

- `profiles`
- `posts`
- `projects`
- `library_items`
- `follows`
- `notifications`

O Realtime deve ser habilitado na publicação do Supabase para as tabelas desejadas.

Como fallback, as páginas podem recarregar os dados ao abrir, ao retornar para a aba e em intervalos curtos quando necessário.
