# F3 Stage1 再設計 評価ゲート（Reid / クリーンコンテキスト独立評価）

評価者: Reid（制作部 / コードレビュー・規範照合・品質判定）
日付: 2026-06-18
対象: frontend-tools 第1弾「画像仕分け圧縮くん」F3 Stage1（再設計後・確定UI）
立場: 生成に一切関与していない独立評価（evaluation-gate.md 準拠）

---

## 総合判定: 条件付き合格（CONDITIONAL PASS）

再設計の核（種別ラジオ化・出力フォーマットのチェックボックス複数選択＋カード個別上書き・after画像/②昇格導線の撤去・品質/長辺UIの削除）は**仕様（01_spec §0/§1/§3-c/§4）どおりに実装されており、デッドコードや古いランタイムロジックの残骸はない**。最重要観点である「大量画像で固まらない設計」も Web Worker 逐次＋Transferable＋メモリ解放＋1枚失敗継続＋複数出力リーク対策が**コードレベルで確認でき、堅牢**。非SIMD環境のWebP全滅を防ぐ `wasm-webp.js` の SIMD/非SIMD module 整合（Must M-A）は特筆して質が高い。

差し戻しに至る重大欠陥はない。ただし**規範（coding-rule §0-4(3) 論理プロパティ必須 / §6 rm() 必須）に対する明確な違反が数点**あり、これらは合格前に直すべき（Must）。仕様整合は概ね正確だが、軽微な不整合（古いコメント・未使用トークン・降格通知の二重発火）が Should として残る。

---

## Must（合格前に必須）

### M-1. 物理プロパティ `min-height` が論理プロパティ規範に違反
- ファイル: `dev/src/assets/styles/components/_c-ic-btn.scss` L13
- 該当: `.c-ic-btn { min-height: var(--touch-target-min); }`
- 問題: coding-rule §0-4(3)「margin/padding/box-model は論理プロパティ必須・物理プロパティ禁止」に反する。**同テンプレートの兄弟コンポーネント `_c-btn.scss` L13/L45 は `min-block-size: var(--touch-target-min)` を使っており**、c-ic だけ物理プロパティで揺れている（規範違反かつ既存実装との不整合）。
- 修正方針: `min-height` → `min-block-size` に置換（兄弟 `_c-btn.scss` と同形に揃える）。

### M-2. 寸法の生px直書きが `rm()` 必須規範に違反
- ファイル:
  - `dev/src/assets/styles/components/_c-ic-card.scss` L38-39 `.c-ic-card__thumb { inline-size: 64px; block-size: 64px; }`
  - `dev/src/assets/styles/components/_c-ic.scss` L329 `.c-ic-progress__track { block-size: 8px; }`
  - `dev/src/assets/styles/components/_c-ic.scss` L221-222 `.c-ic-fmtcard__check-box { inline-size: 1.25rem; block-size: 1.25rem; }`（rem 直書き）
- 問題: coding-rule §0-4(4)/§6「全寸法は `rm(N)` 必須・`calc(N * var(--to-rem))` 直書き禁止」。例外カテゴリは border-width / border-radius / CSS変数初期値 / `u-sr-only` 1px / %系 / 微小調整値のみ。64px サムネ・8px プログレストラック・1.25rem チェックボックスは**いずれも例外カテゴリに該当しない通常の寸法値**。兄弟 `_c-btn.scss` は `min-block-size: rm(56)` のように `rm()` を使用しており不整合。
- 修正方針: `64px → rm(64)` / `8px → rm(8)` / `1.25rem → rm(20)` に置換。
- 補足: `_c-ic.scss` L19-20 の `.u-visually-hidden { width:1px; height:1px; }` は **sr-only 1px の明示例外＝OK**（規範どおり）。ただしここも物理プロパティ width/height だが visually-hidden の定番イディオムであり、兄弟テンプレの sr-only 実装と同形なら許容（要・既存 `u-sr-only` との整合確認）。

### M-3. JPEG経路（keep）に Web Worker による非ブロッキング化が効かない＝大量画像で固まりうる
- ファイル: `dev/src/assets/js/image-compress/main.js` L534-537（`encodeOneFormat` の KEEP_JPEG 分岐）→ `image-ops.js` L56-70 `encodeKeepJpeg`
- 問題: WebP 経路は Worker 逐次でメインスレッドを凍結させない設計（生命線・§3-b）。一方 **keep-JPEG は `encodeKeepJpeg` がメインスレッドの `OffscreenCanvas.convertToBlob` で同期的に走る**。`convertToBlob` 自体は Promise を返すが、その前段の `decodeOriented`（createImageBitmap）＋ `drawImage` ＋ JPEG エンコードはメインスレッドで起きる。30枚×JPEG選択時、特に大判画像で UI がカクつく/固まる懸念がある（WebP 側だけ Worker 化して keep を据え置いた非対称）。
- 重大度の判断: Stage1 のデフォルト推奨は WebP であり keep は任意チェックのため即・差し戻しにはしないが、「大量画像で固まらない」が本ツールの非機能の生命線である以上、**Must として明示**する。
- 修正方針（いずれか）: (a) keep-JPEG も Worker（または `requestIdleCallback`/`await new Promise(r=>setTimeout(r,0))` で yield）でメインスレッドを明け渡す、(b) 少なくとも各 item 間に yield を挟み progress 更新を描画させる、(c) F4 実機で 30枚×JPEG の体感を必ず検証し、固まるなら (a) を実装する旨を spec/note に TODO 化。最低でも (c) は必須。

---

## Should（推奨・品質向上）

### S-1. paintResult の主表示ロジックに「after が before を上回る」赤バッジ経路が残るが、容量・削減率の主表示と二重で分かりにくい
- ファイル: `main.js` L566-582 / `_c-ic-card.scss` L176-179（`.c-ic-card__rate.is-bad`）
- 状況: after>before のとき `is-bad`（warning色）＋ `+x%` 表示。これは劣化確認＝数値のみ（§4-3）に沿った妥当な実装で**問題ではない**。ただし head 部（L567）に `c-ic-card__before → 矢印` を出しつつ、各 out 行にも before 比の rate を出すため、複数フォーマット時に before の位置関係がやや読み取りにくい。
- 修正方針: 任意。複数出力時は各 out 行が「ext / after / rate」で自己完結しているので head の矢印は単一出力時のみ出す等の整理を検討。機能上の不具合ではないため Should 下位。

### S-2. AVIF/PNG 選択時の「WebP降格通知」が二重に発火しうる
- ファイル: `main.js` L539-544（`encodeOneFormat` 内 `showNotice(... 準備中のため WebP で出力)`）＋ L522-524（`encodeItemFormats` の catch で `showNotice(... 書き出しに失敗)`）＋ producedExts による重複抑止（L518）
- 状況: UI で AVIF/PNG は `disabled` のため通常は到達しないが、降格保険が働くケースで「準備中のため WebP で出力」通知が**フォーマットごと・画像ごとに showNotice を上書き連打**する（showNotice は単一要素を毎回上書き）。最後の1件しか残らず、複数枚処理では通知が点滅して見える可能性。
- 修正方針: 任意（disabled 前提で実害は小）。Stage2/3 で enabled 化したとき顕在化するので、降格通知は「1回だけ集約表示」へ変更を検討（メッセージのデデュープ）。

### S-3. `paintError` / 通知が `aria-live="polite"` で読み上げられるが、進捗テキストと notice が同時更新されると競合しうる
- ファイル: HTML `index.html` L72（notice `role=status aria-live=polite`）・L82（progress-text `aria-live=polite`）
- 状況: 規範上は適切（複数 live region は許容）。ただし逐次処理中に skip 通知（notice）と進捗（progress-text）が同時に polite で流れると、スクリーンリーダーで読み上げが詰まる。実害は小。
- 修正方針: 任意。F4 で SR 実機確認時にチェック。

### S-4. 未使用の差分トークンがある（design-concept §2-2 との部分乖離）
- 状況: design-concept §2-2 で定義された `--field-border`・`--field-border-focus`・`--field-radius`・`--field-min-size`・`--tool-panel-padding`・`--tool-panel-radius`・`--tool-section-gap` のうち、c-ic 側は `--field-bg` のみ使用（`--field-border` 等は未使用で、代わりに `--color-border` / `--radius-md` を直接参照）。
- 問題: 未定義トークン参照は**ない**（M 違反ではない）。ただし「フィールド系は `--field-*` 差分トークンを使う」という設計意図（§2-2）に対し、border/radius だけ生のグローバルトークンを直接参照しており、トークン設計の一貫性が薄い。
- 修正方針: 任意。フィールド枠の border/radius を `--field-border` / `--field-radius` に寄せると、ツール固有のフィールド見た目を一括調整できる設計意図に沿う。

### S-5. keep ラベルの粒度差（既知・軽微）
- 状況: 画面ラベル実装「JPEG」（`presets.js` FORMAT_DEFS L33）/ spec設計文言「JPEGとして最適化（軽め）」。spec §D7 は「実挙動が伝わる文言で統一」を求める。「JPEG」単独だと「JPEGを選べる」とも読め、穏やか再エンコード（リサイズ＋メタ削除＋q≈82）が起きることが伝わりにくい。
- 修正方針: 黒田さん確認事項（過度に減点しない）。チェックボックスのラベルを「JPEG（最適化）」程度に補うか、`c-ic-fieldset__note` 側で一言補足する案を提示。

---

## Nice（任意）

### N-1. コメントの残骸が実装と乖離（混乱の元・デッドコードではない）
- `main.js` L4（ヘッダー「→ Before/After」）/ L36-38・L242 のコメント（「行別フォーマット上書きは Stage1 では実装しない」）は**実装と矛盾**（after画像は撤去済み・行別上書きは本実装済み）。`_c-ic-card.scss` L5「サムネ（Before/After 並置）」「種別プルダウン」、`_f3-stage1-cody-note.md` 2.（L49/L51）「Before/After 並置」「種別プルダウン」も旧記述のまま。
- 影響: ランタイムには無影響（純コメント）。後続 Stage 実装者が誤読するリスク。
- 修正方針: コメントを現状（after廃止・カード個別フォーマット本実装・ラジオ化）に更新。

### N-2. `presets.js` L76 コメント「手動昇格導線を明示する種別」は撤去済み導線への言及
- `manualOnly: true` 自体は §5（②は自動推測対象外）の正しいフラグだが、コメントの「手動昇格導線を明示する」は撤去済みの promote を指す古い表現。「②は自動推測の対象外（手動選択前提）」に直すと正確。

### N-3. `image-compress.js` のエントリーが共通 script.js に載らない設計は適切
- ページ専用 `<script type=module>` で他ページに WASM バンドルを持ち込まない設計は §3-a 遅延ロード思想と整合。良い。

---

## 観点別チェック結果

### 1. 規範準拠
- FLOCSS 命名（c-ic / c-ic-card / c-ic-btn・BEM Element `__`・Modifier `--`）: 適合。
- SCSS 構成（`@use "../global" as *` / components glob 自動取り込み / 1ファイル=1 Block）: 適合。
- 論理プロパティ: **M-1 違反（min-height）**。それ以外は block/inline 論理プロパティで統一されている。
- インライン style 禁止: 適合。動的値（進捗バー幅 `style.inlineSize`・L670）は許容例外として妥当。静的スタイルは全て SCSS。
- 差分トークン: 未定義トークン参照なし（適合）。一貫性に Should S-4。
- rm() 必須: **M-2 違反（64px/8px/1.25rem）**。
- `.js-` への CSS 付与: 0件（適合 / そもそも `data-ic-*` 属性フックを採用しており `.js-` 自体を使っていない＝§2 の責務分離思想と整合）。

### 2. アクセシビリティ
- 種別ラジオ: `fieldset`+`legend`+visually-hidden radio + `label for` + `:checked/:focus-visible + label` でフォーカスリング。同一 `name` グループで矢印キー移動はネイティブ。適合。
- フォーマットチェックボックス: `label for` 紐付け・disabled「準備中」を `c-ic-fmtcard__soon` テキスト＋`opacity .55`＋`cursor:not-allowed` で伝達。適合。ただし disabled の「準備中」は視覚テキストのみで、SR には input の disabled 状態のみ伝わる（label内テキストは読まれる）ので実用上OK。
- トグル: `aria-expanded` 切替＋chevron は `aria-hidden`（装飾）＋CSS rotate。適合。
- 選択中種別テキスト: `c-ic-card__current` に `aria-live="polite"`。適合。
- 進捗: `role=progressbar`+`aria-valuenow` 同期（L671-672）＋ progress-text `aria-live`。適合。
- ドロップゾーン: `role=button`+`tabindex=0`+Enter/Space ハンドラ＋`<input type=file>` 併設。適合。reset の `[role=button]{cursor:pointer}` を component スコープで `cursor:default` 上書きし、内部 pick ボタンは pointer 維持＝適切（配布テンプレ reset を触らない方針＝feedback_template_upgrade_flow と整合）。

### 3. レスポンシブ
- 種別グリッド `repeat(auto-fill, minmax(15rem,1fr))`（compact 13rem）・フォーマットは flex-wrap・カードは flex-wrap。768px境界でのメディアクエリ依存がなく auto-fill で自然に縦積みになるため、モバイルでカード破綻のリスクは低い。適合（F4 実機で 360px 幅の最終確認推奨）。

### 4. パフォーマンス/堅牢性（最重要）
- Worker 逐次: main.js L480-492 が `for...await` で1枚ずつ直列。各フォーマットも L515-525 で逐次。並列暴走なし。適合。
- Transferable: worker-client L42 `postMessage(..., [rgba])`・worker L34 結果 `[resultBuffer]`・prepareRgba が ImageData backing buffer を渡す。適合。
- 複数出力での rgba 共有: `ensureRgba()` で1度だけ生成 → 各フォーマットに `rgba.slice(0)` コピーを渡す（L553）。transfer で detach される問題を正しく回避。適合・良。
- メモリ解放: `bitmap.close()`（image-ops L43/L66/L76）・before サムネ Object URL は renderItem L352 で再描画時に revoke・DL の Object URL は L662 で revoke。**after画像は生成しないため after URL リークの懸念自体が消えている**。適合。
- 1枚失敗継続: runCompression L483-490 の try/catch で当該1枚 paintError・全体継続。Worker 致命エラーも worker-client L27-31 で pending 全 reject＋main 側 catch で継続。適合。
- 複数出力パイプライン取りこぼし: `encodeItemFormats` が選択フォーマット分を逐次処理し `producedExts` で重複抑止・0件時 throw。適合。
- カード個別⇄一括の状態同期: `applyBulkToItem`（一括→全item・再描画）/ `setItemPreset`（種別変更→推奨追従＋`syncItemFormatChecks` でDOM同期・fieldset閉じない）/ `setItemFormat`（チェック→`FORMAT_ORDER`正規化）。不整合は見当たらない。適合。
- **非対称リスク: keep-JPEG のメイン側同期処理（M-3）**。

### 5. 仕様整合
- 6種別パラメータ（presets.js）: ①q55/1920 ②q85/2560(manualOnly) ③q72/1600 ④q80/1600 ⑤可逆/null(advise svg) ⑥可逆/null — **spec §1 と完全一致**。avifQuality（①45②63③52）も一致。
- D1: HEIC/HEIF を classifyFile で当該1枚スキップ＋案内（GIF も同様）。適合。
- D3: createImageBitmap `imageOrientation:"from-image"` で正立焼き込み＋Canvas再描画でEXIF落ち。適合。
- D7: keep=Canvas `toBlob/convertToBlob('image/jpeg',0.82)`・透過は白背景平坦化。適合（透過keepの白平坦化は要確認だが note §6 で明記済み）。
- D8: LIMITS maxFiles 30 / maxFileBytes 25MB・超過は警告継続・1枚超過はスキップ。適合。
- D10: swapExtension で拡張子追従・makeUniqueName で同名衝突回避（拡張子違いは衝突扱いしない）。適合。
- advise（⑤SVG助言）: `shouldShowAdvise(presetId)` でカード単位・⑤選択時のみ表示／他種別で除去（updateAdviseHint）。適合。
- after画像・②昇格導線の撤去: ランタイムロジック・HTML・CSS から完全撤去を確認（grep で promote の実コードは0、コメント残骸のみ＝N-1/N-2）。**デッドコード/古いCSSの残存なし**。適合。
- §3-c 段階的有効化: FORMAT_DEFS の AVIF(stage2,enabled:false)/PNG(stage3,enabled:false) が disabled「準備中」。WebP/JPEG は Stage1 稼働。適合。

### 6. 構造の拡張性
- `FORMAT_DEFS[key].enabled/stage` のフラグ1つで AVIF/PNG を後から有効化でき、`encodeOneFormat` に AVIF/PNG 分岐を差し込める構造（note §Stage差し替えポイントと整合）。プリセットの `recommendedFormats` も④が WebP+PNG を既に持ち、Stage3 で減色二出力が自動成立。降格保険コードが安全弁として残る。拡張性は良好。適合。

---

## 自己検証（評価の質の担保）

検証済み: (1) 大量画像で固まらない設計 — Worker 逐次（main.js L480-492）・Transferable（worker-client L42 / worker L34）・rgba.slice(0) コピー共有（main.js L553）・bitmap.close()（image-ops L43/66/76）・after URL リーク消滅（after生成なし）・before/DL URL revoke（main.js L352/L662）を具体的コード箇所で確認。**ただし keep-JPEG のメイン側同期処理（image-ops L56-70）は Worker 非経由＝非対称リスクとして M-3 で指摘**。
検証済み: (2) カード個別⇄一括の状態同期・複数出力取りこぼし — applyBulkToItem / setItemPreset / setItemFormat / syncItemFormatChecks / encodeItemFormats（producedExts・0件throw）をコードで追跡。不整合なし。
検証済み: (3) after画像・②昇格導線の撤去 — grep でランタイムの promote コード0件・after URL 生成なしを確認。残るのはコメント残骸のみ（N-1/N-2）でデッドコード/古いCSSなし。
検証済み: (4) 指摘の再現可能性 — 全指摘にファイルパス＋行番号＋修正方針を添付。

未達: なし（評価対象スコープ内は全観点を確認）。Stage2-4（AVIF/oxipng/imagequant/自動推測/SEO）はスコープ外につき未評価＝減点せず。
