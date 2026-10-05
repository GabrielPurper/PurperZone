import { supabase, currentUser } from '../api/supabase.js';
import { toast, setLoading } from '../app.js';

export async function signUp({email,password,username,displayName}) {
  return supabase.auth.signUp({ email, password, options:{ data:{ username, display_name:displayName } } });
}
export async function signIn(email,password){ return supabase.auth.signInWithPassword({email,password}); }
export async function oauth(provider){ return supabase.auth.signInWithOAuth({provider, options:{redirectTo:location.origin + location.pathname}}); }
export async function resetPassword(email){ return supabase.auth.resetPasswordForEmail(email,{redirectTo:location.origin+'/login.html?mode=reset'}); }
export async function updatePassword(password){ return supabase.auth.updateUser({password}); }
export async function signOut(){ await supabase.auth.signOut(); location.href='index.html'; }
export { currentUser };

export function bindAuthForm(){
  const form=document.querySelector('[data-auth-form]'); if(!form)return;
  form.addEventListener('submit',async e=>{e.preventDefault(); const btn=form.querySelector('button[type=submit]'); setLoading(btn,true);
    try{ const mode=form.dataset.mode; const email=form.email.value.trim();
      if(mode==='login'){ const {error}=await signIn(email,form.password.value); if(error)throw error; location.href=new URLSearchParams(location.search).get('next')||'feed.html'; }
      else if(mode==='signup'){ const {data,error}=await signUp({email,password:form.password.value,username:form.username.value.trim(),displayName:form.display_name.value.trim()}); if(error)throw error; toast(data.session?'Conta criada.':'Conta criada. Verifique seu e-mail.','success'); if(data.session)location.href='feed.html'; }
      else { const {error}=await resetPassword(email); if(error)throw error; toast('Se o e-mail existir, enviaremos as instruções de recuperação.','success'); }
    }catch(err){toast(err.message||'Não foi possível concluir a operação.','error')}finally{setLoading(btn,false)}
  });
}
