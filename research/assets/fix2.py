import json, subprocess, os, urllib.parse, re, time
OUT='.'
UA='HortusManusResearch/1.0 (local botanical research)'
DL='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
def api(q):
    qs=urllib.parse.urlencode({'action':'query','format':'json','generator':'search','gsrsearch':q,'gsrnamespace':'6','gsrlimit':'10','prop':'imageinfo','iiprop':'url|extmetadata|size','iiurlwidth':'1600'})
    r=subprocess.run(['curl','-s','--max-time','40','-A',UA,'https://commons.wikimedia.org/w/api.php?'+qs],capture_output=True,text=True)
    return json.loads(r.stdout)
def clean(s): return re.sub(r'<[^>]*>','',s or '').replace('&amp;','&').replace('&#039;',"'").strip()[:150]
OK=['public domain','cc0','cc by','cc-by','pd-','no restrictions']
jobs=[('cherry-blossom','Prunus serrulata cherry blossom flowers photograph'),
      ('rose-redoute','Rosa gallica botanical illustration plate'),
      ('pressed-flower','pressed herbarium specimen flowers sheet'),
      ('fern-frond2','fern fronds green photograph'),
      ('moss-close2','moss sporophyte close up photograph'),
      ('seed-head','dandelion clock seed head photograph'),
      ('wildflower-meadow','meadow wildflowers summer photograph')]
rec=[]
for slug,q in jobs:
    dest=os.path.join(OUT,'raw',slug+'.jpg')
    if os.path.exists(dest) and os.path.getsize(dest)>60000: continue
    print(slug,'...',flush=True)
    try:
        j=api(q)
        pages=sorted(j.get('query',{}).get('pages',{}).values(), key=lambda p:p.get('index',0))
        hit=None
        for p in pages:
            ii=(p.get('imageinfo') or [{}])[0]
            if not ii: continue
            m=ii.get('extmetadata',{}); lic=(m.get('LicenseShortName',{}).get('value') or '').strip()
            if not any(k in lic.lower() for k in OK): continue
            if not p['title'].lower().endswith(('.jpg','.jpeg','.png')): continue
            if ii.get('width',0)<1200: continue
            hit=(p,ii,m,lic); break
        if not hit: print('no hit'); continue
        p,ii,m,lic=hit
        url=ii.get('thumburl') or ii['url']
        subprocess.run(['curl','-s','--max-time','90','-A',DL,'-e','https://commons.wikimedia.org/','-o',dest,url])
        size=os.path.getsize(dest) if os.path.exists(dest) else 0
        if size<60000: print('small',size); os.remove(dest); continue
        rec.append({'slug':slug,'kind':slug.split('-')[0],'title':p['title'].replace('File:',''),'file':'raw/'+slug+'.jpg',
          'bytes':size,'width':ii.get('thumbwidth',ii['width']),'height':ii.get('thumbheight',ii['height']),
          'originalWidth':ii['width'],'originalHeight':ii['height'],'license':lic,
          'licenseUrl':m.get('LicenseUrl',{}).get('value'),'author':clean(m.get('Artist',{}).get('value')) or 'Unknown',
          'credit':clean(m.get('Credit',{}).get('value')),
          'sourcePage':'https://commons.wikimedia.org/wiki/'+urllib.parse.quote(p['title']),
          'directUrl':url,'descriptionUrl':ii.get('descriptionurl'),
          'usage':clean(m.get('UsageTerms',{}).get('value')),
          'fetchedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())})
        print('ok',lic,size//1024,'KB',p['title'][:50])
    except Exception as e: print('FAIL',str(e)[:70])
    time.sleep(2)
json.dump({'fetchedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'count':len(rec),'assets':rec},open('assets-more.json','w'),indent=2,ensure_ascii=False)
print('MORE',len(rec))
