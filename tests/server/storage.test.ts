import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Asset, InsertAsset, UpdateAsset, User, InsertUser } from "@shared/schema";

// IStorage インターフェースに準拠したインメモリ実装でストレージロジックをテスト
class InMemoryStorage {
  private users: User[] = [];
  private assets: Asset[] = [];
  private nextUserId = 1;
  private nextAssetId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find((u) => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find((u) => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.nextUserId++,
      ...user,
    };
    this.users.push(newUser);
    return newUser;
  }

  async getAssets(): Promise<Asset[]> {
    return [...this.assets].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  async getAsset(id: number): Promise<Asset | undefined> {
    return this.assets.find((a) => a.id === id);
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const newAsset: Asset = {
      id: this.nextAssetId++,
      name: insertAsset.name,
      category: insertAsset.category,
      estimatedValue: insertAsset.estimatedValue,
      confidence: insertAsset.confidence ?? 0,
      imageUrl: insertAsset.imageUrl,
      imageData: insertAsset.imageData ?? null,
      purchaseDate: insertAsset.purchaseDate ?? null,
      notes: insertAsset.notes ?? null,
      createdAt: new Date(),
    };
    this.assets.push(newAsset);
    return newAsset;
  }

  async updateAsset(
    id: number,
    updateData: UpdateAsset
  ): Promise<Asset | undefined> {
    const index = this.assets.findIndex((a) => a.id === id);
    if (index === -1) return undefined;
    this.assets[index] = { ...this.assets[index], ...updateData };
    return this.assets[index];
  }

  async deleteAsset(id: number): Promise<boolean> {
    const index = this.assets.findIndex((a) => a.id === id);
    if (index === -1) return false;
    this.assets.splice(index, 1);
    return true;
  }

  async searchAssets(query: string): Promise<Asset[]> {
    const lowerQuery = query.toLowerCase();
    return this.assets
      .filter(
        (a) =>
          a.name.toLowerCase().includes(lowerQuery) ||
          a.category.toLowerCase().includes(lowerQuery) ||
          (a.notes && a.notes.toLowerCase().includes(lowerQuery))
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getAssetsByCategory(category: string): Promise<Asset[]> {
    if (category === "all") return this.getAssets();
    return this.assets
      .filter((a) => a.category === category)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}

describe("Storage", () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  describe("ユーザー操作", () => {
    it("ユーザーを作成できる", async () => {
      const user = await storage.createUser({
        username: "testuser",
        password: "password123",
      });
      expect(user.id).toBe(1);
      expect(user.username).toBe("testuser");
      expect(user.password).toBe("password123");
    });

    it("IDでユーザーを取得できる", async () => {
      const created = await storage.createUser({
        username: "testuser",
        password: "password123",
      });
      const found = await storage.getUser(created.id);
      expect(found).toBeDefined();
      expect(found!.username).toBe("testuser");
    });

    it("ユーザー名でユーザーを取得できる", async () => {
      await storage.createUser({
        username: "testuser",
        password: "password123",
      });
      const found = await storage.getUserByUsername("testuser");
      expect(found).toBeDefined();
      expect(found!.username).toBe("testuser");
    });

    it("存在しないIDはundefinedを返す", async () => {
      const found = await storage.getUser(999);
      expect(found).toBeUndefined();
    });

    it("存在しないユーザー名はundefinedを返す", async () => {
      const found = await storage.getUserByUsername("nonexistent");
      expect(found).toBeUndefined();
    });
  });

  describe("アセット作成", () => {
    const validAsset: InsertAsset = {
      name: "MacBook Pro",
      category: "Electronics",
      estimatedValue: 280000,
      confidence: 92,
      imageUrl: "data:image/png;base64,abc123",
    };

    it("アセットを作成できる", async () => {
      const asset = await storage.createAsset(validAsset);
      expect(asset.id).toBe(1);
      expect(asset.name).toBe("MacBook Pro");
      expect(asset.category).toBe("Electronics");
      expect(asset.estimatedValue).toBe(280000);
      expect(asset.confidence).toBe(92);
    });

    it("作成時にcreatedAtが自動設定される", async () => {
      const asset = await storage.createAsset(validAsset);
      expect(asset.createdAt).toBeInstanceOf(Date);
    });

    it("オプションフィールドはnullにデフォルト設定される", async () => {
      const asset = await storage.createAsset(validAsset);
      expect(asset.imageData).toBeNull();
      expect(asset.purchaseDate).toBeNull();
      expect(asset.notes).toBeNull();
    });

    it("オプションフィールド付きで作成できる", async () => {
      const asset = await storage.createAsset({
        ...validAsset,
        imageData: "base64data",
        purchaseDate: "2024-01-15",
        notes: "テスト用ノート",
      });
      expect(asset.imageData).toBe("base64data");
      expect(asset.purchaseDate).toBe("2024-01-15");
      expect(asset.notes).toBe("テスト用ノート");
    });

    it("連番のIDが振られる", async () => {
      const asset1 = await storage.createAsset(validAsset);
      const asset2 = await storage.createAsset({
        ...validAsset,
        name: "iPhone",
      });
      expect(asset1.id).toBe(1);
      expect(asset2.id).toBe(2);
    });
  });

  describe("アセット取得", () => {
    const baseAsset: InsertAsset = {
      name: "MacBook Pro",
      category: "Electronics",
      estimatedValue: 280000,
      confidence: 92,
      imageUrl: "data:image/png;base64,abc123",
    };

    it("全てのアセットを取得できる", async () => {
      await storage.createAsset(baseAsset);
      await storage.createAsset({ ...baseAsset, name: "iPhone" });
      const assets = await storage.getAssets();
      expect(assets).toHaveLength(2);
    });

    it("アセットが空の場合は空配列を返す", async () => {
      const assets = await storage.getAssets();
      expect(assets).toHaveLength(0);
      expect(assets).toEqual([]);
    });

    it("IDでアセットを取得できる", async () => {
      const created = await storage.createAsset(baseAsset);
      const found = await storage.getAsset(created.id);
      expect(found).toBeDefined();
      expect(found!.name).toBe("MacBook Pro");
    });

    it("存在しないIDはundefinedを返す", async () => {
      const found = await storage.getAsset(999);
      expect(found).toBeUndefined();
    });
  });

  describe("アセット更新", () => {
    it("名前を更新できる", async () => {
      const asset = await storage.createAsset({
        name: "MacBook Pro",
        category: "Electronics",
        estimatedValue: 280000,
        confidence: 92,
        imageUrl: "data:image/png;base64,abc123",
      });

      const updated = await storage.updateAsset(asset.id, {
        name: "MacBook Air",
      });
      expect(updated).toBeDefined();
      expect(updated!.name).toBe("MacBook Air");
      expect(updated!.category).toBe("Electronics"); // 変更されていない
    });

    it("複数フィールドを同時に更新できる", async () => {
      const asset = await storage.createAsset({
        name: "MacBook Pro",
        category: "Electronics",
        estimatedValue: 280000,
        confidence: 92,
        imageUrl: "data:image/png;base64,abc123",
      });

      const updated = await storage.updateAsset(asset.id, {
        name: "更新品",
        estimatedValue: 100000,
        notes: "更新テスト",
      });
      expect(updated!.name).toBe("更新品");
      expect(updated!.estimatedValue).toBe(100000);
      expect(updated!.notes).toBe("更新テスト");
    });

    it("存在しないアセットの更新はundefinedを返す", async () => {
      const result = await storage.updateAsset(999, { name: "テスト" });
      expect(result).toBeUndefined();
    });
  });

  describe("アセット削除", () => {
    it("アセットを削除できる", async () => {
      const asset = await storage.createAsset({
        name: "MacBook Pro",
        category: "Electronics",
        estimatedValue: 280000,
        confidence: 92,
        imageUrl: "data:image/png;base64,abc123",
      });

      const deleted = await storage.deleteAsset(asset.id);
      expect(deleted).toBe(true);

      const found = await storage.getAsset(asset.id);
      expect(found).toBeUndefined();
    });

    it("存在しないアセットの削除はfalseを返す", async () => {
      const deleted = await storage.deleteAsset(999);
      expect(deleted).toBe(false);
    });

    it("削除後にアセット一覧から消える", async () => {
      const asset = await storage.createAsset({
        name: "MacBook Pro",
        category: "Electronics",
        estimatedValue: 280000,
        confidence: 92,
        imageUrl: "data:image/png;base64,abc123",
      });

      await storage.deleteAsset(asset.id);
      const assets = await storage.getAssets();
      expect(assets).toHaveLength(0);
    });
  });

  describe("アセット検索", () => {
    beforeEach(async () => {
      await storage.createAsset({
        name: "MacBook Pro",
        category: "Electronics",
        estimatedValue: 280000,
        confidence: 92,
        imageUrl: "data:image/png;base64,abc123",
        notes: "仕事用ノートパソコン",
      });
      await storage.createAsset({
        name: "オフィスチェア",
        category: "Furniture",
        estimatedValue: 80000,
        confidence: 85,
        imageUrl: "data:image/png;base64,def456",
        notes: "エルゴノミクスチェア",
      });
      await storage.createAsset({
        name: "iPhone",
        category: "Electronics",
        estimatedValue: 120000,
        confidence: 95,
        imageUrl: "data:image/png;base64,ghi789",
      });
    });

    it("名前で検索できる", async () => {
      const results = await storage.searchAssets("MacBook");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("MacBook Pro");
    });

    it("カテゴリで検索できる", async () => {
      const results = await storage.searchAssets("Electronics");
      expect(results).toHaveLength(2);
    });

    it("ノートで検索できる", async () => {
      const results = await storage.searchAssets("エルゴノミクス");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("オフィスチェア");
    });

    it("大文字小文字を区別しない", async () => {
      const results = await storage.searchAssets("macbook");
      expect(results).toHaveLength(1);
    });

    it("該当なしの場合は空配列を返す", async () => {
      const results = await storage.searchAssets("存在しない");
      expect(results).toHaveLength(0);
    });
  });

  describe("カテゴリ別フィルタ", () => {
    beforeEach(async () => {
      await storage.createAsset({
        name: "MacBook Pro",
        category: "Electronics",
        estimatedValue: 280000,
        confidence: 92,
        imageUrl: "data:image/png;base64,abc123",
      });
      await storage.createAsset({
        name: "オフィスチェア",
        category: "Furniture",
        estimatedValue: 80000,
        confidence: 85,
        imageUrl: "data:image/png;base64,def456",
      });
      await storage.createAsset({
        name: "iPhone",
        category: "Electronics",
        estimatedValue: 120000,
        confidence: 95,
        imageUrl: "data:image/png;base64,ghi789",
      });
    });

    it("特定カテゴリのアセットを取得できる", async () => {
      const results = await storage.getAssetsByCategory("Electronics");
      expect(results).toHaveLength(2);
      results.forEach((asset) => {
        expect(asset.category).toBe("Electronics");
      });
    });

    it("allを指定すると全アセットを返す", async () => {
      const results = await storage.getAssetsByCategory("all");
      expect(results).toHaveLength(3);
    });

    it("該当なしのカテゴリは空配列を返す", async () => {
      const results = await storage.getAssetsByCategory("NonExistent");
      expect(results).toHaveLength(0);
    });
  });
});
