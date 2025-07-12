# AssetTracker - 個人資産管理システム

個人の大切な資産を写真で記録し、自動的に分析・管理するWebアプリケーションです。

## 主な機能

### 📸 写真による資産登録
- ドラッグ&ドロップまたはファイル選択で画像をアップロード
- AI解析による自動商品識別
- 自動価値推定と信頼度表示

### 📊 資産管理
- 登録した資産の一覧表示
- カテゴリ別フィルタリング
- 名前・価格・日付による検索・ソート機能
- 詳細情報の表示・編集

### 📈 統計情報
- 総資産価値の表示
- 登録商品数の統計
- 平均価値の計算
- カテゴリ別分析

## 技術スタック

### フロントエンド
- **React** - UIライブラリ
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **shadcn/ui** - UIコンポーネント
- **TanStack Query** - データ取得・状態管理
- **Wouter** - ルーティング

### バックエンド
- **Express.js** - Webサーバー
- **TypeScript** - サーバーサイド開発
- **PostgreSQL** - データベース
- **Drizzle ORM** - データベースORM
- **Multer** - ファイルアップロード

### 開発環境
- **Vite** - 高速開発サーバー
- **esbuild** - 高速ビルド
- **ESLint** - コード品質

## セットアップ

### 前提条件
- Node.js (v18以上)
- PostgreSQL データベース

### インストール
```bash
# 依存関係のインストール
npm install

# データベースの設定
npm run db:push
```

### 環境変数
以下の環境変数を設定してください：
```
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

### 開発サーバーの起動
```bash
npm run dev
```

アプリケーションは `http://localhost:5000` でアクセスできます。

## 使用方法

### 1. 資産の登録
1. 「写真をアップロード」ボタンをクリック
2. 商品の写真を選択またはドラッグ&ドロップ
3. AI解析結果を確認
4. 必要に応じて情報を編集
5. 「資産を登録」ボタンで保存

### 2. 資産の管理
- 一覧画面で登録した資産を表示
- 検索バーで商品名やカテゴリで絞り込み
- カテゴリフィルターで特定のカテゴリを表示
- ソート機能で並び替え

### 3. 資産の編集
- 商品カードをクリックして詳細を表示
- 「編集」ボタンで情報を修正
- 「削除」ボタンで資産を削除

## カテゴリ

システムで対応しているカテゴリ：
- 電子機器 (Electronics)
- 家具 (Furniture)
- ジュエリー (Jewelry)
- ファッション (Fashion)
- スポーツ (Sports)
- その他 (Other)

## データベース構造

### assets テーブル
- `id` - 主キー
- `name` - 商品名
- `category` - カテゴリ
- `estimated_value` - 推定価値（円）
- `confidence` - AI分析の信頼度（0-100）
- `image_url` - 画像URL（data URI）
- `image_data` - 画像データ（base64）
- `purchase_date` - 購入日（オプション）
- `notes` - 備考（オプション）
- `created_at` - 作成日時

### users テーブル
- `id` - 主キー
- `username` - ユーザー名
- `password` - パスワード

## 開発

### データベース操作
```bash
# スキーマの変更をデータベースに反映
npm run db:push

# 開発サーバーの起動
npm run dev
```

### ファイル構成
```
├── client/                 # フロントエンド
│   ├── src/
│   │   ├── components/     # Reactコンポーネント
│   │   ├── pages/          # ページコンポーネント
│   │   ├── hooks/          # カスタムフック
│   │   └── lib/            # ユーティリティ
│   └── index.html
├── server/                 # バックエンド
│   ├── index.ts           # サーバーエントリポイント
│   ├── routes.ts          # APIルート
│   ├── storage.ts         # データベース操作
│   └── db.ts              # データベース接続
├── shared/                 # 共通型定義
│   └── schema.ts          # Drizzleスキーマ
└── package.json
```

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。

## サポート

問題や質問がある場合は、GitHubのIssueページで報告してください。