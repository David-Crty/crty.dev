export interface MaintainedRepo {
  repo: string;
  name: string;
  description: string;
  role: string;
  stack: string;
  status: string;
}

export interface Contribution {
  repo: string;
  description: string;
}

export const githubUser = 'David-Crty';

export const maintained: MaintainedRepo = {
  repo: 'David-Crty/databasement',
  name: 'databasement',
  description:
    'Self-hosted database backup manager with a web UI. Schedule, backup, and restore MySQL, PostgreSQL, MariaDB, Microsoft SQL Server, MongoDB, SQLite & Redis to S3, SFTP, Samba or local storage. SSH Tunnel support.',
  role: 'Author · maintainer',
  stack: 'PHP · Laravel',
  status: 'Active',
};

export const contributions: Contribution[] = [
  { repo: 'vuetifyjs/vuetify', description: 'VTreeView keeps async children selected in independent selection mode.' },
  { repo: 'symfony/symfony', description: 'RateLimiter no longer breaks when the last username is missing from the session.' },
  { repo: 'Sylius/Sylius', description: 'AttributeBundle dependency fix and a documentation correction.' },
  { repo: 'robsontenorio/mary', description: 'Badge component gains leading and trailing icons.' },
];
