/**
 * GUIA DE MANUTENÇÃO — games.js
 * Objetivo: Catálogo de jogos e promoções externas.
 * Como modificar: Consulta vitrines públicas da Steam e jogos gratuitos/promocionais da Epic, além de posts da comunidade no Supabase. APIs externas podem mudar, limitar requisições ou falhar; mantenha mensagens de fallback e valide links antes de alterar a renderização.
 * Convenções: mantenha funções pequenas, use nomes claros, trate erros de rede e nunca exponha segredos no frontend.
 */

import {supabaseClient} from './supabaseClient.js';
import {escapeHtml} from './app.js';
const steam=document.querySelector('#steam-deals'),epic=document.querySelector('#epic-free-games'),community=document.querySelector('#games-community');
const esc=escapeHtml;
/**
 * Formata valores de loja em moeda brasileira; confira unidade e moeda quando alterar a fonte dos preços.
 */
function money(value,currency='BRL'){if(value==null)return 'Confira na loja';try{return new Intl.NumberFormat('pt-BR',{style:'currency',currency}).format(value/100)}catch{return 'Confira na loja'}}
/**
 * Renderiza um cartão de jogo externo; os links abrem a página original da loja.
 */
function card({title,description,image,url,price,oldPrice,badge='Loja'}){return `<article class="external-game-card">${image?`<a href="${url}" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="${esc(image)}" alt=""></a>`:''}<div class="external-game-card-body"><span class="tag">${esc(badge)}</span><h3>${esc(title)}</h3><p>${esc(description||'')}</p>${price!=null?`<div class="game-price">${oldPrice!=null&&oldPrice>price?`<del>${money(oldPrice)}</del>`:''}<strong>${money(price)}</strong></div>`:''}<a class="btn btn--primary" href="${url}" target="_blank" rel="noopener noreferrer">Ver na loja ↗</a></div></article>`}
/**
 * Busca e exibe vitrines e promoções públicas da Steam.
 */
async function loadSteam(){
 try{
  const res=await fetch('https://store.steampowered.com/api/featuredcategories/?cc=br&l=brazilian',{headers:{Accept:'application/json'}});
  if(!res.ok)throw new Error('Steam indisponível');const data=await res.json();
  const items=[...(data.specials?.items||[]),...(data.top_sellers?.items||[]),...(data.coming_soon?.items||[])];
  const seen=new Set(),unique=items.filter(x=>x.id&&!seen.has(x.id)&&seen.add(x.id)).slice(0,8);
  steam.innerHTML=unique.length?unique.map(x=>card({title:x.name,description:x.discount_percent?`${x.discount_percent}% de desconto`:'Disponível na Steam',image:x.header_image,url:`https://store.steampowered.com/app/${x.id}/`,price:x.final_price,oldPrice:x.original_price,badge:x.discount_percent?`-${x.discount_percent}%`:'Steam'})).join(''):'<div class="empty">Não há ofertas disponíveis nesta consulta. Acesse a página oficial da Steam.</div>';
 }catch{steam.innerHTML='<div class="empty">Não foi possível carregar ofertas automaticamente agora. <a href="https://store.steampowered.com/specials/?l=brazilian" target="_blank" rel="noopener noreferrer">Ver promoções oficiais da Steam ↗</a></div>'}
}
/**
 * Busca jogos gratuitos/promocionais publicados pela Epic Games.
 */
async function loadEpic(){
 try{
  const res=await fetch('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=pt-BR&country=BR&allowCountries=BR',{headers:{Accept:'application/json'}});
  if(!res.ok)throw new Error('Epic indisponível');const data=await res.json();
  const elements=data?.data?.Catalog?.searchStore?.elements||[];
  const games=elements.filter(x=>x.promotions?.promotionalOffers?.some(group=>group.promotionalOffers?.length)||x.promotions?.upcomingPromotionalOffers?.some(group=>group.promotionalOffers?.length)).slice(0,8);
  epic.innerHTML=games.length?games.map(x=>{const slug=x.productSlug||x.urlSlug||x.catalogNs?.mappings?.[0]?.pageSlug;const offer=x.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0];const upcoming=!offer;return card({title:x.title,description:upcoming?'Promoção gratuita anunciada para breve':'Oferta gratuita promocional — confira a validade na loja',image:x.keyImages?.find(i=>i.type==='OfferImageWide')?.url||x.keyImages?.[0]?.url,url:slug?`https://store.epicgames.com/pt-BR/p/${slug}`:'https://store.epicgames.com/pt-BR/free-games',price:0,badge:upcoming?'Em breve':'Grátis na Epic'})}).join(''):'<div class="empty">Nenhum jogo grátis encontrado na consulta atual. <a href="https://store.epicgames.com/pt-BR/free-games" target="_blank" rel="noopener noreferrer">Conferir a Epic Games ↗</a></div>';
 }catch{epic.innerHTML='<div class="empty">Não foi possível carregar os jogos grátis agora. <a href="https://store.epicgames.com/pt-BR/free-games" target="_blank" rel="noopener noreferrer">Ver jogos grátis na Epic Games ↗</a></div>'}
}
/**
 * Busca conteúdo relacionado a jogos publicado na comunidade PurperZone.
 */
async function loadCommunity(){
 if(!supabaseClient){community.innerHTML='<div class="empty">Conecte o Supabase para ver publicações gamer.</div>';return}
 const {data,error}=await supabaseClient.from('posts').select('id,author_id,content,created_at,likes_count,metadata').in('status',['published','unlisted']).is('deleted_at',null).order('created_at',{ascending:false}).limit(40);
 if(error){community.innerHTML='<div class="empty">Não foi possível carregar as publicações da comunidade.</div>';return}
 const posts=data||[];
 const ids=posts.map(x=>x.id);let mediaByPost={};
 if(ids.length){
  const {data:media}=await supabaseClient.from('post_media').select('id,post_id,bucket_id,storage_path,media_type,mime_type,status').in('post_id',ids).eq('media_type','video').eq('status','active');
  for(const m of media||[])(mediaByPost[m.post_id]??=[]).push(m);
 }
 const matches=posts.filter(x=>/game|jogo|steam|epic|gaming|gameplay|medal|clipe/i.test(`${x.content||''} ${JSON.stringify(x.metadata||{})}`)||(mediaByPost[x.id]||[]).length);
 const cards=[];
 for(const x of matches.slice(0,8)){
  const media=(mediaByPost[x.id]||[])[0];let videoUrl='';
  if(media?.storage_path){try{const {data:link}=await supabaseClient.storage.from(media.bucket_id||'post-media').createSignedUrl(media.storage_path,1800);videoUrl=link?.signedUrl||''}catch{}}
  cards.push(`<article class="card gamer-post-card"><span class="tag">${media?'Clipe da comunidade':'Publicação gamer'}</span>${videoUrl?`<div class="gamer-video"><video src="${esc(videoUrl)}" controls controlsList="nodownload noremoteplayback" disablePictureInPicture draggable="false" oncontextmenu="return false" data-protected-media playsinline preload="metadata"></video></div>`:''}<p>${esc(x.content||'Gameplay compartilhada pela comunidade.')}</p><small class="muted">${x.created_at?new Date(x.created_at).toLocaleString('pt-BR'):''}</small><div class="post-actions"><span class="tag">♡ ${Number(x.likes_count)||0}</span><a class="btn" href="post.html?id=${encodeURIComponent(x.id)}">Comentar / abrir</a></div></article>`);
 }
 community.innerHTML=cards.length?cards.join(''):'<div class="empty">Ainda não há clipes ou publicações gamer identificados. Publique gameplays, dicas ou notícias no <a href="feed.html">Painel Principal</a> para elas aparecerem aqui. <p><a href="https://medal.tv/" target="_blank" rel="noopener noreferrer">Conhecer Medal ↗</a></p></div>';
}
loadSteam();loadEpic();loadCommunity();
