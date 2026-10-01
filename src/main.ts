import './style.css'
import { cocktails, type Cocktail } from './data/cocktails'
import { icons } from './icons'

/* ===================== Storage ===================== */

const STORAGE_KEYS = {
  favorites: 'ace-bartender-app:favorites:v1',
  recents: 'ace-bartender-app:recents:v1',
} as const

const LIMITS = { recents: 8 } as const

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
    .replace(/[̀-ͯ]/g, '')
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

type Method = 'Shake' | 'Stir' | 'Build'

function inferPrimaryMethod(i: string): Method {
  const s = i.toLowerCase()
  if (s.includes('shake')) return 'Shake'
  if (s.includes('stir')) return 'Stir'
  return 'Build'
}

const METHOD_ICON = { Shake: icons.shake, Stir: icons.stir, Build: icons.build } as const

/**
 * Triggers a vibration pattern on supported devices (Android).
 * Note: iOS Safari and iOS PWAs do NOT support the Vibration API,
 * so this function will have no effect there.
 * Instead, rely on visual and motion feedback (sheet drag + snap) as haptic equivalents on iOS.
 */
function haptic(type: 'light' | 'medium' = 'light') {
  if (!('vibrate' in navigator)) return
  navigator.vibrate(type === 'medium' ? 20 : 10)
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

/* ===================== Spec Helpers ===================== */

type Ingredient = { amount: string; name: string }

// "1.25 oz Zubrowka" → { amount: "1.25 oz", name: "Zubrowka" }
// "3 dashes of Angostura" → { amount: "3 dashes", name: "Angostura" }
// "Dash of celery bitters" → { amount: "Dash", name: "celery bitters" }
const NUMBER = String.raw`\d+(?:[./]\d+)?`
const AMOUNT_RE = new RegExp(
  String.raw`^(${NUMBER}(?:\s*(?:-|or|to)\s*${NUMBER})?(?:\s*(?:oz|ml|dashes|dash|drops|drop|barspoons|barspoon|bsp|tsp))?)\s+(?:of\s+)?(.+)$`,
  'i'
)
const WORD_AMOUNT_RE = /^(dash|splash|full dropper|half dropper|barspoon|pinch)\s+(?:of\s+)?(.+)$/i

function parseIngredient(raw: string): Ingredient {
  const s = raw.trim()
  const m = s.match(AMOUNT_RE) ?? s.match(WORD_AMOUNT_RE)
  return m ? { amount: m[1], name: m[2] } : { amount: '', name: s }
}

function splitIngredients(ingredients: string): Ingredient[] {
  return ingredients
    .split(',')
    .map(i => i.trim())
    .filter(Boolean)
    .map(parseIngredient)
}

function splitSteps(instructions: string): string[] {
  return instructions
    .split(/(?<=\.)\s+/)
    .map(s => s.trim())
    .filter(Boolean)
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function rowSubtitle(c: Cocktail): string {
  const base = splitIngredients(c.ingredients)[0]?.name ?? ''
  return `${capitalize(base)} · ${inferPrimaryMethod(c.instructions)}`
}

// Wraps the first case-insensitive match of the query in the drink name.
function highlight(name: string, query: string): string {
  const q = query.trim().toLowerCase()
  const at = q ? name.toLowerCase().indexOf(q) : -1
  if (at < 0) return escapeHTML(name)
  return (
    escapeHTML(name.slice(0, at)) +
    `<mark class="mark">${escapeHTML(name.slice(at, at + q.length))}</mark>` +
    escapeHTML(name.slice(at + q.length))
  )
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

type Tab = 'search' | 'favorites' | 'all'

const TAB_TITLES: Record<Tab, string> = {
  search: 'Search',
  favorites: 'Favorites',
  all: 'All Drinks',
}

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
<header class="navbar">
  <div class="navbar-title"></div>
</header>

<main class="main">
  <section class="view" data-view="search">
    <img src="${import.meta.env.BASE_URL}assets/TheAce_BlackLogo.png" class="logo" alt="The Ace" />
    <h1 class="large-title">Search</h1>

    <div class="search-bar">
      <label class="search-field">
        <span class="search-icon">${icons.search}</span>
        <input type="search" class="search" placeholder="Cocktails or ingredients"
          autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="go" />
        <button type="button" class="search-clear hidden" aria-label="Clear">${icons.xmarkCircle}</button>
      </label>
      <button type="button" class="search-cancel">Cancel</button>
    </div>

    <section class="list-section" id="favoritesSection">
      <div class="section-header">Favorites</div>
      <ul class="list" id="favoritesList"></ul>
    </section>

    <section class="list-section" id="recentsSection">
      <div class="section-header">Recently Viewed</div>
      <ul class="list" id="recentsList"></ul>
    </section>

    <section class="list-section" id="resultsSection">
      <div class="section-header" id="resultsHeader">Results</div>
      <ul class="list" id="resultsList"></ul>
    </section>

    <div class="empty-state hidden" id="noResults">
      <div class="empty-icon">${icons.search}</div>
      <div class="empty-title">No Results</div>
      <div class="empty-body" id="noResultsBody"></div>
    </div>

    <p class="footnote" id="hint">Try “mezcal”, “chartreuse”, or “rye”. Swipe a row right to favorite it, or press and hold for the quick spec. Inside a drink, swipe sideways to go to the next one.</p>
  </section>

  <section class="view hidden" data-view="favorites">
    <h1 class="large-title">Favorites</h1>
    <ul class="list" id="favoritesTabList"></ul>
    <div class="empty-state hidden" id="noFavorites">
      <div class="empty-icon">${icons.star}</div>
      <div class="empty-title">No Favorites Yet</div>
      <div class="empty-body">Tap the star on any drink to keep it here for your shift.</div>
    </div>
  </section>

  <section class="view hidden" data-view="all">
    <h1 class="large-title">All Drinks</h1>
    <div class="filters" role="toolbar" aria-label="Filter by spirit">
      <button type="button" class="filter is-active" data-spirit="">All</button>
      ${SPIRITS.map(s => `<button type="button" class="filter" data-spirit="${s.label}">${s.label}</button>`).join('')}
    </div>
    <div id="allGroups"></div>
    <div class="empty-state hidden" id="allEmpty">
      <div class="empty-icon">${icons.glass}</div>
      <div class="empty-title">No Drinks</div>
      <div class="empty-body">Nothing on the menu matches this filter.</div>
    </div>
    <p class="footnote center" id="allCount"></p>
  </section>
</main>

<nav class="index-rail hidden" aria-label="Jump to letter"></nav>

<nav class="tabbar">
  <button type="button" class="tab is-active" data-tab="search">${icons.search}<span>Search</span></button>
  <button type="button" class="tab" data-tab="favorites">${icons.starFill}<span>Favorites</span></button>
  <button type="button" class="tab" data-tab="all">${icons.list}<span>All Drinks</span></button>
</nav>

<div class="sheet-backdrop"></div>
<section class="sheet" role="dialog" aria-modal="true">
  <div class="sheet-handle"></div>
  <div class="sheet-top">
    <button type="button" class="circle-btn sheet-action-fav" aria-label="Favorite"></button>
    <button type="button" class="circle-btn sheet-action-close" aria-label="Close">${icons.xmark}</button>
  </div>
  <div class="sheet-content"></div>
  <nav class="sheet-nav" aria-label="Other drinks">
    <button type="button" class="sheet-nav-btn prev"></button>
    <button type="button" class="sheet-nav-btn next"></button>
  </nav>
</section>
`

/* ===================== DOM ===================== */

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!

const navbar = $<HTMLElement>('.navbar')
const navbarTitle = $<HTMLElement>('.navbar-title')
const searchBar = $<HTMLElement>('.search-bar')
const searchInput = $<HTMLInputElement>('.search')
const searchClear = $<HTMLButtonElement>('.search-clear')
const searchCancel = $<HTMLButtonElement>('.search-cancel')
const favoritesList = $<HTMLUListElement>('#favoritesList')
const recentsList = $<HTMLUListElement>('#recentsList')
const resultsList = $<HTMLUListElement>('#resultsList')
const resultsHeader = $<HTMLElement>('#resultsHeader')
const favoritesSection = $<HTMLElement>('#favoritesSection')
const recentsSection = $<HTMLElement>('#recentsSection')
const resultsSection = $<HTMLElement>('#resultsSection')
const noResults = $<HTMLElement>('#noResults')
const noResultsBody = $<HTMLElement>('#noResultsBody')
const hint = $<HTMLElement>('#hint')
const favoritesTabList = $<HTMLUListElement>('#favoritesTabList')
const noFavorites = $<HTMLElement>('#noFavorites')
const filterBar = $<HTMLElement>('.filters')
const allGroups = $<HTMLElement>('#allGroups')
const allEmpty = $<HTMLElement>('#allEmpty')
const allCount = $<HTMLElement>('#allCount')
const indexRail = $<HTMLElement>('.index-rail')

const sheet = $<HTMLElement>('.sheet')
const sheetContent = $<HTMLElement>('.sheet-content')
const backdrop = $<HTMLElement>('.sheet-backdrop')
const closeBtn = $<HTMLButtonElement>('.sheet-action-close')
const favBtn = $<HTMLButtonElement>('.sheet-action-fav')
const sheetNav = $<HTMLElement>('.sheet-nav')
const prevBtn = $<HTMLButtonElement>('.sheet-nav-btn.prev')
const nextBtn = $<HTMLButtonElement>('.sheet-nav-btn.next')

/* ===================== State ===================== */

let activeTab: Tab = 'search'
let activeCocktail: Cocktail | null = null
let isCompactMode = false
let currentResults: Cocktail[] = []
let activeSpirit: Spirit | null = null
let sheetOpenedAt = 0
// The list the open drink came from, so the sheet can step to the next one.
let sheetList: Cocktail[] = []
let sheetFromSearch = false

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

function renderRow(c: Cocktail, query = '') {
  const li = document.createElement('li')
  li.className = 'row'
  li.dataset.name = c.name
  const isFav = favorites.includes(c.name)

  li.innerHTML = `
    <div class="row-text">
      <div class="row-title">${highlight(c.name, query)}</div>
      <div class="row-subtitle">${escapeHTML(rowSubtitle(c))}</div>
    </div>
    <div class="row-right">
      ${isFav ? `<span class="row-star">${icons.starFill}</span>` : ''}
      <span class="row-chevron">${icons.chevron}</span>
    </div>
  `
  return li
}

function fillList(list: HTMLElement, items: Cocktail[], query = '') {
  list.replaceChildren(...items.map(c => renderRow(c, query)))
}

function renderSearchHome() {
  fillList(favoritesList, favorites.map(n => cocktailByName.get(n)!))
  fillList(recentsList, recents.map(n => cocktailByName.get(n)!))
  resultsList.replaceChildren()

  setVisible(favoritesSection, favorites.length > 0)
  setVisible(recentsSection, recents.length > 0)
  setVisible(resultsSection, false)
  setVisible(noResults, false)
  setVisible(hint, favorites.length + recents.length === 0)
}

// Lower is better: drinks whose name starts with the query, then a word in
// the name, then anywhere in the name, then ingredients.
// "El " is skipped so "vuelve" ranks El Vuelve a la Vida first.
function searchRank(c: Cocktail, query: string): number {
  const name = normalizeForSearch(c.name)
  const bare = name.replace(/^el /, '')
  if (name.startsWith(query) || bare.startsWith(query)) return 0
  if ((' ' + name).includes(' ' + query)) return 1
  if (name.includes(query)) return 2
  // Ingredients match from the start of a word, so "neg" doesn't find vinegar.
  if ((' ' + normalizeForSearch(c.ingredients)).includes(' ' + query)) return 3
  return -1
}

function renderSearch(q: string) {
  const query = normalizeForSearch(q)
  setVisible(searchClear, q.length > 0)
  currentResults = []

  if (!query) return renderSearchHome()

  const matches = cocktails
    .map(c => ({ c, rank: searchRank(c, query) }))
    .filter(m => m.rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.c.name.localeCompare(b.c.name))
    .map(m => m.c)
  currentResults = matches
  fillList(resultsList, currentResults, q)

  resultsHeader.textContent = matches.length === 1 ? '1 Drink' : `${matches.length} Drinks`
  noResultsBody.textContent = `Nothing matches “${q.trim()}”. Check the spelling or try an ingredient.`

  setVisible(resultsSection, matches.length > 0)
  setVisible(noResults, matches.length === 0)
  setVisible(favoritesSection, false)
  setVisible(recentsSection, false)
  setVisible(hint, false)
}

function renderFavoritesTab() {
  fillList(favoritesTabList, favorites.map(n => cocktailByName.get(n)!))
  setVisible(favoritesTabList, favorites.length > 0)
  setVisible(noFavorites, favorites.length === 0)
}

function renderAllTab() {
  const items = activeSpirit
    ? sortedCocktails.filter(c => spiritsByName.get(c.name)!.includes(activeSpirit!))
    : sortedCocktails

  const groups = new Map<string, Cocktail[]>()
  for (const c of items) {
    const letter = indexLetter(c.name)
    groups.set(letter, [...(groups.get(letter) ?? []), c])
  }

  allGroups.replaceChildren(
    ...[...groups].map(([letter, list]) => {
      const section = document.createElement('section')
      section.className = 'list-section'
      section.innerHTML = `<div class="section-header letter" id="letter-${letter}">${escapeHTML(letter)}</div><ul class="list"></ul>`
      fillList(section.querySelector('ul')!, list)
      return section
    })
  )
  indexRail.innerHTML = [...groups.keys()]
    .map(l => `<span class="index-key" data-letter="${l}">${l}</span>`)
    .join('')

  const noun = items.length === 1 ? 'Cocktail' : 'Cocktails'
  allCount.textContent = activeSpirit ? `${items.length} ${activeSpirit} ${noun}` : `${items.length} ${noun}`
  setVisible(allCount, items.length > 0)
  setVisible(allEmpty, items.length === 0)
  setVisible(indexRail, activeTab === 'all' && groups.size > 1)
}

function jumpToLetter(letter: string) {
  const target = document.getElementById(`letter-${letter}`)
  if (!target) return
  target.scrollIntoView({ block: 'start' })
  haptic('light')
}

// Re-renders whichever tab is showing (e.g. after a favorite changes).
function renderActiveTab() {
  if (activeTab === 'search') renderSearch(searchInput.value)
  else if (activeTab === 'favorites') renderFavoritesTab()
  else renderAllTab()
}

/* ===================== Tabs + Large Title ===================== */

function switchTab(tab: Tab) {
  if (tab === activeTab) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Tapping Search again puts the cursor in the field, like the App Store.
    if (tab === 'search') searchInput.focus({ preventScroll: true })
    return
  }
  activeTab = tab
  document.querySelectorAll<HTMLElement>('.view').forEach(v =>
    setVisible(v, v.dataset.view === tab)
  )
  document.querySelectorAll<HTMLElement>('.tab').forEach(t =>
    t.classList.toggle('is-active', t.dataset.tab === tab)
  )
  navbarTitle.textContent = TAB_TITLES[tab]
  setVisible(indexRail, false)
  window.scrollTo(0, 0)
  renderActiveTab()
  updateNavbar()
}

// iOS large titles: once the big title scrolls under the bar, the bar
// turns frosted and shows a small centered title.
function updateNavbar() {
  const title = document.querySelector<HTMLElement>(`.view[data-view="${activeTab}"] .large-title`)
  const collapsed = !!title && title.getBoundingClientRect().bottom < navbar.offsetHeight
  navbar.classList.toggle('is-collapsed', collapsed)
}

/* ===================== Sheet ===================== */

function renderSheetContent(c: Cocktail) {
  const method = inferPrimaryMethod(c.instructions)
  const ingredients = splitIngredients(c.ingredients)
  const steps = splitSteps(c.instructions)
  const spirits = spiritsByName.get(c.name) ?? []

  const tile = (icon: string, label: string, value: string) => `
    <div class="info-tile">
      <div class="info-icon">${icon}</div>
      <div class="info-label">${label}</div>
      <div class="info-value">${escapeHTML(value)}</div>
    </div>`

  sheetContent.innerHTML = `
    ${spirits.length ? `<div class="sheet-eyebrow">${escapeHTML(spirits.join(' · '))}</div>` : ''}
    <h2 class="sheet-title">${escapeHTML(c.name)}</h2>

    <div class="info-grid">
      ${tile(METHOD_ICON[method], 'Method', method)}
      ${tile(icons.glass, 'Glass', c.glassware ?? '—')}
      ${tile(icons.leaf, 'Garnish', c.garnish ?? '—')}
    </div>

    <div class="segmented spec-toggle" role="tablist">
      <button type="button" class="segment ${isCompactMode ? '' : 'is-active'}" data-compact="0">Full Spec</button>
      <button type="button" class="segment ${isCompactMode ? 'is-active' : ''}" data-compact="1">Quick Spec</button>
    </div>

    ${
      isCompactMode
        ? `<p class="quick-spec">${ingredients
            .map(i => `<span>${i.amount ? `<b>${escapeHTML(i.amount)}</b> ` : ''}${escapeHTML(i.name)}</span>`)
            .join(' <span class="dot">·</span> ')}</p>`
        : `
          <div class="section-header">Ingredients</div>
          <ul class="list spec-list">
            ${ingredients
              .map(
                i => `<li class="spec-row">
                  <span class="spec-amount">${escapeHTML(i.amount)}</span>
                  <span class="spec-name">${escapeHTML(capitalize(i.name))}</span>
                </li>`
              )
              .join('')}
          </ul>

          <div class="section-header">Method</div>
          <ol class="list steps">
            ${steps.map(s => `<li class="step">${escapeHTML(s)}</li>`).join('')}
          </ol>`
    }
  `

  sheetContent.querySelectorAll<HTMLButtonElement>('.spec-toggle .segment').forEach(btn =>
    btn.addEventListener('click', () => {
      const compact = btn.dataset.compact === '1'
      if (compact === isCompactMode) return
      isCompactMode = compact
      haptic('light')
      renderSheetContent(c)
    })
  )
}

function updateFavButton() {
  const isFav = !!activeCocktail && favorites.includes(activeCocktail.name)
  favBtn.innerHTML = isFav ? icons.starFill : icons.star
  favBtn.classList.toggle('is-on', isFav)
  favBtn.setAttribute('aria-pressed', String(isFav))
}

function updateSheetNav() {
  const at = activeCocktail ? sheetList.indexOf(activeCocktail) : -1
  const prev = at > 0 ? sheetList[at - 1] : null
  const next = at >= 0 && at < sheetList.length - 1 ? sheetList[at + 1] : null
  const label = (c: Cocktail | null, dir: 'prev' | 'next') =>
    c
      ? dir === 'prev'
        ? `<span class="nav-chev flip">${icons.chevron}</span><span class="nav-name">${escapeHTML(c.name)}</span>`
        : `<span class="nav-name">${escapeHTML(c.name)}</span><span class="nav-chev">${icons.chevron}</span>`
      : ''
  prevBtn.innerHTML = label(prev, 'prev')
  nextBtn.innerHTML = label(next, 'next')
  prevBtn.disabled = !prev
  nextBtn.disabled = !next
  setVisible(sheetNav, sheetList.length > 1)
}

function showInSheet(c: Cocktail, direction: 'prev' | 'next' | null = null) {
  activeCocktail = c
  addRecent(c.name)
  renderSheetContent(c)
  updateFavButton()
  updateSheetNav()
  sheetContent.scrollTop = 0
  if (direction) {
    sheetContent.classList.remove('slide-prev', 'slide-next')
    void sheetContent.offsetWidth // restart the animation
    sheetContent.classList.add(`slide-${direction}`)
  }
}

function stepSheet(delta: 1 | -1) {
  if (!activeCocktail) return
  const target = sheetList[sheetList.indexOf(activeCocktail) + delta]
  if (!target) return
  haptic('light')
  showInSheet(target, delta === 1 ? 'next' : 'prev')
}

function openSheet(c: Cocktail, compact = false, list: Cocktail[] = []) {
  isCompactMode = compact
  sheetList = list.includes(c) ? list : [c]
  sheetFromSearch = activeTab === 'search'
  showInSheet(c)

  sheetOpenedAt = performance.now()
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

  renderActiveTab()

  // Looking something up is usually followed by looking up the next drink,
  // so go straight back to the search field, ready to type over.
  if (sheetFromSearch) {
    searchInput.focus({ preventScroll: true })
    searchInput.select()
    window.scrollTo(0, 0)
  }
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
  let moved = false
  let longPress: number | null = null
  let didLongPress = false

  list.addEventListener('pointerdown', e => {
    const row = (e.target as HTMLElement).closest('.row') as HTMLElement
    if (!row) return

    startX = e.clientX
    startY = e.clientY
    moved = false
    didLongPress = false

    longPress = window.setTimeout(() => {
      didLongPress = true
      haptic('light')
      openSheet(cocktailByName.get(row.dataset.name!)!, true, listOrder(list))
    }, 450)
  })

  list.addEventListener('pointermove', e => {
    if (Math.abs(e.clientX - startX) > 10 || Math.abs(e.clientY - startY) > 10) {
      moved = true
      if (longPress) clearTimeout(longPress)
      longPress = null
    }
  })

  list.addEventListener('pointercancel', () => {
    if (longPress) clearTimeout(longPress)
    longPress = null
  })

  list.addEventListener('pointerup', e => {
    if (longPress) clearTimeout(longPress)

    const row = (e.target as HTMLElement).closest('.row') as HTMLElement
    if (!row) return

    if (didLongPress) return

    const dx = e.clientX - startX
    const dy = Math.abs(e.clientY - startY)

    if (dx > 40 && dx > dy) {
      toggleFavorite(row.dataset.name!)
      haptic('light')
      renderActiveTab()
      return
    }

    // A vertical scroll that ended on a row is not a tap.
    if (moved) return

    openSheet(cocktailByName.get(row.dataset.name!)!, false, listOrder(list))
  })
}

// Drinks in the order they're shown in a list (or all lists in a container).
function listOrder(container: HTMLElement): Cocktail[] {
  return [...container.querySelectorAll<HTMLElement>('.row')].map(
    r => cocktailByName.get(r.dataset.name!)!
  )
}

/* Swipe sideways on the drink card to step through the list it came from. */
function attachSheetSwipe() {
  let x0 = 0
  let y0 = 0
  let id: number | null = null
  sheetContent.addEventListener('pointerdown', e => {
    id = e.pointerId
    x0 = e.clientX
    y0 = e.clientY
  })
  sheetContent.addEventListener('pointerup', e => {
    if (e.pointerId !== id) return
    id = null
    const dx = e.clientX - x0
    const dy = e.clientY - y0
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) stepSheet(dx < 0 ? 1 : -1)
  })
  sheetContent.addEventListener('pointercancel', () => (id = null))
}

/* ===================== Events ===================== */

;[favoritesList, recentsList, resultsList, favoritesTabList, allGroups].forEach(attachRowInteractions)

searchInput.addEventListener('input', () => renderSearch(searchInput.value))
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && currentResults[0]) openSheet(currentResults[0], false, currentResults)
})
searchInput.addEventListener('focus', () => searchBar.classList.add('is-focused'))
searchInput.addEventListener('blur', () => {
  if (!searchInput.value) searchBar.classList.remove('is-focused')
})

searchClear.addEventListener('pointerdown', e => e.preventDefault()) // keep keyboard up
searchClear.addEventListener('click', () => {
  searchInput.value = ''
  renderSearch('')
  searchInput.focus()
})

searchCancel.addEventListener('click', () => {
  searchInput.value = ''
  searchBar.classList.remove('is-focused')
  searchInput.blur()
  renderSearch('')
})

document.querySelectorAll<HTMLButtonElement>('.tab').forEach(t =>
  t.addEventListener('click', () => switchTab(t.dataset.tab as Tab))
)

filterBar.addEventListener('click', e => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.filter')
  if (!btn) return
  activeSpirit = (btn.dataset.spirit || null) as Spirit | null
  filterBar.querySelectorAll('.filter').forEach(f => f.classList.toggle('is-active', f === btn))
  haptic('light')
  renderAllTab()
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

closeBtn.addEventListener('click', closeSheet)
// A tap opens the sheet on pointerup; the browser's follow-up click then
// lands on the freshly shown backdrop. Ignore it so the sheet stays open.
backdrop.addEventListener('click', () => {
  if (performance.now() - sheetOpenedAt > 400) closeSheet()
})
document.addEventListener('keydown', e => {
  if (!activeCocktail) return
  if (e.key === 'Escape') closeSheet()
  else if (e.key === 'ArrowRight') stepSheet(1)
  else if (e.key === 'ArrowLeft') stepSheet(-1)
})

prevBtn.addEventListener('click', () => stepSheet(-1))
nextBtn.addEventListener('click', () => stepSheet(1))
attachSheetSwipe()

favBtn.addEventListener('click', () => {
  if (!activeCocktail) return
  toggleFavorite(activeCocktail.name)
  haptic('light')
  updateFavButton()
})

window.addEventListener('scroll', updateNavbar, { passive: true })

/* ===================== Attach Swipe-down Drag Handlers ===================== */

$<HTMLElement>('.sheet-handle').addEventListener('pointerdown', onDragStart)
$<HTMLElement>('.sheet-top').addEventListener('pointerdown', onDragStart)

/* ===================== Init ===================== */

navbarTitle.textContent = TAB_TITLES[activeTab]
renderSearchHome()
updateNavbar()
// Do NOT auto-focus search on load (prevents keyboard hijacking)
