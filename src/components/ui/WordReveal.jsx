import { motion, useReducedMotion } from 'framer-motion'

/**
 * Word-by-word reveal for statement copy.
 * The full sentence is exposed once to assistive tech and hidden from the
 * animated fragments so screen readers never read it in pieces.
 */
export default function WordReveal({ text, className = '', delay = 0, step = 0.028 }) {
  const reduced = useReducedMotion()
  const words = text.split(' ')

  return (
    <span className={className}>
      <span className="visually-hidden">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            className="w"
            initial={reduced ? false : { opacity: 0, y: '0.5em', filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: delay + index * step, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        ))}
      </span>
    </span>
  )
}
