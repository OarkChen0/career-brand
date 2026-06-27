#!/usr/bin/env node
/**
 * career-brand build pipeline
 * Usage: npm run build
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "data");
const OUT = path.join(ROOT, "output");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function loadData() {
  const projectsDir = path.join(DATA, "projects");
  const projects = fs
    .readdirSync(projectsDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => readJson(path.join(projectsDir, f)));

  return {
    profile: readJson(path.join(DATA, "profile.json")),
    timeline: readJson(path.join(DATA, "timeline.json")),
    skills: readJson(path.join(DATA, "skills.json")),
    education: readJson(path.join(DATA, "education.json")),
    certificates: readJson(path.join(DATA, "certificates.json")),
    highlights: readJson(path.join(DATA, "highlights.json")),
    projects,
  };
}

function t(obj, lang) {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[lang] ?? obj.en ?? obj.zh ?? "";
}

function fmtRange(start, end, lang) {
  const endStr = end ? end.replace("-", "/") : lang === "zh" ? "至今" : "Present";
  return `${start.replace("-", "/")} — ${endStr}`;
}

function statusVerb(status, lang) {
  const map = {
    completed: { zh: "完成", en: "Delivered" },
    in_progress: { zh: "進行中", en: "In progress" },
    planning: { zh: "規劃中", en: "Planning" },
    discontinued: { zh: "已結束", en: "Discontinued" },
  };
  return map[status]?.[lang] ?? status;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeOut(rel, content) {
  const full = path.join(OUT, rel);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, content, "utf8");
  console.log(`  ✓ output/${rel}`);
}

function renderAts(data, lang) {
  const { profile, timeline, skills, education, certificates, projects } = data;
  const featured = projects.filter((p) => p.featured);
  const side = projects.filter((p) => p.type === "side" && p.featured);

  const lines = [];
  lines.push(`# ${t(profile.name, lang)}`);
  lines.push(t(profile.headline, lang));
  lines.push("");
  lines.push(`${profile.contact.email} | ${profile.contact.phone} | ${t(profile.contact.location, lang)}`);
  lines.push("");
  lines.push(lang === "zh" ? "## Professional Summary" : "## Professional Summary");
  profile.summary[lang].forEach((p) => lines.push(p));
  lines.push("");
  lines.push("## Skills");
  skills.domains.forEach((d) => {
    lines.push(`${t(d.label, lang)}: ${d.items.join(", ")}`);
  });
  lines.push("");
  lines.push("## Professional Experience");
  timeline.forEach((job) => {
    const title = t(job.titleBrand || job.title, lang);
    lines.push("");
    lines.push(`### ${title} | ${t(job.company, lang)}`);
    lines.push(fmtRange(job.start, job.end, lang));
    lines.push(t(job.summary, lang));
    if (job.projectIds) {
      job.projectIds.forEach((pid) => {
        const p = projects.find((x) => x.id === pid);
        if (!p) return;
        lines.push("");
        lines.push(`${t(p.name, lang)} (${statusVerb(p.status, lang)})`);
        lines.push(`Problem: ${t(p.problem, lang)}`);
        lines.push(`Solution: ${t(p.solution, lang)}`);
        p.achievements?.forEach((a) => {
          const metric = a.metric ? ` [${a.metric}]` : "";
          lines.push(`- ${t(a.text, lang)}${metric}`);
        });
      });
    }
  });
  lines.push("");
  lines.push("## Featured Side Projects");
  side.forEach((p) => {
    lines.push("");
    lines.push(`### ${t(p.name, lang)}`);
    lines.push(t(p.problem, lang));
    p.achievements?.forEach((a) => lines.push(`- ${t(a.text, lang)}`));
    p.links?.forEach((l) => lines.push(`- ${l.label}: ${l.url}`));
  });
  lines.push("");
  lines.push("## Education");
  education.forEach((e) => {
    lines.push(`${t(e.school, lang)} — ${t(e.degree, lang)} (${e.start} — ${e.end})`);
  });
  if (certificates.length) {
    lines.push("");
    lines.push("## Certificates");
    certificates.forEach((c) => lines.push(`- ${c.name}`));
  }
  lines.push("");
  lines.push(`Last updated: ${profile.lastUpdated}`);
  return lines.join("\n");
}

function renderLinkedIn(data, lang) {
  const { profile, highlights, projects } = data;
  const featured = projects.filter((p) => p.featured && p.type === "work").slice(0, 3);

  const lines = [];
  lines.push(t(profile.headline, lang));
  lines.push("");
  profile.summary[lang].forEach((p) => lines.push(p));
  lines.push("");
  lines.push(lang === "zh" ? "【亮点】" : "Highlights");
  highlights.items.slice(0, 4).forEach((h) => {
    lines.push(`• ${h.value} ${t(h.label, lang)}`);
  });
  lines.push("");
  lines.push(lang === "zh" ? "【代表專案】" : "Featured work");
  featured.forEach((p) => {
    lines.push(`• ${t(p.name, lang)} — ${t(p.solution, lang)}`);
  });
  return lines.join("\n");
}

function renderGitHubReadme(data) {
  const { profile, skills, projects } = data;
  const featured = projects.filter((p) => p.featured);

  const lines = [];
  lines.push(`# Hi, I'm ${t(profile.name, "en")} 👋`);
  lines.push("");
  lines.push(`**${t(profile.headline, "en")}**`);
  lines.push("");
  profile.summary.en.forEach((p) => lines.push(p));
  lines.push("");
  lines.push("## Featured Projects");
  featured.forEach((p) => {
    lines.push(`- **${t(p.name, "en")}** (${p.status}) — ${t(p.solution, "en")}`);
    p.links?.forEach((l) => lines.push(`  - [${l.label}](${l.url})`));
  });
  lines.push("");
  lines.push("## Skills");
  skills.domains.forEach((d) => {
    lines.push(`- **${d.label.en}:** ${d.items.join(", ")}`);
  });
  lines.push("");
  lines.push("## Contact");
  lines.push(`- Email: ${profile.contact.email}`);
  lines.push("");
  lines.push(`> Generated from [career-brand](https://github.com/) — \`npm run build\``);
  return lines.join("\n");
}

function renderBrandHtml(data, lang) {
  const { profile, timeline, skills, education, certificates, highlights, projects } = data;
  const featuredWork = projects.filter((p) => p.featured && p.type === "work");
  const featuredSide = projects.filter((p) => p.featured && p.type === "side");

  const skillRows = skills.domains
    .map(
      (d) =>
        `<div class="skill-row"><span class="label">${t(d.label, lang)}</span><span>${d.items.join(" · ")}</span></div>`
    )
    .join("");

  const highlightPills = highlights.domains
    .map((d) => `<span class="pill">${t(d, lang)}</span>`)
    .join("");

  const statCards = highlights.items
    .slice(0, 4)
    .map((h) => `<div class="stat"><strong>${h.value}</strong><span>${t(h.label, lang)}</span></div>`)
    .join("");

  const jobs = timeline
    .map((job) => {
      const related = (job.projectIds || [])
        .map((id) => projects.find((p) => p.id === id))
        .filter(Boolean)
        .map(
          (p) => `
        <div class="project">
          <h4>${t(p.name, lang)} <small>(${statusVerb(p.status, lang)})</small></h4>
          <p><em>${t(p.problem, lang)}</em></p>
          <p>${t(p.solution, lang)}</p>
          <ul>${(p.achievements || []).map((a) => `<li>${t(a.text, lang)}${a.metric ? ` <strong>${a.metric}</strong>` : ""}</li>`).join("")}</ul>
        </div>`
        )
        .join("");
      return `
      <article class="job">
        <div class="job-head">
          <div><strong>${t(job.titleBrand || job.title, lang)}</strong> · ${t(job.company, lang)}</div>
          <time>${fmtRange(job.start, job.end, lang)}</time>
        </div>
        <p>${t(job.summary, lang)}</p>
        ${related}
      </article>`;
    })
    .join("");

  const side = featuredSide
    .map(
      (p) => `
    <article class="project">
      <h4>${t(p.name, lang)}</h4>
      <p>${t(p.solution, lang)}</p>
      <div class="links">${(p.links || []).map((l) => `<a href="${l.url}">${l.label}</a>`).join("")}</div>
    </article>`
    )
    .join("");

  const edu = education
    .map((e) => `<p><strong>${t(e.school, lang)}</strong> — ${t(e.degree, lang)} (${e.start} — ${e.end})</p>`)
    .join("");

  const cert = certificates.map((c) => `<p>${c.name}</p>`).join("");

  return `<!DOCTYPE html>
<html lang="${lang === "zh" ? "zh-Hant" : "en"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t(profile.name, lang)} — Resume</title>
<style>
:root { --bg:#fafafa; --text:#18181b; --muted:#71717a; --accent:#2563eb; --border:#e4e4e7; --card:#fff; }
* { box-sizing:border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang TC", sans-serif; background:var(--bg); color:var(--text); line-height:1.6; margin:0; padding:32px 20px; }
.wrap { max-width:820px; margin:0 auto; }
.hero { margin-bottom:28px; }
.hero h1 { font-size:2rem; margin:0 0 4px; letter-spacing:-0.02em; }
.hero .headline { color:var(--muted); font-size:1.05rem; margin-bottom:12px; }
.contact { color:var(--muted); font-size:0.92rem; }
.stats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin:20px 0; }
.stat { background:var(--card); border:1px solid var(--border); border-radius:10px; padding:12px; text-align:center; }
.stat strong { display:block; font-size:1.25rem; }
.stat span { font-size:0.78rem; color:var(--muted); }
.pills { display:flex; flex-wrap:wrap; gap:6px; margin:12px 0 24px; }
.pill { background:#eff6ff; color:#1d4ed8; padding:4px 10px; border-radius:999px; font-size:0.8rem; font-weight:600; }
section { margin-bottom:28px; }
section h2 { font-size:0.78rem; text-transform:uppercase; letter-spacing:0.12em; color:var(--muted); border-bottom:1px solid var(--border); padding-bottom:6px; margin-bottom:14px; }
.summary p { margin:0 0 10px; }
.skill-row { display:flex; gap:12px; padding:6px 0; border-bottom:1px solid var(--border); font-size:0.92rem; }
.skill-row .label { min-width:110px; font-weight:600; color:var(--accent); flex-shrink:0; }
.job, .project { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:12px; }
.job-head { display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:8px; }
.job-head time { color:var(--muted); font-size:0.85rem; }
.project h4 { margin:0 0 6px; font-size:0.95rem; }
.project small { color:var(--muted); font-weight:400; }
.links a { display:inline-block; margin-right:8px; color:var(--accent); font-size:0.85rem; }
footer { text-align:center; color:var(--muted); font-size:0.78rem; margin-top:32px; }
@media print { body { background:#fff; padding:0; } .job, .project, .stat { break-inside:avoid; } }
</style>
</head>
<body>
<div class="wrap">
  <header class="hero">
    <h1>${t(profile.name, lang)}</h1>
    <div class="headline">${t(profile.headline, lang)}</div>
    <div class="contact">${profile.contact.email} · ${profile.contact.phone} · ${t(profile.contact.location, lang)}</div>
  </header>

  <div class="stats">${statCards}</div>
  <div class="pills">${highlightPills}</div>

  <section>
    <h2>${lang === "zh" ? "Professional Summary" : "Professional Summary"}</h2>
    <div class="summary">${profile.summary[lang].map((p) => `<p>${p}</p>`).join("")}</div>
  </section>

  <section>
    <h2>${lang === "zh" ? "Skills" : "Skills"}</h2>
    ${skillRows}
  </section>

  <section>
    <h2>${lang === "zh" ? "Experience" : "Experience"}</h2>
    ${jobs}
  </section>

  <section>
    <h2>${lang === "zh" ? "Side Projects" : "Side Projects"}</h2>
    ${side}
  </section>

  <section>
    <h2>${lang === "zh" ? "Education" : "Education"}</h2>
    ${edu}
    ${cert ? `<h2 style="margin-top:16px">${lang === "zh" ? "Certificates" : "Certificates"}</h2>${cert}` : ""}
  </section>

  <footer>Last updated: ${profile.lastUpdated}</footer>
</div>
</body>
</html>`;
}

function tryPdf(htmlPath, pdfPath) {
  const chromePaths = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ];
  const chrome = chromePaths.find((p) => fs.existsSync(p));
  if (!chrome) {
    console.log("  ⚠ PDF skipped (Chrome not found). Open HTML and print, or install Chrome.");
    return;
  }
  const r = spawnSync(
    chrome,
    ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${pdfPath}`, `file://${htmlPath}`],
    { stdio: "inherit" }
  );
  if (r.status === 0) console.log(`  ✓ output/${path.relative(OUT, pdfPath)}`);
}

function main() {
  console.log("Building career-brand...\n");
  const data = loadData();

  writeOut("resume/ats_resume.md", renderAts(data, "en"));
  writeOut("resume/ats_resume_zh.md", renderAts(data, "zh"));

  const htmlZh = renderBrandHtml(data, "zh");
  const htmlEn = renderBrandHtml(data, "en");
  writeOut("resume/resume_zh.html", htmlZh);
  writeOut("resume/resume_en.html", htmlEn);

  writeOut("linkedin/linkedin_summary_zh.md", renderLinkedIn(data, "zh"));
  writeOut("linkedin/linkedin_summary_en.md", renderLinkedIn(data, "en"));
  writeOut("github/profile_readme.md", renderGitHubReadme(data));

  console.log("\nPDF generation:");
  tryPdf(path.join(OUT, "resume/resume_zh.html"), path.join(OUT, "resume/resume_zh.pdf"));
  tryPdf(path.join(OUT, "resume/resume_en.html"), path.join(OUT, "resume/resume_en.pdf"));

  console.log("\nDone.");
}

main();
