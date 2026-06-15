# kuroda-tools

フロントエンド制作者向けの実用ツール集。黒田（[kurodafolio.com](https://kurodafolio.com)）が毎案件で使う道具を一箇所に揃え、**`kurodafolio.com/tools/`** にポータルとして公開する。

## 概要

- **公開先**: `kurodafolio.com/tools/`（トップ＝ツール一覧 ／ 各ツール＝`/tools/{slug}/`）
- **Git運用**: パターンA（独立 git リポジトリ・GitHub Public・my-virtual-team から除外）
- **ビルド**: 本体 kurodafolio.com とは分離した**独立 Vite プロジェクト**（`dev/`）。`vite.config.js` の `base: "/tools/"` で全アセット・リンクを `/tools/` 配下に解決し、`dist/` を XServer の `public_html/tools/` へデプロイする。
- **第1弾**: 画像仕分け圧縮くん（slug=`image-compress`）— ブラウザ内 WASM で完結する画像圧縮ツール（画像を送信しない＝プライバシー訴求）。実装は F3 で行う。

## ディレクトリ構成

```
kuroda-tools/
├── PLAN.md            ツール群全体の plan（plans/kuroda-tools-setup.md の移管先）
├── README.md
├── docs/
│   ├── _portal/       ポータル自体（一覧・ナビ・positioning・マネタイズ等）の設計・技術検証
│   ├── image-compress/ 第1弾の設計4点（00_overview / 01_spec / 02_qa / 03_seo）
│   └── motion/        温存ツール（スクロール演出ジェネレーター）の素材
└── dev/               独立 Vite プロジェクト（実装の本体）
    ├── vite.config.js base: "/tools/"
    └── src/
        ├── index.html  ポータルトップ → /tools/
        ├── components/ 共通 partial（head / header / footer = 本体への逆導線）
        ├── data/tools.json ツール一覧データ
        ├── assets/styles/portal.css
        └── {slug}/index.html  各ツール → /tools/{slug}/
```

> **デプロイ対応**: `dist/` をそのまま XServer `public_html/tools/` へ配置する。
> `src/index.html` → `/tools/`（ポータルトップ）、`src/{slug}/index.html` → `/tools/{slug}/`。
> ツールのソースフォルダは `src/` 直下にスラッグ名で置く（`src/tools/{slug}/` にすると `/tools/tools/{slug}/` と二重になるため**置かない**）。
> plan §2-5 の構成図は `src/tools/{slug}/` 表記だったが、`dist→public_html/tools/` デプロイと整合させ `src/{slug}/` に確定（詳細は `docs/_portal/00_tech-verification.md` §1）。

## 開発

```bash
cd dev
yarn install
yarn dev      # ローカル開発サーバー（ポータルトップが起動）
yarn build    # dist/ を生成（base: "/tools/" でパス解決）
yarn preview  # build 結果をプレビュー
```

> スラッグ（slug）＝ URL・ソースフォルダ・docs フォルダで**完全一致**させる（小文字英字＋ハイフン・確定後は不変）。
