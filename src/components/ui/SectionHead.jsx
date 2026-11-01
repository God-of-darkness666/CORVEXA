import Reveal from './Reveal.jsx'

export default function SectionHead({ index, label, title, lede }) {
  return (
    <header className="section-head">
      <Reveal className="section-head__meta" y={12} duration={0.7}>
        <span className="section-head__index">{index}</span>
        <span className="section-head__label">{label}</span>
        <span className="section-head__rule" aria-hidden="true" />
      </Reveal>
      <Reveal as="h2" className="section-head__title" delay={0.05}>
        {title}
      </Reveal>
      {lede ? (
        <Reveal as="p" className="section-head__lede" delay={0.12}>
          {lede}
        </Reveal>
      ) : null}
    </header>
  )
}
