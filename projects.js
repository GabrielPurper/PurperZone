// ============================================================
// PurperZone — projects.js
// Aba "Projetos" do perfil (estilo GitHub): lista repositórios/
// projetos do usuário e permite cadastrar novos.
// ============================================================

/**
 * Carrega os projetos visíveis de um usuário e desenha os cards.
 * A RLS já garante que, se `viewerIsOwner` for false, projetos
 * com is_public = false nem chegam na resposta — não é preciso
 * filtrar isso manualmente aqui.
 */
async function loadProjects(ownerId, containerEl) {
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, description, repo_url, tech_stack, stars_count")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar projetos:", error);
    return;
  }

  if (!projects || projects.length === 0) {
    containerEl.innerHTML =
      '<p class="empty-state">Nenhum projeto público ainda.</p>';
    return;
  }

  containerEl.innerHTML = projects
    .map(
      (project) => `
      <a class="card project-card" href="${project.repo_url ?? "#"}" target="_blank" rel="noopener">
        <div class="project-card__name">${project.name}</div>
        <p class="project-card__description">${project.description ?? ""}</p>
        <div class="project-card__meta">
          <span>★ ${project.stars_count}</span>
        </div>
        <div style="margin-top: var(--space-3)">
          ${(project.tech_stack || [])
            .map((tech) => `<span class="tag">${tech}</span>`)
            .join("")}
        </div>
      </a>
    `
    )
    .join("");
}

/**
 * Cria um novo projeto para o usuário logado.
 * @param {object} projectData - { name, description, repoUrl, techStack }
 *   techStack deve ser um array de strings, ex: ["Python", "TypeScript"]
 */
async function createProject(projectData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Você precisa estar logado." };

  return supabase.from("projects").insert({
    owner_id: user.id,
    name: projectData.name,
    description: projectData.description,
    repo_url: projectData.repoUrl,
    tech_stack: projectData.techStack,
  });
}
