import { supabaseClient } from './supabaseClient.js';

export async function initHome(){
  if(!supabaseClient)return;
  const stats=[['profiles','profiles-count'],['projects','projects-count'],['posts','posts-count']];
  await Promise.all(stats.map(async([table,id])=>{
    try{
      const {count,error}=await supabaseClient.from(table).select('id',{count:'exact',head:true});
      const el=document.getElementById(id);
      if(el&&!error)el.textContent=count??0;
    }catch{}
  }));
}
