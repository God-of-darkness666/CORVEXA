import { useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import usePointerFine from '../../hooks/usePointerFine.js'

/**
 * Pointer-driven 3D tilt + spotlight for service cards.
 * Only CSS custom properties are written, so the card's own transform
 * remains under stylesheet control (no inline transform fights).
 */
export default function TiltCard({ className = '', children, max = 5 }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const fine = usePointerFine()
  const enabled = fine && !reduced

  const handleMove = (event) => {
    if (!enabled) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height
    el.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`)
    el.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`)
    el.style.setProperty('--px', `${px * 100}%`)
    el.style.setProperty('--py', `${py * 100}%`)
  }

  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--px', '50%')
    el.style.setProperty('--py', '0%')
  }

  return (
    <div ref={ref} className={className} onPointerMove={handleMove} onPointerLeave={handleLeave}>
      {children}
    </div>
  )
}
