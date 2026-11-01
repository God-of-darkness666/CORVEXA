const icons = {
  'arrow-right': <path d="M4 12h15M13 5.5 19.5 12 13 18.5" />,
  'arrow-up-right': <path d="M7 17 17 7M8.5 7H17v8.5" />,
  'arrow-up': <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />,
  check: <path d="m4.5 12.5 5 5 10-11" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2.2" />
      <path d="M15 5.5H6.5A2 2 0 0 0 4.5 7.5V16" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.4" />
      <path d="m4 7.5 8 5.6 8-5.6" />
    </>
  ),
  linkedin: (
    <>
      <path d="M5.2 9.6V19" />
      <circle cx="5.2" cy="5.6" r="1.4" />
      <path d="M10 19V9.6M10 13.7c0-2.5 1.5-4.3 4-4.3 2.2 0 3.7 1.5 3.7 4.4V19" />
    </>
  ),
  github: (
    <path d="M9 19.4c-3.8 1.1-3.8-2-5.3-2.4M14.6 21v-3.2a2.8 2.8 0 0 0-.8-2.2c2.7-.3 5.4-1.3 5.4-5.9a4.6 4.6 0 0 0-1.2-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-5.8 0C6.3 2.7 5.3 3 5.3 3a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.4c0 4.6 2.7 5.6 5.4 5.9a2.8 2.8 0 0 0-.8 2.2V21" />
  ),
  instagram: (
    <>
      <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="4.6" />
      <circle cx="12" cy="12" r="3.9" />
      <path d="M16.9 7.1h.01" />
    </>
  ),
  x: <path d="M5 4.5 19 19.5M19 4.5 5 19.5" />,
  sparkle: (
    <>
      <path d="M12 3.5 13.8 9l5.5 1.8-5.5 1.8L12 18l-1.8-5.4L4.7 10.8 10.2 9z" />
      <path d="M18.5 15.5 19.2 18l2.3.7-2.3.8-.7 2.4-.7-2.4-2.3-.8 2.3-.7z" />
    </>
  ),
  hexagon: <path d="M12 2.8 20 7.4v9.2L12 21.2 4 16.6V7.4z" />,
  shield: (
    <>
      <path d="M12 3 19 5.8v5.5c0 4.2-2.8 7.5-7 9.7-4.2-2.2-7-5.5-7-9.7V5.8z" />
      <path d="m8.8 11.8 2.3 2.3 4.3-4.6" />
    </>
  ),
  nodes: (
    <>
      <circle cx="6" cy="7" r="2.2" />
      <circle cx="18" cy="7" r="2.2" />
      <circle cx="12" cy="18" r="2.2" />
      <path d="M8.2 8.1 15.8 8.1M7.2 9 10.9 16M16.8 9 13.1 16" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="8" r="4.2" />
      <path d="m11 11 8.5 8.5M16.2 16.2l2.2-2.2M14 14l2.2-2.2" />
    </>
  ),
  code: <path d="m8.5 8-4.5 4 4.5 4M15.5 8l4.5 4-4.5 4M13.4 5.5l-2.8 13" />,
  wrench: (
    <path d="M15.4 3.6a5.4 5.4 0 0 0-6.7 6.8L3.4 15.7a2.4 2.4 0 0 0 3.4 3.4l5.3-5.3a5.4 5.4 0 0 0 6.8-6.7l-3.2 3.2-2.8-.6-.6-2.8z" />
  ),
  graduation: (
    <>
      <path d="M3 9.5 12 5l9 4.5-9 4.5z" />
      <path d="M7 11.7v4.6c0 1.5 2.2 2.7 5 2.7s5-1.2 5-2.7v-4.6M21 9.5v5.3" />
    </>
  ),
  rocket: (
    <>
      <path d="M13.6 4.2c2.9-1.6 5.6-1.4 5.6-1.4s.2 2.7-1.4 5.6l-4.3 6.9-5.8-5.8z" />
      <circle cx="15.2" cy="8.8" r="1.6" />
      <path d="m8.7 9.5-3.4.6 2 2M14.5 15.3l-.6 3.4-2-2M5.5 18.5c1.2-1.2 2.6-2.6 3.9-3.9" />
    </>
  ),
  quote: (
    <path d="M9.4 6C6.6 7.4 5 9.8 5 12.9V18h5.4v-5.4H7.9c0-2 .8-3.3 2.6-4.2zm9 0c-2.8 1.4-4.4 3.8-4.4 6.9V18h5.4v-5.4h-2.5c0-2 .8-3.3 2.6-4.2z" />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M3.6 12h16.8M12 3.4c2.4 2.4 3.6 5.3 3.6 8.6S14.4 18.2 12 20.6C9.6 18.2 8.4 15.3 8.4 12S9.6 5.8 12 3.4z" />
    </>
  ),
}

export default function Icon({ name, size = 18, strokeWidth = 1.5, className }) {
  const content = icons[name]
  if (!content) return null
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {content}
    </svg>
  )
}
