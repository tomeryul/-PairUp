import { memo } from 'react';

/** Line-stroke icon set (24x24, stroke=currentColor) from the PairUp design. */
const PATHS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/>',
  chat: '<path d="M4 5.5h16v10H8.5L4 19z"/>',
  heart:
    '<path d="M12 20s-7-4.4-7-9.4A3.6 3.6 0 0 1 12 7a3.6 3.6 0 0 1 7 3.6C19 15.6 12 20 12 20z"/>',
  spark: '<path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z"/>',
  more: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
  book:
    '<path d="M12 6.2C10.4 5.2 8 4.8 5.9 5.1A1 1 0 0 0 5 6.1v11a1 1 0 0 0 1.1 1c2-.3 4.3.1 5.9 1 1.6-.9 3.9-1.3 5.9-1a1 1 0 0 0 1.1-1v-11a1 1 0 0 0-.9-1C16 4.8 13.6 5.2 12 6.2z"/><path d="M12 6.2v12.8"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
  smile:
    '<circle cx="12" cy="12" r="9"/><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3.4 9h17.2"/><path d="M3.4 15h17.2"/><path d="M12 3c2.6 2.6 2.6 15.4 0 18"/><path d="M12 3c-2.6 2.6-2.6 15.4 0 18"/>',
  balloon:
    '<path d="M12 3a5 5 0 0 1 5 5c0 3.2-3.1 6.2-5 6.8C10.1 14.2 7 11.2 7 8a5 5 0 0 1 5-5z"/><path d="M12 14.8c-.4 1-.4 2 .8 2.4 1.2.4 1.2 1.8 0 2.8"/>',
  sun:
    '<circle cx="12" cy="12" r="3.4"/><path d="M12 3.5v2.2"/><path d="M12 18.3v2.2"/><path d="M4.6 4.6l1.5 1.5"/><path d="M17.9 17.9l1.5 1.5"/><path d="M3.5 12h2.2"/><path d="M18.3 12h2.2"/><path d="M4.6 19.4l1.5-1.5"/><path d="M17.9 6.1l1.5-1.5"/>',
  moon: '<path d="M20 13.5A8 8 0 1 1 10.5 4a6.2 6.2 0 0 0 9.5 9.5z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
  trophy:
    '<path d="M8 4h8v3.5a4 4 0 0 1-8 0V4z"/><path d="M8 5.2H5.6A2.4 2.4 0 0 0 8 8"/><path d="M16 5.2h2.4A2.4 2.4 0 0 1 16 8"/><path d="M12 11.5v3"/><path d="M9 18.5h6"/><path d="M10 18.5v-1.6h4v1.6"/>',
  gift:
    '<path d="M4.5 9.5h15V12h-15z"/><path d="M5.5 12h13v7.5h-13z"/><path d="M12 9.5v10"/><path d="M12 9.5C12 6 9 5 8 6.2 7 7.4 8.8 9.5 12 9.5z"/><path d="M12 9.5c0-3.5 3-4.5 4-3.3 1 1.2-.8 3.3-4 3.3z"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  check: '<path d="M5 12.5l4.2 4.2L19 7"/>',
  x: '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
  arrowL: '<path d="M14.5 6l-6 6 6 6"/>',
  flame:
    '<path d="M12 3c1.2 3 4 4.2 4 7.8a4 4 0 0 1-8 0c0-1.5.5-2.6 1.1-3.3.3 1.1 1 1.7 1.6 1.7C12 8.5 11.8 5.4 12 3z"/>',
  house: '<path d="M4 11l8-7 8 7"/><path d="M6 9.8V20h12V9.8"/><path d="M10 20v-5h4v5"/>',
  star:
    '<path d="M12 3.5l2.5 5.6 6 .6-4.5 4 1.3 5.9L12 21l-5.8-1.4 1.3-5.9-4.5-4 6-.6z"/>',
  users:
    '<circle cx="8.5" cy="8" r="3"/><path d="M2.5 19a6 6 0 0 1 12 0"/><path d="M15.5 5.2A3 3 0 0 1 17 11"/><path d="M16 13.4A6 6 0 0 1 21.5 19"/>',
  target:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12h.01"/>',
  plane:
    '<path d="M21 4L3 11l6.5 2.5L12 20l3-6 6-10z"/><path d="M9.5 13.5L15 8"/>',
  gem:
    '<path d="M6 4h12l3 5-9 12L3 9z"/><path d="M3 9h18"/><path d="M9 4l-2.5 5L12 21"/><path d="M15 4l2.5 5L12 21"/>',
  send: '<path d="M21 4L3 11l6.5 2.5L12 20l3-6 6-10z"/>',
  camera:
    '<path d="M4 8.5h3l1.3-2h7.4L17 8.5h3v10H4z"/><circle cx="12" cy="13" r="3.2"/>',
  pause: '<path d="M9 5v14"/><path d="M15 5v14"/>',
  coffee:
    '<path d="M5 8h12v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M17 9h2.2a2.2 2.2 0 0 1 0 4.4H17"/><path d="M8 3v2"/><path d="M12 3v2"/>',
  calendar:
    '<rect x="4" y="5.5" width="16" height="15" rx="2.5"/><path d="M4 10h16"/><path d="M8 3.5v3.5"/><path d="M16 3.5v3.5"/>',
  music:
    '<path d="M9 17V4.5l10-1.8V15"/><circle cx="6" cy="17.3" r="2.7"/><circle cx="16" cy="15.2" r="2.7"/>',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

function IconBase({ name, size, className }: IconProps) {
  return (
    <svg
      className={`ic${className ? ` ${className}` : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: PATHS[name] }}
    />
  );
}

export const Icon = memo(IconBase);
