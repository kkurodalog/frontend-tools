# kuroda-tools デザインコンセプト（Fd Phase1 / コンセプト〜概念モックアップ）

担当: Haru（制作部 / デザインコンセプト・モックアップ・UI設計）
作成日: 2026-06-16（Phase1）/ 2026-06-16 更新（Phase2 黒田さんレビュー反映）/ 2026-06-16 更新（Phase3 第2次レビュー反映）/ 2026-06-16 更新（Phase4 第3次レビュー反映）/ 2026-06-16 更新（Phase5 フッターナビ最終確定反映）/ 2026-06-16 更新（Phase6 黒田さん修正3点反映）
ステータス: Fd Phase7 成果物（ポータルトップ下部を About的ひとこと廃止→制作者カード＋CTAに統一 → Cody 実装 へ）
対象画面: ① ポータルトップ（`/tools/`・ツール一覧カード）/ ② 各ツールページの共通枠（header/footer・パンくず・ツール本体エリアの器）
※ image-compress 固有の UI（プリセット・Before/After・ZIP DL 等）は F2/F3 で詰める。本書は「ツールページの器」まで。

> 最重要方針（黒田さん確定）: **Tools のデザインは kurodafolio.com 本体と世界観を統一する。** Tools は本体のサブディレクトリ（`/tools/`）であり本体への逆導線を持つため、色・タイポ・余白・トーンを本体に揃え、地続きの体験にする。本書はその統一を「実値」で担保する。

---

## 1. 本体から抽出した世界観（実値 ＋ 出典ファイルパス付き）

> すべて推測せず本体の正本ファイルから抽出。出典は `projects/_self/kurodafolio/06_implementation/dev/src/assets/styles/` 配下。

### 1-1. ブランドの核とトーン

- ブランドの核 =「静かな持続可能性の哲学。派手さより誠実さ。地道なコーディングと生活の調和を通じて顧客の想いを形にし続ける職人」（出典: `guidelines/brand-guidelines.md`）。
- デザインのキーメッセージ（本体採用案 b-tech-cool）=「**コードに運用の優しさを。**」（出典: `_variables.scss` §2 コメント）。
- 視覚的トーン = **クール・テック・落ち着き**。チャコールネイビーの知性 ＋ ティールグリーンの清潔感。装飾過多にせず、余白と整列で品位を出す。

### 1-2. カラー（実値 / 出典: `global/_variables.scss` §2 ライト・§3 ダーク）

採用テーマは **b-tech-cool**（ライトがデフォルト・ダーク追従あり）。

| 役割 | ライト値 | ダーク値 | トークン名 |
|---|---|---|---|
| Primary（チャコールネイビー） | `#1a2b3c` | `#4a6fa8` | `--color-primary` |
| Accent（ティールグリーン） | `#2ba89c` | `#5dd9cb` | `--color-accent` |
| Accent hover | `#239084` | `#7ae3d7` | `--color-accent-hover` |
| 背景ベース | `#ffffff` | `#03050a` | `--color-bg-base` |
| 背景 alt / セクション | `#f4f6f8` | `#0a0e14` | `--color-bg-alt` |
| カード（elevated） | `#ffffff` | `#131922` | `--color-bg-elevated` |
| ボーダー | `#dde2e7` | `#232e40` | `--color-border` |
| 本文テキスト | `#0f1620` | `#e6edf6` | `--color-text-base` |
| ミュートテキスト | `#586674` | `#a8b3be` | `--color-text-muted` |
| リンク | `#5b7fb8` | `#7ab4f0` | `--color-text-link` |
| フォーカスリング | `#2ba89c` | `#5dd9cb` | `--color-focus-outline` |

- ボタン色の運用（出典: `components/_c-btn.scss`）: primary ボタンは **accent 背景 ＋ 白文字**。ダーク時は `--color-accent-fixed`（#2ba89c 固定）＋ 白固定で「眩しすぎない」処理。outline ボタンは primary 色の枠線。

### 1-3. タイポグラフィ（実値 / 出典: `global/_variables.scss` §1・`foundation/_base.scss`）

- 本文フォント: `--font-family-sans` = `"Noto Sans JP", -apple-system, ...`。body は `--base-font-family`（Local Noto Sans JP 優先）。
- 見出しフォント: `--font-heading` = `--font-family-en` = **`"Inter", "Noto Sans JP", ...`**（英字見出しは Inter Bold 優先）。
- 等幅: `--font-family-mono` = `"JetBrains Mono", ...`（コード・数値表示用）。
- スケール: Perfect Fourth（1.333 比）。`--fs-base 16px` / `--fs-lg 18px`（リード）/ `--fs-2xl 28.4px`（H3）/ `--fs-3xl 37.9px`（H2）/ `--fs-4xl 50.5px`（H1 PC）。
- 行間: 本文 `--lh-base 1.75`、見出し `--lh-tight 1.3`。字間: 見出しに `--ls-tight -0.01em`。
- ウェイト: 本文 400 / 見出し・ボタン 700。

### 1-4. 余白リズム（実値 / 出典: `global/_variables.scss` §1・`components/_c-section.scss`）

- スペーシングは **4px/8px グリッド**。`--space-2 .5rem` … `--space-6 1.5rem` … `--space-12 3rem` … `--space-28 7rem`。
- セクション間隔: PC `--section-gap-pc = --space-28（7rem）`、SP `--section-gap-sp = --space-16（4rem）`。本体は「読み物」なので縦に大きく取る。
- セクション見出し挙動（`_c-section.scss`）: **SP は中央寄せ・md 以上で左寄せ**。lead は muted 色。見出し下 `--space-3`、lead 下 `--space-12`。
- コンテナ: `--container-base 1100px`（トップ本文幅）、header/footer は `--container-max 1280px`。左右パディング SP `1rem` / PC `2rem`（出典: `layouts/_l-container.scss`）。

### 1-5. カード・あしらい（実値 / 出典: `components/_c-work-card.scss`）

- カード = `--color-bg-elevated` 地 ＋ `1px solid --color-border` ＋ `--radius-md（8px）`。
- ホバー: `translateY(-2px)` ＋ `--shadow-md`。アクティブ（クリック中）: `translateY(0)` ＋ `--shadow-none` ＋ `transition: transform --transition-zero`（即時化）。初期は影なし（フラット基調で、動きは控えめ）。※実値は Phase3 §6-2(f) で精緻化。
- 全面リンクカードは hover で文字色を変えない（子テキスト色を base/muted で固定）。
- アイコン: Lucide（線アイコン / stroke 1.75）＋ SimpleIcons（SNS）。線の細さで「静けさ」を出す（出典: `_variables.scss` §1 icon トークン・footer の SNS SVG）。

### 1-6. ヘッダー/フッターのトーン（出典: `components/p-header.html`・`p-footer.html`）

- ヘッダー: 2 行ロゴ（`Kuroda Kosuke` / `Portfolio`）＋ 横ナビ ＋ **ダーク/ライト切替トグル**（`c-color-toggle` 太陽/月アイコン）＋ Contact ボタン。現在地は `aria-current="page"`。
- フッター: 2 行ロゴ ＋ サイトマップ的ナビ ＋ SNS（X / GitHub / Tech Blog）＋ `© 2026 Kosuke Kuroda`。

### 1-7. ★Phase2 で追加抽出した実装値（本体の正本ファイルから実値抽出・推測なし）

黒田さんレビュー（ロゴ是正・トグル/パンくず/CTA を本体準拠に）に対応するため、以下を実ファイルから精密抽出した。

#### (a) ロゴ実値（出典: `assets/styles/projects/_p-header.scss` L79-87・`components/p-header.html` L3-8）

- マークアップ: `<p class="p-header__logo"><a><span class="…line--1">Kuroda Kosuke</span><span class="…line--2">Portfolio</span></a></p>`（2 行を `flex-direction: column; gap: 0`）。
- **両行とも `font-weight: var(--fw-bold)`（700）・`font-family: var(--font-heading)`（Inter）・`letter-spacing: var(--ls-base)`（0）**。
- **サイズも両行共通**: SP `--fs-lg`（18px）/ PC（≥1024px）`--fs-xl`（21.3px）。`line-height: 1.15`。
- **2 行間の差は「色だけ」**: line--2 のみ `color: var(--color-accent)`。サイズ・太さの差は無い。
- ホバー: `a` 全体 `opacity: 0.7`。
- **→ Phase1 モックの不具合の原因**: 旧モックは 2 行目を `--fs-xs`＋`text-transform: uppercase`＋`muted` で描いており「Tools が細く小さい」状態だった。本体実値は上記の通り**両行同サイズ・同太字**なので、これに合わせて是正した（修正1）。

#### (b) ダーク切替トグル実値（出典: `assets/styles/components/_c-color-toggle.scss`・`components/p-header.html` L18-53）

- 形状は**左右スライドのトラック型トグル**（単なるアイコンボタンではない）。トラック `64×32px`（`rm(64)/rm(32)`）・`border-radius: --radius-pill`・`background: --color-bg-alt`・`1px --color-border`。
- サム（つまみ）: `22×22px` の円・`background: --color-accent`・`box-shadow: --shadow-sm`。ライト時 左寄せ（`left: 3px`）/ ダーク時 右寄せ（`left: calc(100% - 3px - 22px)`）。
- アイコン: 太陽（`circle r=4` + 8 本の光線 path）と月（`M12 3a6 6 0 0 0 9 9…`）の 2 つの SVG（`16×16px`・`stroke-width=2`）。ライト時 sun=`--color-text-inverse`/moon=`--color-text-muted`、ダーク時に反転。
- 発動属性は `data-color-scheme="dark"`（＋ `prefers-color-scheme` 追従）。JS/localStorage は本番（Cody / Step12 相当）範囲。
- **→ モックに本体と同一の SVG マークアップ・寸法・サム挙動を移植（推測なし）。新トークン `--toggle-*` を tokens.css §1 に追加**。

#### (c) パンくず実値（出典: `assets/styles/components/_c-breadcrumb.scss`・works 詳細）

- マークアップは `nav.c-breadcrumb > ol.c-breadcrumb__list`（`display: flex; flex-wrap: wrap; gap: --space-2`・`list-style: none`）。
- 文字 `--fs-sm`・既定色 `--color-text-muted`。リンクは `--color-text-muted` → hover で `--color-accent`。
- **区切りは `›`（`.c-breadcrumb__sep`・色 `--color-border-strong`）**。Phase1 モックの `>` から本体の `›` に修正。
- 現在地は非リンク・`aria-current="page"`・muted のまま。可視パンくずと `BreadcrumbList` JSON-LD は同順序・同件数（観点 JJ）。
- **→ `Home › Tools › {ツール名}` を本体と同一マークアップ（ol ベース・`›`）で再現**。

#### (d) 下部 CTA お問い合わせセクション実値（出典: `assets/styles/projects/_p-cta.scss`・`components/p-cta.html`・`global/_variables.scss` L210-212）

- 本体マークアップ: `section.p-cta > .l-container--wide > h2.c-section__title「お問い合わせはこちら」+ p.p-cta__lead + .p-cta__action > a.c-btn--primary.c-btn--large「お問い合わせ」`。
- **背景画像あり**: `--bg-cta-image`（`image-set` で `cta-bg.webp` 優先 + `cta-bg.png` フォールバック）＋ `linear-gradient(overlay, overlay)` を重ねる。`background-size: cover`・`position: center`。
- overlay 値: ライト `--color-cta-overlay-light = rgb(15 22 32 / 70%)`、ダーク `--color-cta-overlay-dark = rgb(3 5 10 / 70%)`（`data-color-scheme="dark"` で切替）。
- 文字: 白固定（`#fff` / lead は `rgb(255 255 255 / 88%)`）・**全幅中央寄せ**。`padding-block: --space-20`。`background-color: --color-primary` をフォールバックに。
- ボタン: `c-btn--primary`（accent 地・白文字・ダーク時も固定 accent #2ba89c）＋ `c-btn--large`（`min-height 56px`・`padding --space-4/--space-8`・`--fs-lg`）。
- **→ 同一スタイルを移植し、背景画像は本体の `cta-bg.webp/png` をそのまま流用（同一ビジュアル）。文章は黒田さん指定テキストに置換（下記 §5）。新トークン `--bg-cta-image`・`--color-cta-overlay-*` を tokens.css §2/§3/§5 に追加**。

---

## 2. ツール群への適用方針（揃える点 / 機能上変える点）

### 2-1. 本体と完全に揃える点（地続きの体験を作る軸）

| 要素 | 揃え方 |
|---|---|
| カラー | 本体トークンを実値で 1:1 継承（`tokens.css` §1〜§3）。新規の色を作らない |
| ダーク対応 | 本体と同じ「ライトデフォルト ＋ data-color-scheme/prefers 追従」。ヘッダーに同じ切替トグルを置く |
| タイポ | Inter（見出し）/ Noto Sans JP（本文）/ JetBrains Mono（数値）の三役を本体と同じに |
| カード | bg-elevated ＋ 1px border ＋ radius-md ＋ hover translateY(-2px)+shadow-md を踏襲（ツールカードに適用） |
| ヘッダー/フッター | 本体と同じ高さ・最大幅・2 行ロゴ調・切替トグル・SNS。**ヘッダーナビは案B確定で自立シンプル（tools 内）＋お問い合わせCTA。本体への逆導線（Home/Works/Skills/Contact）はフッター＋下部制作者カードが担う** |
| トーン | 「静かな職人」。アニメは控えめ、装飾は最小、整列と余白で品位を出す |

### 2-2. ツールとして機能上「変える」点（アプリ的 UI で必要な差分）

> 本体は「読む」サイト、Tools は「操作する」道具。器は揃えるが、操作面は使い勝手を優先して以下を差分化する。すべて本体トークンから派生させ、独自色は作らない（`tokens.css` §4）。

| 差分 | 内容 | 理由 |
|---|---|---|
| 縦リズムを締める | ツールページ内のセクション間隔は `--tool-section-gap = --space-12（3rem）`。本体の §28（7rem）より狭い | 作業画面はスクロール量を減らし、操作を一画面に収めたい。読み物の悠々とした余白は逆に邪魔になる |
| 操作パネルの面 | `--tool-panel-radius = --radius-lg（12px）`＋ `--tool-panel-padding = --space-6`。カード（8px）より一段大きい角丸で「操作する面」を強調 | アプリ的な「操作領域」を視覚的に区切る |
| ドロップゾーン | 破線ボーダー（`--dropzone-*`）。通常は border-strong の破線、ドラッグオーバーで accent 破線 ＋ accent-bg | ファイル投入面は本体に無い UI。アクションを accent で誘導 |
| フォーム入力 | `--field-*`。入力は 16px 維持（iOS ズーム回避・本体 base.scss と同思想）、focus で accent 枠 | 操作の主役。本体 contact フォームのトーンに準拠しつつ密度を上げる |
| ヒーローを小さく | ポータルトップのヒーローは本体トップのような大判ビジュアルを持たない。テキスト主体で軽く | Tools は「道具棚」。到達したら即ツールを探せる状態が最良。ヒーローで場所を取らない |

### 2-3. 現状の仮デザインからの主な変更点（何を作り替えるか）

現状 `dev/src/assets/styles/portal.css`（F1 機能確認用の仮実装）は本体と世界観が乖離している。主な是正:

| 項目 | 現状（仮） | 統一後（本体準拠） |
|---|---|---|
| 配色 | ダーク固定（bg `#0f1115` / surface `#1a1d24`） | ライトデフォルト ＋ ダーク追従。bg `#fff`／ダーク `#03050a` |
| アクセント | 青 `#5b9dff`（本体に無い色） | ティールグリーン `#2ba89c`（本体 accent） |
| フォント | Hiragino 先頭・見出しも同じ | 見出し Inter / 本文 Noto Sans JP / 数値 JetBrains Mono |
| ダーク切替 | なし（固定） | ヘッダーに本体同等の切替トグルを設置 |
| ロゴ表記 | `kuroda-tools`（小文字 1 行） | 本体トーンの 2 行ロゴ調（★要確認1 参照） |
| カード hover | border-color が accent に変わるだけ | 本体 work-card と同じ translateY(-2px)+shadow-md。リンク下線も消す |
| リンク下線 | `a:hover { text-decoration: underline }` 全体 | 本体は hover で下線を出さない方針。ナビ/カードは下線なしに |
| 余白 | 場当たり的な rem 直値 | space スケール（4/8px グリッド）に乗せる |

---

## 3. レイアウト方針・あしらい（対象 2 画面）

### 3-1. ポータルトップ `/tools/`（ツール一覧カード）

**役割**: 「フロント制作の道具棚」。到達者が即ツールを探せる destination（positioning §1-3）。

- **構成（上から）**: ヘッダー → 軽量ヒーロー（H1 ＋ リード）→ ツールカードグリッド → **③ 下部ファネルブロック（制作者カード → CTA セクション）** → フッター（本体逆導線）。
- **ヒーロー**: 大判ビジュアルなし。`--container-base 1100px` 内、上下 `--space-12`〜`16`。H1 は `--fs-3xl`〜`4xl`、リードは `--fs-lg` muted。SP 中央寄せ・md 左寄せ（本体 c-section 挙動を踏襲）。
- **About的ひとことは廃止（Phase7）**: 旧案ではヒーロー内に「About的ひとこと（`.p-hero__intro`）」を 1〜2 行置いていたが、**Phase7（黒田さん指示）で廃止し、認知→信頼→行動はツール個別ページと同一の「制作者カード → CTA セクション」に一本化**。ポータルトップもツールカードグリッドの下に**ツール個別ページと同じ partial（同マークアップ/クラス/コピー/リンク）の制作者カード→CTA**を配置する（§5-1）。ポータルトップでは**ツール完了時CTA は置かない**（行動導線は下部の制作者カード＋CTAセクションに集約）。
- **カードグリッド**: `repeat(auto-fill, minmax(280px, 1fr))`、gap `--space-5`。各カードは本体 work-card 準拠（bg-elevated / 1px border / radius-md / hover translateY+shadow-md・全面リンク）。
- **カード内**: 上にカテゴリバッジ（pill・accent-bg 地に accent 文字 or muted）→ ツール名（H2・`--fs-lg`・見出しフォント）→ タグライン（`--fs-sm` muted）。`status: published` のみ表示。将来「準備中」を出すなら別バッジ（warning 系）。
- **あしらい**: フラット基調。accent は「カテゴリバッジ・hover の焦点・カード内の細い天面ライン（任意）」だけに点で効かせる。面で塗らない（静けさ重視）。

### 3-2. ツールページの共通枠 `/tools/{slug}/`（器）

**役割**: 個別ツールを載せる「額縁」。本体逆導線とパンくずで回遊・営業導線を担保（PLAN.md §2-4）。

- **構成（上から）**: ヘッダー（ポータルと共通）→ パンくず `Home › Tools › {ツール名}`（本体 `_c-breadcrumb.scss` 準拠・ol/`›`・最後は aria-current）→ ツールヘッダー（H1 ＝ ツール名・リード）→ **ツール本体エリア（器）** → **③ 下部ファネルブロック（制作者カード → CTA セクション）** → フッター。
- **パンくず**: 本体 `_c-breadcrumb.scss` の実値で再現（§1-7(c)）。`nav.c-breadcrumb > ol`、区切り `›`（色 `--color-border-strong`）、リンクは muted→accent hover、現在地は muted・非リンク・aria-current。
- **ツール本体エリア（器）**: `--tool-panel-*` トークンで「操作パネル」を 1 つ以上置ける器。中身（image-compress のプリセット等）は F2/F3。ここでは「パネルの角丸・余白・ドロップゾーン・フォームのトーン」だけ定義（`tokens.css` §4）。
- **③ 下部ファネルブロック（修正3＋★整理 / partial 想定・全ツールページ下部に常設）**: §5 で詳述。「制作者カード（認知→信頼 / Works＋Skills＋お問い合わせ）」と「本体踏襲 CTA お問い合わせセクション（行動 / 背景画像）」を**ファネル順に縦配置**。Mado 案B（`01_navigation-funnel-design.md`）の確定設計。
- **広告なし**: ツール本体は完全に広告フリー（PLAN.md §3）。器に広告枠を設けない。

### 3-3. 概念モックアップ

ポータルトップとツールページ器の主要レイアウトを伝える **軽量 HTML モック 1 枚** を同ディレクトリに同梱:
`design/concept-mock.html`（ライト/ダーク両方を 1 ファイルで確認できる・tokens.css を読み込む・ビジュアルリファレンス用。本番 CSS ではない）。

---

## 4. Phase2 黒田さんレビュー確定事項（反映済み）

Phase1 の ★要確認1〜2 はレビューで確定済み。確定内容を以下に記録（モック・tokens に反映済み）。

| 論点 | Phase2 確定 | 反映 |
|---|---|---|
| **ロゴ表記** | **「Frontend」/「Tools」の 2 行**。本体ロゴ実値（§1-7(a)）に合わせ**両行とも太字・同サイズ**（差は line2=accent 色のみ）。Phase1 で 2 行目が細く小さく見えた不具合を是正 | concept-mock `p-header__logo` |
| **ヘッダーナビ（案B確定）** | **自立シンプル**（tools 内の「ツール一覧／カテゴリ」）＋ **ダーク切替トグル** ＋ **お問い合わせ CTA**（`/contact/`）。**ナビに制作実績/Portfolio 項目は出さない**（destination 性維持・Mado §5-3） | concept-mock `p-header__nav` |
| **ダーク切替トグル** | 本体 `c-color-toggle` と同一（§1-7(b)・スライドトラック型・sun/moon SVG・寸法）を設置 | tokens `--toggle-*` ＋ mock |
| **パンくず** | 本体 works 詳細と同一（§1-7(c)・ol/`›`）。`Home › Tools › {ツール名}` | concept-mock `c-breadcrumb` |
| **下部 CTA セクション** | 本体 `p-cta` と同一（§1-7(d)・背景画像 + overlay・白文字中央）。**文章は黒田さん指定テキストに置換**（§5-2） | tokens `--bg-cta-image`/`--color-cta-overlay-*` ＋ mock |
| カテゴリバッジ色（旧★3） | 据え置き（(a) ニュートラル主 / (b) accent 比較を併記のまま。F2 で最終確定でよい） | mock 既存 |

---

## 5. ★整理: 下部ファネルブロック（制作者カード ＋ CTA セクション）の重複感解消

黒田さんレビューの ★整理（制作者カードと CTA お問い合わせセクションがどちらも下部に来る重複感をデザインで解決）への回答。

### 5-1. 解決方針 = 「統合」ではなく「ファネル順の縦配置 ＋ 視覚レイヤー差」

両者は**ファネル段階が違う**（制作者カード＝認知・信頼 / CTA セクション＝行動）。統合すると段階が潰れて「いきなり問い合わせ」に戻り、Mado 案B が解消したはずの認知・信頼段が再び抜ける。よって**統合せず、ファネル順（認知→信頼→行動）に縦に並べ、視覚レイヤーを変えて重複感を断つ**。

| ブロック | ファネル段階 | 視覚レイヤー（ここで差をつける） | リンク先 |
|---|---|---|---|
| ① 制作者カード（partial・全ツールページ下部に常設） | 認知 → 信頼 | **通常面**: `--color-bg-alt` 地・1px 枠・`--radius-lg`・**顔写真アバター**＋名前＋肩書き＋一言。読み物的に静か | 本体 **Works**＋**Skills**（**お問い合わせは抜く** / Phase3 §6 解1） |
| ② CTA お問い合わせセクション | 行動 | **full-bleed（横幅画面いっぱい）の面**: 背景写真（cta-bg）＋ overlay・白文字・中央・`--space-20` の縦余白。写真で強く打つ | 本体 **お問い合わせ**（`/contact/`）に**一本化** |

> **Phase3 更新（黒田さん第2次レビュー / 役割分担で被り解消）**: ①からお問い合わせを抜き、①は認知・信頼（顔写真＋名前＋肩書＋Works＋Skills）に専念、②（CTAセクション）に行動を一本化した。「お問い合わせが①と②で2回出る」重複感を、**視覚レイヤー差だけでなくリンクの役割分担でも**断つ（Mado §3「contactを段の最後に内包」とは、CTAセクション＝段の最後の解釈で整合）。詳細は §6。

- **重複に見えない理由**: ①は「カード（囲まれた静かな面）」、②は「全幅の背景写真（環境を変える面）」で**視覚的な性質が根本的に違う**。同じトーンの箱が 2 個続くわけではないので、連続しても「言い直し」感が出ない。むしろ①で人物像が立ち上がり、②で背景写真が空気を変えて「では相談へ」と背中を押す、自然なクライマックス構成になる。
- **お問い合わせの重複（Phase3 で確定解消）**: Phase2 では①の最終リンクにもお問い合わせを置いていたが、黒田さん第2次レビューで「①と②に2回出る被り」を**役割分担（解1）で解消**＝①からお問い合わせを抜き認知・信頼に専念、②に行動を一本化。`/contact/` に向くのは②のみ（ヘッダー/フッターのCTAは面の補強として別途）。
- **ポータルトップとの役割分担（Phase7 で更新）**: 旧案ではポータルトップに制作者カードの代わりに **About 的ひとこと**を 1〜2 行だけ置いていたが、**Phase7 でこれを廃止し、ポータルトップにもツール個別ページと同じ「制作者カード → CTA セクション」を同様に配置**（同 partial・同マークアップ/クラス/コピー/リンク）。＝両ページの下部構成を「ツール一覧／本体エリア → 制作者カード → CTA」で統一する。**ツール完了時 CTA は入れない**（黒田さん確定・カードに集約）。

### 5-2. CTA セクションのテキスト（→ Phase3 で「流入意識コピー」に変更）

Phase2 では本体踏襲テキスト（「お問い合わせはこちら／Web制作・業務委託のご相談はこちらから。3営業日以内に返信いたします。」）で確定としていたが、**黒田さん第2次レビューで「ツール→本体流入を意識したコピーに変更」の指示**が出た。コピー案2〜3とモック採用案・★要確認は **§6-3 に移管**（本Phase2記述は履歴として残置）。

### 5-3. ★要確認（残論点・軽微）

- **★要確認A（制作者カードのアバター）→ Phase3 で確定**: 黒田さんレビューで**顔写真（本体 `assets/images/profile.webp`）採用**に確定。イニシャル円「K」は撤回。§6 反映済み。
- **★要確認B（CTA セクションの配置重み）**: 全ツールページ下部に「背景写真の full CTA」を常設すると、ツールによっては「道具棚」感より「営業」感がやや勝つ可能性。気になる場合は **CTA セクションはポータルトップ＋主要ツールのみ／個別ツール下部は制作者カードまで**に絞る選択も可（Mado ★1 の許容度判断と連動）。モックは「全ページ常設」で描画。

---

## 6. Phase3 黒田さん第2次レビュー確定事項（反映済み / 2026-06-16）

黒田さんの第2次レビュー（6点）を反映。本節で新規抽出した本体実値の出典パスと確定内容を記録（モック・tokens に反映済み）。

### 6-1. 確定6点と反映先

| # | 黒田さん指摘 | 確定内容 | 反映先 |
|---|---|---|---|
| 1 | アバター＝顔写真 | イニシャル円「K」→ 本体 `profile.webp`（顔写真）。`--maker-avatar-image` で相対参照（実在確認済み） | tokens §5・mock `.c-maker-card__avatar` |
| 2 | 被り解消（解1＝役割分担） | 制作者カードから**お問い合わせを抜き**、認知・信頼（顔写真＋名前＋肩書＋Works＋Skills）に専念。行動は下部CTAに**一本化** | mock `.c-maker-card__links`・design §5-1 |
| 3 | CTA full-bleed | CTAを**横幅画面いっぱい**に。本体 p-cta 同様 `.l-container`（main）の外に出し、背景を viewport 全幅化。テキストのみ `.p-cta__inner`（container-wide）で制約 | mock `.p-cta`/`.p-cta__inner` |
| 4 | CTAコピー＝流入意識 | ツール→本体（制作の相談）への流入を意識したコピーに変更。推し案1をモック反映。**最終文言は対外コピーのため★要確認**（§6-3） | mock `.p-cta__title`/`__lead`・§6-3 |
| 5 | リンクを c-link-arrow に統一 | モック内のリンク色・ホバーの不統一を本体 `c-link-arrow` に統一（accent→accent-hover＋矢印 translateX(3px)・ライト/ダーク両対応） | tokens §1 `--link-arrow-*`・mock `.c-link-arrow` |
| 6 | カード hover/click を本体準拠 | hover=`translateY(-2px)`＋`shadow-md`／active=`translateY(0)`＋`shadow-none`＋`transition-zero`（本体 work-card と同値） | mock `.c-tool-card:hover/:active` |

### 6-2. Phase3 で追加抽出した本体実値（実ファイル / 推測なし）

#### (e) c-link-arrow（出典: `assets/styles/components/_c-link-arrow.scss`）

- 基本: `display: inline-flex`・`gap: --space-1`・`align-items: center`・`font-weight: --fw-medium`・`color: --color-accent`・`transition: color --transition-base`。
- 矢印: `&::after { content: "→"; transition: transform/color --transition-base }`。
- hover・focus-visible: `color: --color-accent-hover` ＋ `&::after { color: --color-accent-hover; transform: translateX(3px) }`。
- **色はテーマ追従**（ライト accent `#2ba89c`→hover `#239084` / ダーク accent `#5dd9cb`→hover `#7ae3d7`）＝既存 `--color-accent(-hover)` をそのまま使うのでライト/ダーク両対応が自動で成立。
- **→ モック内のリンク（ヒーローのAbout的ひとことリンク・制作者カードのWorks/Skillsリンク）をこの1系統に統一**。HTML側のラベルから手書きの「→」を外し、`::after` の矢印に任せる。新トークン `--link-arrow-shift(3px)`・`--link-arrow-gap` を tokens §1 に追加。

#### (f) カード hover/active（出典: `assets/styles/components/_c-work-card.scss` L26-42）

- 初期: **影なし**（フラット）。
- hover: `box-shadow: --shadow-md` ＋ `transform: translateY(-2px)`（top works プレビュー `.c-card--click` と同値）。
- active（クリック中）: `box-shadow: --shadow-none !important` ＋ `transform: translateY(0)` ＋ `transition: transform --transition-zero`（押下を即反応に）。
- **→ Phase2 モックは hover のみで active 状態が無かった**。本体実値どおり active（戻り＋影消し＋transition-zero）を `.c-tool-card:active` に追加（修正6）。※ design-concept §1-5 の旧記述「アクティブ: 移動なし・影なし」は方向は合っていたが、`transition-zero` による即時化と `shadow-none` の明示が抜けていたので本節で精緻化。

#### (g) p-cta の full-bleed 構造（出典: `components/p-cta.html`・`index.html` L210-211・`_p-cta.scss`）

- **本体 `.p-cta` は `<main>` の直下に置かれる full-bleed セクション**（`index.html` で `</main>` 直前・他セクションの `.l-container--wide` の外）。
- `.p-cta` 自身が背景（`background-color: --color-primary` フォールバック → `linear-gradient(overlay,overlay)` → `--bg-cta-image` の重ね）を持ち **viewport 全幅**に広がる。
- **テキストは `.p-cta` の内側の `.l-container--wide` で中央・幅制約**（背景は全幅のまま・テキストだけ 1200px 内）。
- **→ Phase2 モックは `.p-cta` を `<main class="l-container">`（1100px）の中に置いていたため背景が全幅にならなかった**。本体構造に合わせ `</main>` の後に `.p-cta` を出し、テキストを `.p-cta__inner`（container-wide）で包んで full-bleed を実現（修正3）。

### 6-3. ★要確認: CTAコピー案（流入意識 / 最終文言は Sara・黒田確認で確定）

ファネル設計 `01_navigation-funnel-design.md` §3 行動段階のコピー方向（「Web制作のご相談 →」）を踏まえ、ツール→本体への流入を意識した案を3つ用意。**モックには推し案1を反映**。最終文言は対外コピーのため確定せず ★要確認（Sara レビュー → 黒田さん確認）。

| 案 | 見出し | リード | ボタン | 性格 |
|---|---|---|---|---|
| **案1【推し・モック採用】** | この道具を作っているのは、Web制作を請けている黒田です。 | LP・WordPress・静的サイト制作のご相談はこちらから。3営業日以内に返信します。 | Web制作のご相談 | 作り手＝制作者の文脈から自然に相談へ橋渡し。認知→行動を1文で繋ぐ。流入意識と道具棚らしさのバランス良 |
| 案2 | ツールが役に立ったら、制作のご相談も。 | 実案件で使っている道具です。Web制作・業務委託のご相談はこちらから。3営業日以内に返信します。 | Web制作のご相談 | ツール利用の満足感を相談動機に転換。やや営業寄り |
| 案3 | お問い合わせはこちら（本体踏襲） | Web制作・業務委託のご相談はこちらから。3営業日以内に返信いたします。 | お問い合わせ | 流入意識は弱いが本体と完全統一。道具棚らしさ最優先なら |

> **★要確認（コピー確定）**: 案1は「制作者＝黒田です」と名乗ることで顔写真アバター（制作者カード）との一貫性が出る一方、CTAセクション単体で見ると「自己紹介」要素が強い。制作者カード（①）で既に名乗っているため、②でもう一度名乗ると冗長と感じる可能性もある（その場合は案2が無難）。**Sara のSEO/トーンレビュー＋黒田さん判断**で確定。Phase2 で「本体踏襲テキストで辻褄が合う」と判断した §5-2 の記述は、本レビューで「流入意識コピーへ変更」の指示が出たため案3として残し、案1を新たな推しとする。

---

## 7. Phase4 黒田さん第3次レビュー確定事項（反映済み / 2026-06-16）

黒田さんの第3次レビュー（4点）を反映。新規抽出した本体実値の出典パスと確定内容を記録（モック・tokens に反映済み）。

### 7-1. 確定4点と反映先

| # | 黒田さん指摘 | 確定内容 | 反映先 |
|---|---|---|---|
| 1 | CTAコピー確定＋リード削除 | 見出し=**「制作のご依頼・ご相談も承っています」**／ボタン=**「制作のご相談」**。**リード文は削除**（旧「Web制作・業務委託のご相談はこちらから。3営業日以内に返信いたします。」は不要）。リードが無くなる分、見出しの存在感を上げ（`clamp(fs-2xl, 4.5vw, fs-4xl)`・見出し下 `--space-8`・`max-width: 24ch`）、**見出し＋ボタンだけで full-bleed 背景画像セクションが成立**するようレイアウト調整 | mock `.p-cta__title`/`.p-cta__action`（`.p-cta__lead` 削除） |
| 2 | 制作者カードの名前 | 「黒田 康介」→ **「黒田 こうすけ」（ひらがな）**。肩書・説明・リンクは現状維持 | mock `.c-maker-card__name`・avatar aria-label |
| 3 | フッターを本体に寄せる | 本体 `p-footer` の **3カラム**（左=ロゴ「Frontend Tools」／中央=ナビ／右=SNS集）＋ © 行に寄せる。SNS は本体踏襲（**X `https://x.com/kurodalog`／GitHub `https://github.com/kkurodalog`／frontend-note `https://frontend-note.blog`**・アイコンSVGも本体マークアップ踏襲）。© は本体同一**「© 2026 Kosuke Kuroda」**。色・余白・区切りは本体 `_p-footer.scss` から抽出（§7-2） | mock `.p-footer*`・tokens §6 |
| 4 | パンくずのホバー transition | 今回モックでは無理に直さず、**Cody 実装時に本体 `_c-breadcrumb.scss` のホバー transition を参照して同様に設定**する申し送りを明記（本体実値併記＝§7-3） | design §7-3（Cody 申し送り） |

### 7-2. Phase4 で追加抽出した本体フッター実値（実ファイル / 推測なし）

#### (h) 本体フッター構造・スタイル（出典: `assets/styles/projects/_p-footer.scss`・`components/p-footer.html`）

- **マークアップ**: `footer.p-footer > .l-container.p-footer__inner`（`.p-footer__brand`（ロゴ2行）/ `nav.p-footer__nav` / `ul.p-footer__sns`）＋ 別ブロック `.p-footer__bottom > p.p-footer__copyright`。
- **★最重要特性＝常時ダーク固定面**: 本体フッターは**ライト/ダーク問わず濃色固定**（`_p-footer.scss` L17 背景 `#0a0e14`・L186/L192 で `data-color-scheme`/`prefers` でも同値上書き、L16 文字 `#e6edf6` 固定）。Tools も同方式で揃える（地続き）。tokens §6 はこの思想に従い**テーマ非依存の固定値**で定義。
- **3カラムレイアウト（PC ≥1024px / mq(xl)）**: `.p-footer__inner` を `grid-template-columns: 1fr 1fr 1fr; align-items: center`、`brand=justify-self:start` / `nav=center` / `sns=end`（L136-151）。SP は grid 縦積み（`gap: --space-8`）。
- **ロゴ**: `fs-lg` → PC `fs-xl`、`font-heading`・`fw-bold`・`line-height 1.15`。line2「Portfolio」のみ `#5dd9cb` 固定（L62・F17）。Tools では「Frontend / Tools」に置換し line2=accent 固定で整合。ホバー `opacity .7`。
- **ナビ**: リンク `fs-sm`・色 `#e6edf6`・`opacity .85` → hover で `--color-accent`・`opacity 1`（L73-91）。PC は `flex-wrap: nowrap`。
- **SNS**: SP=横並び（アイコン+テキスト横）／PC=**縦並び**（アイコン上・テキスト下 `fs-xs`・`text-align center`）（L165-180）。アイコン `--icon-size-base`（20px / L192）。色 `#e6edf6`・`opacity .85` → hover accent。
- **SNS アイコンSVG（本体 `p-footer.html` L19-60 踏襲）**: X は SimpleIcons X path（`fill=currentColor`）／GitHub は SimpleIcons GitHub path（`fill=currentColor`）／frontend-note は Lucide book-open 系（`fill=none stroke=currentColor stroke-width=1.75`）。本体ラベルは「Tech Blog」で frontend-note 実体＝Tools も踏襲。
- **© 行**: `.p-footer__bottom` = `border-top rgb(255 255 255 / 15%)`・`text-align center`・`padding-block --space-5`（L116-120）。`.p-footer__copyright` = `font-family-en`・`fs-sm`・色 `rgb(255 255 255 / 65%)`・`letter-spacing --ls-wide`。文言「© 2026 Kosuke Kuroda」。
- **→ tokens.css §6 に `--footer-bg`/`--footer-text`/`--footer-logo-accent`/`--footer-copyright-color`/`--footer-divider-color`/`--footer-link-opacity` ＋ 余白系（`--footer-pad-top`/`--footer-inner-gap` 等）を本体派生で追加。mock の旧「bg-alt 地・border-top・flex 縦積み」フッターを本体準拠の 3カラム＋濃色固定＋ SNS＋© 構造に差し替え**。

### 7-3. ★Cody 申し送り: パンくずのホバー transition

黒田さんレビューで「パンくずのホバー transition がモックで未設定」の指摘。**今回はモックを無理に直さない**方針のため、Cody 実装時に以下を反映する申し送りとして記録する。

- **本体 `_c-breadcrumb.scss` の実値（出典: `assets/styles/components/_c-breadcrumb.scss` L10-33）**:
  - `.c-breadcrumb` = `padding-block: --space-4`・`fs-sm`・色 `--color-text-muted`。
  - `.c-breadcrumb__list a` = 既定 `--color-text-muted` → `@include hover { color: --color-accent }`。
  - **重要な実態**: 本体 `_c-breadcrumb.scss` には **`a` に `transition` の明示がない**。`foundation/_base.scss` の `a`（L12-17）にも transition 指定がない。**＝本体パンくずのホバー色変化は現状「即時切替（transition なし）」**。
- **Cody 実装方針（2択 / 黒田さん最終判断）**:
  - **(A) 本体に完全準拠**＝パンくずリンクは transition を付けない（本体と同じ即時切替）。**最も忠実**。
  - **(B) Tools 内の他リンク（c-link-arrow / ヘッダーナビ）と体感を揃える**＝`transition: color var(--transition-base)`（200ms ease-out）を付与。本書の他リンクは皆 `--transition-base` でホバーするため、**統一感を優先するなら (B)**。
- **Haru 推奨**: 本体世界観統一が最優先方針のため **(A)（本体準拠＝transition なし）を基本**とする。ただしモック内の他リンクが滑らかにホバーする中でパンくずだけ即時だと「設定漏れ」に見える懸念があるなら (B)。**この1点のみ黒田さん最終判断**（★要確認）。

---

## 8. Phase5 フッターナビ最終確定（反映済み / 2026-06-16）

黒田さん＋Mado の情報設計（`01_navigation-funnel-design.md` §8）で**フッター中央ナビが最終確定**したので反映。これで Fd デザイン論点はクローズ。

### 8-1. 確定したフッター中央ナビ最終形（2グループ）

フッターは従来どおり3カラム（左ロゴ「Frontend Tools」／中央ナビ／右SNS集）。**中央ナビのみを以下の2グループ構成に差し替えた**。

| グループ | 見出し | リンク項目 → URL | 役割 |
|---|---|---|---|
| **G1** | **このツール集について** | **カテゴリ「画像」**（`tools.json` の image-compress の category）→ カテゴリページ（**URL未確定＝仮リンク `#`**） | ツール内回遊（destination の自立） |
| **G2** | **制作・運営** | 制作実績 → `/works/`／スキル・対応範囲 → `/skills/`／プロフィール → `/about/`／制作のご相談 → `/contact/` | 本体送客（信頼＋行動・マネタイズ本命） |

- **G1 から排除したもの**: 旧案の「お問い合わせ」「ツールトップ」「Home（本体）」は**置かない**。ロゴ「Frontend Tools」が `/tools/` トップへの帰還を独占するため「トップ語」をフッターに重複させない（＝「トップ2枚」「内部語『本体』」問題の解消）。`/contact/` は G2 の「制作のご相談」に集約。
- **G1 のカテゴリ**: ヘッダーナビの「カテゴリ」と整合。**今後ツールが増えてカテゴリが増える前提**で、現状は image-compress の category＝「画像」のみを出す。
- 旧フラット1列（`ツールトップ / Home（本体）/ 制作実績 / スキル・対応範囲 / お問い合わせ`）は撤回。

### 8-2. ★D ラベルの文脈使い分け（確定）

同じ `/contact/` でも、**文脈でラベルを使い分ける**（Mado §8-7 ★D の確定）。

| 配置 | ラベル | 文脈 |
|---|---|---|
| ヘッダー右端 CTA | **「お問い合わせ」** | 汎用・本体統一の窓口 |
| 制作者カード（の先の行動）・CTAセクション・**フッターG2** | **「制作のご相談」** | 営業文脈 |

mock 上で全箇所整合済み（ヘッダー＝「お問い合わせ」／CTAセクション・フッターG2＝「制作のご相談」）。

### 8-3. ★C 確定（別ドメイン併記なし）

「制作実績」等に `（kurodafolio.com）` 等の**別ドメイン併記はしない**（同一オリジン kurodafolio.com 内遷移のため。Mado §8-7 ★C 確定）。「制作・運営」見出し自体が運営主体を語る役を担う。

### 8-4. ★Cody 申し送り（フッターナビ）

- **カテゴリページの URL 構造は Cody 実装時に確定**する。mock では G1 のカテゴリ「画像」を仮リンク `#` で置いている。実装時にカテゴリページ（例: `/tools/category/{slug}/` 等）の URL を決め、ヘッダーナビ「カテゴリ」とフッターG1のリンク先を揃えること。
- **2グループの見出し・グループ区切りの具体 CSS は Cody が本体トーンで実装**する。mock の `.p-footer__nav-group` / `.p-footer__nav-heading` / `.p-footer__nav-list` は方向提示用の簡易表現。本体 `_p-footer.scss` のナビ実値（`fs-sm`・色 `#e6edf6`・`opacity .85` → hover accent）を踏まえつつ、見出しは控えめ（`fs-xs`・muted 寄り）に置くと2系統の腑分けが効く。
- ツールが増えカテゴリが増えたら G1 のリンクを追加する（partial 化で全ツールページに自動反映）。

---

## 9. Phase6 黒田さん修正3点（反映済み / 2026-06-16）

黒田さんの修正3点（フッター3BP配置・アバター拡大・CTAリード復活）を反映。

### 9-1. 修正1: フッターナビのレスポンシブ配置（3ブレークポイント）

フッターは3要素＝① ロゴ「Frontend Tools」／② 中央ナビ（2グループ）／③ SNSリンク集。BP ごとに配置を切り替える（mock の `.p-footer__inner` を `grid-template-areas` で組み替え。**フッターは共通クラスのため両ページ（ポータル／ツール）に自動反映**）。

| ブレークポイント | 配置 |
|---|---|
| **768px未満** | **現状維持**（grid 縦積み＝上から ロゴ → ナビ → SNS）。**変更しない**（黒田さんOK済み） |
| **768〜1023px** | **2カラム = 左[ロゴ＋ナビ縦積み] / 右[SNS]**。`grid-template-columns: 1fr auto` ＋ areas `"brand sns" / "nav sns"`。**`align-items: start`（上端揃え）**で左カラム最上部のロゴと右カラムの SNS が上端で揃う。SNS は `align-self: start` |
| **1024px以上** | **3要素横並び・全て上揃え**。`grid-template-columns: auto 1fr auto`＋`align-items: start`。**ロゴ=`width: fit-content`（中身幅・auto 列）**／**ナビ=左寄せ（`justify-self: start`）**（旧 center から変更）／**SNS=右寄せ（`justify-self: end`）**。SNS は本体 mq(xl) 踏襲で縦並び（アイコン上・テキスト下） |

- **設計意図**: 768〜1023px は横幅に余裕が出るが3カラム均等にはまだ狭いため、関連の強い「ロゴ＋ナビ（ブランド／回遊系）」を左に束ね、行動・外部リンクの SNS を右に独立させる。上端揃えにすることで、左カラムが2段（ロゴ＋ナビ）でも右の SNS が宙に浮かず、視線の起点（上端）が揃う。
- 1024px 以上は本体フッターの3カラム思想を維持しつつ、黒田さん指示で**ロゴを fit-content**（余分な列幅を持たせない）・**ナビを左寄せ**（旧 center を是正＝左の塊として読ませる）・**SNS を右寄せ**に確定。

### 9-2. 修正2: 制作者カードのアバター拡大（本体トップ自己紹介円に合わせる）

- 制作者カードのアバター（`profile.webp`）が旧 72px で、本体トップの自己紹介円より明らかに小さかったため、**本体実値に合わせて拡大**。
- **本体実値（出典: `projects/_self/kurodafolio/06_implementation/dev/src/assets/styles/projects/_p-about-excerpt.scss` L25・L74）**: `.p-about-excerpt__photo` = **SP/タブレット `rm(160)`（160px）→ PC（≥1024px / mq(xl)）`rm(200)`（200px）**・`border-radius: --radius-pill`・`object-fit: cover`。HTML（`index.html` L121）の `img` も `width/height=200`。
- **反映**: tokens `--maker-avatar-size: 160px`（SP/タブレット）＋ 新規 `--maker-avatar-size-pc: 200px`（PC）。mock は `.c-maker-card__avatar` を 160px・`@media (width >= 1024px)` で 200px に。本体の自己紹介円と同径になる。

### 9-3. 修正3: CTAセクションにリード文を復活

- Phase4 でリードを削除し見出し＋ボタンのみにしていたが、黒田さん指示で**リードを復活**。
  - 見出し: **「制作のご依頼・ご相談も承っています」**（現状維持）
  - リード（**見出し下に追加**）: **「Web制作・業務委託のご相談はこちらから。3営業日以内に返信いたします。」**
  - ボタン: 「制作のご相談」（現状維持）
- **レイアウト再調整（Haru 判断）**: Phase4 はリード無し前提で見出しを `clamp(fs-2xl, 4.5vw, fs-4xl)`＋見出し下 `--space-8` まで上げていた。リード復活で見出しが大きすぎるとリードが負けるため、**見出しを `clamp(fs-2xl, 4vw, fs-3xl)`・見出し下 `--space-4`**（見出し→リードを一塊に）に落とし、**リードは本体 `_p-cta.scss` 準拠で `fs-lg`・白88%（`rgb(255 255 255 / 88%)`）・`max-width: 56ch`・リード下 `--space-8`**（ボタンまで間）で挟む。full-bleed 背景画像セクションに見出し＋リード＋ボタンの3点が自然に収まる構成。

---

## 10. Phase7 黒田さん指示（反映済み / 2026-06-16）

ポータルトップ（`/tools/`）下部の構成を変更。

### 10-1. 変更内容

| # | 黒田さん指示 | 確定内容 | 反映先 |
|---|---|---|---|
| 1 | About的ひとことを削除 | ポータルトップのヒーロー内 `.p-hero__intro`（「作っているのは、フロントエンド制作を請けている黒田です。…制作実績はこちら」）を**セクションごと削除**。CSS の `.p-hero__intro` ルールも撤去 | mock ヒーロー・CSS |
| 2 | 代わりに制作者カード＋CTAをポータルトップにも配置 | ツール個別ページ下部の **制作者カード（`.c-maker-card`）→ CTA セクション（`.p-cta`）** を、**同一マークアップ/クラス/コピー/リンク（共通partial想定）**でポータルトップにも配置。＝両ページの下部構成を「ツール一覧／本体エリア → 制作者カード → CTA」で統一 | mock ポータルトップ `.p-maker`/`.p-cta` |

- **配置順**: ツール一覧カード群（`.p-tools`）は維持し、その**下**に制作者カード（`<main>` 内末尾）→ CTA（`</main>` の後・full-bleed）→ フッター。ツール個別ページと同じ並び順。
- **不変更**: ヘッダー・ツール一覧カード群・フッター・他 BP・tokens.css・本番 CSS（dev/src/）は触っていない（既存の `.c-maker-card`/`.p-cta` 定義をそのまま流用）。

## 検証済み

- 検証済み（Phase7）: ポータルトップの About的ひとこと（ヒーロー内 `.p-hero__intro`「作っているのは…制作実績はこちら」）を HTML/CSS とも削除した（mock ヒーローは H1＋リードのみに）。
- 検証済み（Phase7）: ポータルトップにツール個別ページと同一の制作者カード（`.c-maker-card`・黒田こうすけ＋肩書＋説明＋Works/Skills の c-link-arrow）→ CTA セクション（`.p-cta`「制作のご依頼・ご相談も承っています」＋リード＋「制作のご相談」ボタン）を、同マークアップ/クラス/コピー/リンクで配置（共通partial想定）。カードは `<main>` 内末尾・CTA は `</main>` 後の full-bleed でツール個別ページと同じ並び順。
- 検証済み（Phase7）: ツール一覧カード群（`.p-tools`）・ヘッダー・フッターは維持（差し替えは下部ファネルブロックの追加と About的ひとことの削除のみ）。tokens.css・本番 CSS（dev/src/）は不変更。
- 検証済み（Phase5）: フッター中央ナビを2グループ最終形に差し替えた（両ページ）。G1「このツール集について」＝カテゴリ「画像」のみ／G2「制作・運営」＝制作実績(/works/)・スキル・対応範囲(/skills/)・プロフィール(/about/)・制作のご相談(/contact/)。mock の `.p-footer__nav` を `concept-mock.html` の両フッター（ポータルトップ／ツールページ）で差し替え。
- 検証済み（Phase5）: G1 から「お問い合わせ」「ツールトップ」「Home（本体）」を排除（ロゴが /tools/ を独占・/contact/ は G2 集約）。トップ2枚・内部語問題の解消を §8-1 に記録。
- 検証済み（Phase5）: ★D ラベル文脈使い分け（ヘッダーCTA=「お問い合わせ」／制作者カード・CTAセクション・フッターG2=「制作のご相談」）が mock 全箇所で整合（ヘッダー L435/L548＝「お問い合わせ」／CTAセクション＝「制作のご相談」／フッターG2＝「制作のご相談」）。
- 検証済み（Phase5）: カテゴリページ URL を Cody 申し送り（§8-4）に明記し、mock では仮リンク `#` で置いた。★C（別ドメイン併記なし）も §8-3 に記録。
- 検証済み: 本体の色・フォント・余白を実ファイルから抽出し出典パス併記（§1 全項目に `global/_variables.scss` / `foundation/_base.scss` / `components/_c-*.scss` の出典を明記。推測なし）。
- 検証済み（Phase2）: ロゴ・トグル・パンくず・CTA セクションを本体の実ファイルから追加抽出し出典パス併記（§1-7 に `_p-header.scss`・`_c-color-toggle.scss`・`_c-breadcrumb.scss`・`_p-cta.scss`・`_variables.scss L210-212`・`components/p-header.html`・`p-cta.html` の実値と行番号を明記。推測なし）。
- 検証済み（Phase2）: ロゴ 2 行目「Tools」の細見え不具合を是正（本体実値＝両行 fw-bold + fs-lg/xl・差は色のみ を §1-7(a) で抽出し、旧モックの fs-xs/uppercase/muted を撤回。差は line2=accent 色のみに修正）。
- 検証済み（Phase2）: 制作者カード（Works＋Skills＋お問い合わせ）と CTA セクションの重複感をデザインで解決（§5-1: 統合せずファネル順縦配置＋視覚レイヤー差＝カード面 vs 背景写真 full-bleed 面 で性質を変え重複を断つ）。導線は本体実在ページ（works/skills/contact）のみ。
- 検証済み（Phase2）: CTA セクションの文章を黒田さん指定テキストに置換し、背景画像あり（本体 cta-bg.webp/png 流用 + overlay）スタイルで再現（§5-2 / mock `.p-cta`）。
- 検証済み（Phase3）: アバターを本体 `profile.webp` に変更（`assets/images/profile.webp` の実在を `ls` で確認・9862 bytes。tokens `--maker-avatar-image` で design/ からの相対パス到達も確認）。
- 検証済み（Phase3）: 制作者カードからお問い合わせを抜き、行動を下部CTAに一本化（mock `.c-maker-card__links` は Works/Skills の2リンクのみ・`__link--cta` クラス撤去。被り解消＝役割分担 §5-1）。
- 検証済み（Phase3）: CTAを full-bleed 化（mock で `.p-cta` を `</main>` の後に出し背景を viewport 全幅化・テキストは `.p-cta__inner` で制約。本体 `index.html` L210-211 の「p-cta は main 直下・内側に container」構造を実ファイルで確認して再現）。コピーは流入意識案1を反映し、**最終文言は★要確認**（§6-3 / Sara・黒田確認）と明記。
- 検証済み（Phase3）: c-link-arrow を本体 `_c-link-arrow.scss` から実値抽出（accent→accent-hover＋矢印 translateX(3px)）し、モック内リンクを統一。色はテーマ追従トークンを使うためライト/ダーク両対応（ライト #2ba89c→#239084 / ダーク #5dd9cb→#7ae3d7）。
- 検証済み（Phase3）: カードの hover/active を本体 `_c-work-card.scss` L26-42 の実値で反映（hover=translateY(-2px)+shadow-md / active=translateY(0)+shadow-none+transition-zero）。Phase2 で欠けていた active 状態を追加。
- 検証済み（Phase4）: CTA をコピー確定＋リード削除し、見出し＋ボタンのみで成立させた（mock `.p-cta__title`「制作のご依頼・ご相談も承っています」＋ `.c-btn--large`「制作のご相談」のみ。`.p-cta__lead` を HTML/CSS とも削除。見出しを `clamp(fs-2xl,4.5vw,fs-4xl)`＋`max-width:24ch`＋見出し下 `--space-8` で存在感を上げ、full-bleed 背景画像セクションが見出し＋ボタンだけで成立する構成にした）。
- 検証済み（Phase4）: 制作者カード名を「黒田 康介」→「黒田 こうすけ」（ひらがな）に修正（mock `.c-maker-card__name` ＋ avatar aria-label。肩書・説明・リンクは維持）。
- 検証済み（Phase4）: フッターを本体 `_p-footer.scss` の 3カラム（左ロゴ「Frontend Tools」/ 中央ナビ / 右 SNS集）＋ © 行「© 2026 Kosuke Kuroda」に寄せた。SNS は本体 `p-footer.html` L19-60 のアイコンSVG・URL（X `https://x.com/kurodalog`／GitHub `https://github.com/kkurodalog`／frontend-note `https://frontend-note.blog`）を踏襲。色・余白・区切り・常時ダーク固定特性を `_p-footer.scss` から実値抽出して tokens §6 に追加（出典行番号併記）。両ページ（ポータル/ツール）のフッターを差し替え。
- 検証済み（Phase4）: パンくずのホバー transition を Cody 実装申し送りとして design §7-3 に明記。本体 `_c-breadcrumb.scss` の実態（a に transition 明示なし＝現状即時切替・`base.scss` の a も transition なし）を実ファイルで確認し併記。Cody 方針2択（A 本体準拠=transition なし / B Tools 内リンクと統一=`--transition-base`）＋ Haru 推奨(A)＋ ★要確認（黒田さん最終判断）を記載。モック自体は無理に変更していない。
- 検証済み: 本番 CSS（dev/src/）を書き換えていない（成果物は docs/_portal/design/ 配下の tokens.css ＋ design-concept.md ＋ concept-mock.html のみ。dev/src/ は読み取りのみ。CTA 背景画像・profile.webp・フッター SNS アイコンSVG も本体 src の実物を相対参照/踏襲するだけで書き換えていない）。
- 検証済み（Phase6）: フッターを3ブレークポイントで配置（768未満=現状維持の縦積み変更なし／768〜1023=2カラム `1fr auto`・areas `"brand sns"/"nav sns"`・`align-items: start`で左ロゴと右SNSを上端揃え／1024+=`auto 1fr auto`・`align-items: start`・ロゴ`width: fit-content`・ナビ`justify-self: start`（左寄せ・旧centerを是正）・SNS`justify-self: end`）。`.p-footer__inner` は共通クラスのため両ページ（ポータル L504〜／ツール L674〜）に自動反映。
- 検証済み（Phase6）: 制作者カードのアバターを本体トップ「私について」の丸画像サイズに合わせて拡大（本体 `_p-about-excerpt.scss` L25 `rm(160)`／L74 mq(xl) `rm(200)` を実ファイルで確認・出典併記。tokens `--maker-avatar-size: 160px`＋新規 `--maker-avatar-size-pc: 200px`、mock `.c-maker-card__avatar` を 160px→1024px で 200px。旧 72px から拡大）。
- 検証済み（Phase6）: CTAセクションに見出し下リード「Web制作・業務委託のご相談はこちらから。3営業日以内に返信いたします。」を復活（mock `.p-cta__lead` を HTML/CSS とも追加）。見出しは fs-4xl→fs-3xl・見出し下 space-8→space-4 に再調整し、リード（本体 `_p-cta.scss` 準拠の白88%・fs-lg・56ch）と共存させた。見出し・ボタン文言は現状維持。
- 検証済み（Phase6）: 本番 CSS（dev/src/）を書き換えていない（成果物は docs/_portal/design/ 配下の tokens.css＋concept-mock.html＋design-concept.md のみ。`_p-about-excerpt.scss`・`_p-footer.scss`・`_p-cta.scss` は出典確認のため読み取りのみ）。
- 検証済み（Phase5 微調整）: フッター見出しを項目より大きく（`.p-footer__nav-heading` を fs-xs→fs-base / 減光 opacity 撤去）＋リスト段落下げ（`.p-footer__nav-list` に左 padding `--space-3`）で視覚階層（見出し＞リスト）を明確化。両ページのフッターに反映（共通クラスのため自動で両ページ適用）。
- 検証済み: positioning（フロント制作者向け）と整合し本体との世界観統一を説明（§2 で「器は本体統一・操作面のみアプリ的差分」を明示。destination/逆導線は §3 で PLAN.md §2-4 と整合）。
- 検証済み: 主要テキスト/背景のコントラスト WCAG AA（本体トークン採用。ライト: text-base `#0f1620` on bg `#fff` ≒ 16.9:1 / muted `#586674` on `#fff` ≒ 5.6:1（AA 通過）/ accent `#2ba89c` on `#fff` ≒ 2.9:1 は**大文字/装飾用に限定し本文文字色には使わない**＝白文字 on accent 背景でボタン運用。ダーク: text-base `#e6edf6` on `#03050a` ≒ 17:1 / muted `#a8b3be` on `#03050a` ≒ 9:1。いずれも AA 達成。本体 H QA で Lighthouse 検証済みのトークンをそのまま継承）。
