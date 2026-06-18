// =====================================================================
// 画像仕分け圧縮くん — 6種別プリセット ⇄ パラメータ確定表（01_spec §1）
//   数値は「実機調整」前提のため、本ファイルに集約して1か所で調整できるようにする。
//   ★UI再設計（2026-06-17 / spec §0・§1-1・§4）:
//     - 種別＝ラジオボタン（一括＋個別）。品質値・長辺px は内部固定（UI非表示）。
//     - 出力フォーマット＝チェックボックス（複数選択可）。種別ごとの推奨フォーマットを既定チェック。
//     - 全フォーマット（WebP/AVIF/PNG/JPEG）は実エンコード稼働済み（2026-06-18・段階稼働は撤去）。
//   ★PNG: ⑤⑥は PNG 可逆(oxipng)。④の PNG 経路は減色（256色）→ oxipng 可逆を通す（pngReduce フラグ）。
//   ★2026-06-18 既定チェック確定（黒田さん）: ①WebP / ②③AVIF+WebP+JPEG / ④WebP+PNG(減色) / ⑤⑥PNG(可逆)。
//     ②③は AVIF を既定に含む＝種別選択時に「AVIFは時間がかかる」注記が標準表示・AVIF不可は WebP 降格で吸収。
// =====================================================================

// ④イラストの PNG 経路の減色色数（spec §1 / §3-d: 256色・実機調整）。
//   ★注意: これは ④の PNG 出力に限定した「減色」であり、Stage4 の自動種別推測で使う
//     軽量な色数判定（spec §5-1）とは別物。混同しないこと。
export const ILLUST_PNG_COLORS = 256;

// 出力フォーマット識別子（チェックボックスの選択肢キー）。
//   ※「種別」ではなく「出力形式」。種別が品質値・長辺px を内部で決め、フォーマットは出力する器を決める。
export const FORMAT = {
  WEBP: "webp", // WebP（非可逆/可逆 を種別側の lossless フラグで切替）
  AVIF: "avif", // AVIF
  PNG_LOSSLESS: "png-lossless", // PNG可逆（oxipng）/ ④は減色経路
  KEEP_JPEG: "keep-jpeg", // 元形式（JPEG）穏やか最適化（D7・toBlob 0.82）
};

// =====================================================================
// 出力フォーマット定義（チェックボックスUI）
//   全フォーマット（WebP/AVIF/PNG/JPEG）は実エンコード稼働済み（2026-06-18）。
//   段階的有効化（旧 spec §3-c の stage/enabled「準備中」disabled）は役目を終えたため撤去。
//   ext / mime: 出力ファイルの拡張子・MIME（D10 のファイル名追従に使う）。
// =====================================================================
export const FORMAT_DEFS = {
  [FORMAT.WEBP]: { key: FORMAT.WEBP, label: "WebP", ext: "webp", mime: "image/webp" },
  [FORMAT.AVIF]: { key: FORMAT.AVIF, label: "AVIF", ext: "avif", mime: "image/avif" },
  [FORMAT.PNG_LOSSLESS]: { key: FORMAT.PNG_LOSSLESS, label: "PNG", ext: "png", mime: "image/png" },
  // 元形式（JPEG）= D7。ラベルは実挙動（JPEG 穏やか最適化）が分かる正直な文言にする。
  [FORMAT.KEEP_JPEG]: { key: FORMAT.KEEP_JPEG, label: "JPEG", ext: "jpg", mime: "image/jpeg" },
};

// チェックボックスに並べる順（左→右）。
export const FORMAT_ORDER = [FORMAT.WEBP, FORMAT.AVIF, FORMAT.PNG_LOSSLESS, FORMAT.KEEP_JPEG];

// 6種別プリセット定義（01_spec §1 の確定表を実装定数として正確に落とす）。
//   id: 種別キー / num: 表示用番号(①〜⑥) / label: 日本語ラベル(将来英語併記しやすいよう単独管理)
//   desc: 画面表示の説明文（spec §1-2 の確定文言・そのまま）
//   recommendedFormats: 推奨フォーマット（既定チェック / spec §1「推奨フォーマット」列）
//   quality: WebP quality(0-100・内部固定・UI非表示) / maxEdge: 長辺上限px(null=リサイズしない・内部固定)
//   avifQuality: AVIF 出力時の quality（種別×フォーマットで内部固定 / spec §1-1）
//   lossless: true=可逆経路（WebP lossless / PNG可逆） / icon: 言語不問UI アイコンキー
export const PRESETS = [
  {
    id: "bg",
    num: "①",
    label: "背景・装飾",
    desc: "ページの背景やテクスチャなど、主役ではない大きな画像。容量を最優先で強く圧縮します。",
    recommendedFormats: [FORMAT.WEBP],
    quality: 55, // §1 ① WebP q=55
    avifQuality: 45, // ① AVIF q=45（Stage2）
    maxEdge: 1920,
    lossless: false,
    icon: "mountain",
  },
  {
    id: "photo-key",
    num: "②",
    label: "写真（重要）",
    desc: "顔写真・人物・商品など、きれいに見せたい写真。画質を優先して圧縮します。",
    // ② 既定チェック=AVIF＋WebP＋JPEG（2026-06-18 黒田さん確定）。AVIF=最小容量・WebP=互換・JPEG=フォールバック。
    //   AVIF不可環境では既存の WebP 自動降格が働く（WebP が既定にあるため実害なし／S-1・S-3）。
    recommendedFormats: [FORMAT.AVIF, FORMAT.WEBP, FORMAT.KEEP_JPEG],
    quality: 85, // ② WebP q=85
    avifQuality: 63, // ② AVIF q=63（Stage2）
    maxEdge: 2560,
    lossless: false,
    icon: "user",
    manualOnly: true, // ②は自動推測の対象外（手動選択前提）。Stage4 の自動推測でも候補にしない
  },
  {
    id: "photo",
    num: "③",
    label: "写真（一般）",
    desc: "記事中の説明写真や風景など、ふつうの写真。画質と容量のバランスをとります。",
    // ③ 既定チェック=AVIF＋WebP＋JPEG（2026-06-18 黒田さん確定）。②と同方針（AVIF不可は WebP 降格で吸収）。
    recommendedFormats: [FORMAT.AVIF, FORMAT.WEBP, FORMAT.KEEP_JPEG],
    quality: 72, // ③ WebP q=72
    avifQuality: 52, // ③ AVIF q=52（Stage2）
    maxEdge: 1600,
    lossless: false,
    icon: "image",
  },
  {
    id: "illust",
    num: "④",
    label: "イラスト・図版",
    desc: "フラットな塗りの絵・図解・グラフ。色数が少なく輪郭がはっきりした画像。",
    recommendedFormats: [FORMAT.WEBP, FORMAT.PNG_LOSSLESS], // WebP＋PNG(減色256色・oxipng)
    quality: 80, // ④ WebP q=80
    avifQuality: 60,
    maxEdge: 1600,
    lossless: false,
    icon: "palette",
    pngReduce: true, // ④の PNG 出力は減色（ILLUST_PNG_COLORS 色）→ oxipng 可逆（spec §1 ④）。
  },
  {
    id: "icon",
    num: "⑤",
    label: "アイコン・ロゴ",
    desc: "UIアイコン・ロゴ・線画など、小さくて輪郭が大切な画像。にじませず劣化なしで圧縮します。",
    recommendedFormats: [FORMAT.PNG_LOSSLESS], // 推奨=PNG可逆(oxipng レベル2)。Stage3 で本実装。
    quality: 100, // 可逆（quality 無効）
    avifQuality: 70,
    maxEdge: null, // リサイズしない（透過保持・元寸維持）
    lossless: true,
    icon: "star",
    advise: "svg", // §4-4 D5: 「SVGにできませんか?」助言バナー
  },
  {
    id: "screenshot",
    num: "⑥",
    label: "スクショ・UI",
    desc: "画面キャプチャや管理画面など、文字や線がはっきり写った画像。文字をにじませず劣化なしで圧縮します。",
    recommendedFormats: [FORMAT.PNG_LOSSLESS], // 推奨=PNG可逆(oxipng レベル2)。Stage3 で本実装。
    quality: 100, // 可逆
    avifQuality: 70,
    maxEdge: null, // リサイズしない（等倍書き出し前提）
    lossless: true,
    icon: "monitor",
  },
];

// id → preset の引きやすいマップ。
export const PRESET_MAP = Object.fromEntries(PRESETS.map(p => [p.id, p]));

// 既定の選択種別（一括ラジオの初期選択）。
export const DEFAULT_PRESET_ID = "photo";

// 種別の推奨フォーマットをそのまま初期チェック状態として返す（全フォーマット稼働済み）。
//   ①WebP / ②③AVIF+WebP+JPEG / ④WebP+PNG(減色) / ⑤⑥PNG(可逆)（2026-06-18 確定）。
export function initialCheckedFormats(preset) {
  return preset.recommendedFormats.slice();
}

// =====================================================================
// 入力ガード定数（01_spec §6-1 / D8。すべて実機調整できるよう定数化）
// =====================================================================
export const LIMITS = {
  maxFiles: 30, // 一度に処理する枚数の目安（超過分は警告のうえ受けるが推奨外）
  maxFileBytes: 25 * 1024 * 1024, // 1枚あたり 25MB 目安（超過1枚だけスキップ）
  // 受入形式（HEIC は非対応＝D1）。<input accept> と一致させる（spec §6-1 必須形式）。
  acceptMime: ["image/png", "image/jpeg", "image/webp"],
  acceptExt: ["png", "jpg", "jpeg", "webp"], // type が空のときの拡張子フォールバック
  // 注: GIF静止画/AVIF 入力は spec §6-1 で「任意・優先度低」。Stage1 のエンコード経路は
  //     WebP/keep のみで、アニメGIF は非対応（spec §6-1: 静止画のみ）。受入判定を
  //     accept 属性に揃え、GIF/AVIF は当該1枚だけスキップ＋案内する（HEIC=D1 と同様の扱い）。
  //     GIF/AVIF 受入は Stage2 以降で検討する。
};
