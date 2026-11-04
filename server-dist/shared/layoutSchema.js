const GRID_STEP = 2.5;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const finite = (v) => typeof v === 'number' && Number.isFinite(v);
export function migrate(data) {
    if (!data || typeof data !== 'object' || data.version !== 1)
        return null;
    return data;
}
export function validateLayout(input) {
    try {
        const migrated = migrate(input);
        if (!migrated || typeof migrated !== 'object')
            return null;
        const d = migrated;
        if (typeof d.savedAt !== 'string' || !d.player || typeof d.player !== 'object' || !d.camera || typeof d.camera !== 'object' || !Array.isArray(d.stations))
            return null;
        const player = d.player, camera = d.camera;
        if (typeof player.name !== 'string' || typeof player.color !== 'string' || typeof player.role !== 'string' || !Number.isFinite(Date.parse(d.savedAt)))
            return null;
        if ((camera.mode !== '3rd' && camera.mode !== '1st') || !finite(camera.yaw) || !finite(camera.pitch) || !finite(camera.zoom))
            return null;
        const rotations = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];
        const byCell = new Map();
        for (const raw of d.stations) {
            if (!raw || typeof raw !== 'object')
                return null;
            const s = raw;
            if (!finite(s.gx) || !finite(s.gz) || !finite(s.rotY) || typeof s.ownerName !== 'string')
                return null;
            const gx = clamp(Math.round(s.gx / GRID_STEP) * GRID_STEP, -24, 24);
            const gz = clamp(Math.round(s.gz / GRID_STEP) * GRID_STEP, -24, 24);
            const rot = s.rotY;
            const item = { gx, gz, rotY: rotations.reduce((a, b) => Math.abs(b - rot) < Math.abs(a - rot) ? b : a), hasDesk: !!s.hasDesk, hasChair: !!s.hasChair, hasPC: !!s.hasPC, hasPartition: !!s.hasPartition, hasPlant: !!s.hasPlant, ownerName: s.ownerName.slice(0, 24) };
            if (!(item.hasDesk || item.hasChair || item.hasPC || item.hasPartition || item.hasPlant))
                continue;
            byCell.set(`${gx},${gz}`, item);
        }
        const stations = [...byCell.values()].slice(-200);
        const color = /^#[0-9a-f]{6}$/i.test(player.color) ? player.color : '#06b6d4';
        return { version: 1, savedAt: d.savedAt, player: { name: player.name.slice(0, 24), color, role: player.role }, camera: { mode: camera.mode, yaw: camera.yaw, pitch: clamp(camera.pitch, -.25, 1.15), zoom: clamp(camera.zoom, 3, 18) }, stations };
    }
    catch {
        return null;
    }
}
