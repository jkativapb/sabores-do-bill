(function(root){
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=n=>Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
 const row=(label,value,cls='')=>'<div class="receipt-row '+cls+'"><span>'+esc(label)+'</span><span>'+esc(value)+'</span></div>';
 function receiptItems(items){
 const borderInfo=i=>String(i.nome_produto||'').match(/^Borda de (.*?) — (.*?) \((Kids|Tradicional)[^)]*\)$/i);
 const borders=items.filter(i=>borderInfo(i)),used=new Set(),lines=[];
 const comboBorder=i=>String(i.nome_produto||'').match(/^Bordas\s*[—–-]\s*(.+)$/i);
 for(const i of items){if(borderInfo(i))continue;if(comboBorder(i)&&items.some(parent=>parent.nome_produto===comboBorder(i)[1]))continue;
  const attached=borders.filter(b=>!used.has(b)&&((b.configuracao?.produto_origem&&b.configuracao.produto_origem===i.produto_id)||(!b.configuracao?.produto_origem&&borderInfo(b)[2]===i.nome_produto&&Number(b.quantidade)===Number(i.quantidade))));
  const category=i.produtos?.categorias?.nome||i.categoria_nome||attached.map(b=>borderInfo(b)[3])[0]||'';
  const size=/kids/i.test(category)?'Kids':/tradicional/i.test(category)?'Tradicional':'';
  const name=String(i.nome_produto)+(size&&!/\((Kids|Tradicional)\)| - (Kids|Tradicional)$/i.test(i.nome_produto)?' - '+size:'');
  lines.push(row(i.quantidade+'x '+name,money(i.subtotal),'receipt-item'));
  const note=String(i.observacoes||'').replace(/(?:^|\n)Borda de [^\n]+/g,'').trim();
  if(note&&!comboBorder(i))lines.push('<div class="receipt-item-note">'+esc(note)+'</div>');
  for(const b of items.filter(b=>comboBorder(b)&&comboBorder(b)[1]===i.nome_produto&&!used.has(b))){used.add(b);lines.push(row(b.quantidade+'x Bordas do combo',money(b.subtotal),'receipt-item'));}
  for(const b of attached){used.add(b);lines.push(row(b.quantidade+'x Borda '+borderInfo(b)[1],money(b.subtotal),'receipt-item'));}
 }
 for(const b of borders)if(!used.has(b))lines.push(row(b.quantidade+'x Borda '+borderInfo(b)[1],money(b.subtotal),'receipt-item'));
 return lines.join('');
 }
 function html(o,items){const d=o.dados_cliente||{},payment={pix:'Pix',credito_maquininha:'Crédito — maquininha',debito_maquininha:'Débito — maquininha',dinheiro:'Dinheiro',cartao:'Cartão — maquininha'}[o.pagamento_metodo]||o.pagamento_metodo;
 const date=new Date(o.created_at).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
 return '<article class="bill-receipt"><div class="receipt-date">'+esc(date)+'</div><div class="eyebrow">PEDIDO #'+esc(o.numero)+'</div><h2 class="receipt-client">'+esc(d.nome||o.clientes?.nome||'Cliente')+'</h2><div class="receipt-kind">'+(o.tipo_entrega==='entrega'?'ENTREGA':'RETIRADA')+'</div><div>Pagamento: '+esc(payment)+'</div><div>'+(o.pagamento_status==='pago'?'PAGO':'PAGAMENTO PENDENTE')+'</div>'+(o.pagamento_metodo==='dinheiro'&&o.troco_para!=null?row('Troco para',money(o.troco_para))+row('Levar troco',money(o.valor_troco)):'')+'<div>'+esc(d.telefone||'')+'</div><div class="receipt-address">'+esc(d.endereco||'Retirada no estabelecimento').replace(/\n/g,'<br>')+'</div><div class="receipt-divider"></div>'+receiptItems(items)+'<div class="receipt-divider"></div>'+row('Subtotal',money(o.subtotal))+row('Desconto',money(o.valor_desconto))+row('Entrega',money(o.taxa_entrega))+row('TOTAL',money(o.total),'receipt-total')+(o.observacoes?'<div class="receipt-observation">Obs.: '+esc(o.observacoes)+'</div>':'')+'</article>';
 }
 function print(){const receipt=document.querySelector('#detail-body .bill-receipt');if(!receipt)return window.print();let style=document.getElementById('bill-paper-size');if(!style){style=document.createElement('style');style.id='bill-paper-size';document.head.append(style);}const height=Math.ceil(receipt.getBoundingClientRect().height/3.77952756)+5;style.textContent='@media print{@page{size:58mm '+Math.max(20,height)+'mm;margin:2mm}html,body{height:auto!important;min-height:0!important}}';window.print();}
 const api={html,print};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BillReceipt=api;
})(typeof window!=='undefined'?window:globalThis);
