# Jyut Heat

A short, addictive browser game for learning everyday Cantonese — practiced in romanization (Jyutping), no Chinese characters to read.

## Run

```bash
# If needed: export PATH="$HOME/.local/node/bin:$PATH"
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Play

1. **Start Heat** — timed Pulse Match rounds (English prompt → pick the romanized Cantonese) with combo scoring.
2. Every few matches, a **Scene Builder** asks you to assemble a sentence from romanized chunks.
3. **Results** save XP, streak, best score, and missed phrases to `localStorage`.
4. **Need to Learn** — clear weak phrases with 2 correct answers in a row.
5. **Levels** — Intermediate unlocks at 400 XP, Advanced at 1200 XP.

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run dev` | Local dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview the production build |
