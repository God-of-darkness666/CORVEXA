import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { createCoreScene } from '../three/coreScene.js'

/**
 * The scroll-driven modular core. Lives in the left rail on desktop and
 * becomes a dimmed atmospheric layer behind the content on small screens.
 */
export default function CoreCanvas({ progressRef }) {
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const [live, setLive] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    let scene
    try {
      scene = createCoreScene(canvas, {
        reduced: Boolean(reduced),
        getProgress: () => progressRef.current,
      })
    } catch (error) {
      console.warn('CORVEXA: core WebGL scene unavailable.', error)
      return undefined
    }
    sceneRef.current = scene

    let active = false
    const sync = () => {
      const should = window.scrollY > window.innerHeight * 0.55
      if (should === active) return
      active = should
      setLive(should)
      if (!should) scene.stop()
      else if (reduced) scene.renderAt(0.36)
      else scene.start()
    }

    sync()
    window.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)

    const onVisibility = () => {
      if (document.hidden) scene.stop()
      else if (active) scene.start()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
      document.removeEventListener('visibilitychange', onVisibility)
      scene.dispose()
      sceneRef.current = null
    }
  }, [reduced, progressRef])

  return (
    <>
      <div className={`core-canvas${live ? ' is-live' : ''}`} aria-hidden="true">
        <canvas ref={canvasRef} />
      </div>
      <div className={`core-hud${live ? ' is-visible' : ''}`} aria-hidden="true">
        <span className="core-hud__edge" />
        <span className="core-hud__status mono">Core sync</span>
        <span className="core-hud__ticks">
          {Array.from({ length: 13 }, (_, index) => (
            <i key={index} />
          ))}
        </span>
        <span className="core-hud__tag mono">Neural grid · Modular core</span>
      </div>
    </>
  )
}
