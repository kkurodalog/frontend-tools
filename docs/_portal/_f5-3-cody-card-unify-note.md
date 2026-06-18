# F5-3 実装ノート — c-tool-card を本体 c-work-card に統一（Cody）

対象: frontend-tools ポータルトップ（kurodafolio.com/tools/）のツールカード
日付: 2026-06-18

## Scope
ポータルの `c-tool-card` を、本体ポートフォリオ（kurodafolio）の作品カード `c-work-card` の構成・見せ方に統一した。構成順を picture(thumb) → name(title 相当) → tagline(text 相当) → tags(下端) に揃え、上部カテゴリ pill を廃止して下端タグ行（c-badge×N）に置換、サムネ画像（16:9 picture）を追加した。kurodafolio 側は参照のみ（無変更）。

## 変更ファイル（frontend-tools dev/src 配下のみ）
1. `src/index.html`（L17〜 の `{{#each tools}}` ループ）
   - 旧: `<span __category>` → `<h2 __name>` → `<p __tagline>`
   - 新: `<picture>`(thumb) → `<h2 __name>` → `<p __tagline>` → `<div __tags>`(`{{#if this.tags.length}}` で `c-badge`×N を `{{#each this.tags}}`)
2. `src/assets/styles/components/_c-tool-card.scss`（全面改稿）
   - `__thumb`（`width:100% / aspect-ratio:16/9 / object-fit:cover / bg-code / radius-md`）追加
   - `__name` を c-work-card__title 準拠に（`margin-block-start:space-3`・base 色固定・`line-height:lh-tight` 廃止）
   - `__tagline` に `line-height:lh-base` 追加（c-work-card__text 準拠）
   - `__tags`（`flex-wrap / gap:space-2 / margin-block-start:auto`＝下端揃え）追加
   - 旧 `__category` / `__category--accent` 削除
   - `block-size:100%` は維持（`<li>` グリッドアイテム内の `<a>` を行高いっぱいに伸ばし、`margin-block-start:auto` の下端揃えを効かせるため）
   - hover/active は元々同値。active の `shadow-none` に `!important` を付与（kurodafolio と完全一致）
3. `src/assets/styles/components/_c-badge.scss`（新規・kurodafolio から移植）
   - `.c-badge` / `.c-badge--accent` を 1:1 コピー。`--warning` 変種は kurodafolio 固有（仮想案件マーカー・未使用）のため除外
   - `style.scss` は `@use "components/**"` ワイルドカードのため追記不要で自動ロード
4. `src/public/images/tools-image-compress.{webp,jpg}`（新規・サムネ素材）

## サムネ解決方法（★判断点 — Reid 確認対象）
- **データ駆動**: カードは `{{#each tools}}` 生成のため、画像パスは slug 由来（`/images/tools-{{this.slug}}.webp` ＋ `.jpg` フォールバック）。Vite が base(`/tools/`) を前置して `/tools/images/...` に解決。
- **配置先 = `src/public/` を採用（kurodafolio とは異なる）**。理由:
  - kurodafolio works カードはカードが**静的にハードコード**されているため、`<img src="/assets/images/works-*.webp">` を Vite が**ビルド時に静的解析→ハッシュ付与**できる（dist で `works-chinman.D8-Lk_UU.webp`）。
  - 対して frontend-tools のカードは Handlebars ループ内の**動的テンプレ文字列**（`tools-{{slug}}`）。Vite は動的パスを静的解析できず、`assets/images/` に置いても import 解決・ハッシュ付与が効かない（実機ビルドで確認済み）。
  - そこで、本プロジェクトが既に確立している `src/public/images/`→`/tools/images/` で serve する規約（cta-bg / profile と同じ＝`global/_variables.scss` L208-222 にも明記）に合わせ、public 配置＋root-absolute 参照とした。
  - **トレードオフ**: public 配置のためサムネはコンテンツハッシュが付かない（cache-busting なし）。OGP・favicon と同じ扱いで、本プロジェクトの既存方針と整合。ハッシュ付与が必須要件なら、ループ生成をやめてカードを静的展開する／Vite カスタムプラグインで動的パスを書き換える、等の別設計が要る。**この方式でよいか要確認**。
- 素材は kurodafolio の最適化済み `tools-image-compress.{webp,jpg}`（1200×630）を流用コピー。`public/image-compress/ogp.jpg`（OGP 原本）は無変更。

## c-badge 移植
- kurodafolio `_c-badge.scss` を frontend-tools `components/` にコピー。トークン（`--ls-wide / --fw-medium / --color-bg-alt / --radius-pill / --fs-xs / --color-accent-bg`）は全て本体 1:1 継承で存在を確認済み。`tools.json` の `tags:["画像圧縮","webp","avif"]` が下端に 3 バッジで出力。

## design-concept 乖離（★申し送り — 地の文で握りつぶさず明示）
`docs/_portal/design/design-concept.md` §L163 は **「上にカテゴリバッジ(pill) → ツール名 → タグライン」**（サムネなし・下端タグ行なし）と記述。今回の改修はこれと乖離する:
- 上部カテゴリ pill 廃止 → 下端 c-badge タグ行に置換
- サムネ画像（16:9 picture）を新規追加
- 構成順が「pill→名→tagline」から「thumb→名→tagline→tags」に変更
黒田さん指示（ポートフォリオ側カードに寄せる＝c-work-card 正）に基づく意図的変更。**doc 更新はチーフ/Haru 側で判断**（§L163 ＋ 関連する修正履歴表 §241/§258 の記述更新が必要）。

## 自己検証
- 検証済み: 1 `yarn build` green。dist の index.html が picture(thumb)→name→tagline→tags(c-badge×3) の c-work-card 同構成で出力。画像は `dist/images/tools-image-compress.{webp,jpg}` に public パススルー出力。
- 検証済み: 2 サムネ 16:9・object-fit:cover・width="640"/height="360"（CLS 回避）・alt（"{name}のサムネイル"）・loading="lazy" 付与を dist で確認。
- 検証済み: 3 `c-badge` が style.css に出力（`.c-badge` / `--accent`）。`tools.json` tags が下端 3 バッジで出力。`__category` 旧 CSS は dist から消滅（grep 0 件）。
- 検証済み: 4 `public/image-compress/ogp.jpg` 原本は無変更（タイムスタンプ・サイズ維持）。
- 検証済み: 5 slug 由来パスのためツール追加時もデータ駆動で破綻しない。`__tags` は `{{#if tags.length}}` ガードで tags なしでも崩れない。N=1 でも `p-tools__list` は `auto-fill minmax(280px,1fr)` で 1 列健全（既存グリッド未変更）。
- 検証済み: 6 編集は frontend-tools `dev/src` 配下のみ。kurodafolio 側・既存共通枠（ナビ/ハンバーガー/ダークライト）は無変更。新規トークン未追加。
- 未達: なし（ただしサムネのコンテンツハッシュ付与については上記「サムネ解決方法」の★要確認を参照）。
