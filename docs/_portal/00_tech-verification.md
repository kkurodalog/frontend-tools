# F1 技術検証メモ（U-02 / Cody）

担当: Cody（制作部 / コーディング・技術レビュー・品質点検）
作成日: 2026-06-15
対象: frontend-tools F1 プロジェクト初期化の★技術検証3点（plan §4 U-02）
> このファイルは Mane の素材移管対象**外**（消さない）。ポータルの技術前提を記録する正本。

---

## 0. 検証環境

- Node v25 / Yarn Classic 1.22 / Vite 5.4 / vite-plugin-handlebars 2.0
- 独立 Vite プロジェクト `dev/`（`base: "/tools/"`）
- ローカルで `yarn dev`（HTTP 200 / `/` → `/tools/` 302リダイレクト確認済み）・`yarn build`（dist 生成・パス解決確認済み）まで実機検証

---

## ① `base: "/tools/"` でのリンク・アセットパス解決 — ✅ 問題なし（実機確認済み）

### 結論
`vite.config.js` に `base: "/tools/"` を設定するだけで、dev・build いずれもパスは正しく解決される。**追加の小細工は不要**。

### 確認結果（実機）
| 項目 | dev (`yarn dev`) | build (`yarn build`) |
|---|---|---|
| ポータルトップ | `http://localhost:5180/tools/` → 200 | `dist/index.html`（= デプロイ後 `/tools/`） |
| CSS の href | `/tools/assets/styles/portal.css` → 200 | `<link href="/tools/assets/portal-[hash].css">` |
| ツールページ | `http://localhost:5180/tools/image-compress/` → 200 | `dist/image-compress/index.html`（= `/tools/image-compress/`） |
| ツールカードの href | `/tools/image-compress/`（tools.json から自動生成） | 同左 |
| 本体への逆導線 | `https://kurodafolio.com/...`（絶対URL・base の影響を受けない） | 同左 |

### 設計上の重要ルール（地雷あり）
1. **HTML 内のパスは「base なしのルート相対」で書く**。`<link href="/assets/styles/portal.css">` と書けば Vite が `base` を前置して `/tools/assets/...` に変換する。**自分で `/tools/` を前置して書かない**（二重 `/tools/tools/` になる）。
2. **本体サイト（kurodafolio.com）への逆導線は絶対URLで書く**。ツールは別 Vite プロジェクトで本体の `/about/` 等は base 配下にないため、`{{ site.home }}` 等（`https://kurodafolio.com/...`）を context から渡してハードコードを避けた。
3. **★デプロイ構成の確定（plan §2-5 図からの是正）**: ツールのソースは `src/{slug}/index.html`（src 直下にスラッグ名）に置く。`dist/` をそのまま `public_html/tools/` へ配置すると `src/index.html`→`/tools/`、`src/{slug}/`→`/tools/{slug}/` になる。
   - plan §2-5 の構成図は `dev/src/tools/{slug}/index.html` 表記だったが、それだと `dist/tools/{slug}/` → デプロイ後 `/tools/tools/{slug}/` と **`tools/` が二重**になる。
   - 採用: **`src/{slug}/`（フラット）** ＋ `dist/` を `public_html/tools/` へ配置。`base:"/tools/"` は URL 解決のためだけに効かせ、ディレクトリの `tools/` は「デプロイ先フォルダ名」で表現する。この方が二重を避けられ単純。
   - → plan / PLAN.md / README に反映済み（README「デプロイ対応」注記）。

---

## ② XServer での本体 `/` とツール `/tools/` の .htaccess / fallback 干渉 — ⚠️ 想定干渉と対処方針を文書化（実デプロイは F6・ローカル完全検証不可）

### 前提
- 本体 kurodafolio.com（静的サイト）は `public_html/` 直下にデプロイ済み。
- ツールは `public_html/tools/` に**サブディレクトリとして**ぶら下げる。同一ドキュメントルート・同一 .htaccess 階層を共有する。
- XServer は Apache。`.htaccess` が階層下方向に継承・上書き合成される。

### 想定される干渉と対処

| # | 想定干渉 | 対処方針 |
|---|---|---|
| A | **本体ルートの `.htaccess` にSPA fallback（全リクエストを `/index.html` へ rewrite）がある場合**、`/tools/image-compress/` への直アクセスが本体の `index.html` に飲まれ、ツールが表示されない | 本体は静的マルチページ（SPA ではない）想定なので本来 fallback rewrite は無いはず。**まず本体 `.htaccess` に `RewriteRule ... index.html [L]` 系の全捕捉ルールが無いことを F6 着手時に確認**する。もし将来本体が SPA 化した場合は、本体の rewrite に `RewriteCond %{REQUEST_URI} !^/tools/` の除外条件を足し、`/tools/` 配下をスルーさせる |
| B | **末尾スラッシュの正規化**。`/tools/image-compress`（スラッシュ無し）アクセス時に正しく `index.html` へ解決されるか。DirectorySlash の挙動次第で 301 が挟まる | ツール内リンクは**末尾スラッシュ付き**（`/tools/image-compress/`）で統一済み（card url・breadcrumb とも）。Apache 既定の `DirectoryIndex index.html` ＋ `DirectorySlash On` で `/tools/{slug}/` → `index.html` は解決される。リンクを末尾スラッシュ付きで統一しておけば 301 リダイレクトのコストも回避できる |
| C | **`tools/` 自前 .htaccess の要否**。ツールは静的MPA（ブラウザ内WASM完結・サーバールーティング不要）なので、`/tools/` 配下に独自の rewrite は**原則不要** | F1時点では `tools/` 用 .htaccess を置かない方針。必要が出た場合（例: 本体fallbackからの保護＝上記A）のみ、`public_html/tools/.htaccess` に最小ルールを置いて本体ルールを上書きする |
| D | **MIME/圧縮・キャッシュヘッダ**。`.wasm`（F3で使用）の Content-Type が `application/wasm` で返るか。古いサーバー設定だと WASM が `text/html` 等で返り、`WebAssembly.instantiateStreaming` が失敗する | **F3/F6 の検証項目**。必要なら `tools/.htaccess` に `AddType application/wasm .wasm` を追加。`@jsquash/*` 等を streaming 読み込みする場合に効く。**F3 実装者への申し送り** |
| E | **HTTPS・index 自動表示・ディレクトリ一覧の露出** | 本体で HTTPS 強制・`Options -Indexes` が効いていれば `/tools/` 配下にも継承される（追加対処不要の想定）。F6 で実機確認 |

### F6 着手時の必須チェック（このメモを引き継ぐ）
1. 本体 `public_html/.htaccess` の内容を取得し、**全捕捉 rewrite（SPA fallback）が無いこと**を確認（あれば `/tools/` 除外条件を追加）。
2. `/tools/`・`/tools/image-compress/`・`/tools/image-compress`（スラッシュ無し）の3パターンを実機で叩き、200/正しい301 を確認。
3. （F3でWASM導入後）`.wasm` の Content-Type を確認。`application/wasm` でなければ `tools/.htaccess` で `AddType`。

> ⚠️ 実デプロイ（F6）まで完全検証は不可。上記は Apache/XServer サブディレクトリ配置の一般知見に基づく**事前の地雷マップ**。

---

## ③ 共通 header/footer partial の本体との同期方法 — 💡 Cody 推奨: **コピー運用（partial の独立所有）**（U-03 Haru/Mado とも関連）

### 論点
ツール側の header/footer（本体への逆導線・パンくず）を、本体 kurodafolio.com の共通パーツとどう同期するか。選択肢は2つ:
- **(A) コピー運用**: ツールプロジェクト内に header/footer partial を**独立して持つ**（本体とは別物として所有）。
- **(B) `_shared/` 参照**: 本体とツールで共通の partial ソースを共有し、両ビルドが参照する。

### Cody 技術視点の推奨 → **(A) コピー運用**

| 観点 | (A) コピー運用 | (B) `_shared/` 参照 |
|---|---|---|
| **プロジェクト独立性** | ◎ frontend-tools は独立 git リポ・独立 Vite。本体を触らず完結（plan §2-5「本体は触らない」と完全整合） | ✕ 共有ディレクトリの所有者・参照パスを跨ぎ、独立リポ前提が崩れる |
| **ビルド構成** | ◎ vite-plugin-handlebars の `partialDirectory` を自分の `src/components/` に向けるだけ | △ 別リポの partial を参照するにはサブモジュール/シンボリックリンク/npmパッケージ化等が必要で重い |
| **役割の違い** | ◎ ツール側 header は**役割が逆**（本体は内部ナビ、ツールは本体への“逆導線”＋パンくず）。そもそも同一であるべきでない | ✕ 共有すると役割差を吸収するための条件分岐が partial に増える |
| **同期コスト** | △ 本体ロゴ/ブランド変更時に手動追従が要る（ただし頻度は低い） | ◎ 自動同期 |
| **破損リスク** | ◎ 本体側の変更がツールビルドを壊さない | ✕ 共有 partial の破壊的変更が両方を巻き込む |

**結論**: ツールの header/footer は**本体の複製ではなく「ツール用に最適化した別パーツ」**。逆導線・パンくず・positioning（フロント制作者向けツール集）という固有の役割を持つため、コピー運用＝独立所有が技術的にも情報設計的にも正しい。

### 同期コスト（(A)の唯一の弱点）への緩和策
- **同期対象を最小化**: ツール側 header/footer が本体から引くのは「**本体への絶対URL（home/works/about/contact）とブランド名**」のみ。これらは `vite.config.js` の `context.site` に集約済み。本体のリンク構造が変わったらここ1箇所を直す。
- 将来、本体URLや営業文言の改定頻度が上がるなら、`context.site` を `src/data/site.json` に外出しして単一ソース化する（F2以降の任意改善）。
- **本体デザイン（色・タイポ）との見た目同期は U-03（Haru/Mado）の領域**。本メモは「partial ソースの所有方式＝コピー（独立所有）」を技術視点で確定提案するもの。見た目をどこまで本体に寄せる/軽量化するかは Haru/Mado が決める。

### 実装状況（F1時点）
- `src/components/{head,header,footer}.html` をツール内に独立所有（= コピー運用 (A) を採用）。
- header にナビ（Home/Works/About/Contact → 本体絶対URL）、footer に「kurodafolio.com が運営／お問い合わせ導線」、ツールページに breadcrumb（Home > Tools > {ツール名}）を partial 化済み。全ツールに自動適用される。

---

## 検証済みサマリ
- **検証済み: ①** `base:"/tools/"` の dev/build パス解決を実機確認（CSS・カードリンク・ツールページ 全200・正しいパス）。HTML はルート相対で書き Vite に base 前置させる運用を確立。デプロイ構成は `src/{slug}/` フラット＋`dist→public_html/tools/` に是正。
- **検証済み: ②** ローカル完全検証は不可のため、XServer/Apache サブディレクトリ配置の想定干渉5件（SPA fallback・末尾スラッシュ・tools自前htaccess・WASM MIME・Indexes/HTTPS）と対処方針、F6必須チェック3項目を文書化。
- **検証済み: ③** partial 同期は **(A) コピー運用（独立所有）を Cody 技術視点で推奨**。独立リポ・独立Vite・役割差の3点で (B)`_shared/`参照より優位。同期対象は `context.site` に最小集約済み。見た目同期方針は U-03（Haru/Mado）へ申し送り。
