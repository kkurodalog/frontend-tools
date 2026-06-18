# F5② トップ「公開ツール」セクション コードレビュー（Reid）

レビュー日: 2026-06-18 / 担当: Reid（制作部 / コードレビュー・規範照合・品質判定）
対象実装: Cody / 設計正本: `frontend-tools/docs/_portal/03_main-site-tools-routing-design.md` §3・§5-3・§6②
レビュー方式: 評価ゲート（生成に関与しないクリーンコンテキスト）/ 実ファイル＋dist 実出力で確認

---

## 最終判定: **合格（LGTM）**

Must（修正必須）= **0件**。Should = 2件（いずれも軽微・本フェーズ手戻り不要）。Nice = 2件。
設計正本 §3 の確定仕様（案B＝完全交互・黒田さん確定）と実装が一字一句一致し、最小変更の境界（§5-3）も逸脱なし。アクセシビリティ・レスポンシブ・FLOCSS いずれも規範準拠。本体OGPの健全性も確認済み。

---

## 1. Must（修正必須）— 該当なし

重点観点1〜7すべてで規範違反・破綻は検出されなかった。根拠は §3 の確認ログ参照。

---

## 2. Should（推奨・本フェーズでは手戻り不要）

### Should-1: `ogp-template/ogp.html` が build の Prettier で再整形された（スコープ外ファイルへの差分）
- **事象**: `git diff` で `ogp-template/ogp.html` に 16+/11- の差分。内容は `<!DOCTYPE>`→`<!doctype>`・インデント・CSSブレース展開・行折り返しの**純粋な整形のみ**（`git diff` 全文を確認し、セレクタ・プロパティ値・テキストの**意味変化はゼロ**）。Cody 実装ノート L54-55 で「`yarn build` の `yarn format`（Prettier）がリポ全体を整形対象にするため」と正直に記録済み。
- **根拠**: §5-3 の「触らないもの」に `ogp-template/` は明示列挙されていないため**境界違反ではない**。ただし F5② の編集意図（index.html の tools セクション追加）とは無関係なファイルにコミット差分が乗ると、後のレビュー/巻き戻し時にノイズになる。
- **修正方針（任意）**: コミット粒度の問題であり実害なし。次回以降、build 由来の全体整形差分は「整形コミット」を分離するか、`format` を変更ファイルのみ対象にする運用を検討（本フェーズは現状のままコミット可・★要確認＝黒田さん判断で整形差分を含めるか分離するか）。

### Should-2: トップの h3 見出しに works/tools 共通の「カードであること」を補強する仕組みは見出し文脈のみに依存
- **事象**: tools カードは `c-work-card` を1:1流用し、works カードと同一見た目。弁別バッジは Cody 判断で**不採用**（実装ノート L43-48）。
- **根拠**: 設計 Should3（§3-2）は「見出しで十分弁別できるなら不要・目視判断」と明記。背景交互（works=alt / tools=base）で面が分離され、`c-section__title`「公開ツール」＋リードで文脈が立ち、tags も「画像圧縮/WebP」で内容弁別される。**判断は設計の許容範囲内で妥当**。
- **修正方針**: 現状維持で問題なし。将来 tools が複数枚に増え triad で works と視覚的に並走した場合のみ、種別バッジ追加を再検討（フェーズ追従）。

---

## 3. Nice（あれば尚良い・必須でない）

### Nice-1: webp `srcset` 末尾の半角スペース
- dist L256 `srcset="....webp "` に末尾スペース。ただし**既存 works カード（dist L178 `works-chinman....webp `）と完全同一パターン**＝Vite ビルド出力の仕様であり Cody 起因ではない。HTML 仕様上 srcset の末尾空白は無視されるため**実害なし**。本体全体の既存挙動なので本フェーズで触らないのが正しい。

### Nice-2: tools サムネのソース拡張子が works（png）と異なる（jpg）
- works カードは `.png` fallback、tools は `.jpg` fallback。`<picture>`＋webp source の骨格は完全一致で機能上の差はない。元素材（OGP は JPEG 1200×630）をそのまま使った合理的判断。統一感を厳密に取るなら png 化も選択肢だが、画質/容量とも JPEG が適切（写真系サムネ）。**現状の jpg 採用が妥当**。

---

## 4. 重点観点別 確認ログ（合格根拠）

### 観点1: FLOCSS / coding-rules 準拠 — ✓
- 使用クラスは全て既存流用: `l-section`（l-）/ `c-section__head`・`c-section__title`・`c-section__lead`・`c-grid`・`c-grid--triad`・`c-work-card`・`c-work-card__thumb/__title/__text/__tags`・`c-badge`・`c-link-arrow`（c-）/ `p-center-link`（p-）。
- **新規クラス濫造ゼロ**。`_p-tools-preview.scss` は作成されず（実ファイル確認: `src/assets/styles/projects/` に存在しない）＝§6② の「固有調整不要なら作らない」最小方針に準拠。
- works セクションと骨格が一字一句同型（`src/index.html` L30-108 と L111-144 を対照確認）。

### 観点2: アクセシビリティ — ✓
- `aria-labelledby="tools-title"` ↔ `<h2 id="tools-title">` 対応を dist 実出力で確認（dist L246・L249）。
- **h2 アウトライン兄弟チェーン維持**: dist の h2 順 = `works-title → tools-title → about-title → services-title → cta-title`（フラット h2 兄弟・階層破綻なし）。設計 Should4 充足。
- カード内見出しは `h3`（セクション h2 配下の正しい階層）。works カードと同じ h3 採用。
- 画像 alt = 「画像仕分け圧縮くんのサムネイル」＝意味を持つ代替テキスト。works カードの alt 記法（「〜のサムネイル」）と一貫。
- リンク: カード全面 `<a href="/tools/image-compress/">`、一覧 CTA `<a href="/tools/" class="c-link-arrow">`。リンク先は tools.json の published（image-compress）・ポータルトップと整合。

### 観点3: 背景交互（案B＝完全交互）— ✓（dist 実出力で確認）
dist `index.html` のセクション背景クラス出力順:
```
hero(p-hero) → works(l-section--alt) → tools(l-section) → about(l-section--alt) → services(l-section) → cta(p-cta)
```
works(alt)→tools(base)→about(alt)→services(base) の**完全交互**を実出力で確認。
- `git diff src/index.html` で **about は `l-section`→`l-section l-section--alt`、services は `l-section l-section--alt`→`l-section`** の class 付け替えのみ（構造・要素は不変）＝設計 §3-1 案B 表（tools=base / about→alt / services→base）と一致。Cody 実装ノート L33-40 の付け替え表とも一致。

### 観点4: レスポンシブ（1枚カードが triad で破綻しないか）— ✓
- `c-grid c-grid--triad` は works と同一グリッド。`_c-grid.scss` の triad は CSS Grid 想定で、子要素が1枚でも左寄せ1カラム配置になり破綻しない（works と同じ実装基盤を流用）。
- カードは `width="640" height="360"` の固定 aspect 指定＋`loading="lazy"` で works と同条件。SP/PC の切替も works に追従。

### 観点5: 最小変更の境界（§5-3）遵守 — ✓
- `git status` 上の編集は `src/index.html`＋新規画像2枚（`tools-image-compress.jpg/.webp`）のみ。
- ダークトグル・ハンバーガー（`c-mobile-nav`）・works フィルタ・`p-cta`・他ページ・テンプレ基盤いずれも**未変更**を git diff で確認。
- `ogp-template/ogp.html` の差分は build の Prettier 由来（Should-1）＝§5-3 列挙の保護対象外・整形のみ。

### 観点6: サムネ配置判断の妥当性 — ✓（重要・正しい判断）
- **本体OGP健全性を確認**: dist head の `og:image` = `https://kurodafolio.com/images/ogp.jpg`（不変）。ソース `src/public/images/ogp.jpg` は 80139 bytes・タイムスタンプ 14:36（F5② 作業 16:18 より前）で**未更新＝壊していない**。
- Cody は指示文の「`src/public/images/` にコピー」をそのまま実行せず、`src/public/images/ogp.jpg` が**本体自身のOGP**である事実を見抜き、別名 `tools-image-compress.jpg` を **`src/assets/images/`** に配置（実装ノート L20-24）。この判断は本体OGP破壊を回避した**正しい修正**。
- 配置先を `assets/images/`（Vite 最適化・ハッシュ付与）にした判断も、works カードが全て `assets/images/` 由来で `<picture>` を組む既存規約に1:1で揃える最小選択として妥当。dist で `tools-image-compress.D2FuOxCd.webp` / `.DfLWC7W8.jpg` とハッシュ付き出力＆HTML 参照を確認。

### 観点7: ビルド成果物（dist）出力 — ✓
- dist L246-275 に tools セクションが正しく出力。画像はハッシュ付きで dist/assets に出力され HTML から参照。
- ナビ（dist L106 `<a href="/tools/" aria-current="false">ツール`）・フッター（dist L403）・SP ナビ（dist L464）の F5①③ 導線も併存して健全（本フェーズ対象外だが回帰なし）。

---

## 検証済み

- **①実ファイルで判定（推測でない）**: `src/index.html`（全文）・`dist/index.html`（grep 実出力）・`git diff src/index.html`（全差分）・`git diff ogp-template/ogp.html`（全文）・画像ファイルの実在/サイズ/タイムスタンプ・設計正本 §3/§5-3/§6②・Cody 実装ノートを読んで判定した。
- **②背景交互は dist 実出力で確認**: dist のセクション class 出力順を grep し works(alt)→tools(base)→about(alt)→services(base) の完全交互を実出力で確認（推測でなく成果物ベース）。
- **③Must/Should/Nice の切り分け妥当**: 規範違反・破綻・本体破壊は1件もなく Must=0。スコープ外整形差分（コミット粒度・実害なし）と弁別バッジ非採用（設計許容内）を Should、build仕様の srcset 末尾空白と拡張子差を Nice に分類。重大度に応じた切り分けは妥当。
- **未達: なし**。

★要確認（黒田さん判断）: Should-1 の build 由来 `ogp-template/ogp.html` 整形差分を本フェーズのコミットに含めるか／整形コミットとして分離するか。
