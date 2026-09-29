import {communityAudio,communityDb} from '@/lib/community-db';
type Context={params:Promise<{id:string}>};
async function respond(request:Request,context:Context,headOnly=false){
 try{
 const {id}=await context.params;
 if(!/^[0-9a-f-]{36}$/i.test(id))return new Response(null,{status:404});
 const row=await communityDb().prepare('SELECT audio_key,audio_type,audio_size FROM contributions WHERE id = ? AND audio_key IS NOT NULL').bind(id).first<{audio_key:string;audio_type:string;audio_size:number}>();
 if(!row)return new Response(null,{status:404});
 const bucket=communityAudio();const meta=await bucket.head(row.audio_key);if(!meta)return new Response(null,{status:404});
 const headers=new Headers({'Content-Type':row.audio_type,'Content-Length':String(meta.size),'Accept-Ranges':'bytes','Cache-Control':'public, max-age=3600','ETag':meta.httpEtag,'X-Content-Type-Options':'nosniff'});
 if(request.headers.get('if-none-match')===meta.httpEtag)return new Response(null,{status:304,headers});
 let range:{offset:number;length:number}|undefined;const requested=request.headers.get('range');
 if(requested&&(!request.headers.get('if-range')||request.headers.get('if-range')===meta.httpEtag)){
 const match=/^bytes=(\d*)-(\d*)$/.exec(requested);
 if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${meta.size}`}});
 const start=match[1]?Number(match[1]):Math.max(0,meta.size-Number(match[2]));
 const end=match[1]?(match[2]?Math.min(Number(match[2]),meta.size-1):meta.size-1):meta.size-1;
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=meta.size||end<start)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${meta.size}`}});
 range={offset:start,length:end-start+1};headers.set('Content-Range',`bytes ${start}-${end}/${meta.size}`);headers.set('Content-Length',String(range.length));
 }
 if(headOnly)return new Response(null,{status:range?206:200,headers});
 const object=await bucket.get(row.audio_key,range?{range}:undefined);if(!object)return new Response(null,{status:404});
 return new Response(object.body,{status:range?206:200,headers});
 }catch(error){console.error('Audio playback failed',error);return Response.json({error:'Audio is temporarily unavailable.'},{status:503})}
}
export const GET=(request:Request,context:Context)=>respond(request,context);
export const HEAD=(request:Request,context:Context)=>respond(request,context,true);
