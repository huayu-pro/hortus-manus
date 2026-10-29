import { Hono } from 'hono'
import { getSpecimen } from '../db/repo'
import { renderShareHtml, renderShareNotFoundHtml } from '../ssr/share'

export const share = new Hono()

share.get('/:id', (c) => {
  const id = c.req.param('id')
  const specimen = /^[0-9a-hjkmnp-tv-z]{12}$/.test(id) ? getSpecimen(id) : undefined
  c.header('Cache-Control', 'no-cache')
  c.header('X-Robots-Tag', 'noindex')
  c.header('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'")
  if (!specimen) {
    return c.html(renderShareNotFoundHtml(id), 404)
  }
  return c.html(renderShareHtml(specimen))
})
