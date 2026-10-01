/* SF Symbols–style inline icons. They inherit `currentColor` and scale with font-size. */

const svg = (body: string, extra = '') =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${extra}>${body}</svg>`

export const icons = {
  search: svg('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 20 20"/>'),
  star: svg(
    '<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>'
  ),
  starFill: svg(
    '<path fill="currentColor" d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>'
  ),
  list: svg(
    '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/>'
  ),
  chevron: svg('<path d="M9 5l7 7-7 7"/>'),
  xmark: svg('<path d="M7 7l10 10M17 7 7 17"/>', ' stroke-width="2.6"'),
  xmarkCircle: svg(
    '<circle cx="12" cy="12" r="9" fill="currentColor" stroke="none"/><path d="M9 9l6 6M15 9l-6 6" stroke="var(--field-bg, #fff)" stroke-width="1.8"/>'
  ),
  glass: svg('<path d="M5 4h14l-7 8z"/><path d="M12 12v7M8 20h8"/>'),
  leaf: svg('<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19l7-7"/>'),
  shake: svg('<path d="M8 3h8l-1 4H9z"/><path d="M9 7l-1 14h8L15 7"/>'),
  stir: svg('<path d="M6 8h12l-1.5 12h-9z"/><path d="M15 3l-4 13"/>'),
  build: svg('<path d="M6 4h12l-1.5 16h-9z"/><path d="M7 10h10"/>'),
  clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
}

export type IconName = keyof typeof icons
