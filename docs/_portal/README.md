# _portal — ポータル自体の設計・素材インデックス

ポータル（`kurodafolio.com/tools/` トップ＝一覧 / ナビ / カテゴリ / positioning / マネタイズ / URL設計）の設計ドキュメントと、構想段階の移管素材を格納する。

> ⚠️ F1 雛形＝インデックスのみ。ポータル設計の本格執筆（トップ一覧UI・カテゴリ設計・SEO）は F2 以降。
> 正本方針は `../../PLAN.md` を参照。

---

## このフォルダの中身

### 技術前提（Cody / 移管対象外・正本）
| ファイル | 内容 |
|---|---|
| `00_tech-verification.md` | F1 技術検証3点（U-02）の実機結論。`base:"/tools/"` パス解決 / XServer .htaccess 干渉地雷マップ / partial 同期＝コピー運用推奨。**移管対象外＝正本** |

### 移管素材（tmp/tool-ideation/ からコピー・原本残置）
| ファイル | 内容 | 旧サブドメイン読み替え注記 |
|---|---|---|
| `mado-publish-format.md` | ポータル型採用・URL設計の根拠 | 付与済み |
| `mado-portfolio-link-design.md` | 本体導線設計（ナビ/トップ/フッター/逆導線/works非混在） | 付与済み |
| `mado-collection-positioning.md` | フロント特化 positioning・プロダクト整合ヒューリスティック | 付与済み |
| `mado-monetization-placement.md` | マネタイズ＝(d)分離型ハイブリッド確定の根拠 | 付与済み |
| `mado-placement-c-vs-d.md` | (c)WP集約 vs (d) の公平比較 | 付与済み |
| `mado-selfuse-dev-tools.md` | 自己利用ツール群（第1弾元素材＋第2/3弾候補ロードマップ） | 付与済み |
| `mane-file-structure.md` | ファイル配置設計の確定根拠（PLAN.md §2-5 の出典） | 付与済み |
| `mado-candidates.md` | 公開ツール推奨カタログ（今後候補ロードマップ・参考素材／移管表外→_portal へ配置） | 付与済み |
| `mado-url-structure-detail.md` | URL構造の精密判断（`/tools/` 確定の詳細根拠／移管表外→_portal へ配置） | 付与済み |

> **移管表外3点の扱い**: `mado-candidates.md`（候補ロードマップ）と `mado-url-structure-detail.md`（URL設計の確定根拠）は、いずれもポータル設計の一次資料として価値が高いため `_portal/` へ移管した。`mado-pokemon-sleep-tools.md` はキャリア外・種まきの side ブレストでフロント特化 positioning（§2-8）のスコープ外のため **tmp 残置**（移管しない）。

---

## 今後埋めるドキュメント（F2以降）
- ポータルトップ（一覧カード）UI設計
- ツールカテゴリ設計
- ナビ / フッター方針（U-03 Haru/Mado 確定後）
- ポータル全体の SEO
