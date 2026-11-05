import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import type { ClientMessage, PlayerPresence, ServerMessage } from '../../shared/protocol';
import type { DbStation } from './stationsApi';
import { listStations } from './stationsApi';

export class RoomChannel {
  readonly clientId=crypto.randomUUID(); private channel:RealtimeChannel|null=null; private initialized=false; private closed=false; private retryTimer:ReturnType<typeof setTimeout>|null=null; private retry=1000; private lastStationEventAt=0;
  constructor(readonly room:string,private message:(m:ServerMessage)=>void,private status:(s:'connecting'|'online'|'reconnecting'|'offline')=>void,private profile:()=>{name:string;color:string}){}
  async connect(){
    if(!supabase){this.status('offline');this.message({t:'error',code:'CONFIG',message:'Thiếu cấu hình Supabase.'});return;}
    this.closed=false;this.status('connecting');
    const channel=this.channel=supabase.channel(`room:${this.room}`,{config:{presence:{key:this.clientId},broadcast:{self:false}}});
    channel.on('broadcast',{event:'msg'},({payload})=>{const m=payload as Record<string,any>;if(m.t==='rtc'&&m.to===this.clientId)this.message({t:'rtc',from:m.from,session:m.session,kind:m.kind,payload:m.payload});else if((m.t==='chat'||m.t==='emote')&&m.toClientId===this.clientId)this.message(m as ServerMessage);else if(m.t==='presence'&&m.clientId!==this.clientId)this.message(m as ServerMessage);});
    channel.on('postgres_changes',{event:'*',schema:'public',table:'stations'},payload=>{const row=(payload.new&&Object.keys(payload.new).length?payload.new:payload.old) as Record<string,any>;if(!row||row.room_id!==this.room)return;this.lastStationEventAt=Date.now();if(payload.eventType==='DELETE')this.message({t:'station:removed',gx:Number(row.gx),gz:Number(row.gz),byClientId:String(row.owner_id??'')});else this.message({t:'station:upserted',station:this.toStation(row)});});
    channel.on('presence',{event:'sync'},()=>{const ps=Object.values(channel.presenceState<PlayerPresence>()).flat().filter(p=>p.clientId!==this.clientId);if(!this.initialized){this.initialized=true;void listStations(this.room).then(rows=>this.message({t:'init',you:{clientId:this.clientId},stations:rows.map(r=>({...r,ownerId:r.owner_id??''})),players:ps})).catch(()=>this.message({t:'error',code:'LOAD_FAILED',message:'Không thể tải bố cục phòng từ Supabase.'}));}else this.message({t:'presence:sync',players:ps});})
      .on('presence',{event:'join'},({newPresences})=>newPresences.forEach((p:any)=>{if(p.clientId!==this.clientId)this.message({t:'player:joined',player:p});}))
      .on('presence',{event:'leave'},({leftPresences})=>leftPresences.forEach((p:any)=>{if(p.clientId!==this.clientId)this.message({t:'player:left',clientId:p.clientId});}));
    channel.subscribe(async (s, error)=>{
      // removeChannel() emits CLOSED during cleanup; ignore callbacks from closed/stale channels.
      if(this.closed||this.channel!==channel)return;
      if(s==='SUBSCRIBED'){
        this.retry=1000;this.status('online');
        await channel.track({clientId:this.clientId,...this.profile(),x:0,z:2.5,rotY:0,state:'idle',isSharing:false,seatKey:null});
        if(this.initialized)void this.refreshStations();
      }else if(s==='CHANNEL_ERROR'||s==='TIMED_OUT'||s==='CLOSED'){
        this.status('reconnecting');
        const detail=error instanceof Error?error.message:error?JSON.stringify(error):'Không có chi tiết từ Supabase.';
        console.error(`[Supabase Realtime] channel ${channel.topic}: ${s}`,error??'');
        this.message({t:'error',code:`REALTIME_${s}`,message:`Realtime ${s}: ${detail}`});
        this.scheduleRetry(channel);
      }
    });
  }
  private async refreshStations(){const since=this.lastStationEventAt;try{const rows=await listStations(this.room);if(this.closed)return;const stations=rows.map(r=>({...r,ownerId:r.owner_id??''}));if(Date.now()-since>1000)this.message({t:'init',you:{clientId:this.clientId},stations,players:Object.values(this.channel?.presenceState<PlayerPresence>()??{}).flat().filter(p=>p.clientId!==this.clientId)});}catch{/* retry on next subscription */}}
  private scheduleRetry(failed:RealtimeChannel){if(this.closed||this.retryTimer)return;const delay=this.retry*(.8+Math.random()*.4);this.retry=Math.min(15000,this.retry*2);this.retryTimer=setTimeout(()=>{this.retryTimer=null;if(this.closed||this.channel!==failed)return;if(supabase)void supabase.removeChannel(failed);this.channel=null;void this.connect();},delay);}
  private toStation(row:Record<string,any>):DbStation&{ownerId:string}{return{id:row.id,room_id:row.room_id,gx:Number(row.gx),gz:Number(row.gz),rotY:Number(row.rot)*Math.PI/2,hasDesk:row.has_desk,hasChair:row.has_chair,hasPC:row.has_pc,hasPartition:row.has_partition,hasPlant:row.has_plant,ownerName:row.owner_name,owner_id:row.owner_id,rot:Number(row.rot),ownerId:row.owner_id??''};}
  send(m:ClientMessage){if(!this.channel)return;if(m.t==='presence'){void this.channel.track({clientId:this.clientId,...this.profile(),...m});void this.channel.send({type:'broadcast',event:'msg',payload:{clientId:this.clientId,...m}});return;}void this.channel.send({type:'broadcast',event:'msg',payload:{...m,from:this.clientId}});}
  close(){this.closed=true;if(this.retryTimer)clearTimeout(this.retryTimer);this.retryTimer=null;if(this.channel&&supabase)void supabase.removeChannel(this.channel);this.channel=null;this.status('offline');}
}
