// Mock AI analysis function with consistent results
export function mockAnalyzeImage(imageData: string) {
  const mockItems = [
    { name: "MacBook Pro", category: "Electronics", value: 280000, confidence: 92 },
    { name: "iPhone", category: "Electronics", value: 120000, confidence: 95 },
    { name: "デジタルカメラ", category: "Electronics", value: 45000, confidence: 88 },
    { name: "腕時計", category: "Jewelry", value: 150000, confidence: 90 },
    { name: "オフィスチェア", category: "Furniture", value: 80000, confidence: 85 },
    { name: "ハンドバッグ", category: "Fashion", value: 35000, confidence: 87 },
    { name: "自転車", category: "Sports", value: 65000, confidence: 89 },
    { name: "ゲーム機", category: "Electronics", value: 55000, confidence: 93 },
    { name: "テーブル", category: "Furniture", value: 45000, confidence: 87 },
    { name: "ノートパソコン", category: "Electronics", value: 180000, confidence: 91 },
    { name: "スマートフォン", category: "Electronics", value: 95000, confidence: 94 },
    { name: "ヘッドフォン", category: "Electronics", value: 25000, confidence: 89 },
    { name: "バッグ", category: "Fashion", value: 28000, confidence: 86 },
    { name: "靴", category: "Fashion", value: 18000, confidence: 88 },
    { name: "本", category: "Other", value: 1500, confidence: 85 }
  ];

  // Create a simple hash from image data for consistent results
  let hash = 0;
  for (let i = 0; i < imageData.length; i++) {
    const char = imageData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute hash value to select item consistently
  const index = Math.abs(hash) % mockItems.length;
  const selectedItem = mockItems[index];

  // Add small consistent variance based on hash
  const variance = (Math.abs(hash) % 20000) - 10000;
  const confidenceVariance = (Math.abs(hash) % 10) - 5;

  return {
    name: selectedItem.name,
    category: selectedItem.category,
    estimatedValue: Math.max(1000, selectedItem.value + variance), // Ensure minimum value
    confidence: Math.max(70, Math.min(100, selectedItem.confidence + confidenceVariance)) // Keep within 70-100 range
  };
}
