#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = ["profile.json", "timeline.json", "skills.json", "education.json"];

let ok = true;
for (const f of required) {
  const p = path.join(ROOT, "data", f);
  if (!fs.existsSync(p)) {
    console.error(`Missing: data/${f}`);
    ok = false;
  }
}

const projectsDir = path.join(ROOT, "data", "projects");
if (!fs.existsSync(projectsDir) || !fs.readdirSync(projectsDir).filter((f) => f.endsWith(".json")).length) {
  console.error("Missing: data/projects/*.json");
  ok = false;
}

if (ok) console.log("Validation passed.");
else process.exit(1);
