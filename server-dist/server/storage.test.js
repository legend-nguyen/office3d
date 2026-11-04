import { describe, it, expect } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RoomStorage } from './storage';
const good = { version: 1, savedAt: new Date(0).toISOString(), stations: [{ gx: 0, gz: 0, rotY: 0, hasDesk: true, hasChair: false, hasPC: false, hasPartition: false, hasPlant: false, ownerName: 'A', ownerId: 'id' }] };
describe('RoomStorage', () => { it('atomically writes and loads room file', async () => { const dir = await mkdtemp(join(tmpdir(), 'sansa-')); try {
    const s = new RoomStorage(dir);
    s.schedule('r', good.stations);
    await s.flush();
    expect(JSON.parse(await readFile(join(dir, 'r.json'), 'utf8')).stations).toHaveLength(1);
}
finally {
    await rm(dir, { recursive: true, force: true });
} }); it('restores from backup after corrupt primary', async () => { const dir = await mkdtemp(join(tmpdir(), 'sansa-')); try {
    await writeFile(join(dir, 'r.json'), 'broken');
    await writeFile(join(dir, 'r.json.bak'), JSON.stringify(good));
    const loaded = await new RoomStorage(dir).load('r');
    expect(loaded.stations).toHaveLength(1);
}
finally {
    await rm(dir, { recursive: true, force: true });
} }); it('retains a broken file as corrupt backup', async () => { const dir = await mkdtemp(join(tmpdir(), 'sansa-')); try {
    await writeFile(join(dir, 'r.json'), 'broken');
    expect((await new RoomStorage(dir).load('r')).stations).toHaveLength(0);
    expect((await (await import('node:fs/promises')).readdir(dir)).some(name => name.includes('.corrupt-'))).toBe(true);
}
finally {
    await rm(dir, { recursive: true, force: true });
} }); });
