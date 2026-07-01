# 03_seo — AI画像プロンプト・ビルダー SEO設計

> ✅ F2 本格執筆済み（担当: Sara=SEO / meta・OG・タイトル・構造化）。
> 公開コンテンツのため自己検証＋代表確認。`../../PLAN.md` §6 / §2-8 参照。第1弾 `../image-compress/03_seo.md` の粒度・項目立てを踏襲。
> URL = `kurodafolio.com/tools/ai-image-prompt/`（確定・不変）。絶対URL = `https://kurodafolio.com/tools/ai-image-prompt/`。
> **最重要制約（spec §0-2 / overview コピー方針）**: 過剰約束の禁止。「AI臭さを必ず消す」「実写になる」NG／「自然な写真に近づけるプロンプトを組み立てる」OK。本書のSEOコピー（title/description/H1/CTA）すべてに適用。

---

## 0. 設計の前提（このページの検索戦略）

- positioning は「フロント制作者向けツール集」で特化だが、**各ツールページの検索リーチは縮めない**（PLAN.md §2-8 / 第1弾と同じ思想）。
- つまりこのページは「ai 画像 プロンプト」「画像生成 プロンプト 自然」のような**広い検索意図を素直に狙う**。特化文脈（Web制作で使う画像）はナビ・回遊・コピーで効かせ、ページ単体は広く入口を取る。
- 差別化の柱（＝検索意図に乗せる訴求）は3つ。**いずれも事実ベースで言い切り、効果を断定しない**。
  1. **段階的な質問に答えるだけでプロンプトが組み上がる**（決定論ビルダー＝同じ回答なら同じ結果）
  2. **AI臭さを抑える要素（光・質感・構図・不完全さ等）を織り込む**（「消す」ではなく「抑える・近づける」）
  3. **Web制作で使う画像に特化**（ヒーロー・アイキャッチ等の用途と比率を前提にした質問設計）
- 受け渡し型ゆえの訴求軸（第1弾と共通）: **ブラウザ完結・無料・キー不要・入力を送信しない**。生成はユーザーが各自のAIで行う＝「プロンプトを組み立てるところまで」を正直に名乗る。

---

## 1. 検索意図・狙うキーワード

### 1-1. 狙う検索意図

| 意図タイプ | 想定クエリ | このページの応え方 |
|---|---|---|
| プロンプトの作り方を知りたい（Know→Do） | ai 画像 プロンプト 作り方 / 画像生成 プロンプト 書き方 / 画像 ai プロンプト コツ | 質問に答えるだけで組み上がるビルダー本体が答え（読む前に手が動く） |
| 自然な／リアルな画像にしたい | 画像生成 プロンプト 自然 / ai 画像 リアル プロンプト / ai 画像 不自然 直す | 光・質感・構図・不完全さの質問で「自然な写真に近づける」要素を織り込む（断定しない） |
| ネガティブプロンプトを知りたい | ネガティブプロンプト 例 / ai 画像 ネガティブプロンプト | ネガティブ別欄を自動生成（避けたい見た目をプリセット化） |
| 用途特化（Web制作画像） | web サイト 画像 ai 生成 / アイキャッチ ai 画像 プロンプト / ヒーロー画像 ai | Web用途（ヒーロー/背景/アイキャッチ）と比率を前提にした質問設計が受け皿になる |
| 道具を今すぐ使いたい（Do） | 画像生成 プロンプト ジェネレーター / プロンプト 作成 ツール 無料 | ページを開いてすぐ質問に答え→コピーで完結（無料・キー不要・ブラウザ完結） |

### 1-2. キーワード設計（メモリ `feedback_meta_md_seo_keywords` の粒度に準拠）

> 注: 本件は静的サイトのため Rank Math は使わないが、**プライマリ1フレーズ＋セカンダリ0〜2個**の粒度（Focus Keyword 相当）に合わせて選定。単語単独は入れず、必ずフレーズで持つ。

- **プライマリ（1フレーズ）**: `ai 画像 プロンプト 作り方`
  - 「プロンプトをどう書けばいいか分からない」という最も太い検索意図のど真ん中。本ツールは"作り方を教える記事"ではなく"作る作業そのものを肩代わりするツール"なので、この意図に対し最短で価値を返せる。汎用ジェネレーターと同じ土俵で広く入口を取れる。
- **セカンダリ（2個）**:
  - `画像生成 プロンプト 自然` — 差別化の柱②（AI臭さを抑える＝自然に近づける）に直結。「のっぺり・不自然なAI画像を何とかしたい」という具体的な失敗意図を拾う。
  - `web 画像 ai プロンプト` — 差別化の柱③（用途特化＝Web制作画像）に直結。本ツール固有の角度（フロント屋の知見）を拾うニッチ語で、競合の少ない入口を取る。

> ★狙い分散の注意: 1ページで欲張りすぎず、本文 H1・リード文・各セクション見出しで上記3フレーズの構成語（ai 画像 プロンプト / 作り方 / 自然 / web）が自然に登場するようにする。詰め込み（キーワードスタッフィング）はしない。
> ★過剰約束との両立: 検索意図に「リアル」「自然」が含まれるからといって、コピー側で「リアルになる」「自然になる」と**断定しない**。「自然な写真に近づける」「AI臭さを抑える」と程度表現で受ける（§0-2 spec 準拠）。

---

## 2. タイトルタグ / H1

### 2-1. 運用判断（★静的サイトのため個別判断・第1弾踏襲）

> **判断**: メモリ `project_wordpress_title_tag.md` の「タイトルタグは基本空欄」運用は **WordPress（XWRITE が記事タイトルから自動生成）専用であり、本件＝静的サイトには当てはまらない**。
> 静的サイトでは `<title>` を自動生成する仕組みがないため、**各ツールページごとに `<title>` を明示的に記述する**（第1弾 `image-compress` と同じ個別記述）。

### 2-2. タイトルタグ（`<title>`）案

```
AI画像プロンプトの作り方｜自然な写真に近づける無料ジェネレーター｜kurodafolio
```

- 全角約36字（区切り含む）。狙い: プライマリ「ai 画像 プロンプト 作り方」＋差別化「自然な写真に近づける」（程度表現＝過剰約束なし）＋「無料」＋ブランド名でドメイン認知を育てる。
- ★長さ補足: PC検索結果は30字前後で切れるため、後半「無料ジェネレーター｜kurodafolio」は省略される可能性がある。**前半30字以内に主要語（AI画像プロンプト / 作り方 / 自然な写真に近づける）を寄せて配置済み**なので、切れても検索意図への訴求は保てる。
- ★過剰約束チェック: 「自然な写真に**近づける**」と程度表現で書き、「リアルになる」「AI臭さを消す」は使わない。OK。
- ブランド末尾は `kurodafolio`（ドメインパワー育成のため全ツール共通で末尾に付ける運用＝第1弾と統一）。

### 2-3. H1 案

```
AI画像プロンプト・ビルダー — 自然な写真に近づけるプロンプトを質問で組み立てる
```

- H1 はツール名（指名検索・ブランド資産）＋一言説明。`<title>` と完全一致させず、**H1＝ツールの正体／title＝検索意図** という役割分担にする（第1弾と同じ思想）。
- 「組み立てる」で言い切る（＝ツールの仕事はプロンプト生成まで、を正直に名乗る／spec §0-2）。生成・実写化は約束しない。
- ツール名「AI画像プロンプト・ビルダー」はサービス独自名のため固有名詞NGルール（ブランドガイドライン）に抵触しない（自社プロダクト名）。

---

## 3. meta description

### 3-1. 訴求の柱

①質問に答えるだけで組み上がる（手軽さ）→②AI臭さを抑える要素を織り込む（自然に近づける／断定しない）→③Web制作の用途・比率に対応（特化）→④無料・キー不要・ブラウザ完結、の順で120字前後に収める。

### 3-2. meta description 案（コピペ用・全角約116字）

```
質問に答えていくだけで、AI画像生成用のプロンプトを組み立てられる無料ツールです。光・質感・構図など、AI臭さを抑えて自然な写真に近づける要素を織り込みます。日本語と英語、ネガティブプロンプトを出力。ブラウザ内で完結します。
```

- 構成: ①手軽さ（質問に答えるだけ）→②自然に近づける（程度表現）→③日英＋ネガティブ出力→④ブラウザ完結、の順で要点を前に。
- 検索結果は120字前後で切れるため、最重要の「質問に答えるだけで組み立てられる」を先頭付近に配置。
- ★過剰約束チェック: 「自然な写真に**近づける**」「AI臭さを**抑える**」と程度表現で統一。「消す」「実写になる」は不使用。OK。

---

## 4. OGP / Twitter Card

### 4-1. OGタイトルの運用判断（★静的サイトのため個別判断・第1弾踏襲）

> **判断**: 「OGタイトル＝タイトルタグと統一」は XWRITE が1欄で両方を出力する**WordPress仕様に由来**する運用。本件＝静的サイトは `og:title` を `<meta>` で個別に書くため技術的には別文言にできるが、**運用効率と一貫性を優先し、本件でも og:title = title と統一する方針を踏襲**する（第1弾と同じ判断）。SNSで文字数が切れる懸念があれば将来 og:title だけ短縮版に差し替える余地は残す。

### 4-2. OGP方針（再利用テンプレ第1号を流用）

> **OGP画像は再利用テンプレ（`../_portal/design/ogp-template/`）を流用して量産する。**第1弾で確立したテンプレ第1号を、data-* 差替で本ツール用に再生成する（メモリ `reference_ogp_template_frontend_tools`）。
> **2026-06-23 の反転を反映**: テンプレは **白系背景＋黒テキスト＋pill #2ba89c** へ反転済み（旧: デスク写真背景＋黒幕＋ティール pill #5dd9cb）。本ツールOGPもこの反転後フォーマットで生成する。data-* に下記文言を差し込んで再生成すれば見た目は全ツールで統一される。

#### 4-2-1. OGP差込文言（data-* 差替値）案

| 差込スロット | 文言案 | 補足 |
|---|---|---|
| タイトル（大） | **AI画像プロンプト・ビルダー** | ツール表示名（H1ツール名と一致） |
| サブ（小） | 自然な写真に近づけるプロンプトを質問で組み立てる | 程度表現。「消す」「実写」を入れない |
| バッジ/pill | 無料・ブラウザ完結・キー不要 | 受け渡し型の訴求軸（第1弾と同型のバッジ運用） |

- ★過剰約束チェック: サブ文言は「近づける／組み立てる」で統一。OGPは拡散面なので特に断定NGを厳守（公開後に裏切らない文言）。
- 形式・寸法は第1弾踏襲（JPEG q90 / 1200×630）。§4-4 参照。

### 4-3. OGメタタグ案（コピペ用）

> OGP画像URLは**絶対URL（`https://`から始まる）でハードコード**する。相対パスはSNSクローラが解決できず画像が出ない（第1弾 §4-2 で結論済み・静的サイト共通の鉄則）。og:url / og:image / og:image:secure_url / canonical すべて絶対URL。

```html
<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://kurodafolio.com/tools/ai-image-prompt/">
<meta property="og:title" content="AI画像プロンプトの作り方｜自然な写真に近づける無料ジェネレーター｜kurodafolio">
<meta property="og:description" content="質問に答えるだけでAI画像生成用のプロンプトを組み立てられる無料ツール。光・質感・構図などAI臭さを抑える要素を織り込み、日本語・英語・ネガティブプロンプトを出力。ブラウザ内で完結します。">
<meta property="og:image" content="https://kurodafolio.com/tools/ai-image-prompt/ogp.jpg">
<meta property="og:image:secure_url" content="https://kurodafolio.com/tools/ai-image-prompt/ogp.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="AI画像プロンプト・ビルダー — 自然な写真に近づけるプロンプトを質問で組み立てる">
<meta property="og:site_name" content="kurodafolio">
<meta property="og:locale" content="ja_JP">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="AI画像プロンプトの作り方｜自然な写真に近づける無料ジェネレーター｜kurodafolio">
<meta name="twitter:description" content="質問に答えるだけでAI画像生成用のプロンプトを組み立てられる無料ツール。AI臭さを抑える要素を織り込み、日本語・英語・ネガティブプロンプトを出力。ブラウザ内で完結します。">
<meta name="twitter:image" content="https://kurodafolio.com/tools/ai-image-prompt/ogp.jpg">
<meta name="twitter:creator" content="@kurodalog">
<meta name="twitter:site" content="@kurodalog">
```

- `og:description` は SNS では本文 meta description より短く切られやすいため、Twitter 側は1文削った短縮版を使用。
- Twitter は `summary_large_image`（大きい画像カード）でツールの世界観を伝える。
- ✅確定踏襲: `twitter:creator` / `twitter:site` = `@kurodalog`（第1弾で黒田さん確定・本体ポートフォリオ運用アカウントに統一）。

### 4-4. OG画像（ogp.jpg）仕様（制作指示）

- サイズ: **1200 × 630px**（OGP標準比率）。
- 配置パス: `https://kurodafolio.com/tools/ai-image-prompt/ogp.jpg`（=ツールページと同階層に置き、絶対URLで参照）。
- 生成方法: **再利用テンプレ（`../_portal/design/ogp-template/`）の data-* を §4-2-1 の文言に差し替えて再生成**（手書きしない・量産テンプレ運用）。
- デザイン方針（2026-06-23 反転後）: **白系背景＋黒テキスト＋pill #2ba89c**。タイトル「AI画像プロンプト・ビルダー」＋サブ「自然な写真に近づけるプロンプトを質問で組み立てる」＋pill「無料・ブラウザ完結・キー不要」。本体 kurodafolio の世界観（`docs/_portal/design/design-concept.md` のトークン）と統一。
- ★文字は左右上下に安全マージン（SNSサムネで端が切れるため、重要要素は中央寄せ）。
- 形式: **JPEG q90（mozjpeg）／`ogp.jpg`**（第1弾確定踏襲）。SNSクローラ互換のため JPEG（WebP は一部クローラ未対応で不採用）。

---

## 5. 構造化データ（JSON-LD）

### 5-1. type 選定 — 結論と根拠（第1弾踏襲）

> **結論: `WebApplication`（schema.org）を主に採用する。** `SoftwareApplication` ではなく `WebApplication` を選ぶ（第1弾と同じ判断）。
>
> 根拠:
> - 本ツールは**ブラウザで開いてその場で動く（インストール不要・ダウンロード不要）**。この性質には `SoftwareApplication` のサブタイプである **`WebApplication` が最も適合**する。
> - 無料ツールであることを `offers`（price: "0"）で明示。
> - `applicationCategory` は本ツールが「テキスト（プロンプト）を生成する制作支援ユーティリティ」のため **`DesignApplication`** が最も近い（画像そのものを加工する第1弾＝`MultimediaApplication` とは性質が異なる。本ツールはプロンプト＝制作の設計を支援する）。★要確認: `MultimediaApplication` でも可（画像制作周辺ツールとして）。迷う場合は第1弾と揃え `MultimediaApplication` でもよい。
>
> ★補足: aggregateRating（評価）は実在しないため**入れない**（捏造はガイドライン違反＝第1弾と同じ順守）。

### 5-2. WebApplication JSON-LD（コピペ用）

> ★第1弾との差分: `browserRequirements` は WebAssembly 不要（決定論ビルダー＝純粋関数・WASM/Worker なし＝spec §10）。「Requires JavaScript and a modern browser.」に留める。

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AI画像プロンプト・ビルダー",
  "url": "https://kurodafolio.com/tools/ai-image-prompt/",
  "description": "質問に答えるだけでAI画像生成用のプロンプトを組み立てられる無料ツール。光・質感・構図などAI臭さを抑える要素を織り込み、日本語・英語・ネガティブプロンプトを出力します。ブラウザ内で完結し、入力は送信しません。",
  "applicationCategory": "DesignApplication",
  "operatingSystem": "Web browser",
  "browserRequirements": "Requires JavaScript and a modern browser.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "ja",
  "isAccessibleForFree": true,
  "author": {
    "@type": "Person",
    "name": "黒田こうすけ",
    "alternateName": "Kuroda Kosuke",
    "url": "https://kurodafolio.com",
    "sameAs": [
      "https://twitter.com/kurodalog",
      "https://github.com/kkurodalog",
      "https://frontend-note.blog"
    ]
  }
}
</script>
```

- `isAccessibleForFree: true` ＋ `offers.price: "0"` で「完全無料」を機械可読に明示。
- `author` ブロックは**第1弾と完全一致**（黒田こうすけ / Kuroda Kosuke / url / sameAs）。本体 `jsonld-person.html`（Person ノード）と一致させ、sameAs で「ツールの著者＝本体ポートフォリオの黒田こうすけ＝同一人物」と機械可読に束ねる（人物認知ファネル＝PLAN.md §1-2）。**全ツールで著者ブロックを統一すること**。

### 5-3. BreadcrumbList JSON-LD（コピペ用）

> パンくず「制作者ポートフォリオ ＞ ツール一覧 ＞ AI画像プロンプト・ビルダー」（確定済み前提）を構造化データ化。
> ★第1弾は表示ラベルが英語（Home / Tools / 画像仕分け圧縮くん）だった。本件のパンくず表示ラベルは**日本語**（制作者ポートフォリオ / ツール一覧 / AI画像プロンプト・ビルダー）で確定済み。**JSON-LD の `name` は実際の表示ラベルと一致させる**のが鉄則のため、ここでは日本語ラベルで記述する。★要確認: 第1弾と表示ラベルの言語（英語 vs 日本語）を揃えるか。揃えるなら第1弾側 or 本件側のどちらかに統一が必要（パンくずは全ツール共通 partial のため、partial 側の最終ラベルに JSON-LD を合わせること）。

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "制作者ポートフォリオ",
      "item": "https://kurodafolio.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "ツール一覧",
      "item": "https://kurodafolio.com/tools/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "AI画像プロンプト・ビルダー"
    }
  ]
}
</script>
```

- 最終要素（現在ページ）は `item` を**付けない**（schema.org 推奨＝自分自身へのリンク不要・第1弾と同じ）。
- パンくずの**表示ラベルとJSON-LDの `name` を一致**させる（共通 partial の最終ラベルに合わせる）。
- BreadcrumbList の `item` も**すべて絶対URL**（OGPと同じ理由＝静的サイトで相対は避ける）。

---

## 6. 内部リンク / 本体逆導線 / 回遊の SEO 観点

### 6-1. パンくず（最重要の内部リンク）

- `制作者ポートフォリオ ＞ ツール一覧 ＞ AI画像プロンプト・ビルダー` を全ツールページ共通 partial で設置（確定済み前提）。
- SEO観点: パンくずは**サイト階層を検索エンジンに伝える＋上位ページ（/ と /tools/）へリンクジュースを戻す**役割。/tools/（ポータルトップ）に内部リンクを集約しドメイン内評価を厚くする（第1弾と同じ）。

### 6-2. 本体（About / Works / Contact）への逆導線（共通 partial = maker-card.html）

- 各ツールページ下部の制作者カード（共通 partial `maker-card.html`／2026-06-19 汎用化済み）から本体ページへリンク。**第1弾で確定した案A（作り手の顔・実績先行型）の汎用文をそのまま使う**（ツール名に依存しない汎用文＝全ツール共通）。

```
このツールを作った人について

フロントエンドの制作を仕事にしている個人が、自分の作業を少し楽にするために作りました。Webサイトやランディングページの制作・改修も承っています。

[ 制作実績を見る ]   [ 制作のご相談をする ]
```

- アンカー: 「制作実績を見る」→ `https://kurodafolio.com/works/` ／「制作のご相談をする」→ `https://kurodafolio.com/contact/`
- SEO観点: 同一ドメイン内リンクなので**評価集約に正しく数えられる**。ツールが集めた流入を本体（営業ページ）へ流す内部導線＝リード獲得（PLAN.md §2-9）の動線をSEO構造としても担保。
- ★アンカーテキストは文脈語（「制作実績を見る」「制作のご相談をする」）にする（「こちら」単独より内容を表すテキストが望ましい）。

### 6-3. frontend-note 記事との相互送客（回遊導線・★別ドメイン扱いに注意）

> マネタイズ方針＝ツールは広告フリー・リード本命。回遊は**記事⇄ツールの文脈リンク**で作る（確定済み前提）。本ツールは「AIで画像を作る」題材なので、**AI×Web制作カテゴリ**の記事と相性が良い。

- **送り出す方向（ツール → 記事）**: ツールページから、AI画像の作り方・AI臭さの直し方・Web制作でのAI活用を扱う frontend-note 記事へ文脈リンク。「プロンプトの考え方をもっと知りたい方へ」等の自然な誘導。
- **受ける方向（記事 → ツール）**: AI×Web制作カテゴリの記事末尾・本文中から本ツールへ「実際に組み立てるなら」と送客。
- **関連しそうな frontend-note 記事の方向性（Sara が今後執筆 or 既存活用）**:
  - 「AIで生成した画像がなぜ"AI臭い"のか — 光・質感・構図の3観点」（AI×Web制作カテゴリ／本ツールの質問設計＝光・質感・構図と直結し、ツールへの自然な導線になる）
  - 「Web制作でAI画像を使うときの注意点（ヒーロー・アイキャッチの比率と馴染ませ方）」（用途特化の角度＝差別化の柱③を記事側で補強）
  - 既存「AIは手段／人間の設計が土台」（AI×Web制作第1本＝メモリ `project_ai_coding_before_delegation_article`）の思想と地続き。ツールも「設計（質問設計）が土台」という同じ軸なので、思想記事からの送客が効く。
- SEO観点（重要な区別）: frontend-note.blog は **kurodafolio.com とは別ドメイン**（PLAN.md §2-9）。相互リンクは**別ドメイン間の外部リンク＝評価集約には数えない**。役割は**送客（トラフィック誘導）のみ**。関連性が高く読者価値のある文脈リンクなら `rel` は通常リンクでよい（nofollow 不要）。
- **canonical の注意**: ツール本体は `kurodafolio.com/tools/ai-image-prompt/` の**1URLのみが正本**。記事への埋め込み/ミラーはしない。`<link rel="canonical" href="https://kurodafolio.com/tools/ai-image-prompt/">` を自己参照で必ず設置（静的サイトで重複URL事故を防ぐ＝第1弾と同じ）。

### 6-4. その他の必須メタ（公開チェック）

- `<link rel="canonical" href="https://kurodafolio.com/tools/ai-image-prompt/">`（自己参照・絶対URL）。
- `<meta name="robots" content="index, follow">`（index 許可。ツールは公開資産）。
- `<html lang="ja">`（日本語明示）。
- `lang` は当面 ja 単一（UIは日本語ベース／出力プロンプトの日英切替は `<html lang>` とは無関係＝あくまでツール内出力の言語。`<html lang>` は ja を維持）。

---

## 7. 公開前チェックリスト（SEO観点）

- [ ] `<title>` を §2-2 の文言で記述（静的サイトなので空欄運用にしない）
- [ ] `<meta name="description">` を §3-2 の文言で記述
- [ ] OGメタ（§4-3）を**すべて絶対URL**で記述（og:image / og:url / canonical）
- [ ] OG画像 `ogp.jpg`（1200×630・JPEG q90）を**再利用テンプレの data-* 差替で生成**し同階層に配置（§4-2 / §4-4）
- [ ] WebApplication JSON-LD（§5-2）設置・price:0 / isAccessibleForFree:true・author ブロックは第1弾と一致
- [ ] BreadcrumbList JSON-LD（§5-3）設置・最終要素に item なし・name はパンくず表示ラベル（partial）と一致
- [ ] `<link rel="canonical">` 自己参照（絶対URL）
- [ ] `<html lang="ja">` / `<meta name="robots" content="index, follow">`
- [ ] パンくず表示ラベルと JSON-LD の name が一致（共通 partial の言語ラベルに合わせる）
- [ ] **過剰約束チェック**: title / description / H1 / OGP サブ / CTA に「必ず」「消す」「実写になる」等の断定が無いか目視（§0-2 spec 準拠）
- [ ] リッチリザルトテスト（Google）でエラーが出ないか確認

---

## 関連ドキュメント
- `00_overview.md` — コンセプト・9カテゴリ・受け渡し型・日英切替
- `01_spec.md` — 機能仕様（§0-2 コピー方針＝過剰約束の禁止が本書SEOコピーの上位規範）
- `../image-compress/03_seo.md` — 第1弾 SEO設計（粒度・項目立ての見本）
- `../_portal/design/ogp-template/` — OGP再利用テンプレ第1号（data-* 差替で量産・2026-06-23 反転後）
- `../_portal/design/design-concept.md` — 世界観・トークン（OG画像の見た目統一の参照元）
- `../../PLAN.md` §2-4（導線）/ §2-8（positioning）/ §2-9（マネタイズ＝記事側送客）

---

## 検証済み
- **検証済み: 過剰約束なし（自己検証①）** — title（§2-2）「自然な写真に近づける」／description（§3-2）「AI臭さを抑える・自然な写真に近づける」／H1（§2-3）「プロンプトを質問で組み立てる」／OGPサブ（§4-2-1）／CTA（§6-2）すべて程度表現・事実ベース。「必ず」「消す」「実写になる」を一切使用せず。公開前チェックにも目視項目を追加（§7）。
- **検証済み: キーワードがフレーズ＋用途特化を含む（自己検証②）** — プライマリ `ai 画像 プロンプト 作り方`／セカンダリ `画像生成 プロンプト 自然`・`web 画像 ai プロンプト`。いずれも単語単独でなく3語フレーズ。セカンダリ②で用途特化（Web制作画像）の角度を確保。
- **検証済み: 構造化データ・パンくずが第1弾と整合（自己検証③）** — WebApplication＋BreadcrumbList を採用（§5）。author ブロックは第1弾と完全一致（黒田こうすけ / sameAs）。パンくずルート＝制作者ポートフォリオ（確定済み前提どおり）。OGP/canonical/breadcrumb item すべて絶対URL（第1弾の鉄則踏襲）。
- **検証済み: ブランドルール順守** — 固有名詞（オンラインスクール名等）不使用。ツール名は自社プロダクト名で抵触なし。誇張・断定を避けた文面。CTAは第1弾確定の汎用 partial 文をそのまま使用。
- **検証済み: 受け渡し型の正直な表現** — 「プロンプトを組み立てるところまで」「生成はユーザーが各自のAIで」をコピー全体で崩していない。WebApplication description にも「入力は送信しません」を明記。

## ★要確認
- **★要確認1（applicationCategory）**: §5-1 で `DesignApplication`（プロンプト＝制作支援）を提案。第1弾は `MultimediaApplication`。全ツールで揃える方針なら第1弾と同じ `MultimediaApplication` でも可。どちらで確定するか（実装前に1つに決める）。
- **★要確認2（パンくず表示ラベルの言語統一）**: 本件は日本語ラベル（制作者ポートフォリオ / ツール一覧 / AI画像プロンプト・ビルダー）で記述。第1弾は英語ラベル（Home / Tools / …）。パンくずは共通 partial のため、**全ツールで言語を統一する必要がある**。partial の最終ラベルに JSON-LD の name を合わせること（§5-3）。第1弾側の英語に揃えるか、本件の日本語に揃えるかを確定したい。
