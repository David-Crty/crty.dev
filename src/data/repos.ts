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

// TODO: the real list of upstream repos. The one entry is repeated to fill the
// layout until it is known.
export const contributions: Contribution[] = [
  { repo: 'jankeesvw/omarchy-notification-center', description: 'Clicking a Slack notification opens the conversation.' },
  { repo: 'jankeesvw/omarchy-notification-center', description: 'Clicking a Slack notification opens the conversation.' },
  { repo: 'jankeesvw/omarchy-notification-center', description: 'Clicking a Slack notification opens the conversation.' },
];
