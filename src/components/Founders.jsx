import SectionHead from './ui/SectionHead.jsx'
import Reveal from './ui/Reveal.jsx'
import Icon from './ui/Icon.jsx'
import { founders } from '../data/founders.js'

export default function Founders() {
  return (
    <section className="section founders" id="founders">
      <div className="section__inner">
        <SectionHead
          index="05"
          label="Founders"
          title={
            <>
              Built by people who <span className="text-gradient">ship</span>.
            </>
          }
          lede="Two founders, one operating principle: verify the work, protect the builder, support the handover."
        />

        <div className="founders__grid">
          {founders.map((founder, index) => (
            <Reveal as="article" className="founder" key={founder.name} delay={index * 0.09} amount={0.15}>
              <div className="founder__portrait">
                {founder.photo ? (
                  <img
                    src={founder.photo}
                    alt={`Portrait of ${founder.name}`}
                    loading="lazy"
                    width="480"
                    height="640"
                  />
                ) : (
                  <span className="founder__initials" aria-hidden="true">
                    {founder.initials}
                  </span>
                )}
              </div>

              <div className="founder__body">
                <span className="founder__role">{founder.role}</span>
                <h3 className="founder__name">{founder.name}</h3>
                <p className="founder__bio">{founder.bio}</p>

                <ul className="founder__skills">
                  {founder.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>

                <div className="founder__socials">
                  {founder.socials.map((social) => (
                    <a
                      key={social.label}
                      className="social-btn"
                      href={social.href}
                      target={social.href.startsWith('mailto:') ? undefined : '_blank'}
                      rel={social.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                      aria-label={`${founder.name} — ${social.label}`}
                    >
                      <Icon name={social.icon} size={15} strokeWidth={1.4} />
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="founders__note">Open to partnerships, licensing conversations and student submissions</p>
      </div>
    </section>
  )
}
