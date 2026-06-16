# ツール群のファイル配置設計提案 — どこに・どう置くか

> 📌 **移管メモ（Mane / F1 / 2026-06-15）**: 本ファイルは `tmp/tool-ideation/` からの移管コピー（原本は tmp に残置）。
> ⚠️ **旧サブドメイン記述の読み替え**: 本文中の `tools.kurodafolio.com` / `{tool}.kurodafolio.com` / `motion.kurodafolio.com` 等のサブドメイン表記は、**確定方針 `kurodafolio.com/tools/`（本体サブディレクトリ・ポータル）／各ツール `/tools/{slug}/`** に読み替えること（旧サブドメイン案は破棄・PLAN.md §2-3 確定）。

担当: Mane（制作部 / 案件管理・配置設計）
作成日: 2026-06-12
論点: 黒田さんが順次作って公開するフロント実用ツール群（第1弾=画像仕分け圧縮くん / 公開先 `kurodafolio.com/tools/`）の plan・ソースコード・管理ドキュメントを、ワークスペースのどこに・どういう構造で置くか。制約=「現在の `projects/_self/kurodafolio/` 配下をあまり汚さない」。
前提資料: `mado-publish-format.md`（ポータル型 / `/tools/{slug}/` サブディレクトリ確定）/ `mado-portfolio-link-design.md`（本体ナビに Tools 新設・トップに公開ツールセクション・逆方向営業導線）/ メモリ `project_workspace_structure.md`（パターンA公開成果物 / パターンB案件構造）/ `feedback_past_policy_mechanical_application`（機械的適用への注意）

---

## 0. 結論（先出し）

| 論点 | 結論 |
|---|---|
| ツール群の性質 | **公開自社プロダクト集（snippets-free に近いパターンA寄り）。kurodafolio のクライアント案件構造（A〜L・機密ドキュメント）とは性質が違う。** |
| kurodafolio 配下に押し込むか | **押し込まない。`_self/` 直下に独立プロジェクト `kuroda-tools/` を新設する。** |
| ビルド/デプロイ結合 | **案イ（独立コードベース・独立ビルド → XServer の `/tools/` パスへデプロイ）を推奨。** 本体リポを汚さない意向に直接合致。 |
| Git 運用 | **パターンA（独立 git リポ + my-virtual-team 除外）。** ただし公開度は要判断（後述★）。 |
| フォルダ構成 | A〜L フルは重すぎ。**ツール向け軽量標準（plan / 各ツール = 1サブフォルダ）** を新設。 |

「kurodafolioを汚さない」の最短かつ筋の良い答えは、**ツール群をkurodafolioの中に入れないこと**。同一ドメインに出ること（`kurodafolio.com/tools/`）と、同一リポ・同一ビルドに入れることは別問題。前者はデプロイ先パスの話、後者はコード管理の話で、分離できる。

---

## 1. ツール群の「性質」の見極め（配置判断の起点）

`feedback_past_policy_mechanical_application` に従い、「kurodafolio に適用された方針（パターンB）が、ツール群にも同じ判断になるか」を1段階確認する。

### 1-1. kurodafolio（パターンB）が想定していた対象

- クライアント案件構造（00_client_info / 01_management/contract / 08_release/credentials 等）
- **機密度の高いドキュメントが多数**（顧客情報・契約・認証情報）
- 案件管理の文脈（架空クライアントのメタ案件として A〜L モジュールを回す）
- → だから「my-virtual-team Private で履歴管理 + dev/ のみ独立 git + 機密フォルダ除外」という重い管理になった

### 1-2. ツール群の対象としての性質

| 観点 | ツール群 | 判定 |
|---|---|---|
| 公開度 | **全ファイル公開で問題ない**（ブラウザ内WASM完結・DB不要・認証情報なし） | snippets-free と同じ |
| 機密度 | 機密ドキュメントなし（クライアント情報・契約・credentials が存在しない） | パターンB の前提を満たさない |
| 用途・目的 | 黒田さんが**作って公開する自社プロダクト集**（営業の傍証・集客装置） | クライアントワークではない |
| 規範書の想定 | A〜L モジュール = クライアント案件用。ツールに client_info / contract / UAT は不要 | フルA〜L は過剰 |

→ **4つの「性質が異なる兆候」(公開度/機密度/用途/規範書)すべてに該当**。ツール群を kurodafolio（パターンB）と同じ扱いにするのは機械的適用にあたる。ツール群は **snippets-free と同じパターンA系の公開成果物**として扱うのが正しい。

### 1-3. kurodafolio 配下に押し込むべきか → 押し込まない

- 押し込む案（例: `kurodafolio/06_implementation/dev/src/tools/` にツールを同居）は、kurodafolio の案件構造・本体ビルドを肥大化させ、黒田さんの「汚さない」意向に正面から反する。
- ツールは「kurodafolio という案件の成果物」ではなく「黒田さん個人の独立プロダクト群」。kurodafolio が終わってもツールは増え続ける。ライフサイクルが別。
- → **`_self/` 直下に独立プロジェクトとして新設**するのが、snippets-free との一貫性も保て最も素直。

---

## 2. ビルド/デプロイの結合をどう扱うか（核心）

ツールは本体と同一ドメイン `kurodafolio.com/tools/` に出る。技術的実現方法で配置が変わる。

### 案ア: 本体ビルド（`kurodafolio/06_implementation/dev/`）に `/tools/` セクションとして同居

| 観点 | 評価 |
|---|---|
| 実現方法 | 本体 `src/tools/{slug}/index.html` を置けば、vite.config の `globSync("src/**/*.html")` が自動でビルド入力に拾う（技術的には可能・確認済み） |
| 共通UI整合 | ◎ ナビ/フッターの Handlebars partial をそのまま共有でき、整合が自動 |
| リポ肥大化 | ✗✗ **kurodafolio の dev/ にツールのソース・WASM・依存が流入し続ける。黒田さんの「汚さない」意向に真っ向から反する** |
| ビルド独立性 | ✗ ツール追加のたびに本体サイト全体が再ビルド対象。本体公開とツール公開のリリースサイクルが結合する |
| git運用 | ✗ ツールのコミット履歴が本体 dev/ リポに混ざる。プロダクト集の独立性が失われる |

### 案イ: ツール群を独立コードベース・独立ビルドにし、成果物を XServer の `/tools/` パスへデプロイ（推奨）

| 観点 | 評価 |
|---|---|
| 実現方法 | `kuroda-tools/` を独立 Vite プロジェクトとして持ち、`base: "/tools/"` でビルド → `dist/` を XServer の `public_html/tools/` にアップロード（本体は `public_html/` 直下） |
| リポ肥大化 | ◎ **kurodafolio は一切汚れない。** ツールのソース・依存・履歴が完全分離 |
| ビルド独立性 | ◎ ツールだけ再ビルド・再デプロイできる。本体とリリースサイクルが独立 |
| git運用 | ◎ snippets-free と同じパターンA（独立リポ）。プロダクト集として綺麗 |
| 共通UI整合 | △ ナビ/フッターを本体と別管理になる → **共通ヘッダー/フッターの partial を `kuroda-tools/` 側にも持つ必要**。本体とのデザイン整合は手動同期（★Cody/Haru検証要）。ただしツールは「本体に戻す導線」が主目的で、本体と完全同一ナビである必要はない（むしろツール用に最適化した軽量ナビでよい） |
| デプロイ運用 | △ 本体とツールで2回デプロイ作業が発生。ただし XServer のパス違いに別々に上げるだけで、相互に踏まない（本体=`/`、ツール=`/tools/`） |
| 本体側の最小変更 | 本体リポには「ナビに Tools リンク追加 / トップに公開ツールセクション / フッターリンク」の**最小限の手**だけ入る（mado-portfolio-link-design 準拠）。これは避けられず、かつ軽微 |

### 推奨 = 案イ

理由:
1. **黒田さんの「kurodafolioを汚さない」意向に直接合致**。案アはこの意向と両立しない。
2. ツール群の性質（独立プロダクト集・増え続ける・別ライフサイクル）に、独立ビルド/独立リポが構造的に合う。
3. snippets-free と同じパターンAで運用一貫性が保てる。
4. 案イの唯一の弱点（共通UI整合の手動同期）は、「ツールは本体への逆導線さえ張れればよく、本体と完全同一ナビは必須でない」ため許容範囲。共通パーツは将来 `_shared/` 経由での共有も検討可。

★Cody検証要: ① `base: "/tools/"` でのビルドで内部リンク・アセットパスが `/tools/` 配下に正しく解決されるか（本体は `base: "./"` 相対だが、サブディレクトリ配下ポータルは絶対パス基準の方が安全な可能性）。② XServer 上で `public_html/` 本体と `public_html/tools/` ツールが .htaccess / SPA fallback 等で干渉しないか。③ 共通ヘッダー/フッター partial を本体と二重持ちする際の同期方法（コピー運用 or `_shared/` 参照）。

---

## 3. 配置先の具体提案（フォルダツリー）

### 3-1. 全体配置

```
projects/_self/
├── snippets-free/                    （既存・パターンA公開成果物）
├── kurodafolio/                      （既存・パターンB案件構造 / ★一切触らない＝汚さない）
└── kuroda-tools/                     ★新設（パターンA公開成果物 / 独立gitリポ）
    ├── .git/                         独立gitリポ（GitHub Public 想定 ※公開度は★要確認）
    ├── .gitignore                    （node_modules / dist 等）
    ├── README.md                     ツール集全体の説明
    ├── PLAN.md                       ★ツール群全体の plan（ポータル戦略・ロードマップ・命名規則）
    ├── docs/                         ★案件管理・設計ドキュメント（軽量版・下記3-3）
    │   ├── _portal/                  ポータル自体（トップ一覧・ナビ）の設計
    │   └── {slug}/                   各ツールの要件・設計・QA（ツール単位）
    └── dev/                          ★ソースコード（独立Viteプロジェクト）
        ├── package.json
        ├── vite.config.js            base: "/tools/"
        ├── src/
        │   ├── index.html            ポータルトップ（/tools/）
        │   ├── components/           共通partial（header/footer = 本体への逆導線含む）
        │   ├── assets/
        │   ├── data/                 ツール一覧データ（カード生成用JSON/配列）
        │   └── tools/
        │       ├── image-compress/   /tools/image-compress/
        │       │   └── index.html
        │       ├── clamp/            （今後）
        │       ├── color-palette/    （今後）
        │       └── {slug}/
        └── dist/                     ビルド成果物（XServer public_html/tools/ へアップ）
```

### 3-2. plan file の置き方

| plan | 置き場所 | 粒度 |
|---|---|---|
| ツール群**全体**の plan（ポータル戦略・URL設計・ロードマップ・命名規則・進捗テーブル） | `kuroda-tools/PLAN.md` | 1ファイルで全体を統括 |
| 個別ツールの設計メモ | `kuroda-tools/docs/{slug}/` 配下（plan というより要件・設計） | ツール単位 |

- **kurodafolio 案件の `plans/` や `PLAN.md` には入れない**（汚さない原則）。ツールは別プロジェクトなので plan も別管理。
- my-virtual-team リポ直下の `plans/` は「フレームワーク/案件横断の設計」用。ツール群は独立プロダクトなので、plan はプロジェクト内（`kuroda-tools/PLAN.md`）に持つのが snippets-free との一貫性も保てる。
- ★ただし「最初の1本だけ」は、まだプロジェクトフォルダを作る前の構想段階。**初回 plan は my-virtual-team の `plans/kuroda-tools-setup.md` に置き、`kuroda-tools/` 新設後に `kuroda-tools/PLAN.md` へ移管**するのが綺麗（今回の整理→plan化はこの初回 plan にあたる）。

### 3-3. 案件管理・設計ドキュメント（A〜L フルは重すぎ → ツール向け軽量標準）

クライアント案件用の A〜L（client_info / contract / wireframe / UAT / release/credentials …）はツールに不要。ツール1本ごとに以下の**軽量4点**だけ持てば十分:

```
kuroda-tools/docs/{slug}/
├── 00_overview.md      ツールの目的・対象ユーザー・検索意図・スコープ（何をやり何をやらないか）
├── 01_spec.md          機能要件・UI設計・技術選定（WASMライブラリ等）・入出力仕様
├── 02_qa.md            動作確認チェックリスト・ブラウザ対応・既知の制約
└── 03_seo.md           meta/タイトル/OG・構造化データ・本体への逆導線（Sara/Mado領域）
```

- クライアント案件と違い、ヒアリング・契約・UAT・credentials が存在しないので、それらのフォルダは作らない（modules.md の「発動しないモジュールのフォルダは作らない」原則と整合）。
- ポータル自体（トップ一覧ページ・ナビ・カテゴリ分類）の設計は `docs/_portal/` に置く（ツール横断の共通設計）。
- これは「ツール向け軽量モジュール」として標準化でき、2本目以降は `docs/{slug}/` をテンプレ展開するだけで回る。

### 3-4. 複数ツールが増えたときのスケール（命名規則・スラッグ規則）

| 項目 | ルール | 例 |
|---|---|---|
| ツールのスラッグ | URLパス `/tools/{slug}/` と完全一致。小文字英字＋ハイフン。検索意図を表す語 | `image-compress` / `clamp` / `color-palette` / `flocss-generator` |
| ソースフォルダ | `dev/src/tools/{slug}/` | スラッグと一致 |
| ドキュメントフォルダ | `docs/{slug}/` | スラッグと一致 |
| 1ツール=1サブフォルダ | ソース・docs・URLの三者で同一スラッグを使い、横断で追跡可能に | — |
| カード/一覧データ | `dev/src/data/tools.json`（or 配列）に1ツール1エントリ。トップ・新着セクションはこれを参照して自動生成 | mado-portfolio-link-design §2-3 の partial 自動化と整合 |

- スラッグは**最初に決めたら動かさない**（URL = SEO 資産。mado も「URLは動かさない」と明記）。
- カテゴリ分類はツールが十数本に増えてから `data` にタグ列を足して導入（mach-tools / ラッコ型）。初期は不要。

---

## 4. 既存構造・規範との整合

### 4-1. `project_workspace_structure` メモリとの整合

- メモリのパターンA（公開成果物 = 独立 git リポ + my-virtual-team 除外）に、ツール群 `kuroda-tools/` を**新規対象として追加**する形。snippets-free と同じ運用。
- メモリのパターンB適用対象リスト（`frontend-tools-core（予定）/ vscode-frontend-tools（予定）`）と並ぶ「公開成果物」の一員。
- `projects/_self/.gitignore` は現状 `*` → `!kurodafolio/` 例外。**`kuroda-tools/` は例外指定を足さない**（＝ `*` ルールで自動除外 = パターンA運用）。各成果物ディレクトリ内で `git init` するだけ。

### 4-2. 「kurodafolio を汚さない」制約の自己確認

- ✅ ツールのソース・plan・docs はすべて `kuroda-tools/`（kurodafolio の外）に置く。
- ✅ kurodafolio の案件構造・`06_implementation/dev/`・`PLAN.md`・`plans/` は一切変更しない。
- △ 本体リポ（kurodafolio/dev/）には「ナビに Tools リンク / トップに公開ツールセクション / フッターリンク」の**最小限の変更**は入る（mado-portfolio-link-design で確定済み・避けられない・軽微）。これは「汚す」というより「本体に正規の導線を1本通す」性質で、案件構造やビルドの肥大化は起きない。

### 4-3. `projects/CLAUDE.md` との整合

- `projects/CLAUDE.md` の「パターンA: 公開成果物」の例示に `kuroda-tools/` を追加すべき（現状 snippets-free / frontend-tools-core / vscode-frontend-tools が列挙されている箇所）。

### 4-4. メモリ更新の要否 → **必要**

確定したら `project_workspace_structure.md` に以下を追記:
1. **kuroda-tools の正規配置先**: `projects/_self/kuroda-tools/`・パターンA（独立 git リポ + my-virtual-team 除外）・公開先 `kurodafolio.com/tools/`。
2. **ビルド/デプロイ分離方針**: ツールは独立 Vite ビルド（`base:"/tools/"`）→ XServer `public_html/tools/` へデプロイ。kurodafolio 本体ビルドとは分離（案イ採用の経緯）。
3. **本体側の最小変更**: 本体リポにはナビ/トップ/フッターの導線追加のみ入る。
4. `projects/CLAUDE.md` のパターンA例示にも `kuroda-tools` を追記。

また `project_portfolio_and_tools_plan_static.md`（J申し送りでツールに言及）とも突き合わせ、ツール配置確定を反映。

---

## 5. 結論

### 推奨配置構造（要点）

```
projects/_self/kuroda-tools/        ★新設・独立gitリポ・パターンA
├── PLAN.md                         ツール群全体の plan
├── docs/{_portal, {slug}/...}      軽量管理ドキュメント（overview/spec/qa/seo の4点）
└── dev/                            独立Viteプロジェクト（base:"/tools/" → XServer /tools/ へデプロイ）
    └── src/tools/{slug}/           1ツール=1サブフォルダ
```

### 命名規則
- スラッグ = URLパス・ソースフォルダ・docsフォルダで完全一致（小文字英字＋ハイフン / 検索意図語 / 確定後は不変）。
- 第1弾 = `image-compress`。

### 結論サマリ
- **ビルド結合 = 案イ（独立ビルド → `/tools/` へデプロイ）。**
- **git = パターンA（独立リポ + my-virtual-team 除外）。**
- **kurodafolio は触らない**（本体への導線追加という最小変更を除く）。

### ★要確認・★Cody検証要

- **★要確認（黒田さん）**: ツールリポの公開度。snippets-free は GitHub Public 前提だが、ツール群リポを **Public にするか Private にするか**（コードを公開して問題ないか / 公開がブランド上プラスか）。デプロイ成果物は XServer なので、GitHub の公開可否は別判断。Public 推奨だが代表確認。
- **★Cody検証要（技術最終判断 / §2末尾）**: ① `base:"/tools/"` ビルドでの内部リンク・アセットパス解決。② XServer での本体 `/` とツール `/tools/` の .htaccess / fallback 干渉有無。③ 共通ヘッダー/フッター partial の本体との二重持ち同期方法（コピー or `_shared/` 参照）。
- **★Haru/Mado領域**: ツール用ナビ/フッターを本体と完全同一にするか、ツール用に軽量化するか（案イでは別管理になるため）。

---

検証済み: ① ツール群の性質を4観点（公開度/機密度/用途/規範書）で見極め、機械的適用を避けてパターンA・kurodafolio外への独立を根拠付きで結論。② ビルド結合を案ア/案イで比較し「汚さない」意向に沿って案イを推奨。③ plan・ソース・管理ドキュメントを具体フォルダツリーで提示し、既存メモリ(パターンA)・projects/CLAUDE.md との整合と更新要否(必要)を明示。
未達: なし（ただし技術的最終判断3点は★Cody検証要として明示・本提案は配置設計レベルで完結）。
