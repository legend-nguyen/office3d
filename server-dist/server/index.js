import express from 'express';
import { createServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { RoomStorage } from './storage.js';
import { validateClientMessage } from './validateMessage.js';
const PORT = Number(process.env.PORT || 3000), MAX = Math.max(1, Math.min(20, Number(process.env.MAX_PLAYERS || 20))), storage = new RoomStorage(), rooms = new Map(), identities = new Map(), app = express(), server = createServer(app), wss = new WebSocketServer({ noServer: true, maxPayload: 16 * 1024 }), dataRoot = resolve(process.env.DATA_DIR || './data');
app.get('/health', (_q, r) => r.json({ ok: true }));
app.use(express.static(resolve('dist')));
app.get(/.*/, (q, r) => q.path.startsWith('/ws') ? r.sendStatus(404) : r.sendFile(resolve('dist/index.html')));
server.on('upgrade', (req, socket, head) => { const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean), origin = req.headers.origin; if (allowed.length && (!origin || !allowed.includes(origin))) {
    socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
    socket.destroy();
    return;
} if (req.url?.split('?')[0] !== '/ws') {
    socket.destroy();
    return;
} wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req)); });
const send = (ws, msg) => { if (ws.readyState === WebSocket.OPEN)
    ws.send(JSON.stringify(msg)); }, broadcast = (room, msg, except) => { for (const c of room.clients.values())
    if (c.id !== except)
        send(c.ws, msg); }, error = (c, code, message) => { send(c.ws, { t: 'error', code, message }); if (++c.violations >= 3)
    c.ws.close(1008, 'RATE_LIMITED'); }, hash = (x) => createHash('sha256').update(x).digest('hex');
async function roomFor(id) { let r = rooms.get(id); if (r) {
    if (r.timer)
        clearTimeout(r.timer);
    return r;
} const file = await storage.load(id); r = { stations: file.stations, clients: new Map() }; rooms.set(id, r); return r; }
async function loadPlayers() { try {
    const data = JSON.parse(await readFile(join(dataRoot, 'players.json'), 'utf8'));
    for (const [k, v] of Object.entries(data))
        if (typeof v === 'string')
            identities.set(k, v);
}
catch { /* none yet */ } }
async function savePlayers() { try {
    await mkdir(dataRoot, { recursive: true });
    await writeFile(join(dataRoot, 'players.json'), JSON.stringify(Object.fromEntries(identities)));
}
catch (e) {
    console.error('Không thể lưu danh tính', e);
} }
async function onClientMessage(ws, msg, getClient, setClient) {
    let client = getClient();
    if (!client) {
        if (msg.t !== 'hello' || msg.clientId.length > 64 || msg.secret.length < 16 || msg.secret.length > 128 || msg.name.length > 256) {
            ws.close(1008);
            return;
        }
        const known = identities.get(msg.clientId), digest = hash(msg.secret);
        if (known && known !== digest) {
            ws.close(1008, 'IDENTITY_REJECTED');
            return;
        }
        if (!known) {
            identities.set(msg.clientId, digest);
            void savePlayers();
        }
        const room = await roomFor(msg.room);
        if (room.clients.size >= MAX && !room.clients.has(msg.clientId)) {
            send(ws, { t: 'error', code: 'ROOM_FULL', message: 'Phòng đã đủ người' });
            ws.close(1008);
            return;
        }
        const player = { clientId: msg.clientId, name: msg.name.slice(0, 24), color: msg.color, x: 0, z: 0, rotY: 0, state: 'idle', isSharing: false, seatKey: null };
        client = { ws, id: msg.clientId, name: player.name, color: player.color, room: msg.room, presence: player, messages: [], stations: [], violations: 0 };
        setClient(client);
        room.clients.set(client.id, client);
        send(ws, { t: 'init', you: { clientId: client.id }, stations: room.stations, players: [...room.clients.values()].filter(x => x !== client).map(x => x.presence) });
        broadcast(room, { t: 'player:joined', player }, client.id);
        return;
    }
    const now = Date.now();
    client.messages = client.messages.filter(t => now - t < 1000);
    client.messages.push(now);
    if (client.messages.length > 30) {
        error(client, 'RATE_LIMITED', 'Bạn thao tác quá nhanh');
        return;
    }
    if (msg.t === 'station:upsert' || msg.t === 'station:remove') {
        client.stations = client.stations.filter(t => now - t < 1000);
        client.stations.push(now);
        if (client.stations.length > 5) {
            error(client, 'RATE_LIMITED', 'Bạn thao tác đặt đồ quá nhanh');
            return;
        }
    }
    const room = rooms.get(client.room);
    if (!room)
        return;
    if (msg.t === 'station:upsert') {
        const st = msg.station, key = `${st.gx},${st.gz}`, old = room.stations.find(x => `${x.gx},${x.gz}` === key);
        if (old && old.ownerId !== client.id) {
            error(client, 'CELL_TAKEN', 'Ô này đã có người khác đặt');
            return;
        }
        if (!old && room.stations.filter(x => x.ownerId === client.id).length >= 30) {
            error(client, 'BAD_MESSAGE', 'Bạn đã đạt giới hạn 30 trạm');
            return;
        }
        if (!old && room.stations.length >= 200) {
            error(client, 'BAD_MESSAGE', 'Phòng đã đạt giới hạn 200 trạm');
            return;
        }
        const saved = { ...st, ownerId: client.id };
        room.stations = room.stations.filter(x => `${x.gx},${x.gz}` !== key).concat(saved);
        storage.schedule(client.room, room.stations);
        broadcast(room, { t: 'station:upserted', station: saved });
        return;
    }
    if (msg.t === 'station:remove') {
        const old = room.stations.find(x => x.gx === msg.gx && x.gz === msg.gz);
        if (!old)
            return;
        if (old.ownerId !== client.id) {
            error(client, 'NOT_OWNER', 'Chỉ chủ bàn mới được sửa bàn này');
            return;
        }
        room.stations = room.stations.filter(x => x !== old);
        storage.schedule(client.room, room.stations);
        broadcast(room, { t: 'station:removed', gx: msg.gx, gz: msg.gz, byClientId: client.id });
        return;
    }
    if (msg.t === 'presence') {
        client.presence = { ...client.presence, x: msg.x, z: msg.z, rotY: msg.rotY, state: msg.state, isSharing: msg.isSharing, seatKey: msg.seatKey };
        broadcast(room, { ...msg, t: 'presence', clientId: client.id }, client.id);
        return;
    }
    if (msg.t === 'rtc') {
        const target = room.clients.get(msg.to);
        if (target)
            send(target.ws, { t: 'rtc', from: client.id, session: msg.session, kind: msg.kind, payload: msg.payload });
        return;
    }
    if (msg.t === 'emote') {
        const target = room.clients.get(msg.toClientId);
        if (target)
            send(target.ws, { t: 'emote', from: client.id, toClientId: target.id, kind: msg.kind });
        return;
    }
    if (msg.t === 'chat') {
        const target = room.clients.get(msg.toClientId);
        if (target)
            send(target.ws, { t: 'chat', from: client.id, toClientId: target.id, text: msg.text.trim().slice(0, 500) });
        return;
    }
    error(client, 'BAD_MESSAGE', 'Tin nhắn không hợp lệ');
}
wss.on('connection', ws => { let client = null, alive = true; const ping = setInterval(() => { if (!alive) {
    ws.terminate();
    return;
} alive = false; ws.ping(); }, 20000); ws.on('pong', () => alive = true); ws.on('message', raw => { void (async () => { if (Buffer.byteLength(raw.toString()) > 16384) {
    ws.close(1009);
    return;
} let msg; try {
    msg = validateClientMessage(JSON.parse(raw.toString()));
}
catch {
    msg = null;
} if (!msg) {
    if (client)
        error(client, 'BAD_MESSAGE', 'Tin nhắn không hợp lệ');
    else
        ws.close(1008);
    return;
} await onClientMessage(ws, msg, () => client, c => { client = c; }); })().catch(() => { if (client)
    error(client, 'BAD_MESSAGE', 'Không thể xử lý tin nhắn');
else
    ws.close(1011); }); }); ws.on('close', () => { clearInterval(ping); const closed = client; if (!closed)
    return; const room = rooms.get(closed.room); if (!room)
    return; room.clients.delete(closed.id); broadcast(room, { t: 'player:left', clientId: closed.id }); if (!room.clients.size) {
    void storage.flush(closed.room);
    room.timer = setTimeout(() => { if (!room.clients.size)
        rooms.delete(closed.room); }, 600000);
} }); ws.on('error', () => { }); });
const shutdown = () => void storage.flush().finally(() => server.close(() => process.exit(0)));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
void loadPlayers().then(() => server.listen(PORT, () => console.log(`SANSA HUB đang chạy tại cổng ${PORT}`)));
