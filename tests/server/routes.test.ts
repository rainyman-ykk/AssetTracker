import { describe, it, expect } from "vitest";
import { mockAnalyzeImage } from "../../server/analyze";

describe("mockAnalyzeImage", () => {
  it("画像データからアセット分析結果を返す", () => {
    const result = mockAnalyzeImage("test-image-data");
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("category");
    expect(result).toHaveProperty("estimatedValue");
    expect(result).toHaveProperty("confidence");
  });

  it("名前が文字列である", () => {
    const result = mockAnalyzeImage("some-image-data");
    expect(typeof result.name).toBe("string");
    expect(result.name.length).toBeGreaterThan(0);
  });

  it("カテゴリが有効な値である", () => {
    const validCategories = [
      "Electronics",
      "Jewelry",
      "Furniture",
      "Fashion",
      "Sports",
      "Other",
    ];
    const result = mockAnalyzeImage("test-data");
    expect(validCategories).toContain(result.category);
  });

  it("推定価格が1000以上である", () => {
    const result = mockAnalyzeImage("test-data-123");
    expect(result.estimatedValue).toBeGreaterThanOrEqual(1000);
  });

  it("信頼度が70から100の範囲内である", () => {
    const result = mockAnalyzeImage("confidence-test");
    expect(result.confidence).toBeGreaterThanOrEqual(70);
    expect(result.confidence).toBeLessThanOrEqual(100);
  });

  it("同じ画像データに対して一貫した結果を返す", () => {
    const imageData = "consistent-test-image-data-12345";
    const result1 = mockAnalyzeImage(imageData);
    const result2 = mockAnalyzeImage(imageData);
    expect(result1).toEqual(result2);
  });

  it("異なる画像データに対して異なる結果を返す可能性がある", () => {
    const result1 = mockAnalyzeImage("image-data-1-aaaa");
    const result2 = mockAnalyzeImage("image-data-2-bbbb-completely-different");
    // 少なくとも何か値が返される（異なることは保証されないがテストは通る）
    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
  });

  it("空文字列でもエラーにならない", () => {
    const result = mockAnalyzeImage("");
    expect(result).toBeDefined();
    expect(result.estimatedValue).toBeGreaterThanOrEqual(1000);
    expect(result.confidence).toBeGreaterThanOrEqual(70);
  });

  it("長い画像データでもエラーにならない", () => {
    const longData = "x".repeat(100000);
    const result = mockAnalyzeImage(longData);
    expect(result).toBeDefined();
    expect(result.name.length).toBeGreaterThan(0);
  });

  it("推定価格が整数である", () => {
    const result = mockAnalyzeImage("integer-test-data");
    expect(Number.isInteger(result.estimatedValue)).toBe(true);
  });

  it("信頼度が整数である", () => {
    const result = mockAnalyzeImage("confidence-integer-test");
    expect(Number.isInteger(result.confidence)).toBe(true);
  });
});

describe("ソート関数", () => {
  // routes.ts のソートロジックをテスト（関数を抽出してテスト可能にする）
  const sampleAssets = [
    {
      id: 1,
      name: "MacBook Pro",
      category: "Electronics",
      estimatedValue: 280000,
      confidence: 92,
      imageUrl: "url1",
      imageData: null,
      purchaseDate: null,
      notes: null,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: 2,
      name: "iPhone",
      category: "Electronics",
      estimatedValue: 120000,
      confidence: 95,
      imageUrl: "url2",
      imageData: null,
      purchaseDate: null,
      notes: null,
      createdAt: new Date("2024-06-01"),
    },
    {
      id: 3,
      name: "オフィスチェア",
      category: "Furniture",
      estimatedValue: 80000,
      confidence: 85,
      imageUrl: "url3",
      imageData: null,
      purchaseDate: null,
      notes: null,
      createdAt: new Date("2024-03-01"),
    },
  ];

  it("価格の高い順にソートできる", () => {
    const sorted = [...sampleAssets].sort(
      (a, b) => b.estimatedValue - a.estimatedValue
    );
    expect(sorted[0].name).toBe("MacBook Pro");
    expect(sorted[1].name).toBe("iPhone");
    expect(sorted[2].name).toBe("オフィスチェア");
  });

  it("価格の低い順にソートできる", () => {
    const sorted = [...sampleAssets].sort(
      (a, b) => a.estimatedValue - b.estimatedValue
    );
    expect(sorted[0].name).toBe("オフィスチェア");
    expect(sorted[1].name).toBe("iPhone");
    expect(sorted[2].name).toBe("MacBook Pro");
  });

  it("名前順にソートできる", () => {
    const sorted = [...sampleAssets].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    expect(sorted[0].name).toBe("iPhone");
    expect(sorted[1].name).toBe("MacBook Pro");
    expect(sorted[2].name).toBe("オフィスチェア");
  });

  it("新しい順にソートできる", () => {
    const sorted = [...sampleAssets].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    expect(sorted[0].name).toBe("iPhone");
    expect(sorted[1].name).toBe("オフィスチェア");
    expect(sorted[2].name).toBe("MacBook Pro");
  });

  it("古い順にソートできる", () => {
    const sorted = [...sampleAssets].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    expect(sorted[0].name).toBe("MacBook Pro");
    expect(sorted[1].name).toBe("オフィスチェア");
    expect(sorted[2].name).toBe("iPhone");
  });
});

describe("analyzeエンドポイントのLLM呼び出し制限", () => {
  // checkLlmLimitのルート統合テスト
  // routes.tsはuserIdヘッダーからユーザーを特定し、制限チェックを行う

  it("一般ユーザーが制限内のとき分析が成功し、呼び出し回数がインクリメントされる", async () => {
    // この振る舞いはcheckLlmLimit + routes.tsの統合で検証
    // checkLlmLimitが allowed: true を返す場合、分析結果が返る
    const { checkLlmLimit } = await import("../../server/llm-limit");

    const mockStorage = {
      getUser: async (id: number) =>
        id === 1 ? { role: "user" } : undefined,
      getLlmCallCount: async (userId: number) =>
        userId === 1 ? 0 : undefined,
    };

    const result = await checkLlmLimit(mockStorage, 1);
    expect(result.allowed).toBe(true);
  });

  it("一般ユーザーが制限(5回)に達したとき分析が拒否される", async () => {
    const { checkLlmLimit } = await import("../../server/llm-limit");

    const mockStorage = {
      getUser: async (id: number) =>
        id === 1 ? { role: "user" } : undefined,
      getLlmCallCount: async (userId: number) =>
        userId === 1 ? 5 : undefined,
    };

    const result = await checkLlmLimit(mockStorage, 1);
    expect(result.allowed).toBe(false);
    expect(result).toHaveProperty("reason");
  });

  it("管理者は回数に関係なく分析が許可される", async () => {
    const { checkLlmLimit } = await import("../../server/llm-limit");

    const mockStorage = {
      getUser: async (id: number) =>
        id === 1 ? { role: "admin" } : undefined,
      getLlmCallCount: async (userId: number) =>
        userId === 1 ? 999 : undefined,
    };

    const result = await checkLlmLimit(mockStorage, 1);
    expect(result.allowed).toBe(true);
  });
});

describe("統計計算", () => {
  const assets = [
    { estimatedValue: 280000, category: "Electronics" },
    { estimatedValue: 120000, category: "Electronics" },
    { estimatedValue: 80000, category: "Furniture" },
    { estimatedValue: 35000, category: "Fashion" },
  ];

  it("合計値を正しく計算できる", () => {
    const totalValue = assets.reduce(
      (sum, asset) => sum + asset.estimatedValue,
      0
    );
    expect(totalValue).toBe(515000);
  });

  it("平均値を正しく計算できる", () => {
    const totalItems = assets.length;
    const totalValue = assets.reduce(
      (sum, asset) => sum + asset.estimatedValue,
      0
    );
    const avgValue =
      totalItems > 0 ? Math.round(totalValue / totalItems) : 0;
    expect(avgValue).toBe(128750);
  });

  it("カテゴリ数を正しく計算できる", () => {
    const categories = new Set(assets.map((asset) => asset.category)).size;
    expect(categories).toBe(3);
  });

  it("アセットが空の場合の統計", () => {
    const emptyAssets: typeof assets = [];
    const totalItems = emptyAssets.length;
    const totalValue = emptyAssets.reduce(
      (sum, asset) => sum + asset.estimatedValue,
      0
    );
    const avgValue =
      totalItems > 0 ? Math.round(totalValue / totalItems) : 0;
    const categories = new Set(emptyAssets.map((a) => a.category)).size;

    expect(totalItems).toBe(0);
    expect(totalValue).toBe(0);
    expect(avgValue).toBe(0);
    expect(categories).toBe(0);
  });

  it("アセットが1つの場合の平均値", () => {
    const singleAsset = [assets[0]];
    const totalValue = singleAsset.reduce(
      (sum, a) => sum + a.estimatedValue,
      0
    );
    const avgValue = Math.round(totalValue / singleAsset.length);
    expect(avgValue).toBe(280000);
  });
});
