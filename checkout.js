/**
 * GUIA DE MANUTENÇÃO — checkout.js
 * Objetivo: Lógica de interface e integração da página/módulo.
 * Como modificar: Leia os imports para identificar dependências. Mantenha validação de dados, tratamento de erros e escape de conteúdo inserido no HTML.
 * Convenções: mantenha funções pequenas, use nomes claros, trate erros de rede e nunca exponha segredos no frontend.
 */

import{supabaseClient}from'./supabaseClient.js';import{toast,requireAuth,setButtonLoading,setInlineMessage}from'./app.js';
const button=document.querySelector('#checkout-button');const message=document.querySelector('#checkout-message');
button?.addEventListener('click',async()=>{const user=await requireAuth();if(!user)return;setButtonLoading(button,true,'Abrindo pagamento...');try{const{data:cart,error:ce}=await supabaseClient.from('carts').select('id').eq('user_id',user.id).maybeSingle();if(ce)throw ce;if(!cart)throw new Error('Seu carrinho está vazio.');const{data:items,error:ie}=await supabaseClient.from('cart_items').select('id').eq('cart_id',cart.id).limit(1);if(ie)throw ie;if(!items?.length)throw new Error('Seu carrinho está vazio.');const{data,error}=await supabaseClient.functions.invoke('stripe-create-checkout',{body:{user_id:user.id,cart_id:cart.id,success_url:new URL('success.html',location.href).href,cancel_url:new URL('cart.html',location.href).href}});if(error)throw error;if(data?.error)throw new Error(data.error);if(!data?.checkout_url)throw new Error('O Stripe não retornou uma URL de checkout.');location.href=data.checkout_url}catch(e){setInlineMessage(message,e.message||'Não foi possível iniciar o checkout.','error');toast(e.message||'Falha no checkout.','error')}finally{setButtonLoading(button,false)}});
