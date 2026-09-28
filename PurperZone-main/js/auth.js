// ============================================================
// PurperZone — auth.js
// Cuida de cadastro, login, logout e da checagem de sessão.
// Depende de `supabase` (definido em supabaseClient.js, que deve
// ser carregado ANTES deste arquivo no HTML).
// ============================================================

/**
 * Cria uma conta nova no Supabase Auth e um registro correspondente
 * em public.profiles (a tabela de perfil público).
 *
 * @param {string} email
 * @param {string} password
 * @param {string} username - nome de usuário público (ex: @biel)
 */
async function signUp(email, password, username) {
  // 1) Cria o usuário no sistema de autenticação do Supabase.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error };
  }

  // 2) Cria a linha de perfil público vinculada ao novo usuário.
  //    Isso só funciona por causa da policy "insert" em profiles
  //    que exige que o id do perfil seja o mesmo do usuário logado.
  const userId = data.user?.id;
  if (userId) {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: userId, username });

    if (profileError) {
      return { error: profileError };
    }
  }

  return { data };
}

/**
 * Autentica um usuário existente por email/senha.
 */
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

/**
 * Encerra a sessão atual e redireciona para a página de login.
 */
async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "login.html";
}

/**
 * Retorna o usuário atualmente logado (ou null).
 * Use isto no topo de páginas que exigem login (profile.html ao
 * editar, projects.html ao criar projeto, etc).
 */
async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Bloqueia o acesso a uma página se não houver usuário logado,
 * redirecionando para login.html. Chame no topo do <script> da
 * página protegida: `await requireAuth();`
 */
async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
  }
  return user;
}

/**
 * Marca visualmente, na barra lateral, qual link corresponde à
 * página atual (compara com o atributo data-page do <body>).
 * Chame isso em todas as páginas, logo após o DOM carregar.
 */
function highlightActiveNavLink() {
  const currentPage = document.body.dataset.page;
  document.querySelectorAll(".sidebar__link").forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.classList.add("sidebar__link--active");
    }
  });
}

document.addEventListener("DOMContentLoaded", highlightActiveNavLink);
