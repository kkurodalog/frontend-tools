// =====================================================================
// 汎用ユーティリティ（言語不問UI 用の数値整形 / ファイル名処理）
// =====================================================================

// バイト数を人間可読に（1.2MB / 340KB）。言語非依存で読める単位表記。
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// 削減率（-72% 形式）。after > before の場合は +x%（増えた）も表現。
export function reductionPercent(before, after) {
  if (!before) return "";
  const diff = ((after - before) / before) * 100;
  const rounded = Math.round(diff);
  return rounded <= 0 ? `${rounded}%` : `+${rounded}%`;
}

// 出力拡張子に追従したファイル名（D10: photo.png → photo.webp）。
export function swapExtension(filename, newExt) {
  const dot = filename.lastIndexOf(".");
  const base = dot >= 0 ? filename.slice(0, dot) : filename;
  return `${base}.${newExt}`;
}

// 拡張子だけ取り出す（小文字）。
export function getExtension(filename) {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot + 1).toLowerCase() : "";
}

// ZIP 内のファイル名衝突を避けるためのユニーク化（同名は -1, -2 を付与）。
export function makeUniqueName(name, usedSet) {
  if (!usedSet.has(name)) {
    usedSet.add(name);
    return name;
  }
  const dot = name.lastIndexOf(".");
  const base = dot >= 0 ? name.slice(0, dot) : name;
  const ext = dot >= 0 ? name.slice(dot) : "";
  let i = 1;
  let candidate = `${base}-${i}${ext}`;
  while (usedSet.has(candidate)) {
    i += 1;
    candidate = `${base}-${i}${ext}`;
  }
  usedSet.add(candidate);
  return candidate;
}
