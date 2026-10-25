import cache from '../data/github-cache.json' with { type: 'json' };
import { contributions, githubUser, maintained } from '../data/repos.ts';

export interface GithubStats {
  fetchedAt: string;
  stars: Record<string, number>;
  mergedPRs: Record<string, number>;
}

const API = 'https://api.github.com';

async function get<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'crty.dev-build',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { headers, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`GitHub ${res.status} on ${path}`);
  return (await res.json()) as T;
}

async function stars(repo: string): Promise<number> {
  return (await get<{ stargazers_count: number }>(`/repos/${repo}`)).stargazers_count;
}

async function mergedPRs(repo: string): Promise<number> {
  const q = encodeURIComponent(`is:pr is:merged author:${githubUser} repo:${repo}`);
  return (await get<{ total_count: number }>(`/search/issues?q=${q}&per_page=1`)).total_count;
}

async function orCached<T>(label: string, live: () => Promise<T>, cached: T | undefined): Promise<T | undefined> {
  try {
    return await live();
  } catch (err) {
    console.warn(`[github] ${label}: ${(err as Error).message}, using cache`);
    return cached;
  }
}

export async function fetchGithubStats(): Promise<GithubStats> {
  const base = cache as GithubStats;
  const upstream = [...new Set(contributions.map((c) => c.repo))];
  const out: GithubStats = { fetchedAt: new Date().toISOString(), stars: {}, mergedPRs: {} };

  const s = await orCached(maintained.repo, () => stars(maintained.repo), base.stars[maintained.repo]);
  if (s !== undefined) out.stars[maintained.repo] = s;
  for (const repo of upstream) {
    const n = await orCached(repo, () => mergedPRs(repo), base.mergedPRs[repo]);
    if (n !== undefined) out.mergedPRs[repo] = n;
  }
  return out;
}

let memo: Promise<GithubStats> | undefined;

export function githubStats(): Promise<GithubStats> {
  memo ??= process.env.GITHUB_OFFLINE ? Promise.resolve(cache as GithubStats) : fetchGithubStats();
  return memo;
}
