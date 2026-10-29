import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const OUT='/home/huayu/Agent工作区/DSHarness/1/hortus-manus/research/assets';
const UA='HortusManusResearch/1.0 (local botanical research; https://commons.wikimedia.org)';
const DL='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const Q=[
 ['camellia-japonica','Camellia japonica botanical illustration'],
 ['rose-redoute','Rosa botanical illustration Redoute'],
 ['cherry-blossom','Prunus serrulata flowers photograph'],
 ['poppy-plate','Papaver botanical illustration plate'],
 ['orchid-plate','Orchid botanical illustration plate'],
 ['lotus-plate','Nelumbo nucifera botanical plate'],
 ['ivy-plate','Hedera helix botanical illustration'],
 ['moss-plate','moss Musci botanical illustration'],
 ['pressed-flower','pressed flower herbarium specimen'],
 ['peony-plate','Paeonia botanical illustration'],
 ['dandelion-plate','Taraxacum officinale illustration'],
 ['seed-dispersal','dandelion seeds wind dispersal photograph'],
 ['fern-frond2','fern frond photograph'],
 ['moss-close2','moss close up photograph green'],
 ['seed-head','dandelion seed head photograph'],
 ['herbarium-sheet2','herbarium sheet specimen plant scan'],
 ['botanical-plate-x','botanical illustration plate flowers 19th century'],
 ['wildflower-meadow','wildflower meadow photograph summer'],
];
const OK=/(public domain|cc0|cc by|cc-by|pd-|no restrictions)/i;
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
async function api(p,tries=4){
  for(let i=0;i<tries;i++){
    try{
      const u='https://commons.wikimedia.org/w/api.php?'+new URLSearchParams(p);
      const r=await fetch(u,{headers:{'user-agent':UA,accept:'application/json'}});
      if(r.status===403||r.status===429){await sleep(4000*(i+1));continue;}
      if(!r.ok)throw new Error('api '+r.status);
      return await r.json();
    }catch(e){await sleep(3000*(i+1));}
  }
  throw new Error('api failed');
}
function curl(url,dest,tries=3){
  for(let i=0;i<tries;i++){
    try{execFileSync('curl',['-s','--max-time','90','-A',DL,'-e','https://commons.wikimedia.org/','-o',dest,url]);}catch(e){}
    if(fs.existsSync(dest)&&fs.statSync(dest).size>60000) return fs.statSync(dest).size;
    sleep(1500);
  }
  return fs.existsSync(dest)?fs.statSync(dest).size:0;
}
const rec=[];
for(const [slug,q] of Q){
  const dest=path.join(OUT,'raw',slug+'.jpg');
  if(fs.existsSync(dest)&&fs.statSync(dest).size>60000){continue;}
  process.stdout.write(slug+' ... ');
  try{
    const j=await api({action:'query',format:'json',generator:'search',gsrsearch:q,gsrnamespace:'6',gsrlimit:'10',prop:'imageinfo',iiprop:'url|extmetadata|size',iiurlwidth:'1600'});
    const pages=j?.query?.pages?Object.values(j.query.pages).sort((a,b)=>(a.index||0)-(b.index||0)):[];
    let hit=null;
    for(const p of pages){
      const ii=(p.imageinfo||[])[0]; if(!ii) continue;
      const m=ii.extmetadata||{}; const lic=(m.LicenseShortName?.value||'').trim();
      if(!OK.test(lic)) continue;
      if(!/\.(jpg|jpeg|png)$/i.test(p.title)) continue;
      if(ii.width<1200) continue;
      hit={p,ii,m,lic}; break;
    }
    if(!hit){console.log('no hit');continue;}
    const {p,ii,m,lic}=hit;
    const url=ii.thumburl||ii.url;
    let size=curl(url,dest);
    if(size<60000&&ii.thumburl) size=curl(ii.thumburl,dest);
    if(size<60000){console.log('small',size);continue;}
    rec.push({slug,kind:slug.split('-')[0],title:p.title.replace(/^File:/,''),file:'raw/'+slug+'.jpg',bytes:size,
      width:ii.thumbwidth||ii.width,height:ii.thumbheight||ii.height,originalWidth:ii.width,originalHeight:ii.height,
      license:lic,licenseUrl:m.LicenseUrl?.value||null,
      author:(m.Artist?.value||'').replace(/<[^>]*>/g,'').replace(/&[a-z]+;/g,' ').trim().slice(0,150)||'Unknown',
      credit:(m.Credit?.value||'').replace(/<[^>]*>/g,'').trim().slice(0,160),
      sourcePage:'https://commons.wikimedia.org/wiki/'+encodeURIComponent(p.title),
      directUrl:url,descriptionUrl:ii.descriptionurl,
      usage:(m.UsageTerms?.value||'').replace(/<[^>]*>/g,'').slice(0,120),fetchedAt:new Date().toISOString()});
    console.log('ok',lic,(size/1024|0)+'KB');
  }catch(e){console.log('FAIL',String(e.message||e).slice(0,70));}
  await sleep(3500);
}
const f=path.join(OUT,'assets-final.json'); fs.writeFileSync(f,JSON.stringify({fetchedAt:new Date().toISOString(),count:rec.length,assets:rec},null,2));
console.log('FINAL',rec.length);
