import { motion, useReducedMotion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1]

/** Standard scroll reveal: fade + rise, once, respecting reduced motion. */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
  as = 'div',
  amount = 0.25,
  duration = 0.85,
  ...rest
}) {
  const reduced = useReducedMotion()
  const Tag = motion[as] || motion.div

  return (
    <Tag
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount, margin: '0px 0px -6% 0px' }}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
