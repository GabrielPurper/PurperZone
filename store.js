import { DB, query, insert, supabase } from '../api/supabase.js';
import { requireAuth, escapeHTML, money, toast } from '../app.js';

export async function initStore(){
  const user=await requireAuth(); if(!user)return;
  const host=document.querySelector('#products-list');
  try{
    const rows=await query(DB.products,{eq:{active:true},order:{column:'created_at',ascending:false},limit:100});
    host.innerHTML=rows.length?rows.map(p=>`<article class="product-card card"><img src="${escapeHTML(p.image_url||'https://placehold.co/640x420/151b22/fff?text=PurperZone')}" alt=""><div><span class="eyebrow">${escapeHTML(p.product_type||'produto')}</span><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description||'')}</p><strong>${money(p.price_cents,p.currency||'BRL')}</strong><button class="btn btn--primary" data-product="${p.id}">Adicionar ao carrinho</button></div></article>`).join(''):'<div class="empty-state">A loja está pronta, mas ainda não há produtos publicados.</div>';
    host.querySelectorAll('[data-product]').forEach(b=>b.onclick=()=>addToCart(user.id,b.dataset.product,rows.find(p=>p.id===b.dataset.product)));
  }catch(e){host.innerHTML='<div class="empty-state">Não foi possível carregar a loja.</div>'}
}

async function getOrCreateCart(userId){
  const carts=await query(DB.carts,{eq:{user_id:userId},order:{column:'updated_at',ascending:false},limit:1});
  if(carts[0])return carts[0];
  return insert(DB.carts,{user_id:userId,currency:'brl'});
}

async function addToCart(userId,productId,product){
  try{
    const cart=await getOrCreateCart(userId);
    const existing=await query(DB.cartItems,{eq:{cart_id:cart.id,product_id:productId},limit:1});
    if(existing[0]){
      const {error}=await supabase.from(DB.cartItems).update({quantity:existing[0].quantity+1,unit_price_cents:product.price_cents}).eq('id',existing[0].id);if(error)throw error;
    }else await insert(DB.cartItems,{cart_id:cart.id,product_id:productId,quantity:1,unit_price_cents:product.price_cents});
    toast('Produto adicionado ao carrinho.','success');
  }catch(e){toast(e.message,'error')}
}
