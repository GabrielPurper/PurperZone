# 🌐 PurperZone

![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen?style=flat-square&logo=github)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-blue?style=flat-square)

---

## 📌 Sobre o Projeto

O **PurperZone** é o meu portal pessoal hospedado no GitHub Pages. 

🔗 **Acesse o site ao vivo:** [gabrielpurper.github.io/PurperZone](https://gabrielpurper.github.io/PurperZone/)

---

## 🛠️ Habilidades & Tecnologias

- **Front-end:** HTML5, CSS3, JavaScript
- **Ferramentas & Controle de Versão:** Git, GitHub, GitHub Pages
- **Perfil Profissional:** Resolução de problemas, desenvolvimento web, prototipagem

---

## 🔗 Redes & Contato

- 💼 **LinkedIn:** [Gabriel Purper](https://www.linkedin.com/in/gabriel-purper-andrade-e-silva-05b36534a/)
- 📂 **GitHub:** [github.com/GabrielPurper](https://github.com/GabrielPurper)
- ✉️ **E-mail:** [Gabriel.Purper@hotmail.com](mailto:Gabriel.Purper@hotmail.com)

---
*Desenvolvido por Gabriel Purper.*

# PurperZone — base do projeto

Base da plataforma PurperZone: perfil de usuário que junta projetos
(estilo GitHub), um feed de posts (estilo Instagram) e uma biblioteca
de jogos/apps (estilo Steam). Escrita em HTML/CSS/JS puro, pronta para
migrar para TypeScript depois.

## Como usar

1. Copie todo o conteúdo desta pasta para dentro do seu repositório `purperzone`.
2. Abra `index.html` num servidor local (ex: extensão "Live Server" do
   VS Code, ou `python -m http.server` na pasta). Não abra o arquivo
   direto com `file://` — o Supabase Auth e alguns módulos JS exigem
   HTTP.
3. As credenciais do Supabase já estão preenchidas em
   `js/supabaseClient.js` (projeto **PurperZone**, org GabrielPurper).
   A chave usada é a pública ("anon"), segura para o front-end.

## Estrutura

```
purperzone/
├── index.html       → landing page
├── login.html       → login/cadastro (Supabase Auth)
├── profile.html      → perfil: cabeçalho + feed de posts
├── projects.html     → aba de projetos (estilo GitHub)
├── library.html      → aba de biblioteca (estilo Steam)
├── css/
│   ├── reset.css      → reset mínimo entre navegadores
│   ├── variables.css   → cores, tipografia, espaçamento (tema roxo)
│   └── main.css        → layout e componentes
├── js/
│   ├── supabaseClient.js → conexão com o Supabase (URL + chave)
│   ├── auth.js            → signup/login/logout/proteção de rotas
│   ├── profile.js         → carrega perfil + feed
│   ├── projects.js        → carrega/cria projetos
│   └── library.js         → carrega/cria itens da biblioteca
└── supabase/
    └── schema.sql          → cópia de referência das tabelas + RLS
```

## Banco de dados (Supabase)

As tabelas abaixo já foram criadas no projeto real via migração
(`supabase/schema.sql` é a cópia de referência):

| Tabela           | O que guarda                                   | Quem pode ler        | Quem pode escrever      |
|------------------|-------------------------------------------------|-----------------------|---------------------------|
| `profiles`        | Perfil público (já existia antes desta base)   | —                      | —                          |
| `projects`         | Projetos/repos do usuário                      | Todos (se públicos)   | Só o dono                  |
| `posts`            | Posts do feed                                  | Todos                  | Só o autor                 |
| `library_items`    | Jogos/apps da biblioteca                       | Todos                  | Só o dono                  |
| `follows`          | Relação de seguir entre usuários                | Todos                  | Só o próprio usuário       |

Todas com **Row Level Security (RLS)** habilitado — a segurança é
garantida pelo próprio banco, não só pelo front-end.

## Próximos passos sugeridos

- Migrar `js/*.js` para TypeScript (`.ts`) com um bundler (Vite é o
  mais simples para começar).
- Trocar a montagem manual de HTML em `profile.js`/`projects.js`/
  `library.js` por um framework (React, Svelte) quando o projeto
  crescer — hoje está em JS puro de propósito, para ficar fácil de
  entender a base.
- Adicionar upload de imagens (avatar, capa de post, capa de jogo)
  usando o Supabase Storage.
