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
</main>

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

const sheet = document.querySelector<HTMLElement>('.sheet')!
const sheetContent = document.querySelector<HTMLElement>('.sheet-content')!
const backdrop = document.querySelector<HTMLElement>('.sheet-backdrop')!
const closeBtn = document.querySelector<HTMLButtonElement>('.sheet-action-close')!
const favBtn = document.querySelector<HTMLButtonElement>('.sheet-action-fav')!

/* ===================== State ===================== */

let activeCocktail: Cocktail | null = null
let isCompactMode = false
let currentResults: Cocktail[] = []

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

function renderRow(c: Cocktail, showStar = false) {
  const li = document.createElement('li')
  li.className = 'row'
  li.dataset.name = c.name

  li.innerHTML = `
    <div class="row-text">
      <div class="row-title">${escapeHTML(c.name)}</div>
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
}

function renderSearch(q: string) {
  const query = normalizeForSearch(q)
  resultsList.innerHTML = ''
  currentResults = []

  if (!query) return renderHome()

  currentResults = cocktails
    .filter(c => normalizeForSearch(c.name + ' ' + c.ingredients).includes(query))
    .slice(0, LIMITS.results)

  currentResults.forEach(c =>
    resultsList.appendChild(renderRow(c, favorites.includes(c.name)))
  )

  setVisible(resultsSection, true)
  setVisible(favoritesSection, false)
  setVisible(recentsSection, false)
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

  renderHome()
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
      renderHome()
      return
    }

    openSheet(cocktailByName.get(row.dataset.name!)!)
  })
}

/* ===================== Events ===================== */

attachRowInteractions(favoritesList)
attachRowInteractions(recentsList)
attachRowInteractions(resultsList)

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
  renderHome()
})

/* ===================== Attach Swipe-down Drag Handlers ===================== */

const sheetHandle = document.querySelector<HTMLElement>('.sheet-handle')!
const sheetTop = document.querySelector<HTMLElement>('.sheet-top')!

sheetHandle.addEventListener('pointerdown', onDragStart)
sheetTop.addEventListener('pointerdown', onDragStart)

/* ===================== Init ===================== */

renderHome()
// Do NOT auto-focus search on load (prevents keyboard hijacking)