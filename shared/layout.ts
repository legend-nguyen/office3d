export type CameraMode='3rd'|'1st';

export interface StationData {
  gx: number; gz: number; rotY: number;
  hasDesk: boolean; hasChair: boolean; hasPC: boolean;
  hasPartition: boolean; hasPlant: boolean; ownerName: string;
}
export interface LayoutFile {
  version: 1; savedAt: string;
  player: { name: string; color: string; role: string };
  camera: { mode: CameraMode; yaw: number; pitch: number; zoom: number };
  stations: StationData[];
}
