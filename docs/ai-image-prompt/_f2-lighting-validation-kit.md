# _f2-lighting-validation-kit — 「光」カテゴリ 実機検証キット

> F2 spec前段の縦スライス検証フェーズ（担当: Mado / 制作部）。第1弾の「机上仕様→実機で書き換え」教訓の再発防止策。
> **目的**: 知識ベース（`_research-knowledge-base.md`）はすべてWeb記事ベース＝実機未検証。いきなり9カテゴリの仕様を書かず、**「光」1カテゴリだけを縦スライスで実機検証**し、"効く型" を確定してから横展開する（黒田さん承認 2026-06-19）。
> **検証の狙い**: AI臭 S2「平板/均一ライティング」（最も見抜かれやすいAI臭の1つ／知識ベース §2）を、光の指定（**方向＋時間帯/天候＋硬軟**の3点セット／§3-B）で消せるかを実機で当てる。
> **このキットの正体**: 黒田さんが各自の画像生成AIに貼って比較する「宿題セット」。L0〜L3を出して並べ、§4の判定軸で「どの段階が効くか」を判定→§5の結果テーブルに書き戻す。それが埋まれば光プリセットが確定し、同じ型を質感・構図・人物へ横展開できる。

---

## 0. 検証設計の前提（変更不可・知識ベースと整合）

- **受け渡し型**: ツールはプロンプト生成まで／生成はユーザー。よって本キットも「コピペして各自のAIで出す」形。
- **モデル非依存の自然文＋カンマ区切り語彙が本体**。Midjourney `--ar`/`--no`・SD重み記法 `(word:1.3)` は**混ぜない**（知識ベース §7）。
- **★2 機種名/フィルム銘柄＝任意トグル**（本検証の固定ベースには入れない＝光以外の変数を増やさないため）。
- **★3 ネガティブ重み記法 `:1.3`＝汎用版は重み無し**。本キットのベースにはネガティブ自体を入れない（光の効果だけを切り分けるため。ネガティブ検証は別カテゴリで実施）。
- **縦スライスの鉄則**: 被写体・構図・質感・カメラ・その他条件は**全段階で完全固定**。変えるのは**光の指定だけ**。これが崩れると「光が効いたのか他が効いたのか」が切り分けられない。

---

## 1. 固定ベースプロンプト（光以外＝全段階共通の土台）

各検証題で、L0〜L3を通して**この土台は一字一句変えない**。光の語だけを段階ごとに追記する。
土台に含めるのは「写真宣言＋具体被写体＋構図＋最低限の質感」のみ（知識ベース §3-A）。**光に関する語は土台に一切入れない**（L0を純粋な対照群にするため）。

| 検証題 | 被写体（黒田さん軸＝Web制作で使う実写） | Web用途の想定 |
|---|---|---|
| **題A** | 人物ヒーロー系（30代の男性フリーランサーがノートPCの前で自然な表情） | サービスサイト/LPのヒーロー・人物セクション |
| **題B** | 室内・物・空間系（木製デスクの上のコーヒーカップと観葉植物のある作業デスク） | 制作実績/ブログのアイキャッチ・背景・装飾 |

> 注: 題Aで「30代男性」「自然な表情」は被写体記述として固定に含む（人物の有無で土台が変わらないように）。人物リアリティ語（毛穴/非対称等）は今回は**入れない**（光の検証に集中するため。それは段2/7の別検証で扱う）。

---

## 2. 検証プロンプト — 題A（人物ヒーロー系）

被写体・構図・質感を固定し、**光の指定だけ**を L0→L3 で段階的に足す。日本語版・英語版を併記。コピペで即使用可。

### 題A / L0 — 光指定なし（ベースライン＝AI任せ＝S2が出やすい対照群）

**日本語版**
```text
写真、実写、30代の男性フリーランサーがノートパソコンの前に座り、自然な表情をしている。木製のデスクのある室内。被写体を画面の左1/3に配置した三分割構図。浅い被写界深度で背景は柔らかくボケている。35mmレンズで撮影した写真。
```

**English**
```text
RAW photo, photorealistic, a man in his 30s working as a freelancer, sitting in front of a laptop with a natural expression. Indoor room with a wooden desk. Rule of thirds composition with the subject positioned at the left third. Shallow depth of field, softly blurred background. Shot on a 35mm lens.
```

### 題A / L1 — 光の方向のみ明示

**日本語版**
```text
写真、実写、30代の男性フリーランサーがノートパソコンの前に座り、自然な表情をしている。木製のデスクのある室内。被写体を画面の左1/3に配置した三分割構図。浅い被写界深度で背景は柔らかくボケている。35mmレンズで撮影した写真。左側からの光、右側にできる影。
```

**English**
```text
RAW photo, photorealistic, a man in his 30s working as a freelancer, sitting in front of a laptop with a natural expression. Indoor room with a wooden desk. Rule of thirds composition with the subject positioned at the left third. Shallow depth of field, softly blurred background. Shot on a 35mm lens. Light coming from the left, shadows falling on the right side.
```

### 題A / L2 — 方向＋時間帯/天候

**日本語版**
```text
写真、実写、30代の男性フリーランサーがノートパソコンの前に座り、自然な表情をしている。木製のデスクのある室内。被写体を画面の左1/3に配置した三分割構図。浅い被写界深度で背景は柔らかくボケている。35mmレンズで撮影した写真。左の窓から差し込むゴールデンアワーの夕日、右側にできる影。
```

**English**
```text
RAW photo, photorealistic, a man in his 30s working as a freelancer, sitting in front of a laptop with a natural expression. Indoor room with a wooden desk. Rule of thirds composition with the subject positioned at the left third. Shallow depth of field, softly blurred background. Shot on a 35mm lens. Golden hour sunlight streaming in through a window on the left, shadows falling on the right side.
```

### 題A / L3 — 方向＋時間帯/天候＋硬軟（知識ベースの3点セット＝フル）

**日本語版**
```text
写真、実写、30代の男性フリーランサーがノートパソコンの前に座り、自然な表情をしている。木製のデスクのある室内。被写体を画面の左1/3に配置した三分割構図。浅い被写界深度で背景は柔らかくボケている。35mmレンズで撮影した写真。左の窓から差し込むゴールデンアワーの夕日、右側にできる柔らかい影、被写体の輪郭にわずかなリムライト。柔らかく拡散した自然光。
```

**English**
```text
RAW photo, photorealistic, a man in his 30s working as a freelancer, sitting in front of a laptop with a natural expression. Indoor room with a wooden desk. Rule of thirds composition with the subject positioned at the left third. Shallow depth of field, softly blurred background. Shot on a 35mm lens. Golden hour sunlight streaming in through a window on the left, soft shadows on the right side, subtle rim light on the subject's outline. Soft diffused natural light.
```

---

## 3. 検証プロンプト — 題B（室内・物・空間系）

題Aと同様、被写体・構図・質感を固定し、**光の指定だけ**を L0→L3 で段階追加。

### 題B / L0 — 光指定なし（ベースライン＝AI任せ＝S2が出やすい対照群）

**日本語版**
```text
写真、実写、木製のデスクの上に置かれたコーヒーカップと、横にある観葉植物。作業デスクの様子。カップを画面の右1/3に配置した三分割構図。浅い被写界深度で奥はボケている。50mmレンズで撮影した写真。
```

**English**
```text
RAW photo, photorealistic, a coffee cup on a wooden desk with a potted plant beside it. A working desk scene. Rule of thirds composition with the cup positioned at the right third. Shallow depth of field, blurred background. Shot on a 50mm lens.
```

### 題B / L1 — 光の方向のみ明示

**日本語版**
```text
写真、実写、木製のデスクの上に置かれたコーヒーカップと、横にある観葉植物。作業デスクの様子。カップを画面の右1/3に配置した三分割構図。浅い被写界深度で奥はボケている。50mmレンズで撮影した写真。左側からの光、右側にできる影。
```

**English**
```text
RAW photo, photorealistic, a coffee cup on a wooden desk with a potted plant beside it. A working desk scene. Rule of thirds composition with the cup positioned at the right third. Shallow depth of field, blurred background. Shot on a 50mm lens. Light coming from the left, shadows falling on the right side.
```

### 題B / L2 — 方向＋時間帯/天候

**日本語版**
```text
写真、実写、木製のデスクの上に置かれたコーヒーカップと、横にある観葉植物。作業デスクの様子。カップを画面の右1/3に配置した三分割構図。浅い被写界深度で奥はボケている。50mmレンズで撮影した写真。左の窓から差し込む午前の柔らかな自然光、右側にできる影。
```

**English**
```text
RAW photo, photorealistic, a coffee cup on a wooden desk with a potted plant beside it. A working desk scene. Rule of thirds composition with the cup positioned at the right third. Shallow depth of field, blurred background. Shot on a 50mm lens. Soft morning daylight coming through a window on the left, shadows falling on the right side.
```

### 題B / L3 — 方向＋時間帯/天候＋硬軟（知識ベースの3点セット＝フル）

**日本語版**
```text
写真、実写、木製のデスクの上に置かれたコーヒーカップと、横にある観葉植物。作業デスクの様子。カップを画面の右1/3に配置した三分割構図。浅い被写界深度で奥はボケている。50mmレンズで撮影した写真。左の窓から差し込む午前の柔らかな自然光、右側にできる柔らかい影、カップのふちにわずかなハイライト。柔らかく拡散した光。
```

**English**
```text
RAW photo, photorealistic, a coffee cup on a wooden desk with a potted plant beside it. A working desk scene. Rule of thirds composition with the cup positioned at the right third. Shallow depth of field, blurred background. Shot on a 50mm lens. Soft morning daylight coming through a window on the left, soft shadows on the right side, a subtle highlight on the rim of the cup. Soft diffused light.
```

---

## 4. 判定軸（黒田さんが各段階を「効いた/効かない」で見る観点）

各段階の出力画像を、以下のチェックリストで見る。**目的はAI臭 S2「平板/均一ライティング」が消えたかを具体的に見ること**。各項目を「はい/いいえ/どちらとも」で判定。

| # | チェック項目（S2が消えたか） | 見るポイント |
|---|---|---|
| C1 | **影の方向が一貫しているか** | 被写体・小物・地面の影がすべて同じ方向（指定した側）に落ちているか。バラバラなら光が効いていない |
| C2 | **光源が1つに見えるか** | 複数方向から均等に当たった「のっぺり」でなく、主光源が1方向にあると感じられるか |
| C3 | **フラット＝のっぺり均一でないか** | 画面全体が同じ明るさでベタっとせず、明部と暗部のグラデーション（陰影）があるか |
| C4 | **自然光/室内光に見えるか** | 指定した時間帯/天候（ゴールデンアワー/午前の自然光等）の色味・柔らかさが出ているか。蛍光灯みたいな無機質さでないか |
| C5 | **硬軟が反映されているか（L3で特に）** | 「柔らかい影」「拡散光」を指定した結果、影の縁がボケて柔らかいか。逆にカチッと硬い影になっていないか |
| C6 | **"いかにもAI"感が減ったか（総合）** | 一目で「AI生成だな」と分かる平板さが、段階を上げて減ったと感じるか |

### 段階間の比較メモ（自由記述・どの段階が最も自然だったか）

| 検証題 | L0（なし） | L1（方向） | L2（＋時間帯/天候） | L3（フル3点） |
|---|---|---|---|---|
| 題A（人物） |  |  |  |  |
| 題B（物・空間） |  |  |  |  |

> 記入例: 各セルに「S2残る／少し改善／自然」等の所感や、C1〜C6で気づいた点を短くメモ。

---

## 5. 実施手順（黒田さん向け・各自のAIで）

1. **AIを1つ選ぶ**（Flux / Imagen / GPT Image など、お使いのものでOK。どれでも可）。
2. **題Aから開始**。L0→L1→L2→L3 の順で、**4つを同じ条件**（できれば**同一シード**・同一アスペクト比・同一ステップ数）で生成する。シード固定機能があるAIなら必ず固定する（光以外のブレを抑えて比較精度を上げるため）。
3. 出てきた4枚を**横に並べて**、§4の判定軸（C1〜C6）で見比べる。
4. **題Bでも同じことを繰り返す**。
5. 余裕があれば**2つ目のAI**でも同じL0〜L3を出し、「AIが違っても同じ段階が効くか」を見る（モデル差の確認）。
6. 気づいたことを §6 の結果テーブルに書き戻す。

### モデル差の注意（知識ベース §7）

- **このキットのプロンプトはモデル非依存の自然文**です。Midjourney の `--ar`/`--no`、Stable Diffusion の `(word:1.3)` のような**固有記法は含めていません**。そのまま貼ってください。
- **アスペクト比・ネガティブ**は、**お使いのAIの記法/UI**で指定してください（プロンプト文には書いていません）。比率は全段階で揃えること。
- Flux は MJ記法を渡すと逆に劣化します。Imagen/GPT Image は自然文に強いので、このキットの文体がそのまま向いています。

---

## 6. 結果記入欄（ここが埋まれば光プリセットが確定する）

検証後、黒田さんが書き戻す欄。**この表が埋まれば spec の「光プリセット」が確定し、同じ型（段階を足して効果を測る縦スライス）を質感・構図・人物カテゴリへ横展開できる。**

### 6-A. どの段階が効いたか（題ごと）

| 検証題 | 使ったAI | 最も自然だった段階 | L0比でS2が消えたと感じた段階 | 一言所感 |
|---|---|---|---|---|
| 題A（人物） |  |  |  |  |
| 題B（物・空間） |  |  |  |  |
| （任意）2つ目AIで題A |  |  |  |  |
| （任意）2つ目AIで題B |  |  |  |  |

### 6-B. 効いた指定 / 効かなかった指定 / 意外に効いた語

| 区分 | 具体的な語・指定 | 所見 |
|---|---|---|
| **効いた指定**（プリセット採用候補） |  |  |
| **効かなかった指定**（外す候補） |  |  |
| **意外に効いた語**（追加候補） |  |  |

### 6-C. spec への申し送り（黒田さん→Mado）

- **光プリセットの確定型**（必須に入れる段階＝L1/L2/L3 のどこまで）:
- **質問フローで聞くべき粒度**（方向だけ聞く / 時間帯も聞く / 硬軟まで聞く）:
- **横展開の指示**（次に縦スライス検証する次カテゴリ＝質感 or 構図 or 人物）:
- **その他気づき**:

> この §6-C が埋まれば、Mado は確定した「効く型」だけを spec（01_spec.md）の光プリセットに落とし、残り8カテゴリへ同じ縦スライス手法で展開する。

---

## 検証済み

- **検証済み: 光以外の条件が全段階で固定** — §1 の固定ベース（写真宣言＋具体被写体＋三分割構図＋被写界深度＋焦点距離）を題A/題BそれぞれL0〜L3で一字一句共通にし、**追記するのは光の語だけ**にした。土台に光の語を一切入れず L0 を純粋な対照群にした（縦スライス成立）。
- **検証済み: 各検証プロンプトが日英両方・コピペ即使用可** — 題A/題B × L0〜L3 の計8パターン、すべて日本語版・English を別々のコードブロック（```text）で提示。固有記法を含まずそのまま貼れる。
- **検証済み: 判定軸がS2均一ライティングを具体的に見るチェックリスト** — §4 C1〜C6（影の方向の一貫性／光源が1つに見えるか／のっぺり均一でないか／自然光に見えるか／硬軟の反映／総合のAI感減）でS2消失を段階的に判定。比較メモ表＋結果テーブル（§6）に書き戻せる空欄を用意。
- **検証済み: モデル固有記法を混ぜず汎用自然文** — MJ `--ar`/`--no`・SD `(word:1.3)` を全プロンプトから排除。機種名/フィルム銘柄（★2）は固定ベースに入れず（光以外の変数を増やさない）、ネガティブ重み（★3）も入れず。アスペクト比/ネガティブは §5「お使いのAIの記法で」へ逃がした（知識ベース §7 と整合）。
