import SectionHead from './ui/SectionHead.jsx'
import Reveal from './ui/Reveal.jsx'
import TiltCard from './ui/TiltCard.jsx'
import Icon from './ui/Icon.jsx'
import { services } from '../data/content.js'

export default function Services() {
  return (
    <section className="section services" id="services">
      <div className="section__inner">
        <SectionHead
          index="03"
          label="Our Services"
          title={
            <>
              Seven services. One <span className="text-gradient">connected</span> pipeline.
            </>
          }
          lede="From the first readiness audit to long-term maintenance, each service closes a specific gap between student work and commercial use."
        />

        <div className="services__grid">
          {services.map((service, index) => (
            <Reveal
              key={service.title}
              className="service-slot"
              delay={(index % 3) * 0.06}
              amount={0.15}
              y={30}
            >
              <TiltCard className="service">
                <span className="service__border" aria-hidden="true" />
                <span className="service__spot" aria-hidden="true" />

                <div className="service__top">
                  <span className="service__icon">
                    <Icon name={service.icon} size={22} strokeWidth={1.4} />
                  </span>
                  <span className="service__index">S/{String(index + 1).padStart(2, '0')}</span>
                </div>

                <h3 className="service__title">{service.title}</h3>
                <p className="service__text">{service.text}</p>

                <ul className="service__tags">
                  {service.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>

                <span className="service__corner" aria-hidden="true" />
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <div className="services__note">
          <i aria-hidden="true" />
          <span>Every service is delivered with a written scope — no hidden stages</span>
        </div>
      </div>
    </section>
  )
}
