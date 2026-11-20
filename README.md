# Pasindu Dilakshana — Portfolio

React + Vite + Tailwind + Framer Motion, with a built-in **content dashboard** at `/admin/`, so adding projects or achievements never means editing code.

## Run it

```bash
npm install
npm run dev
```

- Site: http://localhost:5173
- Dashboard: http://localhost:5173/admin/

## Where content lives

Everything on the site (profile, about text, skills, projects, achievements, stats, links, contact text, SEO) is in **one file**:

```
src/content/content.json
```

The components only read from it. You edit it through the dashboard.

## Using the dashboard

The dashboard picks a save mode automatically:

| Where you open `/admin/` | What "Save" does |
|---|---|
| `npm run dev` on your laptop | **Save** writes straight into `src/content/content.json`, and uploads go to `public/uploads/`. The site refreshes instantly. Commit and push with git as usual. |
| Your deployed site (e.g. `yoursite.vercel.app/admin/`) | **Publish** makes one commit to your GitHub repo (content + any uploaded images). Vercel / Netlify redeploys automatically, usually within a minute. |
| Not connected | **Export** downloads `content.json`; replace the file in `src/content/` yourself. |

### Connect GitHub (one time, for publishing from anywhere)

1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token
2. Repository access → **Only select repositories** → your portfolio repo
3. Permissions → Repository → **Contents: Read and write** (nothing else)
4. Open `/admin/` on your live site and paste your username, repo name, branch (`main`) and the token

The token is stored only in that browser's local storage. It is never in the site code, so visitors who open `/admin/` can't change anything.

### What you can do

- **Projects:** add, edit, reorder, duplicate, delete, *feature* (big card at top) or *hide* (keeps it as a draft). Each project has a card summary, full description, highlights, tags, demo/GitHub links, cover image upload, icon and cover colour.
- **Achievements:** certifications, awards, competitions, academic results and more, with issuer, date, verify link and certificate image. Featured ones show as big badge cards.
- **Skills:** groups with 1–3 "signal bar" levels, the "also familiar with" chips, and the scrolling tools strip.
- **Profile:** headline, hero terminal words, photo, CV PDF, about paragraphs, quick facts, availability badge.
- **Links, numbers, SEO:** social links, the counter row (can auto-count projects and certifications), contact text and form endpoint, page title and description.
- **Preview:** opens the site with your unsaved edits; it updates live as you type.
- **Ctrl/Cmd + S** saves or publishes. Unsaved edits are auto-kept in the browser, so a refresh doesn't lose them.

Images are resized and converted to WebP in the browser before upload, so commits stay small.

## Build

```bash
npm run build   # outputs dist/ with the site and dist/admin/ with the dashboard
```

## Structure

```
src/
├── content/content.json     ← all site content
├── components/               ← public site sections
│   ├── Hero.jsx, NetworkCanvas.jsx (animated topology), Marquee.jsx
│   ├── About.jsx, Skills.jsx, Projects.jsx, Achievements.jsx, Contact.jsx, Footer.jsx
│   └── ui.jsx               ← shared bits (reveal, section header, spotlight)
├── admin/                    ← dashboard
│   ├── AdminApp.jsx, editors.jsx, fields.jsx
│   └── storage.js           ← local / GitHub / export save logic
└── lib/                      ← icons registry, content hook
admin/index.html              ← dashboard entry
vite.config.js                ← dev-only save API for local mode
```

## Design tokens

| Token | Value |
|---|---|
| Background | `#07090c` (ink-950) |
| Accent ("signal") | `#c6f24e` |
| Display font | Bricolage Grotesque |
| Body / mono | Geist / Geist Mono |

Fonts are self-hosted via `@fontsource`, so there are no Google Fonts requests.
