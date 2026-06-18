# F5 本体導線追加 設計方針 — 本体 kurodafolio → `/tools/` 順方向導線3点（最小変更）

担当: Haru（制作部 / デザインコンセプト・モックアップ・UI設計）
作成日: 2026-06-18
ステータス: **F5 本体導線設計・Mado 評価ゲート前**（黒田さん最終確認 → Cody 実装は確認後）
配置パス: `projects/_self/frontend-tools/docs/_portal/03_main-site-tools-routing-design.md`

---

## 0. 結論（先出し）

本フェーズで足すのは **本体 kurodafolio（パターンB・既存稼働サイト）→ ツールポータル `/tools/` への順方向導線3点**。
ツール側→本体の逆導線（制作者カード・2グループフッター・パンくず）は frontend-tools 側で実装済み＝**本ファイルの対象外**。

> **混同防止メモ（Should1）**: 本ファイルが扱う①ナビ追加は「**本体側**ヘッダーに『ツール』項目を足す（works と並ぶ第3カテゴリ）」であり、`mado-portfolio-link-design.md` §3-1 で**採用**判定された方向。`01_navigation-funnel-design.md` §5-3 が**非推奨**とした案C（**tools 側**ヘッダーに『制作実績』項目を足す＝tools の destination 性を壊す逆方向）とは**別物**。「ナビに項目を足す」という見かけは似るが、本体側＝採用／tools 側＝非推奨で判定が逆になる点に注意。本ファイルは前者（本体側・採用）のみを扱う。

| # | 導線 | 足す場所（本体既存ファイル） | 中身 | 優先 |
|---|---|---|---|---|
| ① | グローバルナビ「Tools」項目 | `components/p-header.html`（PC）＋ `components/c-mobile-nav.html`（SP）＋ `data/meta.json`（nav フラグ） | 「制作実績」の**直後**に第3カテゴリとして「ツール」リンク → `/tools/`。日本語ラベル「ツール」 | **必須・最優先** |
| ② | トップ「公開ツール」独立セクション | `index.html`（トップ）＋ 新規 `_p-tools-preview.scss`（推奨） | works とは**対等並列の独立セクション**。見出し「公開ツール」＋リード＋ツールカード（現状1枚）＋「ツール一覧を見る →」CTA。**works には混ぜない** | **必須** |
| ③ | フッターリンク | `components/p-footer.html`（＋必要なら `_p-footer.scss` の grid 微調整） | 既存 `p-footer__nav`（単一行6リンク）の「制作実績」直後に「ツール」→ `/tools/` を1本追加（面の補強） | 推奨 |

- **世界観の両立は「自動的に解決済み」**。Tools 側は Fd で本体トークン（b-tech-cool）を 1:1 継承して作られている（design-concept.md §1）。よって**本体側に足す Tools 導線は、新しい世界観を持ち込む必要が一切ない**＝本体の既存トークン・既存クラス（`c-work-card`・`c-section__*`・`c-link-arrow` 等）をそのまま流用すれば、本体トーンと Tools トーンの両方に自然に馴染む。**最小変更＝最良の世界観統一**になる稀有なケース。
- **最小変更の核**: ①②③いずれも**既存の構造・既存クラスの流用**で組み、新規 SCSS は②の薄いラッパー1枚に留める。本体の機能（ダークトグル・ハンバーガー・works フィルタ・CTA）には一切触らない。

---

## 1. 本体の実構造（実ファイル確認済み）— 導線を引く対象の特定

> すべて `kurodafolio/06_implementation/dev/src/` を実ファイル確認。存在しない構造には導線を引かない。

### 1-1. ヘッダー（`components/p-header.html`）
```
p-header__inner
├── p-header__logo（2行ロゴ: Kuroda Kosuke / Portfolio）
├── p-header__nav（横ナビ4リンク）
│     トップ / 私について / 制作実績 / スキル・対応範囲
│     ※各リンク: aria-current="{{#if page.nav.{key}}}page{{else}}false{{/if}}"
├── c-color-toggle（ダーク/ライト トグル・触らない）
└── p-header__contact（右端 独立CTAボタン「お問い合わせ」/contact/）
```
- ナビ4リンクは `page.nav.{key}` の boolean フラグ（key = home/about/works/skills/contact）で現在地を `aria-current="page"` 表示。**新規キー `tools` を1つ足せば同じ仕組みに乗る**。

### 1-2. SP モバイルナビ（`components/c-mobile-nav.html`）
```
c-mobile-nav__list（円形展開型 FAB / _drawer.js）
├── トップ
├── 私について
├── 制作実績
├── スキル・対応範囲
└── c-mobile-nav__item--contact（「お問い合わせ」c-btn--primary --block）
```
- PC（≥1024px）は CSS で非表示。ハンバーガー切替境界は本体 1024px（c-mobile-nav コメント L4）。**触るのはリスト項目の追加のみ**（FAB・展開ロジック `_drawer.js` は不変更）。

### 1-3. トップ `index.html` のセクション順
```
main#main
├── p-hero（ヒーロー / CTA）
├── #works「最新の制作実績」 … l-section--alt（c-grid--triad で c-work-card ×3 ＋ 「制作実績一覧を見る」c-link-arrow）
├── 「私について」 … l-section（p-about-excerpt）
├── 「ご相談いただける業務」 … l-section--alt（c-service-card ×4 ＋ tech-stack ＋ 「スキル・対応範囲を見る」）
└── {{> p-cta }}（メイン CTA「お問い合わせはこちら」）
```
- セクションは `l-section` ↔ `l-section--alt` の**背景交互**。見出しは `c-section__head` > `c-section__title` ＋ `c-section__lead`。一覧導線は `p-center-link` > `c-link-arrow`。
- カードは `c-work-card`（アンカー全面リンク・`<picture>` ＋ `c-work-card__title` ＋ `c-work-card__text` ＋ `c-work-card__tags`>`c-badge`）。グリッドは `c-grid--triad`。

### 1-4. フッター（`components/p-footer.html`）
```
p-footer__inner
├── p-footer__brand（2行ロゴ）
├── p-footer__nav（単一行 6リンク）
│     トップ / 私について / 制作実績 / スキル・対応範囲 / お問い合わせ / プライバシーポリシー
└── p-footer__sns（X / GitHub / Tech Blog）
p-footer__bottom（© 2026 Kosuke Kuroda）
```
- **重要**: 本体フッターは**単一行ナビ**。frontend-tools 側の「2グループフッター（このツール集について / 制作・運営）」とは別物＝本体には2グループ化を持ち込まない（本体の情報設計を壊さない最小変更）。「ツール」を1リンク足すだけ。

### 1-5. 既存ツール公開状況（`frontend-tools/dev/src/data/tools.json`）
- 現在 published のツールは **`image-compress`「画像仕分け圧縮くん」1件のみ**（category=画像）。
- → トップ②のカードは**現状1枚**。「新着3選」表現はまだ使わない（Mado §5-3 フェーズ追従＝初期は1〜2枚＋一覧導線）。

---

## 2. ① グローバルナビ「Tools」項目

### 2-1. 位置と並び（works と並ぶ第3カテゴリ）

PC ナビ（`p-header__nav`）に「ツール」を**「制作実績」の直後**に挿入する。

```
トップ / 私について / 制作実績 / ★ツール / スキル・対応範囲
```

- **なぜ「制作実績」の直後か**: Mado 分析（mado-portfolio-link-design.md §3-1 / 01_navigation-funnel §冒頭表）で Tools は「works と並ぶ第3カテゴリ」と位置づけ。works（請けた仕事）と tools（自分で作った道具）は**並列概念**なので、隣に置くと性質の並列が一目で伝わる。スキルの前に差すことで「実績→ツール（技術力の傍証）→スキル」という信頼の流れも自然。
- 末尾（スキルの後）に置く案もあるが、works と離れて並列性が弱まるため非推奨。
- ナビが 4→5 リンクになる。PC 幅（container-max 1280px）で5リンク＋ロゴ＋トグル＋CTAボタンが収まるかは**実機目視で確認**（design-concept の本体トーンは余白を広く取る思想なので、窮屈なら gap の微調整で吸収。ラベルは短い「ツール」なので破綻リスクは低い）。→ ★要確認3。

### 2-2. ラベル（日本語/英語）

**日本語「ツール」を推奨。** 理由:
- 本体ナビは**全項目が日本語**（トップ/私について/制作実績/スキル・対応範囲/お問い合わせ）。ここに英語「Tools」だけ混ぜると統一が崩れる。
- 「ツール」は誰でも瞬時に意味が取れる平易語。SEO 的にも内部リンクのアンカーは日本語で問題ない。
- ※ロゴ・Tools 側の世界観では英語表記「Frontend Tools」を使うが、それは**ツール世界の中の話**。本体ナビは本体の言語体系（日本語）に合わせる。→ ★要確認1（黒田さんの最終好み確認）。

### 2-3. リンク先・aria-current

- リンク先: `/tools/`（ツールポータルトップ・確定URL）。
- 現在地表示: `aria-current="{{#if page.nav.tools}}page{{else}}false{{/if}}"`。既存ナビの記法にそのまま揃える。
  - **meta.json 変更不要で確定（Must1・実機裏取り済み）**: 本体ナビは現に**全ページで `aria-current="false"` を出力して稼働中**（built `dist/index.html` で about/works/skills が `aria-current="false"` を出力していることを確認）。meta.json は各ページの `nav` キーを**1つだけ**持つ仕様（例: トップ `{"home":true}`）で、`{{#if page.nav.tools}}` の `tools` キーはどのページにも定義されない。Handlebars 標準 `{{#if}}` は未定義プロパティを falsy 評価して else 分岐に倒すため、**`tools` キーをどのページにも追加しなくても安全に `aria-current="false"` に倒れる**。p-header.html L9-11 のコメントも「非該当は `aria-current="false"`（ARIA 仕様の有効値）」と明記しており、これが既存仕様。よって**①ナビ追加に伴う meta.json の変更はゼロ**（既存ページの nav に `tools:false` を足す必要もない）。
  - これは「要実機確認」事項ではなく、既存稼働実績から**確定**している。Cody は確認作業不要でそのまま記法を踏襲してよい。

### 2-4. SP（ハンバーガー）側の反映

`c-mobile-nav.html` のリスト項目に「ツール」を**同じ位置（制作実績の直後）**で追加。

```
トップ / 私について / 制作実績 / ★ツール / スキル・対応範囲 / [お問い合わせ CTA]
```

- `<li class="c-mobile-nav__item"><a href="/tools/">ツール</a></li>` を1行追加するのみ。お問い合わせ CTA（`--contact`）は最後尾のまま不変。
- スタッガードフェードイン（`_drawer.js`）は項目数非依存で自動追従するため**JS は触らない**。

---

## 3. ② トップ「公開ツール」独立セクション

### 3-1. 配置位置（works の下にぶら下げず独立並列）

トップ `index.html` の **「最新の制作実績」セクションの直後／「私について」の直前**に、独立セクションとして挿入。

```
ヒーロー
↓
最新の制作実績（works・l-section--alt）
↓
★ 公開ツール（tools・l-section）  ← 新規挿入
↓
私について（l-section--alt にずれる）
↓
ご相談いただける業務
↓
メイン CTA
```

- **なぜ works 直後か**: works（請けた仕事）と tools（自分の道具）は並列概念（PLAN §2-4・Mado §2-1）。視覚的に隣接させることで「実績と並ぶもう一つの成果＝技術力の傍証」として読める。works に**ぶら下げず**対等な独立 `<section>` にすることで、PLAN §2-4 #2「対等並列」を満たす。
- **背景交互（`l-section` / `l-section--alt`）の扱い**: 現状は works=alt → about=base → services=alt → cta。ここに tools を挟むと交互リズムが崩れうるため、**挿入位置と背景クラスの組み合わせ**で1点判断が要る（★要確認2）。下記3案を比較する。

  | 案 | 挿入位置 | tools 背景 | 以降の付け替え | 交互 | 改変範囲 |
  |---|---|---|---|---|---|
  | **案A（第1推奨・Should2）** | works(alt) と about(base) の間 | **alt** | **不要** | works(alt)→tools(alt) が alt 2連続になる | tools 挿入のみ・以降ゼロ |
  | **案A'（Should2 別解）** | **about(base) と services(alt) の間** | **base** | 不要 | works(alt)→about(base)→tools(base)→services(alt)。base 2連続になる | tools 挿入のみ・以降ゼロ |
  | 案B（旧推奨） | works(alt) と about(base) の間 | base | about を alt・services を base に付け替え | 完全交互を維持 | tools 挿入＋既存2セクションのクラス付け替え |

  - **再検討の結論（第1推奨を案Aに変更）**: 旧推奨（案B）は完全交互を保てるが、**本体既存セクション（about/services）のクラスに手を入れる**＝最小変更の境界を広げる。一方、案A は「works 直後＝works と tools の並列性が最も伝わる情報設計上のベスト位置」を保ったまま**以降を一切触らない**。代償は works(alt)→tools(alt) の alt 2連続だが、背景同色のセクションが隣接するだけで構造・可読性は崩れない（区切りは見出し `c-section__head` で立つ）。**最小変更を厳格に取るなら案A を第1推奨**とする。
  - 案A'（about の後ろに base で挟む）は以降を触らず base 2連続で吸収する別解だが、works と tools が離れて並列性が弱まるため情報設計上は案A に劣る。
  - 案B（完全交互）は「背景が必ず交互であること」を品位の必須要件と黒田さんが判断する場合のみ。その場合のみ既存2セクションの付け替えを許容する。
  - → **挿入位置/背景/付け替えの最終選択は ★要確認2** で黒田さん判断（Haru 推奨＝案A：以降を触らず alt 2連続を許容）。

### 3-2. セクションの構成要素（既存クラス流用）

本体の works セクションと**同じ骨格**で組む（新しい見た目を作らない＝統一とコスト最小の両立）。

```
<section class="l-section" id="tools" aria-labelledby="tools-title">
  c-section__head
    c-section__title  「公開ツール」
    c-section__lead   （リード文・下記案）
  c-grid--triad（または 1枚なので暫定で triad 内に1枚 / 増えたら自然に並ぶ）
    c-work-card（流用） ×N   ← tools.json の published を最新N件
  p-center-link > c-link-arrow  「ツール一覧を見る →」 → /tools/
</section>
```

- **見出し**: 「公開ツール」（works の「最新の制作実績」と対の構造）。
- **リード文案（黒田さん確認用・对外公開コピー）**:
  - 案リ1（道具の destination 性を出す）:「フロント制作の実作業で使う道具を自作して公開しています。」
  - 案リ2（営業傍証を匂わせる）:「日々の制作で使うツールを自分で作って公開しています。ブラウザ内で完結する実用ツールです。」
  - → 推奨は案リ1（簡潔・destination 感）。最終文言は黒田さん／Sara レビュー（対外公開コピーのため）。→ ★要確認4。
- **見出し階層（h2）の整合（Should4）**: 本体トップは各セクションが `aria-labelledby` で `c-section__title`（h2）を指す**フラットな h2 兄弟チェーン**（works-title / about-title / services-title）。tools セクションも同形で `<section ... aria-labelledby="tools-title">` ＋ h2 `id="tools-title"`「公開ツール」を持たせれば、works(h2)→tools(h2)→about(h2)… と h2 が1つ増えるだけで**見出しアウトラインの階層は崩れない**（h2 の兄弟が1つ増える正しい構造）。Cody はこの h2 兄弟整合を意識して組むこと（→ §6 ②申し送りにも明記）。
- **works カードとの視覚弁別（Should3）**: ②は `c-work-card` をそのまま流用するため、**トップ上で works カードと tools カードが同一見た目**になる。works非混在（PLAN §2-4）はセクション分離で構造上は担保されるが、スクロール中の瞬間視認では区別しにくい副作用がある。**最小の手当て**として、セクション見出し「公開ツール」で文脈を立てるのを基本としつつ、必要なら tools カードに小さなラベル/バッジ（例: カード上部の `c-badge`「ツール」、または tags の先頭に種別バッジ）を1つ足して弁別性を上げる選択肢を残す。装飾は本体既存 `c-badge` の流用で足り、新規トークンは不要。→ 弁別バッジの要否は軽微論点として Cody 実装時に目視判断（見出しだけで十分弁別できるなら不要）。
- **カード**: 本体 `c-work-card` を**そのまま流用**（新規カード作成不要）。1枚（image-compress）を出す。
  - サムネイル: ツールの OGP/サムネイル画像が要る。現状本体 `assets/images/` にツール用画像は無い → **画像準備が②全体の前提**（★要確認6・別途 Haru で ogp.png 制作タスクが PLAN にあり、そこから流用 or トップ用サムネを別途用意）。**画像が間に合わない場合、暫定テキストカードで無理に出さず②全体を後続フェーズに回す選択肢を黒田さん判断に上げる（★要確認5＝②の Go/No-Go）**。①ナビ・③フッターは画像非依存ゆえ F5 で先行確定できる。
  - カード内容（tools.json から）: title「画像仕分け圧縮くん」/ text=tagline「画像の役割ごとに最適な圧縮を当てる。ブラウザ内で完結＝画像を送信しない。」/ tags=`c-badge`「画像圧縮」「WebP」等。
  - リンク先: `/tools/image-compress/`（個別ツール）。一覧 CTA は `/tools/`。
- **「最新N件」の N**: 現状 published は1件なので **N=1**。フェーズ追従で増えたら最新3件（works と同じ triad）に育てる。データ駆動の自動生成は本体が静的（Handlebars）で tools.json を本体が読まない別プロジェクト構成のため、**現状は手動で1枚記述が最小**（ツールが数個に増えた時点で partial 化／データ連携を再検討）。→ ★要確認7。

### 3-3. works 非混在の担保

- tools は**独立 `<section id="tools">`**。works セクション（`#works`）の `c-grid` 内には1枚も足さない。
- works 一覧ページ（`/works/`）側への「ツールも公開しています →」小導線（PLAN §2-4 #5）は、`mado-portfolio-link-design.md` §5-1 で「推奨（小）」として**正式採用済みの導線**。F5 の必須3点（①②③）には含めないが、**地の文で『スコープ外』と握り潰さず、F5 に含めるか後続フェーズに送るかを黒田さんの明示判断に上げる**（→ ★要確認9）。採用済み導線が明示判断なく落ちると後で抜け漏れに見えるため、★として立てて見送り/採用を確定させる。

---

## 4. ③ フッターリンク

### 4-1. 足す場所

`components/p-footer.html` の `p-footer__nav`（単一行6リンク）の**「制作実績」の直後**に「ツール」→`/tools/` を1本追加。

```
トップ / 私について / 制作実績 / ★ツール / スキル・対応範囲 / お問い合わせ / プライバシーポリシー
```

- ナビ内のリンク順をヘッダー（§2-1）と揃える（制作実績の直後）＝サイト全体でリンク順が一貫し、ユーザーの予測が立つ。
- フッターは全ページから張られる面の補助内部リンク（Mado §4-2）。1リンク追加で `/tools/` への内部リンクが「ナビ＋トップ＋フッター」の3面になる。

### 4-2. 最小変更の注意

- 本体フッターを **2グループ化しない**（frontend-tools 側フッターとは別物・§1-4）。単一行のまま1リンク足すのが最小。
- リンクが 6→7本になる。`_p-footer.scss` の `p-footer__nav` が flex-wrap で折り返す設計なら**CSS 変更不要**。横並び固定だった場合のみ、768–1023px 等で窮屈にならないか実機確認（折り返し許容の微調整）。→ Cody 実装時に実機目視（★軽微）。

---

## 5. 横断方針

### 5-1. 世界観（b-tech-cool）の両立 — 追加トークン不要

- 本体側に足す Tools 導線は**すべて本体の既存トークン・既存クラスで組む**。新しい色・余白・タイポを持ち込まない。
- Tools 側（frontend-tools）が既に本体トークンを 1:1 継承済み（design-concept.md §1）なので、本体トップに出る「公開ツール」カードと、その遷移先 `/tools/` の見た目は**地続き**になる。リンクをクリックして `/tools/` に着地しても世界観のジャンプが起きない＝ファネル体験が滑らか。
- **新規トークン定義はゼロ**。Haru の tokens.css 追加は本フェーズでは不要（本体既存トークンで足りる）。

### 5-2. FLOCSS 命名（追加クラス案）

本体は FLOCSS（`l-` レイアウト / `c-` コンポーネント / `p-` プロジェクト固有 / `js-` / `u-`）。本フェーズの追加は**既存クラス流用が基本**で、新規クラスは②の薄いラッパー1枚のみ。

| 用途 | クラス | 区分 | 備考 |
|---|---|---|---|
| トップ「公開ツール」セクション本体 | `l-section`（既存） | l- | works と同じ。背景は §3-1 の交互判断 |
| 見出し/リード | `c-section__head` / `c-section__title` / `c-section__lead`（既存） | c- | 流用 |
| ツールカード | `c-work-card`（既存流用） | c- | **新規カードを作らない** |
| カードグリッド | `c-grid--triad`（既存） | c- | 流用 |
| 一覧導線リンク | `p-center-link` > `c-link-arrow`（既存） | p-/c- | 流用 |
| （任意）ツールセクション固有の微調整 | `p-tools-preview`（新規・任意） | p- | **必要な場合のみ**。固有の余白/装飾を当てたい時だけ作る。不要なら作らない（→ 命名根拠は下記注記・Nice1） |

- 新規 SCSS ファイルは作るとしても `assets/styles/projects/_p-tools-preview.scss` 1枚のみ（`style.scss` が `@use "projects/**"` でワイルドカード読み込みなので**import 追記不要**＝置くだけで効く）。**まず既存クラスのみで組み、固有調整が要らなければこのファイル自体を作らない**のが最小。
- **`p-tools-preview` の命名根拠（Nice1・実態に合わせて訂正）**: 本体 works セクションは**ラッパー無しの素の `l-section`**で組まれており、`.p-works-preview` というクラスは**存在しない**（実ファイル `_p-works-preview.scss` の中身は `.p-center-link` 定義＝一覧導線リンク用）。よって「works の `p-works-preview` と対の命名」という旧根拠は事実誤り。正しい運用は **「tools セクションも works 同様ラッパー無しの `l-section` が基本。固有調整が要る場合のみ FLOCSS の `p-` 接頭辞で `p-tools-preview` を新設する」**（命名形式自体は妥当・対の命名という理由付けは削る）。

### 5-3. 触らないもの（最小変更の境界）

- ダークトグル（`c-color-toggle` / `_color-scheme.js`）/ ハンバーガー展開（`c-hamburger-fab` / `_drawer.js`）/ works フィルタ（`_works-filter.js`）/ メイン CTA（`p-cta`）/ 既存ページ（about/works/skills/contact/privacy）の中身。
- 本体の他セクション構造。②でクラスを付け替えるのは「背景交互の維持」のための class 名変更のみ（構造・要素は不変）。
- **wp-template/static-template 等のテンプレ基盤**（本フェーズは本体 kurodafolio 内の編集のみ）。

---

## 6. Cody 実装への申し送り（ファイル・挿入位置・partial 化の有無）

> 実コードは Cody が書く（本ファイルは方針レベル）。下記は「どのファイルのどこを何行いじるか」。

### ① ナビ「Tools」
| 対象ファイル | 変更 | partial 化 |
|---|---|---|
| `components/p-header.html` | `p-header__nav` 内、「制作実績」`<a>`（L15）と「スキル・対応範囲」`<a>`（L16）の**間に** `<a href="/tools/" aria-current="{{#if page.nav.tools}}page{{else}}false{{/if}}">ツール</a>` を**1行追加** | 既存 partial 内編集（新規 partial 不要） |
| `components/c-mobile-nav.html` | `c-mobile-nav__list` 内、「制作実績」`<li>`（L14）と「スキル・対応範囲」`<li>`（L15）の**間に** `<li class="c-mobile-nav__item"><a href="/tools/">ツール</a></li>` を**1行追加** | 同上 |
| `data/meta.json` | **変更不要で確定（Must1）**。`{{#if page.nav.tools}}` は `tools` キーがどのページにも未定義のため Handlebars 標準挙動で `else`（`false`）に倒れる。本体は現に全ページで `aria-current="false"` を出力して稼働中（built `dist/index.html` で確認済み・各ページ nav キーは1つのみ）。既存ページの nav に `tools:false` を足す必要もゼロ | — |

> **★Cody 確認は不要（Must1 で確定）**: ナビの `{{#if page.nav.tools}}` が未定義キーで `false` に倒れることは**既存稼働実績で確定済み**（実機確認の必要なし）。`aria-current="{{#if page.nav.tools}}page{{else}}false{{/if}}"` をそのまま既存ナビ記法に揃えて付与すればよい。meta.json は触らない。

### ② トップ「公開ツール」セクション
| 対象ファイル | 変更 | partial 化 |
|---|---|---|
| `index.html` | 「最新の制作実績」`</section>`（L108）と「私について」`<section>`（L111）の**間に** 新規 `<section class="l-section--alt" id="tools" aria-labelledby="tools-title">`（§3-2 の骨格・案A＝works 直後に alt で挟む第1推奨）を挿入。h2 は `<h2 id="tools-title" class="c-section__title">公開ツール</h2>`（**works-title→tools-title→about-title の h2 兄弟チェーンを維持**＝Should4）。中身は `c-section__head` ＋ `c-work-card` ×1（image-compress）＋ `p-center-link`>`c-link-arrow`「ツール一覧を見る →」`/tools/`。works カードとの弁別バッジは見出しで足りるなら不要（Should3・目視判断） | partial 化は**しない**（本体トップ固有の1セクション・1ツールのうちは直書きが最小） |
| `index.html`（背景交互） | **第1推奨＝案A（§3-1）**: tools を `l-section--alt` で works 直後に挟み、**以降の about/services は一切触らない**（works(alt)→tools(alt) の alt 2連続を許容）。★要確認2 で黒田さんが「完全交互」を選んだ場合のみ、about(L111)を `l-section`→`l-section--alt`・services(L137)を `l-section--alt`→`l-section` に付け替える案B に切り替える | — |
| `assets/styles/projects/_p-tools-preview.scss`（任意） | 固有の余白/装飾が要る場合のみ新規作成。`style.scss` のワイルドカード `@use "projects/**"` で自動読込（import 追記不要）。**不要なら作らない** | — |
| 画像（サムネ） | ツールカード用サムネイル画像を `assets/images/` に配置（例 `tools-image-compress.webp/.png`）。**画像未準備なら②全体を後続フェーズに回す判断を仰ぐ**（★要確認5＝②Go/No-Go・★要確認6＝画像準備） | — |

> ★Cody 注意: 「最小N件を自動生成」は本体が tools.json を読まない別プロジェクト構成のため**現状は手動で1枚直書き**。ツールが数個に増えた段階で partial 化／データ連携を別途検討（フェーズ追従・Mado §5-3）。

### ③ フッターリンク
| 対象ファイル | 変更 | partial 化 |
|---|---|---|
| `components/p-footer.html` | `p-footer__nav` 内、「制作実績」`<a>`（L14）と「スキル・対応範囲」`<a>`（L15）の**間に** `<a href="/tools/">ツール</a>` を**1行追加** | 既存 partial 内編集 |
| `assets/styles/projects/_p-footer.scss` | `p-footer__nav` が flex-wrap なら**変更不要**。横並び固定で 768–1023px が窮屈なら折り返し許容を微調整（実機目視判断） | — |

---

## 7. ★要確認（黒田さんの判断が要る分岐）

| # | 論点 | Haru 推奨 | 判断が要る理由 |
|---|---|---|---|
| **★1** | ナビ／フッターのラベルは「ツール」（日本語）か「Tools」（英語）か | **「ツール」（日本語）** | 本体ナビは全項目日本語。英語1語だけ混ぜると統一が崩れる。ただしブランド表現として英語を好むなら「Tools」も可（その場合フッター・トップ見出しの言語も揃える判断） |
| **★2** | トップ「公開ツール」の挿入位置と背景交互（§3-1 案A/A'/B） — works 直後に alt で挟み以降を触らない（案A）か／完全交互のため about・services を付け替える（案B）か | **案A＝works 直後に `l-section--alt` で挟み以降を一切触らない**（alt 2連続を許容・最小変更を厳格に取る） | 旧推奨（案B＝付け替えで完全交互）は本体既存セクションに手を入れ最小変更の境界を広げる。案A は以降ゼロ改変で works との並列性も最善位置を保つ。リズムの品位 vs 改変最小のトレードオフ |
| **★3** | ナビ 4→5 リンクが PC 幅で窮屈にならないか | **「ツール」は短語ゆえ問題ない見込み・実機目視で確定** | ロゴ＋5リンク＋トグル＋CTAボタンの横並び。container-max 1280px で収まるか実機確認。窮屈なら gap 微調整で吸収 |
| **★4** | トップ「公開ツール」のリード文（対外公開コピー） | 案リ1「フロント制作の実作業で使う道具を自作して公開しています。」 | 対外公開コピーのためブランドトーン整合が要る。Sara レビュー → 黒田さん確定が望ましい |
| **★5（Must3）** | **②トップ「公開ツール」セクションを F5 で出すか／サムネ画像準備を待って後続フェーズに回すか（②全体の Go/No-Go）** | **画像が用意できるなら F5 で出す。間に合わなければ後続フェーズに回す（暫定テキストカードで無理に出さない）**。①ナビ・③フッター（画像非依存）は F5 で先行確定 | ②の成立は ★6 サムネ画像準備に強く依存する。画像が無いまま暫定テキストカードで出すか／②自体を画像準備後に後ろ倒すかは見栄え・公開タイミングに直結する黒田さん判断。①③と切り離して②だけ後続に送る選択肢を明示する |
| **★6** | トップ ツールカードのサムネイル画像 | **専用サムネを用意（別タスク ogp.png 制作と連動）／間に合わなければ ★5 の Go/No-Go に従い後続送り** | 本体 `assets/images/` にツール画像が無い。画像準備が②の前提。準備状況で②を出すか（★5）が決まる |
| **★7** | トップに出すツール数 N（現状の見せ方） | **N=1（現状 published 1件 ＝ image-compress のみ）。「新着3選」表現はまだ使わない** | tools.json published=1。増えたら最新3件（triad）に育てる。現状の枚数確認 |
| **★8** | フッターを本体単一行のまま「ツール」1リンク追加でよいか（2グループ化しない） | **単一行のまま1リンク追加**（本体の情報設計を壊さない最小変更） | frontend-tools 側は2グループフッターだが、本体はそれと別物。本体フッターを2グループ化すると最小変更を超える |
| **★9（Must2）** | works 一覧ページ（`/works/`）→「ツールも公開しています →」小導線（PLAN §2-4 #5・`mado-portfolio-link-design.md` §5-1 で採用済み）を **F5 に含めるか／後続フェーズに送るか** | **F5 では見送り・後続フェーズで実施**（F5 は①②③に集中。#5 は本体トップ②が立てば優先度は下がる小導線） | §5-1 で正式採用済みの導線を地の文で握り潰さず明示判断を仰ぐ。採用済み導線を黒田さんの判断なく落とすと後で抜け漏れに見える |

> 補足1: ①ナビ項目と `/tools/` URL は「1個の段階から立て、見せ方だけ後で進化させる」（Mado §5-3・URL 不変）。本フェーズで立てれば将来コスト最小。
>
> 補足2（Nice2・リード文の確定順序）: ②のリード文（★4）は**対外公開コピー**ゆえ、**Sara レビュー → 黒田さん確定**を経てから Cody 実装に入ることを②着手の前提条件とする。文言未確定のまま②を組むと、後でコピー差し替えの手戻りが発生する。①ナビ・③フッターは固定ラベル（「ツール」）ゆえこの前提に縛られず先行可。

---

## 検証済み

- **検証済み: 導線リンク先 `/tools/` ・本体改変対象ファイルの実在確認** — リンク先 `/tools/`（ポータルトップ・確定URL）と個別 `/tools/image-compress/` は frontend-tools `dev/src/data/tools.json`（published=image-compress）で実在確認。本体改変対象＝`components/p-header.html`（4リンク＋toggle＋contact CTA）／`components/c-mobile-nav.html`（4リンク＋contact CTA）／`index.html`（hero→works→about→services→cta のセクション順）／`components/p-footer.html`（単一行6リンク＋SNS）／`data/meta.json`（nav フラグ home/about/works/skills/contact）をすべて実ファイルで確認し、各々の挿入位置を行番号付きで特定（§1・§6）。存在しない構造へは導線を引いていない。
- **検証済み: works 非混在・最小変更原則・本体世界観との両立** — ②は独立 `<section id="tools">`（works `#works` のグリッドには1枚も足さない＝PLAN §2-4 works 非混在）。最小変更＝既存クラス（c-work-card / c-section__* / c-grid--triad / c-link-arrow）流用、新規 SCSS は任意の `_p-tools-preview.scss` 1枚のみ（ワイルドカード @use で import 追記不要）、ダークトグル・ハンバーガー・works フィルタ・CTA・既存ページは不変更（§5-3）。世界観＝本体既存トークンのみ使用・新規トークン定義ゼロ、Tools 側が本体トークン1:1継承済み（design-concept.md §1）ゆえ本体トーンと Tools トーンが地続き（§5-1）。
- **検証済み: ①②③ 各々の Cody 申し送り（どのファイルのどこを足すか）** — §6 に①（p-header.html L15-16間・c-mobile-nav.html L14-15間に1行・meta.json は変更不要で確定＝Must1）／②（index.html L108-111間に新規 section・背景交互クラス付け替え・任意 SCSS・サムネ配置）／③（p-footer.html L14-15間に1行・_p-footer.scss は flex-wrap なら変更不要）を、対象ファイル名・挿入位置（行番号）・partial 化の有無付きで明記。
- **未達: なし** — 自己検証3項目すべて充足。実コード（HTML/CSS）は方針設計フェーズのため意図的に書いていない（タスク「やらないこと」準拠）。

---

## Mado 評価ゲート反映ログ（2026-06-18・Haru 修正フェーズ）

`_f5-mado-routing-review.md`（条件付き合格・Must3/Should4/Nice2）の指摘反映結果。

- **Must1（事実誤りの是正）反映** — §2-3 ／ §6 ① ／ ★Cody確認 を修正。`{{#if page.nav.tools}}` の挙動を「要実機確認」から「**meta.json 変更不要で確定**」へ。裏取り＝built `dist/index.html` で全リンク `aria-current="false"` 出力を確認＋ `meta.json` 各ページ nav キー1つのみ＋ p-header.html L9-11 コメントの既存仕様で確証。`aria-current="{{#if page.nav.tools}}page{{else}}false{{/if}}"` を既存記法のまま付与・Cody 確認不要と確定記述に変更。
- **Must2（採用済み導線の見送り明示）反映** — §3-3 の works一覧→「ツールも公開しています →」小導線（#5）を地の文「スコープ外」から**★要確認9 に格上げ**。F5 含める/後続送りを黒田さん明示判断に（Haru 推奨＝後続送り）。
- **Must3（②Go/No-Go の独立）反映** — ②全体の Go/No-Go を**★要確認5 として独立**（画像準備★6に強依存・①③と切り離し先行確定可と明記）。§3-2 サムネ記述・§6 ②画像行も Go/No-Go 参照に更新。
- **Should1（案C 混同防止）反映** — §0 に「本ファイル①＝本体側ナビ追加＝採用／`01_navigation-funnel` §5-3 非推奨の案C＝tools 側ナビは別物」の混同防止メモを1段追加。
- **Should2（背景交互の最小案比較）反映** — §3-1 を3案比較表（案A=works直後alt挟み以降不触／案A'=about後base挟み／案B=付け替え完全交互）に再構成。**第1推奨を案A（最小変更）に変更**・★2 文言も更新・§6 ②背景交互行も案A基準に。
- **Should3（works/tools カードの視覚弁別）反映** — §3-2 に弁別バッジ（`c-badge`「ツール」等）の最小手当て選択肢を追記（見出しで足りれば不要・目視判断）。§6 ②行にも一言。
- **Should4（h2 見出し階層整合）反映** — §3-2 に works-title→tools-title→about-title の h2 兄弟チェーン維持を明記（実ファイルで `aria-labelledby`+h2 構造を裏取り）。§6 ②行に h2 指示を追記。
- **Nice1（`p-tools-preview` 命名根拠の修正）反映** — §5-2 から「works の `p-works-preview` と対の命名」の誤った理由付けを削除。実態（works はラッパー無し素 `l-section`・`.p-works-preview` 不在）に合わせ「固有調整時のみ `p-` で新設」に訂正。
- **Nice2（リード文の確定順序）反映** — §7 補足2 に「②リード文は Sara レビュー→黒田さん確定を②着手の前提条件」を明記。
- **見送り: なし** — Must3/Should4/Nice2 すべて反映済み。★要確認は ★1〜★9 に振り直し整合（★5=②Go/No-Go・★9=works一覧導線を追加・各★に Haru 推奨を保持）。
