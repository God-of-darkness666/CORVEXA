import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import Icon from './ui/Icon.jsx'
import Magnetic from './ui/Magnetic.jsx'
import { createHeroScene } from '../three/heroScene.js'

const LETTERS = 'CORVEXA'.split('')

export default function Hero() {
  const canvasRef = useRef(null)
  const titleRef = useRef(null)
  const [ready, setReady] = useState(false)
  const reduced = useReducedMotion()

  /* ------------------------------------------------------------- 3D scene */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    let scene = null
    let cancelled = false
    let visible = true
    let io = null

    /* Align the cube wordmark with the DOM <h1> box, in canvas-local pixels. */
    const measure = () => {
      if (!scene) return
      const title = titleRef.current
      if (!title) return
      const box = canvas.getBoundingClientRect()
      const rect = title.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      scene.setFrame({
        x: rect.left - box.left,
        y: rect.top - box.top,
        w: rect.width,
        h: rect.height,
      })
    }

    const boot = () => {
      if (cancelled) return
      try {
        scene = createHeroScene(canvas, {
          reduced: Boolean(reduced),
          onReady: () => {
            if (!cancelled) setReady(true)
          },
        })
      } catch (error) {
        console.warn('CORVEXA: hero WebGL scene unavailable.', error)
        return
      }

      measure()

      io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting && !document.hidden
          if (visible) scene.start()
          else scene.stop()
        },
        { threshold: 0.02 },
      )
      io.observe(canvas)

      if (!reduced) scene.start()
    }

    const onVisibility = () => {
      if (!scene) return
      if (document.hidden) scene.stop()
      else if (visible) scene.start()
    }

    const onResize = () => {
      measure()
    }

    // Wait for the display font so the sampled letterforms match the DOM title.
    if (document.fonts?.ready) {
      document.fonts.ready.then(boot).catch(boot)
    } else {
      boot()
    }

    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      if (io) io.disconnect()
      if (scene) scene.dispose()
      scene = null
    }
  }, [reduced])

  return (
    <section
      className={`hero${ready ? ' is-cube' : ''}`}
      id="top"
      aria-label="CORVEXA — Turning Talent into Opportunity"
    >
      <div className="hero__aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="hero__floor" aria-hidden="true" />

      <div className={`hero__canvas${ready ? ' is-ready' : ''}`} aria-hidden="true">
        <canvas ref={canvasRef} />
      </div>

      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__hud hero__hud--tl mono">
        SYS.01
        <b>Neural grid</b>
      </div>
      <div className="hero__hud hero__hud--tr mono">
        Status
        <b>Core online</b>
      </div>
      <div className="hero__hud hero__hud--bl">
        <a className="hero__scroll mono" href="#vision">
          <i aria-hidden="true" />
          <span>Scroll to explore</span>
        </a>
      </div>
      <div className="hero__hud hero__hud--br mono">
        Turning talent
        <b>into opportunity</b>
      </div>

      <div className="hero__inner">
        <p className="hero__badge">
          <b aria-hidden="true" />
          Student-built technology
          <em aria-hidden="true">/</em>
          Business ready
        </p>

        <h1 className="hero__title" ref={titleRef}>
          <span className="visually-hidden">CORVEXA</span>
          {LETTERS.map((letter, index) => (
            <span key={`${letter}-${index}`} className="hero__letter" aria-hidden="true">
              {letter}
            </span>
          ))}
        </h1>

        <p className="hero__tagline">
          <span aria-hidden="true" />
          Turning Talent into Opportunity
          <span aria-hidden="true" />
        </p>

        <p className="hero__lede">
          CORVEXA connects <strong>verified student-built projects</strong> with businesses ready to use them —
          through technical evaluation, licensing and long-term support.
        </p>

        <div className="hero__actions">
          <Magnetic strength={8}>
            <a className="btn btn--primary" href="#vision">
              Explore CORVEXA
              <Icon name="arrow-right" className="btn__icon" />
            </a>
          </Magnetic>
          <a className="btn btn--ghost" href="#contact">
            Submit a project
            <Icon name="arrow-up-right" className="btn__icon" />
          </a>
        </div>

        <ul className="hero__signals">
          <li>Verified builds</li>
          <li>Licensed IP</li>
          <li>Ongoing support</li>
        </ul>
      </div>

      <div className="hero__fade" aria-hidden="true" />
    </section>
  )
}
