// =====================================================================
// インラインSVGアイコン（Lucide ライク / 外部依存を増やさない）
//   §7 言語不問UI: 6種別をラベル文字だけに頼らずアイコン＋色で識別できるようにする。
//   stroke 系・currentColor 追従（本体トーン: 線の細さで静けさを出す）。
//   返すのは SVG マークアップ文字列。装飾目的のため aria-hidden を付ける
//   （意味は隣接テキストラベルが担う＝A11y）。
// =====================================================================

const PATHS = {
  // 背景・装飾＝山
  mountain: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
  // 写真(重要)＝人物
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>',
  // 写真(一般)＝画像
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  // イラスト＝パレット
  palette:
    '<circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1-.3-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16c3.3 0 6-2.7 6-6 0-4.4-4.5-8-10-8z"/>',
  // アイコン・ロゴ＝星
  star: '<path d="M12 2l2.9 6.3L22 9.3l-5 4.7 1.2 6.8L12 17.8 5.8 20.8 7 14 2 9.3l7.1-1z"/>',
  // スクショ・UI＝モニタ
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  // 汎用
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  upload: '<path d="M12 21V9M7 14l5-5 5 5M5 3h14"/>',
  warning: '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17.5v.5"/>',
  check: '<path d="M4 12l5 5L20 6"/>',
  // 開閉トグル用シェブロン（既定で右向き ▶。開いたら CSS の transform で下向き ▼ に回す）
  chevron: '<path d="M9 6l6 6-6 6"/>',
  archive: '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M9 12h6"/>',
};

// アイコンキー → SVG 文字列。size は px、塗りは fill 系のみ filled で。
export function iconSvg(key, { size = 20, filled = false } = {}) {
  const d = PATHS[key] || PATHS.image;
  const stroke = filled ? "none" : "currentColor";
  const fill = filled ? "currentColor" : "none";
  return (
    `<svg class="ic-icon" width="${size}" height="${size}" viewBox="0 0 24 24" ` +
    `fill="${fill}" stroke="${stroke}" stroke-width="1.75" stroke-linecap="round" ` +
    `stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`
  );
}
