# React App

Scaffolded Vite + React app. Run:

```bash
cd react-app
npm install
npm run dev
```

## shadcn, Tailwind, and TypeScript setup

This repo already uses Tailwind and App Router styling in `src/app/globals.css`, and the active component path is `src/components/ui` because `@/*` maps to `src/*` in [`jsconfig.json`](jsconfig.json).

If you want the canonical shadcn layout, keep the `ui` components under `src/components/ui` in this repo, or change the alias if you prefer a root-level `components/ui` folder. The folder matters because shadcn-generated imports, the helper `cn`, and the component registry all rely on a stable UI component path.

To initialize or refresh shadcn in this project:

```bash
npx shadcn@latest init
```

Suggested answers for this repo:

```bash
components path: src/components
utils path: src/lib/utils
css path: src/app/globals.css
```

If TypeScript support is missing in another clone, install it with:

```bash
npm install -D typescript @types/react @types/react-dom @types/node
```

If Tailwind is missing in another clone, install and configure it with:

```bash
npx tailwindcss init -p
```

The infinite grid component is integrated at [`src/components/ui/the-infinite-grid.tsx`](src/components/ui/the-infinite-grid.tsx) and rendered through [`src/components/ui/demo.tsx`](src/components/ui/demo.tsx), with the app entry using [`src/app/page.jsx`](src/app/page.jsx).
