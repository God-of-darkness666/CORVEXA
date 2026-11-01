/**
 * FOUNDERS — editable content
 * ---------------------------------------------------------------------------
 * Replace `name`, `role`, `bio`, `skills` and `socials` with real details.
 * `photo` accepts a path served from /public, e.g. '/founders/founder-1.jpg'.
 * When `photo` is null the card renders a generated initials plate instead.
 */
export const founders = [
  {
    name: 'Aarav Sharma',
    role: 'Co-Founder & CEO',
    initials: 'AS',
    photo: null,
    bio: 'Works at the intersection of engineering education and commercial technology. Leads project evaluation, licensing and business partnerships at CORVEXA.',
    skills: ['Product strategy', 'Systems architecture', 'Partnerships', 'Licensing'],
    socials: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: 'linkedin' },
      { label: 'GitHub', href: 'https://github.com/', icon: 'github' },
      { label: 'Email', href: 'mailto:hello@corvexa.com', icon: 'mail' },
    ],
  },
  {
    name: 'Ishita Verma',
    role: 'Co-Founder & CTO',
    initials: 'IV',
    photo: null,
    bio: 'Builds the technical layer behind CORVEXA: verification standards, code review practice and the engineering support that keeps delivered projects running.',
    skills: ['Technical verification', 'Full-stack engineering', 'Security review', 'Mentorship'],
    socials: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: 'linkedin' },
      { label: 'GitHub', href: 'https://github.com/', icon: 'github' },
      { label: 'Email', href: 'mailto:hello@corvexa.com', icon: 'mail' },
    ],
  },
]
