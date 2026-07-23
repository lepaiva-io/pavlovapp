import type { CSSProperties } from 'react'

export const ICONS: Record<string, string> = {
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  paw: '<ellipse cx="6" cy="11.5" rx="1.7" ry="2.2"/><ellipse cx="10" cy="8.5" rx="1.7" ry="2.4"/><ellipse cx="14" cy="8.5" rx="1.7" ry="2.4"/><ellipse cx="18" cy="11.5" rx="1.7" ry="2.2"/><path d="M8.5 15.6c1.2-1.7 5.8-1.7 7 0 .9 1.3.2 3.1-1.5 3.1-.9 0-1.3-.4-2-.4s-1.1.4-2 .4c-1.7 0-2.4-1.8-1.5-3.1Z"/>',
  stethoscope: '<path d="M6 3v5a4 4 0 0 0 8 0V3"/><path d="M6 3H4.5M14 3h1.5"/><path d="M10 16v1a4 4 0 0 0 8 0v-2"/><circle cx="18" cy="12" r="2"/>',
  notebook: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v18"/><path d="M12 8h4M12 12h4"/>',
  cap: '<path d="M2 9l10-4.5L22 9l-10 4.5L2 9Z"/><path d="M6 11v4c0 1.6 2.7 3 6 3s6-1.4 6-3v-4"/><path d="M22 9v5"/>',
  contacts: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 8H2M4 12H2M4 16H2"/><circle cx="12" cy="10" r="2.2"/><path d="M8.5 16.5c.6-1.9 2-2.6 3.5-2.6s2.9.7 3.5 2.6"/>',
  syringe: '<path d="M4 20l2.5-2.5"/><path d="M6.5 17.5l-1.8-1.8 7-7 1.8 1.8-7 7Z"/><path d="M11 6.5l3.5 3.5"/><path d="M15 4l5 5"/><path d="M16.5 9.5l-2-2M12.5 13.5l-2-2"/>',
  pill: '<path d="M10.5 3.5a4.95 4.95 0 0 1 7 7l-7 7a4.95 4.95 0 0 1-7-7l7-7Z"/><path d="M7 7l7 7"/>',
  bug: '<rect x="8" y="6" width="8" height="12" rx="4"/><path d="M12 6v12"/><path d="M9.5 4.2L11 6M14.5 4.2L13 6"/><path d="M8 10H4M8 14H4M16 10h4M16 14h4M8 8L5.5 6.5M8 16l-2.5 1.5M16 8l2.5-1.5M16 16l2.5 1.5"/>',
  scissors: '<circle cx="6" cy="6.5" r="2.4"/><circle cx="6" cy="17.5" r="2.4"/><path d="M8 7.6l12 8.4M8 16.4l12-8.4"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9.5 3h5v3h-5z"/><path d="M8.5 11h7M8.5 15h5"/>',
  note: '<path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h5"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  medal: '<circle cx="12" cy="9" r="5"/><path d="M9.2 13.4L7.5 21l4.5-2.6L16.5 21l-1.7-7.6"/>',
  flame: '<path d="M12 3c.5 3 4 4.2 4 8.5a4 4 0 0 1-8 0c0-1.2.5-2 1.3-2.8C10.5 10 12 8 12 3Z"/>',
  scale: '<path d="M12 4v17"/><path d="M6 21h12"/><path d="M4.5 7.5h15"/><path d="M4.5 7.5L2 13.5a3 3 0 0 0 6 0L4.5 7.5Z"/><path d="M19.5 7.5L17 13.5a3 3 0 0 0 6 0l-2.5-6Z"/><circle cx="12" cy="4" r="1.2"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.3l6 3.7-6 3.7V8.3Z" fill="currentColor" stroke="none"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  checkcircle: '<circle cx="12" cy="12" r="9"/><path d="M8 12.2l2.8 2.8L16 9.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pencil: '<path d="M4 20h4L20 8l-4-4L4 16v4Z"/><path d="M14 6l4 4"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V5.2A1.2 1.2 0 0 1 10.2 4h3.6A1.2 1.2 0 0 1 15 5.2V7"/><path d="M6.5 7l.9 12.1a1.2 1.2 0 0 0 1.2 1.1h6.8a1.2 1.2 0 0 0 1.2-1.1L17.5 7"/><path d="M10 11v6M14 11v6"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3.5 20c0-3.3 2.5-5 5.5-5s5.5 1.7 5.5 5"/><path d="M16 5.5a3 3 0 0 1 0 5"/><path d="M18 15c2 .6 3.3 2 3.3 5"/>',
  calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
  undo: '<path d="M9 14l-4-4 4-4"/><path d="M5 10h9a5 5 0 0 1 0 10h-4"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  bowl: '<path d="M3 11h18a9 9 0 0 1-18 0Z"/><path d="M12 11c0-3 2-4 2-6M9 11c0-2 1-3 1-4"/>',
  drop: '<path d="M12 3c3 4 5 6.5 5 9.5A5 5 0 0 1 7 12.5C7 9.5 9 7 12 3Z"/>',
  poop: '<path d="M8 20h8a3 3 0 0 0 0-6 3 3 0 0 0-.6-4.5A2.8 2.8 0 0 0 12 5a2.5 2.5 0 0 0-1.5 4A3 3 0 0 0 8 14a3 3 0 0 0 0 6Z"/>',
  pdf: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M8 13h1.5a1.5 1.5 0 0 1 0 3H8v-3Zm0 3v2"/>',
}

export function Ic({ name, cls, style }: { name: string; cls?: string; style?: CSSProperties }) {
  return (
    <svg
      className={'ic-svg ' + (cls || '')}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONS[name] || '' }}
    />
  )
}
