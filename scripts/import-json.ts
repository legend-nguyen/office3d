import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { validateLayout } from '../shared/layoutSchema.js';

const [file = 'data/rooms/sansa-hub.json', room = 'sansa-hub'] = process.argv.slice(2);
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Cần đặt SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY trong môi trường chạy script.');
if (!/^[a-z0-9_-]{1,32}$/.test(room)) throw new Error('Mã phòng không hợp lệ.');
const parsed: unknown = JSON.parse(await readFile(resolve(file), 'utf8'));
const layout = validateLayout(parsed);
if (!layout) throw new Error('Tệp JSON không đúng định dạng bố cục.');
const rows = layout.stations.map(station => ({room_id:room,gx:station.gx,gz:station.gz,rot:((Math.round(station.rotY/(Math.PI/2))%4)+4)%4,has_desk:station.hasDesk,has_chair:station.hasChair,has_pc:station.hasPC,has_partition:station.hasPartition,has_plant:station.hasPlant,owner_id:null,owner_name:station.ownerName}));
const supabase = createClient(url, key, {auth:{persistSession:false}});
if (rows.length) { const {error}=await supabase.from('stations').upsert(rows,{onConflict:'room_id,gx,gz'}); if(error)throw error; }
console.log(`Đã nhập ${rows.length} trạm vào phòng ${room}.`);
