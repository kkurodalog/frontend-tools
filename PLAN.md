# frontend-tools セットアップ plan — フロント実用ツール公開構想 正本

担当: Mane（制作部 / 案件管理・見積もり・進捗管理）
作成日: 2026-06-12 ／ PLAN.md 移管日: 2026-06-15
ステータス: **F1 完了（プロジェクト初期化）／ Fd 完了（デザイン設計・Mado条件付き合格）／ 方向A 完了（Fd 本番CSS実装＝共通枠・Reid評価ゲート通過 → さらに static-template 基盤フルリビルドで再構築・Reid再合格）／ デザイン確定（ナビ案B・768px境界・カテゴリ非表示）／ i18n＝採用しない（2026-06-17確定）／ アーキ＝独立継続（コピー運用・2026-06-17確定）／ F2 第1弾機能設計 完了（2026-06-17・Mane評価ゲート条件付き合格→Must/Should反映済み）／ **F3 第1弾実装 完了（2026-06-18・Stage1〜4＝WebP/AVIF/PNG可逆/④減色/keep-JPEG・種別ラジオ＋複数フォーマット出力・自動推測・個別削除・SEO/JSON-LD/CTA案A・黒田さん実機修正多数）／ F4 最終評価ゲート通過（Reid 条件付き合格→Must M-2/S-1/S-3反映→後発UI変更の再チェックも合格）／ プロジェクト名を frontend-tools にリネーム（旧 kuroda-tools・2026-06-18・GitHub Public 公開）／ 次＝F5本体導線・ogp.png制作（Haru）・実機QA（30枚固まり/Safari AVIF/実画像調整）**
配置: `projects/_self/frontend-tools/PLAN.md`（案件単位 plan・案件フォルダ配下 / plans/CLAUDE.md 区分準拠）
> ★プロジェクト名変更（2026-06-18）: 旧称 `kuroda-tools` → `frontend-tools` にリネーム（GitHub Public リポ名・ローカルフォルダ名・参照を更新）。公開URL `kurodafolio.com/tools/`・スラッグ `image-compress`・vite `base:"/tools/"` は不変。
> ★本ファイルは旧正本 `plans/kuroda-tools-setup.md` の移管先（mane-file-structure.md §3-2 確定方針）。移管完了に伴い旧正本は削除済み。以後の進捗管理は本 PLAN.md で行う。

---

## 1. 背景・目的

### 1-1. 起点
2026-06-12 の壁打ちで、黒田さん自身がフロント制作で日常的に使う実用ツールを順次作り、`kurodafolio.com/tools/` に公開していく構想が固まった。第1弾は本人が明言した唯一の鋭い痛点（TinyPNGで圧縮率・方式を画像種別ごとに選べない）に応える「画像仕分け圧縮くん」。Mado（候補選定・公開フォーマット・本体導線設計）と Mane（ファイル配置設計）の分析を経て、黒田さんが全方針を承認した。

### 1-2. 全体像
- **何を作るか**: 黒田さんのスタック（Vite + Handlebars + FLOCSS + clamp + デザイントークン + WCAG）に固有の、毎案件で使うフロント実用ツール群。第1弾=画像圧縮、以後 clamp / 配色 / FLOCSS スキャフォルダ / スクロール演出… と増やす。
- **どこに公開するか**: ポータル型。`kurodafolio.com/tools/`（トップ＝一覧）＋ 各ツール `/tools/{slug}/`。1ドメインに評価・回遊・被リンクを複利で集約。
- **どこで管理するか**: `projects/_self/frontend-tools/`（独立プロジェクト・独立gitリポ・パターンA公開成果物）。kurodafolio 本体は触らない（導線追加という最小変更を除く）。
- **目的**: ①黒田さん自身の作業効率化（ドッグフーディング）②集客＋営業の傍証（ツール流入→人物認知→案件相談のファネル）。

### 1-3. なぜこの plan を作るか
3体以上のエージェントを跨ぐ中〜大型タスク（Cody実装 / Reid評価 / Haru-Madoデザイン・導線 / Sara-SEO）で、フェーズ進行・合意事項・未決定事項・工数見積りを1箇所に統括し、コンテキストリセット／セッション中断からの復帰を可能にするため。壁打ちログ全文ではなく確定済み合意事項のみを正本化する（plan-file-protocol.md 準拠）。

---

## 2. 合意事項（黒田さん承認済み・正本）

### 2-1. 第1弾ツール: 画像仕分け圧縮くん（slug=`image-compress`）

| 項目 | 内容 |
|---|---|
| コンセプト | TinyPNG の不満「全部おまかせで圧縮率も方式も選べない」を、**画像の役割（種別）ごとに最適な圧縮方針を当てる**ツールに作り替える |
| 技術土俵 | **ブラウザ内 WASM 完結**（`@jsquash/webp` `@jsquash/avif` `@jsquash/oxipng` 等）。サーバー・DB不要。**画像を送信しない＝プライバシー訴求**（TinyPNGのアップロード型との差別化） |
| 種別プリセット（6種別案） | ①背景・装飾＝強圧縮 ②写真（重要）＝画質優先 ③写真（一般）＝中圧縮 ④イラスト・図版 ⑤アイコン・ロゴ（SVG推奨警告）⑥スクショ・UI（可逆優先）。各プリセットは「目標フォーマット／品質／リサイズ上限／設計意図」を持つ |
| 操作 | D&D → 全体一括の種別選択 ＋ 各画像で**個別に種別変更・手動オーバーライド可**（quality/フォーマット/リサイズ）。痛点の本質は「選べない」ことなので「選べる自由＋おまかせの両立」が設計の肝 |
| 出力 | Before/After 容量・削減率・劣化確認ルーペ・フォーマット別容量比較・一括ZIP DL |
| 詳細設計の出典 | `docs/_portal/mado-selfuse-dev-tools.md` §E-1（6種別プリセット表・WASMスタック・UX） |
| v1スコープ | **✅確定（U-01 / 2026-06-12）＝案②フル**（6種別＋AVIF＋SVG助言＋可逆/減色＋自動種別推測）。Mane推奨は案①ミニマル先行だったが、黒田さんが「どうせ作るなら完成形で出したい」と案②を選択。工数=実働2〜3週（M上振れ〜L入口）。詳細は§3 |

#### v1 仕様確定（モジュールB 要件定義・壁打ち / 2026-06-12）

`docs/image-compress/mado-image-tool-spec-proposal.md` をたたき台に黒田さんと壁打ちして確定。スコープ宣言（やる/やらない）＋機能要素の必須/任意/将来/不要分類を確定。DECISION LIST（D1〜D10）の確定結果:

| # | 論点 | 確定 |
|---|---|---|
| D1 | HEIC入力 | **v1非対応**（ブラウザデコード不可・バンドル増／「事前JPEG化を」案内で代替／将来は遅延import検討） |
| D2 | 自動種別推測 | **入れる＋ON/OFFトグル**（推測がうざい時に切れる）。推測は初期値・手動で直せる・根拠表示・精度は追わない・実装は最後に積む |
| D3 | EXIF/メタデータ削除 | **デフォルトON**（容量＋GPS等プライバシー）。Orientation正立焼き込みとセット必須 |
| D4 | AVIF出力 | **含む**（フル決定）。Web Worker＋逐次＋「重い」注記が連動必須 |
| D5 | ⑥スクショ種別（可逆PNG/oxipng） | **入れる**（④イラスト・⑤アイコンもフル採用） |
| D6 | 劣化確認UI | 並置=必須／ルーペ=任意／スライダー比較=将来 |
| D7 | 元形式維持（JPEG）出力 | **含む＝穏やかなJPEG最適化**（リサイズ＋メタ削除＋高品質~82で1回エンコード＝ほぼ無劣化）。native Canvas出力で低コスト／MozJPEG極限圧縮は将来オプション（フロント特化＝Web表示用なら不要）。`<picture>`フォールバック・WordPress手動アップ用途に直結 |
| D8 | 入力枚数/サイズ上限 | 一度に20〜30枚・〜25MB目安でガード（★数値は実機調整） |
| D9 | フォルダ一括/クリップボード | フォルダ一括=任意／クリップボード貼付=不要 |
| D10 | 出力ファイル名 | 元名維持＋拡張子のみ変換追従（連番は任意） |

スコープ外（やらない）= 画像編集・生成AI・アップロード保存・アカウント・アニメGIF/動画・URL逆引き。詳細仕様（種別⇄パラメータ確定表・UI設計）は F2 で `docs/image-compress/01_spec.md` に落とす。

### 2-2. 公開フォーマット
- **ツールポータル型を採用**。トップ `kurodafolio.com/tools/`（ツール一覧カード）＋ 各ツール `/tools/{slug}/`（個別最適ページ）。
- **1アプリ束ね型（案C）は不採用**（各ツールは別検索意図を持ち、束ねると検索カバレッジを自ら潰す）。
- 各ツールは別ページで個別最適しつつ、1ドメインに評価・回遊・被リンクを集約。第1弾は「ポータルの最初の1ツール」として公開（単独先行しない）。出典: `docs/_portal/mado-publish-format.md`。

### 2-3. URL構造
- **`kurodafolio.com/tools/`（本体サブディレクトリ・ポータル）で確定**。第1弾=`/tools/image-compress/`。
  > 注: 壁打ち初期は `tools.kurodafolio.com` サブドメイン案もあったが、**本体ドメインパワー完全継承を取り `kurodafolio.com/tools/` サブディレクトリに確定**（旧サブドメイン案は破棄）。詳細根拠＝`docs/_portal/mado-url-structure-detail.md`。
- **DB要のツール**: UIはポータル配下 `/tools/{slug}/` に残し、バックエンドのみ別オリジン（`api.kurodafolio.com` or Cloudflare Workers）へ逃がす。
- **スクロール演出ツール**: 旧 `motion.kurodafolio.com` サブドメイン案を破棄し、`/tools/motion/` に吸収。
- スラッグ＝URL資産。**確定後は動かさない**（301・被リンク毀損回避）。

### 2-4. ポートフォリオ側導線（works には混ぜない）

| # | 配置 | 中身 | 優先 |
|---|---|---|---|
| 1 | グローバルナビ | 「Tools」独立項目 → `/tools/`（works と並ぶ第3カテゴリ／全ページから張る最強の内部リンク） | **必須・最優先** |
| 2 | トップページ | 「公開ツール」**独立セクション**（実績の下にぶら下げず対等並列）＋最新Nカード＋一覧CTA | **必須** |
| 3 | フッター | サイトマップ的リンクに `/tools/` 追加（面の補強） | 推奨 |
| 4 | 各ツールページ | 本体（About/Works/Contact）への**逆方向営業導線**＋パンくず（Home>Tools>{ツール名}）。partial化で全ツール自動適用 | **必須** |
| 5 | works 一覧 | 外側に「ツールも公開しています →」小導線（**works に混ぜない**） | 推奨（小） |
| 6 | ブログ frontend-note | 関連記事↔ツールの相互送客（別ドメイン＝評価集約に数えず送客のみ） | 推奨（送客のみ） |

- **works 混在は不採用**（works=クライアントワークの証拠棚 / tools=自社プロダクトの destination。混ぜると営業文脈が濁る）。
- **フェーズ追従**: ナビ項目とURLは1個から立て、見せ方だけ進化（URL不変）。出典: `docs/_portal/mado-portfolio-link-design.md`。

### 2-5. ファイル配置（mane-file-structure.md 確定・承認済み / 2026-06-15 Cody 是正反映）

| 項目 | 内容 |
|---|---|
| 新設場所 | `projects/_self/frontend-tools/`（リポ名・フォルダ名＝**frontend-tools**。旧称 kuroda-tools から 2026-06-18 リネーム） |
| Git運用 | **パターンA**（独立gitリポ・**GitHub Public**・my-virtual-team除外）。`projects/_self/.gitignore` の `*` ルールで自動除外。例外指定は足さない |
| ビルド | **案イ＝独立 Vite プロジェクト**（`vite.config` の `base:"/tools/"`）→ `dist/` を XServer `public_html/tools/` へデプロイ。kurodafolio 本体ビルドとは完全分離。**基盤＝`projects/_shared/templates/static-template`**（SCSS・Vite・handlebars・FLOCSS・`_viewport.js`/`_drawer.js`/`script.js`・画像最適化プラグイン・lint/format 一式）を土台とする。**素CSSのアドホック構築はしない＝テンプレ基盤を保守性の土台にする**（2026-06-17 確定・下記★参照） |
| 構成 | `frontend-tools/PLAN.md` ／ `docs/{_portal/, {slug}/}`（軽量4点 = 00_overview / 01_spec / 02_qa / 03_seo）／ `dev/src/{slug}/`（1ツール=1サブフォルダ・**src直下にスラッグ名**） |
| 一覧データ | `dev/src/data/tools.json`（1ツール1エントリ。トップ・新着セクションが参照して自動生成） |
| 命名規則 | スラッグ＝URL・ソースフォルダ・docsフォルダで**完全一致**（小文字英字＋ハイフン・検索意図語・**確定後不変**） |
| kurodafolio | **触らない**（本体ナビ/トップ/フッターへの導線追加という最小変更を除く） |

> **★Cody 是正（2026-06-15）**: 当初 plan §2-5 の構成図はツールソースを `dev/src/tools/{slug}/` と表記していたが、これだと `dist/tools/{slug}/` → デプロイ後 `/tools/tools/{slug}/` と **`tools/` が二重**になる。Cody が実機検証の上 **`dev/src/{slug}/`（src 直下にスラッグ名・フラット）** ＋ `dist/` を `public_html/tools/` へ配置する構成に是正。`base:"/tools/"` は URL 解決のためだけに効かせ、ディレクトリの `tools/` は「デプロイ先フォルダ名」で表現する。詳細＝`docs/_portal/00_tech-verification.md` §1 / ③。

> **★テンプレ基盤フルリビルド（2026-06-17 確定）**: 方向A の共通枠本番CSS実装は当初「素CSSのアドホック構築」で作られたため、**FOUC（初回CSS未適用ちらつき）と `_viewport.js` 欠落（360px固定が効かない）** の根因が「正式テンプレート基盤から作られていない」ことにあると判明。黒田さん指示で **`projects/_shared/templates/static-template` を基盤に `dev/` をフルリビルド**（差分マージでなく、テンプレをベースに新規作成して確定仕様を当て直す方式）。Reid 再合格＝根因3点（FOUC・viewport・素CSS構築）解消／config 層はテンプレ原本とバイト一致＝ドリフトなし／確定13項目反映／lint・format green。
> - **CSS 読み込み＝`<head>` の `<link>`（クリティカルパス）** で行う（FOUC 対策）。SCSS は glob import。
> - **画像はトークン url() rebase 制約のため `src/public/images/` 配置**（fingerprint なし・許容済み）。
> - ★申し送り（軽微）: `_breakpoints.scss`（テンプレ配布層）に stylelint 整形の空白差分が1箇所。次回テンプレ配布更新時の追従に留意（メモリ `feedback_template_upgrade_flow` 関連）。

```
projects/_self/frontend-tools/      独立gitリポ・パターンA・GitHub Public
├── PLAN.md                         ツール群全体の plan（本ファイル＝旧 plans/kuroda-tools-setup.md の移管先）
├── README.md
├── docs/
│   ├── _portal/                    ポータル自体（トップ一覧・ナビ・positioning・マネタイズ・URL設計・技術検証）の設計
│   ├── image-compress/             第1弾の軽量4点（00_overview / 01_spec / 02_qa / 03_seo）
│   └── motion/                     温存ツール（スクロール演出ジェネレーター）の素材
└── dev/                            独立Viteプロジェクト
    ├── vite.config.js              base:"/tools/"
    └── src/
        ├── index.html              ポータルトップ（/tools/）
        ├── components/             共通partial（head/header/footer = 本体への逆導線・コピー運用＝独立所有）
        ├── data/tools.json         ツール一覧データ
        ├── assets/styles/portal.css
        └── {slug}/index.html       /tools/{slug}/（★src 直下にスラッグ名＝フラット。tools/ を挟まない）
```

### 2-6. 温存ツール: スクロール演出ジェネレーター
- 仕様は `docs/motion/mado-scroll-gen-spec.md` に完成済み。v1=3プリセット＋AIプロンプト出力。
- 看板＝スクロール特化（SEO・分かりやすさ最強）／内部設計＝カテゴリ追加で育つ汎用器／URL＝`/tools/motion/`（旧 motion. サブドメイン案を吸収）。**第1弾の後の有力候補**。

### 2-7. 今後の候補（第2・3弾）
clamp メーカー（slug=`clamp`）／ 配色＆コントラスト（`color-palette`）／ FLOCSS スキャフォルダ（`flocss-generator`）等。出典: `docs/_portal/mado-selfuse-dev-tools.md` D-1/A-5/D-2、候補カタログ＝`docs/_portal/mado-candidates.md`。優先順は U-04 で決定。

### 2-8. コレクション positioning（フロントエンド特化 / 2026-06-12 確定）

ツール集全体を「**フロントエンド制作者向けツール集**」として positioning する（黒田さんの壁打ち中の戦略的気づきを正式化）。正式版＝`docs/_portal/mado-collection-positioning.md`。

- **ステートメント**: フロント制作者が毎案件・毎日の実作業で使う道具を一箇所に揃えた destination。**主＝フロント制作者**（スコープを決める物差し）／**従＝学習者・ブロガー**（検索流入の間口）。
- **プロダクト整合の判断ヒューリスティック（全ツールに適用）**: 「**この機能はフロント/Web制作の用途に必要か?**」でYES/NO判定し、NO（一般用途では要るがフロント制作では本命でない）はスコープ外 or 将来オプションへ降格。例: 画像ツール＝Web表示用に絞るから MozJPEG極限圧縮は将来送りが正当化される（D7）。
- **重要バランス（看板は特化・中身は個別最適）**: 特化は文脈・コピー・回遊・destination で効かせる。各ツールページの検索リーチ（"画像圧縮 webp"等の広い意図）は縮めず素直に狙う。

### 2-9. マネタイズ方針（(d) 分離型ハイブリッド・シンプル版 / 2026-06-12 確定）

集金方法と配置を多角分析（`docs/_portal/mado-monetization-placement.md` ＋ `docs/_portal/mado-placement-c-vs-d.md`＝(c)WP集約 vs (d) を技術論抜きで公平比較）した上で、**(d) 分離型ハイブリッド（シンプル版）**で確定。技術論ではなく事業の本質（リード≫広告／若い営業の顔を育てる）で(d)を選択。

- **ツール本体（`kurodafolio.com/tools/`）= 完全に広告フリー**。役割＝**リード獲得（本命・1案件 数万〜数十万 ≫ 広告 月数千円）＋スキル証明＋若い kurodafolio ドメインの育成＋SEO destination**。広告動画・端AdSense・寄付リンクは**載せない**。
- **直接収益 = frontend-note の「使い方／作成の裏側」記事の既存AdSense枠**（fn-ad-postend / fn-ad-sidebar）＋文脈アフィリエイト（任意）。素のツールUIはthin contentで広告に不向き＝コンテンツリッチな記事が広告の本来の器。
- **接続 = 記事⇄ツールの相互送客リンクのみ**（別ドメイン）。frontend-note記事へのツール埋め込み/ミラーは**不採用**＝canonical運用の複雑さを避けシンプルに。
- 収益の現実認識: 広告は月数百〜数千円＝事業の柱にならない小遣い。本命はリード。ツールは「マネタイズ」より「**営業資産・スキル証明への投資**」と捉える。
- 既存確定（URL `kurodafolio.com/tools/`・独立Viteプロジェクト・フロント特化positioning）は**一切変更なし**。マネタイズは記事側に分離して足すだけ。

---

## 3. 第1弾「画像仕分け圧縮くん」工数見積り（v1スコープ2案）

> S=〜3日 / M=1〜2週 / L=2週超。山場＝複数WASMエンコーダ組込み・種別プリセット⇄パラメータのマッピング・Web Worker化（大量一括でブラウザが固まる懸念のケア）・劣化確認UI。

### 3-1. 2案の比較表

| 項目 | **案①ミニマル（主要3種別＋WebP）** | **案②フル（6種別＋AVIF）** |
|---|---|---|
| 種別プリセット | 3種別（背景=強圧縮 / 重要写真=画質優先 / 一般写真=中圧縮） | 6種別（＋イラスト図版 / アイコンロゴ / スクショUI） |
| 出力フォーマット | WebP のみ | WebP ＋ AVIF（フォーマット別容量比較も） |
| アイコンSVG助言 | 入れない | 入れる（「SVGにできませんか?」助言） |
| 可逆圧縮（PNG/oxipng・減色） | 入れない（WebP非可逆中心） | 入れる（スクショ=可逆 / イラスト=減色量子化） |
| 自動種別推測 | 入れない（手動割当のみ） | 入れる（解像度・透過・色数からデフォルト割当を推測。ユーザー修正可） |
| 手動オーバーライド | あり（quality/リサイズ） | あり（全パラメータ） |
| Before/After・劣化ルーペ・ZIP | あり | あり |
| WASMエンコーダ数 | 1（webp） | 3〜4（webp / avif / oxipng / imagequant） |
| Web Worker化 | 推奨（WebPでも大量時に必要） | **必須**（AVIFは重い） |
| **工数感** | **M下振れ〜S上振れ（実働 4〜7日目安）** | **M上振れ〜L入口（実働 2〜3週目安）** |
| 工数根拠 | WASMエンコーダ1本＋プリセット3種のマッピング＋基本UI。AVIF/減色/推測ロジックの作り込みが無い分、検証も軽い | エンコーダ3〜4本の組込み＋6種別マッピング＋AVIFの速度/品質チューニング＋自動推測ヒューリスティック＋減色量子化＋Web Worker逐次処理が積み上がる |

### 3-2. 何が入り何が落ちるか
- **案①で落ちるもの**: AVIF出力 / アイコン・ロゴ・スクショ・イラストの専用最適化（可逆・減色・SVG助言）/ 自動種別推測。→ ただし**黒田さん本人の主痛点（背景は強圧縮・顔写真は画質優先・一般写真は中圧縮）は3種別で完全にカバーされる**。
- **案②で乗るもの**: 上記すべて。種別の網羅性と次世代フォーマット（AVIF）対応で「公開時の刺さり」が最大化。ただしAVIFのブラウザ固まり対策・自動推測の精度調整という不確実性が工数を押し上げる。

### 3-3. Mane推奨（参考） → 黒田さんは案②フルを選択
Mane 推奨は「案①ミニマルで v1 を出し、案②を段階追加」（痛点解消は案①で達成済み／早期リリースでフィードバック／ポータル第1枚目を早く立てる複利／WASM1本で技術検証を先に通す）だったが、

> ✅ 決定（U-01 / 2026-06-12）: 黒田さんは **案②フル（完成形）を選択**（「どうせ作るなら最初から完成形で出したい」）。v1から 6種別＋AVIF＋SVG助言＋可逆/減色＋自動種別推測 を実装する。工数=実働2〜3週（M上振れ〜L入口）。**AVIFのブラウザ固まり対策（Web Worker逐次処理必須）・自動種別推測の精度調整が F3 実装の重点リスク**。

---

## 4. 未決定事項

| ID | 項目 | 内容 | 決定タイミング | 決定者 |
|---|---|---|---|---|
| ~~U-01~~ | 第1弾v1スコープ | **✅決定（2026-06-12）＝案②フル**（6種別＋AVIF＋SVG助言＋可逆/減色＋自動種別推測）。Mane推奨の案①ミニマルではなく完成形を選択 | ~~フェーズ2前~~ **決定済み** | 黒田さん |
| ~~U-02~~ | ★Cody検証3点 | **✅決定済み（検証結果記録 / 2026-06-15）**。①`base:"/tools/"` パス解決＝問題なし（実機確認）②XServer .htaccess/fallback 干渉＝想定干渉5件＋対処方針を文書化（実デプロイ F6 で最終確認）③共通partial同期＝**コピー運用（独立所有）推奨**。詳細＝`docs/_portal/00_tech-verification.md` | ~~フェーズ1~~ **記録済み** | Cody（技術検証） |
| ~~U-03~~ | ★Haru/Mado ナビ方針 | **✅決定済み（2026-06-17）**＝**ナビ案B**（「ツール一覧」＋ダークトグル＋お問い合わせCTA・**カテゴリは出さない**）。ナビ↔ハンバーガー切替＝**768px**。ハンバーガー＝ポートフォリオ FAB型と同一／トグル＝ポートフォリオ `c-color-toggle` と同一。詳細正本＝`docs/_portal/design/design-concept.md` | ~~フェーズ5前~~ **決定済み** | Haru/Mado（黒田さん確定） |
| U-04 | 今後ツールの優先順 | clamp / color-palette / flocss-generator / motion の着手順 | 第1弾公開後 | 黒田さん＋Mado |
| ~~U-05~~ | i18n（日英切替） | **✅決定済み（2026-06-17）＝採用しない**。理由＝本命は国内リード・海外流入が事業価値に繋がらない／若いドメインで英語SEOは消耗戦／1人運営で継続コスト過大。**代替＝「言語不問UI（アイコン＋数値主導）＋将来プリセット英語併記」を F2/F3 で検討**。Mado 推奨を採用 | ~~F2 着手前~~ **決定済み** | 黒田さん（Mado推奨採用） |
| U-06 | i18n 復帰の発火条件 | U-05 で見送った日英切替を再検討する条件（保留）＝①海外からの実需アクセス/問い合わせが顕在化②ドメインパワーが育ち英語SEOが消耗戦でなくなった③運用が複数人体制になった、のいずれか。発火時は F2/F3 代替（言語不問UI＋プリセット英語併記）の延長で再評価 | 発火条件成立時 | 黒田さん＋Mado |
| ~~U-07~~ | 共通部品 共有 vs 独立 | **✅決定済み（2026-06-17）＝A. 独立継続（コピー運用）**。U-02③（partialコピー運用推奨）を支持・拡張。frontend-tools=公開リポ(パターンA)×kurodafolio本体=非公開リポ(パターンB)の境界・SCSS差・別デプロイ・本体触らない原則と衝突するため本格共有(submodule/monorepo)は非推奨。トークンのみ将来パッケージ化(B)は保険。分析正本＝`docs/_portal/02_architecture-shared-vs-standalone.md` | ~~アーキ検討時~~ **決定済み** | 黒田さん（Mado/Cody分析） |

---

## 5. フェーズ構成

| フェーズ | 目的 | 主担当 | 成果物 |
|---|---|---|---|
| **F1 プロジェクト初期化** | `frontend-tools/` 新設・git init（GitHub Public）・独立Viteセットアップ（`base:"/tools/"`）・ポータル骨格（トップ index + tools.json + 共通partial）・★Cody検証3点（U-02）の確認。`tmp/tool-ideation/` の素材を `docs/` へ移管（§10）。本 plan を `PLAN.md` へ移管 | Cody（実装）／Mane（フォルダ・docs整備） | 初期リポジトリ／ビルド通過確認／検証結果メモ／移管済みdocs |
| **Fd ポータル/ツール デザイン設計**（F1 と F2 の間に挿入 / 2026-06-16） | F1 後、黒田さんが画面を見て「デザインを大きく修正したい」と判断したため挿入。ポータルトップ＋ツール個別ページの世界観を本体 kurodafolio（b-tech-cool）と統一し、デザインコンセプト・デザイントークン・概念モックを確定。導線・ファネル（認知→信頼→行動）をビジュアル化。**詳細仕様は `docs/_portal/design/design-concept.md` が正本**（PLAN には重複コピーせずポインタで参照）。**Fd設計を受けた共通枠の本番CSS実装＝方向A**（下記）として Cody が `dev/src/` に実装し Reid評価ゲート通過済み | Haru（コンセプト・tokens・概念モック）→ Mado（評価ゲート） | `docs/_portal/design/`（design-concept.md＝決定正本 / concept-mock.html / tokens.css）＋ 評価レポート `docs/_portal/design/02_mado-design-review.md`。導線設計の拠り所＝`docs/_portal/01_navigation-funnel-design.md` |
| **方向A Fd 本番CSS実装（共通枠）→ テンプレ基盤フルリビルド**（Fd→F2 の間 / 2026-06-17 完了） | Fd デザイン設計（concept-mock.html・tokens.css）を基に、ポータルトップ＋ツール個別ページの**共通枠**（header / ロゴ / ナビ / ダークトグル / 制作者カード / CTA / フッター / パンくず）の本番CSSを `dev/src/` に実装し Reid 評価ゲート通過。その後 **FOUC・`_viewport.js`欠落の根因＝素CSSアドホック構築** と判明し、黒田さん指示で **`projects/_shared/templates/static-template` を基盤に `dev/` をフルリビルド**（§2-5 ★参照）。デザイン確定＝ナビ案B・768px境界・カテゴリ非表示（design-concept.md 正本）。image-compress 固有UIは F3 で別途 | Cody（実装・リビルド）→ Reid（評価ゲート・必須） | static-template 基盤の `dev/`（SCSS/Vite/handlebars/FLOCSS/`_viewport.js`/`_drawer.js`）・共通partial・`data/tools.json`・`vite.config.js`（`base:"/tools/"`）。Reid＝初回条件付き合格→修正で違反残存0件／リビルド後 Reid 再合格（根因3点解消・config層バイト一致・確定13項目反映・lint/format green） |
| **F2 第1弾 設計**（次の未着手フェーズ＝**着手可**） | U-01確定後、画像仕分け圧縮くんの `docs/image-compress/`（overview/spec/qa/seo）作成。種別プリセット⇄パラメータ仕様・UI設計・WASM選定の確定。**i18n代替＝言語不問UI（アイコン＋数値主導）＋将来プリセット英語併記**（U-05/U-06）をUX設計に織り込む。OGP画像の絶対URL化はSEO観点で確認（Sara・F2以降） | Mado（要件・UX）／Mane（スコープ・工数管理）／Sara（03_seo: meta/OG/構造化） | `docs/image-compress/` 4点 |
| **F3 第1弾 実装** | 仕様に沿って `dev/src/image-compress/` を実装（WASMエンコーダ組込み・種別マッピング・Web Worker化・劣化確認UI・ZIP出力） | Cody（実装） | 動作するツール本体 |
| **F4 第1弾 QA・評価** | Reid によるコードレビュー（規範準拠・A11y・レスポンシブ・パフォーマンス）。02_qa チェックリスト消化（ブラウザ対応・大量画像時の固まり確認） | Reid（評価）／Cody（修正） | QA合格・修正反映 |
| **F5 本体側導線追加** | kurodafolio 本体にナビ「Tools」項目・トップ「公開ツール」セクション・フッターリンクを追加（最小変更）。各ツールページの逆方向営業導線・パンくず partial 設計（U-03確定後） | Haru/Mado（導線・デザイン）／Cody（本体実装） | 本体導線反映 |
| **F6 デプロイ・公開** | ツール `dist/` を XServer `public_html/tools/` へデプロイ。本体導線も反映。公開後の動作確認（実機・パス解決・干渉） | Cody（デプロイ）／Mane（公開チェック） | 公開完了 |

> 各フェーズは新規起動でコンテキストリセット（中間成果物＝docs/ ファイルを次フェーズが読む）。F2→F3、F3→F4 は context-reset.md 準拠で別コンテキスト。

---

## 6. エージェント起動計画

| フェーズ | エージェント | 役割 | 起動方式 |
|---|---|---|---|
| F1 | Cody | Vite初期化・`base:"/tools/"`・★検証3点（U-02） | 新規 |
| F1 | Mane | フォルダ構成・docs雛形・素材移管・plan移管 | 新規 or fork |
| F2 | Mado | 第1弾 要件・UX・種別プリセット仕様 | 新規 |
| F2 | Sara | 03_seo（meta/OG/タイトル/構造化・本体逆導線のSEO観点） | 新規 |
| F3 | Cody | 実装（WASM・Web Worker・UI） | 新規（F2成果物を読む） |
| F4 | Reid | コード評価（規範/A11y/レスポンシブ/パフォーマンス）＝**生成に関与しないクリーンコンテキスト** | 新規（必須） |
| F4 | Cody | 評価反映の修正 | 新規（F4とは別コンテキスト） |
| F5 | Haru → Mado | ツール用ナビ/フッター方針（U-03）→ Mado が戦略整合を評価 | 新規 |
| F5 | Cody | 本体導線の実装（最小変更） | 新規 |
| F6 | Cody | デプロイ | 新規 |

評価ゲート: コード（Cody生成）→ **Reid評価**（evaluation-gate.md 必須）。導線・デザイン（Haru生成）→ **Mado評価**。SEO・対外公開メタ（Sara）→ 公開コンテンツのため自己検証＋代表確認。

---

## 7. 検証基準（フェーズ完了基準・評価ゲート）

| フェーズ | 完了基準（Definition of Done） | 評価ゲート |
|---|---|---|
| F1 | `frontend-tools/` がローカル初期化済み（git init 済・GitHub Public リポ作成/push は後日）／`yarn dev` でポータルトップが起動／`base:"/tools/"` ビルドでパス解決OK／XServer干渉は対処方針文書化（実デプロイは F6）／docs雛形＋素材移管完了／plan移管完了 | ★Cody検証3点（U-02）が「問題なし」または「対処方針あり」で確定＝**達成（docs/_portal/00_tech-verification.md 記録）** |
| Fd | デザインコンセプト・tokens.css・概念モックが揃い、本体 kurodafolio と世界観統一／導線・ファネル（認知→信頼→行動）がビジュアル化／ナビ案B・制作者カード・CTA・フッター3カラム等が確定（`docs/_portal/design/design-concept.md`） | **Mado評価通過**（戦略/ターゲット/情報設計/世界観統一/品質/抜け漏れの6観点）＝**条件付き合格**（Haru差し戻し不要・残はCody実装時対応／`docs/_portal/design/02_mado-design-review.md`） |
| 方向A（Fd本番CSS実装→テンプレ基盤リビルド） | 共通枠（header/ロゴ/ナビ/ダークトグル/制作者カード/CTA/フッター/パンくず）の本番実装／`yarn build`・`yarn dev` 通過／**root cause（FOUC・`_viewport.js`欠落・素CSS構築）解消**／static-template 基盤で再構築・config 層はテンプレ原本とバイト一致（ドリフトなし）／確定13項目反映／lint・format green | **Reid評価（必須）通過**＝初回条件付き合格→修正で Must M-1（論理プロパティ8箇所）・Should S-1（インラインstyle）解消・違反残存0件→**リビルド後 Reid 再合格**（根因3点解消確認） |
| F2 | overview/spec/qa/seo の4点が揃い、種別プリセット⇄パラメータ仕様が確定／v1スコープ（U-01）が黒田さん承認済み | Mane が工数・実現可能性を整合確認 |
| F3 | 仕様どおりツールが動作（種別選択・オーバーライド・Before/After・ルーペ・ZIP） | — |
| F4 | Reid レビュー合格（規範・A11y・レスポンシブ・パフォーマンス）／02_qa チェックリスト消化／大量画像で固まらない | **Reid評価（必須）** |
| F5 | 本体ナビ/トップ/フッター導線追加・各ツールページ逆導線/パンくず partial 反映／本体ビルド通過 | **Mado評価**（戦略・情報設計整合） |
| F6 | XServer `/tools/` で公開・実機動作確認・本体`/`との干渉なし | Mane が公開チェック＋代表確認 |

---

## 8. 進捗状態

| フェーズ | 状態 | 備考 |
|---|---|---|
| F1 プロジェクト初期化 | ✅ 完了 | ローカルまで完了（git init 済）。**GitHub Public リポ作成・push は後日**。技術検証3点は `docs/_portal/00_tech-verification.md` に記録＝①パス解決問題なし②.htaccess干渉は方針文書化（F6で最終確認）③partialはコピー運用推奨。docs雛形＋素材移管＋plan移管 完了（2026-06-15 Mane）。`src/{slug}/` フラット是正反映済み |
| Fd ポータル/ツール デザイン設計 | ✅ 完了 | **Mado条件付き合格**（2026-06-16・Haru差し戻し不要）。Haru→Mado評価で世界観統一・導線ファネル確定。成果物＝`docs/_portal/design/`（design-concept.md＝決定正本 / concept-mock.html / tokens.css）＋評価レポート `02_mado-design-review.md`。**残はCody本番CSS実装（＝方向A）で対応済み**。本番CSSは Haru 成果物ではなく Cody が `dev/src/` に実装。★黒田さん判断1点＝パンくず transition は (B) `--transition-base` 200ms 統一で確定済み |
| 方向A Fd 本番CSS実装（共通枠）→ テンプレ基盤フルリビルド | ✅ 完了 | **Reid評価ゲート通過（初回）＋ リビルド後 Reid 再合格**（2026-06-17）。対象＝ポータルトップ＋ツール個別ページの共通枠（header / ロゴ / ナビ / ダークトグル / 制作者カード / CTA / フッター / パンくず）。image-compress 固有UIは F3 で別途。**経緯**: ①Cody が共通枠の本番CSSを `dev/src/` に実装→Reid条件付き合格→修正で Must M-1（論理プロパティ8箇所）・Should S-1（インラインstyle）解消・違反残存0件＝合格相当。②その後 **FOUC（初回CSS未適用ちらつき）と `_viewport.js` 欠落（360px固定が効かない）の根因＝素CSSアドホック構築** と判明。黒田さん指示で **`projects/_shared/templates/static-template` を基盤に `dev/` をフルリビルド**（差分マージでなくテンプレベースで新規作成し確定仕様を当て直す方式）。**Reid 再合格**＝根因3点解消・config 層はテンプレ原本とバイト一致（ドリフトなし）・確定13項目反映・lint/format green。**デザイン確定（黒田さん）**＝ナビ案B（「ツール一覧」＋トグル＋お問い合わせCTA・カテゴリ非表示）・ナビ↔ハンバーガー切替768px・トグル/ハンバーガーはポートフォリオと同一・CTA折返しなし・制作者カードは本文幅・フッターG1「このツール集について」＞「ツール一覧」/G2「制作・運営」。**詳細正本＝`docs/_portal/design/design-concept.md`**（PLANはポインタ参照）。CSSは `<head>` の `<link>`（クリティカルパス・FOUC対策）／画像は `src/public/images/` 配置。詳細は §2-5 ★・§8-Fd 申し送り表参照 |
| F2 第1弾 設計 | ✅ 完了 | **Mane評価ゲート＝条件付き合格（2026-06-17）→Must/Should反映済み**。Mado が `docs/image-compress/` の4点（00_overview/01_spec/02_qa）を本格執筆、Sara が 03_seo を執筆。01_spec＝6種別⇄パラメータ確定表（①背景WebP q55 ②重要写真WebP q85 ③一般写真WebP q72 ④イラストWebP q80/PNG減色 ⑤アイコンPNG可逆+SVG助言 ⑥スクショPNG可逆）・D1〜D10実装反映・WASM選定（@jsquash webp/avif/oxipng+imagequant）・自動推測・i18n代替=言語不問UI を確定。Mane指摘 Must M-1（Worker内WASMパス解決を実装初期最優先確認）＋Should S-1/S-2/S-3 を 01_spec に反映済み（評価レポート＝`docs/image-compress/_f2-mane-review.md`）。Sara SEO＝プライマリ「画像圧縮 webp オンライン」/タイトルタグ個別最適/OGP画像**絶対URL化必須**/構造化データ WebApplication+BreadcrumbList。**★代表確認5点すべて解決済み（2026-06-17）**＝①②写真(重要)は自動推測除外＋手動導線で担保（承認）②実機調整値は初期値でF3着手→実画像調整（既定）③twitter:creator=`@kurodalog`④JSON-LD author=本体jsonld-person整合「黒田こうすけ」/alternateName「Kuroda Kosuke」/sameAs⑤逆導線CTAコピー=**案A（作り手の顔・実績先行型／見出し「このツールを作った人について」＋ボタン[制作実績を見る][制作のご相談をする]）採用**（03_seo §6-2） |
| F3 第1弾 実装 | ✅ 完了（2026-06-18） | Stage1〜4を段階実装（各Stage Reid評価ゲート通過）。WebP（SIMD/非SIMD分岐）/AVIF（単一スレッド直接instantiate・固まり対策Web Worker逐次・Safari降格S-3）/PNG可逆oxipng（単一スレッド）/④減色（純JSメディアンカット→oxipng・imagequant非採用＝npm非存在）/keep-JPEG（Worker化）。Worker内WASMパス解決（Mane Must M-1）クリア。種別ラジオ＋複数フォーマット出力（②③=AVIF+WebP+JPEG）・自動推測（②除外）・個別削除・自動判定スイッチUI。実装ノート＝`docs/image-compress/_f3-stage{1,2,3,4}-cody-note.md` |
| F4 第1弾 QA・評価 | ✅ 完了（2026-06-18・コードレベル） | Reid最終評価ゲート＝条件付き合格→Must M-2（wasm-feature-detect明示）/S-1（準備中デッドコード除去）/S-3（worker再生成）反映。後発UI変更（スイッチUI・タイトル・区切り線・並べ替え）も再チェック合格。評価レポート＝`docs/image-compress/_f4-reid-final-review.md`/`_f4b-reid-recheck.md`。**実機QA残（黒田さん）**＝30枚AVIF固まり実測・Safari降格・実画像で品質/④減色256調整・EXIF正立・リッチリザルトテスト |
| F5 本体側導線追加 | ✅ ①②③実装完了（F6前・評価ゲート全通過） | **設計方針＝Haru作成→Mado評価ゲート条件付き合格→Must3/Should4/Nice2反映済み**（正本`docs/_portal/03_main-site-tools-routing-design.md`／評価`_f5-mado-routing-review.md`）。**黒田さん★確定（2026-06-18）**＝ラベル日本語「ツール」／②背景交互は案B完全交互／フッター単一行のまま。**①③＝Cody実装完了**（本体`kurodafolio/06_implementation/dev/` src 3ファイル各1行追加）→**Reid評価ゲート条件付き合格（Must0）**→**push済**（kurodafolio `ee459ad..bd4ddf7`）。**②＝Cody実装完了（2026-06-18）**＝`index.html` works直後に独立`<section id="tools">`新設（`c-section__head`＋`c-work-card`×1[image-compress]＋`c-link-arrow`「ツール一覧を見る →」`/tools/`）・背景交互案B完全交互（works(alt)→tools(base)→about(alt)→services(base)・付替はclass名のみ構造不変）・h2兄弟チェーン維持。**リード文確定（黒田さん）**＝「フロント制作の実作業で使う自作ツールを公開しています。」（Sara3案→案1推敲）。**サムネ**＝image-compress OGPを`src/assets/images/tools-image-compress.{jpg,webp}`へ別配置（本体OGP`public/images/ogp.jpg`は不変・works規約準拠）。新規SCSSなし。**Mado（戦略・情報設計）＝合格Must0／Reid（規範・A11y・実装）＝合格Must0**（`_f5-2-mado-review.md`／`_f5-2-reid-review.md`／実装ノート`_f5-2-cody-note.md`）。弁別バッジ＝N=1前提で非採用（両者同意）。**残**＝黒田さん実機目視（footer/nav窮屈時のみgap微調整・②カードサムネ比率1200×630の見栄え）＋②分のcommit/push（本体dev/ローカル未commit・Reid Should1=build由来Prettier整形が`ogp-template/ogp.html`に純整形差分）。F6デプロイ前 |
| OGP制作（公開準備） | ✅ 完了（2026-06-18） | **image-compress／ポータルトップ／本体の3枚を JPEG q90・1200×630 で統一**。Haru方針（案A→本体フォーマット流用・青粒子背景・全面黒幕・pillスカイブルー#6cc6ff・テキスト本体踏襲位置）→Cody実装→**Reid評価ゲート合格（Must0）**。**重要是正**＝ポータルトップOGPが「static-templateサンプル画像のまま・相対パス・1024×1024」だった見落としを解消（絶対URL化・1200×630）。再利用OGPテンプレ＝`docs/_portal/design/ogp-template/`（`data-*`差替で後続ツール量産可）。本体OGPはテキスト上寄せ＋ぼやけ修正（内容不変）。★Reid Should＝meta.json の ogImage二重定義は次ツール追加時に single source 化検討（任意）。配置＝`dev/src/public/{image-compress/,images/}ogp.jpg`・公開URL is `kurodafolio.com/tools/.../ogp.jpg`・`meta.json`絶対URL確定 |
| F6 デプロイ・公開 | ⬜ 未着手 | XServer .htaccess の F6 必須チェック3項目＝`docs/_portal/00_tech-verification.md` §② |

> フェーズ完了ごとに本テーブルを更新する。

---

## 8-Fd. Fd デザイン設計の確定と Cody 本番CSS実装への申し送り（2026-06-16 Mane 反映）

Fd で確定したデザイン仕様の**詳細は `docs/_portal/design/design-concept.md` が正本**（世界観・ロゴ・ナビ案B・制作者カード・CTA・リンク/カード挙動・フッター3カラム＋レスポンシブ・ラベル文脈使い分け 等）。Mado 評価レポート＝`docs/_portal/design/02_mado-design-review.md`。導線・ファネル・フッター設計の拠り所＝`docs/_portal/01_navigation-funnel-design.md`。**本 PLAN には重複コピーせずポインタで参照する**（正本一元化）。

### Fd 関連ファイル インデックス

| ファイル | 役割 |
|---|---|
| `docs/_portal/design/design-concept.md` | **デザイン決定の正本**（Haru / 本体抽出・実値・全確定仕様）。本番CSS実装の参照元 |
| `docs/_portal/design/concept-mock.html` | 概念モック（2画面・ライト/ダーク・3BP）。本番HTML/CSSの方向提示用 |
| `docs/_portal/design/tokens.css` | デザイントークン（本体トークン1:1継承・出典パス＋行番号付き） |
| `docs/_portal/design/02_mado-design-review.md` | Mado 評価レポート（条件付き合格・指摘1〜5） |
| `docs/_portal/01_navigation-funnel-design.md` | 導線・ファネル・フッター2グループ設計（評価の拠り所） |

### Cody 本番CSS実装への申し送り（Mado条件付き合格の残＝方向Aで決着 / 2026-06-17 更新）

> 本番CSSは `docs/_portal/design/`（concept-mock.html・tokens.css）を基に **Cody が `dev/src/` に実装済み**（＝方向A 完了・Reid評価ゲート通過）。Haru 成果物（モック/tokens）は本番CSSではない。詳細は上記 design-concept.md / 02_mado-design-review.md を参照。下表のうち **1/2/4=対応済みクローズ・3のみ★未決（黒田さん実機目視確認待ち）**。

| # | 申し送り | 決着状態 | 内容 | 出典 |
|---|---|---|---|---|
| 1 | パンくず transition | ✅ 対応済み・クローズ | ★黒田さん最終判断＝**(B) Tools内統一で確定**（`transition: color var(--transition-base)` 200ms ease-out）。Cody 実装済み | design-concept.md §7-3 / 02_mado-design-review.md 指摘2 |
| 2 | カテゴリページ URL構造の確定 | ✅ 対応済み・クローズ | **`/tools/category/image/` で確定**（slug=image・`tools.json` categorySlug と整合・ヘッダー「カテゴリ」/フッターG1「画像」を同URLに統一）。category ページ自体の実装は後フェーズ | design-concept.md §8-4 / 02_mado-design-review.md 指摘4 |
| 3 | フッター 768–1023px 実測 | ★ **未決（黒田さん実機目視確認待ち）** | 現状は3列押し込み（ロゴ｜ナビnowrap｜SNS縦並び）で実装済み。窮屈なら2カラム案（左[ロゴ+ナビ]／右[SNS]）へフォールバックする判断を残す。実機目視で最終確定 | 02_mado-design-review.md 指摘1（Madoの品質指摘） |
| 4 | 本番CSSの実装元 | ✅ 対応済み・クローズ | `docs/_portal/design/`（concept-mock.html・tokens.css）を基に Cody が `dev/src/` に実装（トレース明記済み）。Haru 成果物は本番CSSではない | design-concept.md / 02_mado-design-review.md |

> 補足（評価レポート由来・★要確認）: CTAコピー（指摘5「制作のご依頼・ご相談も承っています」＋リード）は対外公開コピーのため、未確定なら Sara→黒田さんの順でレビューを通す（既に黒田さん確定済みなら省略可）。

---

## 8-2. 横断方針の確定記録（2026-06-17）

方向A 再構築フェーズで黒田さんが確定した横断的方針。**詳細はそれぞれの正本ドキュメントを参照**（PLAN は決定の所在と結論のみを保持し二重管理しない）。

| 論点 | 確定 | 正本（参照先） |
|---|---|---|
| ビルド基盤 | **static-template（SCSS/Vite/handlebars/FLOCSS/`_viewport.js`/`_drawer.js`/画像最適化/lint・format）基盤の独立Viteプロジェクト**。素CSSアドホック構築はしない | §2-5（本PLAN） |
| ナビ | **案B**＝「ツール一覧」＋ダークトグル＋お問い合わせCTA。**カテゴリは出さない**（複数カテゴリ化まで保留。将来 `/tools/category/` 親＋`/tools/category/image/` 子。`toolsCategoryImage` 変数＋復帰コメント温存） | `docs/_portal/design/design-concept.md` |
| BP境界 | **ナビ↔ハンバーガー＝768px**（ロゴ/ボタンのサイズ境界も768px）。ハンバーガー＝ポートフォリオ FAB型／トグル＝ポートフォリオ `c-color-toggle` と同一 | `docs/_portal/design/design-concept.md` |
| i18n（日英切替） | **採用しない**（Mado推奨採用）。理由＝国内リードが本命・海外流入は事業価値に繋がらない／若いドメインで英語SEOは消耗戦／1人運営で継続コスト過大。代替＝言語不問UI＋将来プリセット英語併記（F2/F3 検討）。復帰の発火条件は U-06 | U-05/U-06（§4） |
| 共通部品アーキ | **A. 独立継続（コピー運用）**。本格共有（submodule/monorepo）は公開×非公開リポ境界・SCSS差・別デプロイ・本体不可触原則と衝突するため非推奨。トークンのみ将来パッケージ化(B)は保険 | `docs/_portal/02_architecture-shared-vs-standalone.md` |

> ★要確認（軽微・申し送り）: ①`_breakpoints.scss`（テンプレ配布層）に stylelint 整形の空白差分1箇所＝次回テンプレ配布更新時に追従（メモリ `feedback_template_upgrade_flow`）。②OGP画像の絶対URL化は F2 以降に Sara が SEO 観点で確認。

---

## 9. 関連メモリ

| メモリファイル | 関係 | 更新要否 |
|---|---|---|
| `project_workspace_structure.md` | パターンA公開成果物に `frontend-tools/`（旧称 kuroda-tools）を新規追加（配置・ビルド分離・本体最小変更）。`projects/CLAUDE.md` のパターンA例示にも追記済み | 反映済み（チーフ） |
| `project_portfolio_and_tools_plan_static.md` | J申し送りでツールに言及。ツール配置・公開フォーマット確定を反映 | **要更新**（チーフ） |
| `feedback_past_policy_mechanical_application.md` | kurodafolio（パターンB案件構造）の方針を機械的にツール群へ適用しない判断の実例。ツール群=パターンA で別管理にした根拠 | 参照（実例として有効） |
| `project_local_dev_server_setup.md` | Vite系案件は `yarn dev` 単独運用。frontend-tools も同方針 | 参照 |
| `feedback_template_upgrade_flow.md` | frontend-tools `dev/` を static-template 基盤フルリビルドで再構築（2026-06-17）。`_breakpoints.scss` の stylelint 空白差分1箇所は次回テンプレ配布更新時に追従。素CSSアドホック構築をやめテンプレ基盤を保守性の土台にする方針 | **要更新検討**（チーフ・基盤リビルド事実の追記要否を判断） |
| `project_workspace_structure.md`（再掲） | アーキ判断A（独立継続・コピー運用 / 2026-06-17）＝frontend-tools(パターンA公開リポ)×kurodafolio本体(パターンB非公開)の境界を理由に本格共有は非推奨。既存パターン区分と整合（新規追記は基本不要・必要なら一文） | 参照（整合確認済み・追記は任意） |

---

## 10. ソース資料の扱い（移管完了 / 2026-06-15 Mane）

`tmp/tool-ideation/` 配下の各分析ファイルを `docs/` 配下へ**移管（コピー・原本残置）**した。移管時、旧 `tools.kurodafolio.com` / `{tool}.kurodafolio.com` / `motion.kurodafolio.com` サブドメイン記述を確定方針 `kurodafolio.com/tools/`（サブディレクトリ）へ読み替える注記を各ファイル冒頭（H1直下）に付与済み。

| ソースファイル | 移管先 | 状態 |
|---|---|---|
| `mado-selfuse-dev-tools.md` | `docs/_portal/`（今後候補ロードマップ・第1弾元素材） | ✅移管・注記付与 |
| `mado-publish-format.md` | `docs/_portal/`（ポータル設計） | ✅移管・注記付与 |
| `mado-portfolio-link-design.md` | `docs/_portal/`（本体導線設計） | ✅移管・注記付与 |
| `mane-file-structure.md` | `docs/_portal/`（配置設計の確定根拠） | ✅移管・注記付与 |
| `mado-scope-decision.md` ＋ `mado-scroll-gen-spec.md` | `docs/motion/`（温存ツール） | ✅移管・注記付与 |
| `mado-image-tool-spec-proposal.md` | `docs/image-compress/`（要件定義 D1〜D10 元素材） | ✅移管・注記付与 |
| `mado-collection-positioning.md` | `docs/_portal/`（コレクション positioning） | ✅移管・注記付与 |
| `mado-monetization-placement.md` ＋ `mado-placement-c-vs-d.md` | `docs/_portal/`（マネタイズ方針） | ✅移管・注記付与 |

### 移管表に無い3点の扱い（Mane 判断 / 2026-06-15）
| ファイル | 判断 | 理由 |
|---|---|---|
| `mado-candidates.md` | **`docs/_portal/` へ移管**（参考素材） | 公開ツール推奨カタログ。第2・3弾の候補ロードマップ（§2-7・U-04）の一次資料として価値が高い |
| `mado-url-structure-detail.md` | **`docs/_portal/` へ移管**（参考素材） | サブドメイン vs サブディレクトリの精密判断。`/tools/` 確定（§2-3）の詳細根拠＝後から「なぜサブドメインにしなかったか」を辿る資料 |
| `mado-pokemon-sleep-tools.md` | **tmp 残置（移管しない）** | ポケモンスリープ連動＝キャリア外・種まきの side ブレスト。フロント特化 positioning（§2-8）のスコープ外で、frontend-tools の確定ロードマップに含まれない。将来キャリア外ツールに着手するときに tmp から拾えばよい |

> 原本（`tmp/tool-ideation/`）は全件残置（移管＝コピー）。`docs/_portal/00_tech-verification.md`（Cody）は移管対象外の正本＝触らない。

---

## 検証済み

- **検証済み: PLAN.md 移管完了** — 旧正本 `plans/kuroda-tools-setup.md` の全内容を本 PLAN.md へ移管。§2-5 に Cody 是正（`src/{slug}/` フラット）を構成図・記述・補足注記で反映。§8 F1 を✅完了に更新（ローカルまで完了・GitHub後日・検証3点記録・移管完了）。U-02 を決定済み（検証結果記録）に更新。§10 を移管完了状態に更新。
- **検証済み: slug 完全一致** — `image-compress`（URL `/tools/image-compress/`・ソース `dev/src/image-compress/`・docs `docs/image-compress/`）が plan §2-5 命名規則と整合。
- **検証済み: 素材移管8系統＋表外2点の docs 配置・旧サブドメイン読み替え注記付与・原本残置** — §10 のとおり。`docs/_portal/00_tech-verification.md` は未改変。
- **検証済み: 方向A（Fd本番CSS実装・共通枠）完了反映** — §先頭ステータス／§5 フェーズ表（方向A行追加）／§7 検証基準（方向A行追加）／§8 進捗テーブル（方向A=✅完了行追加・Fd备考更新・F2=着手可明示）／§8-Fd 申し送り表（1/2/4=対応済みクローズ・3=★未決として残置）を更新。Reid評価ゲート通過（M-1/S-1 修正・違反残存0件）を記録。**デザイン詳細は `docs/_portal/design/design-concept.md` 参照のままで二重管理なし**（PLAN はポインタ参照を維持）。次フェーズ F2（第1弾「画像仕分け圧縮くん」機能設計／Mado・Sara）が未着手・着手可であることを §8/§5 で明示。

- **検証済み: 本セッション 2026-06-17 確定事項反映** — (1) §8 進捗テーブルの方向A行を「テンプレ基盤フルリビルド」まで含めて✅完了に更新（FOUC・`_viewport.js`欠落の根因→static-template 基盤リビルド→Reid 再合格を記録）、F2 を「次の未着手フェーズ（着手可）」と明示。(2) i18n 採用しない（U-05）＋復帰発火条件（U-06）＋アーキ判断A（U-07）＋ナビ案B/768px境界/カテゴリ非表示（U-03）を §4 未決事項表に決着済みとして反映。(3) ビルド方針（§2-5＝static-template 基盤・素CSS禁止・`<head>` link クリティカルパス・画像 `src/public/images/`）を更新。(4) 横断方針の確定記録を §8-2 に新設（決定の所在と結論のみ）。
- **検証済み: 情報の二重管理なし** — デザイン詳細＝`docs/_portal/design/design-concept.md`／アーキ詳細＝`docs/_portal/02_architecture-shared-vs-standalone.md` をいずれもポインタ参照のまま維持（両ファイルの実在を確認済み）。PLAN には決定の結論と所在のみを保持し、仕様本文の重複コピーは作っていない。
- **検証済み（自己検証3項目）**: ①§8 が方向A完了（テンプレ基盤リビルド済）・F2 未着手（着手可）を示す＝OK。②i18n判断・アーキ判断A・カテゴリ非表示＆将来階層・768px境界 が §4/§8/§8-2 に反映済み＝OK。③design-concept.md / 02_architecture…md は参照のままで二重管理を生んでいない＝OK。
