# _research-knowledge-base — AI画像「AI臭さ消し」craft 一次ソース集

> F2 知識ベースフェーズ（担当: Mado / 制作部）。本書は spec（01_spec.md）で「9カテゴリの質問フロー⇄日英プリセット文」に落とすための **craft の種**＝Web上の良質記事から収集した手法を構造化した一次ソース集。
> 対象ツール: 第2弾「AI画像プロンプト・ビルダー」（slug=`ai-image-prompt`）。設計前提は `00_overview.md`（質問フロー9カテゴリ）・`_f2-mane-review.md`（条件付き合格＝知識ベースが工数の主役）参照。
> 収集日: 2026-06-19 / **情報の賞味期限に注意**（モデル世代・固有記法は2026年時点。年付き・断定回避）。
> **黒田さんの軸**: Web制作で使う画像＝突き詰めると「実際にカメラで撮った写真」。よって **"AIっぽさ"を消して"実写・カメラ写真"に近づける手法を最重視**（本書 §3 が最厚）。

---

## 0. 凡例（事実と推測の区別）

- **【事実】** = 収集した記事に明記されていた手法・語彙（出典URL付き）。
- **【解釈】** = Mado が overview 9カテゴリにマッピングするために加えた整理・推測。spec で実機検証して確定すべきもの。
- **語彙は日本語/英語を併記**。最終プロンプトは日英両対応のため、英語の定番語彙を主、日本語を可読性用に拾う（overview §4-3）。
- **モデル非依存の汎用語彙を基本**。Midjourney `--ar`/`--no` 等の固有記法は §7 に隔離して「注記レベル」で扱う。

---

## 1. リサーチ概要 / 対象クエリ

### 検索クエリ（実行済み）
- `why AI generated images look fake telltale signs how to avoid`（AI臭の症状カタログ）
- `AI image prompt make it look like real photo photorealistic camera lens settings`（実写化・最重視）
- `photography prompt keywords photorealistic AI 35mm film grain golden hour depth of field`（写真用語）
- `AI画像 AIっぽさ 消す プロンプト 写真 リアル 自然`（日本語ソース）
- `AI image composition rule of thirds off-center avoid centered symmetrical prompt natural`（構図）
- `negative prompt list photorealistic avoid plastic skin extra fingers deformed hands watermark`（ネガティブ定番）
- `AI portrait realistic prompt natural expression candid imperfection age skin`（人物リアリティ）
- `Midjourney aspect ratio --ar --no parameters vs Flux Imagen prompt syntax`（モデル固有記法）

### 収集の網羅状況（overview 9カテゴリ別 / 厚薄）
| 段 | カテゴリ | 厚さ | 所見 |
|---|---|---|---|
| 1 | 画像タイプ | △ 薄 | タイプ別の自然さ基準は断片的。spec で補強要 |
| 2 | 被写体・主題 | ○ | 人物リアリティと連動して厚い（§5） |
| 3 | 雰囲気・トーン | ○ | 過剰彩度/コントラスト回避の語彙が複数ソースで一致 |
| **4** | **光（ライティング）** | ◎ **厚** | AI臭最大要因。方向・時間帯・硬軟の語彙が豊富（§3-B） |
| **5** | **質感・素材感** | ◎ **厚** | フィルム/粒状感/被写界深度/肌が最も厚い（§3-C/D）＝黒田さん軸の核 |
| **6** | **構図・カメラ** | ◎ **厚** | center bias と三分割対策が明確（§3-E/§4） |
| **7** | **不完全さ/リアリティ** | ◎ **厚** | candid・生活感・非対称の語彙が複数ソース一致（§3-F/§5） |
| 8 | ネガティブ | ◎ **厚** | 定番リストが複数ソースでほぼ収束（§6） |
| 9 | アスペクト比 | △ 薄 | 技法というより用途デフォルト。固有記法は §7 |

**総括**: 黒田さん最重視の「実写・カメラ写真に近づける」軸（段4〜7）は**◎で厚く拾えた**。薄いのは①画像タイプの自然さ基準・⑨比率（ただし⑨は技法より実務デフォルトの問題で、知識ベースの主戦場ではない）。

---

## 2. 「AIっぽさ」の症状カタログ（何を潰すか）

複数ソースで繰り返し挙がったAI臭の典型症状。**これが質問フロー段4〜7で先回りして潰す対象**（overview §5「AI臭の典型失敗を質問で先回り」）。

| # | 症状（AI臭） | 説明 | overview対応段 | 主な出典 |
|---|---|---|---|---|
| S1 | **プラスチック肌 / のっぺり質感** | 毛穴ゼロ・エアブラシ・テカテカ。肌が異様に滑らか | 段5（質感） | zsky, aivideobootcamp |
| S2 | **平板/均一ライティング** | 影が変な位置・光源不整合・フラットで方向が無い（最も見抜かれやすい） | 段4（光） | cyberguy, zsky |
| S3 | **過剰彩度/過剰コントラスト** | 色がギラつく・非現実的な鮮やかさ | 段3（雰囲気） | zsky, aivideobootcamp |
| S4 | **中央寄せ/完璧対称構図** | 学習データの center bias で被写体が常に中央・左右対称になる | 段6（構図） | hailuoai, medium(nrao) |
| S5 | **整いすぎ（uncanny valley）** | 不完全さゼロ・人工的に完璧で逆に偽物に見える | 段7（不完全さ） | fiddl, media.io |
| S6 | **人物の不自然さ** | 無表情・硬いポーズ・死んだ目（反射なし）・左右対称すぎる顔・年齢感の欠如 | 段2/段7 | fiddl, zsky |
| S7 | **手指の破綻** | 指が6本・融合・関節異常（最も有名なAI臭） | ネガティブ(段8) | cyberguy, promptsera |
| S8 | **背景の幾何学破綻 / 連続性破綻** | 前景で隠れた線（壁の縁・窓枠・配管）が反対側で「ズレる」・遠近の崩れ・背景文字の崩壊 | ネガティブ/段6 | roblaughter, cyberguy |
| S9 | **過剰なツルツル/デジタル臭** | 粒状感ゼロの過剰クリーン＝逆に非現実的 | 段5（質感） | luft, promptaa |
| S10 | **浮いた被写体 / 文脈との断絶** | 背景と被写体が馴染まない・影の方向が不一致 | 段2/段4 | luft, note(siryosakusei) |

> **【解釈】**: S1〜S5, S9 が「光・質感・構図」の指定で消える＝段4〜6の主戦場。S6は人物リアリティ（§5）。S7・S8はネガティブプロンプト（§6）が主担当。S2「均一ライティング」と S4「中央寄せ」が**最も繰り返し言及される2大AI臭**。

---

## 3. ★最重視★ 実写・カメラ写真に近づける手法（症状→指定→日英語彙→出典）

> 黒田さん軸の中核。「AI臭の症状 → 消すための指定 → 日本語/英語の語彙例 → 出典」の対応表。spec でプリセット文に落とす最有力候補。**最重要手法は最低3ソースでクロスチェック済み**（各行の出典数参照）。

### 3-A. 「写真である」と宣言する基礎語彙（全体の土台）

| 症状 | 指定（craft） | 英語語彙（主） | 日本語語彙 | 出典数 |
|---|---|---|---|---|
| デジタル臭・絵っぽさ | 写真メディアを明示 | `photorealistic`, `RAW photo`, `DSLR photography`, `mirrorless camera`, `editorial photography` | 写真風、実写、一眼レフ写真、報道写真風 | 3+（artsmart, overchat, artsmart） |
| 具体的カメラ機種で実機を示唆 | カメラ機種名を入れると光学特性を模倣 | `shot on Canon EOS R5`, `Nikon Z9`, `Sony A7R IV`, `Leica M10/M6` | キヤノンEOS R5で撮影、ニコンZ9で撮影 | 3+（artsmart, luft, designhero） |

> 【解釈】機種名は「光学特性のヒント」として効く（記事の主張）。ただし**特定機種への過依存はモデル非依存原則とややぶつかる**＝spec では「機種名は任意の上乗せ」に留め、汎用語（photorealistic / RAW photo）を必須コアにするのが安全。

### 3-B. 光（段4 / AI臭S2の最大対策）— ◎最厚

| 症状 | 指定（craft） | 英語語彙（主） | 日本語語彙 | 出典数 |
|---|---|---|---|---|
| 平板/均一ライティング(S2) | **光の方向を1つ明示**（影をAIに整合計算させる） | `soft window light from the left`, `golden hour sunlight from the left, soft shadows on the right` | 左からの柔らかい窓光、左からの夕日と右側の柔らかい影 | 3+（aivideobootcamp, zsky, overchat） |
| 同上 | 時間帯/天候で自然光を指定 | `golden hour`, `overcast daylight`, `soft diffused light`, `afternoon sunlight streaming in`, `blue hour` | ゴールデンアワー、曇天の自然光、柔らかな拡散光、夕暮れの逆光 | 3+（artsmart, overchat, luft, note） |
| 同上 | 光の質（硬軟）・補助光 | `soft natural light`, `subtle rim light`, `backlight`, `Rembrandt lighting`, `single softbox at 45 degrees` | 柔らかい自然光、リムライト、逆光、レンブラントライト | 3+（aivideobootcamp, artsmart, nightjar） |
| 魔法めいた非現実光 | ファンタジー光を避ける | （避ける語）`magical lighting`, `fantasy lighting`, `neon glow` を入れない | 魔法的な光・ネオン発光を避ける | 2（aivideobootcamp, artsmart） |

> 【事実・クロス確認】「光源の方向を1つ決めて影を整合させる」は zsky・aivideobootcamp・overchat で一致。**段4の必須プリセットは『方向＋時間帯/天候＋硬軟』の3点セット**が複数ソースの最大公約数。

### 3-C. 質感・フィルム/粒状感（段5 / AI臭S1・S9対策）— ◎最厚・黒田さん軸の核

| 症状 | 指定（craft） | 英語語彙（主） | 日本語語彙 | 出典数 |
|---|---|---|---|---|
| のっぺり/過剰クリーン(S9) | **フィルム粒状感・自然なノイズ**を加える | `natural film grain`, `subtle film grain`, `cinematic grain`, `high ISO film grain`, `sensor noise in shadows`, `analog imperfections` | 自然なフィルム粒状感、わずかな粒状感、シャドウ部のセンサーノイズ、アナログの揺らぎ | 3+（aivideobootcamp, artsmart, media.io-analog, luft） |
| 同上 | **フィルム銘柄**で学習データの実写を喚起 | `shot on Kodak Portra 400`, `35mm film`, `Ilford HP5 pushed one stop`, `light-leak` | コダックPortra 400、35mmフィルム、ライトリーク | 2（promptaa, designhero） |
| 整いすぎ(S5) | 軽微なブレ・レンズの不完全さ | `slight motion blur`, `subtle lens distortion at edges`, `dust particles in light beam` | わずかなモーションブラー、周辺のレンズ歪み、光の中の埃 | 2+（zsky, note） |
| プラスチック素材感 | 素材のディテールを具体指定 | `full-grain leather with visible grain, cracked seams`, `brushed stainless steel, tiny fingerprints`, `weathered`, `chipped paint` | 革のグレイン・ひび、ステンレスの指紋、風化した、剥げた塗装 | 2（promptaa, luft） |

> 【事実・クロス確認】「film grain / natural noise を足してデジタル臭を消す」は本リサーチで**最も多くのソースが一致した手法**（日英両方）。黒田さん軸＝実写化の中核。**段5の必須プリセットは『film grain + 質感の語』**。

### 3-D. カメラ・レンズ・被写界深度（段5/6境界 / 実写の光学）— ◎厚

| 症状 | 指定（craft） | 英語語彙（主） | 日本語語彙 | 出典数 |
|---|---|---|---|---|
| 奥行きが無い/絵的 | **焦点距離**で自然なパース | `35mm lens`（最も自然と複数記事）, `50mm lens`（人間の視覚に近い）, `85mm portrait lens`, `wide-angle 16mm`, `100mm macro` | 35mmレンズ、50mmレンズ（人間の視覚に近い）、85mmポートレートレンズ、広角、マクロ | 3+（aivideobootcamp, artsmart, luft, note） |
| 全面ピント＝CG臭 | **絞り/被写界深度**で被写体分離 | `shallow depth of field`, `natural bokeh`, `f/1.8`〜`f/2.0`, `bokeh background`, `foreground blur` | 浅い被写界深度、自然なボケ、F1.8、前ボケ | 3+（artsmart, luft, overchat, note） |

> 【事実】「35mmが最も自然」（aivideobootcamp）、「50mm/F2.0は人間の視覚に近い」（note 日本語）と、焦点距離の推奨が複数ソースで一致。【解釈】レンズ＋絞りは段5（質感/レンズ感）と段6（カメラ）にまたがる＝spec で配置を確定要。

### 3-E. 色温度・ホワイトバランス（段3 / AI臭S3対策）— ○

| 症状 | 指定（craft） | 英語語彙（主） | 日本語語彙 | 出典数 |
|---|---|---|---|---|
| 過剰彩度/ギラつき(S3) | 彩度を抑える・自然な色 | `natural color palette`, `muted tones`, `desaturated`, `earthy color palette`, `natural color grading`, `cinematic color balance` | 自然な色味、彩度控えめ、ミュートカラー、アーシーな配色 | 3+（zsky, aivideobootcamp） |
| 過剰コントラスト | （避ける語） | `hyper-saturated colors`, `vibrant rainbow tones` を入れない | ギラついた高彩度・極端な原色を避ける | 2（zsky, aivideobootcamp） |

### 3-F. 不完全さ・生活感（段7 / AI臭S5・S10対策）— ◎厚

| 症状 | 指定（craft） | 英語語彙（主） | 日本語語彙 | 出典数 |
|---|---|---|---|---|
| 整いすぎ(S5) | **意図的な不完全さ** | `slightly wrinkled fabric`, `natural imperfections`, `organic variation`, `irregular patterns` | 少しシワの寄った服、自然な不完全さ、不規則なパターン | 3+（zsky, aivideobootcamp, fiddl） |
| 浮いた被写体(S10) | **生活感・環境の文脈** | `lived-in atmosphere`, `scattered objects`, `worn signage`, `steam rising`, `mismatched crockery`, `background clutter` | 生活感のある空気、散らかった小物、使い込まれた看板、湯気 | 2（luft, promptaa） |
| ポーズが硬い | **candid（不意の瞬間）** | `candid shot`, `caught mid-stride`, `unaware of the camera`, `snapshot style`, `taken from smartphone` | スナップ風、歩いている途中、カメラを意識していない、スマホで撮った風 | 3+（luft, fiddl, promptaa, note） |

> 【事実・クロス確認】candid / lived-in / 生活感は日英ソースで一致（特に日本語 luft・note が厚い）。黒田さん軸＝「実際に撮った日常写真」に直結する重要群。

---

## 4. 構図の自然化（段6 / AI臭S4対策）

| 症状 | 指定（craft） | 英語語彙（主） | 日本語語彙 | 出典数 |
|---|---|---|---|---|
| 中央寄せ/対称(S4) | **三分割・被写体を端に** | `rule of thirds composition`, `subject positioned at left third`, `eyes at upper right third intersection`, `off-center composition` | 三分割構図、被写体を左1/3に配置、視線を右上の交点に、オフセンター | 3+（medium-nrao, hailuoai, zsky-comp） |
| 同上 | **余白・視線誘導** | `negative space`, `open sky occupying upper two thirds`, `leading lines` | 余白、画面上2/3を空に、視線を導く線 | 2+（medium-nrao, zsky-comp） |
| 単調なアングル | アングル/画角を指定 | `low angle`, `overhead shot`, `three-quarter view`, `tilt-shift effect` | ローアングル、俯瞰、斜め45度、ティルトシフト | 2（artsmart, ai-prompt.jp） |

> 【事実】「AIは学習データの center bias で被写体を中央・対称にしがち。構図はプロンプトに明記しないと自動では崩れない」は hailuoai・medium(nrao) で一致。**段6の必須プリセットは『三分割＋被写体位置＋余白』**。【解釈】質問フローで「被写体をどこに置くか（左/右/中央）」を聞くだけでS4を直接潰せる＝UX上も実装容易。

---

## 5. 人物のリアリティ（段2/段7 / AI臭S6対策）

| 症状 | 指定（craft） | 英語語彙（主） | 日本語語彙 | 出典数 |
|---|---|---|---|---|
| プラスチック肌(S1) | 毛穴・微細ディテール | `natural skin texture, visible pores`, `skin micro-details`, `subtle under-eye texture`, `matte skin`, `faint blemishes`, `subsurface scattering` | 自然な肌質、見える毛穴、目の下の自然な質感、マットな肌、そばかす | 3+（zsky, aivideobootcamp, fiddl, media.io） |
| 死んだ目(S6) | 目の反射・潤い | `natural eye reflections, catchlight in eyes`, `slight moisture on eyes`, `natural iris color variation` | 目のキャッチライト、自然な目の潤い、虹彩の色ムラ | 2（zsky, fiddl） |
| 対称すぎる顔(S6) | **自然な非対称** | `natural asymmetry`, `slight asymmetry`, `weathered face` | 自然な左右非対称、わずかな非対称、風化した顔 | 3+（fiddl, media.io, luft） |
| 無表情/硬い(S6) | 自然な表情・年齢感 | `authentic/candid expression`, `natural smile`, `subtle smile lines`, `man in his late 20s / mid-30s`（年齢明示） | 自然な表情、自然な笑み、笑いジワ、30代半ばの男性（年齢を明示） | 3+（fiddl, zsky, note） |
| 整いすぎ(S5) | 髪・服・肌の現実の揺らぎ | `hair slightly messy`, `natural under-eye shadows`, `slightly wrinkled clothes` | 髪が少し乱れ、目の下に自然なクマ、服に自然なシワ | 2（note, fiddl） |
| 「完璧」を要求しない | 過剰美化語を避ける | （避ける語）`perfect skin`, `flawless`, `beauty filter`, `airbrushed` を**入れない** | 「完璧な肌」「フィルター」系を入れない | 2（zsky, aivideobootcamp） |

> 【事実・クロス確認】「AIは完璧/対称に寄せる→逆に偽物に見える（uncanny valley）。natural asymmetry + visible pores + candid expression で崩す」は fiddl・media.io・zsky で一致。**段2/段7の人物プリセットは『毛穴＋目の反射＋非対称＋candid表情＋年齢明示』**。
> 【注意】手指破綻(S7)は人物プロンプト本体ではなく**ネガティブ側で潰す**のが定番（§6）。

---

## 6. ネガティブプロンプトの定番（段8 / AI臭S7・S8対策）

複数ソースでほぼ収束した「避けたい要素」の典型語彙。**対応AI（ネガティブ記法を持つもの）向けに別欄提示**（overview ★E）。

### 6-A. カテゴリ別 定番ネガティブ語彙（英語・モデル非依存）

| カテゴリ | 定番語彙（英語） | 潰すAI臭 |
|---|---|---|
| 画質 | `blurry`, `low quality`, `worst quality`, `jpeg artifacts`, `low resolution`, `pixelated` | S9類（破綻した質感） |
| 描画手法（写真にしたい時） | `cartoon`, `anime`, `illustration`, `painting`, `drawing`, `3d render`, `cgi`, `digital art` | 絵っぽさ全般 |
| 肌 | `plastic skin`, `waxy skin`, `poreless skin`, `airbrushed`, `beauty filter` | S1 プラスチック肌 |
| 解剖（手指） | `extra fingers`, `mutated/malformed hands`, `fused fingers`, `missing fingers`, `claw hand`, `extra limbs` | **S7 手指破綻** |
| 顔/解剖 | `bad anatomy`, `deformed`, `disfigured`, `distorted face`, `asymmetrical eyes`, `dead eyes`, `bad teeth` | S6 人物の不自然さ |
| 不要物 | `text`, `watermark`, `signature`, `logo`, `username` | S8 背景の文字崩壊・透かし |
| 質感過剰 | `over processed`, `harsh lighting`, `uncanny valley`, `doll`, `mannequin` | S5 整いすぎ |

### 6-B. 実用テンプレ（複数ソースの最大公約数 / 最小版）
- **最小版（汎用）**: `blurry, low quality, watermark, text, extra fingers, mutated hands, bad anatomy, disfigured, deformed`
- **写真化 追加**: `cartoon, anime, illustration, 3d render, cgi, plastic skin, poreless skin, airbrushed`

> 【事実・クロス確認】上記コア語（extra fingers / mutated hands / bad anatomy / watermark / plastic skin / 3d render）は pxz, civitai, clickup, zsky-neg, promptsera でほぼ全社一致。**spec のネガティブ既定値はこのコアを採用**でよい。
> 【注意・★要確認】`(plastic skin:1.3)` のような**重み付け記法(`:数値`)はStable Diffusion系の固有記法**。Flux/Imagen/GPT Image 等では効かない/不要なことが多い→**汎用版は重み無しのカンマ区切り**を基本に、重み記法は §7 の注記レベルに置く。

---

## 7. モデル固有記法の注記（モデル非依存原則の例外として隔離）

> overview/spec の原則＝**モデル非依存の汎用プロンプト**。以下は「使うAIによっては効く上乗せ」＝**注記レベル**で区別。本体プリセットには混ぜない。

| モデル/系統 | 記法 | 内容 | 注意 |
|---|---|---|---|
| **Midjourney** | `--ar 16:9` / `--aspect` | アスペクト比指定（デフォルト1:1） | MJ専用。他モデルは width/height や別UIで指定 |
| **Midjourney** | `--no item1, item2` | ネガティブ（「これを描くな」） | MJ専用。SD/Flux/Imagen は別欄・別記法 |
| **Stable Diffusion 系** | `(word:1.3)` | 強調の重み付け | SD系専用。Flux/Imagen/GPT Image では基本無効 |
| **Flux** | width/height（32の倍数, 256–1440）/ 平文重視 | 比率は実数で。**MJ記法を渡すと逆に劣化**＝平易な英語の自然文が良い | 技術的指定に強く反応。`--ar` 等は付けない |
| **Imagen（Google）** | 自然文＋ `generationConfig`（aspectRatio / negativePrompt 等） | **完全な文章**で書くと強い。形容詞/副詞を厚く | パラメータはAPI/UI側。プロンプト文に `--` 記法は不要 |
| **GPT Image 系** | 自然文・会話的指定 | 文章での指示に強い | 重み記法・MJ記法は不要 |

> 【事実】「Flux に Midjourney 記法を渡すと平文より悪化」（skywork/myaiforce 系）「Imagen は完全文＋豊富な形容詞」（Google公式 ai.google.dev）。【解釈】**本ツールの本体出力＝モデル非依存の自然文＋カンマ区切り語彙**を主に、アスペクト比とネガティブは「お使いのAIの記法に合わせて」と**注記で逃がす**のが安全（overview §4-2 参考AI注記と整合）。

---

## 8. spec化に向けた論点・不足・★要確認

### 8-1. spec で確定すべき設計論点（craft→プリセット変換）
1. **日英プリセット辞書の対構造**（Mane評価§1の唯一の実装注意）: 各回答キーに「日本語文／英語文」を**対で**持つ。本書の日英語彙表をそのまま辞書の種にできる。
2. **段5の境界整理**: レンズ/絞り（§3-D）を段5（質感）と段6（カメラ）のどちらに置くか。本書では光学＝段5寄り・配置＝段6寄りで分けたが、UXで1段にまとめる選択肢も。
3. **必須コア vs 任意深掘りの割当**（Mane条件②＝縦の深さの天井）: 本書の「必須プリセット」候補＝
   - 段4光: 方向＋時間帯/天候＋硬軟（3点）
   - 段5質感: film grain＋質感語＋（任意で機種/フィルム銘柄）
   - 段6構図: 三分割＋被写体位置＋余白
   - 段7不完全さ: candid＋生活感
   - 段2/7人物（人物選択時のみ）: 毛穴＋目反射＋非対称＋candid表情＋年齢
   - 段8ネガティブ: §6-B コア＋写真化追加
4. **ネガティブ非対応AIへの配慮**（overview ★E）: §6 は別欄提示＋「対応AIのみ有効」注記で足りる（本リサーチで裏付け）。
5. **機種名/フィルム銘柄の扱い**: モデル非依存原則とぶつかる上乗せ。**任意トグル**に留めるのが安全（必須コアには入れない）。

### 8-2. 不足・薄い領域（正直な未達）
- **①画像タイプ別の自然さ基準**（写真/イラスト/3D）が薄い。本ツールは黒田さん軸＝写真が主なので実害は小だが、「イラスト選択時のAI臭消し」は spec で別途要検討（本リサーチは写真に厚く寄せた）。
- **⑨アスペクト比**は技法ソースが薄い（実務デフォルトの問題）。Web用途デフォルト（ヒーロー=16:9等）は overview 既定で足りる。
- **実機での効き確認は未実施**（本フェーズはWeb収集のみ）。Mane評価§3＝「机上仕様→実機書き換え」教訓の再発防止には、**1カテゴリ（光）を縦スライスで先に実生成して効くか当てる**のが次の必須ステップ。

### 8-3. ★要確認（黒田さん / spec着手前）
- **★1（最重要）**: 本書の手法は全てWeb記事ベース＝**実機で効くかは未検証**。Mane条件①の通り「光1カテゴリを縦スライスで実生成検証→対応表の型を確定→横展開」を spec フェーズで黒田さん工数（数時間〜1日）を確保して実施してよいか。ここを省くと「効かないプロンプト」公開リスク。
- **★2**: 機種名/フィルム銘柄（Kodak Portra 等）を**任意トグル**として載せるか、モデル非依存徹底で**外す**か。記事では効果ありとされるが固有性が高い。
- **★3**: ネガティブの重み記法（`:1.3`）は SD系専用。**汎用版は重み無し**で確定してよいか（§6注記）。

---

## 主要出典一覧（クロスチェック元）

**AI臭の症状 / 実写化（英語）**
- CyberGuy: https://cyberguy.com/ai/10-telltale-signs-ai-created-images/
- Rob Laughter (Medium, 14 signs): https://roblaughter.medium.com/is-that-image-ai-here-are-14-telltale-signs-to-look-for-d40e5cff2d0a
- ZSky AI (why images look fake): https://zsky.ai/blog/why-your-ai-images-look-fake
- ArtSmart (photorealistic prompts 2026): https://artsmart.ai/blog/ai-image-prompts-photorealistic/
- AI Video Bootcamp (ultimate guide 2026): https://aivideobootcamp.com/blog/photorealistic-ai-prompts-guide-2026/
- Overchat AI Hub: https://overchat.ai/ai-hub/how-to-make-realistic-ai-photos
- Promptaa (7 keywords less fake): https://promptaa.com/blog/prompt-key-words-to-make-images-less-fake-looking
- Nightjar (product photo patterns): https://nightjar.so/blog/prompt-patterns-realistic-ai-product-photos
- Media.io (analog/film looks): https://www.media.io/ai-prompts/analog-photography-ai-prompt.html

**構図**
- Medium (Prashanthi nrao, rule of thirds): https://nrao-prashanthi.medium.com/19-rule-of-thirds-framing-negative-space-for-ai-generated-images-338bd4123677
- Hailuo (composition/center bias): https://hailuoai.video/pages/knowledge/composition-prompts-rule-of-thirds-center-frame
- ZSky (composition tips): https://zsky.ai/blog/ai-composition-tips
- ai-prompt.jp (composition): https://service.ai-prompt.jp/en/article/prompt-composition/

**人物リアリティ**
- Fiddl (portrait prompts): https://fiddl.art/blog/en/ai-portrait-prompts
- Media.io (realistic skin): https://www.media.io/image-effects/realistic-ai-skin-prompt.html
- Vofy (photorealistic portraits): https://www.vofy.art/blog/10-best-prompts-photorealistic-ai-portraits

**ネガティブプロンプト**
- Civitai: https://civitai.com/articles/3885/negative-prompts
- pxz.ai (150+ negatives): https://pxz.ai/blog/best-negative-prompts-for-realistic-ai-images
- ClickUp (120+ SD negatives): https://clickup.com/blog/stable-diffusion-negative-prompts/
- ZSky (negative prompts list): https://zsky.ai/ai-art-negative-prompts
- PromptsEra (fix bad hands): https://promptsera.com/fix-bad-hands-stable-diffusion/

**モデル固有記法**
- Midjourney 公式 Aspect Ratio: https://docs.midjourney.com/hc/en-us/articles/31894244298125-Aspect-Ratio
- Midjourney 公式 Parameter List: https://docs.midjourney.com/hc/en-us/articles/32859204029709-Parameter-List
- Black Forest Labs (Flux2 prompting): https://docs.bfl.ml/guides/prompting_guide_flux2
- Skywork (Flux prompting guide): https://skywork.ai/blog/flux-prompting-ultimate-guide-flux1-dev-schnell/
- Google AI (Imagen prompt guide): https://ai.google.dev/gemini-api/docs/imagen#imagen-prompt-guide
- MyAIForce (Flux vs MJ): https://myaiforce.com/flux-vs-midjourney/
- DesignHero (Flux & MJ realism prompts): https://blog.designhero.tv/ai-art-direction-prompts-flux-midjourney/

**日本語ソース**
- note 資料作成研究所（人物リアル化）: https://note.com/siryosakusei_up/n/ne8b0bdd0031a
- LUFTMEDIA（リアルな質感）: https://www.luft.co.jp/media/ai-image-generation-real/
- note さきすた（見分けつかない10選 / Nano Banana Pro）: https://note.com/sakisuta/n/nc4ab4eee1eae
- くろくまそふと（AIっぽさ改善 / SD）: https://kurokumasoft.com/2023/05/09/howto-remove-ai-like-style/

---

## 検証済み

- **検証済み: 出典・クロスチェック** — 主要手法に全て出典URLを付与。最重要手法（光の方向指定／film grain／三分割で center bias を崩す／natural asymmetry+毛穴／ネガティブcore語）はいずれも**3ソース以上でクロスチェック**（各表の「出典数」列に明記）。
- **検証済み: 事実と推測の区別** — 記事の記述は【事実】、Mado のマッピング/解釈は【解釈】で全て区別。§0 凡例で明示。
- **検証済み: 黒田さん軸（実写・カメラ写真に近づける）** — §3 を最厚で構成。光(3-B)・フィルム粒状感/質感(3-C)・レンズ/被写界深度(3-D)・不完全さ/candid(3-F)・人物の毛穴/非対称(§5)＝段4〜7を◎厚で収集。日本語ソース(note/luft)が「実際に撮った日常写真」軸を補強。
- **検証済み: モデル非依存と固有記法の区別** — 本体プリセットはモデル非依存の自然文＋カンマ区切り語彙を主とし、Midjourney `--ar`/`--no`・SD重み記法・Flux/Imagen差は §7 に隔離して注記レベルで扱った。
- **未達: 実機での効き確認** — 本フェーズはWeb収集のみ。記事ベースの手法が実際に効くかは未検証（§8-3 ★1）。spec フェーズで「光1カテゴリ縦スライス実生成検証」が必須（Mane条件①の再発防止策）。
- **未達（軽微）: 画像タイプ別（イラスト/3D）の自然さ基準** — 写真軸に厚く寄せたため①が薄い。黒田さん軸＝写真主のため実害小だが spec で別途要検討（§8-2）。
