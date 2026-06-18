# F5② トップ「公開ツール」セクション 実装ノート（Cody）

作成日: 2026-06-18 / 担当: Cody（制作部）
対象: `projects/_self/kurodafolio/06_implementation/dev/`（本体・パターンB）
設計正本: `frontend-tools/docs/_portal/03_main-site-tools-routing-design.md` §3 / §6②

## Scope
本体トップ `index.html` の works `</section>` と「私について」`<section>` の間に、
独立した「公開ツール」セクション（image-compress 1 枚）を既存クラス流用で新設。背景交互は案B（完全交互）で確定。

## 変更ファイル
| ファイル | 変更内容 |
|---|---|
| `src/index.html` | tools セクション挿入（works 直後）＋ services 背景クラス付け替え |
| `src/assets/images/tools-image-compress.jpg`（新規） | カードサムネ。frontend-tools `dev/src/public/image-compress/ogp.jpg`（1200×630 JPEG）をコピー |
| `src/assets/images/tools-image-compress.webp`（新規） | 上記から sharp で webp 生成（works カードと同じ webp+fallback 構成にするため。dev の convertImages 自動生成と同等処理を手動実施） |

新規 SCSS（`_p-tools-preview.scss`）は**作っていない**。既存 `l-section` / `c-section__*` / `c-grid--triad` / `c-work-card` / `p-center-link` / `c-link-arrow` / `c-badge` で固有調整不要だったため（§6② の最小方針どおり）。

## サムネ画像の判断（重要・要注意点）
- 指示文の「サムネ素材」記述では `frontend-tools/dev/src/public/image-compress/ogp.jpg` を本体 `src/public/images/` へコピーして使うとあったが、
  **`src/public/images/ogp.jpg` は本体サイト自身の OGP 画像**（`src/components/head.html` L52 の `og:image` が参照・F5①③ コミット bd4ddf7 で更新済み）であり、ツールサムネとは別物。これを上書き／流用すると本体 OGP が壊れる。
- そのため**本体 `src/public/images/ogp.jpg` には一切触れず**、ツール OGP を別名 `tools-image-compress.jpg` として `src/assets/images/` に配置した。
- 配置先を `src/public/images/`（publicDir・無加工コピー・絶対パス参照）ではなく **`src/assets/images/`（Vite 処理対象・ハッシュ付与・最適化）** にした理由: works カードが全て `src/assets/images/` 由来で `<picture>`（webp source + png/jpg fallback）を組んでおり、これに 1:1 で揃えるのが「既存マークアップ規約に揃える」最小。

## 背景交互（案B＝完全交互・黒田さん確定）
実ファイルの挿入前の現状を確認した結果:
- works = `l-section l-section--alt`（alt）
- about = `l-section`（base）
- services = `l-section l-section--alt`（alt）

works 直後に tools を挟むと、完全交互にするには `alt → base → alt → base` が必要。よって:
| セクション | 変更前 | 変更後 |
|---|---|---|
| works | alt | alt（不変） |
| tools（新規） | — | **base**（`l-section`） |
| about | base | **alt**（`l-section--alt`）※既存→付け替え |
| services | alt | **base**（`l-section`）※既存→付け替え |

→ §3-1 案B の表（tools=base / about→alt / services→base）と実ファイル現状が一致することを確認。
構造・要素は不変、class 名のみ変更（§5-3 の許容範囲）。

## works/tools カード弁別バッジ（Should3）の判断
**追加しない**。理由:
- セクション見出し「公開ツール」＋ `c-section__lead` で文脈が立つ。
- 背景交互（works=alt / tools=base）で面が視覚分離される。
- カードの tags（`c-badge`「画像圧縮」「WebP」）が works カードの tags（「WordPress」等）と内容で自然に弁別される。
- 見出しだけで十分弁別でき、新規バッジは冗長と判断（Haru 推奨＝見出しで足りれば不要、と整合）。

## h2 兄弟チェーン（Should4）
works-title → tools-title → about-title → services-title → cta-title の h2 フラット兄弟。
tools が h2 を 1 つ増やすだけでアウトライン不変。`aria-labelledby="tools-title"` ↔ `<h2 id="tools-title">` 対応。

## 副作用メモ（要認識）
- `yarn build` の `yarn format`（Prettier）がリポ全体を整形対象にするため、未追跡だった `ogp-template/ogp.html` が Prettier で再整形された（純粋な整形のみ・内容変化なし）。私の編集ではなくビルドの format ステップ由来。§5-3 保護対象外だが念のため記録。

## 検証
1. `yarn build` green ✓（dist 出力確認）
2. dist の section 背景順 = hero / works(alt) / tools(base) / about(alt) / services(base) / cta = 完全交互 ✓
3. h2 = works→tools→about→services→cta（兄弟チェーン維持）✓ / aria-labelledby ↔ id 対応 ✓
4. リンク `/tools/`・`/tools/image-compress/`・リード文・見出し・CTA 文言すべて確定仕様と一字一句一致 ✓
5. §5-3 保護対象（ダークトグル/ハンバーガー/works フィルタ/p-cta/他ページ）不変更 ✓
6. サムネ `tools-image-compress.{webp,jpg}` が dist にハッシュ付きで出力・HTML から参照 ✓
