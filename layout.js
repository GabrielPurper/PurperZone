import { getUser, escapeHtml } from './app.js';
import { supabaseClient } from './supabaseClient.js';

export async function renderLayout() {
  const host=document.querySelector('[data-layout]'); if(!host)return;
  const {data:{user}}=await supabaseClient.auth.getUser();
  const page=document.body.dataset.page||'home';
  const links=[['feed.html','◉ Feed','feed'],['reels.html','▷ Reels','reels'],['projects.html','⌘ Projetos','projects'],['games.html','◈ Games','games'],['library.html','▤ Biblioteca','library'],['apps.html','▦ Apps','apps'],['messages.html','✉ Mensagens','messages'],['notifications.html','♢ Notificações','notifications'],['settings.html','⚙ Configurações','settings']];
  host.innerHTML=`<aside class="sidebar"><a class="sidebar-brand brand" href="index.html">Purper<span>Zone</span></a><nav class="sidebar-nav">${links.map(([href,label,key])=>`<a class="side-link ${page===key?'active':''}" data-nav href="${href}">${label}</a>`).join('')}</nav><div class="sidebar-bottom">${user?`<a class="side-link" href="profile.html">◉ Perfil</a><button class="side-link btn" type="button" data-logout>↪ Sair</button>`:`<a class="btn btn--primary btn--block" href="login.html">Entrar</a>`}</div></aside>`;
}
