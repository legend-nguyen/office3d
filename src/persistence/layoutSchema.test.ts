import { describe, expect, it } from 'vitest';
import { validateLayout } from './layoutSchema';
const station = {gx: 0, gz: 0, rotY: 0, hasDesk: true, hasChair: false, hasPC: false, hasPartition: false, hasPlant: false, ownerName: 'A'};
const layout = (stations = [station], version = 1) => ({version, savedAt: new Date(0).toISOString(), player: {name:'A',color:'#06b6d4',role:'user'}, camera: {mode:'3rd',yaw:0,pitch:.3,zoom:7}, stations});
describe('validateLayout', () => {
  it('accepts a valid layout', () => expect(validateLayout(layout())?.stations).toHaveLength(1));
  it('rejects missing fields and unsupported versions', () => { expect(validateLayout({})).toBeNull(); expect(validateLayout(layout([station], 2))).toBeNull(); });
  it('clamps coordinates and rounds rotations', () => { const x = validateLayout(layout([{...station,gx:100,gz:-100,rotY:1.4}]))!; expect([x.stations[0].gx,x.stations[0].gz,x.stations[0].rotY]).toEqual([24,-24,Math.PI/2]); });
  it('keeps the last duplicate and caps at 200', () => { const rows = Array.from({length:205},(_,i)=>({...station,gx:(i%19-9)*2.5,gz:(Math.floor(i/19)-5)*2.5,ownerName:String(i)})); const x = validateLayout(layout([...rows, {...station,gx:0,gz:0,ownerName:'last'}]))!; expect(x.stations).toHaveLength(200); expect(x.stations.find(s=>s.gx===0&&s.gz===0)?.ownerName).toBe('last'); });
  it('rejects malformed rows and non-object input', () => { expect(validateLayout(layout([{...station,gx:NaN}]))).toBeNull(); expect(validateLayout('{')).toBeNull(); });
});
