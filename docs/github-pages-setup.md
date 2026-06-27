# 用 GitHub Pages 發布個人履歷／Portfolio（從零開始）

GitHub Pages 是 GitHub 提供的 **免費靜態網站託管**。你的 HTML/CSS/JS 放在 repo 裡，GitHub 會自動產生一個公開網址，例如：

`https://你的帳號.github.io/career-brand/`

適合 career-brand 這類 **純靜態** 產出（`output/resume/resume_zh.html` 或未來的 portfolio 站）。

---

## 你需要準備什麼

1. **GitHub 帳號**（免費即可）
2. 本機已安裝 **Git**
3. career-brand 專案已能 `npm run build`

---

## 方案 A：最簡單——只發布履歷 HTML（推薦先從這個開始）

### 步驟 1：在 GitHub 建立 repo

1. 登入 [github.com](https://github.com)
2. 右上角 **+ → New repository**
3. Repository name 例如：`career-brand`（或 `resume`、`portfolio`）
4. 選 **Public**（Private repo 的 Pages 在免費方案有限制）
5. **不要**勾選 README（若本機已有專案）
6. Create repository

### 步驟 2：本機推送 career-brand

在 Terminal：

```bash
cd ~/Documents/career-brand

# 若尚未 init
git init
git add .
git commit -m "Initial career-brand setup"

# 把 YOUR_USERNAME 換成你的 GitHub 帳號
git remote add origin git@github.com:YOUR_USERNAME/career-brand.git
git branch -M main
git push -u origin main
```

> 若你偏好 HTTPS：`https://github.com/YOUR_USERNAME/career-brand.git`

### 步驟 3：決定「網站要從哪個資料夾發布」

GitHub Pages 有三種常見做法：

| 做法 | 說明 | 適合 |
|------|------|------|
| **`/docs` 資料夾** | repo 根目錄下有 `docs/index.html` | 簡單、與原始碼同 repo |
| **`/ (root)`** | 整個 repo 根目錄當網站 | 專門的靜態站 repo |
| **GitHub Actions** | build 完把 `output/` 推到 `gh-pages` 分支 | career-brand 這種需先 build 的流程 |

**對 career-brand 最乾淨的做法：GitHub Actions 自動 build + 部署。**

### 步驟 4：加入 GitHub Actions 工作流程

在專案建立檔案 `.github/workflows/pages.yml`：

```yaml
name: Deploy resume to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - run: npm ci
      - run: npm run build

      # 把 build 產物當成網站根目錄
      - uses: actions/upload-pages-artifact@v3
        with:
          path: output/resume

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

推送後：

```bash
git add .github/workflows/pages.yml
git commit -m "Add GitHub Pages deploy workflow"
git push
```

### 步驟 5：在 GitHub 開啟 Pages

1. 進入 repo → **Settings**
2. 左側 **Pages**
3. **Build and deployment → Source** 選 **GitHub Actions**（不是 Deploy from a branch）
4. 等 Actions 跑完（repo 的 **Actions** 分頁可看進度）
5. Settings → Pages 會顯示網址，例如：  
   `https://YOUR_USERNAME.github.io/career-brand/`

此時 `resume_zh.html` 的完整網址是：

`https://YOUR_USERNAME.github.io/career-brand/resume_zh.html`

若希望首頁直接開履歷，可在 build 腳本多加一行複製：

```javascript
// build.mjs 末尾：複製一份當 index.html
fs.copyFileSync(path.join(OUT, "resume/resume_zh.html"), path.join(OUT, "resume/index.html"));
```

之後訪問 `https://YOUR_USERNAME.github.io/career-brand/` 就會直接看到中文版。

---

## 方案 B：手動、不用 Actions（適合想先試水溫）

1. 本機執行 `npm run build`
2. 把 `output/resume/` 裡的 HTML 複製到 repo 的 `docs/`：

```bash
mkdir -p docs
cp output/resume/resume_zh.html docs/index.html
cp output/resume/resume_en.html docs/resume_en.html
```

3. 推送：

```bash
git add docs/
git commit -m "Publish resume to docs/"
git push
```

4. GitHub → Settings → Pages → Source 選 **Deploy from a branch**
5. Branch: `main`，Folder: **`/docs`**
6. Save，等 1–3 分鐘

網址：`https://YOUR_USERNAME.github.io/career-brand/`

**缺點**：每次改 JSON 都要手動 build + 複製 + push。長期仍建議用方案 A。

---

## 自訂網域（選用）

若你有自己的網域（例如 `yongzheng.dev`）：

1. 向網域商設定 DNS：
   - `CNAME` 子網域 `www` → `YOUR_USERNAME.github.io`
   - 或 `A` record 指向 GitHub Pages IP（見 [GitHub 官方文件](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)）
2. repo → Settings → Pages → **Custom domain** 填入網域
3. 勾選 **Enforce HTTPS**

---

## 常見問題

### Q：Private repo 可以用嗎？
GitHub 免費方案下，**Public repo 的 Pages 完全免費**。Private repo 需付費方案才能對外開 Pages。

### Q：會不會把 `data/` 裡的 JSON 也公開？
會。整個 repo 都是公開的（Public）。若 JSON 含不宜公開的客戶名，請維持 **匿名化**（career-brand 已對 in-house 專案這樣處理）。  
若只想公開 HTML、不公開原始 JSON，可用 **獨立 repo** 只放 `docs/` 或 `gh-pages` 分支產物。

### Q：和 Cloudflare Pages 差在哪？
| | GitHub Pages | Cloudflare Pages |
|---|--------------|------------------|
| 費用 | 免費 | 免費 |
| 與 repo 整合 | 極佳 | 需連 GitHub |
| 速度 | 夠用 | 通常更快（CDN） |
| 自訂網域 | 支援 | 支援 |

兩者對靜態履歷都夠用；你已用 GitHub 的話，Pages 最省事。

### Q：更新履歷後要做什麼？
- **方案 A（Actions）**：改 JSON → `git push` → Actions 自動 build + 部署
- **方案 B（docs 手動）**：改 JSON → `npm run build` → 複製到 `docs/` → `git push`

---

## 建議的下一步（Phase 3）

目前 `output/resume/` 是單頁履歷。之後可做：

1. 獨立的 portfolio 首頁（專案卡片 + 連結）
2. `npm run build` 產出整站至 `output/site/`
3. 同一套 GitHub Actions 改 `path: output/site`

到時網址結構可以是：

```
https://YOUR_USERNAME.github.io/career-brand/          ← 首頁
https://YOUR_USERNAME.github.io/career-brand/resume/   ← 履歷
https://YOUR_USERNAME.github.io/career-brand/projects/ledgerflow/
```

---

## 參考連結

- [GitHub Pages 官方文件](https://docs.github.com/en/pages)
- [GitHub Actions 部署 Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow)
