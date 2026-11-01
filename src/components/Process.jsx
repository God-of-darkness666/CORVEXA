import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionHead from './ui/SectionHead.jsx'
import Reveal from './ui/Reveal.jsx'
import Icon from './ui/Icon.jsx'
import { process } from '../data/content.js'

gsap.registerPlugin(ScrollTrigger)

export default function Process() {
  const panelRef = useRef(null)
  const fillRef = useRef(null)
  const [active, setActive] = useState(-1)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) {
      setActive(process.length - 1)
      if (fillRef.current) fillRef.current.style.transform = 'none'
      return undefined
    }

    const mm = gsap.matchMedia()

    const wire = (axis) => {
      const from = axis === 'y' ? { scaleY: 0 } : { scaleX: 0 }
      const to = axis === 'y' ? { scaleY: 1 } : { scaleX: 1 }
      gsap.fromTo(fillRef.current, from, {
        ...to,
        ease: 'none',
        scrollTrigger: {
          trigger: panelRef.current,
          start: 'top 76%',
          end: 'bottom 64%',
          scrub: 0.5,
          onUpdate: (self) => {
            const next = Math.min(process.length - 1, Math.floor(self.progress * process.length * 1.02))
            setActive((prev) => (prev === next ? prev : next))
          },
        },
      })
    }

    mm.add('(min-width: 1600px)', () => wire('x'))
    mm.add('(max-width: 1599px)', () => wire('y'))

    return () => {
      mm.revert()
      gsap.set(fillRef.current, { clearProps: 'transform' })
    }
  }, [reduced])

  return (
    <section className="section process" id="process">
      <div className="section__inner">
        <SectionHead
          index="04"
          label="How CORVEXA Works"
          title={
            <>
              One chain from <span className="text-gradient">submission</span> to support.
            </>
          }
          lede="Six connected stages. Each one is a checkpoint, a handover, and a reason the next stage can exist."
        />

        <div className="process__panel" ref={panelRef}>
          <div className="process__steps">
            <div className="process__line" aria-hidden="true">
              <span ref={fillRef} />
            </div>

            {process.map((step, index) => (
              <Reveal
                key={step.title}
                className={`step${active >= index ? ' is-active' : ''}`}
                delay={index * 0.05}
                amount={0.2}
                y={22}
              >
                <div className="step__node">{String(index + 1).padStart(2, '0')}</div>
                <span className="step__stem" aria-hidden="true" />
                <div className="step__body">
                  <span className="step__kicker">{step.kicker}</span>
                  <h3 className="step__title">{step.title}</h3>
                  <p className="step__text">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="process__foot">
            <p>
              <strong>One continuous chain.</strong> Nothing is handed over without a next step already in place.
            </p>
            <a className="link-arrow" href="#contact">
              Start the chain
              <Icon name="arrow-right" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
