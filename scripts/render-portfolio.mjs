/**
 * Phase 3: Portfolio static site (Tailwind CDN + dark mode)
 */

function t(obj, lang) {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[lang] ?? obj.en ?? obj.zh ?? "";
}

function statusBadge(status, lang) {
  const map = {
    completed: { zh: "已完成", en: "Completed", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
    in_progress: { zh: "進行中", en: "In progress", cls: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
    planning: { zh: "規劃中", en: "Planning", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
    discontinued: { zh: "已結束", en: "Concluded", cls: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400" },
  };
  const s = map[status] ?? { zh: status, en: status, cls: "bg-zinc-500/15 text-zinc-600" };
  return `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}">${s[lang]}</span>`;
}

function fmtRange(start, end, lang) {
  const endStr = end ? end.replace("-", "/") : lang === "zh" ? "至今" : "Present";
  return `${start.replace("-", "/")} — ${endStr}`;
}

/** Relative URLs from each generated page location */
function getPaths({ lang, page, projectId }) {
  if (page === "home") {
    if (lang === "zh") {
      return {
        home: "./",
        resume: "resume/",
        langSwitch: { href: "en/", label: "EN" },
        projectHref: (id) => `projects/${id}.html`,
      };
    }
    return {
      home: "./",
      resume: "../resume/",
      langSwitch: { href: "../", label: "中文" },
      projectHref: (id) => `projects/${id}.html`,
    };
  }

  if (lang === "zh") {
    return {
      home: "../",
      resume: "../resume/",
      langSwitch: { href: `../en/projects/${projectId}.html`, label: "EN" },
      backHome: "../",
    };
  }
  return {
    home: "../",
    resume: "../../resume/",
    langSwitch: { href: `../../projects/${projectId}.html`, label: "中文" },
    backHome: "../",
  };
}

function siteShell({ title, lang, content, paths }) {
  return `<!DOCTYPE html>
<html lang="${lang === "zh" ? "zh-Hant" : "en"}" class="scroll-smooth">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = { darkMode: 'class' };
  (function() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && matchMedia('(prefers-color-scheme: dark)').matches))
      document.documentElement.classList.add('dark');
  })();
</script>
<style>
  .prose-link { color: rgb(37 99 235); text-decoration: none; }
  .prose-link:hover { text-decoration: underline; }
  .dark .prose-link { color: rgb(96 165 250); }
</style>
</head>
<body class="bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased min-h-screen">
<header class="sticky top-0 z-50 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur">
  <nav class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 text-sm">
    <a href="${paths.home}" class="font-semibold tracking-tight">${lang === "zh" ? "首頁" : "Home"}</a>
    <div class="flex items-center gap-3">
      <a href="${paths.resume}" class="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">${lang === "zh" ? "履歷" : "Resume"}</a>
      <a href="${paths.langSwitch.href}" class="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">${paths.langSwitch.label}</a>
      <button type="button" id="theme-toggle" class="rounded-lg border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-xs" aria-label="Toggle theme">🌓</button>
    </div>
  </nav>
</header>
<main class="mx-auto max-w-5xl px-4 py-10">
${content}
</main>
<footer class="border-t border-zinc-200 dark:border-zinc-800 py-8 text-center text-xs text-zinc-500">
  <p>Built from career-brand · Last updated ${new Date().getFullYear()}</p>
</footer>
<script>
document.getElementById('theme-toggle')?.addEventListener('click', () => {
  const html = document.documentElement;
  const dark = html.classList.toggle('dark');
  localStorage.setItem('theme', dark ? 'dark' : 'light');
});
</script>
</body>
</html>`;
}

function renderHome(data, lang) {
  const paths = getPaths({ lang, page: "home" });
  const { profile, highlights, projects, skills } = data;
  const featured = projects.filter((p) => p.featured);
  const statCards = highlights.items
    .slice(0, 4)
    .map(
      (h) => `
    <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-center">
      <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">${h.value}</div>
      <div class="mt-1 text-xs text-zinc-500">${t(h.label, lang)}</div>
    </div>`
    )
    .join("");

  const domainPills = highlights.domains
    .map(
      (d) =>
        `<span class="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">${t(d, lang)}</span>`
    )
    .join("");

  const projectCards = featured
    .map((p) => {
      const href = paths.projectHref(p.id);
      return `
    <a href="${href}" class="group block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 transition hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5">
      <div class="mb-2 flex items-center justify-between gap-2">
        <h3 class="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">${t(p.name, lang)}</h3>
        ${statusBadge(p.status, lang)}
      </div>
      <p class="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">${t(p.solution, lang)}</p>
      <div class="mt-3 flex flex-wrap gap-1.5">
        ${(p.technologies || []).slice(0, 4).map((tech) => `<span class="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400">${tech}</span>`).join("")}
      </div>
    </a>`;
    })
    .join("");

  const skillSummary = skills.domains
    .slice(0, 4)
    .map(
      (d) => `
    <div class="border-b border-zinc-100 dark:border-zinc-800 py-3 last:border-0">
      <div class="text-sm font-medium text-blue-600 dark:text-blue-400">${t(d.label, lang)}</div>
      <div class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">${d.items.slice(0, 6).join(" · ")}</div>
    </div>`
    )
    .join("");

  const content = `
  <section class="mb-12">
    <p class="text-sm font-medium text-blue-600 dark:text-blue-400">${t(profile.headline, lang)}</p>
    <h1 class="mt-2 text-4xl font-bold tracking-tight">${t(profile.name, lang)}</h1>
    <div class="mt-4 max-w-2xl space-y-3 text-zinc-600 dark:text-zinc-400">
      ${profile.summary[lang].map((p) => `<p>${p}</p>`).join("")}
    </div>
    <div class="mt-6 flex flex-wrap gap-3">
      <a href="${paths.resume}" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">${lang === "zh" ? "查看履歷" : "View Resume"}</a>
      <a href="${paths.resume}resume_en.html" class="rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900">English Resume</a>
    </div>
    <p class="mt-4 text-sm text-zinc-500">${t(profile.contact.publicNote, lang) || t(profile.contact.location, lang)}</p>
  </section>

  <section class="mb-12">
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">${statCards}</div>
    <div class="mt-4 flex flex-wrap gap-2">${domainPills}</div>
  </section>

  <section class="mb-12">
    <h2 class="mb-4 text-lg font-semibold">${lang === "zh" ? "代表專案" : "Featured Projects"}</h2>
    <div class="grid gap-4 sm:grid-cols-2">${projectCards}</div>
  </section>

  <section>
    <h2 class="mb-4 text-lg font-semibold">${lang === "zh" ? "核心技能" : "Core Skills"}</h2>
    <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">${skillSummary}</div>
  </section>`;

  return siteShell({
    title: `${t(profile.name, lang)} — Portfolio`,
    lang,
    content,
    paths,
  });
}

function renderProjectPage(data, project, lang) {
  const paths = getPaths({ lang, page: "project", projectId: project.id });
  const { profile, timeline } = data;
  const job = timeline.find((j) => j.projectIds?.includes(project.id));
  const achievements = (project.achievements || [])
    .map((a) => {
      const metric = a.metric ? ` <strong class="text-blue-600 dark:text-blue-400">${a.metric}</strong>` : "";
      return `<li class="text-zinc-600 dark:text-zinc-400">${t(a.text, lang)}${metric}</li>`;
    })
    .join("");

  const links = (project.links || [])
    .map((l) => `<a href="${l.url}" class="prose-link text-sm" target="_blank" rel="noopener">${l.label} ↗</a>`)
    .join(" · ");

  const responsibilities = project.responsibilities
    ? `<ul class="mt-2 list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-400">${t(project.responsibilities, lang).map((r) => `<li>${r}</li>`).join("")}</ul>`
    : "";

  const note = project.note
    ? `<p class="mt-4 rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">${t(project.note, lang)}</p>`
    : "";

  const content = `
  <a href="${paths.backHome}" class="mb-6 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">← ${lang === "zh" ? "返回首頁" : "Back to home"}</a>

  <div class="mb-2 flex flex-wrap items-center gap-3">
    <h1 class="text-3xl font-bold">${t(project.name, lang)}</h1>
    ${statusBadge(project.status, lang)}
  </div>

  ${job ? `<p class="text-sm text-zinc-500">${t(job.titleBrand || job.title, lang)} · ${fmtRange(job.start, job.end, lang)}</p>` : ""}

  <div class="mt-6 flex flex-wrap gap-2">
    ${(project.technologies || []).map((tech) => `<span class="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs">${tech}</span>`).join("")}
  </div>

  <section class="mt-8 space-y-6">
    <div>
      <h2 class="text-sm font-semibold uppercase tracking-wide text-zinc-500">${lang === "zh" ? "問題" : "Problem"}</h2>
      <p class="mt-2 text-zinc-700 dark:text-zinc-300">${t(project.problem, lang)}</p>
    </div>
    <div>
      <h2 class="text-sm font-semibold uppercase tracking-wide text-zinc-500">${lang === "zh" ? "方案" : "Solution"}</h2>
      <p class="mt-2 text-zinc-700 dark:text-zinc-300">${t(project.solution, lang)}</p>
    </div>
    ${
      responsibilities
        ? `<div><h2 class="text-sm font-semibold uppercase tracking-wide text-zinc-500">${lang === "zh" ? "職責" : "Responsibilities"}</h2>${responsibilities}</div>`
        : ""
    }
    ${
      achievements
        ? `<div><h2 class="text-sm font-semibold uppercase tracking-wide text-zinc-500">${lang === "zh" ? "成果" : "Outcomes"}</h2><ul class="mt-2 space-y-2">${achievements}</ul></div>`
        : ""
    }
    ${links ? `<div class="flex flex-wrap gap-3 pt-2">${links}</div>` : ""}
    ${note}
  </section>`;

  return siteShell({
    title: `${t(project.name, lang)} — ${t(profile.name, lang)}`,
    lang,
    content,
    paths,
  });
}

export function renderPortfolioSite(data) {
  const featured = data.projects.filter((p) => p.featured);
  const outputs = [];

  outputs.push({ path: "site/index.html", content: renderHome(data, "zh") });
  outputs.push({ path: "site/en/index.html", content: renderHome(data, "en") });

  for (const p of featured) {
    outputs.push({ path: `site/projects/${p.id}.html`, content: renderProjectPage(data, p, "zh") });
    outputs.push({ path: `site/en/projects/${p.id}.html`, content: renderProjectPage(data, p, "en") });
  }

  return outputs;
}
