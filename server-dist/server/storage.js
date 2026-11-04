import { mkdir, readFile, rename, copyFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { validateStation } from '../shared/validateStation.js';
export class RoomStorage {
    root;
    timers = new Map();
    dirty = new Map();
    constructor(root = join(process.env.DATA_DIR || './data', 'rooms')) {
        this.root = root;
    }
    path(room) { return join(this.root, `${room}.json`); }
    async load(room) { await mkdir(this.root, { recursive: true }); for (const file of [this.path(room), `${this.path(room)}.bak`])
        try {
            const data = JSON.parse(await readFile(file, 'utf8'));
            if (data.version === 1 && Array.isArray(data.stations) && data.stations.length <= 200) {
                const stations = data.stations.map(s => { const station = validateStation(s); return station && typeof s.ownerId === 'string' ? { ...station, ownerId: s.ownerId } : null; }).filter((s) => !!s);
                if (stations.length !== data.stations.length)
                    throw new Error('Invalid room file');
                return { version: 1, savedAt: typeof data.savedAt === 'string' ? data.savedAt : new Date().toISOString(), stations };
            }
        }
        catch { /* try backup */ } try {
        await rename(this.path(room), `${this.path(room)}.corrupt-${Date.now()}`);
    }
    catch { /* absent */ } return { version: 1, savedAt: new Date().toISOString(), stations: [] }; }
    schedule(room, stations) { this.dirty.set(room, { version: 1, savedAt: new Date().toISOString(), stations }); const old = this.timers.get(room); if (old)
        clearTimeout(old); this.timers.set(room, setTimeout(() => void this.flush(room), 500)); }
    async flush(room) { const rooms = room ? [room] : [...this.dirty.keys()]; for (const id of rooms) {
        const data = this.dirty.get(id);
        if (!data)
            continue;
        const path = this.path(id), tmp = `${path}.tmp`;
        await mkdir(dirname(path), { recursive: true });
        try {
            try {
                await copyFile(path, `${path}.bak`);
            }
            catch { /* first write */ }
            await writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
            await rename(tmp, path);
            this.dirty.delete(id);
            const timer = this.timers.get(id);
            if (timer)
                clearTimeout(timer);
            this.timers.delete(id);
        }
        catch (e) {
            console.error('Không thể lưu phòng', id, e);
        }
    } }
}
