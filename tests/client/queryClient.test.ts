import { describe, it, expect, vi, beforeEach } from "vitest";

// fetch をモックしてテスト
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// apiRequest を動的にインポート
const { apiRequest, getQueryFn } = await import(
  "../../client/src/lib/queryClient"
);

describe("apiRequest", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("GETリクエストを送信できる", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve(""),
    });

    await apiRequest("GET", "/api/assets");
    expect(mockFetch).toHaveBeenCalledWith("/api/assets", {
      method: "GET",
      headers: {},
      body: undefined,
      credentials: "include",
    });
  });

  it("POSTリクエストにJSONボディを含める", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      text: () => Promise.resolve(""),
    });

    const data = { name: "テスト", category: "Electronics" };
    await apiRequest("POST", "/api/assets", data);

    expect(mockFetch).toHaveBeenCalledWith("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
  });

  it("FormDataの場合はContent-Typeヘッダーを設定しない", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve(""),
    });

    const formData = new FormData();
    formData.append("file", "test");
    await apiRequest("POST", "/api/assets/analyze", formData);

    expect(mockFetch).toHaveBeenCalledWith("/api/assets/analyze", {
      method: "POST",
      headers: {},
      body: formData,
      credentials: "include",
    });
  });

  it("レスポンスがエラーの場合は例外を投げる", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: () => Promise.resolve("Asset not found"),
    });

    await expect(apiRequest("GET", "/api/assets/999")).rejects.toThrow(
      "404: Asset not found"
    );
  });

  it("DELETEリクエストを送信できる", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      text: () => Promise.resolve(""),
    });

    await apiRequest("DELETE", "/api/assets/1");
    expect(mockFetch).toHaveBeenCalledWith("/api/assets/1", {
      method: "DELETE",
      headers: {},
      body: undefined,
      credentials: "include",
    });
  });

  it("PUTリクエストにJSONボディを含める", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve(""),
    });

    const data = { name: "更新名" };
    await apiRequest("PUT", "/api/assets/1", data);

    expect(mockFetch).toHaveBeenCalledWith("/api/assets/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
  });
});

describe("getQueryFn", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("正常なレスポンスのJSONを返す", async () => {
    const mockData = [{ id: 1, name: "テスト" }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
      text: () => Promise.resolve(JSON.stringify(mockData)),
    });

    const queryFn = getQueryFn({ on401: "throw" });
    const result = await queryFn({
      queryKey: ["/api/assets"],
      signal: new AbortController().signal,
      meta: undefined,
    });
    expect(result).toEqual(mockData);
  });

  it("on401=throwの場合、401レスポンスで例外を投げる", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: () => Promise.resolve("Unauthorized"),
    });

    const queryFn = getQueryFn({ on401: "throw" });
    await expect(
      queryFn({
        queryKey: ["/api/protected"],
        signal: new AbortController().signal,
        meta: undefined,
      })
    ).rejects.toThrow("401");
  });

  it("on401=returnNullの場合、401レスポンスでnullを返す", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: () => Promise.resolve("Unauthorized"),
    });

    const queryFn = getQueryFn({ on401: "returnNull" });
    const result = await queryFn({
      queryKey: ["/api/protected"],
      signal: new AbortController().signal,
      meta: undefined,
    });
    expect(result).toBeNull();
  });

  it("500エラーの場合は例外を投げる", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: () => Promise.resolve("Server error"),
    });

    const queryFn = getQueryFn({ on401: "throw" });
    await expect(
      queryFn({
        queryKey: ["/api/assets"],
        signal: new AbortController().signal,
        meta: undefined,
      })
    ).rejects.toThrow("500");
  });
});
