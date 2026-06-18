# _f4-reid-final-review — F4 最終総点検（Reid / クリーンコンテキスト最終評価者）

> 評価日: 2026-06-18 / 評価者: Reid（制作部・コードレビュー / 規範照合 / 品質判定）
> 対象: frontend-tools 第1弾「画像仕分け圧縮くん」F3 全実装（Stage1〜4）＋その後の実機修正多数の**最終形・全体通し**。
> 立場: 生成に一切関与していない最終評価者（evaluation-gate.md / Reid 評価必須）。Stage4（自動推測＋SEO）は単独ゲート未実施・実機修正が多数後追いで入ったため、最終形を通しで厳格に評価する。
> 評価は読み取り＋ dist 裏取りのみ。コードは修正していない。

---

## 判定: **条件付き合格（Conditionally Approved）**

最終形のコード品質は高い。規範準拠（FLOCSS/論理プロパティ/rm()/差分トークン/インラインstyle禁止）は**ほぼ完全準拠**、メモリ解放の総点検は**全経路でリークなし**、WASM パス解決3コーデックは dist で**MT/parallel 漏出ゼロ・base /tools/ 正常解決**を確認、SEO 転記は 03_seo と**全項目一致・全絶対URL**。

差し戻しに当たる致命傷は無い。ただし**公開前に潰すべき Must 2件**（OG画像未配置＝SEO設計の前提が未達 / 未宣言依存 wasm-feature-detect）と、**Should 数件**が残る。Must 2件は実装上の軽微作業（画像配置・package.json 1行）で、いずれも F4→F5 の公開準備で解消可能。コードの構造的差し戻しは不要のため「条件付き合格」とする。

---

## Must（公開前に必須）

### M-1. OG画像 `ogp.png`（1200×630）が未配置 — SEO設計の前提が未達
- **箇所**: `dist/image-compress/`（および公開先 `kurodafolio.com/tools/image-compress/ogp.png`）。`src/data/meta.json` / JSON-LD / OG/Twitter メタはすべて `https://kurodafolio.com/tools/image-compress/ogp.png` を指すが、**実画像が存在しない**（Stage4 cody-note C-1・申し送り1 で Haru F5/F6 へ送られている）。
- **なぜ問題か**: 03_seo §4-2/§7 で「OGP画像は絶対URL必須・SNSシェアで画像が出ない事故を防ぐ」と結論づけた中核要件。メタだけ絶対URLを指しても実体が無ければ SNS シェアで画像が出ず、差別化メッセージ（ブラウザ完結・送信しない）が SNS 面で伝わらない。
- **修正方針**: Haru が 03_seo §4-4 仕様（1200×630・b-tech-cool・「送信しない」バッジ・安全マージン）で制作し、公開時に `image-compress/` 同階層へ配置する。**公開前チェックリスト（03_seo §7）の唯一の未達 [ ] 項目**として公開ゲートで必ず確認する。

### M-2. `wasm-feature-detect` が package.json に未宣言の暗黙依存
- **箇所**: `src/assets/js/image-compress/wasm-webp.js` L21 `import { simd } from "wasm-feature-detect";`。`package.json` の dependencies に `wasm-feature-detect` が無い（現状は @jsquash 等の транзитив依存で `node_modules` に存在するため**たまたま解決できている**）。
- **なぜ問題か**: 直接 import している以上、自プロジェクトの直接依存。транзитив依存はバージョン・存在保証がないため、@jsquash の将来更新やクリーン install で消えると**WebP 経路（全種別の基軸）がビルド/実行ともに全滅**する。保守性・再現性の観点で通せない。
- **修正方針**: `package.json` の dependencies に `wasm-feature-detect`（実体の解決バージョンに合わせる）を明示追加して `yarn install`。1行追加で解消。

---

## Should（品質上推奨・公開可否は止めない）

### S-1. spec §3-c の「準備中 disabled」分岐が最終形で全面デッドコード化（spec とのドリフト）
- **箇所**: `presets.js` FORMAT_DEFS 全フォーマット `enabled: true`。`main.js` `formatGroupHtml` の `is-soon`/「準備中」/`disabled` 分岐、`isFormatEnabled` 降格保険、`_c-ic.scss` `.c-ic-fmtcard.is-soon`、HTML `c-ic-fieldset__note` の「『準備中』は今後…」文言が**現状到達不能**。
- **なぜ問題か**: Stage1〜3 で全フォーマット稼働済みのため段階的有効化の役目は終わっており、機能上は無害。ただし**HTML の「準備中」案内文だけは画面に出る**ため、ユーザーに「使えない形式がある」という誤認を与えうる（実際は全形式使える）。コードの保険分岐自体は将来フォーマット追加時の安全弁として残す価値があり許容だが、画面文言は実態と乖離。
- **修正方針**: `index.html` の `c-ic-fieldset__note` から「『準備中』は今後のアップデートで使えるようになります。」の一文を削除（または将来フォーマット追加時まで保留する旨を spec §3-c に「現状デッド・文言のみ要調整」と注記）。コードの disabled 保険は残置可。

### S-2. JSON-LD `sameAs` の GitHub と他メタのアカウント整合（要・事実確認）
- **箇所**: `index.html` JSON-LD `sameAs: ["https://github.com/kkurodalog", ...]`。Twitter は `@kurodalog`、GitHub は `kkurodalog`（k が1つ多い）。
- **なぜ問題か**: 03_seo §5-2 の確定値どおりに転記されており**転記ミスではない**。ただし sameAs は実在 URL を指す必要があり（存在しない GitHub アカウントを指すと構造化データの信頼性を損なう）、Twitter ハンドルと綴りが異なるため**実在アカウントか**を公開前に1度実地確認する価値がある。
- **修正方針**: `github.com/kkurodalog` が実在する黒田さんのアカウントかを確認（★要確認・代表）。実在しないなら 03_seo §5-2 と meta 側を同時修正。実在するならこのまま。

### S-3. `encode.worker.js` の `worker.onerror` 時に降格状態が残る経路の堅牢性
- **箇所**: `worker-client.js` L27-31 `worker.addEventListener("error", ...)` は pending を全 reject するが worker インスタンスは破棄しない（`worker=null` 化せず）。次の encode 要求は同じ（壊れている可能性のある）worker を再利用する。
- **なぜ問題か**: 致命的 Worker エラー（WASM OOM 等）の後、worker が壊れた状態で再利用されると以降の全エンコードが連鎖失敗しうる。main 側 try/catch で1枚ごとに握って全体は止めないため**画面は固まらない**が、回復しないまま全失敗が続く可能性。実害は限定的（ユーザーは reload で回復）。
- **修正方針**: `error` ハンドラ内で `worker.terminate(); worker = null;` し、次回 `getWorker()` で新規生成して回復可能にする。**Nice 寄りの Should**（多枚 AVIF/大判の極限ケースのみ顕在化）。

### S-4. `addFiles` の枚数超過警告が「超過しても受け入れて処理」する設計の明示
- **箇所**: `main.js` `addFiles` — `items.length + incoming > maxFiles(30)` で警告は出すが**受け入れは拒否しない**（spec D8「緩い上限＋逐次処理」準拠で意図どおり）。
- **なぜ問題か**: 仕様準拠で**問題ではない**が、20〜30枚 AVIF 一括の固まり実測（02_qa 3-1/3-2）はコードでは担保できず実機必須。50枚等を投入された場合の体感はメモリ・端末依存。
- **修正方針**: コード修正不要。F4 実機で「30枚超 AVIF 含む」の固まり実測を黒田さんが行う（下記 実機要確認リスト参照）。

---

## Nice（任意・余力があれば）

- **N-1. `.u-visually-hidden`（_c-ic.scss L17-27）が物理プロパティ `width`/`height`/`margin: -1px`/`clip` を使用**。これは sr-only クリップの業界標準パターンで coding-rule §6 例外（`u-sr-only` 1px 許容）に該当し**違反ではない**。ただしプロジェクトに既に `_u-sr-only.scss` がある場合、c-ic 内ローカル定義との二重管理になる。グローバル汚染回避のため意図的にローカル化したとコメントにあり許容。共通 utility への寄せは将来の整理余地。
- **N-2. `formatBytes`（util.js）が KB を `toFixed(0)` で丸める**ため、小さい削減差（数百B）がカードで「同容量」に見える場合がある。言語不問・数値主導 UI の精度として KB は小数1桁でもよい（任意）。
- **N-3. `package.json` author が `"kuroda"`** で、JSON-LD/コピーライトの「黒田こうすけ / Kosuke Kuroda」と表記が異なる。package.json は非公開メタなので影響軽微だが統一余地。

---

## 観点別・合否サマリ

### 1. 規範準拠（FLOCSS / 論理プロパティ / rm() / 差分トークン / インラインstyle） — **合格**
- `grep '\.js-' src/assets/styles` = **0件**（§2-2 準拠）。
- 物理 margin/padding（`-top/-right/-bottom/-left`）= c-ic/p-tool-head で **0件**（横断ルール(3)準拠）。2値 shorthand も 0件。
- 生 px は `.u-visually-hidden` の 1px/-1px のみ（§6 例外）。それ以外は全て `rm()` 経由。
- c-ic SCSS が参照する var トークン 54個すべて src styles 内で定義済み（**未定義参照ゼロ**）。差分トークン `--dropzone-*`/`--field-*`/`--tool-panel-*`/`--tool-section-gap`/`--touch-target-min` は `_variables.scss` に定義（design-concept §2-2 準拠）。
- インライン style: HTML に `style="` **0件**。動的な進捗バー幅は `dom.progressBar.style.inlineSize`（JS・許容）。種別ラジオ/フォーマット追加（今セッション変更箇所）も全て規範内。
- h1 clamp は coding-rule §5-5-6（型スケールトークン端点の手書き clamp 許容）に**完全準拠**（流動レンジ・端点 px をコメント明記、§5-5-6 の必須コメント要件を満たす）。

### 2. アクセシビリティ（最終形） — **合格**（実機確認項目あり）
- ドロップゾーン: `role="button"` + `tabindex="0"` + `aria-label` + Enter/Space で file ダイアログ + `<input type=file>` 併設（D&D 代替・§4-1 準拠）。
- 種別ラジオ: `fieldset`/`legend`/`<label for>`/visually-hidden radio + label focus 可視（`:focus-visible` を label に映す）。**change/click 併用は論理的に正しい**: change=矢印キー/Space/別種別クリックの通常選択（ブラウザは矢印移動で change を発火）、click=同一種別再クリックのみ（`radio.value !== presetId` で別種別を click 側は無視）→ **二重発火なし**。label/input の合成 click も `closest([data-ic-type-radio])` で1回に正規化。設計妥当。
- フォーマット チェックボックス: `<label for>` 紐付け・複数選択・全 enabled（disabled なし）。
- トグル: `aria-expanded` + chevron は `aria-hidden`（装飾）。`[aria-expanded="true"]` で chevron 90deg 回転 + テキスト accent 維持。
- 選択中種別テキスト: `data-ic-current` に `aria-live="polite"`。進捗: `aria-live="polite"` + `role="progressbar"`（aria-valuenow を JS 同期）。通知: `role="status"` `aria-live="polite"`。
- 削除ボタン: `<button>` + `aria-label="この画像を削除"` + アイコン `aria-hidden` + `:focus-visible` リング + `--touch-target-min` サイズ。
- ⑤SVG助言バナー: アイコン `aria-hidden` + テキスト span。

### 3. レスポンシブ — **合格**（実機確認項目あり）
- 768px 境界は header/nav/logo/contact で `@include mq(md)` 統一（FAB/mobile-nav/_drawer.js と一致）。
- 種別グリッド `repeat(auto-fill, minmax(rm(240)/rm(208), 1fr))`・フォーマット群 `flex-wrap`・カードは `flex-wrap` で SP 縦積み破綻なし。削除ボタンは `position:absolute` で card__main 右下（`position:relative` 基準）。
- ヘッダー幅: `--container-max`（1280px）+ `--container-padding-sp/pc` で本体 l-container と一致。
- h1 clamp 768→1024px 流動・等比型スケール両端同時着地（§5-5-6）。

### 4. パフォーマンス / 堅牢性（メモリリーク総点検 / WASM） — **合格**（最重要・全経路追跡）
- **Object URL**: `createObjectURL` は2箇所のみ。(1) thumbUrl@492 は直前 491 で旧 `_thumbUrl` を revoke（再 render 安全）。(2) download blob@910 は 917 で setTimeout revoke。`renderItem` 呼出は `addFiles`/`applyBulkToItem` の2経路のみ。**在地更新系（setItemPreset/applyInferenceIfReady/setItemFormat）は renderItem を呼ばず新規 Object URL を作らない**＝再適用でリークなし。`removeItem`@618 は `_thumbUrl` revoke + `results`/`error` null 化。
- **ImageBitmap**: 全生成箇所（image-ops 44/67・worker 83）で `close()`。item 上に保持しない。
- **RGBA ArrayBuffer**: Worker へ Transferable で detach。複数出力は `rgba.slice(0)` コピーを各 transfer（多重 detach 回避・コメントも正確）。結果 buffer も Transferable で返却。**残存 transferable リークなし**。
- 追加→圧縮（複数形式）→種別再クリック（再適用）→削除→全削除の**全経路でリーク源を確認できず**。
- **②③既定3枚（AVIF+WebP+JPEG）**: `encodeItemFormats` が formats を逐次 await・`producedExts` Set で拡張子重複 dedup・1形式失敗は try/catch でスキップ継続・pending id-map（worker-client `pending` Map）で1:1 対応。Transferable に正しく乗る。設計上 20〜30枚で固まらない構造（実測は実機）。
- **WASM 最終健全性（dist 裏取り済み）**: `yarn build` exit 0。dist の .wasm は **4本のみ**（avif_enc / squoosh_oxipng_bg / webp_enc / webp_enc_simd）。`*_mt*`/`*parallel*`/`*rayon*` = **0件**（MT/SAB 経路の漏出なし）。全 .wasm URL が `/tools/assets/...wasm` に解決（base 正常・`/tools/tools/` 二重なし）。AVIF/oxipng は別チャンク（`wasm-avif-*.js`/`wasm-oxipng-*.js`）に分割され encode.worker から dynamic import（遅延ロード §3-a 維持・encode.worker チャンク内に avif_enc インライン 0件）。webp は SIMD/非SIMD 両 .wasm を asset 化（§Must M-A の非SIMD全滅対策が build に反映）。

### 5. 仕様整合 — **合格**
- 6種別パラメータ（§1）: presets.js が品質値・avifQuality・maxEdge・lossless・pngReduce・manualOnly・advise を §1 表どおり実装。
- 既定フォーマットスキーム（2026-06-18 確定）: ①WebP / ②③AVIF+WebP+JPEG / ④WebP+PNG / ⑤⑥PNG を `recommendedFormats` で正確に反映。
- PNG 経路分岐: ④`pngReduce:true`→メディアンカット256色→oxipng / ⑤⑥`lossless:true`→減色なし可逆。worker `reduceColors ? quantiseAndOptimise : optimise` で分岐。
- D1〜D10: HEIC/GIF スキップ案内（classifyFile）・EXIF削除+Orientation正立（createImageBitmap `imageOrientation:"from-image"` + Canvas 再描画）・keep-JPEG（toBlob 0.82・Worker 内）・枚数/サイズガード（LIMITS）・ファイル名拡張子追従+衝突回避（swapExtension/makeUniqueName）すべて実装。
- 自動推測（§5）: 軽量特徴量（縮小サムネ96px・色数上限400打ち切り・アルファ a<250）・§5-2 ヒューリスティック6分岐を inference.js が表どおり実装・②は構造上返さない（manualOnly/inference が photo-key を返さない）・根拠 small 表示・`userPicked` で手動上書き尊重。
- SEO 転記（dist 裏取り済み）: title §2-2 / description §3-2 / canonical 自己参照絶対 / robots index,follow / OG・Twitter 全絶対URL / twitter:creator=twitter:site=@kurodalog / og:site_name=kurodafolio / JSON-LD WebApplication+BreadcrumbList（最終 item なし）/ author=黒田こうすけ・Kuroda Kosuke・sameAs(X/GitHub/frontend-note) / 逆導線CTA案A（見出し「このツールを作った人について」+「制作実績を見る」→works /「制作のご相談をする」→contact）。**画面ブランド=Frontend Tools（header logo・portal title）／ SEO ブランド=kurodafolio（og:site_name・title 末尾）の切り分けが保たれている**。portal top に canonical/twitter は出ない（非破壊・regression なし）。

---

## F4 で黒田さん実機が必要な残項目（コードでは担保不可）

| # | 02_qa 対応 | 実機確認内容 |
|---|---|---|
| R-1 | 3-1 / 3-2 | **20〜30枚（②③で AVIF+WebP+JPEG 既定 = 1枚3形式）一括で固まらないか**の実測。コードは逐次+Transferable+進捗で固まらない設計だが、体感は端末/メモリ依存。最重要リスク。 |
| R-2 | 2-2 | **Safari 実機で AVIF 降格が正しく働くか**（初回 encode 例外捕捉 → avifUnavailable → WebP 降格 → 完了時に「N枚を WebP で出力」集約通知1回）。WebP が②③既定にあるため出力欠落しない設計の実地確認。 |
| R-3 | 1-4 / §1-1 | **実画像での品質/サイズ/④減色256調整**。リサイズ上限px（①1920/②2560/③1600）・品質値（①55/②85/③72…）・④減色256色・oxipng level2 は spec で「実機調整」。実案件書き出しサイズで詰める。 |
| R-4 | 1-10 | EXIF Orientation 持ち画像が**正立出力**されるか（回転情報付き写真で倒れないか）の実地。 |
| R-5 | 2-1 / 2-3 / 2-4 | Chrome/Edge/Firefox での全種別動作・非対応環境フォールバック（WASM/Worker 非対応時の白画面回避メッセージは**未実装＝spec/02_qa 2-4 の「お使いのブラウザでは利用できません」案内が無い**。下記注記）。 |
| R-6 | §7 公開チェック | **リッチリザルトテスト（Google）** で JSON-LD エラーが出ないか（公開後 or ステージング URL で）。 |
| R-7 | M-1 | **ogp.png 実画像配置後**に SNS シェアデバッグ（X/Slack/Facebook）で画像が出るか。 |

### 注記: 02_qa 2-4「非対応環境フォールバック」のコード未対応（Should 相当・実機確認の前に要判断）
- `initImageCompress` は `[data-ic-root]` が無ければ return するのみ。WASM/Worker 非対応の古い環境で「お使いのブラウザでは利用できません」等の明示メッセージを出す経路が**コードに無い**。Baseline 2023 前提（coding-rule §0-4(1) Safari16+/Chrome105+/FF110+）では OffscreenCanvas/Worker/WASM すべて利用可のため**実害はほぼ無い**が、02_qa 2-4 の合格条件「白画面にならない」を厳密に満たすには、起動時の機能検出（`typeof Worker`/`OffscreenCanvas`/`WebAssembly`）+ 非対応時の案内表示があると盤石。**Should（公開を止めない）**。黒田さんが「Baseline 前提で割り切る」判断なら 02_qa 2-4 を「Baseline 担保で対応不要」と注記してクローズしてよい。

---

## 自己検証（評価の質）

- **検証済み: メモリリーク総点検**（追加→圧縮→再適用→削除→全削除）を createObjectURL/revokeObjectURL/renderItem 呼出/close() の全 call site でコード追跡。在地更新系が renderItem を呼ばないこと・Transferable detach・bitmap close を確認。リーク源なし。
- **検証済み: WASM 3コーデックの最終健全性を dist で裏取り**。`yarn build` exit 0・.wasm 4本のみ・MT/parallel/rayon 0件・全 .wasm が /tools/assets/ に解決・avif/oxipng 別チャンク dynamic import・webp SIMD/非SIMD 両 asset 化を確認。
- **検証済み: SEO 転記を 03_seo と突合**。dist HTML で title/canonical/robots/og(url/title/image/site_name)/twitter(creator/site/card)/JSON-LD(WebApplication/BreadcrumbList/author/sameAs) を grep 確認・全絶対URL・@kurodalog・kurodafolio・黒田こうすけ/Kuroda Kosuke 一致。portal top 非破壊（canonical/twitter 0件）も確認。
- **検証済み: 02_qa 実機要確認項目を仕分け**（R-1〜R-7 + 2-4 注記）。コードで満たせる項目と実機必須項目を分離。
- **検証済み: 指摘の再現性**。全 Must/Should にファイルパス+行/箇所+具体修正方針を付与。dist 裏取りコマンドは破壊的操作なし。
