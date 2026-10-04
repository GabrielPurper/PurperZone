# PurperZone

[![Status](https://img.shields.io/badge/Status-Em%20desenvolvimento-yellow?style=flat-square)](https://github.com/GabrielPurper/PurperZone)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen?style=flat-square\&logo=github)](https://gabrielpurper.github.io/PurperZone/)

**🌐 Acesse o PurperZone:**
https://gabrielpurper.github.io/PurperZone/

> 🚧 **Projeto em desenvolvimento**

O **PurperZone** é uma plataforma online criada para reunir diferentes experiências digitais em um único ambiente:

* **GitHub:** projetos, código e desenvolvimento.
* **Instagram:** posts, perfis e comunidade.
* **Steam:** jogos, biblioteca e experiências relacionadas a games.
* **Discord:** comunicação, mensagens e interação entre usuários.
* **Plataformas digitais:** aplicativos, loja, pagamentos e outros serviços.

A proposta é criar um espaço onde os usuários possam **criar, compartilhar, descobrir, conversar e interagir** dentro de uma única plataforma.

---

## 🚧 Status do projeto

**Em desenvolvimento.**

A infraestrutura principal do PurperZone já está sendo construída, incluindo banco de dados, autenticação, segurança, comunicação, moderação, busca, pagamentos e outros serviços.

O frontend ainda está sendo desenvolvido para conectar essas funcionalidades à interface pública.

| Área                             | Status                |
| -------------------------------- | --------------------- |
| Estrutura da plataforma          | 🟡 Em desenvolvimento |
| Supabase                         | 🟢 Estruturado        |
| Autenticação                     | 🟢 Estruturada        |
| Perfis                           | 🟢 Estruturado        |
| Feed                             | 🟢 Estruturado        |
| Projetos                         | 🟢 Estruturado        |
| Biblioteca                       | 🟢 Estruturada        |
| Seguidores                       | 🟢 Estruturado        |
| Mensagens                        | 🟢 Estruturado        |
| Notificações                     | 🟢 Estruturado        |
| Busca avançada                   | 🟢 Estruturada        |
| Hashtags                         | 🟢 Estruturadas       |
| Jogos                            | 🟢 Estruturado        |
| Aplicativos                      | 🟢 Estruturado        |
| Loja                             | 🟢 Estruturada        |
| Pagamentos                       | 🟢 Estruturado        |
| Assinaturas                      | 🟢 Estruturadas       |
| Afiliados                        | 🟢 Estruturado        |
| Analytics                        | 🟢 Estruturado        |
| Tendências                       | 🟢 Estruturadas       |
| Recomendações                    | 🟢 Estruturadas       |
| Moderação                        | 🟢 Estruturada        |
| Sistema de denúncias             | 🟢 Estruturado        |
| Apelações                        | 🟢 Estruturadas       |
| Segurança                        | 🟢 Estruturada        |
| Proteção de menores              | 🟢 Estruturada        |
| Jarvis                           | 🟢 Estruturado        |
| Frontend completo                | 🟡 Em desenvolvimento |
| Música do lobby                  | 🟡 Em desenvolvimento |
| PWA / instalação como aplicativo | 🟡 Em desenvolvimento |

---

## 🧩 Arquitetura atual

O PurperZone utiliza uma arquitetura web modular baseada em tecnologias simples e escaláveis:

* **HTML**
* **CSS**
* **JavaScript**
* **Supabase Auth**
* **Supabase PostgreSQL**
* **Supabase Storage**
* **Supabase RLS**
* **Supabase Realtime**
* **Stripe**
* **GitHub Pages**

### Fonte oficial dos dados

O **Supabase é a fonte oficial da arquitetura de dados do PurperZone**.

O GitHub é utilizado para:

* Código do frontend.
* Scripts JavaScript.
* Arquivos HTML e CSS.
* Migrações versionadas do banco.
* Documentação.
* Configurações públicas necessárias para o frontend.

O frontend público é hospedado pelo **GitHub Pages**.

### Atualização de dados

O sistema utiliza **Supabase Realtime** para atualizações em tempo real quando apropriado.

Como mecanismos complementares, o frontend pode utilizar:

* Polling de 30 segundos.
* Atualização ao retornar para a aba.
* Atualização após determinadas ações do usuário.
* Eventos em tempo real.

Isso permite que o sistema continue funcionando mesmo quando determinado recurso não estiver utilizando Realtime.

---

## 📦 Módulos

### 🏠 Início

Página principal responsável por apresentar o PurperZone e centralizar o acesso às principais funcionalidades da plataforma.

### 👥 Comunidade

Área destinada à interação entre usuários.

Inclui estruturas para:

* Perfis.
* Seguidores.
* Publicações.
* Curtidas.
* Comentários.
* Compartilhamentos.
* Hashtags.

### 📰 Feed

Área destinada às publicações da comunidade.

Os usuários poderão:

* Criar publicações.
* Visualizar publicações.
* Curtir.
* Comentar.
* Compartilhar.
* Utilizar hashtags.
* Denunciar conteúdos.

### 💻 Projetos

Espaço destinado a projetos e desenvolvimento.

Os usuários poderão apresentar seus projetos dentro da plataforma, criando uma experiência semelhante a uma área de desenvolvimento integrada ao PurperZone.

### 🎮 Jogos

Sistema destinado à descoberta e organização de jogos.

A estrutura permite trabalhar com:

* Jogos.
* Plataformas.
* Biblioteca.
* Informações dos jogos.
* Filtros.
* Busca.
* Ranking e tendências.

### 📚 Biblioteca

Área destinada ao conteúdo adquirido ou salvo pelo usuário.

A biblioteca poderá integrar diferentes tipos de conteúdo conforme novos módulos forem adicionados à plataforma.

### 👤 Perfil

Cada usuário possui um perfil próprio dentro do PurperZone.

A estrutura suporta informações como:

* Nome.
* Username.
* Avatar.
* Biografia.
* Localização.
* Projetos.
* Publicações.
* Seguidores.
* Configurações de privacidade.

### 📱 Aplicativos

Módulo destinado a aplicativos publicados dentro do PurperZone.

A estrutura do banco já permite preparar o sistema para diferentes tipos de aplicações e serviços.

### 💬 Mensagens

Sistema de comunicação entre usuários.

A estrutura suporta:

* Conversas.
* Participantes.
* Mensagens.
* Respostas.
* Edição.
* Exclusão lógica.
* Mensagens lidas.
* Anexos.
* Denúncias.
* Bloqueios.

### 🔔 Notificações

Sistema centralizado de notificações.

Pode trabalhar com diferentes eventos da plataforma, incluindo:

* Interações sociais.
* Mensagens.
* Sistema de seguidores.
* Atualizações.
* Eventos.
* Notificações promocionais.
* Alertas relacionados à conta.

A estrutura também permite controlar preferências e canais de entrega.

### 🔎 Busca

Sistema de busca centralizado do PurperZone.

A busca foi estruturada para trabalhar com:

* Usuários.
* Projetos.
* Posts.
* Aplicativos.
* Jogos.
* Produtos.
* Hashtags.

Também existem estruturas para filtros e diferentes formas de ordenação dos resultados.

---

## 🛡️ Moderação

O PurperZone possui uma estrutura própria para denúncias e moderação.

O sistema inclui:

* Denúncias.
* Fila de moderação.
* Evidências.
* Decisões.
* Histórico de casos.
* Atualizações de casos.
* Apelações.
* Histórico de apelações.
* Transparência para o usuário.

A proposta é evitar que conteúdos simplesmente desapareçam sem contexto.

Quando uma ação de moderação ocorrer, o sistema poderá registrar informações suficientes para manter um histórico do processo, respeitando as regras de privacidade.

---

## 🔐 Segurança e privacidade

A segurança dos dados é baseada principalmente no **Row Level Security (RLS)** do Supabase.

O projeto possui estruturas para:

* Sessões.
* Dispositivos.
* Histórico de login.
* Eventos de segurança.
* Bloqueios.
* Configurações de privacidade.
* Ações de conta.
* Recuperação de conta.
* Exclusão de conta.
* Controle de visibilidade.
* Moderação.
* Auditoria.

### Segurança no frontend

O conteúdo renderizado pelo frontend utiliza escape adequado para reduzir riscos de **XSS (Cross-Site Scripting)**.

A autorização real dos dados deve permanecer no backend através das políticas do Supabase.

### Nunca publicar

```text
.env
senhas
tokens privados
chaves secretas
service_role keys
credenciais administrativas
segredos do Stripe
segredos OAuth
```

O frontend deve utilizar somente as credenciais públicas apropriadas.

---

## 👨‍👩‍👧 Proteção de menores

O PurperZone possui uma estrutura específica para segurança de menores e controle parental.

Inclui:

* Verificação de faixa etária.
* Configurações de segurança para menores.
* Vínculo com responsável.
* Controles parentais.
* Eventos de segurança.
* Restrições de mensagens.
* Restrições de recomendações.
* Controle de privacidade.

A arquitetura foi preparada considerando requisitos técnicos relacionados ao **ECA Digital**.

> A implementação técnica não representa certificação ou parecer jurídico.

---

## 💳 Loja e pagamentos

O PurperZone possui estrutura para uma futura plataforma de comércio digital.

Inclui:

* Categorias de produtos.
* Produtos.
* Carrinho.
* Itens do carrinho.
* Pedidos.
* Itens dos pedidos.
* Pagamentos.
* Contratos.
* Assinaturas.
* Planos.

### Stripe

O **Stripe** será utilizado como infraestrutura de pagamentos.

A arquitetura permite trabalhar com:

* Pagamentos únicos.
* Assinaturas.
* Planos.
* Produtos.
* Contratos.
* Webhooks.
* Histórico de pagamentos.

---

## 💰 Monetização

O PurperZone possui estruturas para diferentes modelos de monetização.

### Planos

A plataforma possui estruturas para planos como:

* Free.
* Pro.
* Creator.
* AI.

Os limites são controlados pelo banco de dados através de recursos e contadores de utilização.

Exemplo inicial:

```text
Free     → 5 uploads de vídeo grandes por mês
Pro      → 20 uploads por mês
Creator  → 50 uploads por mês
AI       → 20 uploads por mês
```

Os valores e limites podem ser modificados futuramente sem precisar alterar toda a aplicação.

### Afiliados

O sistema também possui estrutura para:

* Links de afiliados.
* Cliques.
* Rastreamento de campanhas.
* Produtos afiliados.

---

## 📊 Analytics e recomendações

O PurperZone possui infraestrutura para análise de utilização da plataforma.

Inclui:

* Eventos de analytics.
* Métricas de conteúdo.
* Tendências.
* Ranking.
* Perfis de recomendação.
* Itens recomendados.

Esses sistemas poderão ser utilizados futuramente para melhorar descoberta de conteúdo sem transformar a interface em um painel de métricas.

---

## 🤖 Jarvis

O PurperZone possui uma estrutura própria para futura integração com o **Jarvis**.

A estrutura preparada no Supabase inclui:

* Agentes.
* Dispositivos.
* Sessões.
* Mensagens.
* Memórias.
* Eventos.

A intenção é permitir que o Jarvis tenha uma presença dentro da plataforma sem transformar o PurperZone inteiro em uma interface de IA.

A integração web será desenvolvida separadamente.

---

## ⚡ Automações

O banco possui estruturas para automações e execução de regras.

Inclui:

* Regras de automação.
* Execuções.
* Eventos da plataforma.
* Notificações.
* Processos automatizados.

Isso permite futuramente criar recursos como:

* Eventos.
* Shows.
* Notificações automáticas.
* Campanhas.
* Ações programadas.
* Processos internos da plataforma.

---

## 🗄️ Supabase

O PurperZone utiliza o Supabase como infraestrutura principal de dados.

A arquitetura atual possui módulos para:

```text
profiles
posts
post_media
post_comments
post_reactions
post_shares
follows

projects
library_items
games
apps

conversations
conversation_members
messages
message_reads
message_attachments
message_reports

notifications
notification_deliveries
notification_preferences
promotional_notifications

products
product_categories
carts
cart_items
orders
order_items
payments
contracts

subscription_plans
plan_features
feature_limits
user_plans
subscriptions

affiliate_links
affiliate_clicks

analytics_events
content_metrics
trending_items
recommendation_profiles
recommendation_items

content_reports
content_report_events
moderation_queue
moderation_evidence
moderation_decisions
moderation_case_updates
appeals
appeal_events

user_devices
user_sessions
login_history
security_events
user_blocks
account_actions
account_deletion_requests
account_recovery_events

age_assurance
guardian_links
minor_safety_settings
guardian_controls
minor_safety_events

jarvis_agents
jarvis_devices
jarvis_events
jarvis_memories
jarvis_messages
jarvis_sessions
```

A lista representa os principais módulos da arquitetura e poderá crescer conforme a plataforma evoluir.

---

## 🧱 Estrutura planejada do frontend

O frontend está sendo reorganizado para manter a base HTML existente e permitir a expansão da plataforma sem quebrar as páginas estáticas.

Estrutura prevista:

```text
PurperZone/
│
├── index.html
├── feed.html
├── profile.html
├── projects.html
├── library.html
├── login.html
│
├── css/
│   ├── main.css
│   ├── layout.css
│   └── components.css
│
├── js/
│   ├── app.js
│   ├── router.js
│   │
│   ├── api/
│   │   └── supabase.js
│   │
│   ├── components/
│   ├── pages/
│   └── services/
│
├── assets/
│
└── supabase/
    └── migrations/
```

A ideia é manter o frontend modular sem exigir a utilização de frameworks ou servidores adicionais neste momento.

---

## 🔄 Desenvolvimento dinâmico

O PurperZone foi planejado para começar com páginas HTML estáticas e evoluir gradualmente para uma aplicação dinâmica.

Isso permite:

* Manter as páginas existentes.
* Adicionar componentes JavaScript.
* Consumir dados do Supabase.
* Criar páginas dinâmicas.
* Adicionar novos módulos.
* Evitar reconstruir todo o site a cada nova funcionalidade.

O objetivo é que o conteúdo dinâmico seja incorporado sem comprometer a estrutura existente.

---

## 🛠️ Tecnologias

| Tecnologia          | Utilização                 |
| ------------------- | -------------------------- |
| HTML5               | Estrutura da aplicação     |
| CSS3                | Interface e estilos        |
| JavaScript          | Lógica e interação         |
| Supabase Auth       | Autenticação               |
| Supabase PostgreSQL | Banco de dados             |
| Supabase Storage    | Arquivos e mídia           |
| Supabase RLS        | Autorização                |
| Supabase Realtime   | Atualizações em tempo real |
| Stripe              | Pagamentos e assinaturas   |
| GitHub              | Código e versionamento     |
| GitHub Pages        | Hospedagem do frontend     |

---

## 🔮 Próximos recursos

O projeto continuará evoluindo com recursos como:

* 🌐 Domínio próprio.
* 💻 Frontend completo dos módulos do Supabase.
* 👥 Expansão dos recursos sociais.
* 🎮 Expansão do sistema de jogos.
* 📱 Expansão do sistema de aplicativos.
* 💳 Expansão da loja.
* 💰 Mais recursos de monetização.
* 🤖 Integração web do Jarvis.
* 🔔 Expansão das notificações.
* 🎵 Sistema de música do lobby.
* 📲 Instalação do PurperZone como aplicativo.
* 📱 Expansão para dispositivos móveis.
* 🔗 Novas integrações externas.

---

## 🌐 Acesso

**Site:**
https://gabrielpurper.github.io/PurperZone/

**Repositório:**
https://github.com/GabrielPurper/PurperZone

---

> 🚧 **PurperZone está em desenvolvimento.**
>
> A plataforma continuará recebendo novos recursos, melhorias e módulos ao longo do projeto.

---

## 👤 Autor

**Gabriel Purper Andrade e Silva**

**GitHub:**
https://github.com/GabrielPurper
