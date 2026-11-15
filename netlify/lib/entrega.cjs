// Taxas por raio. Nenhum valor enviado pelo navegador é usado no cálculo.
const ORIGEM='Rua Otílio Amadori, 21, Parzianello, Pato Branco - PR, Brasil';
const FAIXAS=[[1,10],[2.5,11],[3,13],[4.1,14],[5.1,15],[6.1,16],[6.2,17],[7.3,18],[8.4,19],[10,20]];
const normal=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function distancia(a,b){const rad=x=>x*Math.PI/180,dlat=rad(b.lat-a.lat),dlng=rad(b.lng-a.lng);const h=Math.sin(dlat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dlng/2)**2;return 6371.0088*2*Math.asin(Math.sqrt(Math.min(1,h)));}
function taxa(km){if(!Number.isFinite(km)||km<0)throw Error('Distância inválida');return FAIXAS.find(([max])=>km<=max)?.[1]??null;}
async function localizar(endereco,key,request=fetch){
 const url=new URL('https://maps.googleapis.com/maps/api/geocode/json');url.search=new URLSearchParams({address:endereco,components:'country:BR',language:'pt-BR',key}).toString();
 const res=await request(url,{signal:AbortSignal.timeout(7000)});if(!res.ok)throw Error('Mapa indisponível');const b=await res.json();
 if(b.status!=='OK'||b.results?.length!==1)throw Error('Endereço não identificado com segurança');const r=b.results[0];
 if(r.partial_match||!['ROOFTOP','RANGE_INTERPOLATED'].includes(r.geometry?.location_type))throw Error('Endereço impreciso');
 const comp=type=>r.address_components?.find(c=>c.types.includes(type));
 if(!comp('street_number')||normal(comp('administrative_area_level_2')?.long_name)!=='pato branco'||comp('administrative_area_level_1')?.short_name!=='PR')throw Error('Confira número, cidade e estado');
 const point=r.geometry.location;if(!Number.isFinite(point?.lat)||!Number.isFinite(point?.lng))throw Error('Localização inválida');return point;
}
async function calcular(endereco,key,request=fetch){
 if(!key)return null;
 // Consulta a origem pelo endereço completo; não usa o centro do link de busca.
 try{const origem=await localizar(ORIGEM,key,request),destino=await localizar(endereco,key,request);const km=distancia(origem,destino);return {km,taxa:taxa(km)};}catch{return null;}
}
module.exports={ORIGEM,FAIXAS,distancia,taxa,localizar,calcular};
