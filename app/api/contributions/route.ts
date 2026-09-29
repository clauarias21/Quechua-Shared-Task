import {communityDb,communityAudio} from '@/lib/community-db';
import {sky} from '@/lib/sky';
import {audioContentType,MAX_AUDIO_BYTES} from '@/lib/audio';
const fail=(error:string,status=400,code?:string)=>Response.json({error,code},{status});

export async function GET(request:Request){
 try{const offset=Math.max(0,Math.min(100000,Number(new URL(request.url).searchParams.get('offset'))||0));
 const rows=await communityDb().prepare('SELECT id,kind,name,region,language,astro,title,body,attribution,created_at,(audio_key IS NOT NULL) AS has_audio FROM contributions ORDER BY created_at DESC,id DESC LIMIT 21 OFFSET ?').bind(Math.floor(offset)).all();
 return Response.json({items:rows.results.slice(0,20),more:rows.results.length>20},{headers:{'Cache-Control':'no-store'}});
 }catch(error){console.error('Community read failed',error);return fail('Stories are temporarily unavailable. Please try again.',503)}
}

// Enforce a bound while reading, including requests with no Content-Length header.
async function limitedBody(request:Request,limit:number){
 if(Number(request.headers.get('content-length'))>limit)throw new RangeError('Body too large');
 const reader=request.body?.getReader();if(!reader)return new Uint8Array();
 const chunks:Uint8Array[]=[];let length=0;
 while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>limit){await reader.cancel();throw new RangeError('Body too large')}chunks.push(value)}
 const body=new Uint8Array(length);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length}return body;
}
export async function POST(request:Request){
 let uploadedKey:string|null=null;
 try{
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return fail('Please submit from this website.',403);
 const multipart=(request.headers.get('content-type')||'').startsWith('multipart/form-data');
 let bytes:Uint8Array<ArrayBuffer>;try{bytes=await limitedBody(request,multipart?MAX_AUDIO_BYTES+65536:16000)}catch(error){if(error instanceof RangeError)return fail('Maximum audio size is 10 MB.',413,'audio');throw error}
 let v:Record<string,unknown>;let audio:File|null=null;
 try{
 if(multipart){const form=await new Response(bytes,{headers:{'Content-Type':request.headers.get('content-type')!}}).formData();
 v=Object.fromEntries(form);v.consent=form.get('consent')==='true';v.audioConsent=form.get('audioConsent')==='true';
 const part=form.get('audio');if(part!==null&&typeof part!=='string'&&part.size>0)audio=part;
 }else{v=JSON.parse(new TextDecoder().decode(bytes))}
 }catch{return fail('Please check the form and try again.')}
 if(!v||typeof v!=='object'||v.website||v.consent!==true)return fail('Please confirm permission to publish your contribution.');
 const fields={name:[1,80],region:[1,120],language:[1,100],title:[4,160],body:[audio?10:30,4000],attribution:[3,500]};
 for(const [k,[min,max]] of Object.entries(fields)){const value=v[k];if(typeof value!=='string'||value.trim().length<min||value.trim().length>max)return fail(`Please check ${k}: use ${min}–${max} characters.`);v[k]=value.trim()}
 if(!['story','recommendation','name'].includes(String(v.kind))||!['general',...sky.map(s=>s.id)].includes(String(v.astro))||typeof v.id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.id))return fail('Choose a valid contribution type and sky object.');
 let audioType:string|null=null;let audioBytes:ArrayBuffer|null=null;
 if(audio){
 if(v.audioConsent!==true)return fail('Confirm permission from the people recorded.',400,'audio_consent');
 if(audio.size>MAX_AUDIO_BYTES)return fail('Maximum audio size is 10 MB.',413,'audio');
 audioBytes=await audio.arrayBuffer();audioType=audioContentType(new Uint8Array(audioBytes));
 if(!audioType)return fail('Unsupported audio format.',415,'audio');
 }
 const db=communityDb();
 const existing=await db.prepare('SELECT id FROM contributions WHERE id = ?').bind(v.id).first();if(existing)return Response.json({id:v.id,saved:true});
 const day=new Date().toISOString().slice(0,10);
 const key=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(day+':'+(request.headers.get('cf-connecting-ip')||'local'))))).map(x=>x.toString(16).padStart(2,'0')).join('');
 const count=await db.prepare('SELECT COUNT(*) AS count FROM contributions WHERE rate_key = ?').bind(key).first<{count:number}>();
 if((count?.count||0)>=10)return fail('The daily contribution limit for this connection has been reached.',429);
 if(audioBytes&&audioType){uploadedKey=`contributions/${v.id}/${crypto.randomUUID()}`;await communityAudio().put(uploadedKey,audioBytes,{httpMetadata:{contentType:audioType}})}
 try{
 const result=await db.prepare('INSERT INTO contributions (id,kind,name,region,language,astro,title,body,attribution,rate_key,audio_key,audio_type,audio_size) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM contributions WHERE rate_key = ?) < 10').bind(v.id,v.kind,v.name,v.region,v.language,v.astro,v.title,v.body,v.attribution,key,uploadedKey,audioType,audio?.size??null,key).run();
 if(!result.meta.changes){if(uploadedKey){await communityAudio().delete(uploadedKey);uploadedKey=null}return fail('The daily contribution limit for this connection has been reached.',429)}
 }catch(error){
 // A simultaneous retry may have inserted the same contribution already.
 const saved=await db.prepare('SELECT id FROM contributions WHERE id = ?').bind(v.id).first();
 if(saved){if(uploadedKey){await communityAudio().delete(uploadedKey);uploadedKey=null}return Response.json({id:v.id,saved:true})}throw error;
 }
 uploadedKey=null;return Response.json({id:v.id,saved:true},{status:201});
 }catch(error){
 if(uploadedKey){try{await communityAudio().delete(uploadedKey)}catch(cleanupError){console.error('Audio cleanup failed',cleanupError)}}
 console.error('Community save failed',error);return fail('Could not save. Your contribution is still in the form; please retry.',503);
 }
}
