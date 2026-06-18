// =====================================================================
// 自動種別推測ロジック（D2 / spec §5）
//   ON/OFF トグル（初期値=ON）。推測は「初期値」であり、必ず手動で直せる（既存ラジオで上書き）。
//   ★精度は追わない（当たればラッキー設計）。推測根拠を各画像に small で表示する。
//   ★②写真(重要)は機械推測しない（「重要かどうか」は機械判定不能＝誤推測が信頼毀損になる / spec §5-2 注記）。
//     推測は ①③④⑤⑥ の範囲に留める。②はユーザーが手動で選ぶ前提。
//   特徴量は image-ops.readImageMeta が縮小サムネ上で軽量抽出済み（重い解析はしない / spec §5-1）。
// =====================================================================

// §5-2 デフォルト割当ヒューリスティック（上から優先）の閾値（実機調整できるよう定数化）。
const ICON_MAX_EDGE = 512; // 「長辺が小さい」目安（アイコン候補）
const BG_MIN_EDGE = 1600; // 「横長大サイズ」目安（背景候補・長辺がこれ超）
const SCREEN_ASPECT_MIN = 1.5; // スクショの「画面的」アスペクト比下限（≒16:10〜16:9 近辺）
const SCREEN_ASPECT_MAX = 1.9;
const BG_ASPECT_MIN = 1.6; // 背景の「アスペクト比が広い」目安

// meta（image-ops.readImageMeta の戻り値）から推測種別 id を返す。
//   戻り値の種別 id は presets.js の id（"bg"/"photo"/"illust"/"icon"/"screenshot"）。②(photo-key)は返さない。
//   meta が不足（推測不能）なら無難なフォールバック ③ photo を返す。
export function inferPresetId(meta) {
  return inferWithReason(meta).presetId;
}

// 推測種別 id ＋ 根拠（画面に small 表示する短文 / 言語不問UI と整合）。
//   { presetId, reason } を返す。reason は「（推測: 透過＋小サイズ→アイコン）」のような短い日本語。
export function inferWithReason(meta) {
  if (!meta || !meta.width || !meta.height) {
    return { presetId: "photo", reason: "推測できなかったため「写真（一般）」にしました" };
  }
  const longEdge = meta.longEdge || Math.max(meta.width, meta.height);
  const aspect = meta.aspect || (meta.height ? meta.width / meta.height : 1);
  const hasAlpha = Boolean(meta.hasAlpha);
  const fewColors = !meta.manyColors; // 少色（フラット）か
  const format = meta.format || "other";

  // 1) 透過あり ＆ 長辺が小さい ＆ 少色 → ⑤ アイコン・ロゴ
  if (hasAlpha && longEdge <= ICON_MAX_EDGE && fewColors) {
    return { presetId: "icon", reason: "推測: 透過＋小サイズ→アイコン・ロゴ" };
  }
  // 2) 透過あり ＆ 少色（フラット） → ④ イラスト・図版
  if (hasAlpha && fewColors) {
    return { presetId: "illust", reason: "推測: 透過＋少ない色数→イラスト・図版" };
  }
  // 3) 入力 PNG ＆ 多色 ＆ アスペクト比が画面的 → ⑥ スクショ・UI
  if (format === "png" && meta.manyColors && aspect >= SCREEN_ASPECT_MIN && aspect <= SCREEN_ASPECT_MAX) {
    return { presetId: "screenshot", reason: "推測: PNG＋画面比率→スクショ・UI" };
  }
  // 4) 入力 JPEG ＆ 横長大サイズ ＆ アスペクト比が広い → ① 背景・装飾
  if (format === "jpeg" && longEdge > BG_MIN_EDGE && aspect >= BG_ASPECT_MIN) {
    return { presetId: "bg", reason: "推測: 大きな横長写真→背景・装飾" };
  }
  // 5) 入力 JPEG（一般的な写真サイズ） → ③ 写真(一般)
  if (format === "jpeg") {
    return { presetId: "photo", reason: "推測: 写真→写真（一般）" };
  }
  // 6) 上記いずれにも当てはまらない → ③ 写真(一般)（無難なフォールバック）
  return { presetId: "photo", reason: "推測: 写真（一般）" };
}
