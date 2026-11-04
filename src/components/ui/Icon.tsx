import type { ReactNode, SVGProps } from 'react';
const paths: Record<string, ReactNode> = {
    view_in_ar: <><path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" /><path d="m3.5 7.2 8.5 4.7 8.5-4.7M12 12v10M7.5 4.5l9 5" /></>,
    videocam: <><path d="M15 10 22 6v12l-7-4" /><rect x="2" y="6" width="13" height="12" rx="2" /></>,
    visibility: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    radar: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><path d="M12 12 18.5 5.5M12 3v2M3 12h2M12 19v2M19 12h2" /></>,
    person: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    keyboard: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 15h8" /></>,
    mic: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M9 22h6" /></>,
    mic_off: <><path d="M9 9v3a3 3 0 0 0 5.1 2.1M15 9V5a3 3 0 0 0-5.8-1M5 10v2a7 7 0 0 0 11.9 5M19 10v2c0 .7-.1 1.4-.3 2M12 19v3M9 22h6M3 3l18 18" /></>,
    volume_up: <><path d="M11 5 6 9H3v6h3l5 4V5ZM15.5 8.5a5 5 0 0 1 0 7M18 5a9 9 0 0 1 0 14" /></>,
    volume_off: <><path d="M11 5 6 9H3v6h3l5 4V5ZM16 9l5 6M21 9l-5 6" /></>,
    chair_alt: <><path d="M7 3h10v7H7zM6 10h12l2 5H4l2-5ZM7 15l-1 6M17 15l1 6M5 21h14" /></>,
    chart_alt: <><path d="M7 3h10v7H7zM6 10h12l2 5H4l2-5ZM7 15l-1 6M17 15l1 6M5 21h14" /></>,
    chair: <><path d="M7 3h10v7H7zM6 10h12l2 5H4l2-5ZM7 15l-1 6M17 15l1 6M5 21h14" /></>,
    developer_board: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h10M7 12h6M7 16h4M1 8h2M1 12h2M1 16h2M21 8h2M21 12h2M21 16h2" /></>,
    desk: <><path d="M3 8h18v3H3zM5 11v10M19 11v10M8 8V5h8v3" /></>,
    chair_alt2: <><path d="M7 3h10v7H7zM6 10h12l2 5H4l2-5ZM7 15l-1 6M17 15l1 6" /></>,
    monitor: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></>,
    vertical_split: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 3v18M7 8h2M15 8h2" /></>,
    potted_plant: <><path d="M6 14h12l-1 7H7l-1-7ZM12 14V5M12 9c-4 0-6-2-6-5 4 0 6 2 6 5ZM12 11c0-4 2-6 6-6 0 4-2 6-6 6Z" /></>,
    delete_sweep: <><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7" /></>,
    rotate_right: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.5 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.5-3" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    screen_share: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4M8 10h8M12 7v6M10 11l2 2 2-2" /></>,
    bolt: <path d="m13 2-3 8H4l7 12 3-8h6L13 2Z" />,
};
export function Icon({ name, className = '', ...props }: { name: string; className?: string } & SVGProps<SVGSVGElement>) { const shape = paths[name] ?? paths.chart_alt; return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>{shape}</svg> }
export function MaterialIcon({ children, className = '' }: { children: string; className?: string }) { return <Icon name={children} className={className} /> }
