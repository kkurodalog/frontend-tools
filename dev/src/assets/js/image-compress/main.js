// =====================================================================
// 画像仕分け圧縮くん — メイン制御（Stage3 / WebP・AVIF・PNG(oxipng)・JPEG 経路・UI再設計版）
//   役割: 投入 → 種別割当（ラジオ・一括/個別）→ 出力フォーマット選択（チェックボックス・複数可）
//         → 逐次エンコード（1枚×複数フォーマット）→ 容量・削減率の数値表示 → 個別DL / 一括ZIP。
//   ★操作軸は2つだけ（spec §0）: ①種別ラジオ（圧縮の意図） ②出力フォーマットのチェックボックス。
//     品質値・長辺px はユーザーに見せず、種別選択で内部固定値が自動適用される（spec §1-1）。
//   ★逐次処理: items を1枚ずつ直列にエンコード（Worker 共有）。1枚の中の複数フォーマットも逐次。
//   ★1枚失敗しても try/catch で次へ（当該1枚だけエラー表示・全体は止めない / §3-b）。
//   ★複数出力: 1入力 → 選んだフォーマット数だけ出力。ZIP に全て同梱。
//     ファイル名は元名維持＋各拡張子追従（同名でも拡張子違いで衝突しない / D10）。
//   自動種別推測（Stage4）は後続。差し込めるよう関数を分離している。
// =====================================================================
import {
  PRESETS,
  PRESET_MAP,
  DEFAULT_PRESET_ID,
  FORMAT,
  FORMAT_DEFS,
  FORMAT_ORDER,
  LIMITS,
  ILLUST_PNG_COLORS,
  isFormatEnabled,
  initialCheckedFormats,
} from "./presets.js";
import { prepareRgba, readImageMeta } from "./image-ops.js";
import { inferWithReason } from "./inference.js";
import { encodeWebpInWorker, encodeAvifInWorker, encodePngInWorker, encodeJpegInWorker } from "./worker-client.js";
import { zipSync } from "fflate";
import { formatBytes, reductionPercent, swapExtension, getExtension, makeUniqueName } from "./util.js";
import { iconSvg } from "./icons.js";

let itemSeq = 0;
// item: { id, file, name, presetId, formats(string[]), meta, results(Result[]), error, el }
//   Result: { buffer, ext, mime, format, lossless }
const items = [];
let isProcessing = false;

// 一括の出力フォーマット選択状態（全体の既定）。種別が変わると推奨フォーマットに追従する。
//   行別フォーマット上書き（spec §3-b）は本実装済み: 各 item は自前の item.formats を持ち、
//   空のカードはこの一括 bulkFormats にフォールバックする（encodeItemFormats 参照）。
let bulkPresetId = DEFAULT_PRESET_ID;
let bulkFormats = []; // 現在チェックされている出力フォーマット（FORMAT.* の配列）

// ---- 自動種別推測の ON/OFF（D2 / spec §5）----
//   初期値=ON。ON のとき各画像にデフォルト種別を初期割当（meta 解決後に inferWithReason）。
//   OFF のときは従来挙動（一括/個別ラジオでユーザーが割り当て・bulkPresetId を初期種別にする）。
//   推測結果は必ず手動で直せる（既存ラジオで上書き）。精度は追わない。
let autoInfer = true;

// ---- AVIF 降格状態（Should S-3 / S-2）----
//   この環境で AVIF エンコードが不可（Safari 等で WASM 初期化失敗 / MT 経路の SharedArrayBuffer 不在）と
//   判明したら、当該フォーマットを WebP に自動降格する。一度不可と分かったら以降の画像で AVIF を再試行せず、
//   直接 WebP で出す（無駄な失敗・固まりを避ける）。
let avifUnavailable = false;
// 降格通知の集約（S-2: 複数枚で連打・点滅させない）。1 回の実行で何枚 WebP に降格したかを溜め、
//   実行完了時に「N 枚を WebP で出力しました」と 1 回だけ通知する。
let avifDowngradeCount = 0;

// ---- 受入判定（HEIC 非対応 = D1 / 形式・サイズガード = D8） ----
function classifyFile(file) {
  const ext = getExtension(file.name);
  if (ext === "heic" || ext === "heif" || file.type === "image/heic" || file.type === "image/heif") {
    return { accepted: false, reason: "HEIC は未対応です。事前に JPEG へ書き出してから投入してください。" };
  }
  if (ext === "gif" || file.type === "image/gif") {
    return { accepted: false, reason: "GIF は未対応です（アニメGIF はスコープ外・静止画のみ対応予定）。PNG / JPEG / WebP でお試しください。" };
  }
  const okMime = LIMITS.acceptMime.includes(file.type);
  const okExt = LIMITS.acceptExt.includes(ext);
  if (!okMime && !okExt) {
    return { accepted: false, reason: "対応していない形式です（PNG / JPEG / WebP）。" };
  }
  if (file.size > LIMITS.maxFileBytes) {
    return { accepted: false, reason: `サイズが大きすぎます（${formatBytes(LIMITS.maxFileBytes)} まで）。` };
  }
  return { accepted: true };
}

// ---- DOM 参照（init で束ねる） ----
const dom = {};

export function initImageCompress() {
  const root = document.querySelector("[data-ic-root]");
  if (!root) return;

  dom.root = root;
  dom.dropzone = root.querySelector("[data-ic-dropzone]");
  dom.fileInput = root.querySelector("[data-ic-file-input]");
  dom.bulk = root.querySelector("[data-ic-bulk]");
  dom.bulkTypeGrid = root.querySelector("[data-ic-bulk-type-grid]");
  dom.bulkFormatGrid = root.querySelector("[data-ic-bulk-format-grid]");
  dom.autoToggle = root.querySelector("[data-ic-auto-toggle]");
  dom.list = root.querySelector("[data-ic-list]");
  dom.runBtn = root.querySelector("[data-ic-run]");
  dom.zipBtn = root.querySelector("[data-ic-zip]");
  dom.progress = root.querySelector("[data-ic-progress]");
  dom.progressBar = root.querySelector("[data-ic-progress-bar]");
  dom.progressText = root.querySelector("[data-ic-progress-text]");
  dom.notice = root.querySelector("[data-ic-notice]");

  bulkFormats = initialCheckedFormats(PRESET_MAP[bulkPresetId]);
  buildBulkType();
  buildBulkFormat();
  bindDropzone();
  bindControls();
  bindAutoToggle();
  updateActionState();
}

// =====================================================================
// 種別ラジオUI（一括・個別で共通の見た目 / spec §4-1-2・§7-1 言語不問）
//   fieldset/legend ＋ radio ＋ <label for> 紐付け ＋ アイコン ＋ §1-2 の説明文。
//   name でグループを分け、キーボード（矢印キー）でラジオ移動できる（ネイティブ挙動）。
// =====================================================================
function radioGroupHtml(groupName, selectedId, idPrefix) {
  return PRESETS.map(p => {
    const inputId = `${idPrefix}-${p.id}`;
    const checked = p.id === selectedId ? "checked" : "";
    return `
      <div class="c-ic-typecard">
        <input class="c-ic-typecard__radio u-visually-hidden" type="radio" name="${groupName}" id="${inputId}" value="${p.id}" ${checked} data-ic-type-radio />
        <label class="c-ic-typecard__label" for="${inputId}">
          <span class="c-ic-typecard__icon" aria-hidden="true">${iconSvg(p.icon, { size: 22 })}</span>
          <span class="c-ic-typecard__text">
            <span class="c-ic-typecard__title">${p.num} ${escapeHtml(p.label)}</span>
            <span class="c-ic-typecard__desc">${escapeHtml(p.desc)}</span>
          </span>
        </label>
      </div>`;
  }).join("");
}

function buildBulkType() {
  if (!dom.bulkTypeGrid) return;
  dom.bulkTypeGrid.innerHTML = radioGroupHtml("ic-bulk-type", bulkPresetId, "ic-bulk-type");
  dom.bulkTypeGrid.addEventListener("change", e => {
    const radio = e.target.closest("[data-ic-type-radio]");
    if (!radio) return;
    bulkPresetId = radio.value;
    // 種別変更で推奨フォーマットに既定チェックを追従（spec §1-1）。一括＝全 item へ適用。
    bulkFormats = initialCheckedFormats(PRESET_MAP[bulkPresetId]);
    syncBulkFormatChecks();
    items.forEach(item => applyBulkToItem(item, { fromBulkType: true }));
  });
}

// =====================================================================
// 出力フォーマット チェックボックスUI（複数選択可 / spec §4-1-4・§3-c 段階的有効化）
//   未稼働フォーマット（AVIF=Stage2 / PNG=Stage3）は disabled＋「準備中」でチェック不可。
// =====================================================================
function formatGroupHtml(idPrefix, checkedFormats) {
  return FORMAT_ORDER.map(key => {
    const def = FORMAT_DEFS[key];
    const inputId = `${idPrefix}-${key}`;
    const enabled = def.enabled;
    const checked = enabled && checkedFormats.includes(key) ? "checked" : "";
    const disabled = enabled ? "" : "disabled";
    const stateClass = enabled ? "" : "is-soon";
    const soon = enabled ? "" : `<span class="c-ic-fmtcard__soon">準備中</span>`;
    return `
      <div class="c-ic-fmtcard ${stateClass}">
        <input class="c-ic-fmtcard__check u-visually-hidden" type="checkbox" id="${inputId}" value="${key}" ${checked} ${disabled} data-ic-format-check />
        <label class="c-ic-fmtcard__label" for="${inputId}">
          <span class="c-ic-fmtcard__check-box" aria-hidden="true">${iconSvg("check", { size: 14 })}</span>
          <span class="c-ic-fmtcard__ext">${def.label}</span>
          ${soon}
        </label>
      </div>`;
  }).join("");
}

function buildBulkFormat() {
  if (!dom.bulkFormatGrid) return;
  dom.bulkFormatGrid.innerHTML = formatGroupHtml("ic-bulk-fmt", bulkFormats);
  dom.bulkFormatGrid.addEventListener("change", e => {
    const check = e.target.closest("[data-ic-format-check]");
    if (!check) return;
    const key = check.value;
    if (check.checked) {
      if (!bulkFormats.includes(key)) bulkFormats.push(key);
    } else {
      bulkFormats = bulkFormats.filter(f => f !== key);
    }
    items.forEach(item => applyBulkToItem(item));
    updateActionState();
  });
}

// 一括のチェック状態を DOM のチェックボックスへ反映（種別変更で推奨が変わったとき）。
function syncBulkFormatChecks() {
  if (!dom.bulkFormatGrid) return;
  dom.bulkFormatGrid.querySelectorAll("[data-ic-format-check]").forEach(check => {
    if (check.disabled) return;
    check.checked = bulkFormats.includes(check.value);
  });
}

// ---- ドロップゾーン（D&D ＋ input file 併設 / A11y） ----
function bindDropzone() {
  const dz = dom.dropzone;
  if (!dz) return;

  ["dragenter", "dragover"].forEach(type =>
    dz.addEventListener(type, e => {
      e.preventDefault();
      dz.classList.add("is-dragover");
    }),
  );
  ["dragleave", "drop"].forEach(type =>
    dz.addEventListener(type, e => {
      e.preventDefault();
      if (type === "dragleave" && dz.contains(e.relatedTarget)) return;
      dz.classList.remove("is-dragover");
    }),
  );
  dz.addEventListener("drop", e => {
    const files = e.dataTransfer && e.dataTransfer.files;
    if (files) addFiles(files);
  });

  // キーボード操作: ドロップゾーン上で Enter/Space → file ダイアログ。
  dz.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      dom.fileInput.click();
    }
  });

  dom.fileInput.addEventListener("change", () => {
    if (dom.fileInput.files) addFiles(dom.fileInput.files);
    dom.fileInput.value = ""; // 同じファイルを連続選択できるようにリセット。
  });
}

function bindControls() {
  if (dom.runBtn) dom.runBtn.addEventListener("click", runCompression);
  if (dom.zipBtn) dom.zipBtn.addEventListener("click", downloadZip);
}

// 自動種別推測 ON/OFF トグル（D2 / spec §5）。Stage4 で実ロジックを接続して有効化する。
//   ON: 各画像に推測種別を初期割当＋根拠 small 表示（meta 解決後に適用）。手動で直せる。
//   OFF: 従来挙動（bulkPresetId を初期種別にし、推測根拠は出さない）。
function bindAutoToggle() {
  const t = dom.autoToggle;
  if (!t) return;
  t.disabled = false; // Stage1 の「準備中」disabled を解除（実ロジック接続済み）。
  t.checked = autoInfer; // 初期値 ON。
  // ラベル文言の「（準備中）」を外す（HTML 側は準備中表示なので JS で正式文言に差し替え）。
  const labelText = t.closest(".c-ic-toggle")?.querySelector("span");
  if (labelText) labelText.textContent = "種別を自動で推測";
  t.addEventListener("change", () => {
    autoInfer = t.checked;
    if (autoInfer) {
      // ON へ: 既に meta が揃っている画像へ推測を適用。未取得は meta 解決時に適用される。
      items.forEach(item => applyInferenceIfReady(item));
    } else {
      // OFF へ: 推測根拠表示を消す（種別自体はユーザーが選び直せるため変更しない＝破壊しない）。
      items.forEach(item => clearReasonHint(item));
    }
  });
}

// ---- ファイル追加 ----
function addFiles(fileList) {
  const incoming = Array.from(fileList);
  const skipped = [];

  if (items.length + incoming.length > LIMITS.maxFiles) {
    showNotice(`一度に処理する枚数は ${LIMITS.maxFiles} 枚を目安にしています。多すぎると重くなる場合があります。`, "warning");
  }

  incoming.forEach(file => {
    const verdict = classifyFile(file);
    if (!verdict.accepted) {
      skipped.push(`${file.name}: ${verdict.reason}`);
      return;
    }
    const item = {
      id: ++itemSeq,
      file,
      name: file.name,
      presetId: bulkPresetId,
      formats: bulkFormats.slice(), // 一括フォーマットのスナップショット（行別はカード個別で上書き可）
      meta: null,
      inferReason: null, // 自動推測の根拠文（ON 時のみ・small 表示）
      userPicked: false, // ユーザーが手動で種別を選んだら true（以後 ON でも推測で上書きしない）
      results: null,
      error: null,
      el: null,
    };
    items.push(item);
    renderItem(item);
    // 軽量特徴量つきの meta を取得（spec §5-1）。解決後、自動推測 ON ならデフォルト種別を初期割当。
    readImageMeta(file).then(meta => {
      item.meta = meta;
      applyInferenceIfReady(item);
    });
  });

  if (skipped.length) {
    showNotice(`次のファイルはスキップしました：\n${skipped.join("\n")}`, "warning");
  }
  // 1枚でも入ったら一括設定パネルを表示。
  if (items.length > 0 && dom.bulk) dom.bulk.hidden = false;
  updateActionState();
}

// 一括（種別・フォーマット）を item に反映して再描画。
//   ★一括の種別ラジオ操作はユーザーの明示選択 → 推測を上書きし、以後 ON でも推測で戻さない（spec §5）。
function applyBulkToItem(item, { fromBulkType = false } = {}) {
  if (fromBulkType) {
    item.userPicked = true;
    item.inferReason = null;
  }
  item.presetId = bulkPresetId;
  item.formats = bulkFormats.slice();
  item.results = null;
  item.error = null;
  renderItem(item);
}

// 個別カードで種別だけ変えたとき（フォーマットは一括を引き継ぐ）。
//   ★種別ラジオ操作では fieldset を閉じない（開閉は「種別を選択」ボタンのみ / FB-6）。
//   全再描画すると fieldset が初期 hidden に戻って閉じてしまうため、表示テキストだけ更新する。
function setItemPreset(item, presetId) {
  item.userPicked = true; // ユーザーが手動選択した → 以後 ON でも推測で上書きしない（spec §5: 手動優先）。
  item.inferReason = null; // 手動選択したら推測根拠は不要（種別はユーザーの意思に置き換わる）。
  updateReasonHint(item);
  item.presetId = presetId;
  // 種別変更時はそのカードの推奨フォーマットへ既定追従（種別⇄推奨フォーマットの整合 / FB-4）。
  //   ※その後ユーザーがカード個別にフォーマットを変えれば setItemFormat 側で尊重される。
  item.formats = initialCheckedFormats(PRESET_MAP[presetId]);
  item.results = null;
  item.error = null;
  updateCurrentTypeText(item);
  syncItemFormatChecks(item);
  updateAdviseHint(item);
  resetItemResultView(item);
}

// 自動推測を item に適用（ON ＆ meta 取得済み ＆ ユーザー未操作のときだけ）。
//   推測種別を初期割当し、根拠を small で表示する（spec §5）。必ず手動で直せる（userPicked で尊重）。
//   ★②写真(重要)は inference.js が返さない（機械推測しない / spec §5-2）。
function applyInferenceIfReady(item) {
  if (!autoInfer || !item.meta || item.userPicked) return;
  const { presetId, reason } = inferWithReason(item.meta);
  item.inferReason = reason;
  // 推測種別を初期割当（フォーマットも推奨へ追従）。renderItem 済みなら表示だけ更新する。
  item.presetId = presetId;
  item.formats = initialCheckedFormats(PRESET_MAP[presetId]);
  item.results = null;
  item.error = null;
  if (item.el) {
    syncItemTypeRadios(item);
    updateCurrentTypeText(item);
    syncItemFormatChecks(item);
    updateAdviseHint(item);
    updateReasonHint(item);
    resetItemResultView(item);
    updateActionState();
  }
}

// 推測根拠（small）を消す（OFF に切り替えたとき / spec §5: 根拠は推測 ON 時のみ表示）。
function clearReasonHint(item) {
  item.inferReason = null;
  updateReasonHint(item);
}

// カード内の種別ラジオ DOM を item.presetId に同期（自動推測で種別が変わったとき・再描画せず）。
function syncItemTypeRadios(item) {
  if (!item.el) return;
  item.el.querySelectorAll("[data-ic-card-type] [data-ic-type-radio]").forEach(radio => {
    radio.checked = radio.value === item.presetId;
  });
}

// 推測根拠 small の表示更新（差し替え／除去）。item.inferReason があれば表示、無ければ消す。
function updateReasonHint(item) {
  if (!item.el) return;
  const current = item.el.querySelector("[data-ic-current]");
  if (!current) return;
  const existing = item.el.querySelector("[data-ic-reason]");
  if (item.inferReason) {
    if (existing) {
      existing.textContent = item.inferReason;
    } else {
      current.insertAdjacentHTML("afterend", `<small class="c-ic-card__reason" data-ic-reason>${escapeHtml(item.inferReason)}</small>`);
    }
  } else if (existing) {
    existing.remove();
  }
}

// カード内フォーマット チェックボックスの DOM を item.formats に同期（再描画せず・fieldset を閉じない）。
function syncItemFormatChecks(item) {
  if (!item.el) return;
  item.el.querySelectorAll("[data-ic-card-format] [data-ic-format-check]").forEach(check => {
    if (check.disabled) return;
    check.checked = item.formats.includes(check.value);
  });
}

// ⑤SVG助言バナーの表示判定。各カードの選択種別が advise:"svg"（⑤アイコン・ロゴ）のときだけ出す（FB-2）。
//   一括ラジオではなくカード単位の選択種別で判定する。
function shouldShowAdvise(presetId) {
  return PRESET_MAP[presetId]?.advise === "svg";
}

// 既存カードの SVG 助言バナーを現在の選択種別に追従させる（再描画せず差し替え / FB-2）。
//   ⑤（advise:"svg"）選択時のみそのカードに表示。種別を他に変えたら除去する。
function updateAdviseHint(item) {
  if (!item.el) return;
  const body = item.el.querySelector(".c-ic-card__body");
  if (!body) return;
  const existing = body.querySelector("[data-ic-advise]");
  const want = shouldShowAdvise(item.presetId);
  if (want && !existing) {
    body.insertAdjacentHTML("beforeend", adviseHintHtml());
  } else if (!want && existing) {
    existing.remove();
  }
}

// カード内「種別: ②写真（重要） ／ 形式: WebP」の表示を現在の選択に追従させる（FB-5・FB-4）。
function updateCurrentTypeText(item) {
  if (!item.el) return;
  const preset = PRESET_MAP[item.presetId];
  const span = item.el.querySelector("[data-ic-current-type]");
  if (span) span.textContent = `${preset.num} ${preset.label}`;
  const fmtSpan = item.el.querySelector("[data-ic-current-fmt]");
  if (fmtSpan) fmtSpan.textContent = ` ／ 形式: ${formatsLabel(item.formats)}`;
}

// 選択中フォーマットの表示ラベル（例: "WebP・JPEG"）。0件なら "未選択"。
function formatsLabel(formats) {
  if (!formats || formats.length === 0) return "未選択";
  return formats.map(k => FORMAT_DEFS[k]?.label ?? k).join("・");
}

// 種別変更で結果が無効化されたときの表示リセット（再描画せず、結果欄・DL・状態だけ戻す）。
function resetItemResultView(item) {
  if (!item.el) return;
  const sizes = item.el.querySelector("[data-ic-sizes]");
  if (sizes) sizes.innerHTML = `<span class="c-ic-card__before">${formatBytes(item.file.size)}</span>`;
  const dl = item.el.querySelector("[data-ic-download]");
  if (dl) {
    dl.disabled = true;
    const labelSpan = dl.querySelector("span");
    if (labelSpan) labelSpan.textContent = "DL";
  }
  item.el.classList.remove("is-done", "is-error");
}

// ---- 1行カードの描画（サムネ＋名前＋種別ラジオ＋容量・削減率） ----
function renderItem(item) {
  const preset = PRESET_MAP[item.presetId];
  // ★N-1: 再描画ごとに before サムネ用 Object URL を作るため、古い URL を revoke してリーク防止。
  if (item._thumbUrl) URL.revokeObjectURL(item._thumbUrl);
  const thumbUrl = URL.createObjectURL(item.file);

  const card = document.createElement("li");
  card.className = "c-ic-card";
  card.dataset.icItem = String(item.id);

  // ⑤SVG助言バナー（カード単位の選択種別で出し分け / FB-2 第4次）。
  const adviseHint = shouldShowAdvise(item.presetId) ? adviseHintHtml() : "";

  card.innerHTML = `
    <div class="c-ic-card__main">
      <img class="c-ic-card__thumb" src="${thumbUrl}" alt="" loading="lazy" />
      <div class="c-ic-card__body">
        <p class="c-ic-card__name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</p>
        <p class="c-ic-card__current" data-ic-current aria-live="polite">種別: <span class="c-ic-card__current-type" data-ic-current-type>${preset.num} ${escapeHtml(preset.label)}</span><span class="c-ic-card__current-fmt" data-ic-current-fmt> ／ 形式: ${escapeHtml(formatsLabel(item.formats))}</span></p>
        ${item.inferReason ? `<small class="c-ic-card__reason" data-ic-reason>${escapeHtml(item.inferReason)}</small>` : ""}
        <div class="c-ic-card__sizes" data-ic-sizes aria-live="polite">
          <span class="c-ic-card__before"></span>
        </div>
        ${adviseHint}
      </div>
      <div class="c-ic-card__actions">
        <button type="button" class="c-ic-btn c-ic-btn--ghost c-ic-toggle-type" data-ic-toggle-type aria-expanded="false"><span>種別を選択</span><span class="c-ic-toggle-type__chevron" aria-hidden="true">${iconSvg("chevron", { size: 16 })}</span></button>
        <button type="button" class="c-ic-btn c-ic-btn--ghost c-ic-toggle-type" data-ic-toggle-format aria-expanded="false"><span>出力形式</span><span class="c-ic-toggle-type__chevron" aria-hidden="true">${iconSvg("chevron", { size: 16 })}</span></button>
        <button type="button" class="c-ic-btn c-ic-btn--dl" data-ic-download disabled>${iconSvg("download", { size: 16 })}<span>DL</span></button>
      </div>
    </div>
    <fieldset class="c-ic-card__type" data-ic-card-type hidden>
      <legend class="c-ic-card__type-legend">この画像の種別</legend>
      <div class="c-ic-typegrid c-ic-typegrid--compact">
        ${radioGroupHtml(`ic-item-type-${item.id}`, item.presetId, `ic-item-type-${item.id}`)}
      </div>
    </fieldset>
    <fieldset class="c-ic-card__type" data-ic-card-format hidden>
      <legend class="c-ic-card__type-legend">この画像の出力フォーマット（複数選べます）</legend>
      <div class="c-ic-formatgrid">
        ${formatGroupHtml(`ic-item-fmt-${item.id}`, item.formats)}
      </div>
    </fieldset>
  `;

  // before サイズ表示。
  card.querySelector(".c-ic-card__before").textContent = `${formatBytes(item.file.size)}`;

  if (item.el && item.el.parentNode) {
    item.el.parentNode.replaceChild(card, item.el);
  } else {
    dom.list.appendChild(card);
  }
  item.el = card;
  item._thumbUrl = thumbUrl;

  bindItemEvents(item);
  if (item.results) paintResult(item);
}

function bindItemEvents(item) {
  const card = item.el;

  // 種別ラジオ（個別変更）。fieldset を開閉するトグル。
  const typeFs = card.querySelector("[data-ic-card-type]");
  const typeToggle = card.querySelector("[data-ic-toggle-type]");
  if (typeToggle && typeFs) {
    typeToggle.addEventListener("click", () => {
      const expanded = typeToggle.getAttribute("aria-expanded") === "true";
      typeToggle.setAttribute("aria-expanded", String(!expanded));
      typeFs.hidden = expanded;
    });
  }
  if (typeFs) {
    typeFs.addEventListener("change", e => {
      const radio = e.target.closest("[data-ic-type-radio]");
      if (radio) setItemPreset(item, radio.value);
    });
  }

  // 出力フォーマット（個別上書き）。fieldset を開閉するトグル＋チェックボックス変更（FB-4）。
  const fmtFs = card.querySelector("[data-ic-card-format]");
  const fmtToggle = card.querySelector("[data-ic-toggle-format]");
  if (fmtToggle && fmtFs) {
    fmtToggle.addEventListener("click", () => {
      const expanded = fmtToggle.getAttribute("aria-expanded") === "true";
      fmtToggle.setAttribute("aria-expanded", String(!expanded));
      fmtFs.hidden = expanded;
    });
  }
  if (fmtFs) {
    fmtFs.addEventListener("change", e => {
      const check = e.target.closest("[data-ic-format-check]");
      if (check) setItemFormat(item, check.value, check.checked);
    });
  }

  const dl = card.querySelector("[data-ic-download]");
  if (dl) dl.addEventListener("click", () => downloadItem(item));
}

// 個別カードのフォーマット個別上書き（FB-4）。一括を起点に、ユーザーのカード単位変更を尊重する。
//   ★種別ラジオと同様、fieldset を閉じない（開閉は「出力形式」ボタンのみ）。再描画せず状態だけ更新。
function setItemFormat(item, formatKey, checked) {
  const set = new Set(item.formats);
  if (checked) set.add(formatKey);
  else set.delete(formatKey);
  item.formats = FORMAT_ORDER.filter(k => set.has(k)); // 表示順に正規化
  item.results = null;
  item.error = null;
  updateCurrentTypeText(item);
  resetItemResultView(item);
  updateActionState();
}

// ---- エンコード実行（逐次・進捗 / 1枚×複数フォーマット） ----
async function runCompression() {
  if (isProcessing || items.length === 0) return;
  // 一括または各カード個別のいずれかでフォーマットが1つでも選ばれていれば実行できる（FB-4）。
  //   item.formats が空のカードは encodeItemFormats 側で一括にフォールバックする。
  const anyFormatSelected = bulkFormats.length > 0 || items.some(it => it.formats && it.formats.length > 0);
  if (!anyFormatSelected) {
    showNotice("出力フォーマットを 1 つ以上選んでください。", "warning");
    return;
  }
  isProcessing = true;
  avifDowngradeCount = 0; // この実行ぶんの降格集計をリセット（S-2）。
  updateActionState();
  clearNotice();

  // AVIF を含む実行は時間がかかる旨を実行中ずっと出す（D4 / §3-b）。
  //   一括 or いずれかのカードで AVIF が選ばれていれば対象。
  const usesAvif = bulkFormats.includes(FORMAT.AVIF) || items.some(it => it.formats && it.formats.includes(FORMAT.AVIF));
  if (usesAvif && !avifUnavailable) {
    showNotice("AVIF は高画質・小容量ですが、エンコードに時間がかかります。完了までしばらくお待ちください。", "info");
  }

  const total = items.length;
  showProgress(0, total, "");

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    showProgress(i, total, item.name);
    try {
      item.error = null;
      item.results = await encodeItemFormats(item);
      paintResult(item);
    } catch (err) {
      item.error = (err && err.message) || "エンコードに失敗しました";
      paintError(item);
    }
    showProgress(i + 1, total, item.name);
  }

  isProcessing = false;
  hideProgress();
  flushAvifDowngradeNotice(); // 集約した降格通知を 1 回だけ表示（S-2）。
  updateActionState();
}

// AVIF→WebP 降格の集約通知（S-2: 連打・点滅防止）。実行完了時に 1 回だけ出す。
function flushAvifDowngradeNotice() {
  if (avifDowngradeCount <= 0) return;
  const n = avifDowngradeCount;
  avifDowngradeCount = 0;
  showNotice(`この環境では AVIF が使えないため、${n} 枚を WebP で出力しました。`, "warning");
}

// 1枚を「選ばれた全フォーマット」でエンコード（複数出力パイプライン）。
//   各フォーマットを逐次に処理し、Result[] を返す。1フォーマット失敗時はそれだけスキップ。
//   未稼働フォーマット（AVIF/PNG）は UI で disabled のため通常届かないが、念のため WebP 降格で保険。
async function encodeItemFormats(item) {
  const preset = PRESET_MAP[item.presetId];
  const formats = (item.formats && item.formats.length ? item.formats : bulkFormats).filter(Boolean);

  // リサイズ済み RGBA は WebP/AVIF/PNG で共有できるので、必要なときに1度だけ用意する（メモリ・速度）。
  let sharedRgba = null;
  const ensureRgba = async () => {
    if (!sharedRgba) sharedRgba = await prepareRgba(item.file, preset.maxEdge);
    return sharedRgba;
  };

  const results = [];
  const producedExts = new Set(); // 同一拡張子の重複出力を防ぐ（降格で WebP が重複する保険ケース対策）。
  for (const fmtKey of formats) {
    try {
      const result = await encodeOneFormat(item, preset, fmtKey, ensureRgba);
      if (result && !producedExts.has(result.ext)) {
        producedExts.add(result.ext);
        results.push(result);
        // ★S-1: AVIF→WebP 降格は「その WebP が実際に新規出力になったとき」だけ数える。
        //   既に WebP を明示選択していて重複 dedup される場合は出力構成が変わらない＝過剰カウントしない。
        if (result.downgradedFromAvif) avifDowngradeCount += 1;
      }
    } catch {
      showNotice(`${item.name}: ${FORMAT_DEFS[fmtKey]?.label ?? fmtKey} の書き出しに失敗したためスキップしました。`, "warning");
    }
  }
  // sharedRgba.rgba は Worker へ Transferable で渡すと detach されるため、ここでの明示解放は不要。
  if (results.length === 0) throw new Error("出力できるフォーマットがありませんでした");
  return results;
}

// 1フォーマットのエンコード（Stage3: WebP / AVIF / PNG可逆(⑤⑥)・PNG減色(④) / 元形式JPEG）。
async function encodeOneFormat(item, preset, fmtKey, ensureRgba) {
  // 元形式（JPEG）穏やか最適化（D7）= Worker 内 OffscreenCanvas（WASM 不要・メインを固めない / ★M-3）。
  //   WebP と同じ逐次パイプライン上で動くため、大量×大判でも UI 応答が保たれる。
  if (fmtKey === FORMAT.KEEP_JPEG) {
    const buffer = await encodeJpegInWorker({ file: item.file, maxEdge: preset.maxEdge });
    return { buffer, ext: "jpg", mime: "image/jpeg", format: FORMAT.KEEP_JPEG, lossless: false };
  }

  // AVIF（Stage2 / WASM・遅延ロード）。
  //   ★S-3: この環境で AVIF 不可と判明済みなら、再試行せず WebP に降格して出す（集計のみ）。
  //   初回トライで例外（WASM 初期化失敗 / SharedArrayBuffer 不在等）を捕捉したら avifUnavailable を立て、
  //   当該枚を WebP に降格する。以降の画像は最初から WebP 経路へ流れる（無駄な失敗・固まりを回避）。
  if (fmtKey === FORMAT.AVIF) {
    if (!avifUnavailable) {
      try {
        const { rgba, width, height } = await ensureRgba();
        const rgbaCopy = rgba.slice(0); // rgba は 1 度しか transfer できないためコピーを渡す（複数出力対応）。
        const buffer = await encodeAvifInWorker({ rgba: rgbaCopy, width, height, quality: preset.avifQuality });
        return { buffer, ext: "avif", mime: "image/avif", format: FORMAT.AVIF, lossless: false };
      } catch {
        // この環境では AVIF が使えない → 以降は降格固定。当該枚は下の WebP 降格で出す。
        avifUnavailable = true;
      }
    }
    // S-3 降格: WebP で出力する。
    //   ★S-1: 降格カウントは「ユーザーが元々 WebP を選んでおらず、AVIF 降格で初めて WebP が
    //   出力構成に加わるとき」だけにする。WebP を明示選択済みなら出力構成は変わらない（dedup される）
    //   ので過剰カウント・誤解を招く通知を避ける。最終判断は encodeItemFormats（新規 ext のみ加算）。
    const fallback = await encodeWebpFallback(preset, ensureRgba);
    const formats = item.formats && item.formats.length ? item.formats : bulkFormats;
    if (!formats.includes(FORMAT.WEBP)) fallback.downgradedFromAvif = true;
    return fallback;
  }

  // PNG 可逆（⑤⑥）／PNG 減色（④）= Stage3 / oxipng（Worker 内・遅延ロード）。
  //   ④（preset.pngReduce）は ILLUST_PNG_COLORS 色へメディアンカット減色してから oxipng 可逆。
  //   ⑤⑥（lossless 種別）は減色なしの可逆。それ以外の種別で PNG を選んだ場合も可逆で扱う。
  if (fmtKey === FORMAT.PNG_LOSSLESS) {
    const { rgba, width, height } = await ensureRgba();
    const rgbaCopy = rgba.slice(0); // 共有 RGBA は transfer で detach されるためコピーを渡す。
    const reduceColors = preset.pngReduce ? ILLUST_PNG_COLORS : 0;
    const buffer = await encodePngInWorker({ rgba: rgbaCopy, width, height, reduceColors });
    return { buffer, ext: "png", mime: "image/png", format: FORMAT.PNG_LOSSLESS, lossless: true };
  }

  // 未稼働フォーマット（将来 disabled 化した場合の保険）→ WebP に降格して出力。
  if (!isFormatEnabled(fmtKey)) {
    showNotice(`${item.name}: ${FORMAT_DEFS[fmtKey]?.label ?? fmtKey} は準備中のため WebP で出力しました。`, "warning");
    return await encodeWebpFallback(preset, ensureRgba);
  }

  // WebP（非可逆/可逆）= Canvas で前処理 → Worker で WASM エンコード。
  if (fmtKey === FORMAT.WEBP) {
    return await encodeWebpFallback(preset, ensureRgba);
  }
  return null;
}

// WebP エンコード（本命＝WebP 選択時 / 降格先の両方で使う）。種別の lossless/quality を適用。
async function encodeWebpFallback(preset, ensureRgba) {
  const lossless = preset.lossless;
  const quality = preset.quality;
  const { rgba, width, height } = await ensureRgba();
  const rgbaCopy = rgba.slice(0); // 共有 RGBA は transfer で detach されるためコピーを渡す。
  const buffer = await encodeWebpInWorker({ rgba: rgbaCopy, width, height, quality, lossless });
  return { buffer, ext: "webp", mime: "image/webp", format: FORMAT.WEBP, lossless };
}

// ---- 結果描画（元→各形式の容量・削減率・DL有効化 / 複数フォーマット対応） ----
function paintResult(item) {
  if (!item.el || !item.results || item.results.length === 0) return;
  const beforeBytes = item.file.size;
  const sizes = item.el.querySelector("[data-ic-sizes]");

  // 代表（1件目）の Before/After を主表示し、複数フォーマットは各行で容量・削減率を併記。
  const head = `<span class="c-ic-card__before">${formatBytes(beforeBytes)}</span>` + `<span class="c-ic-card__arrow" aria-hidden="true">→</span>`;
  const lines = item.results
    .map(r => {
      const afterBytes = r.buffer.byteLength;
      const ext = formatExtLabel(r);
      const rateClass = afterBytes <= beforeBytes ? "is-good" : "is-bad";
      return (
        `<span class="c-ic-card__out">` +
        `<span class="c-ic-card__ext">${ext}</span>` +
        `<span class="c-ic-card__after">${formatBytes(afterBytes)}</span>` +
        `<span class="c-ic-card__rate ${rateClass}">${reductionPercent(beforeBytes, afterBytes)}</span>` +
        `</span>`
      );
    })
    .join("");
  sizes.innerHTML = head + `<span class="c-ic-card__outs">${lines}</span>`;

  // ★FB-2: After 画像の並置は廃止（容量・削減率の数値表示のみ残す）。after サムネは生成しない。
  const dl = item.el.querySelector("[data-ic-download]");
  if (dl) {
    dl.disabled = false;
    // 複数フォーマット時は DL ラベルを「ZIP」に（その画像の全形式をまとめてDL）。
    const labelSpan = dl.querySelector("span");
    if (labelSpan) labelSpan.textContent = item.results.length > 1 ? "ZIP" : "DL";
  }
  item.el.classList.remove("is-error");
  item.el.classList.add("is-done");
}

// 出力1件の拡張子表示ラベル（WebP / AVIF / JPEG）。
//   FORMAT_DEFS のラベルを正本にして、結果の実フォーマットに追従させる（AVIF 降格時は WebP 表示になる）。
function formatExtLabel(result) {
  return FORMAT_DEFS[result.format]?.label ?? "WebP";
}

function paintError(item) {
  if (!item.el) return;
  const sizes = item.el.querySelector("[data-ic-sizes]");
  sizes.innerHTML = `<span class="c-ic-card__err">${iconSvg("warning", { size: 16 })}${escapeHtml(item.error)}</span>`;
  item.el.classList.add("is-error");
}

// ---- 出力（個別 DL / 一括 ZIP・複数フォーマット同梱） ----
//   ファイル名は元名維持＋各拡張子追従。同名でも拡張子違いで衝突しない（D10）。
function downloadItem(item) {
  if (!item.results || item.results.length === 0) return;
  if (item.results.length === 1) {
    const r = item.results[0];
    const blob = new Blob([r.buffer], { type: r.mime });
    triggerDownload(blob, swapExtension(item.name, r.ext));
    return;
  }
  // 複数フォーマット = その画像の全形式を ZIP でまとめてDL。
  const used = new Set();
  const entries = {};
  item.results.forEach(r => {
    const name = makeUniqueName(swapExtension(item.name, r.ext), used);
    entries[name] = new Uint8Array(r.buffer);
  });
  const zipped = zipSync(entries, { level: 0 });
  const blob = new Blob([zipped], { type: "application/zip" });
  triggerDownload(blob, `${baseName(item.name)}.zip`);
}

function downloadZip() {
  const done = items.filter(it => it.results && it.results.length);
  if (done.length === 0) return;
  const used = new Set();
  const entries = {};
  done.forEach(it => {
    it.results.forEach(r => {
      // 元名＋各拡張子。複数画像で同名衝突したら -1/-2 を付与（拡張子違いは衝突扱いしない）。
      const name = makeUniqueName(swapExtension(it.name, r.ext), used);
      entries[name] = new Uint8Array(r.buffer);
    });
  });
  // 既に圧縮済みの画像なので ZIP 自体は無圧縮（level 0）で高速化。
  const zipped = zipSync(entries, { level: 0 });
  const blob = new Blob([zipped], { type: "application/zip" });
  triggerDownload(blob, "compressed-images.zip");
}

function baseName(filename) {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(0, dot) : filename;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---- 進捗 / 通知 / 状態 ----
function showProgress(done, total, name) {
  if (!dom.progress) return;
  dom.progress.hidden = false;
  const pct = total ? Math.round((done / total) * 100) : 0;
  dom.progressBar.style.inlineSize = `${pct}%`;
  const track = dom.progress.querySelector(".c-ic-progress__track");
  if (track) track.setAttribute("aria-valuenow", String(pct));
  dom.progressText.textContent = name ? `${done}/${total} 枚 — ${name}` : `${done}/${total} 枚`;
}

function hideProgress() {
  if (dom.progress) dom.progress.hidden = true;
}

function showNotice(message, kind = "info") {
  if (!dom.notice) return;
  dom.notice.hidden = false;
  dom.notice.dataset.kind = kind;
  dom.notice.textContent = message;
}

function clearNotice() {
  if (dom.notice) {
    dom.notice.hidden = true;
    dom.notice.textContent = "";
  }
}

function updateActionState() {
  const hasItems = items.length > 0;
  const hasResults = items.some(it => it.results && it.results.length);
  // 一括または各カード個別のどちらかでフォーマットが選ばれていれば圧縮可（FB-4）。
  const hasFormat = bulkFormats.length > 0 || items.some(it => it.formats && it.formats.length > 0);
  if (dom.runBtn) dom.runBtn.disabled = !hasItems || !hasFormat || isProcessing;
  if (dom.zipBtn) dom.zipBtn.disabled = !hasResults || isProcessing;
}

// ⑤SVG助言バナーの HTML（renderItem の初期描画と updateAdviseHint の差し替えで共用 / FB-2）。
//   ★FB-1 同様、テキストは単一 span に閉じて flex 直下での要素別折返しを防ぐ。
function adviseHintHtml() {
  return `<p class="c-ic-card__advise" data-ic-advise>${iconSvg("star", { size: 16 })}<span class="c-ic-card__hint-text">このアイコンは SVG にできませんか？ SVG なら拡大しても劣化せず、容量も小さくできます。</span></p>`;
}

// ---- 小物 ----
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
