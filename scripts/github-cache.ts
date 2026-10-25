import { writeFileSync } from 'node:fs';
import { fetchGithubStats } from '../src/lib/github.ts';

const stats = await fetchGithubStats();
writeFileSync(new URL('../src/data/github-cache.json', import.meta.url), JSON.stringify(stats, null, 2) + '\n');
console.log(stats);
