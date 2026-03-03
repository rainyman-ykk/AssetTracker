import { describe, it, expect, beforeEach } from "vitest";
import type { User, InsertUser, LlmUsage } from "@shared/schema";
import { checkLlmLimit } from "../../server/llm-limit";

// InMemoryStorageの簡易版（LLM制限チェックに必要な部分のみ）
class InMemoryStorage {
  private users: User[] = [];
  private llmUsageRecords: LlmUsage[] = [];
  private nextUserId = 1;
  private nextLlmUsageId = 1;

  async createUser(user: InsertUser & { role?: string }): Promise<User> {
    const newUser: User = {
      id: this.nextUserId++,
      username: user.username,
      password: user.password,
      role: user.role ?? "user",
    };
    this.users.push(newUser);
    return newUser;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find((u) => u.id === id);
  }

  async getLlmCallCount(userId: number): Promise<number | undefined> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return undefined;
    const record = this.llmUsageRecords.find((r) => r.userId === userId);
    return record ? record.callCount : 0;
  }

  async incrementLlmCallCount(userId: number): Promise<void> {
    const record = this.llmUsageRecords.find((r) => r.userId === userId);
    if (record) {
      record.callCount += 1;
    } else {
      this.llmUsageRecords.push({
        id: this.nextLlmUsageId++,
        userId,
        callCount: 1,
      });
    }
  }
}

describe("checkLlmLimit", () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  it("一般ユーザーは呼び出し回数が0のとき許可される", async () => {
    const user = await storage.createUser({
      username: "normaluser",
      password: "pass",
    });
    const result = await checkLlmLimit(storage, user.id);
    expect(result.allowed).toBe(true);
  });

  it("一般ユーザーは呼び出し回数が4のとき許可される", async () => {
    const user = await storage.createUser({
      username: "normaluser",
      password: "pass",
    });
    for (let i = 0; i < 4; i++) {
      await storage.incrementLlmCallCount(user.id);
    }
    const result = await checkLlmLimit(storage, user.id);
    expect(result.allowed).toBe(true);
  });

  it("一般ユーザーは呼び出し回数が5のとき拒否される", async () => {
    const user = await storage.createUser({
      username: "normaluser",
      password: "pass",
    });
    for (let i = 0; i < 5; i++) {
      await storage.incrementLlmCallCount(user.id);
    }
    const result = await checkLlmLimit(storage, user.id);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it("一般ユーザーは呼び出し回数が5を超えても拒否される", async () => {
    const user = await storage.createUser({
      username: "normaluser",
      password: "pass",
    });
    for (let i = 0; i < 10; i++) {
      await storage.incrementLlmCallCount(user.id);
    }
    const result = await checkLlmLimit(storage, user.id);
    expect(result.allowed).toBe(false);
  });

  it("管理者ユーザーは呼び出し回数が0のとき許可される", async () => {
    const user = await storage.createUser({
      username: "admin",
      password: "pass",
      role: "admin",
    });
    const result = await checkLlmLimit(storage, user.id);
    expect(result.allowed).toBe(true);
  });

  it("管理者ユーザーは呼び出し回数が100でも許可される", async () => {
    const user = await storage.createUser({
      username: "admin",
      password: "pass",
      role: "admin",
    });
    for (let i = 0; i < 100; i++) {
      await storage.incrementLlmCallCount(user.id);
    }
    const result = await checkLlmLimit(storage, user.id);
    expect(result.allowed).toBe(true);
  });

  it("存在しないユーザーIDは拒否される", async () => {
    const result = await checkLlmLimit(storage, 999);
    expect(result.allowed).toBe(false);
  });
});
