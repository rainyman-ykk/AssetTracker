const LLM_CALL_LIMIT = 5;

interface LlmLimitStorage {
  getUser(id: number): Promise<{ role: string } | undefined>;
  getLlmCallCount(userId: number): Promise<number | undefined>;
}

type LlmLimitResult =
  | { allowed: true }
  | { allowed: false; reason: string };

export async function checkLlmLimit(
  storage: LlmLimitStorage,
  userId: number,
): Promise<LlmLimitResult> {
  const user = await storage.getUser(userId);
  if (!user) {
    return { allowed: false, reason: "ユーザーが見つかりません" };
  }

  if (user.role === "admin") {
    return { allowed: true };
  }

  const count = await storage.getLlmCallCount(userId);
  if (count === undefined) {
    return { allowed: false, reason: "ユーザーが見つかりません" };
  }

  if (count >= LLM_CALL_LIMIT) {
    return { allowed: false, reason: `LLM呼び出し回数の上限（${LLM_CALL_LIMIT}回）に達しました` };
  }

  return { allowed: true };
}
