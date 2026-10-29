import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import type { Specimen } from '@hortus/shared'
import { findMode, findSeason, getCopy } from '@hortus/shared'
import { api } from '@/lib/api'
import { SpecimenArt } from '@/components/archive/SpecimenArt'
import { formatDate, formatCount, seedCode, shareUrlFor } from '@/lib/format'
import '../styles/share-page.css'

const copy = getCopy('zh')

export default function SharePage() {
  const { id = '' } = useParams()
  const [spec, setSpec] = useState<Specimen | null>(null)
  const [error, setError] = useState('')
  const [thanks, setThanks] = useState(0)

  useEffect(() => {
    let alive = true
    api
      .getSpecimen(id)
      .then((s) => {
        if (!alive) return
        setSpec(s)
        setThanks(s.thanks)
      })
      .catch((err) => alive && setError(err instanceof Error ? err.message : String(err)))
    return () => {
      alive = false
    }
  }, [id])

  const share = useMemo(() => (spec ? shareUrlFor(spec) : ''), [spec])
  const mode = spec ? findMode(spec.mode) : null
  const season = spec ? findSeason(spec.season) : null

  async function thank() {
    if (!spec) return
    try {
      const res = await api.thankSpecimen(spec.id)
      setThanks(res.thanks)
      toast.success('这朵花收到了你的致谢。')
    } catch {
      toast.error('致谢没有送到，再试一次。')
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(share)
      toast.success(copy.toasts.copied)
    } catch {
      toast.error(copy.toasts.error)
    }
  }

  if (error) {
    return (
      <main className="hm-share-page">
        <div className="hm-share-missing">
          <p className="hm-label">404 · MISSING SPECIMEN</p>
          <h1 className="hm-display-cn">这株标本还没有被压进纸里。</h1>
          <p className="hm-body">也许它还在温室里长着，也许这个编号从来不存在。</p>
          <Link className="hm-btn-solid" to="/">回到园门 ↗</Link>
        </div>
      </main>
    )
  }

  if (!spec || !mode || !season) {
    return (
      <main className="hm-share-page">
        <div className="hm-share-loading"><p className="hm-label">正在把纸展开 · OPENING THE SHEET</p></div>
      </main>
    )
  }

  return (
    <main className="hm-share-page">
      <header className="hm-share-top">
        <Link to="/" className="hm-share-brand">HORTUS MANUS <span>指间花园</span></Link>
        <span className="hm-label">SPECIMEN NO. {seedCode(spec.seed)} · {formatDate(spec.createdAt, 'zh')}</span>
      </header>
      <div className="hm-share-grid">
        <section className="hm-share-copy">
          <p className="hm-label">{season.en} · {season.zh} · {mode.motif}</p>
          <h1>{mode.en}</h1>
          <p className="hm-share-cn">{mode.zh}</p>
          <p className="hm-share-latin hm-italic">{mode.latin}</p>
          {spec.caption ? <p className="hm-share-caption">“{spec.caption}”</p> : null}
          <dl className="hm-share-meta">
            <div><dt>科 / FAMILY</dt><dd>{mode.family}</dd></div>
            <div><dt>季 / SEASON</dt><dd>{season.zh} · {season.en}</dd></div>
            <div><dt>采集 / COLLECTED</dt><dd>{formatDate(spec.createdAt, 'zh')}</dd></div>
            <div><dt>种子 / SEED</dt><dd>{seedCode(spec.seed)}</dd></div>
            <div><dt>致谢 / THANKS</dt><dd>{formatCount(thanks)}</dd></div>
          </dl>
          <div className="hm-share-actions">
            <button type="button" className="hm-btn-solid" onClick={thank}>说声谢谢 · THANKS</button>
            <button type="button" className="hm-btn-quiet" onClick={copyLink}>复制链接 · COPY LINK</button>
            <Link className="hm-btn-quiet" to="/touch">进入温室 · GLASSHOUSE ↗</Link>
          </div>
          <p className="hm-label hm-share-note">LOCAL EDITION · 以手为土，以息为风。</p>
        </section>
        <figure className="hm-share-plate">
          {spec.cardUrl ? (
            <img src={spec.cardUrl} alt={`${mode.zh}标本卡`} />
          ) : (
            <SpecimenArt seed={spec.seed} mode={spec.mode} season={spec.season} caption={spec.caption} />
          )}
          <figcaption className="hm-label">PLATE · {mode.en} · {seedCode(spec.seed)}</figcaption>
        </figure>
      </div>
      <footer className="hm-share-footer">
        <Link to="/herbarium">← 标本馆 / HERBARIUM</Link>
        <span className="hm-label">HORTUS MANUS · 指间花园</span>
      </footer>
    </main>
  )
}
