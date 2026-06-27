# career-brand

**Single Source of Truth** for resume, ATS export, LinkedIn, GitHub README, and (future) portfolio site.

## What is ATS?

**ATS（Applicant Tracking System）** = 企業用來 **收履歷、搜尋、篩選** 的系統。  
104、Cake、LinkedIn Easy Apply、外商 HR 後台背後多半都有類似機制。

| 版本 | 檔案 | 用途 |
|------|------|------|
| **ATS 版** | `output/resume/ats_resume.md` | 純文字、單欄、關鍵字清楚；適合 104 AI 匯入、獵頭、外商 ATS |
| **Brand 版** | `output/resume/resume_zh.html` / `.pdf` | 給人類閱讀；Email、面試、主管評估 |
| **英文 Brand** | `output/resume/resume_en.html` / `.pdf` | 新加坡、遠端、外商 |

> ATS 版 **不是** 給人看的精美排版，而是給 **系統與 AI 讀懂** 的版本。

## Quick Start

```bash
cd ~/Documents/career-brand
npm run validate
npm run build
```

產出目錄：`output/`

```
output/
├── resume/
│   ├── ats_resume.md          # 英文 ATS（主投外商）
│   ├── ats_resume_zh.md       # 中文 ATS（104 AI 匯入）
│   ├── resume_zh.html / .pdf
│   └── resume_en.html / .pdf
├── linkedin/
│   ├── linkedin_summary_zh.md
│   └── linkedin_summary_en.md
└── github/
    └── profile_readme.md
```

## 如何更新

1. 編輯 `data/` 下的 JSON（新增 Side Project → `data/projects/xxx.json`）
2. 執行 `npm run build`
3. 所有輸出同步更新

## 資料結構

```
data/
├── profile.json       # 姓名、定位、摘要、聯絡方式
├── timeline.json      # 工作經歷
├── skills.json        # 技能分類
├── highlights.json    # Career highlights 數字與領域
├── education.json
├── certificates.json
└── projects/          # 每個專案一個 JSON
```

### 專案 status 欄位（重要）

| status | 意思 | 履歷用詞 |
|--------|------|----------|
| `completed` | 已完成 | 完成、交付 |
| `in_progress` | 進行中 | 進行中 |
| `planning` | 規劃階段 | 規劃、架構設計 |
| `discontinued` | 已結束／下架 | 已結束 |

**絕不夸大**：規劃中的專案必須標 `planning` 或 `in_progress`。

## 定位

對外主標：**Senior Product Engineer · Mobile × Backend × AI Integration**

現職英濟仍誠實標示為 Engineering Manager，並在摘要中強調 Product & Architecture。

## 部署個人網站（Phase 3）

Portfolio 靜態站建置完成後，可部署至：

| 平台 | 建議 |
|------|------|
| **Cloudflare Pages** | 推薦：免費、快、自訂網域簡單 |
| **GitHub Pages** | 推薦：與 repo 整合佳 |
| **Firebase Hosting** | 可用：你已有 LedgerFlow 經驗，但職涯站不必綁 Firebase |

> 職涯 portfolio 是 **純靜態 HTML**，任一靜態 hosting 皆可；**不必** 為此另開 Firebase 專案，除非你想全部集中在 Google 生態。

## 與 Downloads/resume 的關係

`~/Downloads/resume/` 為早期手動版（含活潑雙欄等）。  
本 repo 為 **長期維護版**；確認穩定後可逐步取代。

## Roadmap

- [x] Phase 0: JSON 資料化
- [x] Phase 1: ATS + Brand 履歷 + LinkedIn + GitHub
- [ ] Phase 2: Interview story bank
- [ ] Phase 3: Portfolio 網站（Tailwind + dark mode）
- [ ] Phase 4: `firebase deploy` / Cloudflare 一鍵部署腳本
