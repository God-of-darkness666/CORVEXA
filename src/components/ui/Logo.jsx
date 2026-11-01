import { useId } from 'react'

/**
 * CORVEXA mark — hexagonal core crossed by an X.
 * Gradient ids are unique per instance so multiple marks can coexist.
 */
export default function Logo({ className = 'nav__mark', label = 'CORVEXA' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const gradient = `corvexa-g-${uid}`
  const soft = `corvexa-s-${uid}`

  return (
    <svg className={className} viewBox="0 0 48 48" role="img" aria-label={label} focusable="false">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3ee8ff" />
          <stop offset="0.55" stopColor="#3b7bff" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id={soft} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#5fd8ff" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <path
        d="M24 3 42.5 13.5v21L24 45 5.5 34.5v-21z"
        fill="none"
        stroke={`url(#${gradient})`}
        strokeWidth="1.3"
        opacity="0.62"
      />
      <path d="M24 9.5 37 17v14L24 38.5 11 31V17z" fill="none" stroke={`url(#${soft})`} strokeWidth="0.7" opacity="0.35" />
      <path
        d="M16.6 15.6 31.4 32.4M31.4 15.6 16.6 32.4"
        stroke={`url(#${gradient})`}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="24" cy="24" r="3" fill="#3ee8ff" />
    </svg>
  )
}
