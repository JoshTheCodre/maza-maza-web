// MapLibre draws maps in a web worker it loads by URL, which the bundler can't follow. This copies the worker
// into public/ so the app can serve it (see setWorkerUrl in src/components/map/real-map.tsx). Runs after npm install.
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("public/maplibre", { recursive: true });
copyFileSync("node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", "public/maplibre/maplibre-gl-worker.mjs");
console.log("Copied the MapLibre worker to public/maplibre/");
