import Logo from './ui/Logo.jsx'
import Icon from './ui/Icon.jsx'
import { site } from '../data/site.js'

const explore = [
  { label: 'Vision', href: '#vision' },
  { label: 'Problems we solve', href: '#problems' },
  { label: 'Services', href: '#services' },
  { label: 'How it works', href: '#process' },
  { label: 'Founders', href: '#founders' },
]

const serviceLinks = [
  { label: 'Project commercialisation', href: '#services' },
  { label: 'Technical verification', href: '#services' },
  { label: 'Business matching', href: '#services' },
  { label: 'Licensing & IP', href: '#services' },
  { label: 'Maintenance support', href: '#services' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo />
            <p className="footer__tagline">Turning Talent into Opportunity</p>
            <p>
              CORVEXA connects verified student-built technology with the businesses that can take it further — and
              keeps it running afterwards.
            </p>
            <div className="contact__socials">
              {site.socials.map((social) => (
                <a
                  key={social.label}
                  className="social-btn"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`CORVEXA on ${social.label}`}
                >
                  <Icon name={social.icon} size={16} strokeWidth={1.4} />
                </a>
              ))}
            </div>
          </div>

          <div className="footer__col">
            <h3>Explore</h3>
            <ul>
              {explore.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h3>Services</h3>
            <ul>
              {serviceLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h3>Contact</h3>
            <ul>
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li>
                <a href="#contact">Business enquiry</a>
              </li>
              <li>
                <a href="#contact">Student submission</a>
              </li>
              <li>
                <a href="#top">Back to top</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__word" aria-hidden="true">
          CORVEXA
        </div>

        <div className="footer__bottom">
          <span>© {year} CORVEXA. All rights reserved.</span>
          <span>Neural grid · Digital core</span>
          <a className="to-top" href="#top">
            Back to top
            <Icon name="arrow-up" size={14} />
          </a>
        </div>
      </div>
    </footer>
  )
}
