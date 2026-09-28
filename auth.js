// Autenticação do PurperZone.
// O trigger do banco cria o perfil inicial; não duplicamos esse INSERT no navegador.

async function signUp(email,password,username){
  return supabase.auth.signUp({email,password,options:{data:{username}}});
}
async function signIn(email,password){return supabase.auth.signInWithPassword({email,password})}
async function signOut(){await supabase.auth.signOut();location.href="index.html"}
async function getCurrentUser(){const{data:{user}}=await supabase.auth.getUser();return user}
async function requireAuth(){const u=await getCurrentUser();if(!u)location.href="login.html";return u}
function highlightActiveNavLink(){const p=document.body.dataset.page;document.querySelectorAll(".sidebar__link").forEach(x=>x.classList.toggle("sidebar__link--active",x.dataset.page===p))}
document.addEventListener("DOMContentLoaded",highlightActiveNavLink);
