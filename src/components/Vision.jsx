import SectionHead from './ui/SectionHead.jsx'
import Reveal from './ui/Reveal.jsx'
import WordReveal from './ui/WordReveal.jsx'
import Logo from './ui/Logo.jsx'
import Icon from './ui/Icon.jsx'
import { vision, visionNodes } from '../data/vision.js'

export default function Vision() {
  return (
    <section className="section vision" id="vision">
      <div className="vision__rings" aria-hidden="true" />
      <div className="section__inner">
        <SectionHead
          index="01"
          label="Our Vision"
          title={
            <>
              Student innovation should not end at <span className="text-gradient">submission</span>.
            </>
          }
          lede="A second life for student work — and a first real opportunity for the people who built it."
        />

        <div className="vision__layout">
          <div className="vision__copy">
            <h3 className="vision__statement">
              <WordReveal text={vision.statement} />
            </h3>

            {vision.body.map((paragraph, index) => (
              <Reveal as="p" className="vision__body" key={paragraph.slice(0, 24)} delay={index * 0.08}>
                {paragraph}
              </Reveal>
            ))}

            <Reveal className="vision__note" delay={0.1}>
              <Icon name="sparkle" />
              <p>
                <strong>Nothing is verified by assumption.</strong> Every project passes technical evaluation before it
                is shown to a business.
              </p>
            </Reveal>
          </div>

          <div className="vision__map">
            <ol className="node-map">
              <li className="node-map__hub" aria-hidden="true">
                <Logo />
              </li>
              {visionNodes.map((node, index) => (
                <Reveal
                  as="li"
                  className="node-card"
                  key={node.index}
                  delay={0.12 + index * 0.1}
                  amount={0.3}
                >
                  <span className="node-card__index">{node.index}</span>
                  <h3>{node.title}</h3>
                  <p>{node.text}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
