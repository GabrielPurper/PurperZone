// ============================================================
// PurperZone — profile.js
// Carrega o cabeçalho de perfil e o feed de posts (aba "Feed"
// de profile.html). Usado junto com supabaseClient.js e auth.js.
// ============================================================

/**
 * Busca um perfil público pelo username (usado em URLs tipo
 * profile.html?u=biel) e preenche o cabeçalho da página.
 */
async function loadProfileHeader(username) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, bio, avatar_url")
    .eq("username", username)
    .single();

  if (error || !profile) {
    console.error("Perfil não encontrado:", error);
    return null;
  }

  document.querySelector(".profile-header__name").textContent =
    profile.username;
  document.querySelector(".profile-header__username").textContent =
    `@${profile.username}`;
  document.querySelector(".profile-header__bio").textContent =
    profile.bio ?? "";

  const avatarEl = document.querySelector(".profile-header__avatar");
  if (profile.avatar_url) {
    avatarEl.src = profile.avatar_url;
  }

  // Contagens de seguidores/seguindo, calculadas a partir de
  // public.follows (ver supabase/schema.sql).
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profile.id),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", profile.id),
  ]);

  document.querySelector("[data-stat='followers']").textContent =
    followers ?? 0;
  document.querySelector("[data-stat='following']").textContent =
    following ?? 0;

  return profile;
}

/**
 * Busca os posts mais recentes de um autor e desenha os cards
 * dentro do container informado.
 */
async function loadFeed(authorId, containerEl) {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, content, image_url, likes_count, created_at")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar feed:", error);
    return;
  }

  if (!posts || posts.length === 0) {
    containerEl.innerHTML =
      '<p class="empty-state">Ainda não há posts por aqui.</p>';
    return;
  }

  // Monta o HTML de cada post. Em produção, prefira uma lib de
  // templates ou escaping manual para evitar XSS caso o conteúdo
  // venha de outro usuário — aqui mantemos simples por ser a base.
  containerEl.innerHTML = posts
    .map(
      (post) => `
      <article class="card post-card">
        ${
          post.image_url
            ? `<img class="post-card__image" src="${post.image_url}" alt="">`
            : ""
        }
        <p>${post.content ?? ""}</p>
        <div class="post-card__meta">
          <span>${post.likes_count} curtidas</span>
          <span>${new Date(post.created_at).toLocaleDateString("pt-BR")}</span>
        </div>
      </article>
    `
    )
    .join("");
}

/**
 * Publica um novo post para o usuário logado.
 */
async function createPost(content, imageUrl) {
  const user = await getCurrentUser();
  if (!user) return { error: "Você precisa estar logado." };

  return supabase.from("posts").insert({
    author_id: user.id,
    content,
    image_url: imageUrl || null,
  });
}
