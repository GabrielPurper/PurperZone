const escHome = (value) => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');

async function loadHomeStats(){
  const [profiles, projects, posts] = await Promise.all([
    supabase.from('profiles').select('*',{count:'exact',head:true}),
    supabase.from('projects').select('*',{count:'exact',head:true}),
    supabase.from('posts').select('*',{count:'exact',head:true})
  ]);
  document.getElementById('profiles-count').textContent = profiles.count ?? 0;
  document.getElementById('projects-count').textContent = projects.count ?? 0;
  document.getElementById('posts-count').textContent = posts.count ?? 0;
}

async function loadRecentFeed(){
  const container=document.getElementById('recent-feed');
  const {data,error}=await supabase.from('posts').select('id,author_id,content,image_url,likes_count,created_at').order('created_at',{ascending:false}).limit(8);
  if(error){container.innerHTML='<div class="empty-state">Não foi possível carregar o feed agora.</div>';return;}
  if(!data?.length){container.innerHTML='<div class="empty-state">Ainda não há publicações. Seja uma das primeiras pessoas a publicar.</div>';return;}
  const ids=[...new Set(data.map(p=>p.author_id))];
  const {data:profiles}=await supabase.from('profiles').select('id,username,display_name,avatar_url').in('id',ids);
  const byId=Object.fromEntries((profiles||[]).map(p=>[p.id,p]));
  container.innerHTML=data.map(p=>{
    const author=byId[p.author_id]||{};
    const name=author.display_name||author.username||'Usuário';
    return `<article class="card post-card">
      <div class="post-card__author"><img src="${escHome(author.avatar_url||'assets/avatar-placeholder.svg')}" alt=""><div><strong>${escHome(name)}</strong><span>@${escHome(author.username||'usuario')}</span></div></div>
      ${p.image_url?`<img class="post-card__image" src="${escHome(p.image_url)}" alt="Imagem da publicação">`:''}
      <p>${escHome(p.content||'')}</p>
      <div class="post-card__meta"><span>♥ ${p.likes_count??0} curtidas</span><time>${new Date(p.created_at).toLocaleString('pt-BR')}</time></div>
    </article>`;
  }).join('');
}

async function refreshHome(){await Promise.all([loadHomeStats(),loadRecentFeed()]);}
refreshHome();
['profiles','projects','posts'].forEach(table=>watchTable({table,refresh:refreshHome}));
refreshOnReturn(refreshHome);
