(()=>{
 function refresh(){document.querySelectorAll('#orders .order-card').forEach(card=>{const id=card.querySelector('[data-detail]')?.dataset.detail,o=orders.find(o=>o.id===id);if(!o)return;const b=card.querySelector('.primary[data-detail]');if(b){b.textContent='Aprovar e imprimir';b.dataset.approve=id;}if(o.impressao_solicitada_em&&!card.querySelector('[data-reprint]')){const r=document.createElement('button');r.className='secondary';r.textContent='Reimprimir';r.dataset.reprint=id;card.append(r);}});}
 document.getElementById('orders').addEventListener('click',async e=>{const b=e.target.closest('[data-approve],[data-reprint]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const re=!!b.dataset.reprint,id=b.dataset.approve||b.dataset.reprint;if(re&&!confirm('Imprimir outra via? Confira antes a fila do Windows para evitar duplicidade.'))return;b.disabled=true;try{
 if(re){await BillDB.request('rpc/bill_aprovar_imprimir',{method:'POST',body:{p_pedido:id,p_reimprimir:true},admin:true});$('panel-error').textContent='Reimpressão enviada ao Impressor Bill.';await load();return;}
 const o=orders.find(o=>o.id===id);
 const items=await BillDB.request('pedido_itens?select=*,produtos(categorias(nome))&pedido_id=eq.'+id+'&order=created_at.asc',{admin:true});
 await BillDB.request('rpc/bill_aprovar_navegador',{method:'POST',body:{p_pedido:id,p_reimprimir:false},admin:true});
 $('detail-body').innerHTML=BillReceipt.html({...o,status:'confirmado',pagamento_status:o.pagamento_metodo==='pix'?'pago':o.pagamento_status},items)+'<div class="no-print"><button class="primary full" id="print-receipt">Imprimir comanda</button><p>Pedido aprovado e enviado para preparo. Se cancelar a impressão, use este botão para tentar novamente.</p></div>';
 if(!$('detail-dialog').open)$('detail-dialog').showModal();
 $('print-receipt').onclick=()=>BillReceipt.print();
 $('panel-error').textContent='Pedido aprovado. Confira a impressão da comanda.';
 BillReceipt.print();await load();
}catch(err){$('panel-error').textContent=err.message;}finally{b.disabled=false;}},true);
 new MutationObserver(refresh).observe($('orders'),{childList:true});refresh();
})();
