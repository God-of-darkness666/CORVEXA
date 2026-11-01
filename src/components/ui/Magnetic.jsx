import { useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import usePointerFine from '../../hooks/usePointerFine.js'

/**
 * Magnetic hover: the child drifts toward the cursor and springs back on exit.
 * Disabled for touch devices and reduced-motion preferences.
 */
export default function Magnetic({ children, strength = 14, className = '' }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const fine = usePointerFine()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.35 })
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.35 })

  const disabled = reduced || !fine

  if (disabled) {
    return <span className={className}>{children}</span>
  }

  const handleMove = (event) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width
    const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height
    x.set(dx * strength * 2)
    y.set(dy * strength * 2)
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, display: 'inline-flex' }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </motion.span>
  )
}
