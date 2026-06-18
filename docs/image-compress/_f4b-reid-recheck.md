# _f4b-reid-recheck — F4以降「後発UI変更」品質再チェック（Reid）

> 評価日: 2026-06-18 / 評価者: Reid（制作部・コードレビュー / 規範照合 / 品質判定）
> 対象: F4 最終ゲート通過後に入った **後発UI変更6点**（トグルスイッチUI化・共有タイトル・注記削除＋デッドSCSS整理・hr明示化・3ブロック並べ替え・fit-content）。
> 立場: 生成に関与していないクリーン評価者（evaluation-gate.md）。F4正本（`_f4-reid-final-review.md`）の中核が壊れていないかを併せて確認。
> 評価は読み取り＋ build/dist/grep 裏取りのみ。コードは修正していない。

---

## 判定: **合格（Approved）**

後発6変更はすべて **UI/markup/style ＋ 軽微JS（ラベル selector とテキスト）** に閉じており、コア（エンコード・WASM・複数出力パイプライン・削除・種別ラジオ change/click・自動推測ロジック・SEO/JSON-LD）には**一切影響していない**。規範準拠（FLOCSS命名・論理プロパティ・rm()・トークン定義・インラインstyle禁止）は完全準拠。スイッチのA11y（`role="switch"`・`aria-labelledby` 実在id・キーボード・`:focus-visible`・色のみ非依存）も担保。デッドSCSS（`c-ic-bulk__hint`/`--plain`/「自動で縮小」文言）は **残骸ゼロ**で除去済み、孤立参照なし。`yarn build` exit 0・dist に並べ替え・hr2本・トグル構造が正しく反映。

**Must なし。** Nice 1件（JSコメントのドリフト）のみ。後発変更の品質に差し戻し・条件付けは不要。

---

## 後発変更6点 × 検証結果

| # | 変更 | 結果 | 確認内容 |
|---|---|---|---|
| 1 | トグルスイッチUI化（`role="switch"`隠しcheckbox＋装飾トラック/つまみ） | OK | `c-ic-toggle__input`(visually-hidden checkbox)＋`c-ic-toggle__switch`(`aria-hidden`装飾)＋`::before`つまみ。`:checked`でトラックaccent＋つまみ右移動（`inset-inline-start`）。`:focus-visible`をトラックに映すリングあり。状態はネイティブcheckboxの`:checked`に乗るため**Tab/Space/支援技術に正しく伝わる**。つまみ位置で色のみ非依存。 |
| 2 | 共有タイトル＋`aria-labelledby` | OK | `<p class="c-ic-fieldset__legend" id="ic-auto-title">種別の自動判定`＋`<span id="ic-auto-label">自動で推測する`。checkboxの`aria-labelledby="ic-auto-title ic-auto-label"`が**両id実在**を参照。アクセシブルネーム=「種別の自動判定 自動で推測する」で意味を持つ。 |
| 3 | 注記削除＋デッドSCSS整理 | OK | `grep "bulk__hint\|--plain\|自動で縮小\|自動縮小"` = **0件**（src全域）。孤立参照なし。 |
| 4 | hr明示化（`<hr class="c-ic-divider">`2本） | OK | HTMLに2本配置・SCSS `.c-ic-divider`は`border:none`＋`border-block-start`で論理プロパティ。`margin-block:0`（gap依存・コメント整合）。thematic break として意味的に妥当。 |
| 5 | 3ブロック並べ替え（種別→フォーマット→自動判定） | OK | HTML/dist とも 種別→hr→フォーマット→hr→トグル の順。**JSは順序非依存**（`initImageCompress`は全て属性セレクタ`querySelector("[data-ic-*]")`で取得・index依存なし）。`data-ic-bulk-type`/`data-ic-bulk-format`/`data-ic-auto-toggle`すべて生存。 |
| 6 | `.c-ic-toggle`に`inline-size: fit-content` | OK | 論理プロパティ（`width:fit-content`の正しい論理版・コメント整合）。クリック領域をコンテンツ幅に収める意図どおり。 |

---

## 観点別

### 1. 規範準拠 — 合格
- `_c-ic.scss` の後発領域（`.c-ic-divider`/`.c-ic-toggleblock`/`.c-ic-toggle*`）に物理プロパティ（margin/padding/inset の物理版・`width`/`height`/`left`等）**ゼロ**。`inline-size`/`block-size`/`inset-inline-start`/`inset-block-start`/`margin-block` の論理プロパティで統一。
- 生px: `_c-ic.scss` 全域で raw px は `.u-visually-hidden` の `1px`/`-1px` のみ（sr-only clip標準・coding-rule §6例外＝**違反ではない**／F4 N-1既出）。トグル寸法は全て`rm()`（`--ic-switch-track-w` 等のローカルトークンも`#{rm(40)}`）。border `1px solid` は border例外。
- 未定義トークン参照ゼロ: `--radius-pill`/`--shadow-sm`/`--color-fixed-white`/`--color-border-strong`/`--color-accent`/`--transition-base`/`--space-2`/`--focus-outline-*`/`--color-focus-outline` すべて`_variables.scss`に定義済み（light/dark両方）。
- インラインstyle: HTML `style="` = 0件。
- FLOCSS命名逸脱なし（`c-ic-toggle*`/`c-ic-toggleblock`/`c-ic-divider` は c- コンポーネント接頭辞準拠）。

### 2. アクセシビリティ（重点） — 合格
- スイッチ: ネイティブcheckbox（`role="switch"`）をvisually-hiddenで隠す＝**Tabフォーカス・Space切替・`:checked`状態保持**をネイティブで温存。装飾トラック/つまみは`aria-hidden="true"`。`:focus-visible`リングをトラックに映写。ON/OFFはつまみ位置（左/右）＋色の二重表現で**色のみ依存でない**。
- `aria-labelledby="ic-auto-title ic-auto-label"` = 両id実在。アクセシブルネームが意味を持つ。
- タイトルは`<p>`（legend流用）。fieldset外（toggleblockはdiv）なので`<legend>`は使えず`<p>`が妥当。見出しロール付与はしておらず、`aria-labelledby`の構成要素として機能＝過不足なし。
- `<hr>`: thematic break のセマンティクスでブロック区切りとして妥当（装飾用途でも許容範囲）。

### 3. コアへの非破壊（重点） — 合格
- 後発のJS変更は `bindAutoToggle` の**1箇所のみ**: ラベルselectorを `querySelector("span")`（誤って先頭span＝装飾トラックを掴む）→ `querySelector(".c-ic-toggle__text")` に修正し、textを「自動で推測する」に統一（HTML一致）。**これはトグル再構造に伴う必要な追従修正**（旧selectorのままなら装飾span側にテキストが書き込まれ表示崩壊した）。`data-ic-auto-toggle`セレクタ生存。
- 3ブロック並べ替えでJS破壊なし: DOM取得は全属性セレクタ・順序非依存。初期化順依存処理なし。
- hr追加で種別/フォーマットgrid構造の破壊なし（`data-ic-bulk-type-grid`/`data-ic-bulk-format-grid`生存・dist確認）。
- エンコード・WASMパス・複数出力・削除・種別ラジオchange/click・自動推測（inference）・SEO/JSON-LD は後発変更で**未変更**（後発スコープ外）。`yarn build` exit 0、dist の.wasm構成・JSON-LD はF4正本どおり。

### 4. レスポンシブ — 合格
- 並べ替え: `c-ic-bulk`はflex縦積み＋gap、ブロック順入替で破綻要素なし。
- スイッチ: 固定rm寸法・`flex-shrink:0`でSP潰れなし。`fit-content`でラベル＋スイッチがコンテンツ幅に収まる。
- hr: `inline-size:100%`で全幅・どの幅でも1px線。
- 種別grid `minmax(rm(240),1fr)`・フォーマット`flex-wrap`はF4で768px破綻なし確認済み（後発変更で不変）。

---

## Nice（任意）

- **N-1. `bindAutoToggle` 上のコメントがドリフト**（`main.js` L273）。`// ラベル文言の「（準備中）」を外す（HTML 側は準備中表示なので JS で正式文言に差し替え）` とあるが、後発変更でHTMLは既に「自動で推測する」（準備中表記なし）。`textContent`上書き自体は同値を入れるだけで**無害**だが、コメントが実態と乖離。「HTML側は準備中表示」を「HTML側と文言を一致させる（保険）」等に直すか、HTML側で正文言が出る以上この上書き行ごと削除も可。**コード挙動に影響なし・任意**。

---

## 自己検証

- **検証済み: 後発6点を実ファイルで確認** — index.html（順序・hr2本・トグル構造・id）・_c-ic.scss（`.c-ic-toggle*`/`.c-ic-toggleblock`/`.c-ic-divider`/`fit-content`）・main.js（bindAutoToggle）を読み、dist で並べ替え・id・role/aria-labelledby反映を裏取り。
- **検証済み: スイッチA11y** — `role="switch"`・`aria-labelledby`両id実在・visually-hiddenでTab/Space温存・`:focus-visible`トラック映写・`aria-hidden`装飾・つまみ位置＋色の二重表現をコードで確認。
- **検証済み: コア非破壊** — 後発JS変更がbindAutoToggle 1箇所のみ・DOM取得が全属性セレクタで順序非依存・`yarn build` exit 0・data-attr全生存をdistで確認。エンコード/WASM/削除/種別ラジオ/SEOは後発スコープ外で未変更。
- **検証済み: デッドSCSS除去** — `bulk__hint`/`--plain`/「自動で縮小」grep 0件・孤立参照なし・未定義トークン参照なし。
- **検証済み: 指摘の再現性** — Niceにファイルパス＋行＋具体方針付与。grep/build は破壊的操作なし。
