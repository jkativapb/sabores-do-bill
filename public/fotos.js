// Fotos originais fornecidas pelo restaurante. O link salvo no PDV tem prioridade.
(function(root){
 const files={
  'carne':'carne','banana com canela':'banana-com-canela',
  'carne com queijo':'carne-com-queijo','chocolate branco':'chocolate-branco',
  'chocolate preto':'chocolate-preto','dois amores':'dois-amores','frango':'frango',
  'frango com cheddar':'frango-com-cheddar','frango com queijo':'frango-com-queijo',
  'pizza':'pizza','queijo':'queijo','romeu e julieta':'romeu-e-julieta'
 };
 const asset=name=>'images/produtos/'+name+'.jpeg';
 function forProduct(name,category,saved){
  if(typeof saved==='string'&&saved.startsWith('https://'))return saved;
  if(category==='kit')return asset('Mini_Pasteis');
  const key=String(name||'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
  if(category==='bebidas'){const drinks={'coca-cola lata':'coca-cola-tradicional.jfif','coca-cola zero lata':'coca-cola-zero.jpg','guarana antarctica lata':'guarana-antartica.webp'};return drinks[key]?'images/produtos/'+drinks[key]:'';}
  if(!['kids','tradicional'].includes(category))return '';
  return key==='carne com queijo'?'images/produtos/carne-com-queijo.png':files[key]?asset(files[key]):'';
 }
 const api={forProduct,miniSavory:asset('Mini_Pasteis'),miniSweet:asset('Mini_Pasteis_Doce')};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.BillPhotos=api;
})(globalThis);
