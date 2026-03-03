import { describe, it, expect } from "vitest";
import {
  insertUserSchema,
  insertAssetSchema,
  updateAssetSchema,
  llmUsage,
} from "@shared/schema";
import type { LlmUsage } from "@shared/schema";

describe("insertUserSchema", () => {
  it("有効なユーザーデータを受け入れる", () => {
    const validUser = { username: "testuser", password: "password123" };
    const result = insertUserSchema.parse(validUser);
    expect(result).toEqual(validUser);
  });

  it("ユーザー名が空文字でもスキーマ的には受け入れる（DB制約で検証）", () => {
    const user = { username: "", password: "password123" };
    const result = insertUserSchema.parse(user);
    expect(result.username).toBe("");
  });

  it("パスワードがない場合はエラーになる", () => {
    const invalidUser = { username: "testuser" };
    expect(() => insertUserSchema.parse(invalidUser as any)).toThrow();
  });

  it("ユーザー名がない場合はエラーになる", () => {
    const invalidUser = { password: "password123" };
    expect(() => insertUserSchema.parse(invalidUser as any)).toThrow();
  });

  it("余分なフィールドは除去される", () => {
    const userWithExtra = {
      username: "testuser",
      password: "password123",
      extra: "field",
    };
    const result = insertUserSchema.parse(userWithExtra);
    expect(result).not.toHaveProperty("extra");
  });
});

describe("insertAssetSchema", () => {
  const validAsset = {
    name: "MacBook Pro",
    category: "Electronics",
    estimatedValue: 280000,
    confidence: 92,
    imageUrl: "data:image/png;base64,abc123",
  };

  it("有効なアセットデータを受け入れる", () => {
    const result = insertAssetSchema.parse(validAsset);
    expect(result.name).toBe("MacBook Pro");
    expect(result.category).toBe("Electronics");
    expect(result.estimatedValue).toBe(280000);
  });

  it("オプションフィールドなしでも受け入れる", () => {
    const result = insertAssetSchema.parse(validAsset);
    expect(result).toBeDefined();
    expect(result.name).toBe("MacBook Pro");
  });

  it("オプションフィールド付きでも受け入れる", () => {
    const assetWithOptionals = {
      ...validAsset,
      imageData: "base64data",
      purchaseDate: "2024-01-15",
      notes: "テスト用のノート",
    };
    const result = insertAssetSchema.parse(assetWithOptionals);
    expect(result.imageData).toBe("base64data");
    expect(result.purchaseDate).toBe("2024-01-15");
    expect(result.notes).toBe("テスト用のノート");
  });

  it("名前がない場合はエラーになる", () => {
    const { name, ...withoutName } = validAsset;
    expect(() => insertAssetSchema.parse(withoutName)).toThrow();
  });

  it("カテゴリがない場合はエラーになる", () => {
    const { category, ...withoutCategory } = validAsset;
    expect(() => insertAssetSchema.parse(withoutCategory)).toThrow();
  });

  it("推定価格がない場合はエラーになる", () => {
    const { estimatedValue, ...withoutValue } = validAsset;
    expect(() => insertAssetSchema.parse(withoutValue)).toThrow();
  });

  it("画像URLがない場合はエラーになる", () => {
    const { imageUrl, ...withoutImageUrl } = validAsset;
    expect(() => insertAssetSchema.parse(withoutImageUrl)).toThrow();
  });

  it("idフィールドは含まれない", () => {
    const assetWithId = { ...validAsset, id: 1 };
    const result = insertAssetSchema.parse(assetWithId);
    expect(result).not.toHaveProperty("id");
  });

  it("createdAtフィールドは含まれない", () => {
    const assetWithCreatedAt = { ...validAsset, createdAt: new Date() };
    const result = insertAssetSchema.parse(assetWithCreatedAt);
    expect(result).not.toHaveProperty("createdAt");
  });

  it("推定価格が数値でない場合はエラーになる", () => {
    const invalidAsset = { ...validAsset, estimatedValue: "高い" };
    expect(() => insertAssetSchema.parse(invalidAsset)).toThrow();
  });
});


describe("llmUsageテーブル", () => {
  it("llmUsageテーブルが定義されている", () => {
    expect(llmUsage).toBeDefined();
  });

  it("LlmUsage型がuserIdとcallCountを持つ", () => {
    const usage: LlmUsage = {
      id: 1,
      userId: 1,
      callCount: 0,
    };
    expect(usage.userId).toBe(1);
    expect(usage.callCount).toBe(0);
  });
});

describe("updateAssetSchema", () => {
  it("部分的な更新データを受け入れる", () => {
    const partialUpdate = { name: "新しい名前" };
    const result = updateAssetSchema.parse(partialUpdate);
    expect(result.name).toBe("新しい名前");
  });

  it("空のオブジェクトを受け入れる", () => {
    const result = updateAssetSchema.parse({});
    expect(result).toBeDefined();
  });

  it("複数フィールドの部分更新を受け入れる", () => {
    const partialUpdate = {
      name: "更新された名前",
      estimatedValue: 100000,
      notes: "更新されたノート",
    };
    const result = updateAssetSchema.parse(partialUpdate);
    expect(result.name).toBe("更新された名前");
    expect(result.estimatedValue).toBe(100000);
    expect(result.notes).toBe("更新されたノート");
  });

  it("推定価格だけの更新を受け入れる", () => {
    const result = updateAssetSchema.parse({ estimatedValue: 50000 });
    expect(result.estimatedValue).toBe(50000);
  });

  it("idフィールドは含まれない", () => {
    const updateWithId = { id: 1, name: "テスト" };
    const result = updateAssetSchema.parse(updateWithId);
    expect(result).not.toHaveProperty("id");
  });

  it("createdAtフィールドは含まれない", () => {
    const updateWithCreatedAt = { createdAt: new Date(), name: "テスト" };
    const result = updateAssetSchema.parse(updateWithCreatedAt);
    expect(result).not.toHaveProperty("createdAt");
  });
});
