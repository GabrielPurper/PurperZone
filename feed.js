function escFeed(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
async function loadGlobalFeed(el){
  const {data,error}=await supabase.from('posts').select('id,author_id,content,image_url,likes_count,created_at').order('created_at',{ascending:false}).limit(30);
  if(error){el.innerHTML='<div class="empty-state">Não foi possível carregar o feed.</div>';return;}
  if(!data?.length){el.innerHTML='<div class="empty-state">Ainda não existem publicações.</div>';return;}
  const ids=[...new Set(data.map(p=>p.author_id))];
  const {data:profiles}=await supabase.from('profiles').select('id,username,display_name,avatar_url').in('id',ids);
  const byId=Object.fromEntries((profiles||[]).map(p=>[p.id,p]));
  el.innerHTML=data.map(p=>{const a=byId[p.author_id]||{};return `<article class="card post-card"><div class="post-card__author"><img src="${escFeed(a.avatar_url||'assets/avatar-placeholder.svg')}" alt=""><div><strong>${escFeed(a.display_name||a.username||'Usuário')}</strong><span>@${escFeed(a.username||'usuario')}</span></div></div>${p.image_url?`<img class="post-card__image" src="${escFeed(p.image_url)}" alt="Imagem da publicação">`:''}<p>${escFeed(p.content||'')}</p><div class="post-card__meta"><span>♥ ${p.likes_count??0} curtidas</span><time>${new Date(p.created_at).toLocaleString('pt-BR')}</time></div></article>`}).join('');
}
async function createPost(content,imageUrl){const u=await getCurrentUser();if(!u)return{error:'Você precisa estar logado.'};return supabase.from('posts').insert({author_id:u.id,content,image_url:imageUrl||null})}
