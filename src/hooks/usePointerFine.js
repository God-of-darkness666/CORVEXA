import { useEffect, useState } from 'react'

/** True only for precise pointers (mouse / trackpad). Touch devices skip hover physics. */
export default function usePointerFine() {
  const [fine, setFine] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    const update = () => setFine(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return fine
}
