import { validateLayout } from './layoutSchema.js';
export function validateStation(value) { if (!value || typeof value !== 'object')
    return null; const x = value; const layout = validateLayout({ version: 1, savedAt: new Date(0).toISOString(), player: { name: '', color: '#06b6d4', role: '' }, camera: { mode: '3rd', yaw: 0, pitch: 0, zoom: 7 }, stations: [x] }); return layout?.stations[0] ?? null; }
