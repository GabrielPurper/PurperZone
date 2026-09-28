# PurperZone

[![Status](https://img.shields.io/badge/Status-Em%20desenvolvimento-yellow?style=flat-square)](https://github.com/gabrielpurper/PurperZone)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen?style=flat-square\&logo=github)](https://gabrielpurper.github.io/PurperZone/)

**🌐 Acesse o PurperZone:**
https://gabrielpurper.github.io/PurperZone/

> 🚧 **Projeto em desenvolvimento**

O **PurperZone** é uma plataforma online pensada para reunir três experiências em um só lugar:

* **GitHub:** projetos, código e desenvolvimento.
* **Instagram:** posts, perfis e comunidade.
* **Steam:** jogos e biblioteca pessoal.

A proposta é criar um ambiente onde os usuários possam **criar, compartilhar, descobrir e interagir**, enquanto o PurperZone funciona como a plataforma principal.

## 🚧 Status do projeto

**Em desenvolvimento.**

A estrutura principal da plataforma já está sendo construída, mas diversos recursos ainda estão em evolução e novos módulos serão adicionados ao longo do desenvolvimento.

| Área                    | Status                |
| ----------------------- | --------------------- |
| Estrutura da plataforma | 🟡 Em desenvolvimento |
| Autenticação            | 🟡 Em desenvolvimento |
| Perfis                  | 🟡 Em desenvolvimento |
| Feed                    | 🟡 Em desenvolvimento |
| Projetos                | 🟡 Em desenvolvimento |
| Biblioteca              | 🟡 Em desenvolvimento |
| Sistema de seguidores   | 🟡 Em desenvolvimento |
| Realtime                | 🟡 Em desenvolvimento |
| Aplicativos             | ⚪ Planejado           |

## 🧩 Arquitetura atual

O PurperZone utiliza uma arquitetura web baseada em tecnologias simples e modulares:

* **HTML**
* **CSS**
* **JavaScript**
* **Supabase Auth**
* **Supabase Postgres**
* **Supabase RLS**
* **Supabase Realtime**

### Atualização de dados

O sistema utiliza **Supabase Realtime** para atualizações instantâneas quando as tabelas estão habilitadas na publicação Realtime.

Como mecanismo complementar, o frontend também utiliza:

* Polling de 30 segundos.
* Atualização automática ao retornar para a aba.
* Atualização de dados após determinadas ações do usuário.

### Segurança no frontend

O conteúdo renderizado pelo frontend passa por escape básico para reduzir riscos de **XSS (Cross-Site Scripting)**.

A autorização dos dados é controlada principalmente pelo **Row Level Security (RLS)** no Supabase.

## 📦 Módulos

### 🏠 Início

Página principal responsável por apresentar o PurperZone e centralizar o acesso às principais funcionalidades.

### 👥 Sobre

Seção integrada à plataforma explicando o conceito do PurperZone e sua proposta de unir características de:

**GitHub + Instagram + Steam**

### 📰 Feed

Área destinada às publicações da comunidade.

Usuários poderão compartilhar conteúdo e acompanhar publicações de outros membros.

### 💻 Projetos

Espaço destinado a projetos, códigos e desenvolvimento.

A proposta é permitir que os usuários apresentem e organizem seus próprios projetos dentro da plataforma.

### 🎮 Biblioteca

Área destinada aos jogos do usuário, incluindo informações relacionadas à biblioteca e progresso.

### 👤 Perfil

Cada usuário possui seu próprio perfil, identidade dentro da plataforma e publicações.

### 📱 Aplicativos

Módulo planejado para uma futura expansão do PurperZone.

> Este módulo ainda não faz parte da implementação principal.

## 🗄️ Supabase

O PurperZone utiliza o **Supabase** como infraestrutura para autenticação e armazenamento de dados.

### Autenticação

O sistema utiliza:

* Supabase Auth
* Cadastro de usuários
* Login
* Sessões autenticadas

### Banco de dados

A versão atual utiliza as seguintes tabelas:

```text
profiles
projects
posts
library_items
follows
```

### Realtime

Para que as alterações sejam recebidas instantaneamente, as tabelas necessárias precisam estar habilitadas na publicação **Realtime** do projeto Supabase.

O polling continua disponível como fallback.

## 🔐 Segurança

O arquivo `supabaseClient.js` utiliza somente a **chave pública/publishable** destinada ao frontend.

**Nunca coloque uma chave `service_role` no código do frontend.**

Também não devem ser publicados no repositório:

```text
.env
senhas
tokens privados
chaves secretas
credenciais administrativas
service_role keys
```

A segurança dos dados deve ser aplicada no banco utilizando **RLS (Row Level Security)** e políticas de acesso adequadas.

## 🛠️ Tecnologias

| Tecnologia        | Utilização                 |
| ----------------- | -------------------------- |
| HTML5             | Estrutura da aplicação     |
| CSS3              | Interface e estilos        |
| JavaScript        | Lógica e interação         |
| Supabase Auth     | Autenticação               |
| Supabase Postgres | Banco de dados             |
| Supabase RLS      | Autorização                |
| Supabase Realtime | Atualizações em tempo real |
| GitHub Pages      | Hospedagem do frontend     |

## 🔮 Próximos recursos

O projeto foi estruturado para permitir futuras expansões, incluindo:

* 💬 Comentários
* ❤️ Sistema de curtidas
* 💬 Mensagens
* 🔔 Notificações
* 🖼️ Upload e gerenciamento de mídia
* 📱 Módulo Aplicativos
* 🎮 Expansão da biblioteca de jogos
* 💻 Expansão do sistema de projetos
* 👥 Recursos adicionais de comunidade

Esses recursos poderão ser adicionados gradualmente sem alterar o conceito central da plataforma.

## 🌐 Acesso

**Site:**
https://gabrielpurper.github.io/PurperZone/

**Repositório:**
https://github.com/gabrielpurper/PurperZone

---

> 🚧 **PurperZone está em desenvolvimento.**
> A plataforma continuará recebendo novos recursos, melhorias e módulos ao longo do projeto.
