# Manutenção e segurança — PurperZone

## O que foi preparado

- O service worker `sw.js` usa uma allowlist de arquivos estáticos do próprio site. Ele não armazena HTML, respostas do Supabase, autenticação, Storage, Realtime ou Edge Functions em cache.
- `auth.js` aceita apenas páginas HTML conhecidas na raiz do site como destino de login/OAuth. Destinos externos, esquemas não HTTP(S), caminhos aninhados e páginas desconhecidas voltam para `feed.html`.
- `app.js` consulta `get_maintenance_status()` e redireciona para `maintenance.html` quando o modo está ativo. A tela pode mostrar a mensagem configurada no banco.
- Os templates EJS vazios agora têm estruturas iniciais reutilizáveis com o estilo da plataforma e saída escapada por `<%=`.

## Ativar/desativar a manutenção

A tabela `public.site_settings`, registro `key = 'maintenance'`, guarda o estado. Como não foi criado um painel administrativo seguro para alternar essa configuração, faça a alteração apenas no SQL Editor do Supabase ou por uma Edge Function autenticada com verificação de papel administrativo.

```sql
-- Ativar
UPDATE public.site_settings
SET value = jsonb_set(value, '{enabled}', 'true'::jsonb), updated_at = now()
WHERE key = 'maintenance';

-- Desativar
UPDATE public.site_settings
SET value = jsonb_set(value, '{enabled}', 'false'::jsonb), updated_at = now()
WHERE key = 'maintenance';
```

A função pública `get_maintenance_status()` retorna apenas os campos necessários para exibir a tela. O acesso direto à tabela fica restrito a leitura limitada/administrativa conforme as políticas do banco.

## Limites importantes

- O redirecionamento no navegador melhora a experiência, mas não substitui autorização. RLS e validação do servidor continuam obrigatórias.
- Um gatilho no banco bloqueia `INSERT`, `UPDATE` e `DELETE` nas tabelas públicas de negócio durante a manutenção, exceto a tabela de configuração usada para desligar o modo.
- Edge Functions que executem ações externas sem escrever no banco (por exemplo, criar sessões de checkout ou chamar provedores sociais) devem também consultar `get_maintenance_status()` e responder `503` quando `enabled = true`. O gatilho do banco não consegue impedir sozinho uma chamada externa.
- Depois de publicar, confirme que o host serve os novos `sw.js`, `app.js`, `auth.js` e `maintenance.html`. O cache usa o nome `purperzone-static-v5` para invalidar o cache anterior.
- Os templates EJS são parciais de servidor; o build estático atual não os renderiza automaticamente. Eles só terão efeito quando forem usados por uma aplicação Express/EJS.

## Verificação desta revisão

- O RPC de manutenção foi testado e retorna `enabled: false` após a prova de bloqueio.
- O teste temporário de escrita foi bloqueado pelo gatilho SQL (`SQLSTATE 55000`) e não deixou linha de teste no banco.
- Foram instalados gatilhos de manutenção em 90 tabelas públicas de negócio. Tabelas de configuração, processamento de pagamentos/webhooks e limpeza de estado OAuth foram excluídas deliberadamente para não interromper pagamentos já iniciados nem impedir desligar a manutenção.
- As Edge Functions `stripe-create-checkout`, `social-connect-start` e `social-connect-callback` consultam o modo de manutenção; o checkout também verifica a identidade do token e restringe URLs de retorno a origens permitidas.
- O Security Advisor do Supabase retornou zero lints nesta revisão.
- Validação local do ZIP: 28 arquivos JavaScript sem erro de sintaxe, 24 páginas HTML, zero referências locais ausentes, 12 templates EJS não vazios e integridade do arquivo ZIP confirmada.


## Proteção de fotos e Reels de outras pessoas

O frontend agora aplica medidas dissuasórias: oculta controles de download de vídeos compatíveis, desativa arrastar mídia e bloqueia o menu de contexto diretamente sobre imagens/vídeos. Isso reduz salvamentos casuais, mas não torna a mídia impossível de copiar. Se o navegador consegue exibir um arquivo, alguém pode capturá-lo, gravar a tela ou usar ferramentas externas.

Antes de publicar em produção, confirme no Supabase Storage que o bucket `post-media` é privado e que suas políticas permitem somente as operações necessárias. O frontend usa URLs assinadas temporárias para Reels; o tempo de validade atual é de até uma hora em `reels.js` e 30 minutos na seção gamer de `games.js`. Reduzir a validade não impede cópia durante o acesso e exige considerar reprodução/streaming. Não torne o bucket público para resolver falhas de reprodução.

A regra do produto é não oferecer botão de download para conteúdo de terceiros. Mídia própria poderá ter uma opção de exportação separada no futuro, validando a autoria no servidor. Para proteção mais forte, use processamento/streaming e controles no backend, sabendo que nenhuma solução impede completamente capturas da tela.

## Biblioteca em galeria unificada (2026-10-21)
A página `library.html` reúne posts públicos, fotos, Reels, código, projetos e games em uma grade visual com filtros. A lógica está em `library.js`; os estilos isolados da galeria ficam no fim de `style.css`. A coleção pessoal `library_items` continua disponível em seção expansível.

A galeria consulta apenas posts com `status = published`, `visibility = public` e `deleted_at IS NULL`, além de projetos e games marcados como públicos. O frontend não substitui as políticas RLS: confirme que as permissões reais no Supabase seguem a mesma regra. Para anexos, o cliente solicita URLs assinadas temporárias; a mídia ainda pode ser capturada por screenshot, gravação ou ferramentas externas.
