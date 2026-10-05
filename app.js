import { supabase, currentUser, DB, query } from './api/supabase.js';

export const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
export const formatDate = value => value ? new Intl.DateTimeFormat('pt-BR', { dateStyle:'medium', timeStyle:'short' }).format(new Date(value)) : '';
export const money = (cents, currency='BRL') => new Intl.NumberFormat('pt-BR',{style:'currency',currency:currency.toUpperCase()}).format((cents||0)/100);
export const $ = (s, root=document) => root.querySelector(s);
export const $$ = (s, root=document) => [...root.querySelectorAll(s)];

export function toast(message, type='info') {
  let box = $('#toast');
  if (!box) { box = document.createElement('div'); box.id='toast'; box.className='toast'; document.body.appendChild(box); }
  box.textContent = message; box.dataset.type = type; box.classList.add('toast--visible');
  clearTimeout(window.__toastTimer); window.__toastTimer = setTimeout(()=>box.classList.remove('toast--visible'), 3200);
}

export function setLoading(el, loading, label='Carregando…') {
  if (!el) return;
  el.disabled = loading; el.dataset.loading = loading ? 'true' : 'false';
  if (loading) { el.dataset.originalText = el.textContent; el.textContent = label; }
  else if (el.dataset.originalText) el.textContent = el.dataset.originalText;
}

export async function requireAuth({ redirect='login.html' }={}) {
  try { const user = await currentUser(); if (!user) { location.href=redirect; return null; } return user; }
  catch { location.href=redirect; return null; }
}

export async function optionalUser() { try { return await currentUser(); } catch { return null; } }

export function avatar(profile, size=48) {
  const src = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.display_name || profile?.username || 'P')}&background=151b22&color=ffffff&size=${size}`;
  return `<img class="avatar" width="${size}" height="${size}" src="${escapeHTML(src)}" alt="Avatar de ${escapeHTML(profile?.display_name || profile?.username || 'usuário')}" loading="lazy">`;
}

export function navUser(profile) {
  const el = $('#nav-user'); if (!el) return;
  el.innerHTML = profile ? `${avatar(profile,32)}<span>${escapeHTML(profile.display_name || profile.username || 'Perfil')}</span>` : '<span>Entrar</span>';
  el.href = profile ? `profile.html?id=${encodeURIComponent(profile.id)}` : 'login.html';
}

export async function bootstrapPage() {
  document.documentElement.dataset.page = document.body.dataset.page || '';
  const user = await optionalUser();
  if (user) {
    const profile = await loadProfile(user.id).catch(()=>null);
    navUser(profile);
    document.body.classList.add('is-authenticated');
    $$('[data-auth-only]').forEach(x=>x.hidden=false);
  } else {
    $$('[data-auth-only]').forEach(x=>x.hidden=true);
  }
  $$('[data-action="signout"]').forEach(btn => btn.addEventListener('click', async e => { e.preventDefault(); await supabase.auth.signOut(); location.href='index.html'; }));
  await checkMaintenance();
}

async function checkMaintenance() {
  // A configuração pública pode ser exposta pela tabela site_settings quando o RLS permitir leitura.
  // Se ela não estiver acessível, o site continua normalmente; manutenção deve ser aplicada também no host.
  try {
    const rows = await query('site_settings', { eq:{key:'maintenance_mode'}, limit:1 });
    const enabled = rows[0]?.value?.enabled === true || rows[0]?.value === true;
    if (enabled && !location.pathname.endsWith('maintenance.html')) location.href='maintenance.html';
  } catch { /* Falha de leitura não deve derrubar o frontend inteiro. */ }
}

export function subscribeTable(table, callback, filter) {
  const channel = supabase.channel(`pz-${table}-${crypto.randomUUID()}`).on('postgres_changes', {event:'*', schema:'public', table, ...(filter ? {filter} : {})}, callback).subscribe();
  return () => supabase.removeChannel(channel);
}

window.PurperZone = { supabase, DB, toast, escapeHTML, formatDate, money };
