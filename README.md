# super-DFMEA

Web-based DFMEA tool for V-Guard water heater innovation.

**Stack:** React 18 + React Flow + Zustand + IndexedDB + n8n + Claude API + Vercel

## Week 1: Visual Graph Editor

Parts as nodes, interfaces as edges, auto-saved to IndexedDB.

- **Add Part** — floating action button places a new part node on the canvas
- **Connect parts** — drag between node handles to create an interface (edge)
- **Edit / delete a part** — click a node to open its property modal
- **Edit / delete an interface** — click an edge to open its property modal
- **Export JSON** — download the current graph (parts + interfaces)
- **Auto-save** — every change persists to IndexedDB via Zustand's `persist` middleware, and reloads on page refresh

## Project structure

```
src/
  main.jsx                       entry point
  App.jsx                        top-level layout, wires everything together
  index.css                      global styles
  store/
    dfmeaStore.js                Zustand store (parts/interfaces state, CRUD, IndexedDB persistence)
  components/
    GraphCanvas.jsx              React Flow canvas
    PartNode.jsx                 custom node renderer for parts
    FloatingActionButtons.jsx    Add Part / Export JSON
    PartPropertyModal.jsx        edit/delete a part
    InterfacePropertyModal.jsx   edit/delete an interface
```

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run lint
```

## Deploy to Vercel

This is a static Vite build, so Vercel needs no special config beyond the defaults
(`npm run build`, output directory `dist`). To deploy:

```bash
npm i -g vercel
vercel login
vercel --prod
```

Or connect the GitHub repo at [vercel.com/new](https://vercel.com/new) and Vercel will
auto-detect the Vite framework preset.
