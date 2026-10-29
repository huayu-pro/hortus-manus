import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const OUT='/home/huayu/Agent工作区/DSHarness/1/hortus-manus/research/assets';
const UA='HortusManusResearch/1.0 (local botanical research)';
const DL='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const Q=[
 ['camellia-japonica','Camellia japonica Redoute plate'],['rose-redoute','Rosa Redoute botanical plate'],
 ['cherry-blossom','Prunus blossom botanical illustration'],['poppy-plate','Papaver rhoeas botanical plate'],
 ['orchid-plate','Orchis botanical illustration plate'],['lotus-plate','Nelumbo botanical illustration'],
 ['herbarium-sheet','herbarium specimen sheet plant digitized'],['ivy-plate','Hedera helix botanical plate'],
 ['moss-plate','moss botanical illustration Musci'],['pressed-flower','pressed flowers herbarium sheet'],
 ['peony-plate','Paeonia botanical illustration Redoute'],['dandelion-plate','Taraxacum plate illustration'],
 ['fern-frond2','fern frond photograph'],['moss-close2','moss close up green'],['seed-head','dandelion seed head']
];
const OK=/(public domain|cc0|cc by|cc-by|pd-|no restrictions)/i;
async function api(p){const u='https://commons.wikimedia.org/w/api.php?'+new URLSearchParams(p);const r=await fetch(u,{headers:{'user-agent':UA,accept:'application/json'}});if(!r.ok)throw new Error('api '+r.status);return r.json();}
const rec=[];
for(const [slug,q] of Q){
  const dest=path.join(OUT,'raw',slug+'.jpg');
  if(fs.existsSync(dest)&&fs.statSync(dest).size>60000){console.log(slug,'exists');continue;}
  process.stdout.write(slug+' ... ');
  try{
    const j=await api({action:'query',format:'json',generator:'search',gsrsearch:q,gsrnamespace:'6',gsrlimit:'10',prop:'imageinfo',iiprop:'url|extmetadata|size'});
    const pages=j?.query?.pages?Object.values(j.query.pages).sort((a,b)=>(a.index||0)-(b.index||0)):[];
    let hit=null;
    for(const p of pages){
      const ii=(p.imageinfo||[])[0]; if(!ii) continue;
      const m=ii.extmetadata||{}; const lic=(m.LicenseShortName?.value||'').trim();
      if(!OK.test(lic)) continue; if(!/\.(jpg|jpeg|png)$/i.test(p.title)) continue;
      if(ii.width<1200) continue;
      hit={p,ii,m,lic}; break;
    }
    if(!hit){console.log('no hit');continue;}
    const {p,ii,m,lic}=hit;
    try{execFileSync('curl',['-s','--max-time','120','--proxy','http://127.0.0.1:7897','-A',DL,'-e','https://commons.wikimedia.org/','-o',dest,ii.url]);}catch(e){}
    const size=fs.existsSync(dest)?fs.statSync(dest).size:0;
    if(size<60000){console.log('small',size);continue;}
    rec.push({slug,title:p.title.replace(/^File:/,''),file:'raw/'+slug+'.jpg',bytes:size,width:ii.width,height:ii.height,
      license:lic,licenseUrl:m.LicenseUrl?.value||null,author:(m.Artist?.value||'').replace(/<[^>]*>/g,'').trim().slice(0,120)||'Unknown',
      credit:(m.Credit?.value||'').replace(/<[^>]*>/g,'').trim().slice(0,160),
      sourcePage:'https://commons.wikimedia.org/wiki/'+encodeURIComponent(p.title),directUrl:ii.url,descriptionUrl:ii.descriptionurl,
      usage:(m.UsageTerms?.value||'').replace(/<[^>]*>/g,'').slice(0,120),fetchedAt:new Date().toISOString()});
    console.log('ok',lic,ii.width+'x'+ii.height,(size/1024|0)+'KB');
  }catch(e){console.log('FAIL',String(e.message||e).slice(0,80));}
  await new Promise(r=>setTimeout(r,1800));
}
const f=path.join(OUT,'assets-extra.json'); fs.writeFileSync(f,JSON.stringify({fetchedAt:new Date().toISOString(),count:rec.length,assets:rec},null,2));
console.log('EXTRA',rec.length);
