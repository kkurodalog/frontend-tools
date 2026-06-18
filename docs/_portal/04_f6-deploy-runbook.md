# F6 デプロイ＆公開後検証ランブック（frontend-tools 第1弾 / FTP前提）

> 作成: Cody（制作部 / コーディング・技術レビュー・品質点検）
> 作成日: 2026-06-19
> 対象: 「画像仕分け圧縮くん」を `kurodafolio.com/tools/` に公開する（F6）
> 実行者: 黒田さん（FTP=FileZilla で手動アップロード・実機確認）
> Cody/チーフはサーバーに触れない（認証情報は Bitwarden 管理）。本書は手順とチェックの提供のみ。
> 引き継ぎ元: `00_tech-verification.md` §②（F6必須チェック3項目・想定干渉A〜E）

各項目は `[ ]` チェックボックス。NG/疑問は備考に書き、§F 切り戻しを参照。

---

## 0. ビルド成果物の所在（Cody が最終ビルド済み・2026-06-19）

| プロジェクト | dist パス（アップロード元） | デプロイ先（FTP配置先） |
|---|---|---|
| frontend-tools（ツール） | `projects/_self/frontend-tools/dev/dist/` | `public_html/tools/`（フォルダを作りこの中へ dist の中身） |
| kurodafolio（本体） | `projects/_self/kurodafolio/06_implementation/dev/dist/` | `public_html/`（直下に上書き） |

- frontend-tools `dist/` 主要成果物（確認済み）: `index.html`（→`/tools/`）／ `image-compress/index.html`（→`/tools/image-compress/`）／ `assets/` 配下の WASM 群（`avif_enc-*.wasm` / `webp_enc-*.wasm` / `webp_enc_simd-*.wasm` / `squoosh_oxipng_bg-*.wasm`）／ OGP（`images/ogp.jpg` = ポータル・`image-compress/ogp.jpg` = ツール）／ カードサムネ（`images/tools-image-compress.webp` / `.jpg`）／ **`.htaccess`**（dotfile・後述）。
- kurodafolio `dist/`（確認済み）: `sitemap.xml` に tools2URL（`/tools/` ・`/tools/image-compress/`）込み・計17URL／トップ `index.html` に「公開ツール」セクション（`/tools/` への導線）あり。

> ⚠️ **`.htaccess` は隠しファイル**。FileZilla で見えない場合は §A-0 の「隠しファイル表示ON」を実施すること。frontend-tools `dist/.htaccess` は実在を確認済み（Vite が publicDir の dotfile を複製する挙動を実機確認）。万一 FileZilla で転送対象に出てこない場合は、`dev/dist/.htaccess` を単体で手動アップロードする（配置先 `public_html/tools/.htaccess`）。

---

## A. アップロード手順（FileZilla / FTP）

### A-0. FileZilla 事前設定

- [ ] **隠しファイルを表示**: メニュー「サーバー」→「強制的に隠しファイルを表示」をON（`.htaccess` を見えるように）。
- [ ] **転送モードは「自動」**: メニュー「転送」→「転送タイプ」→「自動」。WASM/画像（バイナリ）と HTML/CSS/JS（テキスト）が正しく転送される。手動でASCII固定にしない（WASM/画像が壊れる）。
- [ ] サーバーへ接続（認証情報は Bitwarden 参照 / 接続先=XServer・ドキュメントルート `public_html/`）。

### A-1. ツール（frontend-tools）を `public_html/tools/` へアップロード

- [ ] リモート `public_html/` 直下に `tools` フォルダが**無ければ作成**（右ペインで右クリック →「ディレクトリの作成」→ `tools`）。
- [ ] ローカル `projects/_self/frontend-tools/dev/dist/` の**中身すべて**を、リモート `public_html/tools/` の**中へ**アップロード。
      （※ `dist` フォルダごとではなく、dist の**中身**を tools の中に置く。結果 `public_html/tools/index.html` になる形）
- [ ] アップロード後、`public_html/tools/.htaccess` が存在することを確認（隠しファイル表示ON状態で見えるはず）。**無ければ §0 の単体手動アップロードを実施**。
- [ ] `public_html/tools/assets/` 配下の `.wasm` ファイルがサイズ通り（数百KB〜3.5MB の `avif_enc-*.wasm` 等）転送されている（途中切れ・0バイトでない）。

### A-2. 本体（kurodafolio）を `public_html/` へアップロード

- [ ] ローカル `projects/_self/kurodafolio/06_implementation/dev/dist/` の**中身すべて**を、リモート `public_html/` の**中へ**アップロード（既存ファイルを上書き）。
- [ ] **重要 — 既存の `public_html/tools/` を消さないこと**: 本体 dist には `tools/` も `.htaccess` も含まれない。FileZilla の「同期ブラウジング」やミラー削除（リモートにあってローカルに無いものを消す）機能は**使わない**。通常の上書きアップロードのみ行う。これを守れば §A-1 で置いた `tools/` は無傷で残る。
- [ ] 同様に、本体の `public_html/.htaccess`（SSGForm / リダイレクト / SSL強制 等の既存記述）は dist に含まれないため**上書きされない**＝そのまま温存される（正しい挙動）。

---

## B. F6必須チェック3項目（`00_tech-verification.md` §② 引き継ぎ）

### B-1. 本体 `.htaccess` の全捕捉 rewrite（SPA fallback）有無

- [ ] サーバーの `public_html/.htaccess` を開き、`RewriteRule ... index.html [L]` のような**全リクエストを index.html へ飛ばす記述が無い**ことを確認。
      （本体は静的マルチページのため通常は無い。もし有れば、その RewriteRule の直前に `RewriteCond %{REQUEST_URI} !^/tools/` を追加し `/tools/` 配下を除外する。）

### B-2. 3パターンの到達確認

- [ ] `https://kurodafolio.com/tools/` → 200（ポータルトップ表示）
- [ ] `https://kurodafolio.com/tools/image-compress/` → 200（ツール表示）
- [ ] `https://kurodafolio.com/tools/image-compress`（末尾スラッシュ**無し**）→ 末尾スラッシュ付きへの 301 リダイレクト後に表示（Apache DirectorySlash の正常挙動）。エラーにならなければOK。

```bash
# 任意: ステータス確認（黒田さんが実行）
curl -I https://kurodafolio.com/tools/
curl -I https://kurodafolio.com/tools/image-compress/
curl -I https://kurodafolio.com/tools/image-compress   # → 301（Location が /image-compress/ 付き）
```

### B-3. `.wasm` の Content-Type 確認

- [ ] ツールページ（`/tools/image-compress/`）を開き、DevTools → Network で `.wasm` ファイル（`avif_enc-*.wasm` 等）の **Content-Type が `application/wasm`** で返ることを確認。
      （`text/html` 等になっていたら `tools/.htaccess` の `AddType application/wasm .wasm` が効いていない＝ §A-1 で `.htaccess` が正しく置かれているか再確認。）

---

## C. 機能・表示の実機確認

- [ ] **ツールが実際に動く**: `/tools/image-compress/` で画像を投入 → 圧縮処理が走る → ダウンロード（または一括ZIP DL）できる。コンソールに WASM 読み込みエラーが出ていない。
- [ ] **WebP / AVIF 出力**が選べて生成される（各 WASM が読めている証拠）。
- [ ] **本体トップ → ツール導線**: `https://kurodafolio.com/` の「公開ツール」セクション／ナビ／フッターから `/tools/` へ遷移できる。
- [ ] **ツール → 本体逆導線**: ポータル/ツールのヘッダー・フッター・パンくずから本体（Home/Works/About/Contact）へ遷移できる。
- [ ] **OGP 画像が公開URLで開ける**:
      - [ ] `https://kurodafolio.com/tools/images/ogp.jpg`（ポータル）が表示
      - [ ] `https://kurodafolio.com/tools/image-compress/ogp.jpg`（ツール）が表示
- [ ] スマホ実機 / Safari・Chrome で表示崩れ・リンク切れが無い。

---

## D. SNS OGP キャッシュ更新

新規/更新URLは各プラットフォームのキャッシュを更新しないと古い情報が出るため、3対象を再取得させる。

- [ ] **X (Twitter) Card Validator** で取得（カード画像・タイトル・説明）:
      - [ ] `https://kurodafolio.com/tools/`
      - [ ] `https://kurodafolio.com/tools/image-compress/`
      - [ ] `https://kurodafolio.com/`（本体トップ＝公開ツールセクション追加分の反映）
- [ ] **Facebook Sharing Debugger**（developers.facebook.com/tools/debug/）で同3対象を「Scrape Again」してキャッシュ更新。

---

## E. Google Search Console

- [ ] **サイトマップ再送信**: Search Console → サイトマップ → `https://kurodafolio.com/sitemap.xml` を（再）送信。ステータス「成功」を確認（取得は数時間〜数日）。
- [ ] **インデックス登録リクエスト**（URL検査ツールで2URL）:
      - [ ] `https://kurodafolio.com/tools/`
      - [ ] `https://kurodafolio.com/tools/image-compress/`
- [ ] （任意）`https://kurodafolio.com/robots.txt` の Sitemap 行が引き続き正しいことを確認。

---

## F. 失敗時の切り戻し（リバーシブル）

- **ツールが動かない / 表示が壊れた場合**: リモートの `public_html/tools/` フォルダごと削除すれば、公開前の状態（ツール非公開）に即座に戻る。本体には影響しない。
- **WASM が `application/wasm` で返らない場合**: まず `public_html/tools/.htaccess` の存在と中身（`AddType application/wasm .wasm`）を確認。`.htaccess` が原因で 500 等が出た場合は `tools/.htaccess` を削除すれば `.htaccess` 適用前に戻る（キャッシュ最適化が外れるだけでツール自体は動く想定）。
- **本体トップの公開ツールセクションを下げたい場合**: 旧 `public_html/index.html` のバックアップがあれば差し戻し（無ければ本体を1つ前のビルドで再デプロイ）。
- いずれもサーバー側ファイル削除/差し戻しのみで戻せる＝リバーシブル。

---

## 完了合意

- 公開日: 2026 / __ / __
- 確認者: 黒田さん
- 合意内容: A 〜 E すべて完了（F は不要時）をもって F6 公開完了。
