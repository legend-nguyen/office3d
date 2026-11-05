import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import type { OfficeEngine } from '../engine/OfficeEngine';
import { RoomChannel } from '../net/RoomChannel';
import { saveStation, removeStation } from '../net/stationsApi';
import type { ServerMessage } from '../../shared/protocol';
import { useOfficeStore } from '../store/useOfficeStore';

const normalizeRoom = (raw: string | null) => raw && /^[a-z0-9_-]{1,32}$/.test(raw) ? raw : 'sansa-hub';
export function useRoomSync(engine: MutableRefObject<OfficeEngine | null>, engineReady: number) {
  const clientRef = useRef<RoomChannel | null>(null);
  useEffect(() => {
    let disposed = false;
    const room = normalizeRoom(new URLSearchParams(location.search).get('room'));
    useOfficeStore.getState().set('roomId', room);
    const boot = () => {
      if (disposed || !engine.current) return;
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
          e.applyServerStations(msg.stations);e.setRoomSync(client.clientId,m=>client.send(m));
          s.set('sendRoomMessage',m=>client.send(m));e.syncRemotePlayers(msg.players);
          s.set('onlineCount',msg.players.length+1);s.set('remotePlayers',msg.players);
          window.dispatchEvent(new Event('sansa-room-initialized'));return;
        }
        if(msg.t==='presence:sync'){e.syncRemotePlayers(msg.players);s.set('remotePlayers',msg.players);s.set('onlineCount',msg.players.length+1);return;}
        if(msg.t==='player:joined'){const ps=s.remotePlayers.filter(p=>p.clientId!==msg.player.clientId).concat(msg.player);s.set('remotePlayers',ps);e.syncRemotePlayers(ps);s.set('onlineCount',ps.length+1);return;}
        if(msg.t==='player:left'){const ps=s.remotePlayers.filter(p=>p.clientId!==msg.clientId);s.set('remotePlayers',ps);e.syncRemotePlayers(ps);s.set('onlineCount',ps.length+1);return;}
        if(msg.t==='presence'){const old=s.remotePlayers.find(p=>p.clientId===msg.clientId);const player={...old,...msg,name:old?.name??'Khách',color:old?.color??'#06b6d4',clientId:msg.clientId};const ps=[...s.remotePlayers.filter(p=>p.clientId!==msg.clientId),player];s.set('remotePlayers',ps);e.syncRemotePlayers(ps);return;}
        if(msg.t==='station:upserted'){e.stationsManager().applyRemote(msg.station);e.setStationOwner(msg.station.gx,msg.station.gz,msg.station.ownerId);s.set('placedStationsCount',e.stationsManager().placedStations.size);return;}
        if(msg.t==='station:removed'){e.stationsManager().removeRemote(msg.gx,msg.gz);e.setStationOwner(msg.gx,msg.gz,'');s.set('placedStationsCount',e.stationsManager().placedStations.size);return;}
        if(msg.t==='error'){s.showToast(msg.message);if(msg.code==='CELL_TAKEN'||msg.code==='NOT_OWNER')e.rollbackLastStation();return;}
        if(msg.t==='rtc'){window.dispatchEvent(new CustomEvent('sansa-rtc',{detail:msg}));return;}
        if(msg.t==='emote'||msg.t==='chat'){const incoming={from:msg.from,toClientId:msg.toClientId,kind:msg.t==='chat'?'chat' as const:msg.kind,text:msg.t==='chat'?msg.text:msg.kind==='wave'?'👋 Vẫy tay chào bạn':'🔥 Cổ vũ tiến độ của bạn'};s.set('incomingMessages',[...s.incomingMessages,incoming].slice(-20));window.dispatchEvent(new CustomEvent('sansa-user-message',{detail:incoming}));}
      }
      const onStationUpsert=async(event:Event)=>{
        const station=(event as CustomEvent<{station:import('../../shared/layout').StationData}>).detail?.station;
        if(!station)return;
        try{await saveStation(room,station);}catch(error){useOfficeStore.getState().showToast(`Không thể lưu trạm: ${error instanceof Error?error.message:'Lỗi Supabase không xác định'}`);}
      };
      const onStationRemoved=async(event:Event)=>{
        const detail=(event as CustomEvent<{gx:number;gz:number}>).detail;
        if(!detail)return;
        try{await removeStation(room,detail.gx,detail.gz);}catch(error){useOfficeStore.getState().showToast(`Không thể xóa trạm: ${error instanceof Error?error.message:'Lỗi Supabase không xác định'}`);}
      };
      window.addEventListener('sansa-station-upsert',onStationUpsert);
      window.addEventListener('sansa-station-removed',onStationRemoved);
      return () => {window.removeEventListener('sansa-station-upsert',onStationUpsert);window.removeEventListener('sansa-station-removed',onStationRemoved);};
    };
    const cleanupBoot = boot();
    return()=>{disposed=true;cleanupBoot?.();clientRef.current?.close();clientRef.current=null;engine.current?.setRoomSync('',()=>{});useOfficeStore.getState().set('sendRoomMessage',()=>{});useOfficeStore.getState().set('connectionStatus','offline');};
  },[engine,engineReady]);
  return clientRef;
}
