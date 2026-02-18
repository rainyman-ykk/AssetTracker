import { describe, it, expect } from "vitest";
import { analyzeImage, type AnalysisResult } from "../../client/src/lib/asset-analyzer";

describe("analyzeImage", () => {
  it("ファイル名から分析結果を返す", () => {
    const result = analyzeImage("macbook-photo.jpg");
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("category");
    expect(result).toHaveProperty("estimatedValue");
    expect(result).toHaveProperty("confidence");
  });

  describe("キーワードマッチング", () => {
    it("macbookを含むファイル名からMacBook Proを特定する", () => {
      const result = analyzeImage("my-macbook-photo.jpg");
      expect(result.name).toBe("MacBook Pro");
      expect(result.category).toBe("Electronics");
    });

    it("laptopを含むファイル名からMacBook Proを特定する", () => {
      const result = analyzeImage("laptop-image.png");
      expect(result.name).toBe("MacBook Pro");
    });

    it("iphoneを含むファイル名からiPhoneを特定する", () => {
      const result = analyzeImage("iphone-15-pro.jpg");
      expect(result.name).toBe("iPhone");
      expect(result.category).toBe("Electronics");
    });

    it("cameraを含むファイル名からデジタルカメラを特定する", () => {
      const result = analyzeImage("camera-shot.jpg");
      expect(result.name).toBe("デジタルカメラ");
      expect(result.category).toBe("Electronics");
    });

    it("watchを含むファイル名から腕時計を特定する", () => {
      const result = analyzeImage("my-watch.jpg");
      expect(result.name).toBe("腕時計");
      expect(result.category).toBe("Jewelry");
    });

    it("chairを含むファイル名からオフィスチェアを特定する", () => {
      const result = analyzeImage("office-chair.jpg");
      expect(result.name).toBe("オフィスチェア");
      expect(result.category).toBe("Furniture");
    });

    it("bagを含むファイル名からハンドバッグを特定する", () => {
      const result = analyzeImage("bag-collection.jpg");
      expect(result.name).toBe("ハンドバッグ");
      expect(result.category).toBe("Fashion");
    });

    it("bikeを含むファイル名から自転車を特定する", () => {
      const result = analyzeImage("my-bike.jpg");
      expect(result.name).toBe("自転車");
      expect(result.category).toBe("Sports");
    });

    it("consoleを含むファイル名からゲーム機を特定する", () => {
      const result = analyzeImage("gaming-console.jpg");
      expect(result.name).toBe("ゲーム機");
      expect(result.category).toBe("Electronics");
    });
  });

  describe("大文字小文字の処理", () => {
    it("大文字のファイル名でもマッチする", () => {
      const result = analyzeImage("MACBOOK-PHOTO.JPG");
      expect(result.name).toBe("MacBook Pro");
    });

    it("混在ケースのファイル名でもマッチする", () => {
      const result = analyzeImage("My-IPhone-Photo.PNG");
      expect(result.name).toBe("iPhone");
    });
  });

  describe("分析結果の範囲", () => {
    it("推定価格が正の数である", () => {
      const result = analyzeImage("random-item.jpg");
      expect(result.estimatedValue).toBeGreaterThan(0);
    });

    it("信頼度が75以上である", () => {
      // マッチしない場合のフォールバックでも75以上
      const result = analyzeImage("unknown-item-xyz.jpg");
      expect(result.confidence).toBeGreaterThanOrEqual(75);
    });

    it("マッチした場合の信頼度が80以上である", () => {
      const result = analyzeImage("macbook.jpg");
      expect(result.confidence).toBeGreaterThanOrEqual(80);
    });
  });

  describe("フォールバック動作", () => {
    it("キーワードにマッチしない場合でも結果を返す", () => {
      const result = analyzeImage("completely-unknown-item-xyz123.jpg");
      expect(result).toBeDefined();
      expect(result.name.length).toBeGreaterThan(0);
      expect(result.category.length).toBeGreaterThan(0);
    });

    it("空のファイル名でも結果を返す", () => {
      const result = analyzeImage("");
      expect(result).toBeDefined();
      expect(result.estimatedValue).toBeGreaterThan(0);
    });
  });
});
