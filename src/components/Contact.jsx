import { useEffect, useId, useRef, useState } from 'react'
import Reveal from './ui/Reveal.jsx'
import SectionHead from './ui/SectionHead.jsx'
import Icon from './ui/Icon.jsx'
import { site } from '../data/site.js'

const MODES = [
  { id: 'business', label: 'Business enquiry' },
  { id: 'student', label: 'Student project' },
]

const EMPTY = {
  name: '',
  email: '',
  company: '',
  project: '',
  link: '',
  message: '',
  consent: false,
}

export default function Contact() {
  const [mode, setMode] = useState('business')
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [mailto, setMailto] = useState(null)
  const [copied, setCopied] = useState(false)
  const panelRef = useRef(null)
  const timeoutRef = useRef(0)
  const uid = useId()

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  const update = (field) => (event) => {
    const value = field === 'consent' ? event.target.checked : event.target.value
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const validate = () => {
    const next = {}
    if (!values.name.trim()) next.name = 'Please tell us your name.'
    if (!values.email.trim()) next.email = 'An email address is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) next.email = 'That email address looks incomplete.'

    if (mode === 'business' && !values.company.trim()) next.company = 'Please add your company or organisation.'
    if (mode === 'student' && !values.project.trim()) next.project = 'Please name the project.'

    if (!values.message.trim()) next.message = 'Tell us a little about what you need.'
    else if (values.message.trim().length < 20) next.message = 'A little more detail helps — at least 20 characters.'

    if (!values.consent) next.consent = 'Please confirm we can reply to this enquiry.'
    return next
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const next = validate()
    if (Object.keys(next).length) {
      setErrors(next)
      const first = Object.keys(next)[0]
      const field = panelRef.current?.querySelector(`[name="${first}"]`)
      if (field) field.focus()
      return
    }

    const subject =
      mode === 'business'
        ? `Business enquiry — ${values.company.trim()}`
        : `Student project — ${values.project.trim()}`

    const lines = [
      `Name: ${values.name.trim()}`,
      `Email: ${values.email.trim()}`,
      mode === 'business' ? `Company: ${values.company.trim()}` : `Project: ${values.project.trim()}`,
      mode === 'student' && values.link.trim() ? `Project link: ${values.link.trim()}` : '',
      '',
      values.message.trim(),
      '',
      `Enquiry type: ${mode === 'business' ? 'Business' : 'Student project'}`,
    ].filter((line) => line !== '')

    const url = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      lines.join('\n'),
    )}`

    setErrors({})
    setMailto(url)
    window.location.href = url
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email)
    } catch {
      /* clipboard blocked — the address is visible anyway */
    }
    setCopied(true)
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => setCopied(false), 2200)
  }

  const resetForm = () => {
    setValues(EMPTY)
    setErrors({})
    setMailto(null)
  }

  const errorId = (field) => `err-${field}-${uid}`

  const fieldProps = (field) => ({
    name: field,
    'aria-invalid': errors[field] ? 'true' : undefined,
    'aria-describedby': errors[field] ? errorId(field) : undefined,
    className: `field${errors[field] ? ' has-error' : ''}`,
  })

  return (
    <section className="section contact" id="contact">
      <div className="portal" aria-hidden="true">
        <span className="portal__ring" />
        <span className="portal__ring" />
        <span className="portal__ring" />
        <span className="portal__core" />
        <svg className="portal__hex" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.6">
          <path d="M50 4 92 27v46L50 96 8 73V27z" />
          <path d="M50 18 79 34v32L50 82 21 66V34z" />
          <path d="M50 32 66 41v18L50 68 34 59V41z" />
        </svg>
      </div>

      <div className="section__inner">
        <SectionHead
          index="06"
          label="Contact"
          title={
            <>
              Let's give a project a <span className="text-gradient">second life</span>.
            </>
          }
          lede="Tell us what you are building, or what you need. Enquiries go straight to the founding team."
        />

        <div className="contact__layout">
          <div className="contact__copy">
            <Reveal as="p" className="contact__text" delay={0.05}>
              Whether you are a student with a finished build or a business looking for working technology, the first
              step is the same conversation.
            </Reveal>

            <Reveal className="contact__email" delay={0.1}>
              <div>
                <span>Company email</span>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={copyEmail}
                aria-label={copied ? 'Email address copied' : 'Copy email address'}
              >
                <Icon name={copied ? 'check' : 'copy'} size={15} />
              </button>
            </Reveal>

            <Reveal className="contact__socials" delay={0.15}>
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
            </Reveal>

            <Reveal className="contact__meta" delay={0.2}>
              <span>
                <b>Business</b> — acquisition, licensing & partnerships
              </span>
              <span>
                <b>Students</b> — project submission & technical evaluation
              </span>
            </Reveal>
          </div>

          <Reveal className="form-panel" delay={0.08} amount={0.1}>
            <div ref={panelRef}>
              {mailto ? (
                <div className="form-success" role="status">
                  <span className="form-success__icon">
                    <Icon name="check" size={22} />
                  </span>
                  <h3>Enquiry ready to send</h3>
                  <p>
                    Your email client should have opened with a pre-filled message. Nothing is stored on this website —
                    if the client did not open, use the button below.
                  </p>
                  <div className="form-success__actions">
                    <a className="btn btn--primary btn--sm" href={mailto}>
                      Open email client
                      <Icon name="arrow-up-right" className="btn__icon" />
                    </a>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={resetForm}>
                      Write another
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="form-tabs" role="tablist" aria-label="Enquiry type">
                    {MODES.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        role="tab"
                        id={`tab-${option.id}-${uid}`}
                        aria-selected={mode === option.id}
                        aria-controls={`panel-${uid}`}
                        onClick={() => {
                          setMode(option.id)
                          setErrors({})
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <div role="tabpanel" id={`panel-${uid}`} aria-labelledby={`tab-${mode}-${uid}`}>
                    <div className="form-row">
                      <div className={fieldProps('name').className}>
                        <label htmlFor={`name-${uid}`}>Your name</label>
                        <input
                          id={`name-${uid}`}
                          type="text"
                          autoComplete="name"
                          placeholder="Full name"
                          value={values.name}
                          onChange={update('name')}
                          aria-invalid={fieldProps('name')['aria-invalid']}
                          aria-describedby={fieldProps('name')['aria-describedby']}
                        />
                        {errors.name ? (
                          <span className="field__error" id={errorId('name')}>
                            {errors.name}
                          </span>
                        ) : null}
                      </div>

                      <div className={fieldProps('email').className}>
                        <label htmlFor={`email-${uid}`}>Email</label>
                        <input
                          id={`email-${uid}`}
                          type="email"
                          autoComplete="email"
                          placeholder="you@company.com"
                          value={values.email}
                          onChange={update('email')}
                          aria-invalid={fieldProps('email')['aria-invalid']}
                          aria-describedby={fieldProps('email')['aria-describedby']}
                        />
                        {errors.email ? (
                          <span className="field__error" id={errorId('email')}>
                            {errors.email}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {mode === 'business' ? (
                      <div className={fieldProps('company').className}>
                        <label htmlFor={`company-${uid}`}>Company</label>
                        <input
                          id={`company-${uid}`}
                          type="text"
                          autoComplete="organization"
                          placeholder="Company or organisation"
                          value={values.company}
                          onChange={update('company')}
                          aria-invalid={fieldProps('company')['aria-invalid']}
                          aria-describedby={fieldProps('company')['aria-describedby']}
                        />
                        {errors.company ? (
                          <span className="field__error" id={errorId('company')}>
                            {errors.company}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <div className="form-row">
                        <div className={fieldProps('project').className}>
                          <label htmlFor={`project-${uid}`}>Project name</label>
                          <input
                            id={`project-${uid}`}
                            type="text"
                            placeholder="What did you build?"
                            value={values.project}
                            onChange={update('project')}
                            aria-invalid={fieldProps('project')['aria-invalid']}
                            aria-describedby={fieldProps('project')['aria-describedby']}
                          />
                          {errors.project ? (
                            <span className="field__error" id={errorId('project')}>
                              {errors.project}
                            </span>
                          ) : null}
                        </div>

                        <div className="field">
                          <label htmlFor={`link-${uid}`}>Repository or demo</label>
                          <input
                            id={`link-${uid}`}
                            type="url"
                            placeholder="https://…"
                            value={values.link}
                            onChange={update('link')}
                          />
                          <span className="field__hint">Optional, but it speeds up evaluation.</span>
                        </div>
                      </div>
                    )}

                    <div className={fieldProps('message').className}>
                      <label htmlFor={`message-${uid}`}>
                        {mode === 'business' ? 'What are you looking for?' : 'Tell us about the project'}
                      </label>
                      <textarea
                        id={`message-${uid}`}
                        rows={4}
                        placeholder={
                          mode === 'business'
                            ? 'The problem, the kind of technology you need, and your timeline.'
                            : 'Stack, what works today, what is unfinished, and who contributed.'
                        }
                        value={values.message}
                        onChange={update('message')}
                        aria-invalid={fieldProps('message')['aria-invalid']}
                        aria-describedby={fieldProps('message')['aria-describedby']}
                      />
                      {errors.message ? (
                        <span className="field__error" id={errorId('message')}>
                          {errors.message}
                        </span>
                      ) : null}
                    </div>

                    <div className="check">
                      <input
                        id={`consent-${uid}`}
                        name="consent"
                        type="checkbox"
                        checked={values.consent}
                        onChange={update('consent')}
                        aria-invalid={errors.consent ? 'true' : undefined}
                        aria-describedby={errors.consent ? errorId('consent') : undefined}
                      />
                      <label htmlFor={`consent-${uid}`}>
                        I agree to be contacted about this enquiry. Details are sent by email — nothing is stored on
                        this website.
                      </label>
                    </div>
                    {errors.consent ? (
                      <span className="field__error" id={errorId('consent')}>
                        {errors.consent}
                      </span>
                    ) : null}

                    <div className="form-foot">
                      <button type="submit" className="btn btn--primary">
                        Send enquiry
                        <Icon name="arrow-up-right" className="btn__icon" />
                      </button>
                      <span className="mono">Opens your email client</span>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
