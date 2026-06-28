/**
 * Phase 2: Interview story bank renderer
 */

function t(obj, lang) {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[lang] ?? obj.en ?? obj.zh ?? "";
}

function renderStory(story, lang, { projects, timeline } = {}) {
  const lines = [];
  const project = story.projectId ? projects?.find((p) => p.id === story.projectId) : null;
  const job = story.timelineId ? timeline?.find((j) => j.id === story.timelineId) : null;

  lines.push(`## ${t(story.title, lang)}`);
  lines.push("");
  if (project) lines.push(`**Project:** ${t(project.name, lang)}`);
  if (job) lines.push(`**Role:** ${t(job.titleBrand || job.title, lang)} @ ${t(job.company, lang)}`);
  lines.push(`**Tags:** ${story.tags.join(", ")}`);
  lines.push("");
  lines.push("### Applicable questions");
  t(story.questions, lang).forEach((q) => lines.push(`- ${q}`));
  lines.push("");
  lines.push("### STAR");
  lines.push("");
  lines.push(`**Situation** — ${t(story.star.situation, lang)}`);
  lines.push("");
  lines.push(`**Task** — ${t(story.star.task, lang)}`);
  lines.push("");
  lines.push("**Action**");
  t(story.star.action, lang).forEach((a) => lines.push(`- ${a}`));
  lines.push("");
  lines.push(`**Result** — ${t(story.star.result, lang)}`);
  if (story.followUp) {
    lines.push("");
    lines.push("### Follow-up tips");
    t(story.followUp, lang).forEach((f) => lines.push(`- ${f}`));
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  return lines;
}

export function renderStoryBank(data, lang) {
  const { profile, stories, projects, timeline } = data;
  const lines = [];

  lines.push(`# Interview Story Bank — ${t(profile.name, lang)}`);
  lines.push("");
  lines.push(
    lang === "zh"
      ? "> 本機面試準備用。STAR 格式，依專案與經歷整理。請依實際面試情境調整用詞。"
      : "> Local interview prep. STAR format from projects and experience. Adjust wording per interview context."
  );
  lines.push("");
  lines.push(`Last updated: ${profile.lastUpdated}`);
  lines.push("");

  lines.push(lang === "zh" ? "## 快速對照（常見問題 → 故事）" : "## Quick reference (question → story)");
  lines.push("");
  stories.quickReference.forEach((ref) => {
    lines.push(`### ${t(ref.question, lang)}`);
    if (ref.storyIds?.length) {
      ref.storyIds.forEach((sid) => {
        const s = stories.stories.find((x) => x.id === sid);
        if (s) lines.push(`- → **${t(s.title, lang)}**`);
      });
    }
    if (ref.note) lines.push(`- _${t(ref.note, lang)}_`);
    lines.push("");
  });

  lines.push("---");
  lines.push("");
  lines.push(lang === "zh" ? "## 完整故事" : "## Full stories");
  lines.push("");

  const byCategory = stories.categories.map((cat) => ({
    cat,
    items: stories.stories.filter((s) => s.category === cat.id),
  }));

  for (const { cat, items } of byCategory) {
    if (!items.length) continue;
    lines.push(`# ${t(cat.label, lang)}`);
    lines.push("");
    for (const story of items) {
      lines.push(...renderStory(story, lang, { projects, timeline }));
    }
  }

  return lines.join("\n");
}
