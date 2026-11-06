import { copyFileSync, cpSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const project = new URL("../", import.meta.url);
const dist = new URL("dist/", project);
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist);
copyFileSync(new URL("index.html", project), new URL("index.html", dist));
cpSync(fileURLToPath(new URL("assets/", project)), fileURLToPath(new URL("assets/", dist)), { recursive: true });
