import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import CoreCanvas from './components/CoreCanvas.jsx'
import Vision from './components/Vision.jsx'
import Problems from './components/Problems.jsx'
import Services from './components/Services.jsx'
import Process from './components/Process.jsx'
import Founders from './components/Founders.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const progressRef = useRef(0)
  const barRef = useRef(null)

  /* global scroll progress — drives the scroll bar and the 3D core */
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progressRef.current = self.progress
        if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`
      },
      onRefresh: (self) => {
        progressRef.current = self.progress
      },
    })

    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    if (document.fonts?.ready) document.fonts.ready.then(refresh).catch(() => {})

    return () => {
      window.removeEventListener('load', refresh)
      trigger.kill()
    }
  }, [])

  /* cursor-following light (precise pointers only) */
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined
    document.body.classList.add('has-pointer')

    let frame = 0
    const onMove = (event) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const root = document.documentElement
        root.style.setProperty('--mx', `${event.clientX}px`)
        root.style.setProperty('--my', `${event.clientY}px`)
      })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.body.classList.remove('has-pointer')
    }
  }, [])

  return (
    <>
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-vignette" aria-hidden="true" />
      <div className="cursor-light" aria-hidden="true" />
      <div className="scroll-progress" ref={barRef} aria-hidden="true" />

      <Nav />
      <CoreCanvas progressRef={progressRef} />

      <main>
        <Hero />
        <Vision />
        <Problems />
        <Services />
        <Process />
        <Founders />
        <Contact />
      </main>

      <Footer />
      <div className="bg-grain" aria-hidden="true" />
    </>
  )
}
