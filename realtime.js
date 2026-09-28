// Mantém a interface sincronizada com o banco. O polling é apenas um fallback caso o Realtime não esteja habilitado para a tabela.
function watchTable({table,event='*',filter,refresh,interval=30000}){
  const channel=supabase.channel(`purperzone-${table}-${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes',{event,schema:'public',table,...(filter?{filter}:{})},()=>refresh())
    .subscribe();
  const timer=setInterval(()=>{if(!document.hidden)refresh()},interval);
  return ()=>{clearInterval(timer);supabase.removeChannel(channel)};
}
function refreshOnReturn(refresh){document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});}
