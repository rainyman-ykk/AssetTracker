# AssetTracker 開発ガイド

## テスト駆動開発 (TDD) — t-wadaメソッド

本プロジェクトは和田卓人（t-wada）さんのテスト駆動開発の方法論に従う。
新機能の追加・バグ修正は必ず以下のサイクルで行うこと。

---

### 基本サイクル: Red → Green → Refactor

```
1. Red:    失敗するテストを1つ書く（まだ実装しない）
2. Green:  テストを通す最小限のコードを書く
3. Refactor: テストが通ったままコードを整理する
```

**鉄則: テストを書く前にプロダクションコードを書かない。**

---

### TODOリスト駆動

実装前に必ずTODOリストを作成する。t-wadaさんの手法では、これがTDDの羅針盤となる。

```
例: アセットのタグ機能を追加する場合

TODO:
- [ ] タグなしのアセットを作成できる
- [ ] 1つのタグ付きでアセットを作成できる
- [ ] 複数タグ付きでアセットを作成できる
- [ ] タグでアセットを検索できる
- [ ] 重複タグは無視される
- [ ] 空文字のタグはエラーになる
```

TODOは上から順に1つずつ取り組む。途中で気づいたTODOは追加してよいが、今やっているテスト以外に手を出さない。

---

### 3つの実装戦略

テストを通すときに使う3つの戦略を状況に応じて使い分ける:

#### 1. 仮実装 (Fake It)
最速でGreenにする。ハードコードした値を返してもよい。

```typescript
// Red: テストを書く
it("アセットの合計値を計算できる", () => {
  const total = calculateTotal([{ estimatedValue: 100000 }]);
  expect(total).toBe(100000);
});

// Green: 仮実装（ベタ書きでOK）
function calculateTotal(assets: { estimatedValue: number }[]): number {
  return 100000; // まずこれでGreen
}
```

#### 2. 三角測量 (Triangulation)
テストケースを追加して、仮実装を本物の実装に誘導する。

```typescript
// 2つ目のテストを追加してFake Itを壊す
it("複数アセットの合計値を計算できる", () => {
  const total = calculateTotal([
    { estimatedValue: 100000 },
    { estimatedValue: 50000 },
  ]);
  expect(total).toBe(150000);
});

// ここで初めて本物のロジックを書く
function calculateTotal(assets: { estimatedValue: number }[]): number {
  return assets.reduce((sum, a) => sum + a.estimatedValue, 0);
}
```

#### 3. 明白な実装 (Obvious Implementation)
実装が明白な場合は直接書いてよい。ただし自信がないならFake Itに戻る。

```typescript
it("カテゴリ数を数える", () => {
  const count = countCategories(["Electronics", "Furniture", "Electronics"]);
  expect(count).toBe(2);
});

// 明白なので直接実装
function countCategories(categories: string[]): number {
  return new Set(categories).size;
}
```

**迷ったらFake Itから始める。自信過剰は禁物。**

---

### テストの書き方

#### テスト名は日本語で、振る舞いを記述する

```typescript
// Good: 振る舞いを記述
it("存在しないIDはundefinedを返す", () => { ... });
it("推定価格が数値でない場合はエラーになる", () => { ... });

// Bad: 実装を記述
it("getAssetがfindを呼ぶ", () => { ... });
it("配列のlengthが0", () => { ... });
```

#### Assertion First（アサーションから書く）

テストを書くときは、アサーション（期待値）から逆向きに書く:

```typescript
it("新しいアセットが作成される", async () => {
  // 3. 最後に: アサーション（最初に考える）
  expect(asset.name).toBe("MacBook Pro");
  expect(asset.id).toBeDefined();

  // 2. 次に: 実行
  const asset = await storage.createAsset(input);

  // 1. 最初に: 準備
  const input = {
    name: "MacBook Pro",
    category: "Electronics",
    estimatedValue: 280000,
    confidence: 92,
    imageUrl: "data:image/png;base64,abc",
  };
});
```

考える順番は 3→2→1、書く順番は 1→2→3。

#### テストは独立させる

```typescript
// Good: 各テストが独立
beforeEach(() => {
  storage = new InMemoryStorage(); // 毎回リセット
});

// Bad: テスト間で状態を共有
let sharedAsset; // テスト順序に依存してしまう
```

---

### プロジェクト固有のルール

#### テスト実行コマンド

```bash
npm test              # 全テスト実行
npm run test:watch    # ウォッチモード（TDDサイクル用）
npm run test:coverage # カバレッジ付き実行
```

**TDD中は必ず `npm run test:watch` を使う。**

#### ディレクトリ構成

```
tests/
├── shared/          # Zodスキーマ・バリデーションのテスト
│   └── schema.test.ts
├── server/          # サーバーロジックのテスト
│   ├── storage.test.ts    # IStorageインターフェースのテスト
│   └── routes.test.ts     # APIロジック・ソート・統計のテスト
└── client/          # クライアントロジックのテスト
    ├── utils.test.ts           # cnユーティリティ
    ├── asset-analyzer.test.ts  # 画像解析
    └── queryClient.test.ts     # APIクライアント
```

#### DBに依存しないテスト設計

データベースに依存するコードをテストするときは、InMemoryStorageパターンを使う:

```typescript
// IStorage インターフェースに準拠したインメモリ実装
class InMemoryStorage {
  private assets: Asset[] = [];
  // ... DBと同じインターフェースでメモリ上に実装
}
```

サーバーの `storage.ts` が `IStorage` インターフェースを実装しているので、
テスト時はこのインターフェースに準拠したモックを使う。
`server/db.ts` を直接importするとDATABASE_URLが必要になるため、テストでは避ける。

#### テスト可能な設計にする

テストしにくいコードは、テスト可能な単位に分割する:

```typescript
// Before: routes.ts内にロジックが埋もれている
// → テストにDB接続が必要

// After: ロジックを別ファイルに抽出
// server/analyze.ts ← mockAnalyzeImage を抽出
// → DB接続なしでテスト可能
```

---

### TDDで新機能を追加する手順（例）

**例: アセットにタグ機能を追加する**

```
Step 1: TODOリスト作成
  - [ ] タグ付きアセットを作成できる
  - [ ] タグでアセットを検索できる
  - [ ] タグを更新できる

Step 2: 最初のテストを書く (Red)
  → tests/shared/schema.test.ts に追加
  → npm run test:watch で失敗を確認（赤）

Step 3: 最小限の実装 (Green)
  → shared/schema.ts にtagsカラム追加
  → テストが通ることを確認（緑）

Step 4: リファクタリング (Refactor)
  → コードを整理（テストは通ったまま）

Step 5: 次のTODOへ → Step 2に戻る
```

---

### やってはいけないこと

1. **テストなしでプロダクションコードを書く**
2. **複数のテストを一度に書く**（1つずつ）
3. **Redを確認せずにGreenに進む**（テストが正しく失敗することを確認）
4. **テスト間で状態を共有する**
5. **実装の詳細をテストする**（振る舞いをテストする）
6. **テストコードのリファクタリングとプロダクションコードのリファクタリングを同時にやる**

---

### 参考

- 和田卓人『テスト駆動開発』（オーム社, 2017）— Kent Beck著の翻訳 + 付録C
- t-wadaさんの「質とスピード」講演
- 本プロジェクトの既存テスト（108テスト）を参照パターンとして活用
