import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Logo from './ui/Logo.jsx'
import Icon from './ui/Icon.jsx'
import Magnetic from './ui/Magnetic.jsx'
import { site } from '../data/site.js'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 901px)')
    const close = () => {
      if (mq.matches) setOpen(false)
    }
    mq.addEventListener('change', close)
    return () => mq.removeEventListener('change', close)
  }, [])

  return (
    <>
      <a className="skip-link" href="#vision">
        Skip to content
      </a>

      <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="nav__inner">
          <a className="nav__brand" href="#top" aria-label="CORVEXA — back to top">
            <Magnetic strength={6}>
              <Logo />
            </Magnetic>
            <span className="nav__word">CORVEXA</span>
          </a>

          <nav className="nav__links" aria-label="Primary">
            {site.nav.map((item) => (
              <a key={item.href} className="nav__link" href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nav__actions">
            <a className="btn btn--primary btn--sm nav__cta" href="#contact">
              Start a project
              <Icon name="arrow-up-right" className="btn__icon" />
            </a>
            <button
              className="nav__toggle"
              type="button"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((value) => !value)}
            >
              <span aria-hidden="true" />
              <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="site-menu"
            className="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <nav aria-label="Sections">
              {[...site.nav, { label: 'Contact', href: '#contact' }].map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className="menu__link"
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.07 * index + 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span>0{index + 1}</span>
                  {item.label}
                </motion.a>
              ))}
            </nav>
            <div className="menu__foot">
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <a href="#top" onClick={() => setOpen(false)}>
                Back to top
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
