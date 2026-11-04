import { useRef } from 'react'; import { useOfficeEngine } from '../../hooks/useOfficeEngine';
export function ThreeCanvas() { const ref = useRef<HTMLDivElement>(null); useOfficeEngine(ref.current); return <div ref={ref} id="threejs-container" className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing" /> }
