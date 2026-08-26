# Brand marks

The `[ഗ]` mark from the site nav ([`web/components/Wordmark.tsx`](../web/components/Wordmark.tsx)),
drawn as standalone art for avatars and favicons.

| File | Field | Use |
|---|---|---|
| `gargi-mark-accent` | accent `#ec3013` | GitHub org/repo avatar — the default |
| `gargi-mark-dark` | ink `#201e1d` | dark surfaces, terminal contexts |
| `gargi-mark-light` | bg `#f3f2f2` | light surfaces, docs, print |

SVG and 1024×1024 PNG of each. Colours are the `modernist.css` tokens
(`--color-accent`, `--color-text`, `--color-bg`).

The ഗ is Malayalam Sangam MN Bold converted to outlines, so nothing here needs
a Malayalam font installed to render. The brackets are drawn geometry, not type
— they hold their weight down to ~32px, which `[` and `]` set in Archivo do not.
