# Atualização — Projetos, prompts e perfil

## Projetos & Dev
- Formulário para criar projeto/repositório no catálogo `projects` do Supabase, com nome, descrição, URL opcional, tecnologias e visibilidade.
- Formulário para publicar snippets como publicações `content_type: code` na tabela `posts`, incluindo linguagem, título e explicação em `metadata`.
- Ações de feedback e validação de URL; os erros de esquema/RLS são apresentados ao usuário.
- Biblioteca de prompts copiáveis para revisão, API, depuração e IoT; catálogo de habilidades reutilizáveis para revisão, mentoria, arquitetura e otimização.

## Perfil
- Indicadores de seguidores, curtidas recebidas, vídeos/Reels, publicações e games.
- Lista de publicações com identificação visual de código, vídeo/Reel e post social.
- Contagens calculadas a partir de posts e games existentes. A contagem de seguidores usa `follows(follower_id, following_id)`; se o esquema real usar nomes diferentes, ajuste a consulta em `profile.js`.

## Configuração / limitações
- As tabelas `projects`, `posts`, `games` e `follows` precisam existir e ter políticas RLS compatíveis.
- Para snippets, `posts.metadata` precisa aceitar JSON e `posts.visibility` deve aceitar `public` e `private`.
- A publicação de código cria um post com bloco de código; não cria automaticamente um repositório externo no GitHub. O formulário de projeto registra o projeto dentro do PurperZone e pode guardar a URL de um repositório externo existente.
- A pasta `dist/` foi sincronizada com os arquivos alterados.
