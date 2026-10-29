/**
 * GUIA DE MANUTENÇÃO — library.js
 * Objetivo: alimentar a galeria unificada da Biblioteca com conteúdo público do Supabase.
 * Tipos: social, foto, Reel/vídeo, código, projeto e game. Os filtros só alteram a apresentação;
 * cada tipo mantém seu destino original (publicação, página de projetos ou página de games).
 * Segurança: todo texto remoto passa por escapeHtml; só conteúdo publicado/público é consultado.
 * A URL assinada de mídia é temporária. Isso reduz exposição, mas não impede capturas ou cópias.
 */
import { supabaseClient } from './supabaseClient.js';
import { escapeHtml, toast, requireAuth, setButtonLoading } from './app.js';

const gallery = document.querySelector('#library-gallery');
const countLabel = document.querySelector('#library-count');
const filters = [...document.querySelectorAll('[data-library-filter]')];
const form = document.querySelector('#library-form');
const personalList = document.querySelector('#library-list');
let user = null;
let activeFilter = 'all';
let entries = [];
const dateLabel = value => value ? new Date(value).toLocaleDateString('pt-BR') : 'Recentemente';
const shortText = (value, limit = 180) => { const text = String(value || '').trim(); return text.length > limit ? `${text.slice(0, limit)}…` : text; };

/** Define o formato do post usando metadados e, como apoio, os anexos retornados. */
function classifyPost(post, media = []) {
  const declared = String(post.metadata?.content_type || '').toLowerCase();
  if (declared === 'reel' || media.some(item => item.media_type === 'video')) return 'reel';
  if (declared === 'code' || declared === 'project') return 'code';
  if (media.some(item => item.media_type === 'image')) return 'photo';
  return 'social';
}

/** Cria URL de curta duração para um arquivo de mídia sem tornar o bucket público. */
async function signedMediaUrl(item) {
  if (!item?.storage_path || !item?.bucket_id) return '';
  try {
    const { data, error } = await supabaseClient.storage.from(item.bucket_id).createSignedUrl(item.storage_path, 1800);
    if (error) return '';
    return data?.signedUrl || '';
  } catch { return ''; }
}

function cardMarkup(entry) {
  const typeNames = { social: 'Publicação', photo: 'Foto', reel: 'Reel', code: 'Código', project: 'Projeto', game: 'Game' };
  const destination = entry.type === 'project' ? 'projects.html' : entry.type === 'game' ? 'games.html' : `post.html?id=${encodeURIComponent(entry.id)}`;
  const media = entry.mediaUrl
    ? entry.mediaType === 'video'
      ? `<video class="library-thumb-media" src="${escapeHtml(entry.mediaUrl)}" muted playsinline preload="metadata" controlsList="nodownload noremoteplayback" disablePictureInPicture draggable="false" data-protected-media></video><span class="library-play-mark" aria-hidden="true">▷</span>`
      : `<img class="library-thumb-media" src="${escapeHtml(entry.mediaUrl)}" alt="Mídia da publicação" loading="lazy" draggable="false" data-protected-media>`
    : `<div class="library-placeholder ${entry.type === 'code' ? 'is-code' : ''}"><span>${entry.type === 'code' ? '</>' : entry.type === 'game' ? '🎮' : entry.type === 'project' ? '⌘' : entry.type === 'reel' ? '▷' : '✦'}</span><small>${entry.type === 'code' ? escapeHtml(shortText(entry.content || entry.title, 120)) : escapeHtml(shortText(entry.content || entry.description || 'Conteúdo da comunidade', 95))}</small></div>`;
  const heading = entry.type === 'project' || entry.type === 'game' ? entry.title : (entry.author || 'Comunidade PurperZone');
  return `<a class="library-tile" href="${destination}" data-library-kind="${entry.type}" aria-label="Abrir ${escapeHtml(typeNames[entry.type] || 'conteúdo')}: ${escapeHtml(heading)}">
    <div class="library-tile-media">${media}<span class="library-type-badge">${escapeHtml(typeNames[entry.type] || 'Conteúdo')}</span></div>
    <div class="library-tile-info"><strong>${escapeHtml(heading)}</strong><p>${escapeHtml(shortText(entry.content || entry.description || entry.title || '', 105))}</p><small>${escapeHtml(dateLabel(entry.created_at))}</small></div>
  </a>`;
}

function renderGallery() {
  if (!gallery) return;
  const visible = entries.filter(entry => activeFilter === 'all' || entry.type === activeFilter || (activeFilter === 'code' && entry.type === 'project'));
  if (countLabel) countLabel.textContent = `${visible.length} ${visible.length === 1 ? 'conteúdo' : 'conteúdos'}`;
  gallery.innerHTML = visible.length ? visible.map(cardMarkup).join('') : `<div class="empty library-empty"><strong>Nada por aqui ainda.</strong><p>Quando houver publicações desse tipo, elas aparecerão nesta galeria.</p><a class="btn btn--primary" href="feed.html">Criar publicação</a></div>`;
}

async function loadGallery() {
  if (!gallery) return;
  if (!supabaseClient) { gallery.innerHTML = '<div class="empty">Supabase não configurado.</div>'; return; }
  gallery.innerHTML = '<div class="empty">Buscando publicações, mídia, código, projetos e games…</div>';
  try {
    // Conteúdo social publicado e público; o RLS continua sendo a proteção definitiva do banco.
    const [postRes, projectRes, gameRes] = await Promise.all([
      supabaseClient.from('posts').select('id,author_id,content,created_at,metadata,visibility,status').eq('status', 'published').eq('visibility', 'public').is('deleted_at', null).order('created_at', { ascending: false }).limit(80),
      supabaseClient.from('projects').select('id,owner_id,name,description,repo_url,created_at,is_public').eq('is_public', true).order('created_at', { ascending: false }).limit(40),
      supabaseClient.from('games').select('id,owner_id,name,description,platforms,created_at,is_public').eq('is_public', true).order('created_at', { ascending: false }).limit(40)
    ]);
    if (postRes.error) throw postRes.error;
    const posts = postRes.data || [];
    const postIds = posts.map(post => post.id);
    let mediaRows = [];
    if (postIds.length) {
      const { data, error } = await supabaseClient.from('post_media').select('id,post_id,bucket_id,storage_path,media_type,mime_type,status').in('post_id', postIds).eq('status', 'active');
      // Sem anexos não impedimos que posts de texto/código apareçam; a mensagem de erro fica no console.
      if (error) console.warn('Biblioteca: não foi possível consultar anexos.', error.message);
      else mediaRows = data || [];
    }
    const mediaByPost = {};
    for (const media of mediaRows) (mediaByPost[media.post_id] ||= []).push(media);
    const authorIds = [...new Set(posts.map(post => post.author_id).filter(Boolean))];
    let profiles = {};
    if (authorIds.length) {
      const { data, error } = await supabaseClient.from('public_profile_cards').select('id,display_name,username').in('id', authorIds);
      if (!error) profiles = Object.fromEntries((data || []).map(profile => [profile.id, profile]));
    }
    const postEntries = await Promise.all(posts.map(async post => {
      const attachments = mediaByPost[post.id] || [];
      const media = attachments.find(item => item.media_type === 'image') || attachments.find(item => item.media_type === 'video');
      const mediaUrl = media ? await signedMediaUrl(media) : '';
      const profile = profiles[post.author_id];
      return { id: post.id, type: classifyPost(post, attachments), content: post.content || '', title: post.content || 'Publicação', author: profile?.display_name || profile?.username || 'Usuário PurperZone', created_at: post.created_at, mediaUrl, mediaType: media?.media_type || '', description: '' };
    }));
    const projects = projectRes.error ? [] : (projectRes.data || []).map(project => ({ id: project.id, type: 'project', title: project.name || 'Projeto', content: '', description: project.description || project.repo_url || 'Projeto compartilhado pela comunidade', created_at: project.created_at }));
    const games = gameRes.error ? [] : (gameRes.data || []).map(game => ({ id: game.id, type: 'game', title: game.name || 'Game', content: '', description: game.description || (game.platforms || []).join(', ') || 'Game compartilhado pela comunidade', created_at: game.created_at }));
    entries = [...postEntries, ...projects, ...games].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    renderGallery();
  } catch (error) {
    gallery.innerHTML = `<div class="empty error">Não foi possível carregar a Biblioteca: ${escapeHtml(error.message || 'erro inesperado')}<p>Verifique as permissões de leitura pública e as políticas RLS do Supabase.</p><button class="btn" type="button" id="library-retry">Tentar novamente</button></div>`;
    gallery.querySelector('#library-retry')?.addEventListener('click', loadGallery);
    if (countLabel) countLabel.textContent = 'Não foi possível carregar';
  }
}

filters.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.libraryFilter || 'all';
  filters.forEach(filter => { const selected = filter === button; filter.classList.toggle('active', selected); filter.setAttribute('aria-selected', String(selected)); });
  renderGallery();
}));
document.querySelector('#library-refresh')?.addEventListener('click', loadGallery);

/** Mantém a antiga coleção pessoal, separada da galeria comunitária. */
async function loadPersonalCollection() {
  if (!personalList || !supabaseClient) return;
  user = user || await requireAuth();
  if (!user) return;
  const { data, error } = await supabaseClient.from('library_items').select('*').eq('owner_id', user.id).order('created_at', { ascending: false });
  if (error) { personalList.innerHTML = `<div class="empty error">${escapeHtml(error.message)}</div>`; return; }
  personalList.innerHTML = (data || []).map(item => `<article class="card interactive"><div class="item-head"><h3>${escapeHtml(item.title)}</h3><span class="tag">${escapeHtml(item.status || 'backlog')}</span></div><p class="muted">${escapeHtml(item.platform || 'Sem plataforma')}</p><small class="muted">${Number(item.hours_played || 0).toFixed(1)} h</small></article>`).join('') || '<div class="empty">Sua coleção pessoal ainda está vazia.</div>';
}

form?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!supabaseClient) return toast('Supabase não configurado.', 'error');
  user = user || await requireAuth();
  if (!user) return;
  const button = form.querySelector('button[type="submit"]');
  setButtonLoading(button, true, 'Salvando…');
  const values = new FormData(form);
  const { error } = await supabaseClient.from('library_items').insert({ owner_id: user.id, title: values.get('title'), status: values.get('status') || 'backlog' });
  setButtonLoading(button, false);
  if (error) toast(error.message, 'error');
  else { toast('Item salvo na sua coleção.', 'success'); form.reset(); loadPersonalCollection(); }
});

loadGallery();
loadPersonalCollection();
