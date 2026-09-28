// ============================================================
// PurperZone — library.js
// Aba "Biblioteca" do perfil (estilo Steam): jogos/apps do
// usuário, com status (jogando/concluído/etc) e horas jogadas.
// ============================================================

/** Rótulos em português para cada valor de status salvo no banco. */
const STATUS_LABELS = {
  backlog: "Na fila",
  playing: "Jogando",
  completed: "Concluído",
  dropped: "Abandonado",
};

/**
 * Carrega os itens da biblioteca de um usuário e desenha a lista.
 */
async function loadLibrary(ownerId, containerEl) {
  const { data: items, error } = await supabase
    .from("library_items")
    .select("id, title, cover_url, status, hours_played, platform")
    .eq("owner_id", ownerId)
    .order("hours_played", { ascending: false });

  if (error) {
    console.error("Erro ao carregar biblioteca:", error);
    return;
  }

  if (!items || items.length === 0) {
    containerEl.innerHTML =
      '<p class="empty-state">A biblioteca está vazia.</p>';
    return;
  }

  containerEl.innerHTML = items
    .map(
      (item) => `
      <div class="card library-item">
        <img class="library-item__cover" src="${item.cover_url ?? ""}" alt="">
        <div style="flex: 1">
          <div class="library-item__title">${item.title}</div>
          <div class="library-item__hours">${item.hours_played}h jogadas · ${item.platform ?? "—"}</div>
        </div>
        <span class="status-badge status-badge--${item.status}">
          ${STATUS_LABELS[item.status] ?? item.status}
        </span>
      </div>
    `
    )
    .join("");
}

/**
 * Adiciona um novo item à biblioteca do usuário logado.
 */
async function addLibraryItem(itemData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Você precisa estar logado." };

  return supabase.from("library_items").insert({
    owner_id: user.id,
    title: itemData.title,
    cover_url: itemData.coverUrl,
    status: itemData.status || "backlog",
    platform: itemData.platform,
  });
}

/**
 * Atualiza o status e/ou horas jogadas de um item existente.
 * A RLS garante que só o dono do item consegue alterá-lo.
 */
async function updateLibraryItem(itemId, changes) {
  return supabase.from("library_items").update(changes).eq("id", itemId);
}
