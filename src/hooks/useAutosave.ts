import {useEffect} from 'react';import type {MutableRefObject} from 'react';import type {OfficeEngine} from '../engine/OfficeEngine';import {useOfficeStore} from '../store/useOfficeStore';import {KEY,saveLayout} from '../persistence/layoutStorage';import type {LayoutFile} from '../types/layout';
export function useAutosave(engine:MutableRefObject<OfficeEngine|null>){
 useEffect(()=>{let timer:ReturnType<typeof setTimeout>|undefined,failed=false;const store=useOfficeStore.getState();
 const make=():LayoutFile|null=>{const e=engine.current;if(!e)return null;const snap=e.getLayoutSnapshot(),p=useOfficeStore.getState().player;return{version:1,savedAt:new Date().toISOString(),player:{name:p.name,color:`#${p.color.toString(16).padStart(6,'0').slice(-6)}`,role:'user'},camera:snap.camera,stations:snap.stations}};
 const save=()=>{if(!useOfficeStore.getState().layoutHydrated)return;const data=make();if(!data)return;const result=saveLayout(data);if(result.ok){failed=false;store.set('storageStatus','saved');store.set('lastSavedAt',Date.now());store.set('storageError',null)}else{store.set('storageStatus','error');store.set('storageError',result.reason??'Không thể lưu bố cục');if(!failed){store.showToast('Trình duyệt đang chặn lưu trữ, bố cục sẽ mất khi tải lại. Hãy dùng Xuất file .json');failed=true}}};
 const queue=()=>{if(!useOfficeStore.getState().layoutHydrated)return;if(timer)clearTimeout(timer);timer=setTimeout(save,300)};
 const stations=()=>queue(), storage=(e:StorageEvent)=>{if(e.key===KEY)store.showToast('Bố cục vừa được cập nhật ở tab khác')};
 const flush=()=>{if(timer)clearTimeout(timer);save()},visibility=()=>{if(document.visibilityState==='hidden')flush()};
 const unsub=useOfficeStore.subscribe((next,prev)=>{if(next.player.name!==prev.player.name||next.player.color!==prev.player.color||next.cameraMode!==prev.cameraMode)queue()});
 window.addEventListener('sansa-stations-changed',stations);window.addEventListener('storage',storage);window.addEventListener('pagehide',flush);document.addEventListener('visibilitychange',visibility);
 if(useOfficeStore.getState().layoutHydrated)queue();
 return()=>{if(timer)clearTimeout(timer);unsub();window.removeEventListener('sansa-stations-changed',stations);window.removeEventListener('storage',storage);window.removeEventListener('pagehide',flush);document.removeEventListener('visibilitychange',visibility)};
 },[engine]);
}
