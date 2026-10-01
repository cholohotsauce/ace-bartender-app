import './style.css'
import { cocktails, type Cocktail } from './data/cocktails'

/* ===================== Storage ===================== */

const STORAGE_KEYS = {
  favorites: 'ace-bartender-app:favorites:v1',
  recents: 'ace-bartender-app:recents:v1',
} as const

const LIMITS = { results: 8, recents: 8 } as const

function loadNameList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw).filter((x: any) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function saveNameList(key: string, names: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(names))
  } catch {}
}

/* ===================== Helpers ===================== */

function normalizeForSearch(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function inferPrimaryMethod(i: string): 'Shake' | 'Stir' | 'Build' {
  const s = i.toLowerCase()
  if (s.includes('shake')) return 'Shake'
  if (s.includes('stir')) return 'Stir'
  return 'Build'
}

/**
 * Triggers a vibration pattern on supported devices (Android).
 * Note: iOS Safari and iOS PWAs do NOT support the Vibration API,
 * so this function will have no effect there.
 * Instead, rely on visual and motion feedback (sheet drag + snap) as haptic equivalents on iOS.
 */
function haptic(type: 'light' | 'medium' = 'light') {
  if (!('vibrate' in navigator)) return

  // iOS Safari supports very short pulses only (actually ignores vibrate)
  const pattern = type === 'medium' ? 20 : 10
  navigator.vibrate(pattern)
}

/* ===================== Spirit Filters ===================== */

const SPIRITS = [
  { label: 'Gin', pattern: /\bgin\b/ },
  { label: 'Whisky', pattern: /bourbon|\brye\b|scotch|whisk|lot 40/ },
  { label: 'Agave', pattern: /tequila|mezcal/ },
  { label: 'Rum', pattern: /\brum\b/ },
  { label: 'Brandy', pattern: /cognac|(?<!apricot )brandy/ },
  { label: 'Vodka', pattern: /vodka/ },
  { label: 'Bubbles', pattern: /prosecco|champagne|sparkling/, includeMethod: true },
] as const

type Spirit = (typeof SPIRITS)[number]['label']

function spiritsOf(c: Cocktail): Spirit[] {
  const ingredients = c.ingredients.toLowerCase()
  const all = `${ingredients} ${c.instructions.toLowerCase()}`
  return SPIRITS.filter(s =>
    s.pattern.test('includeMethod' in s ? all : ingredients)
  ).map(s => s.label)
}

/* ===================== Spec Card Helpers ===================== */



function renderCompactIngredients(ingredients: string): string {
  return ingredients
    .split(',')
    .map(i => i.trim())
    .join(' · ')
}

/* ===================== Data ===================== */

const cocktailByName = new Map<string, Cocktail>(cocktails.map(c => [c.name, c]))
const allNames = new Set(cocktails.map(c => c.name))

const spiritsByName = new Map<string, Spirit[]>(cocktails.map(c => [c.name, spiritsOf(c)]))

// A–Z menu, case-insensitive (so "SAZERAC" sorts with the S's)
const sortedCocktails = [...cocktails].sort((a, b) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
)

function indexLetter(name: string): string {
  const first = normalizeForSearch(name).charAt(0).toUpperCase()
  return /[A-Z]/.test(first) ? first : '#'
}

let favorites = loadNameList(STORAGE_KEYS.favorites).filter(n => allNames.has(n))
let recents = loadNameList(STORAGE_KEYS.recents).filter(n => allNames.has(n))

saveNameList(STORAGE_KEYS.favorites, favorites)
saveNameList(STORAGE_KEYS.recents, recents)

function toggleFavorite(name: string) {
  favorites = favorites.includes(name)
    ? favorites.filter(n => n !== name)
    : [name, ...favorites]
  saveNameList(STORAGE_KEYS.favorites, favorites)
}

function addRecent(name: string) {
  recents = [name, ...recents.filter(n => n !== name)].slice(0, LIMITS.recents)
  saveNameList(STORAGE_KEYS.recents, recents)
}

/* ===================== App Shell ===================== */

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
<header class="header">
  <div class="header-inner">
    <img src="${import.meta.env.BASE_URL}assets/TheAce_BlackLogo.png" class="logo" />
    <h1>Ace Bartender</h1>
  </div>
</header>

<main class="main">
  <div class="search-wrap">
    <input type="search" class="search" placeholder="Search cocktails or ingredients…" />
  </div>

  <div class="filters" role="toolbar" aria-label="Filter by spirit">
    <button class="filter is-active" data-spirit="">All</button>
    ${SPIRITS.map(s => `<button class="filter" data-spirit="${s.label}">${s.label}</button>`).join('')}
  </div>

  <section class="list-section" id="favoritesSection">
    <div class="section-title">Favorites</div>
    <ul class="list" id="favoritesList"></ul>
  </section>

  <section class="list-section" id="recentsSection">
    <div class="section-title">Recents</div>
    <ul class="list" id="recentsList"></ul>
  </section>

  <section class="list-section" id="resultsSection">
    <div class="section-title">Results</div>
    <ul class="list" id="resultsList"></ul>
  </section>

  <p class="hint" id="hint">Tip: try “mezcal”, “chartreuse”, or “rye”.</p>

  <section class="list-section" id="allSection">
    <div class="section-title" id="allTitle">All Cocktails</div>
    <div id="allGroups"></div>
    <p class="empty-row hidden" id="allEmpty">No cocktails match this filter.</p>
  </section>

</main>

<nav class="index-rail" aria-label="Jump to letter"></nav>

<div class="sheet-backdrop"></div>
<section class="sheet">
  <div class="sheet-handle"></div>
  <div class="sheet-top">
    <button class="sheet-action sheet-action-close">Done</button>
    <button class="sheet-action sheet-action-fav">☆</button>
  </div>
  <div class="sheet-content"></div>
</section>
`

/* ===================== DOM ===================== */

const searchInput = document.querySelector<HTMLInputElement>('.search')!
const favoritesList = document.querySelector<HTMLUListElement>('#favoritesList')!
const recentsList = document.querySelector<HTMLUListElement>('#recentsList')!
const resultsList = document.querySelector<HTMLUListElement>('#resultsList')!
const favoritesSection = document.querySelector<HTMLElement>('#favoritesSection')!
const recentsSection = document.querySelector<HTMLElement>('#recentsSection')!
const resultsSection = document.querySelector<HTMLElement>('#resultsSection')!
const hint = document.querySelector<HTMLElement>('#hint')!
const allSection = document.querySelector<HTMLElement>('#allSection')!
const allTitle = document.querySelector<HTMLElement>('#allTitle')!
const allGroups = document.querySelector<HTMLElement>('#allGroups')!
const allEmpty = document.querySelector<HTMLElement>('#allEmpty')!
const filterBar = document.querySelector<HTMLElement>('.filters')!
const indexRail = document.querySelector<HTMLElement>('.index-rail')!
// #app's backdrop-filter traps position:fixed children, so pin the rail to the viewport via <body>
document.body.appendChild(indexRail)

const sheet = document.querySelector<HTMLElement>('.sheet')!
const sheetContent = document.querySelector<HTMLElement>('.sheet-content')!
const backdrop = document.querySelector<HTMLElement>('.sheet-backdrop')!
const closeBtn = document.querySelector<HTMLButtonElement>('.sheet-action-close')!
const favBtn = document.querySelector<HTMLButtonElement>('.sheet-action-fav')!

/* ===================== State ===================== */

let activeCocktail: Cocktail | null = null
let isCompactMode = false
let currentResults: Cocktail[] = []
let activeSpirit: Spirit | null = null

function matchesFilter(c: Cocktail) {
  return !activeSpirit || spiritsByName.get(c.name)!.includes(activeSpirit)
}

// Drag state variables for swipe-down-to-close gesture
let dragStartY = 0
let dragDeltaY = 0
let dragging = false
let dragPointerId: number | null = null

// Tuning (lower = easier close)
const DRAG_CLOSE_DISTANCE = 90   // px
const DRAG_BACKDROP_FADE = 260  // px

function resetDragVisuals() {
  dragging = false
  dragPointerId = null
  dragStartY = 0
  dragDeltaY = 0

  sheet.classList.remove('is-dragging')
  backdrop.classList.remove('is-dragging')
  sheet.style.transform = ''
  backdrop.style.opacity = ''
}

/* ===================== Rendering ===================== */

function setVisible(el: HTMLElement, show: boolean) {
  el.classList.toggle('hidden', !show)
}

function renderRow(c: Cocktail, showStar = false, showDetail = false) {
  const li = document.createElement('li')
  li.className = 'row'
  li.dataset.name = c.name

  const detail = [inferPrimaryMethod(c.instructions), c.glassware].filter(Boolean).join(' · ')

  li.innerHTML = `
    <div class="row-text">
      <div class="row-title">${escapeHTML(c.name)}</div>
      ${showDetail ? `<div class="row-subtitle">${escapeHTML(detail)}</div>` : ''}
    </div>
    <div class="row-right">
      ${showStar ? '<span class="row-star">★</span>' : ''}
      <span class="row-chevron">›</span>
    </div>
  `
  return li
}

function renderHome() {
  favoritesList.innerHTML = ''
  recentsList.innerHTML = ''
  resultsList.innerHTML = ''

  favorites.forEach(n => favoritesList.appendChild(renderRow(cocktailByName.get(n)!, true)))
  recents.forEach(n => recentsList.appendChild(renderRow(cocktailByName.get(n)!)))

  setVisible(favoritesSection, favorites.length > 0)
  setVisible(recentsSection, recents.length > 0)
  setVisible(resultsSection, false)

  hint.classList.toggle('hidden', favorites.length + recents.length > 0)

  renderAll()
}

function renderAll() {
  const visible = sortedCocktails.filter(matchesFilter)
  const groups = new Map<string, Cocktail[]>()
  visible.forEach(c => {
    const letter = indexLetter(c.name)
    groups.set(letter, [...(groups.get(letter) ?? []), c])
  })

  allGroups.innerHTML = ''
  indexRail.innerHTML = ''

  groups.forEach((items, letter) => {
    const title = document.createElement('div')
    title.className = 'letter-title'
    title.id = `letter-${letter}`
    title.textContent = letter

    const ul = document.createElement('ul')
    ul.className = 'list'
    items.forEach(c => ul.appendChild(renderRow(c, favorites.includes(c.name), true)))

    allGroups.append(title, ul)

    const key = document.createElement('span')
    key.className = 'index-key'
    key.dataset.letter = letter
    key.textContent = letter
    indexRail.appendChild(key)
  })

  allTitle.textContent = activeSpirit
    ? `${activeSpirit} · ${visible.length}`
    : `All Cocktails · ${visible.length}`

  setVisible(allSection, true)
  setVisible(allEmpty, visible.length === 0)
  setVisible(indexRail, groups.size > 1)
}

function jumpToLetter(letter: string) {
  const target = document.getElementById(`letter-${letter}`)
  if (!target) return
  target.scrollIntoView({ block: 'start' })
  haptic('light')
}

function renderSearch(q: string) {
  const query = normalizeForSearch(q)
  resultsList.innerHTML = ''
  currentResults = []

  if (!query) return renderHome()

  currentResults = cocktails
    .filter(matchesFilter)
    .filter(c => normalizeForSearch(c.name + ' ' + c.ingredients).includes(query))
    .slice(0, LIMITS.results)

  currentResults.forEach(c =>
    resultsList.appendChild(renderRow(c, favorites.includes(c.name)))
  )
  if (currentResults.length === 0) {
    resultsList.innerHTML = '<li class="empty-row">No matches</li>'
  }

  setVisible(resultsSection, true)
  setVisible(favoritesSection, false)
  setVisible(recentsSection, false)
  setVisible(allSection, false)
  setVisible(indexRail, false)
  hint.classList.add('hidden')
}

/* ===================== Sheet ===================== */

function openSheet(c: Cocktail, compact = false) {
  activeCocktail = c
  isCompactMode = compact
  addRecent(c.name)

  const ingredients = c.ingredients
    .split(',')
    .map(i => `<li>${escapeHTML(i.trim())}</li>`)
    .join('')

  const methodChip = inferPrimaryMethod(c.instructions)

  sheetContent.innerHTML = `
    <h2 class="sheet-title">${escapeHTML(c.name)}</h2>
    <div class="chips">
      <span class="chip chip-method">${methodChip}</span>
      ${c.glassware ? `<span class="chip">Glass: ${escapeHTML(c.glassware)}</span>` : ''}
      ${c.garnish ? `<span class="chip">Garnish: ${escapeHTML(c.garnish)}</span>` : ''}
    </div>

    <h3>Ingredients</h3>
    ${
      isCompactMode
        ? `<p>${escapeHTML(renderCompactIngredients(c.ingredients))}</p>`
        : `<ul class="ingredients">${ingredients}</ul>`
    }

    ${
      isCompactMode
        ? ''
        : `<h3>Method</h3><p>${escapeHTML(c.instructions)}</p>`
    }
  `

  favBtn.textContent = favorites.includes(c.name) ? '★' : '☆'

  /* Long‑press title → toggle compact */
  const title = sheetContent.querySelector('.sheet-title')!
  let timer: number | null = null

  title.addEventListener('pointerdown', () => {
    timer = window.setTimeout(() => {
      haptic('light')
      openSheet(c, true)
    }, 450)
  })
  title.addEventListener('pointerup', () => timer && clearTimeout(timer))
  title.addEventListener('pointerleave', () => timer && clearTimeout(timer))

  searchInput.blur()
  document.body.classList.add('sheet-open')
  sheet.classList.add('is-open')
  backdrop.classList.add('is-open')
}

function closeSheet() {
  haptic('medium')
  isCompactMode = false
  activeCocktail = null

  resetDragVisuals()

  sheet.classList.remove('is-open')
  backdrop.classList.remove('is-open')
  document.body.classList.remove('sheet-open')

  // Keep an active search on screen instead of dropping back to home
  renderSearch(searchInput.value)
}

/* ===================== Swipe-down-to-close Drag Handlers ===================== */

function onDragStart(e: PointerEvent) {
  if (!sheet.classList.contains('is-open')) return
  if ((e.target as HTMLElement).closest('button')) return

  dragging = true
  dragPointerId = e.pointerId
  dragStartY = e.clientY
  dragDeltaY = 0

  sheet.classList.add('is-dragging')
  backdrop.classList.add('is-dragging')

  window.addEventListener('pointermove', onDragMove)
  window.addEventListener('pointerup', onDragEnd)
  window.addEventListener('pointercancel', onDragEnd)

  try {
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  } catch {}
}

function onDragMove(e: PointerEvent) {
  if (!dragging || e.pointerId !== dragPointerId) return

  dragDeltaY = Math.max(0, e.clientY - dragStartY)

  sheet.style.transform = `translateY(${dragDeltaY}px)`
  backdrop.style.opacity = String(Math.max(0, 1 - dragDeltaY / DRAG_BACKDROP_FADE))
}

function onDragEnd(e?: PointerEvent) {
  if (!dragging || (e && e.pointerId !== dragPointerId)) return

  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragEnd)
  window.removeEventListener('pointercancel', onDragEnd)

  const shouldClose = dragDeltaY > DRAG_CLOSE_DISTANCE

  resetDragVisuals()

  if (shouldClose) {
    closeSheet()
  }
}

/* ===================== Row Gestures ===================== */

function attachRowInteractions(list: HTMLElement) {
  let startX = 0
  let startY = 0
  let longPress: number | null = null
  let didLongPress = false

  list.addEventListener('pointerdown', e => {
    const row = (e.target as HTMLElement).closest('.row') as HTMLElement
    if (!row) return

    startX = e.clientX
    startY = e.clientY
    didLongPress = false

    longPress = window.setTimeout(() => {
      didLongPress = true
      openSheet(cocktailByName.get(row.dataset.name!)!, true)
    }, 450)
  })

  list.addEventListener('pointermove', e => {
    if (Math.abs(e.clientX - startX) > 10 || Math.abs(e.clientY - startY) > 10) {
      if (longPress) clearTimeout(longPress)
      longPress = null
    }
  })

  list.addEventListener('pointerup', e => {
    if (longPress) clearTimeout(longPress)

    const row = (e.target as HTMLElement).closest('.row') as HTMLElement
    if (!row) return

    if (didLongPress) return

    if (e.clientX - startX > 40) {
      toggleFavorite(row.dataset.name!)
      haptic('light')
      renderSearch(searchInput.value)
      return
    }

    openSheet(cocktailByName.get(row.dataset.name!)!)
  })
}

/* ===================== Events ===================== */

attachRowInteractions(favoritesList)
attachRowInteractions(recentsList)
attachRowInteractions(resultsList)
attachRowInteractions(allGroups)

filterBar.addEventListener('click', e => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.filter')
  if (!btn) return
  activeSpirit = (btn.dataset.spirit || null) as Spirit | null
  filterBar.querySelectorAll('.filter').forEach(f => f.classList.toggle('is-active', f === btn))
  haptic('light')
  renderSearch(searchInput.value)
})

/* Letter index: tap or slide a finger down the rail, like Contacts */
let railLetter = ''
function onRailPointer(e: PointerEvent) {
  const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
  const letter = el?.closest<HTMLElement>('.index-key')?.dataset.letter
  if (!letter || letter === railLetter) return
  railLetter = letter
  jumpToLetter(letter)
}
indexRail.addEventListener('pointerdown', e => {
  railLetter = ''
  try {
    indexRail.setPointerCapture(e.pointerId)
  } catch {}
  onRailPointer(e)
})
indexRail.addEventListener('pointermove', e => {
  if (indexRail.hasPointerCapture(e.pointerId)) onRailPointer(e)
})

searchInput.addEventListener('input', () => renderSearch(searchInput.value))
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && currentResults[0]) openSheet(currentResults[0])
})

closeBtn.addEventListener('click', closeSheet)
backdrop.addEventListener('click', closeSheet)

favBtn.addEventListener('click', () => {
  if (!activeCocktail) return
  toggleFavorite(activeCocktail.name)
  haptic('light')
  favBtn.textContent = favorites.includes(activeCocktail.name) ? '★' : '☆'
})

/* ===================== Attach Swipe-down Drag Handlers ===================== */

const sheetHandle = document.querySelector<HTMLElement>('.sheet-handle')!
const sheetTop = document.querySelector<HTMLElement>('.sheet-top')!

sheetHandle.addEventListener('pointerdown', onDragStart)
sheetTop.addEventListener('pointerdown', onDragStart)

/* ===================== Init ===================== */

renderHome()
// Do NOT auto-focus search on load (prevents keyboard hijacking)