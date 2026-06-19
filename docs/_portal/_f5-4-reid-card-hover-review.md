# F5-4 コードレビュー: カード hover/click アクション改修

- **レビュアー**: Reid（制作部 / コードレビュー・規範照合・品質判定）
- **対象**: kurodafolio `c-work-card`（トップ works3＋公開ツール1＋works一覧10＝計14インスタンス）／ frontend-tools `c-tool-card`（ツールトップ1インスタンス）
- **評価方式**: クリーンコンテキスト評価（生成に非関与）
- **日付**: 2026-06-19

---

## 最終判定: 合格（LGTM）

実装は変更意図を src / dist 双方で正確に満たしている。挙動の正しさ・画像クロップ・CLS 回避・reduced-motion・hover 端末依存・FLOCSS/トークン準拠・全インスタンス網羅・両リポ整合・既存機能不変、すべて確認。**Must 指摘なし**。差し戻し事項なし。

唯一の残課題は実装外（design-concept.md の旧挙動記述の乖離）で、Cody 申し送り通り別途 doc 更新で対応すればよい（コード側の修正は不要）。

---

## 観点別の検証結果

### 1. 挙動の正しさ（src / dist 両方で確認）— ◯
- hover で **画像のみ `scale(1.06)`** ＋ **title/name 色 `--color-accent`** のみ発火。
- カードの浮き（`translateY`）・影（`box-shadow`）・クリック（`:active`）フィードバックは **src・dist いずれにも存在しない**。
  - src SCSS 全文に `translateY` / `box-shadow` / `:active` の実ルールなし（コメント記述のみ）。
  - dist: kurodafolio L2010-2073 / frontend-tools L1798-1859 を実読。hover ブロックは scale と accent の2宣言のみ。
- `_p-works-preview.scss` / `_p-tools.scss` にカードへの hover 重ね掛けなし（旧 `.p-works-card` は孤児化済みで削除済み）。

### 2. 画像ズームのクロップ・CLS — ◯
- `.c-work-card > picture` / `.c-tool-card > picture` に `overflow: hidden` ＋ `border-radius: var(--radius-md)` を付与。`scale(1.06)` が picture 内にクロップされ、角丸が保たれる。img 側の radius は廃止済みで二重指定・はみ出しなし。
- thumb: `width:100%` ＋ `aspect-ratio:16/9` ＋ `object-fit:cover`。
- マークアップ `<img>` に **`width="640" height="360"`（=16:9）** が全インスタンスに付与済み（kurodafolio 各カード／frontend-tools テンプレ）。aspect-ratio と属性が一致 → **CLS は発生しない**。
- `transform: scale` は合成（compositor）プロパティのため**レイアウトに影響せずリフロー無し**。レイアウト不変を確認。

### 3. a11y モーション（prefers-reduced-motion）— ◯
- 各コンポーネント末尾に `@media (prefers-reduced-motion: reduce){ .card:hover .thumb { transform: none } }` を実装（dist 反映済み）。ズーム transform が無効化され、**色変化（モーションではない）は残る** → 意図通り。
- 加えて frontend-tools `_variables.scss` L375-382 が reduced-motion 時に `--transition-base: 0ms` 化（本体 §6 と同方式）。色変化のフェードも即時化される二重防御。挙動上の問題なし。
- ★補足: kurodafolio 側にも同種の global reduced-motion トークン 0ms 化がある想定だが、コンポーネント側 `transform:none` で確実に無効化されるため判定に影響なし。

### 4. hover の端末依存 — ◯
- 両リポの `@mixin hover` は `@media (any-hover: hover) and (pointer: fine){ &:hover { @content } }` で**完全に同一**。dist でも hover ルールは `@media (any-hover: hover) and (pointer: fine)` 内に出力されている。
- タッチ端末（`any-hover` 非 hover / `pointer: coarse`）では hover ルール自体が無効 → **タップで hover が固着しない**。coding-rule §5-3/§16 準拠。

### 5. FLOCSS / トークン準拠 — ◯
- transition は `var(--transition-base)`、色は `var(--color-accent)`、角丸は `var(--radius-md)`。直値・マジックナンバーなし（`scale(1.06)` のみリテラルだが視覚効果量として妥当・規範違反でない）。
- 命名 `c-*__thumb/__title/__name/__text/__tagline/__tags` は Component 接頭辞 + BEM Element で一貫。
- `&[hidden]{display:none}` は `!important` 不使用・詳細度（0,2,0）で UA `[hidden]` に勝つ設計でコメント根拠も明記。規範的に良。

### 6. 全カードインスタンス網羅 — ◯
- マークアップは全インスタンスが `<a class="c-(work|tool)-card">` > `<picture>` > `<img class="__thumb">` の統一構造（中間 div/figure ラッパーなし）。
- bare `> picture` 直下子セレクタが **トップ works3・公開ツール1（kurodafolio index 計4）・works一覧10・ツールトップ1** の全 15 インスタンスに確実に効く。取りこぼしなし。
- works一覧の `js-works-card` / `data-work-tag` 付きカードも同構造で適用される。

### 7. 両リポ整合 — ◯
- c-work-card と c-tool-card は hover 挙動・picture クロップ・reduced-motion・thumb 仕様すべて同値。差分は `c-tool-card` の `block-size:100%`（grid item の `<li>` 内で行高いっぱいに伸ばし `__tags` 下端揃えを効かせるための意図的差分・コメント明記）のみで、hover 挙動には無関係。整合性問題なし。

### 8. 既存機能不変 — ◯
- 全面リンク: カード `<a>` に `text-decoration:none` ＋ `color:base` 維持。
- `[hidden]`（works-filter）: `.c-work-card[hidden]{display:none}` 維持。JS 無効時は hidden が付かず全件表示（PE）。
- `aspect-ratio:16/9` ＋ `object-fit:cover` 維持。レイアウト不変。

### 9. design-concept.md 乖離の扱い — ◯（明示済み・doc 更新は別途）
- Cody 申し送り通り、`design/design-concept.md` の以下が**旧挙動（translateY(-2px)+shadow-md / active translateY(0)+shadow-none）を記述**しており、新実装と乖離していることを確認:
  - **L62**: 「ホバー: `translateY(-2px)` ＋ `--shadow-md`。アクティブ… `translateY(0)` ＋ `--shadow-none`…」
  - **L120**: 統一表「hover translateY(-2px)+shadow-md を踏襲」
  - **L147**: 是正表「本体 work-card と同じ translateY(-2px)+shadow-md」
  - **L162**: 「hover translateY+shadow-md・全面リンク」
  - **L163**: 「hover/active 挙動は本体 `c-work-card` と同値」（同値ではあるが、その「本体」記述自体が旧挙動を指す）
- これらは**ドキュメント側の追従漏れ**であり、コード側の不具合ではない。doc 更新はチーフ／Haru 判断で別途実施すればよい（本レビューの合格判定に影響しない）。

---

## Must（合格に必須の修正）
- **なし**

## Should（推奨・品質向上）
1. **design-concept.md の hover/active 記述更新**（L62/L120/L147/L162/L163）。実装が「画像 scale(1.06) ズーム＋title/name 色 accent・浮き/影/active なし」へ変わったため、設計書が古いままだと将来の参照者が旧挙動を正とみなす保守リスク。担当はチーフ／Haru。

## Nice（任意・余裕があれば）
1. `scale(1.06)` の倍率を将来トークン化（例 `--card-thumb-zoom`）すると、他カードへ展開時に値が一元管理できる。現状 2 ファイルのみで重複も最小のため必須ではない。
2. kurodafolio 側にも frontend-tools と同様 `_variables.scss` の global reduced-motion トークン 0ms 化があるか確認しておくと、両リポの reduced-motion 戦略が完全対称であることを設計書に明記できる（挙動上は現状で問題なし）。

---

## 自己検証
1. **両SCSS＋dist＋マークアップ＋hover mixin を実読したか**: ◯ — `_c-work-card.scss`／`_c-tool-card.scss`（src）、両 dist CSS（kurodafolio L2010-2073・frontend-tools L1798-1859）、両 `_mixins.scss` の `@mixin hover`、kurodafolio `index.html`／`works/index.html`、frontend-tools `index.html` をすべて実際に開いて確認。
2. **CLS / overflow クロップ / reduced-motion / hover 端末依存 / 全インスタンス網羅を具体確認したか**: ◯ — width/height 属性=16:9 一致で CLS なし、picture overflow:hidden＋radius でクロップ、reduced-motion で transform:none（＋トークン 0ms）、any-hover/pointer:fine で固着回避、bare `>picture` が全15インスタンスに適用。
3. **Must/Should/Nice 切り分けが妥当か**: ◯ — コード側に合格を妨げる欠陥なし（Must 0）。doc 乖離は実装外の保守リスクのため Should。倍率トークン化等は任意のため Nice。

検証済み: 両SCSS実読 / 両dist実読 / 5マークアップ実読 / hover mixin実読 / CLS・クロップ・reduced-motion・hover端末依存・全インスタンス網羅・両リポ整合・既存機能不変の具体確認 / design-concept.md 乖離5箇所の実値確認。
