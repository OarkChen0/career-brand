/**
 * Portfolio static site (Tailwind CDN + dark mode)
 * Staff-engineer positioning: Architecture × Product × AI-native Development
 */

function t(obj, lang) {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[lang] ?? obj.en ?? obj.zh ?? "";
}

function statusBadge(status, lang) {
  const map = {
    completed: { zh: "已完成", en: "Completed", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" },
    in_progress: { zh: "進行中", en: "In progress", cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" },
    planning: { zh: "規劃中", en: "Planning", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" },
    discontinued: { zh: "已結束", en: "Concluded", cls: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20" },
  };
  const s = map[status] ?? { zh: status, en: status, cls: "bg-zinc-500/10 text-zinc-500" };
  return `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}">${s[lang]}</span>`;
}

function fmtRange(start, end, lang) {
  const endStr = end ? end.replace("-", "/") : lang === "zh" ? "至今" : "Present";
  return `${start.replace("-", "/")} — ${endStr}`;
}

function sectionLabel(text) {
  return `<p class="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">${text}</p>`;
}

function sectionHeading(text, sub) {
  const subHtml = sub ? `<p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">${sub}</p>` : "";
  return `<h2 class="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">${text}</h2>${subHtml}`;
}

/** Relative URLs from each generated page location */
function getPaths({ lang, page, projectId }) {
  const aiNative = lang === "zh" ? "ai-native/" : "../ai-native/";
  const aiNativeEn = lang === "zh" ? "en/ai-native/" : "./";

  if (page === "home") {
    if (lang === "zh") {
      return {
        home: "./",
        resume: "resume/",
        aiNative: "ai-native/",
        langSwitch: { href: "en/", label: "EN" },
        projectHref: (id) => `projects/${id}.html`,
      };
    }
    return {
      home: "./",
      resume: "../resume/",
      aiNative: "ai-native/",
      langSwitch: { href: "../", label: "中文" },
      projectHref: (id) => `projects/${id}.html`,
    };
  }

  if (page === "ai-native") {
    if (lang === "zh") {
      return {
        home: "../",
        resume: "../resume/",
        aiNative: "./",
        langSwitch: { href: "../en/ai-native/", label: "EN" },
        backHome: "../",
      };
    }
    return {
      home: "../",
      resume: "../../resume/",
      aiNative: "./",
      langSwitch: { href: "../../ai-native/", label: "中文" },
      backHome: "../",
    };
  }

  if (lang === "zh") {
    return {
      home: "../",
      resume: "../resume/",
      aiNative: "../ai-native/",
      langSwitch: { href: `../en/projects/${projectId}.html`, label: "EN" },
      backHome: "../",
    };
  }
  return {
    home: "../",
    resume: "../../resume/",
    aiNative: "../../ai-native/",
    langSwitch: { href: `../../projects/${projectId}.html`, label: "中文" },
    backHome: "../",
  };
}

function siteShell({ title, lang, content, paths, profile }) {
  const aiNativeLabel = lang === "zh" ? "AI-native 開發" : "AI-native Development";
  const linkedin = profile?.contact?.linkedin;
  const linkedinNav = linkedin
    ? `<a href="${linkedin}" class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" target="_blank" rel="noopener noreferrer">LinkedIn</a>`
    : "";
  const linkedinFooter = linkedin
    ? `<a href="${linkedin}" class="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors" target="_blank" rel="noopener noreferrer">LinkedIn</a> · `
    : "";
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
  .flow-step::after {
    content: '';
    display: block;
    width: 1px;
    height: 1.25rem;
    margin: 0.25rem auto;
    background: rgb(161 161 170 / 0.4);
  }
  .flow-step:last-child::after { display: none; }
  @media (min-width: 768px) {
    .flow-horizontal .flow-step::after {
      display: none;
    }
    .flow-horizontal .flow-step:not(:last-child)::before {
      content: '→';
      position: absolute;
      right: -0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: rgb(161 161 170 / 0.6);
      font-size: 0.75rem;
    }
  }
</style>
</head>
<body class="bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased min-h-screen selection:bg-blue-500/20">
<header class="sticky top-0 z-50 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
  <nav class="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3.5 text-sm">
    <a href="${paths.home}" class="font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">${lang === "zh" ? "陳永政" : "Yong-Zheng Chen"}</a>
    <div class="flex items-center gap-4">
      <a href="${paths.aiNative}" class="hidden sm:inline text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">${aiNativeLabel}</a>
      ${linkedinNav}
      <a href="${paths.resume}" class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">${lang === "zh" ? "履歷" : "Resume"}</a>
      <a href="${paths.langSwitch.href}" class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">${paths.langSwitch.label}</a>
      <button type="button" id="theme-toggle" class="rounded-md border border-zinc-200 dark:border-zinc-700 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors" aria-label="Toggle theme">◐</button>
    </div>
  </nav>
</header>
<main class="mx-auto max-w-4xl px-4 py-12 sm:py-16">
${content}
</main>
<footer class="border-t border-zinc-200/60 dark:border-zinc-800/60 py-10 text-center text-xs text-zinc-400">
  <p>${linkedinFooter}${lang === "zh" ? "以工程思維打造產品" : "Building products with engineering rigor"} · ${new Date().getFullYear()}</p>
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
  const { profile, highlights, philosophy, aiWorkflow, projects, skills } = data;
  const featured = projects.filter((p) => p.featured);

  const specPills = (profile.specializations?.[lang] || [])
    .map(
      (s) =>
        `<span class="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-400">${s}</span>`
    )
    .join("");

  const statCards = highlights.items
    .map(
      (h) => `
    <div class="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-5">
      <div class="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">${h.value}</div>
      <div class="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">${t(h.label, lang)}</div>
      ${h.description ? `<div class="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">${t(h.description, lang)}</div>` : ""}
    </div>`
    )
    .join("");

  const philosophyCards = philosophy.items
    .map(
      (item) => `
    <div class="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
      <div class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">${t(item.title, lang)}</div>
      <p class="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">${t(item.description, lang)}</p>
    </div>`
    )
    .join("");

  const workflowSteps = aiWorkflow.steps
    .map(
      (step, i) => `
    <div class="flow-step relative rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4">
      <div class="flex items-start gap-3">
        <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-500">${i + 1}</span>
        <div>
          <div class="text-sm font-medium text-zinc-900 dark:text-zinc-100">${t(step.title, lang)}</div>
          <p class="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">${t(step.description, lang)}</p>
        </div>
      </div>
    </div>`
    )
    .join("");

  const projectCards = featured
    .map((p) => {
      const href = paths.projectHref(p.id);
      const teaser = t(p.businessChallenge || p.problem, lang);
      const decisions = (p.architectureDecisions || []).slice(0, 3);
      return `
    <a href="${href}" class="group block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/20 p-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
      <div class="mb-3 flex items-center justify-between gap-2">
        <h3 class="font-semibold tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${t(p.name, lang)}</h3>
        ${statusBadge(p.status, lang)}
      </div>
      <p class="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2">${teaser}</p>
      ${
        decisions.length
          ? `<div class="mt-3 flex flex-wrap gap-1.5">${decisions.map((d) => `<span class="rounded border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-xs text-zinc-500 dark:text-zinc-400">${d}</span>`).join("")}</div>`
          : ""
      }
    </a>`;
    })
    .join("");

  const skillSummary = skills.domains
    .slice(0, 4)
    .map(
      (d) => `
    <div class="border-b border-zinc-100 dark:border-zinc-800/80 py-4 last:border-0">
      <div class="text-sm font-medium text-zinc-900 dark:text-zinc-100">${t(d.label, lang)}</div>
      <div class="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">${d.items.slice(0, 6).join(" · ")}</div>
    </div>`
    )
    .join("");

  const content = `
  <!-- Hero -->
  <section class="mb-20">
    ${sectionLabel(t(profile.headline, lang))}
    <h1 class="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">${t(profile.name, lang)}</h1>
    <p class="mt-4 text-lg text-zinc-500 dark:text-zinc-400 font-light">${t(profile.tagline, lang)}</p>
    <div class="mt-6 max-w-2xl space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
      ${profile.summary[lang].map((p) => `<p>${p}</p>`).join("")}
    </div>
    <div class="mt-6 flex flex-wrap gap-2">${specPills}</div>
    <div class="mt-8 flex flex-wrap gap-3">
      <a href="${paths.resume}" class="rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">${lang === "zh" ? "查看履歷" : "View Resume"}</a>
      <a href="${paths.aiNative}" class="rounded-md border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">${lang === "zh" ? "AI-native 開發" : "AI-native Development"}</a>
      ${profile.contact.linkedin ? `<a href="${profile.contact.linkedin}" class="rounded-md border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>` : ""}
    </div>
    <p class="mt-5 text-xs text-zinc-400">${t(profile.contact.location, lang)}${profile.contact.publicNote ? ` · ${t(profile.contact.publicNote, lang)}` : ""}</p>
  </section>

  <!-- Engineering Philosophy -->
  <section class="mb-20">
    ${sectionLabel(t(philosophy.title, lang))}
    <div class="mt-4 grid gap-3 sm:grid-cols-2">${philosophyCards}</div>
  </section>

  <!-- Statistics -->
  <section class="mb-20">
    ${sectionLabel(lang === "zh" ? "經歷概覽" : "Overview")}
    <div class="mt-4 grid gap-3 sm:grid-cols-3">${statCards}</div>
  </section>

  <!-- AI Engineering Workflow -->
  <section class="mb-20">
    ${sectionLabel(t(aiWorkflow.title, lang))}
    <div class="mt-3">${sectionHeading(t(aiWorkflow.title, lang), t(aiWorkflow.subtitle, lang))}</div>
    <div class="mt-6 grid gap-2 md:grid-cols-3 flow-horizontal">${workflowSteps}</div>
    <p class="mt-6 rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">${t(aiWorkflow.note, lang)}</p>
  </section>

  <!-- Featured Projects -->
  <section class="mb-20">
    ${sectionLabel(lang === "zh" ? "代表專案" : "Featured Projects")}
    <div class="mt-4">${sectionHeading(lang === "zh" ? "代表專案" : "Featured Projects")}</div>
    <div class="mt-6 grid gap-3 sm:grid-cols-2">${projectCards}</div>
  </section>

  <!-- Core Skills -->
  <section>
    ${sectionLabel(lang === "zh" ? "核心技能" : "Core Skills")}
    <div class="mt-4 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">${skillSummary}</div>
  </section>`;

  return siteShell({
    title: `${t(profile.name, lang)} — Portfolio`,
    lang,
    content,
    paths,
    profile,
  });
}

function projectField(project, field) {
  const alt = { businessChallenge: "problem", technicalStrategy: "solution", impact: "achievements" };
  return project[field] || project[alt[field]];
}

function renderProjectPage(data, project, lang) {
  const paths = getPaths({ lang, page: "project", projectId: project.id });
  const { profile, timeline } = data;
  const job = timeline.find((j) => j.projectIds?.includes(project.id));

  const impact = (projectField(project, "impact") || [])
    .map((a) => {
      const metric = a.metric ? ` <strong class="text-zinc-900 dark:text-zinc-100">${a.metric}</strong>` : "";
      return `<li class="text-sm text-zinc-600 dark:text-zinc-400">${t(a.text, lang)}${metric}</li>`;
    })
    .join("");

  const links = (project.links || [])
    .map((l) => `<a href="${l.url}" class="prose-link text-sm" target="_blank" rel="noopener">${l.label} ↗</a>`)
    .join(" · ");

  const responsibilities = project.responsibilities
    ? `<div class="flex flex-wrap gap-2 mt-3">${t(project.responsibilities, lang).map((r) => `<span class="rounded-md border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-400">${r}</span>`).join("")}</div>`
    : "";

  const archDecisions = (project.architectureDecisions || [])
    .map((d) => `<span class="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">${d}</span>`)
    .join("");

  const note = project.note
    ? `<p class="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">${t(project.note, lang)}</p>`
    : "";

  const lessons = project.lessonsLearned
    ? `<section class="mt-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-6">
        <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">${lang === "zh" ? "經驗總結" : "Lessons Learned"}</h2>
        <p class="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 italic">${t(project.lessonsLearned, lang)}</p>
      </section>`
    : "";

  const content = `
  <a href="${paths.backHome}" class="mb-8 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">← ${lang === "zh" ? "返回首頁" : "Back to home"}</a>

  <div class="mb-2 flex flex-wrap items-center gap-3">
    <h1 class="text-3xl font-bold tracking-tight">${t(project.name, lang)}</h1>
    ${statusBadge(project.status, lang)}
  </div>

  ${job ? `<p class="text-sm text-zinc-400">${t(job.titleBrand || job.title, lang)} · ${fmtRange(job.start, job.end, lang)}</p>` : ""}

  <section class="mt-10 space-y-10">
    <div>
      ${sectionLabel(lang === "zh" ? "商業挑戰" : "Business Challenge")}
      <p class="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">${t(projectField(project, "businessChallenge"), lang)}</p>
    </div>

    <div>
      ${sectionLabel(lang === "zh" ? "技術策略" : "Technical Strategy")}
      <p class="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">${t(projectField(project, "technicalStrategy"), lang)}</p>
    </div>

    ${
      responsibilities
        ? `<div>${sectionLabel(lang === "zh" ? "我的職責" : "My Responsibilities")}${responsibilities}</div>`
        : ""
    }

    ${
      archDecisions
        ? `<div>${sectionLabel(lang === "zh" ? "架構決策" : "Architecture Decisions")}<div class="mt-3 flex flex-wrap gap-2">${archDecisions}</div></div>`
        : ""
    }

    ${
      impact
        ? `<div>${sectionLabel(lang === "zh" ? "影響與成果" : "Impact")}<ul class="mt-3 space-y-2 list-none">${impact}</ul></div>`
        : ""
    }

    ${links ? `<div class="flex flex-wrap gap-3">${links}</div>` : ""}
    ${note}
  </section>

  ${lessons}`;

  return siteShell({
    title: `${t(project.name, lang)} — ${t(profile.name, lang)}`,
    lang,
    content,
    paths,
    profile,
  });
}

function renderAiNativePage(data, lang) {
  const paths = getPaths({ lang, page: "ai-native" });
  const { profile, aiNative } = data;

  const sections = aiNative.sections
    .map((sec) => {
      let body = "";

      if (sec.diagram) {
        const steps = t(sec.diagram, lang);
        const diagramHtml = steps
          .map(
            (step, i) => `
          <div class="flex items-center gap-2">
            <span class="rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">${step}</span>
            ${i < steps.length - 1 ? '<span class="text-zinc-300 dark:text-zinc-600">→</span>' : ""}
          </div>`
          )
          .join("");
        body += `<div class="mt-4 flex flex-wrap items-center gap-2 overflow-x-auto pb-2">${diagramHtml}</div>`;
      }

      if (sec.content) {
        const items = sec.content[lang] || sec.content.en || [];
        body += `<div class="mt-4 space-y-2">${items.map((p) => `<p class="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">${p}</p>`).join("")}</div>`;
      }

      if (sec.items) {
        body += `<div class="mt-4 grid gap-3 sm:grid-cols-2">${sec.items
          .map(
            (item) => `
          <div class="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <div class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">${t(item.title, lang)}</div>
            <p class="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">${t(item.description, lang)}</p>
          </div>`
          )
          .join("")}</div>`;
      }

      return `
    <section class="border-b border-zinc-100 dark:border-zinc-800/80 pb-10 last:border-0">
      ${sectionLabel(t(sec.title, lang))}
      <h2 class="mt-2 text-lg font-semibold tracking-tight">${t(sec.title, lang)}</h2>
      ${body}
    </section>`;
    })
    .join("");

  const content = `
  <a href="${paths.backHome}" class="mb-8 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">← ${lang === "zh" ? "返回首頁" : "Back to home"}</a>

  <section class="mb-12">
    ${sectionLabel(t(aiNative.title, lang))}
    <h1 class="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">${t(aiNative.title, lang)}</h1>
    <p class="mt-4 text-lg text-zinc-500 dark:text-zinc-400 font-light">${t(aiNative.subtitle, lang)}</p>
  </section>

  <div class="space-y-10">${sections}</div>`;

  return siteShell({
    title: `${t(aiNative.title, lang)} — ${t(profile.name, lang)}`,
    lang,
    content,
    paths,
    profile,
  });
}

export function renderPortfolioSite(data) {
  const featured = data.projects.filter((p) => p.featured);
  const outputs = [];

  outputs.push({ path: "site/index.html", content: renderHome(data, "zh") });
  outputs.push({ path: "site/en/index.html", content: renderHome(data, "en") });

  outputs.push({ path: "site/ai-native/index.html", content: renderAiNativePage(data, "zh") });
  outputs.push({ path: "site/en/ai-native/index.html", content: renderAiNativePage(data, "en") });

  for (const p of featured) {
    outputs.push({ path: `site/projects/${p.id}.html`, content: renderProjectPage(data, p, "zh") });
    outputs.push({ path: `site/en/projects/${p.id}.html`, content: renderProjectPage(data, p, "en") });
  }

  return outputs;
}
