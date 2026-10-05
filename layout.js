import { optionalUser, loadProfile, navUser, $$, escapeHTML } from '../app.js';

export async function renderLayout() {
  const host = document.querySelector('[data-layout]'); if (!host) return;
  const user = await optionalUser();
  const profile = user ? await loadProfile(user.id).catch(()=>null) : null;
  const page = document.body.dataset.page || 'home';
  const links = [
    ['index.html','Início','home'],['feed.html','Feed','feed'],['projects.html','Projetos','projects'],
    ['games.html','Jogos','games'],['library.html','Biblioteca','library'],['apps.html','Aplicativos','apps'],
    ['search.html','Buscar','search'],['messages.html','Mensagens','messages'],['notifications.html','Notificações','notifications']
  ];
  host.innerHTML = `<aside class="sidebar">
    <a class="sidebar__brand" href="index.html"><span class="brand-mark">P</span><span>PurperZone</span></a>
    <nav class="sidebar__nav">${links.map(([href,label,key])=>`<a class="sidebar__link ${page===key?'is-active':''}" href="${href}">${icon(key)}<span>${label}</span></a>`).join('')}</nav>
    <div class="sidebar__bottom">
      ${profile ? `<a class="user-chip" href="profile.html?id=${encodeURIComponent(profile.id)}">${avatar(profile)}<span><strong>${escapeHTML(profile.display_name || profile.username || 'Usuário')}</strong><small>@${escapeHTML(profile.username || 'usuario')}</small></span></a>` : `<a class="btn btn--primary btn--block" href="login.html">Entrar</a>`}
      ${profile ? `<a class="sidebar__link" href="settings.html">⚙<span>Configurações</span></a><button class="sidebar__link sidebar__button" data-action="signout">↪<span>Sair</span></button>`:''}
    </div>
  </aside>`;
  if (profile) document.querySelector('[data-layout] [data-action="signout"]')?.addEventListener('click', async()=>{ const {supabase}=await import('../api/supabase.js'); await supabase.auth.signOut(); location.href='index.html'; });
}
function avatar(p){const src=p?.avatar_url||`https://ui-avatars.com/api/?name=${encodeURIComponent(p?.display_name||p?.username||'P')}&background=151b22&color=fff`;return `<img class="avatar avatar--small" src="${escapeHTML(src)}" alt="">`}
function icon(k){return ({home:'⌂',feed:'◉',projects:'⌘',games:'▣',library:'▤',apps:'▦',search:'⌕',messages:'✉',notifications:'◌'})[k]||'•'}
