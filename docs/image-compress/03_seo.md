# 03_seo — 画像仕分け圧縮くん SEO設計

> ✅ F2 本格執筆済み（担当: Sara=SEO / meta・OG・タイトル・構造化）。
> 公開コンテンツのため自己検証＋代表確認。`../../PLAN.md` §6 / §2-8 参照。
> URL = `kurodafolio.com/tools/image-compress/`（確定・不変）。絶対URL = `https://kurodafolio.com/tools/image-compress/`。

---

## 0. 設計の前提（このページの検索戦略）

- positioning は「フロント制作者向けツール集」で特化だが、**各ツールページの検索リーチは縮めない**（PLAN.md §2-8）。
- つまりこのページは「画像圧縮 webp」「画像 圧縮 オンライン」のような**広い検索意図を素直に狙う**。特化文脈はナビ・回遊・コピーで効かせ、ページ単体は広く入口を取る。
- 差別化の柱（＝検索意図に乗せる訴求）は3つ。
  1. **ブラウザ内で完結・画像を送信しない**（プライバシー）
  2. **画像の種別ごとに圧縮方針を選べる**（おまかせ＋手動の両立）
  3. **WebP / AVIF など次世代フォーマットに対応**

---

## 1. 検索意図・狙うキーワード

### 1-1. 狙う検索意図

| 意図タイプ | 想定クエリ | このページの応え方 |
|---|---|---|
| 道具を今すぐ使いたい（Do） | 画像 圧縮 オンライン / 画像圧縮 webp / 画像圧縮 ブラウザ | ページを開いてすぐ D&D で圧縮できる（ツール本体が答え） |
| 安全性を気にしている | 画像圧縮 アップロードしない / 画像圧縮 安全 / 画像圧縮 ローカル | 「画像を送信しない・ブラウザ内完結」を meta とファーストビューで明示 |
| フォーマット指定 | 画像 webp 変換 / 画像 avif 変換 / png webp 変換 | 種別プリセットと出力フォーマットで応える |
| 用途特化 | スクショ 圧縮 / 写真 圧縮 画質 落とさない | 6種別プリセット（背景・写真・スクショ等）が受け皿になる |

### 1-2. キーワード設計（Rank Math 相当の運用に乗せる粒度）

> 注: 本件は静的サイトのため Rank Math は使わないが、**プライマリ1フレーズ＋セカンダリ0〜2個**の粒度（メモリ `feedback_meta_md_seo_keywords` の運用）に合わせて選定。単語単独は入れず、必ずフレーズで持つ。

- **プライマリ（1フレーズ）**: `画像圧縮 webp オンライン`
  - 「道具を今すぐ使いたい（Do）」意図のど真ん中。フォーマット（webp）と利用形態（オンライン）を含み、競合（TinyPNG 等）と同じ土俵で広く入口を取れる。
- **セカンダリ（2個）**:
  - `画像圧縮 アップロードしない` — 差別化の柱①（送信しない）に直結。競合の弱点を突く意図クエリ。
  - `画像 圧縮 種類別` — 差別化の柱②（種別ごとに選べる）に直結。本ツール固有の価値を拾う。

> ★狙い分散の注意: 1ページで欲張りすぎず、本文 H1・リード文・各セクション見出しで上記3フレーズの構成語（画像圧縮 / webp / オンライン / アップロードしない / 種類別）が自然に登場するようにする。詰め込み（キーワードスタッフィング）はしない。

---

## 2. タイトルタグ / H1

### 2-1. 運用判断（★静的サイトのため個別判断）

> **判断**: メモリ `project_wordpress_title_tag.md` の「タイトルタグは基本空欄」運用は **WordPress（XWRITE が記事タイトルから自動生成）専用の運用であり、本件＝静的サイトには当てはまらない**。
> 静的サイトでは `<title>` を自動生成する仕組みがないため、**各ツールページごとに `<title>` を明示的に記述する**。これは「個別最適ページ」（PLAN.md §2-2）の方針とも整合する。

### 2-2. タイトルタグ（`<title>`）案

```
画像圧縮 webp/avif｜種類別に選べる無料オンラインツール｜kurodafolio
```

- 全角38字（区切り含む）。狙い: プライマリ「画像圧縮 webp」＋差別化「種類別」「オンライン」＋ブランド名でドメイン認知を育てる。
- ★長さ補足: PC検索結果は30字前後で切れるため、後半「無料オンラインツール｜kurodafolio」は省略される可能性がある。**前半30字以内に主要語（画像圧縮 / webp / avif / 種類別）を寄せて配置済み**なので、切れても検索意図への訴求は保てる。
- ブランド末尾は `kurodafolio`（ドメインパワー育成のため全ツール共通で末尾に付ける運用を推奨）。

### 2-3. H1 案

```
画像仕分け圧縮くん — 種類別に最適化する画像圧縮ツール
```

- H1 はツール名（指名検索・ブランド資産）＋一言説明。`<title>` と完全一致させず、**H1＝ツールの正体／title＝検索意図** という役割分担にする。
- ツール名「画像仕分け圧縮くん」はサービス独自名のため固有名詞NGルール（ブランドガイドライン）に抵触しない（自社プロダクト名）。

---

## 3. meta description

### 3-1. 訴求の柱

ブラウザ内完結・画像を送信しない（プライバシー）・種別ごとに選べる、の3点を120字前後に収める。

### 3-2. meta description 案（コピペ用・全角約118字）

```
ブラウザ内で完結する無料の画像圧縮ツール。画像をサーバーに送信しないので安心です。背景・写真・スクショなど種類別に最適な圧縮方式を選べて、WebPやAVIFにも変換できます。ドラッグ＆ドロップですぐ使えます。
```

- 構成: ①安全性（送信しない）→②種別選択→③フォーマット（WebP/AVIF）→④使い方の手軽さ、の順で要点を前に。
- 検索結果は120字前後で切れるため、最重要の「送信しない＝安心」を先頭付近に配置。
- 断定・誇張表現は避け（ブランドガイドラインNG表現）、機能の事実を述べる構成。

---

## 4. OGP / Twitter Card

### 4-1. OGタイトルの運用判断（★静的サイトのため個別判断）

> **判断**: メモリ `project_wordpress_title_tag.md` の「OGタイトル＝タイトルタグと統一」は XWRITE が1欄で両方を出力する**WordPress仕様に由来**する運用。本件＝静的サイトは `og:title` を `<meta>` で個別に書くため、**技術的にはタイトルタグと別文言にできる**。
> ただし**運用効率と一貫性を優先し、本件でも og:title = title と統一する方針を踏襲**する（別文言にするSEO/流入インパクトは小さい、という同メモリの根拠は静的サイトでも有効）。SNSで文字数が切れる懸念があれば将来 og:title だけ短縮版に差し替える余地は残す。

### 4-2. ★OGP画像の絶対URL化 — 結論

> **結論: OGP画像URLは絶対URL（`https://kurodafolio.com/...`）で記述する。相対パスは使わない。**
>
> 理由: OGP/Twitter Card のクローラ（Facebook・X・Slack 等）は**相対パスを解決できず、相対パスだとSNSシェア時に画像が表示されない**。静的サイトはCMSによる絶対URL自動補完が無いため、`og:image` / `twitter:image` は**必ず `https://` から始まる絶対URLでハードコードする**。
> これは `og:url` / `og:image:secure_url` も同様（すべて絶対URL）。Vite の `base:"/tools/"` はビルド内のアセット解決には効くが、**OGメタの絶対URL化は別問題**なので、メタ値は手書きの絶対URLにする。

### 4-3. OGメタタグ案（コピペ用）

```html
<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://kurodafolio.com/tools/image-compress/">
<meta property="og:title" content="画像圧縮 webp/avif｜種類別に選べる無料オンラインツール｜kurodafolio">
<meta property="og:description" content="ブラウザ内で完結する無料の画像圧縮ツール。画像をサーバーに送信しないので安心。背景・写真・スクショなど種類別に最適な圧縮方式を選べて、WebPやAVIFにも変換できます。">
<meta property="og:image" content="https://kurodafolio.com/tools/image-compress/ogp.jpg">
<meta property="og:image:secure_url" content="https://kurodafolio.com/tools/image-compress/ogp.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="画像仕分け圧縮くん — 種類別に最適化する画像圧縮ツール">
<meta property="og:site_name" content="kurodafolio">
<meta property="og:locale" content="ja_JP">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="画像圧縮 webp/avif｜種類別に選べる無料オンラインツール｜kurodafolio">
<meta name="twitter:description" content="ブラウザ内で完結する無料の画像圧縮ツール。画像をサーバーに送信しないので安心。種類別に最適な圧縮方式を選べてWebP/AVIFにも変換できます。">
<meta name="twitter:image" content="https://kurodafolio.com/tools/image-compress/ogp.jpg">
<meta name="twitter:creator" content="@kurodalog">
<meta name="twitter:site" content="@kurodalog">
```

- `og:description` は SNS では本文の meta description より短く切られやすいため、語尾を1文削った短縮版を使用。
- Twitter は `summary_large_image`（大きい画像カード）でツールの世界観を伝える。
- **✅確定**: `twitter:creator` / `twitter:site` = `@kurodalog`（黒田さん確定 / 2026-06-17）。本体ポートフォリオで運用しているXアカウントに統一。シェア時に投稿の帰属が `@kurodalog` に紐づく。

### 4-4. OG画像（ogp.jpg）仕様（制作指示）

- サイズ: **1200 × 630px**（OGP標準比率）。
- 配置パス: `https://kurodafolio.com/tools/image-compress/ogp.jpg`（=ツールページと同階層に置き、絶対URLで参照）。
- デザイン方針: ツール名「画像仕分け圧縮くん」＋一言キャッチ「種類別に選べる画像圧縮」＋「ブラウザ内完結・送信しない」バッジ。本体 kurodafolio の世界観（b-tech-cool / `docs/_portal/design/design-concept.md` のトークン）と統一。
- ★文字は左右上下に安全マージン（SNSサムネで端が切れるため、重要要素は中央寄せ）。
- 形式: **JPEG q90（mozjpeg）／`ogp.jpg` で確定**（黒田さん確定・2026-06-18）。写真背景（青デジタル粒子）＋テキスト合成で**写真主体**のため、軽量な JPEG が本来適切（PNG だと約940KB＝JPEGの約8倍重い）。テキストのキレは **DSF3 撮影＋lanczos3 縮小＋sharpen＋q90** で確保（本体 kurodafolio OGP の JPEG q90＝80KB が実証済み）。SNSクローラ互換も JPEG は PNG と同等に問題なし（WebP のみ一部クローラ未対応のため不採用）。

---

## 5. 構造化データ（JSON-LD）

### 5-1. type 選定 — 結論と根拠

> **結論: `WebApplication`（schema.org）を主に採用する。** `SoftwareApplication` ではなく `WebApplication` を選ぶ。
>
> 根拠:
> - `SoftwareApplication` は**インストールして使うアプリ**（OS指定・ダウンロード等）を主に想定する型。
> - 本ツールは**ブラウザで開いてその場で動く（インストール不要・ダウンロード不要）**。この性質には `SoftwareApplication` のサブタイプである **`WebApplication` が最も適合**する。
> - 無料ツールであることを `offers`（price: "0"）で明示し、リッチリザルト/ナレッジでの「無料」表示の根拠にする。
> - `applicationCategory` は `MultimediaApplication`（画像系ユーティリティ）が最も近い。
>
> ★補足: Google が現在 WebApplication にリッチリザルトを保証しているわけではない（評価/レビュー無しでは星は出ない）。それでも**「これは何のページか」を検索エンジンに正しく伝える意味で記述する価値がある**。レビュー（aggregateRating）は実在しない評価を捏造してはならない（ガイドライン違反）ため**入れない**。

### 5-2. WebApplication JSON-LD（コピペ用）

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "画像仕分け圧縮くん",
  "url": "https://kurodafolio.com/tools/image-compress/",
  "description": "ブラウザ内で完結する無料の画像圧縮ツール。画像をサーバーに送信せず、背景・写真・スクショなど種類別に最適な圧縮方式を選べてWebP/AVIFに変換できます。",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Web browser",
  "browserRequirements": "Requires JavaScript and a modern browser supporting WebAssembly.",
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
- `author.url` は本体ポートフォリオへ。ツール→人物認知のファネル（PLAN.md §1-2）を構造化データ上でも繋ぐ。
- **✅確定（著者エンティティ統一 / 2026-06-17）**: `author.name` = **「黒田こうすけ」**、`alternateName` = **「Kuroda Kosuke」**、`url` = `https://kurodafolio.com`。本体ポートフォリオの `jsonld-person.html`（Person ノード）と完全一致させる。
- **`sameAs` で同一人物を束ねる**: X（`@kurodalog`）/ GitHub（`kkurodalog`）/ frontend-note.blog を `sameAs` 配列に列挙。本体サイトの著者エンティティと同じ `sameAs` を持たせることで、検索エンジンに「ツールの著者＝本体ポートフォリオの黒田こうすけ＝同一人物」と機械可読に伝える。表記ゆれ・別人判定を防ぎ、人物認知ファネル（PLAN.md §1-2）を構造化データ層でも担保。
- フッター copyright 表記は本体と統一し `© 2026 Kosuke Kuroda`（実装側 HTML 注記 / 本セクションは JSON-LD のため参考）。

### 5-3. BreadcrumbList JSON-LD（コピペ用）

> パンくず「Home > Tools > 画像仕分け圧縮くん」（PLAN.md §2-4 #4）を構造化データ化。検索結果のパンくず表示に効く。

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://kurodafolio.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Tools",
      "item": "https://kurodafolio.com/tools/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "画像仕分け圧縮くん"
    }
  ]
}
</script>
```

- 最終要素（現在ページ）は `item` を**付けない**のが schema.org の推奨（自分自身へのリンクは不要）。
- パンくずの**表示ラベルとJSON-LDの `name` を一致**させる（Home / Tools / 画像仕分け圧縮くん）。
- BreadcrumbList の `item` も**すべて絶対URL**（OGPと同じ理由＝静的サイトで相対は避ける）。

---

## 6. 内部リンク / 本体逆導線の SEO 観点

### 6-1. パンくず（最重要の内部リンク）

- `Home > Tools > 画像仕分け圧縮くん` を全ツールページ共通 partial で設置（PLAN.md §2-4 #4）。
- SEO観点: パンくずは**サイト階層を検索エンジンに伝える＋上位ページ（/ と /tools/）へリンクジュースを戻す**役割。/tools/（ポータルトップ）に内部リンクを集約しドメイン内評価を厚くする。

### 6-2. 本体（About / Works / Contact）への逆導線

- 各ツールページ下部の「制作のご依頼・ご相談」CTA（PLAN.md §2-4 #4・§8-Fd 指摘5）から本体ページへリンク。
- SEO観点: 同一ドメイン内リンクなので**評価集約に正しく数えられる**。ツールページが集めた流入を本体（営業ページ）へ流す内部導線として機能する。リード獲得（PLAN.md §2-9）の動線をSEO構造としても担保。
- ★アンカーテキストは「制作のご依頼はこちら」等の文脈語にする（「こちら」単独より内容を表すテキストが望ましい）。

#### 逆導線CTAコピー案（★採用＝案A・黒田さん確定 2026-06-17 / Sara作成 2026-06-17）

> ✅ **採用＝案A（作り手の顔を出す・実績先行型）**。見出し「このツールを作った人について」／ボタン `[制作実績を見る]`＋`[制作のご相談をする]`。2026-06-17 黒田さん確定。案B/案Cは不採用（記録として残置）。F3 実装時はこの案Aを共通枠の逆導線CTAに使用する。
>
> ツール個別ページ下部に置く「逆方向営業導線」（本体 About / Works / Contact への送客 / PLAN §2-4・§8-Fd 指摘5）の対外公開コピー案。
> トーン＝若いフリーランスの誠実さ・押し付けない（brand-guidelines「派手さより誠実さ」準拠）。固有名詞（オンラインスクール名等）不使用。3案から黒田さんが選択。
> 構成は各案とも **見出し1本＋リード1〜2文＋CTAボタン2本**（実績＝Works／相談＝Contact）。ボタンのアンカーテキストは文脈語にする（§6-2 のSEO注記準拠）。

**▼案A（作り手の顔を出す・実績先行型）**

```
このツールを作った人について

「画像仕分け圧縮くん」は、フロントエンドの制作を仕事にしている個人が、
自分の作業を少し楽にするために作りました。
Webサイトやランディングページの制作・改修も承っています。

[ 制作実績を見る ]   [ 制作のご相談をする ]
```

- アンカー: 「制作実績を見る」→ `https://kurodafolio.com/works/` ／「制作のご相談をする」→ `https://kurodafolio.com/contact/`

**▼案B（困りごと共感・相談ハードルを下げる型）**

```
Web制作で困っていることはありませんか

このツールと同じように、サイトの「ちょっと使いにくい」「直したいけど手が回らない」を
形にするのが、ふだんの仕事です。小さな相談からお気軽にどうぞ。

[ これまでの制作を見る ]   [ お問い合わせ ]
```

- アンカー: 「これまでの制作を見る」→ `https://kurodafolio.com/works/` ／「お問い合わせ」→ `https://kurodafolio.com/contact/`

**▼案C（最小・控えめ型 / 押し付けなさ最優先）**

```
制作のご依頼・ご相談も承っています

普段はフリーランスのフロントエンドエンジニアとして、Webサイト制作をしています。
よければ実績やお問い合わせ先ものぞいてみてください。

[ 制作実績 ]   [ お問い合わせ ]
```

- アンカー: 「制作実績」→ `https://kurodafolio.com/works/` ／「お問い合わせ」→ `https://kurodafolio.com/contact/`

> 3案の差: A＝作り手の人柄を前に出す（ツール体験からの自然な接続が強い）／B＝読者の困りごとに寄せて相談ハードルを下げる（リード獲得寄り）／C＝最も控えめで邪魔にならない（押し付けなさ最優先）。
> いずれも断定・誇張表現なし・固有名詞なし。本体ページのアンカーは本体サイトの最終URL確定後に調整（works / contact のパスは PLAN §2-4 想定値）。

### 6-3. frontend-note 記事との相互送客（★別ドメイン扱いに注意）

- frontend-note.blog は **kurodafolio.com とは別ドメイン**（PLAN.md §2-9）。
- SEO観点（重要な区別）:
  - frontend-note → ツール、ツール → frontend-note のリンクは**別ドメイン間の外部リンク**。**同一ドメインのような評価集約（内部リンクジュースの還流）には数えない**。
  - 役割は **送客（トラフィック誘導）のみ**。記事で使い方を読んだ読者をツールへ、ツール利用者を解説記事へ、という回遊を作る。
  - 相互リンク自体はスパム的でなければ問題なし（関連性が高く読者価値がある文脈リンク）。`rel` 属性は通常リンクでよい（nofollow 不要）。
- **canonical の注意**: PLAN.md §2-9 のとおり、frontend-note 記事へツールを埋め込み/ミラーすることは**しない**（canonical 重複運用の複雑さを避ける）。ツール本体は `kurodafolio.com/tools/image-compress/` の**1URLのみが正本**。`<link rel="canonical" href="https://kurodafolio.com/tools/image-compress/">` を自己参照で必ず設置する（静的サイトで重複URL事故を防ぐ）。

### 6-4. その他の必須メタ（公開チェック）

- `<link rel="canonical" href="https://kurodafolio.com/tools/image-compress/">`（自己参照・絶対URL）。
- `<meta name="robots" content="index, follow">`（index 許可。ツールは公開資産）。
- `<html lang="ja">`（日本語明示）。
- `lang` は当面 ja 単一（i18n は採用しない＝PLAN.md U-05）。将来プリセット英語併記が入っても `<html lang>` は ja を維持。

---

## 7. 公開前チェックリスト（SEO観点）

- [ ] `<title>` を §2-2 の文言で記述（静的サイトなので空欄運用にしない）
- [ ] `<meta name="description">` を §3-2 の文言で記述
- [ ] OGメタ（§4-3）を**すべて絶対URL**で記述（og:image / og:url / canonical）
- [ ] OG画像 `ogp.jpg`（1200×630・JPEG q90）を同階層に配置
- [ ] WebApplication JSON-LD（§5-2）設置・price:0 / isAccessibleForFree:true
- [ ] BreadcrumbList JSON-LD（§5-3）設置・最終要素に item なし
- [ ] `<link rel="canonical">` 自己参照（絶対URL）
- [ ] `<html lang="ja">` / `<meta name="robots" content="index, follow">`
- [ ] パンくず表示ラベルと JSON-LD の name が一致
- [ ] リッチリザルトテスト（Google）でエラーが出ないか確認

---

## 関連ドキュメント
- `00_overview.md` — 概要・ターゲット
- `../_portal/` — ポータル全体の SEO / positioning 素材
- `../_portal/design/design-concept.md` — 世界観・トークン（OG画像の見た目統一の参照元）
- `../../PLAN.md` §2-4（導線）/ §2-8（positioning）/ §2-9（マネタイズ＝記事側送客）

---

## 検証済み
- **検証済み: プライマリ/セカンダリがフレーズ** — プライマリ `画像圧縮 webp オンライン`／セカンダリ `画像圧縮 アップロードしない`・`画像 圧縮 種類別`。いずれも単語単独でなく2〜3語のフレーズ。
- **検証済み: OGP画像の絶対URL化を明確に結論** — §4-2 で「絶対URL必須・相対パス禁止（SNSクローラが相対を解決できず画像が出ない）」と断定。og:url / og:image / canonical / BreadcrumbList item すべて絶対URL。
- **検証済み: 構造化データ type の根拠** — §5-1 で WebApplication を採用（インストール不要のブラウザ完結ツールに適合・SoftwareApplication は非選択）。aggregateRating は実在評価が無いため不採用＝ガイドライン順守。
- **検証済み: タイトル・meta・OG文面が完成文** — §2-2 title／§3-2 description／§4-3 OGメタ／§5 JSON-LD すべてコピペ可能な完成形で記述。
- **検証済み: 静的サイトの個別判断を明記** — タイトルタグ空欄運用（§2-1）・OGタイトル統一（§4-1）はいずれもWordPress由来であり静的サイトでは個別判断する旨を明記。
- **検証済み: ブランドルール順守** — 固有名詞（オンラインスクール名等）不使用。ツール名は自社プロダクト名で抵触なし。誇張・断定表現を避けた文面。CTAコピー3案も同様に固有名詞なし・押し付けないトーン。
- **検証済み: twitter:creator 確定反映（2026-06-17）** — §4-3 に `twitter:creator` / `twitter:site` = `@kurodalog` を確定記載。★要確認1を確定済みに置換。
- **検証済み: 著者エンティティ統一（2026-06-17）** — §5-2 JSON-LD `author` を `name`「黒田こうすけ」+ `alternateName`「Kuroda Kosuke」+ `url` `https://kurodafolio.com` + `sameAs`（X / GitHub / frontend-note）に確定。本体 `jsonld-person.html` と一致させ sameAs で同一人物として束ねた。★要確認2を確定済みに置換。
- **検証済み: 既存確定を非破壊** — プライマリKW（§1-2）・タイトルタグ静的サイト個別記述（§2）・OGP絶対URL必須（§4-2）・WebApplication+BreadcrumbList（§5）は変更せず維持。

## ★要確認
- ~~**★要確認1（Xアカウント）**~~ → **✅確定**: `twitter:creator` / `twitter:site` = `@kurodalog`（2026-06-17）。
- ~~**★要確認2（著者表記）**~~ → **✅確定**: `author` = 黒田こうすけ / Kuroda Kosuke / url / sameAs（2026-06-17・本体 jsonld-person 整合）。
- **✅ ★要確認3（CTAコピー）＝解決**: §6-2 末尾の逆導線CTAコピーは **案A（作り手の顔・実績先行型）を採用**（黒田さん確定 2026-06-17）。本体 works / contact のアンカーURLは本体最終URL確定後に微調整（F3/F5 で対応）。
- **✅ ★要確認1（twitter:creator）＝解決**: `@kurodalog` で確定（§4-3）。
- **✅ ★要確認2（author.name）＝解決**: 本体 jsonld-person 整合で「黒田こうすけ」/ alternateName「Kuroda Kosuke」/ sameAs に統一（§5-2）。
