# OGP 生成手順（Frontend Tools / 本体フォーマット版・テンプレ第1号）

担当: Cody（制作部）/ 作成 2026-06-18 → **同日改訂（案A ダーク独自背景版を破棄し、本体 kurodafolio と同一フォーマットに作り直し）**
正本フォーマット: `kurodafolio/06_implementation/dev/ogp-template/`（黒田さん承認済み・背景写真＋左寄せ）
正本仕様: `kurodafolio/08_release/pre-release/ogp-production-spec.md`（採用案 T-1 × L-1）
このフォルダ: `docs/_portal/design/ogp-template/`

```
ogp-template/
├─ ogp.html       … 1200×630 固定の枠（本体フォーマット）。tokens.css を <link>。<body data-*> で文言を差し替え
├─ ogp.css        … OGP 専用レイアウト（背景写真 cover / 左濃→右透グラデ / 左寄せ縦並び・上寄せ）
├─ bg.jpeg        … 背景写真（本体 src/assets/images/top.jpeg のコピー＝ブランド統一で本体流用）
├─ capture.mjs    … Playwright headless 撮影スクリプト（フォントロード完了を待って PNG 化）
└─ generate.md    … 本書（生成手順・手動フォールバック）
```

> 旧「案A 中央スタック（ダーク独自背景）」版は不採用。本体ポートフォリオと OGP フォーマットを
> 揃えるため、**背景写真＋左寄せテキスト群＋左濃→右透グラデ＋上寄せ**の本体方式に作り直した。

---

## 1. 何をするテンプレか

- 1200×630 の OGP 画像を **HTML+CSS で組み → headless browser で撮影 → JPEG q90 化**する。
  **形式は JPEG q90（mozjpeg）で確定**（黒田さん確定・2026-06-18）。背景写真＋テキスト合成で写真主体のため、
  軽量な JPEG が本来適切（PNG だと約940KB＝JPEGの約8倍重い）。テキストのキレは DSF3 撮影＋lanczos3 縮小＋
  sharpen＋q90 で確保（本体 kurodafolio OGP の JPEG q90＝80KB が実証済み）。本テンプレの全 OGP（ポータル
  トップ／image-compress／本体）を JPEG q90 に統一する。
- フォーマットは本体 kurodafolio の OGP と同一（背景写真 `bg.jpeg` を cover で敷き、左濃→右透の
  グラデを重ね、左寄せ縦並びのテキスト群を上寄せで配置）。accent ティールは `tokens.css`
  （b-tech-cool ダーク値 #5dd9cb）を直リンクして継承。独自色は作らない。
- **後続ツールへの横展開**は `ogp.html` の `<body data-*>` 属性を差し替えるだけ（HTML/CSS 構造は触らない）。
  背景写真を変えたい場合は `bg.jpeg` を差し替える（デフォルトは本体 top.jpeg 流用＝ブランド統一）。

### 要素マッピング（本体フォーマット → frontend-tools）

| 本体の位置 | data 属性 | 役割 | 例（image-compress） |
|---|---|---|---|
| pill「Web Developer」 | `data-pill` | 画面ブランド pill（ティール・通常固定） | `Frontend Tools` |
| キャッチ（主役） | `data-tool-name` | ツール名（主見出し・Noto Sans JP 700・白・72px） | `画像仕分け圧縮くん` |
| キャッチ（従） | `data-tagline` | 一言キャッチ（白 muted） | `種類別に選べる画像圧縮` |
| 氏名「Kuroda Kosuke」 | `data-owner` | 提供元（白プレーン・本体氏名と同サイズ 30px/500/0.04em） | `フロントエンド制作ツール集` |

> ツール OGP なので本体の「氏名」位置には**提供元テキスト**（全ツール共通＝フロントエンド制作ツール集）を
> 置く。本体の「Kuroda Kosuke」と同じ font-size/weight/letter-spacing・色は白・バッジ枠なしのプレーンテキスト。
> 背景は青デジタル粒子（bg.jpeg）に全面 50% 黒幕を被せて可読性を確保する（2026-06-18 改訂2）。

---

## 2. 推奨手順（Playwright headless で自動生成）

### 前提

- Node.js（v18+）。本リポは v25 系で確認済み。
- Playwright（chromium）。**グローバル導入で動かす方針**（dev/ に新規 devDependency を足さない）。
  - 確認: `npx --no-install playwright --version`（本環境は 1.59.1 で確認済み）。
  - 未導入なら: `npm i -g playwright && npx playwright install chromium`。
- sharp（高品質縮小用 / libvips・lanczos3）。frontend-tools の `dev/node_modules` に既に
  入っている（ViteImageOptimizer の依存）ため新規導入は不要。`SHARP_PATH` で絶対パス指定して読む。

### 実行

```bash
cd docs/_portal/design/ogp-template

# sharp（高品質縮小）を dev/node_modules から絶対パスで読む（新規依存は足さない方針）
export SHARP_PATH="$(cd ../../../../dev && pwd)/node_modules/sharp/lib/index.js"
# グローバル Playwright を解決するため NODE_PATH を通す
export NODE_PATH="$(npm root -g)"

# DSF3（3600×1890）で撮影 → sharp lanczos3 で 1200×630 へ高品質縮小 → 軽くシャープ → JPEG q90 出力
# 第3引数 90 = JPEG quality（mozjpeg）。これが OGP の確定形式。
node capture.mjs ./ogp.html ./ogp.jpg 90

# 実寸確認（1200×630 であること）
sips -g pixelWidth -g pixelHeight ogp.jpg    # → pixelWidth: 1200 / pixelHeight: 630
```

> **くっきり化（2026-06-18 改訂2）**: 旧方式「DSF2 撮影 → `sips -z` 縮小」は和文がにじんだ。
> 新方式は capture.mjs 内で **DSF3 撮影 → sharp（libvips / lanczos3）で 1200×630 へ縮小
> → `sharpen` で軽くエッジ復元**まで一括で行う（`sips` の後処理は不要・むしろ甘くなるので使わない）。
> sharp は frontend-tools の `dev/node_modules` を `SHARP_PATH` で絶対パス指定して読む。
>
> capture.mjs は `document.fonts.ready` を await してから撮影する。**これも最重要**:
> Noto Sans JP / Inter は Google Fonts CDN から非同期ロードされるため、
> 待たずに撮るとフォールバック書体で写って別物になる。ネット接続が必要。
>
> JPEG 出力は第3引数で品質を渡す（OGP は全て q90 で確定）:
> `node capture.mjs ./ogp.html ./ogp.jpg 90`

### 配置（公開時の URL に合わせる）

最終 JPEG は **ツールページと同階層**（`/tools/{tool}/ogp.jpg`）に置く。
本テンプレ基盤（Vite / static-template）では `src/public/` がルート直下に passthrough されるため、
サブフォルダごと置けば URL がそのまま一致する。

| 対象 | 配置先（src） | ビルド後 dist | 公開 URL |
|---|---|---|---|
| ポータルトップ | `dev/src/public/images/ogp.jpg` | `dist/images/ogp.jpg` | `https://kurodafolio.com/tools/images/ogp.jpg` |
| image-compress | `dev/src/public/image-compress/ogp.jpg` | `dist/image-compress/ogp.jpg` | `https://kurodafolio.com/tools/image-compress/ogp.jpg` |

```bash
# 例: image-compress
mkdir -p ../../../../dev/src/public/image-compress
cp ogp.jpg ../../../../dev/src/public/image-compress/ogp.jpg

# 例: ポータルトップ（ツール個別ではなく /tools/ 直下の入口ページ用）
cp ogp-portal.jpg ../../../../dev/src/public/images/ogp.jpg
```

> `base: "/tools/"`（vite.config.js）により `public/image-compress/ogp.jpg` は
> `/tools/image-compress/ogp.jpg` で配信される。これは `src/data/meta.json` の
> `og:image` 絶対 URL（`https://kurodafolio.com/tools/image-compress/ogp.jpg`）と一致する。

### 容量について

- JPEG q90 出力は約 110KB 前後（DSF3 縮小・写真背景版の image-compress / ポータルトップで実測約 112KB）。
  同じ絵を PNG で書き出すと約 940KB（JPEG の約 8 倍）。写真背景主体のため JPEG が本来適切で軽量。
- ビルド時に `ViteImageOptimizer`（jpeg）がさらに最適化するため、配信物は同等〜やや軽くなる。
- さらに詰めたい場合は本ツール自身（画像仕分け圧縮くん）で圧縮し直して差し替えてもよい（`_ogp-design-brief §4-4`）。

---

## 3. 手動フォールバック（headless が使えない環境）

Playwright / chromium が動かない場合でも、テンプレ（ogp.html / ogp.css）はそのまま使える。

1. `ogp.html` を **Chrome / Edge** で開く（フォント CDN を読むためオンラインで）。
2. フォントが乗りきるまで 1〜2 秒待つ（和文が Noto Sans JP の太字で表示されたら OK）。
3. DevTools（F12）→ デバイスツールバー → カスタムサイズ **1200×630 / DPR 3**（くっきり化のため高 DPR）に設定。
4. `#ogp-card` 要素を選択 → DevTools のコマンドメニュー（Cmd/Ctrl+Shift+P）→
   **"Capture node screenshot"** で `#ogp-card` だけを PNG 保存する（3600×1890 で保存される）。
5. 保存 PNG を 1200×630 へ高品質縮小し JPEG q90 で書き出す。ImageMagick があれば
   `convert in.png -filter Lanczos -resize 1200x630! -unsharp 0x0.6 -quality 90 ogp.jpg`。なければ自動手順（capture.mjs）を推奨。
6. 上記「配置」に従って `src/public/{tool}/ogp.jpg` に置く。

---

## 4. 自己チェック（生成後に必ず確認）

- [ ] `file ogp.jpg` が `JPEG image data ... 1200x630`（progressive・q90）を返す
- [ ] 背景写真（青デジタル粒子）が cover で全面に敷かれ、全面 50% 黒幕が乗っている（テキストのコントラスト確保）
- [ ] pill（Frontend Tools）→ ツール名 → キャッチ → 提供元が**左寄せ縦並び・やや上寄せ**で、下端に SNS情報帯セーフ余白がある
- [ ] ツール名・キャッチ・提供元の 3 要素が左右セーフゾーン（左右 120px）内（端切れなし）
- [ ] 和文が Noto Sans JP の太字で写っている（フォールバック書体になっていない＝フォントロード成功）
- [ ] pill 文字が accent ティール（`#5dd9cb`）で発色している / 提供元は白プレーン（枠なし）
- [ ] テキストのエッジがくっきりしている（にじみなし＝DSF3 + lanczos3 が効いている）
- [ ] 配置先が公開 URL（`/tools/{tool}/ogp.jpg`）に一致する

---

## 5. ポータルトップ OGP の生成記録（2026-06-18 / Cody）

`kurodafolio.com/tools/`（フロントエンド制作ツール集の入口ページ）用 OGP。
ツール個別 OGP と**同じテンプレ基盤・同じ背景（bg.jpeg 青デジタル粒子）・同じ全面
50% 黒幕・同じくっきり化パイプライン**で作成（シリーズ統一）。差分は文言（A 案）のみ。

### テンプレ（data-* 差し替えで再生成可能）

- HTML: `ogp-portal.html`（`ogp.html` の複製。CSS は `ogp.css` を共有・`bg.jpeg` を共有）
- ツール個別との違い: 「フロントエンド制作ツール集」を**主役（大・72px）**に昇格し、
  下段（本体氏名位置・30px）に**ドメイン表記**を置く。CSS 構造は触らない。

| data 属性 | 役割 | ポータルトップ A 案の値 |
|---|---|---|
| `data-pill` | 画面ブランド pill（ティール） | `Frontend Tools` |
| `data-tool-name` | 主役（白・72px） | `フロントエンド制作ツール集` |
| `data-tagline` | サブキャッチ（白 muted） | `ブラウザだけで完結する制作補助ツール` |
| `data-owner` | 下段（白・30px / 本体氏名位置） | `kurodafolio.com/tools` |

> 主役 font-size の判断: image-compress のツール名（72px）を基準に据え置き。
> 主役は 12 文字だが、左右セーフゾーン（中央 960px）内に余裕で収まり端切れなし。
> 下げる必要はないと判断し **72px のまま**採用した。

### 生成コマンド

```bash
cd docs/_portal/design/ogp-template
export SHARP_PATH="$(cd ../../../../dev && pwd)/node_modules/sharp/lib/index.js"
export NODE_PATH="$(npm root -g)"
node capture.mjs ./ogp-portal.html ./ogp-portal.jpg 90  # DSF3 → lanczos3 → sharpen / JPEG q90
sips -g pixelWidth -g pixelHeight ogp-portal.jpg        # → 1200 / 630

# 配置（ツール個別ではなく /tools/ 直下の入口ページ用 = images/ 配下）
cp ogp-portal.jpg ../../../../dev/src/public/images/ogp.jpg
```

### meta.json 是正（同時実施）

`src/data/meta.json` の `/index.html`（`isPortalTop: true`）は従来 `ogImage` が
相対パス `/images/ogp.jpg`（1024×1024 のサンプル）で、head.html の `{{else}}` 分岐
（最小 OG のみ・相対パス）に落ちていた。SEO 規範（`docs/image-compress/03_seo.md §4-2`
＝OGP 画像は絶対 URL 必須）に違反していたため、**ツール個別と同形の `seo` ブロックを
新設**し、`og:image` ほかを**絶対 URL `https://kurodafolio.com/tools/images/ogp.jpg`**・
1200×630 に是正した（`default` ブロックの相対パスも絶対 URL 化）。旧サンプル
`src/public/images/ogp.jpg`（1024×1024）は参照を切った上で削除し、本ポータル OGP を
同名 `images/ogp.jpg`（1200×630・JPEG q90）として作り直した。

> 配置先が `image-compress/` ではなく `images/` 配下な点に注意（ポータルトップは
> `/tools/` 直下の入口ページのため）。`base:"/tools/"`（vite.config.js）により
> `public/images/ogp.jpg` は `/tools/images/ogp.jpg` で配信され、meta.json の
> 絶対 URL `https://kurodafolio.com/tools/images/ogp.jpg` と一致する。

### 形式は JPEG q90 に統一（2026-06-18 確定 / Cody）

当初テンプレは PNG 出力だったが、3 枚（ポータルトップ／image-compress／本体 kurodafolio）とも
**写真背景＋テキスト合成で写真主体**のため、軽量な **JPEG q90（mozjpeg）に統一**した（黒田さん確定）。
PNG 版は各約 940KB と JPEG の約 8 倍重く、写真主体の絵に PNG は不適切だった。JPEG q90 + DSF3 撮影 +
lanczos3 縮小 + sharpen でテキストのキレは確保できる（本体 OGP の JPEG q90＝80KB が実証）。
旧 `ogp.png` / `ogp-portal.png` は public 配置物・テンプレ作業フォルダの撮影サンプルとも削除済み。
テンプレ作業フォルダには JPEG q90 版 `ogp.jpg` / `ogp-portal.jpg`（各約 112KB）を撮影サンプルとして残置する。
