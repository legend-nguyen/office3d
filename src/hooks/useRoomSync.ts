import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import type { OfficeEngine } from '../engine/OfficeEngine';
import { RoomChannel } from '../net/RoomChannel';
import { listStations, removeStation, saveStation } from '../net/stationsApi';
import type { ServerMessage } from '../../shared/protocol';
import { useOfficeStore } from '../store/useOfficeStore';

const normalizeRoom = (raw: string | null) => raw && /^[a-z0-9_-]{1,32}$/.test(raw) ? raw : 'sansa-hub';
export function useRoomSync(engine: MutableRefObject<OfficeEngine | null>) {
  const clientRef = useRef<RoomChannel | null>(null);
  useEffect(() => {
    let frame = 0, disposed = false;
    const room = normalizeRoom(new URLSearchParams(location.search).get('room'));
    useOfficeStore.getState().set('roomId', room);
    const boot = () => {
      if (disposed) return;
      if (!engine.current) { frame = requestAnimationFrame(boot); return; }
      const profile = () => { const p = useOfficeStore.getState().player; return {name:p.name.slice(0,24),color:`#${p.color.toString(16).padStart(6,'0').slice(-6)}`}; };
      const client = new RoomChannel(room, handle, status => {
        const s=useOfficeStore.getState();s.set('connectionStatus',status);
        if(status==='reconnecting')s.showToast('Mất kết nối, đang thử lại...');
      }, profile);
      clientRef.current=client;
      void client.connect();
      async function handle(msg: ServerMessage) {
        const s=useOfficeStore.getState(), e=engine.current;
        if(!e)return;
        if(msg.t==='init') {
          try {
            const rows=await listStations(room);if(disposed)return;
            const stations=rows.map(r=>({...r,ownerId:r.owner_id??''}));
            e.applyServerStations(stations);e.setRoomSync(client.clientId,m=>client.send(m));
            s.set('sendRoomMessage',m=>client.send(m));e.syncRemotePlayers(msg.players);
            s.set('onlineCount',msg.players.length+1);s.set('remotePlayers',msg.players);
            window.dispatchEvent(new Event('sansa-room-initialized'));
          } catch {s.showToast('Không thể tải bố cục phòng từ Supabase.');}
          return;
        }
        if(msg.t==='player:joined'){const ps=s.remotePlayers.filter(p=>p.clientId!==msg.player.clientId).concat(msg.player);s.set('remotePlayers',ps);e.syncRemotePlayers(ps);s.set('onlineCount',ps.length+1);return;}
        if(msg.t==='player:left'){const ps=s.remotePlayers.filter(p=>p.clientId!==msg.clientId);s.set('remotePlayers',ps);e.syncRemotePlayers(ps);s.set('onlineCount',ps.length+1);return;}
        if(msg.t==='presence'){const ps=s.remotePlayers.map(p=>p.clientId===msg.clientId?{...p,...msg}:p);s.set('remotePlayers',ps);e.syncRemotePlayers(ps);return;}
        if(msg.t==='station:upserted'){e.stationsManager().applyRemote(msg.station);e.setStationOwner(msg.station.gx,msg.station.gz,msg.station.ownerId);s.set('placedStationsCount',e.stationsManager().placedStations.size);return;}
        if(msg.t==='station:removed'){e.stationsManager().removeRemote(msg.gx,msg.gz);e.setStationOwner(msg.gx,msg.gz,'');s.set('placedStationsCount',e.stationsManager().placedStations.size);return;}
        if(msg.t==='error'){s.showToast(msg.message);if(msg.code==='CELL_TAKEN'||msg.code==='NOT_OWNER')e.rollbackLastStation();return;}
        if(msg.t==='rtc'){window.dispatchEvent(new CustomEvent('sansa-rtc',{detail:msg}));return;}
        if(msg.t==='emote'||msg.t==='chat'){const incoming={from:msg.from,toClientId:msg.toClientId,kind:msg.t==='chat'?'chat' as const:msg.kind,text:msg.t==='chat'?msg.text:msg.kind==='wave'?'👋 Vẫy tay chào bạn':'🔥 Cổ vũ tiến độ của bạn'};s.set('incomingMessages',[...s.incomingMessages,incoming].slice(-20));window.dispatchEvent(new CustomEvent('sansa-user-message',{detail:incoming}));}
      }
      const onStationChanged=async()=>{
        const current=useOfficeStore.getState(), active=engine.current;
        if(!active)return;
        try {
          const rows=await listStations(room), present=new Set((active.getRoomStations().map(x=>`${x.gx},${x.gz}`)));
          for(const row of rows)if(!present.has(`${row.gx},${row.gz}`))await removeStation(room,row.gx,row.gz);
          for(const station of active.getRoomStations())await saveStation(room,station);
        } catch {current.showToast('Không thể lưu trạm. Hãy đăng nhập Supabase trước.');}
      };
      window.addEventListener('sansa-stations-changed',onStationChanged);
      return () => window.removeEventListener('sansa-stations-changed',onStationChanged);
    };
    const stopBoot=boot();
    return()=>{disposed=true;cancelAnimationFrame(frame);if(typeof stopBoot==='function')stopBoot();clientRef.current?.close();clientRef.current=null;engine.current?.setRoomSync('',()=>{});useOfficeStore.getState().set('sendRoomMessage',()=>{});useOfficeStore.getState().set('connectionStatus','offline');};
  },[engine]);
  return clientRef;
}
