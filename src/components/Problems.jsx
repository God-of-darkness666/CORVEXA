import { useRef } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import SectionHead from './ui/SectionHead.jsx'
import Icon from './ui/Icon.jsx'
import { problems } from '../data/content.js'

export default function Problems() {
  const gridRef = useRef(null)
  const inView = useInView(gridRef, { once: true, amount: 0.1 })
  const reduced = useReducedMotion()
  const connected = inView || Boolean(reduced)

  const handleMove = (event) => {
    const el = event.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--px', `${((event.clientX - rect.left) / rect.width) * 100}%`)
    el.style.setProperty('--py', `${((event.clientY - rect.top) / rect.height) * 100}%`)
  }

  return (
    <section className="section problems" id="problems">
      <div className="section__inner">
        <SectionHead
          index="02"
          label="Problems We Solve"
          title={
            <>
              The student project ecosystem is <span className="text-gradient">disconnected</span>.
            </>
          }
          lede="Twelve gaps keep good work from becoming useful technology. Each one is structural — and each one is fixable."
        />

        <ul className="problems__grid" ref={gridRef}>
          {problems.map((problem, index) => (
            <li
              key={problem.title}
              className={`problem${connected ? ' is-connected' : ''}`}
              style={{ '--d': `${index * 45}ms` }}
              onPointerMove={handleMove}
            >
              <span className="problem__glow" aria-hidden="true" />
              <div className="problem__top">
                <span className="problem__index">{String(index + 1).padStart(2, '0')}</span>
                <span className="problem__node" aria-hidden="true" />
              </div>
              <h3 className="problem__title">{problem.title}</h3>
              <p className="problem__text">{problem.text}</p>
            </li>
          ))}
        </ul>

        <div className="problems__foot">
          <p>
            <b>Every gap above becomes a service below.</b> Verification, licensing, matching and support are how the
            disconnect gets closed.
          </p>
          <a className="link-arrow" href="#services">
            See how we close it
            <Icon name="arrow-right" />
          </a>
        </div>
      </div>
    </section>
  )
}
