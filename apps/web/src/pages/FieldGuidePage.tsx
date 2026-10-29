/**
 * HORTUS MANUS — /field-guide, the reader's manual (owner: stage).
 * Anatomy · gestures · modes · how it is made · live performance · privacy ·
 * references and licences. Editorial layout, all strings from copy.ts.
 */

import { Link } from 'react-router-dom'
import { MODES } from '@hortus/shared'
import { LangProvider, useLang } from '@/lib/i18n'
import { Shell, FolioFooter, SectionHead } from '@/components/shell/Shell'
import { PageShell } from '@/components/shell/PageShell'
import { AnatomyHand } from '@/components/editorial/AnatomyHand'
import { GestureGlyph, ModeGlyph } from '@/components/editorial/Glyphs'
import { VitalsStrip, useApiHealth, usePerformance } from '@/components/editorial/Vitals'
import { formatCount } from '@/lib/format'
import { IconArrow, IconExternal, IconLeaf } from '@/components/ui/icons'

const TECHNIQUES = [
  {
    num: '01',
    term: 'MediaPipe Tasks Vision',
    spec: '21 landmarks × 2 hands',
    body: 'HandLandmarker runs locally from self-hosted WASM and a .task model. No frame leaves the tab; only 21 normalised points reach the engine.',
    zh: '手部模型在本机运行：自托管的 WASM 与 .task 模型，画面不出标签页，只有 21 个归一化坐标进入引擎。',
    link: 'https://developers.google.com/mediapipe/solutions/vision/hand_landmarker',
  },
  {
    num: '02',
    term: 'One Euro Filter',
    spec: 'adaptive low-pass · Casiez et al. 2012',
    body: 'Each landmark is filtered with a speed-adaptive cutoff: steady hands are smoothed hard, fast gestures keep their edge. Prediction hides the tracker latency.',
    zh: '每个关键点用速度自适应的截止频率滤波：手慢时重平滑，手快时保留边缘；预测补上追踪延迟。',
    link: 'https://gery.casiez.net/1euro/',
  },
  {
    num: '03',
    term: 'Verlet integration',
    spec: '21-point constraint chain',
    body: 'The tendril is a position-based chain: gravity, damping and iterative distance constraints between the 21 points. Dew collects at the lowest node because the solver says so.',
    zh: '翻绳是一根基于位置的约束链：重力、阻尼、反复迭代的距离约束。露水聚在最低点，是解算器算出来的。',
    link: 'https://en.wikipedia.org/wiki/Verlet_integration',
  },
  {
    num: '04',
    term: 'Watercolour shader',
    spec: 'procedural paper · edge bleed',
    body: 'Petal edges displace into paper fibre, colour bleeds with a noise-driven threshold, and the whole plate is rendered on a single WebGL canvas. No image textures for the flowers.',
    zh: '花瓣边缘位移进纸纤维，颜色按噪声阈值晕开；整张图版在一块 WebGL 画布上生成，花不使用图片贴图。',
    link: '',
  },
] as const

function FieldGuideInner() {
  const { copy, lang } = useLang()
  const perf = usePerformance()
  const health = useApiHealth(30_000)

  return (
    <Shell route="/field-guide">
      <PageShell tone="moss">
        <article className="hm-guide">
          <header className="hm-guide__hero">
            <div className="hm-guide__hero-copy">
              <SectionHead
                as="h1"
                kicker={copy.fieldGuide.kicker}
                index={copy.acts.fieldNotes.index}
                title={copy.fieldGuide.title}
                lead={copy.fieldGuide.lead}
              />
              <p className="hm-hand hm-guide__hand">{copy.fieldNotes.signature}</p>
            </div>
            <figure className="hm-guide__hero-plate">
              <img src="plates/peony-andrews.webp" alt="" aria-hidden="true" loading="lazy" />
              <figcaption>
                <span className="hm-label">PLATE II</span>
                <span>Paeonia · 牡丹</span>
                <span className="hm-micro">Henry Cranke Andrews · 1809 · PD</span>
              </figcaption>
            </figure>
          </header>

          {/* ---------------------------------------------------------- anatomy */}
          <section className="hm-guide__section" aria-labelledby="guide-anatomy">
            <div className="hm-guide__section-head">
              <SectionHead id="guide-anatomy" kicker="ANATOMY · 21 LANDMARKS" index="21" title={copy.fieldGuide.anatomyTitle} lead={copy.fieldGuide.anatomyLead} />
              <p className="hm-micro hm-guide__hint">{copy.common.search} · hover / focus</p>
            </div>
            <AnatomyHand labels={copy.fieldGuide.landmarks} listLabel={copy.fieldGuide.anatomyTitle} />
          </section>

          {/* --------------------------------------------------------- gestures */}
          <section className="hm-guide__section" aria-labelledby="guide-gestures">
            <SectionHead id="guide-gestures" kicker="GESTURES · 05" index="05" title={copy.fieldGuide.gesturesTitle} />
            <ul className="hm-gestures">
              {Object.entries(copy.gestures).map(([key, gesture], index) => (
                <li key={key} className="hm-gestures__item">
                  <span className="hm-gestures__num">{String(index + 1).padStart(2, '0')}</span>
                  <span className="hm-gestures__glyph">
                    <GestureGlyph gesture={key as keyof typeof copy.gestures} size={36} />
                  </span>
                  <span className="hm-gestures__name">{gesture.name}</span>
                  <span className="hm-gestures__en">{gesture.en}</span>
                  <span className="hm-gestures__hand">{gesture.hand}</span>
                  <span className="hm-gestures__hint">{gesture.hint}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ------------------------------------------------------------ modes */}
          <section className="hm-guide__section" aria-labelledby="guide-modes">
            <SectionHead id="guide-modes" kicker="BOTANICAL KEY · 07" index="07" title={copy.fieldGuide.modesTitle} lead={copy.touch.modeRailHint} />
            <ol className="hm-modekey">
              {MODES.map((meta) => (
                <li key={meta.id} className="hm-modekey__row">
                  <span className="hm-modekey__index">{copy.modes[meta.id].index}</span>
                  <span className="hm-modekey__glyph" style={{ color: meta.accent }}>
                    <ModeGlyph mode={meta.id} size={30} />
                  </span>
                  <span className="hm-modekey__names">
                    <span className="hm-modekey__name">{copy.modes[meta.id].name}</span>
                    <span className="hm-modekey__en">{copy.modes[meta.id].en}</span>
                  </span>
                  <span className="hm-modekey__latin">{copy.modes[meta.id].latin}</span>
                  <span className="hm-modekey__family">{copy.modes[meta.id].family}</span>
                  <span className="hm-modekey__gesture">{copy.modes[meta.id].gesture}</span>
                  <Link className="hm-modekey__open" to={`/touch?mode=${meta.id}`} aria-label={`${copy.common.enter} — ${copy.modes[meta.id].name}`}>
                    <IconArrow size={15} />
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          {/* ------------------------------------------------------------ making */}
          <section className="hm-guide__section hm-guide__section--making" aria-labelledby="guide-making">
            <SectionHead id="guide-making" kicker="MAKING · TECHNIQUES" index="M" title={copy.fieldGuide.makingTitle} lead={copy.fieldGuide.makingBody} />
            <ol className="hm-tech">
              {TECHNIQUES.map((tech) => (
                <li key={tech.num} className="hm-tech__card">
                  <span className="hm-tech__num">TECHNIQUE {tech.num}</span>
                  <h3 className="hm-tech__term">{tech.term}</h3>
                  <p className="hm-tech__spec">{tech.spec}</p>
                  <p className="hm-body-s hm-tech__body">{lang === 'zh' ? tech.zh : tech.body}</p>
                  {tech.link ? (
                    <a className="hm-tech__link hm-micro" href={tech.link} target="_blank" rel="noreferrer">
                      {copy.common.readMore} <IconExternal size={12} />
                    </a>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>

          {/* --------------------------------------------------------- vitals */}
          <section className="hm-guide__section hm-guide__vitals" aria-labelledby="guide-vitals">
            <SectionHead id="guide-vitals" kicker="LIVE READOUT" index="LIVE" title={copy.fieldGuide.performanceTitle} lead={copy.fieldGuide.performanceLead} />
            <VitalsStrip />
            <dl className="hm-guide__facts">
              <div>
                <dt>API</dt>
                <dd>{health.ok ? `${copy.common.online} · v${health.version}` : copy.common.offline}</dd>
              </div>
              <div>
                <dt>LOCAL SPECIMENS</dt>
                <dd>{health.ok ? formatCount(health.specimens) : '—'}</dd>
              </div>
              <div>
                <dt>ROUND TRIP</dt>
                <dd>{health.roundTripMs !== null ? `${health.roundTripMs} ms` : '—'}</dd>
              </div>
              <div>
                <dt>MOTION</dt>
                <dd>{perf.reducedMotion ? 'reduced' : 'full'}</dd>
              </div>
              <div>
                <dt>POINTER</dt>
                <dd>{perf.pointer}</dd>
              </div>
            </dl>
          </section>

          {/* --------------------------------------------------------- privacy */}
          <section className="hm-guide__section hm-guide__privacy" aria-labelledby="guide-privacy">
            <SectionHead id="guide-privacy" kicker="PRIVACY" index="P" title={copy.privacy.title} lead={copy.fieldGuide.privacyBody} />
            <ul className="hm-guide__privacy-list">
              <li>{copy.privacy.cameraOnly}</li>
              <li>{copy.privacy.noUpload}</li>
              <li>{copy.privacy.noAccount}</li>
              <li>{copy.privacy.deleteToken}</li>
              <li>{copy.privacy.noCookies}</li>
            </ul>
          </section>

          {/* ------------------------------------------------------- shortcuts */}
          <section className="hm-guide__section" aria-labelledby="guide-keys">
            <SectionHead id="guide-keys" kicker="KEYBOARD" index="⌘" title={copy.fieldGuide.shortcutsTitle} />
            <ul className="hm-keys">
              {copy.shortcuts.map((item) => (
                <li key={item.keys}>
                  <kbd>{item.keys}</kbd>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ------------------------------------------------------ references */}
          <section className="hm-guide__section hm-guide__refs" aria-labelledby="guide-refs">
            <SectionHead id="guide-refs" kicker="REFERENCES & LICENCES" index="R" title="REFERENCES & LICENCES" />
            <div className="hm-guide__refs-grid">
              <div>
                <h3 className="hm-label">{copy.colophon.plateCredit}</h3>
                <ul className="hm-guide__refs-list">
                  <li>Paeonia suffruticosa (red) — 池田正樹, Wikimedia Commons, Public domain</li>
                  <li>Paeonia suffruticosa (white) — 池田正樹, Wikimedia Commons, Public domain</li>
                  <li>Water Lilies — Claude Monet, Wikimedia Commons, Public domain</li>
                  <li>Curtis&apos;s Botanical Magazine 29.1154 (1809) — Public domain</li>
                  <li>Paeonia — Henry Cranke Andrews (1770–1830), Public domain</li>
                </ul>
                <p className="hm-micro">Full licence table: /plates/LICENSES.md</p>
              </div>
              <div>
                <h3 className="hm-label">{copy.colophon.typeCredit}</h3>
                <p className="hm-body-s">{copy.colophon.typeBody}</p>
                <h3 className="hm-label hm-guide__refs-sub">{copy.colophon.techCredit}</h3>
                <p className="hm-body-s">{copy.colophon.techBody}</p>
              </div>
              <div>
                <h3 className="hm-label">{copy.colophon.researchCredit}</h3>
                <p className="hm-body-s">{copy.colophon.researchBody}</p>
                <p className="hm-micro hm-guide__refs-note">
                  <IconLeaf size={12} /> {copy.colophon.disclaimer}
                </p>
              </div>
            </div>
          </section>

          <div className="hm-guide__cta">
            <Link to="/touch" className="hm-btn hm-btn--solid hm-btn--lg">
              {copy.acts.gate.cta}
              <IconArrow size={18} />
            </Link>
            <Link to="/herbarium" className="hm-btn hm-btn--outline hm-btn--lg">
              {copy.nav.herbarium}
              <IconArrow size={18} />
            </Link>
          </div>
        </article>
        <FolioFooter page={4} note={copy.fieldGuide.kicker} />
      </PageShell>
    </Shell>
  )
}

export default function FieldGuidePage() {
  return (
    <LangProvider>
      <FieldGuideInner />
    </LangProvider>
  )
}
