import type { LayoutFile } from '../types/layout';
import { validateLayout } from './layoutSchema';
export const KEY = 'sansa-hub-layout-v1';
export function saveLayout(data: LayoutFile): {ok: boolean; reason?: string} {
  try { localStorage.setItem(KEY, JSON.stringify(data)); return {ok: true}; }
  catch (e) { return {ok: false, reason: e instanceof Error ? e.message : 'Trình duyệt đang chặn lưu trữ'}; }
}
export function loadLayout(): LayoutFile | null {
  try {
    const raw = localStorage.getItem(KEY); if (!raw) return null;
    const parsed: unknown = JSON.parse(raw), clean = validateLayout(parsed);
    if (!clean) { try { localStorage.setItem(`${KEY}-corrupt-backup`, raw); } catch { /* storage unavailable */ } }
    return clean;
  } catch { return null; }
}
export function clearLayout(): void { try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ } }
