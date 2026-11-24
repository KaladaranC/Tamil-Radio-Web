# ILC Tamil Radio website

Next.js 16 site with a React Three Fiber hero. Pages: `/` (landing) and `/privacy` (the policy Play Console links to).

## Run locally

```
npm install
npm run dev        # http://localhost:3000
npm run build      # what Vercel runs
```

## Deploy on Vercel

1. Push this `web` folder to GitHub as its own repository and import it in Vercel.
2. Leave **Root Directory** at the default (the repository root). The Expo app in `../app` is a separate repository and is not deployed.
3. Optional env var `NEXT_PUBLIC_STREAM_URL`: an **https** stream URL turns on the "Listen live" button.
   Browsers block http audio on an https page, so an http stream is ignored and only the app button shows.
4. After the first deploy, put `https://<your-domain>/privacy` into:
   - `app/src/config.ts` → `PRIVACY_POLICY_URL`
   - Play Console → Policy → App content → Privacy policy

## Where things are

| File | What |
|---|---|
| `src/lib/site.ts` | Contact details, Play link, stream URL. Contacts are from 2021: confirm with ILC. |
| `src/components/BroadcastScene.tsx` | The 3D scene: logo tiles, signal rings, dust. Pauses off-screen; honours reduced motion. |
| `src/components/Hero.tsx` | Hero copy, web player, lazy-loads the scene (`ssr: false`). |
| `src/app/privacy/page.tsx` | Privacy policy. Keep it in step with the Play Data safety form. |

Three.js skills used to build this live in `../.claude/skills` (see `SOURCES.md` there for provenance).
