import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { LayoutFile } from '../types/layout';
import { validateLayout } from './layoutSchema';
export function encodeLayoutToHash(data: LayoutFile): string {
  const payload = compressToEncodedURIComponent(JSON.stringify({version:1,savedAt:data.savedAt,player:{name:data.player.name,color:data.player.color,role:data.player.role},stations:data.stations}));
  return `#layout=${payload}`;
}
export function decodeLayoutFromHash(hash: string): LayoutFile | null {
  try { const params = new URLSearchParams(hash.replace(/^#/,'')), payload = params.get('layout'); if (!payload) return null; const raw = decompressFromEncodedURIComponent(payload); if(!raw)return null;const decoded=JSON.parse(raw) as Record<string,unknown>;return validateLayout({...decoded,camera:{mode:'3rd',yaw:0,pitch:.38,zoom:7.2}}); } catch { return null; }
}
export function buildShareUrl(data: LayoutFile): {ok:boolean;url?:string;reason?:string;warning?:string} {
  const url = `${location.origin}${location.pathname}${encodeLayoutToHash(data)}`;
  if (url.length > 8000) return {ok:false, reason:'Bố cục quá lớn để chia sẻ qua link, hãy dùng Xuất file .json'};
  return {ok:true,url,warning:url.length>2000?'Link dài, một số ứng dụng chat có thể cắt link':''};
}
