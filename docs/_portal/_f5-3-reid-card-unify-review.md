# F5-3 コードレビュー — c-tool-card を本体 c-work-card に統一（Reid / 評価ゲート）

レビュアー: Reid（制作部 / コードレビュー・規範照合・品質判定）
対象: frontend-tools ポータルトップ（kurodafolio.com/tools/）のツールカード統一実装
日付: 2026-06-18
正本: kurodafolio `_c-work-card.scss` / `works/index.html` / `_c-badge.scss`

---

## 最終判定: 合格（条件付き合格レベルの軽微指摘あり / Must=0）

黒田さん指示「ポートフォリオ側カード（c-work-card）を正としてツール集側（c-tool-card）を寄せる」は、構成・視覚値・hover/active 挙動・c-badge 移植・データ駆動健全性・編集境界のすべてで忠実に達成されている。dist 実出力でも c-work-card と同一構成（picture→name→tagline→tags）・画像 public パススルー・旧 `__category` 完全消滅を確認。**ブロッカー（Must）はゼロ**。Should/Nice の軽微指摘のみ。サムネ解決判断も妥当と判定する。

---

## 1. 構成・視覚の一致（観点1）— 合格

`_c-tool-card.scss` を `_c-work-card.scss` と 1 プロパティずつ照合した結果、**完全一致**。

| 要素 | c-work-card（正） | c-tool-card | 判定 |
|---|---|---|---|
| ルート | flex/column・gap space-3・padding space-5・color text-base・bg-elevated・border thin/border・radius-md・transition base | 同値 | ◯ |
| hover | shadow-md + translateY(-2px)（`@include hover`） | 同値 | ◯ |
| active | shadow-none `!important` + transition-zero + translateY(0) | 同値（`!important` も一致） | ◯ |
| thumb | width100%・aspect-ratio16/9・object-fit cover・bg-code・radius-md | 同値 | ◯ |
| title/name | margin-block-start space-3・font-heading・fs-lg・fw-bold・color text-base | 同値 | ◯ |
| text/tagline | fs-sm・lh-base・color text-muted | 同値 | ◯ |
| tags | flex-wrap・gap space-2・margin-block-start auto（下端揃え） | 同値 | ◯ |

- `block-size:100%` は c-tool-card のみ追加。これは **正しい**: ツールカードは `<li>`（grid item）内の `<a>` で、works 側（`<a>` 直置き grid item）と DOM 構造が 1 段違う。`margin-block-start:auto` の下端タグ揃えを効かせるには `<a>` を行高いっぱいに伸ばす必要があり、`block-size:100%` がそれを担保する。構造差を踏まえた妥当な差分。
- hover 時の子テキスト色固定（base/muted 明示で foundation `a:hover` を打ち消し）も正本と同方針。
- **コメント残置の妥当性**: c-tool-card のヘッダーコメントが視覚値の正本（kurodafolio）と差分理由（block-size:100%）を明記しており、保守性の観点で良好。

## 2. c-badge 移植の正しさ（観点2）— 合格

- kurodafolio `_c-badge.scss` の `.c-badge` / `.c-badge--accent` を**バイト一致レベルでコピー**（コメント文言含む）。差分は `.c-badge--warning` の除外のみ。
- **`--warning` 除外は妥当**: 移植元コメントどおり warning は「仮想案件（サンプル制作）マーカー」用で、ツール集には該当概念がない。未使用変種を持ち込まない判断は保守性上むしろ正しい。
- **トークン依存の解決**: `--ls-wide` / `--fw-medium` / `--color-bg-alt` / `--radius-pill` / `--fs-xs` / `--color-accent` / `--color-accent-bg` / `--color-text-muted` / `--border-width-thin` / `--color-border` / `--space-1` / `--space-3` は frontend-tools の本体 1:1 継承トークンとして存在し、dist の style.css に `.c-badge` が正常出力されることを確認（新規トークン追加なし＝観点7 適合）。
- **`@use` 構成**: `@use "components/**"` ワイルドカード（coding-rule §4-3 / 独立ファイル群）で自動ロード。`style.scss` への追記不要は規範どおり。ファイル冒頭 `@use "../global" as *;` も正本準拠。1 ファイル=1 Block 原則（§3-1）にも適合。

## 3. サムネ解決方法の判断（観点3 / ★Cody要確認への見解）— 現判断で許容（妥当）

Cody の「Handlebars 動的パス（`tools-{{slug}}`）は Vite が静的解析できずハッシュ付与が効かない → 既存 `public/images/`→`/tools/images/` serve 規約（cta-bg / profile / OGP と同扱い）に合わせ public 配置＋root-absolute 参照」という判断は **技術的に正しく、現時点で許容**と判定する。

- **根拠の確認**: `global/_variables.scss` L208-222 に「public 配置＋base-relative serve」が cta-bg / profile で既に確立した規約として明記されており、サムネをこれに合わせるのは本プロジェクトの一貫性として整合。Vite が動的テンプレ文字列を静的解析できないのは事実（実機ビルドで Cody が確認済み・dist で `tools-image-compress.{webp,jpg}` が無ハッシュで passthrough 出力されることを当方も確認）。
- **代替案の評価**:
  - *カード静的展開*（ループ廃止）: ハッシュは効くが、データ駆動（tools.json 由来）の拡張性を捨てることになる。ツール追加のたびに HTML を手書きする退行で、**現時点では正当化されない**。
  - *Vite カスタムプラグインで動的パス書き換え*: 技術的には可能だが、ツール 1 件の現段階でプラグイン保守コストを負うのは過剰。**現時点では正当化されない**。
- **トレードオフの許容理由**: cache-busting なしのデメリットは、サムネが OGP/favicon と同じ「滅多に差し替えない静的素材」であるため実害が小さい。差し替え時は手動で対応可能。**現判断を支持**。
- ★将来要確認: ツール数が増えサムネ差し替え頻度が上がった段階で、Vite プラグインによる動的パス静的化を再評価する余地はある（現時点の申し送りとして記録）。

## 4. アクセシビリティ／パフォーマンス（観点4）— 合格

- `alt="{{name}}のサムネイル"`: 動的に意味のある alt。空 alt でない点は適切（カードはリンクで、name は直後 h2 にも出るため厳密には装飾寄りだが、害はなく許容）。
- `width="640" height="360"`（16:9）+ `aspect-ratio:16/9`: **CLS 回避の二重担保**で良好。
- `loading="lazy"`: ファーストビュー直下のカードに lazy を付けている点は厳密には LCP に不利な可能性があるが、works 正本と同一挙動であり「正に寄せる」指示に忠実。N=1 の現状では実害なし（Nice 指摘に格下げ）。
- `object-fit:cover`: 16:9 枠クロップで正本同値。

## 5. FLOCSS／coding-rules 準拠（観点5）— 合格

- 旧 `__category` / `--accent` の CSS 残骸: src/styles grep **0 件**・dist grep **0 件**で完全消滅を確認。
- 命名: `c-tool-card__thumb/name/tagline/tags` は BEM Element `__`・多語ハイフン区切り・2 段ネストなし（§1-2）に適合。
- 論理プロパティ: `margin-block-start` / `padding-block` / `padding-inline` を使用、物理プロパティなし（§0-4(3)）。`padding: var(--space-5)`（4 方向同値 shorthand）は許容範囲。
- `.js-` への CSS 付与なし（styles grep 0 件 / §2-2）。
- `_p-tools.scss` の `minmax(rm(280), 1fr)` は `rm()` 必須（§5-4）に適合。

## 6. データ駆動の健全性（観点6）— 合格

- 画像パスは `tools-{{slug}}` の slug 由来でデータ駆動。tools.json の `slug:"image-compress"` → `/images/tools-image-compress.webp` → dist `/tools/images/tools-image-compress.webp` と正しく解決。
- `{{#if this.tags.length}}` ガードで tags 空でもカード崩壊なし。`{{#if tools.length}}` で 0 件時 `__empty` にフォールバック。
- N=1 グリッド: `_p-tools.scss` の `auto-fill minmax(280px,1fr)` で 1 列健全（既存グリッド未変更）。ツール増加時も破綻なし。

## 7. 編集境界（観点7）— 合格

- 変更は frontend-tools `dev/src` 配下のみ（index.html / _c-tool-card.scss / _c-badge.scss新規 / public/images サムネ）。
- kurodafolio 側は参照のみ・無変更。`src/public/image-compress/ogp.jpg` 原本（106288 bytes / timestamp 15:48）はサムネ追加（16:34）後も無変更を確認。
- 新規トークン追加なし（本体 1:1 継承トークンのみ使用）。
- パターンA（公開成果物・独立リポ・コピー運用）に整合。kurodafolio からの c-badge / サムネコピー移植は許容範囲内。

## 8. design-concept.md 乖離の扱い（観点8）— 合格（明示されている）

Cody 実装ノート §38-43 で design-concept §L163（pill 上部配置・サムネなし・下端タグ行なし）との乖離を**地の文で握りつぶさず明示**し、(a)上部 pill 廃止→下端 c-badge、(b)サムネ 16:9 picture 追加、(c)構成順変更 の 3 点を列挙、黒田さん指示に基づく意図的変更である旨と「doc 更新はチーフ/Haru 判断」の申し送りを記載している。レビュー観点として**適切に握られている**。
→ ★チーフ宛申し送り: design-concept.md §L163 ＋ 修正履歴表（§241/§258 相当）の記述更新を別途キューイング推奨（doc 更新自体は本レビュー対象外）。

---

## 指摘リスト

### Must（差し戻し相当）— 0 件
なし。

### Should（次回までに直したい）— 1 件

1. **dist の `srcset` 末尾に余分な半角スペースが入る**（`srcset="/tools/images/tools-image-compress.webp "`）。
   - 原因: ソース `srcset="/images/tools-{{slug}}.webp"`（末尾スペースなし）を Vite の base 書き換えが srcset 候補リストとして再シリアライズする際に区切りスペースを付与しているため。
   - 影響: 仕様上 srcset はホワイトスペースでトークン化され、末尾スペースは空候補を生まず webp は正常解決する（実害は限りなく小さい）。`src`（jpg フォールバック）は clean。
   - 理由（なぜ指摘か）: 出力 HTML のクリーンさ・将来 descriptor（`2x` 等）追加時の混乱回避のため、挙動を把握しておくべき。回避が必要なら srcset を使わず `<source>` を単一 url にするか、ビルド後の検証項目に含める。**現状はブロッカーではない**。

### Nice（任意）— 2 件

1. **ファーストビュー直下カードの `loading="lazy"`**: LCP 観点では eager の方が有利な場合があるが、works 正本と同一挙動・N=1 のため実害なし。ツール数が増えても上段カードは限られるため、将来 LCP 計測で問題が出た時のみ先頭カードを eager 化する余地。
2. **`alt` テキスト**: name が直後 h2 にも出るため厳密には冗長だが、works 正本と同方針で許容。スクリーンリーダーで二重読み上げが気になる場合のみ `alt=""`（装飾扱い）も選択肢。

---

## 自己検証

- 検証済み: ① 改修後の frontend-tools 4 ファイル（index.html / _c-tool-card.scss / _c-badge.scss / _p-tools.scss）＋ tools.json と、kurodafolio 正本（_c-work-card.scss / _c-badge.scss / works/index.html）をプロパティ単位で照合した。
- 検証済み: ② dist 実出力（`dist/index.html` のカード領域・`dist/images/` の画像 passthrough・src/dist 双方の `__category` grep 0 件・`.js-` in styles 0 件）を確認した。srcset 末尾スペースも dist 実出力で確認。
- 検証済み: ③ Must/Should/Nice 切り分け — ブロッカー 0・機能影響の小さい出力ノイズを Should・正本同値の任意改善を Nice に分類。妥当と判断。
- 検証済み: ④ サムネ解決判断に「現判断で許容（妥当）」の明確な見解＋代替案棄却理由＋将来再評価ポイントを記載した。
- 未達: なし。
