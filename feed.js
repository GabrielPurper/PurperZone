import { supabaseClient } from './supabaseClient.js';
import { escapeHtml, toast, requireAuth, setButtonLoading } from './app.js';
const list=document.querySelector('#feed-list'),form=document.querySelector('#post-form');
const tabs=[...document.querySelectorAll('[data-feed-mode]')]; let user=null, mode='for-you', loading=false;

function renderPost(post,profile,liked=false){
  const author=profile?.display_name||profile?.username||'Usuário PurperZone';
  return `<article class="card post-card interactive">
    <div class="post-meta"><span class="mini-avatar">${escapeHtml(author.slice(0,1).toUpperCase())}</span><div><strong>${escapeHtml(author)}</strong><span>${new Date(post.created_at).toLocaleString('pt-BR')}</span></div></div>
    <div class="post-content">${escapeHtml(post.content||'')}</div>
    <div class="post-actions">
      <button class="btn ${liked?'liked':''}" type="button" data-like="${post.id}" aria-pressed="${liked}">♡ <span>${post.likes_count||0}</span></button>
      <a class="btn" href="post.html?id=${post.id}">Comentar</a>
      <button class="btn" type="button" data-share="${post.id}">Compartilhar</button>
    </div>
  </article>`;
}

async function load(modeOverride=mode){
  if(!list||loading)return; loading=true; mode=modeOverride;
  list.innerHTML='<div class="empty">Carregando seu próximo pedaço do PurperZone…</div>';
  if(!supabaseClient){list.innerHTML='<div class="empty">Não foi possível conectar ao Supabase.</div>';loading=false;return}
  user=user||await requireAuth();if(!user){loading=false;return}
  let query=supabaseClient.from('posts').select('id,author_id,content,likes_count,created_at,status,visibility,metadata').in('status',['published','unlisted']).is('deleted_at',null).limit(30);
  if(mode==='trending')query=query.order('likes_count',{ascending:false}).order('created_at',{ascending:false});
  else query=query.order('created_at',{ascending:false});
  if(mode==='following'){
    const {data:follows,error:followError}=await supabaseClient.from('follows').select('following_id').eq('follower_id',user.id);
    if(followError){list.innerHTML=`<div class="empty error">Não foi possível carregar quem você segue: ${escapeHtml(followError.message)}</div>`;loading=false;return;}
    const ids=(follows||[]).map(x=>x.following_id); if(!ids.length){list.innerHTML='<div class="empty"><strong>Seu círculo ainda está vazio.</strong><br>Siga pessoas e projetos para montar um feed personalizado.</div>';loading=false;return;} query=query.in('author_id',ids);
  }
  const {data,error}=await query;
  if(error){list.innerHTML=`<div class="empty error">Não foi possível carregar o feed: ${escapeHtml(error.message)}</div>`;loading=false;return;}
  const posts=data||[]; const ids=[...new Set(posts.map(p=>p.author_id))]; let profiles={};
  if(ids.length){const {data:ps}=await supabaseClient.from('public_profile_cards').select('id,display_name,username,avatar_url').in('id',ids);profiles=Object.fromEntries((ps||[]).map(p=>[p.id,p]));}
  const postIds=posts.map(p=>p.id);let likedSet=new Set();
  if(postIds.length){const {data:likes}=await supabaseClient.from('post_reactions').select('post_id').eq('user_id',user.id).eq('reaction_type','like').in('post_id',postIds);likedSet=new Set((likes||[]).map(x=>x.post_id));}
  list.innerHTML=posts.length?posts.map((p,i)=>{const html=renderPost(p,profiles[p.author_id],likedSet.has(p.id));return html.replace('post-card interactive','post-card interactive" style="animation-delay:'+Math.min(i,8)*35+'ms');}).join(''):'<div class="empty"><strong>Nenhuma publicação ainda.</strong><br>Seja a primeira pessoa a publicar no PurperZone.</div>';
  bindInteractions(); loading=false;
}

async function toggleLike(button){
  if(!user)return; const postId=button.dataset.like; const liked=button.classList.contains('liked');
  button.disabled=true;
  try{
    if(liked){const {error}=await supabaseClient.from('post_reactions').delete().eq('post_id',postId).eq('user_id',user.id).eq('reaction_type','like');if(error)throw error;}
    else{const {error}=await supabaseClient.from('post_reactions').insert({post_id:postId,user_id:user.id,reaction_type:'like'});if(error)throw error;}
    const count=button.querySelector('span');count.textContent=Math.max(0,Number(count.textContent||0)+(liked?-1:1));button.classList.toggle('liked',!liked);button.setAttribute('aria-pressed',String(!liked));
  }catch(error){toast(error.message||'Não foi possível atualizar a curtida.','error')}
  finally{button.disabled=false}
}

function bindInteractions(){
  list.querySelectorAll('[data-like]').forEach(b=>b.addEventListener('click',()=>toggleLike(b)));
  list.querySelectorAll('[data-share]').forEach(b=>b.addEventListener('click',async()=>{const url=new URL(`post.html?id=${b.dataset.share}`,location.href).href;try{await navigator.clipboard.writeText(url);toast('Link copiado.','success')}catch{toast(url)}}));
}

form?.addEventListener('submit',async e=>{
  e.preventDefault();if(!supabaseClient)return toast('Supabase não configurado.','error');user=user||await requireAuth();if(!user)return;
  const content=form.content.value.trim();if(!content)return toast('Escreva algo antes de publicar.','error');
  const button=form.querySelector('button[type="submit"],button:not([type])');setButtonLoading(button,true,'Publicando...');
  const {error}=await supabaseClient.from('posts').insert({content,author_id:user.id,status:'published',visibility:'public',metadata:{content_type:'post'}});
  setButtonLoading(button,false);if(error)toast(error.message,'error');else{form.reset();toast('Publicação criada.','success');load(mode)}
});

tabs.forEach(tab=>tab.addEventListener('click',()=>{tabs.forEach(x=>x.classList.remove('active'));tab.classList.add('active');load(tab.dataset.feedMode)}));
document.querySelector('[data-feed-mode="for-you"]')?.classList.add('active');
load();
