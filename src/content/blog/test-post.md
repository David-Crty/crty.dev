---
title: 'Test post: what the article layout looks like'
description: 'A draft that exercises every Markdown element the blog supports. It never ships.'
date: 2026-10-25
draft: true
---

This is a draft used to check the article layout. It is excluded from production builds, so it never appears on crty.dev. The paragraph runs long enough to show the measure: around 680 pixels, which keeps lines near seventy characters and easy to read.

## A second-level heading

Inline `code` sits in the text, and [a link](https://example.com) uses the same underline as the hero links. **Strong** and *emphasis* stay plain.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: crty-dev # a comment
spec:
  syncPolicy:
    automated: { prune: true, selfHeal: true }
```

### A third-level heading

- A list item
- Another one, with `inline code`
- A third

1. First step
2. Second step

> A blockquote: one sentence that someone said, set off from the body.

```ts
export async function stars(repo: string): Promise<number> {
  const res = await fetch(`https://api.github.com/repos/${repo}`);
  return (await res.json()).stargazers_count;
}
```

| Setting | Value |
| --- | --- |
| Cache | `max-age=0, must-revalidate` |
| Assets | `immutable` |

---

The end.
