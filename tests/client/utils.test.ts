import { describe, it, expect } from "vitest";
import { cn } from "../../client/src/lib/utils";

describe("cn (classNames ユーティリティ)", () => {
  it("単一のクラス名を返す", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("複数のクラス名を結合する", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toContain("text-red-500");
    expect(result).toContain("bg-blue-500");
  });

  it("falsy値を無視する", () => {
    const result = cn("text-red-500", false, null, undefined, "bg-blue-500");
    expect(result).toContain("text-red-500");
    expect(result).toContain("bg-blue-500");
    expect(result).not.toContain("false");
    expect(result).not.toContain("null");
    expect(result).not.toContain("undefined");
  });

  it("条件付きクラス名をサポートする", () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn(
      "base-class",
      isActive && "active",
      isDisabled && "disabled"
    );
    expect(result).toContain("base-class");
    expect(result).toContain("active");
    expect(result).not.toContain("disabled");
  });

  it("Tailwindの競合するクラスをマージする", () => {
    // tailwind-merge は後のクラスを優先する
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });

  it("Tailwindの異なるプロパティのクラスは両方保持する", () => {
    const result = cn("px-2", "py-4");
    expect(result).toContain("px-2");
    expect(result).toContain("py-4");
  });

  it("オブジェクト形式のクラス名をサポートする", () => {
    const result = cn({ "text-red-500": true, "bg-blue-500": false });
    expect(result).toContain("text-red-500");
    expect(result).not.toContain("bg-blue-500");
  });

  it("配列形式のクラス名をサポートする", () => {
    const result = cn(["text-red-500", "bg-blue-500"]);
    expect(result).toContain("text-red-500");
    expect(result).toContain("bg-blue-500");
  });

  it("空の入力に対して空文字列を返す", () => {
    expect(cn()).toBe("");
  });

  it("Tailwindの色の競合をマージする", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("複雑なTailwindクラスの組み合わせをマージする", () => {
    const result = cn(
      "flex items-center gap-2",
      "hover:bg-gray-100",
      "p-2 rounded-md"
    );
    expect(result).toContain("flex");
    expect(result).toContain("items-center");
    expect(result).toContain("gap-2");
    expect(result).toContain("hover:bg-gray-100");
    expect(result).toContain("p-2");
    expect(result).toContain("rounded-md");
  });
});
