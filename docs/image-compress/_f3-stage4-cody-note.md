# _f3-stage4-cody-note — Stage4 実装メモ（Cody / 2026-06-18）

> Stage4 = ①自動種別推測ロジック（最後に積む）＋②SEOメタ/JSON-LD/逆導線CTA案A の反映。
> Stage1（WebP/JPEG）・Stage2（AVIF）・Stage3（PNG可逆/減色）は完成・Reid評価ゲート通過済み。本Stageは regression を起こさず上載せした。

---

## A. 自動種別推測ロジック（spec §5）

### 実装ファイル
- `src/assets/js/image-compress/inference.js`（新規）— §5-2 ヒューリスティック表をそのまま実装。`inferWithReason(meta) → { presetId, reason }`。
- `src/assets/js/image-compress/image-ops.js` — `readImageMeta` を拡張し、§5-1 の軽量特徴量を追加抽出（解像度・アスペクト比・透過アルファ有無・色数おおよそ・入力フォーマット）。
- `src/assets/js/image-compress/main.js` — トグル接続・推測適用・根拠表示・手動上書き尊重。
- `src/image-compress/index.html` — トグルの `disabled`/「（準備中）」を除去し `checked`（初期 ON）に。
- `src/assets/styles/components/_c-ic-card.scss` — `.c-ic-card__reason`（根拠 small）追加。
- `src/assets/styles/components/_c-ic.scss` — `.c-ic-toggle` の `cursor` を `not-allowed`→`pointer`（disabled 時のみ not-allowed）。

### 色数判定（§5-1 / S-1 軽量）
- 縮小サムネ（長辺 96px）を `OffscreenCanvas` に描画 → `getImageData` → RGB をビットパックして `Set` でユニーク色カウント。**上限 400 色到達で打ち切り**（`manyColors` 確定）。フル解像度では走査しない。
- アルファは半透明/透明ピクセル（a<250）の有無で `hasAlpha` 判定。
- **この色数判定は推測用であり、④の減色（imagequant・Stage3）とは別物**（spec §5-1 注記どおり混同しない）。

### 挙動
- **ON（初期値）**: 各画像の `readImageMeta` 解決後に `inferWithReason` で初期種別を割当＋根拠を small 表示。①③④⑤⑥のみ割当。**②（photo-key）は inference.js が構造上返さない**（機械推測しない）。フォールバックは③。
- **OFF**: 従来挙動（一括/個別ラジオでユーザー割当）。根拠表示は消える（種別自体は破壊しない）。
- **手動上書き優先**: ユーザーがカード個別ラジオ／一括種別ラジオで選んだら `userPicked=true` を立て、以後 ON でも推測で上書きしない（根拠も消す）。出力フォーマット個別変更（`setItemFormat`）は種別選択ではないので userPicked は立てない。
- **パフォーマンス**: 特徴量抽出は縮小サムネ上のみ・色数は上限打ち切り・meta 取得は逐次（追加時に1枚ずつ Promise）。大量投入でもメインスレッドを固めない。

### 検証
- 6経路（icon/illust/screenshot/bg/photo/fallback）を node で実値テスト → 全て §5-2 表どおり。②は返らないことを確認済み。

---

## B. SEOメタ / JSON-LD / canonical（03_seo 準拠・すべて絶対URL）

### head.html の汎用化（他ページ非破壊）
- `src/data/meta.json` の image-compress ページに `seo` オブジェクトを追加（canonical/robots/OG全ブロック/Twitter Card を**絶対URLでハードコード**）。
- `src/components/head.html` を `{{#if page.seo}}` で分岐: `seo` がある場合のみフル出力（canonical/robots/OG12項目/Twitter6項目）。**`seo` が無いページ（ポータルトップ・default）は従来どおり最小の og:title/description/image のみ**（regression 無し・ビルド出力で確認済み）。
- title/description は `page.title`/`page.description`（meta.json）を 03_seo §2-2/§3-2 の文言に更新。

### JSON-LD（index.html 末尾・body 内）
- §5-2 WebApplication ＋ §5-3 BreadcrumbList を**03_seo から一字一句転記**して設置。すべて絶対URL。BreadcrumbList 最終要素（現在ページ）は item 無し。`author` = 黒田こうすけ / Kuroda Kosuke / url / sameAs（X・GitHub・frontend-note）。
- パンくず表示ラベル（Home / Tools / 画像仕分け圧縮くん）と BreadcrumbList の name を一致。

### H1
- §2-3「画像仕分け圧縮くん — 種類別に最適化する画像圧縮ツール」に更新。title とは別役割。

### ビルド検証（dist 出力）
- image-compress: title/canonical/robots/OG全項目/Twitter(@kurodalog)/JSON-LD(WebApplication+BreadcrumbList) すべて出力＆全絶対URL。
- portal top: 基本 title + og:title のみ。canonical/twitter は出ない（非破壊）。

---

## C. 逆導線CTA案A（§6-2 確定コピー）

- `src/components/maker-card.html` を**案A**に整合: 見出し「このツールを作った人について」＋リード（§6-2 案A本文そのまま）＋ボタン2本「制作実績を見る」→`site.works`（`https://kurodafolio.com/works/`）／「制作のご相談をする」→`site.contact`（`https://kurodafolio.com/contact/`）。アンカーは文脈語。
- design-concept の世界観・既存 `c-maker-card`/`c-link-arrow` スタイルは維持（クラス構造は流用、`__role` 行のみ撤去）。
- `cta.html`（full-bleed 行動バンド）は別セクションのため変更せず残置。

---

## 申し送り（実装しない・記録）

1. **OG画像 `ogp.png`（1200×630）の実画像制作はデザイン作業（Haru / F5・F6）**。Stage4 ではメタ値のパス参照（`https://kurodafolio.com/tools/image-compress/ogp.png`）のみ設置。プレースホルダー画像は作っていない。**公開前に Haru が実画像を制作し `dist/image-compress/ogp.png` 同階層に配置する必要がある**（03_seo §4-4 仕様）。
2. **本体 works/contact の最終URL**（`https://kurodafolio.com/works/` ・ `/contact/`）は PLAN §2-4 想定値。本体サイトの最終URL確定後に微調整が必要なら maker-card のリンク（vite.config `site.works`/`site.contact`）で一括変更できる。
3. **実機調整事項（★要確認・spec §5）**: 推測ヒューリスティックの閾値（アイコン長辺512px・背景長辺1600px超・画面アスペクト1.5〜1.9・色数上限400）は `inference.js` 冒頭の定数に集約。精度は追わない設計のため深追い不要だが、F4 実画像で当たりが悪ければ定数調整で対応。

---

## 自己検証結果

1. **自動推測**: ON で①③④⑤⑥割当・②非推測・根拠表示・手動上書き可（userPicked）・縮小サムネ上のみで軽量。OFF で従来挙動。→ 検証済み
2. **SEO転記**: title/description/OG/JSON-LD/canonical/robots/lang が 03_seo と一致・全絶対URL・twitter:creator=@kurodalog・author統一。dist 出力で確認。→ 検証済み
3. **CTA案A**: 見出し・リード・ボタン文言・リンク先が §6-2 案A と一致。→ 検証済み
4. **lint/format/build**: `yarn _lint` exit 0 / `yarn _prettier` 全ファイル green / `yarn build` 成功。→ 検証済み
5. **regression**: Stage1/2/3 のエンコード経路（WebP/AVIF/PNG可逆・減色/JPEG）・複数出力・カード個別・Worker/WASM パス解決・降格は未改変。portal top の meta 非破壊。→ 検証済み（コード差分は推測の上載せ・SEO/CTAは別箇所）

### 公開前チェックリスト（03_seo §7）達成状況
- [x] title §2-2 / [x] description §3-2 / [x] OGメタ全絶対URL / [ ] ogp.png 配置（**Haru 申し送り**）/ [x] WebApplication JSON-LD / [x] BreadcrumbList（最終 item 無し）/ [x] canonical 自己参照 / [x] html lang=ja・robots / [x] パンくず name 一致 / [ ] リッチリザルトテスト（F4 で実施推奨）
