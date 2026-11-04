import type { LayoutFile } from '../types/layout';
import { validateLayout } from './layoutSchema';
export function exportLayoutFile(data: LayoutFile): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'}), url = URL.createObjectURL(blob), a = document.createElement('a');
  const d = new Date(), stamp = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
  a.href = url; a.download = `sansa-layout-${stamp}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function importLayoutFile(file: File): Promise<LayoutFile> {
  if (file.size > 1024 * 1024) throw new Error('Tệp quá lớn');
  if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') throw new Error('Tệp không phải JSON hợp lệ');
  let parsed: unknown;
  try { parsed = JSON.parse(await file.text()); } catch { throw new Error('Tệp không phải JSON hợp lệ'); }
  const layout = validateLayout(parsed);
  if (!layout) throw new Error('Tệp không đúng định dạng Sansa Hub (version không hỗ trợ)');
  return layout;
}
