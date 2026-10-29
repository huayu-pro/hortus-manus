import type { ModeId, ModeMeta } from './types'

/**
 * Seven phenomena. The interaction vocabulary comes from the three reference
 * videos (comic frame / ripple / ice mist / spiral galaxy / supernova / two-hand
 * constellation / full-bloom string pattern); the skin is our own botanical one.
 */
export const MODES: ModeMeta[] = [
  {
    id: 'frame',
    zh: '花窗',
    en: 'FRAME',
    latin: 'Paeonia suffruticosa',
    family: 'Paeoniaceae',
    motif: 'peony / window',
    accent: '#c97f7f',
    glyph: 'window',
    gestureZh: '双手拇指与食指成框',
    gestureEn: 'frame with both hands',
    blurbZh: '指尖围出一扇窗，窗里那株牡丹会跟着你的掌开合。',
    blurbEn: 'Frame a window with your fingertips; the peony inside opens with your palm.',
  },
  {
    id: 'tendril',
    zh: '翻绳',
    en: 'TENDRIL',
    latin: 'Clematis vitalba',
    family: 'Ranunculaceae',
    motif: 'string figure / vine',
    accent: '#6f875f',
    glyph: 'knot',
    gestureZh: '双手相对，拉出绳结',
    gestureEn: 'weave string between both hands',
    blurbZh: '旧时的翻绳变成活藤：五个图案，在指间长出露珠与嫩芽。',
    blurbEn: 'The old string game becomes a living vine: five figures, dew and new shoots between your fingers.',
  },
  {
    id: 'ripple',
    zh: '雨池',
    en: 'RIPPLE',
    latin: 'Nymphaea ‘Attraction’',
    family: 'Nymphaeaceae',
    motif: 'water lily / pond',
    accent: '#5e7f78',
    glyph: 'ripple',
    gestureZh: '指尖轻触水面',
    gestureEn: 'touch the water',
    blurbZh: '一滴雨落进莫奈的池子；你的指尖是涟漪的起点。',
    blurbEn: 'A raindrop falls into Monet’s pond; your fingertip is where the ripple begins.',
  },
  {
    id: 'spore',
    zh: '孢子',
    en: 'SPORE',
    latin: 'Taraxacum officinale',
    family: 'Asteraceae',
    motif: 'dandelion / seed',
    accent: '#d8a84e',
    glyph: 'seed',
    gestureZh: '握拳吹散，开掌接住',
    gestureEn: 'fist to blow, palm to catch',
    blurbZh: '握拳起风，把一整个蒲公英吹成星星；开掌，接住落回来的种子。',
    blurbEn: 'A fist makes wind and blows a dandelion into stars; an open palm catches what falls back.',
  },
  {
    id: 'mycelium',
    zh: '菌络',
    en: 'MYCELIUM',
    latin: 'Armillaria mellea',
    family: 'Physalacriaceae',
    motif: 'mycelium / constellation',
    accent: '#8a9a7b',
    glyph: 'web',
    gestureZh: '双掌相对，慢慢开合',
    gestureEn: 'palms facing, breathe open',
    blurbZh: '两只手之间会长出一张菌丝网；它随你的呼吸亮，随你的心跳暗。',
    blurbEn: 'A mycelial web grows between your palms; it brightens with your breath, dims with your pulse.',
  },
  {
    id: 'mist',
    zh: '晨雾',
    en: 'MIST',
    latin: 'Adiantum capillus-veneris',
    family: 'Pteridaceae',
    motif: 'pressed fern / condensation',
    accent: '#c9d8d0',
    glyph: 'mist',
    gestureZh: '手掌擦过起雾的玻璃',
    gestureEn: 'wipe the fogged pane',
    blurbZh: '擦开一层晨雾，玻璃后面压着一株蕨和一句手写的旧话。',
    blurbEn: 'Wipe the morning fog; a pressed fern and an old handwritten line wait behind the glass.',
  },
  {
    id: 'phyllotaxis',
    zh: '花冠',
    en: 'PHYLLOTAXIS',
    latin: 'Helianthus annuus',
    family: 'Asteraceae',
    motif: 'golden angle / spiral',
    accent: '#e8c4be',
    glyph: 'spiral',
    gestureZh: '掌心朝上，转动手腕',
    gestureEn: 'palm up, turn your wrist',
    blurbZh: '花瓣按黄金角一圈圈长出，你的手腕决定它朝哪边开。',
    blurbEn: 'Petals grow in golden-angle turns; your wrist decides which way the crown opens.',
  },
]

export const MODE_IDS: ModeId[] = MODES.map((m) => m.id)

export function findMode(id: ModeId): ModeMeta {
  const m = MODES.find((x) => x.id === id)
  if (!m) throw new Error(`Unknown mode: ${id}`)
  return m
}

export function isModeId(v: string): v is ModeId {
  return MODE_IDS.includes(v as ModeId)
}