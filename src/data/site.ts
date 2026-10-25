export interface Link {
  label: string;
  href: string;
}

export const site = {
  name: 'David Courtey',
  shortName: 'crty',
  url: 'https://crty.dev',
  role: 'DevOps · SRE · Backend',
  outline: 'Site reliability engineer',
  title: 'David Courtey · Freelance SRE and DevOps engineer, Barcelona',
  description:
    'Freelance SRE and DevOps engineer in Barcelona. I build platforms on Kubernetes and AWS, keep them boring with GitOps, and write backend code in PHP.',
  spec: 'T-120 · HIGH GRADE · BARCELONA',
  email: 'david@crty.dev',
  twitter: '@DCourtey',
  locale: 'en',
} as const;

export const social = {
  github: { label: 'GitHub', href: 'https://github.com/David-Crty' },
  linkedin: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/david-courtey-sre-devops/' },
  x: { label: 'X', href: 'https://x.com/DCourtey' },
  email: { label: 'Email', href: `mailto:${site.email}` },
} satisfies Record<string, Link>;

export const heroLinks: Link[] = [social.github, social.linkedin, social.x];
export const contactLinks: Link[] = [social.email, social.linkedin, social.github];
