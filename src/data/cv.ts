export interface Job {
  org: string;
  role: string;
  /** `YYYY-MM` */
  from: string;
  /** Omitted while the job is current. */
  to?: string;
  summary?: string;
  points?: string[];
  stack: string[];
}

export interface Entry {
  term: string;
  detail: string;
}

export const lede =
  'I’m a DevOps tech lead and backend engineer. I automate infrastructure so developers can ship on their own, and I keep critical applications running on AWS, Kubernetes and Terraform.';

export const jobs: Job[] = [
  {
    org: 'Vorwerk',
    role: 'SRE consultant',
    from: '2026-04',
    stack: ['AWS', 'EKS', 'ArgoCD', 'Grafana', 'Java', 'Python'],
  },
  {
    org: 'AXA',
    role: 'DevOps tech lead consultant',
    from: '2023-05',
    to: '2026-01',
    summary:
      'I led a team of three DevOps engineers running 12 critical applications across 8 to 10 environments on OpenShift and AWS, at a 99.9% SLA or better. Automated blue/green deployments brought a release under one minute.',
    points: [
      'Moved the CI pipelines onto a reusable Tekton framework.',
      'Wrote a generic Helm chart that every project adopted.',
      'Built a self-service platform for ephemeral cloud environments.',
      'Kept the infrastructure as code, in reusable Terraform modules.',
      'Set up observability with Prometheus, Grafana and PagerDuty.',
    ],
    stack: ['OpenShift', 'AWS', 'Tekton', 'Helm', 'Terraform'],
  },
  {
    org: 'Qonto',
    role: 'Site reliability engineer',
    from: '2022-05',
    to: '2022-12',
    summary: 'I was one of five SREs working on developer experience and platform reliability, on Kubernetes and AWS.',
    points: [
      'Built a Go API that lets developers deploy their own applications without waiting on SRE.',
      'Defined and tracked deployment KPIs, including frequency and success rate.',
      'Interviewed developers to measure adoption and find what to improve next.',
    ],
    stack: ['Kubernetes', 'AWS', 'Go'],
  },
  {
    org: 'freelance.com',
    role: 'Backend developer and SRE',
    from: '2021-10',
    to: '2022-04',
    summary: 'I led the migration from Azure to AWS on Kubernetes, and worked with the backend team on the Symfony application.',
    points: [
      'Moved the platform from Azure to AWS, with Kubernetes and Terraform.',
      'Improved backend performance in the Symfony code.',
    ],
    stack: ['AWS', 'Kubernetes', 'Terraform', 'Symfony'],
  },
  {
    org: 'IO Tech Studio',
    role: 'Lead backend developer',
    from: '2018-01',
    to: '2021-10',
    summary: 'I led five developers across more than 20 client projects, and made the technical architecture decisions.',
    points: [
      'Moved the infrastructure from bare metal to AWS, with Docker Compose and Kubernetes.',
      'Designed the production and pre-production environments on AWS for client projects.',
      'Built backend applications with Symfony and Vue.js.',
    ],
    stack: ['AWS', 'Docker', 'Kubernetes', 'Symfony', 'Vue.js'],
  },
  {
    org: 'AWStudio',
    role: 'PHP backend developer',
    from: '2015-08',
    to: '2017-11',
    summary: 'I was a backend developer in a team of ten, building web applications for clients like McDonald’s and Amazon France.',
    points: [
      'Brought in Elasticsearch for search and MongoDB for data storage.',
      'Pushed for clean code standards across the team.',
    ],
    stack: ['PHP', 'Elasticsearch', 'MongoDB'],
  },
  {
    org: 'ecpim.com',
    role: 'PHP backend developer',
    from: '2013-09',
    to: '2015-06',
    summary: 'I built the backend of an accounting application for real estate management, and worked on its architecture and database.',
    stack: ['PHP', 'MySQL', 'Linux'],
  },
];

export const skills: Entry[] = [
  { term: 'Platform', detail: 'Kubernetes · OpenShift · Helm · ArgoCD' },
  { term: 'Cloud and IaC', detail: 'AWS · Terraform' },
  { term: 'CI/CD', detail: 'Tekton · blue/green deployments' },
  { term: 'Observability', detail: 'Prometheus · Grafana · PagerDuty' },
  { term: 'Languages', detail: 'Java · Go · Node.js · Python · PHP' },
  { term: 'AI agents', detail: 'Claude Code · MCP servers · agent skills for ops workflows' },
];

export const education: Entry[] = [
  { term: '2016', detail: 'Master’s degree, IT management' },
  { term: '2014', detail: 'Associate degree, computer science' },
];
